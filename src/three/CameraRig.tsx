import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { CameraControls, CameraControlsImpl } from "@react-three/drei";
import { hudInset } from "@/state/hudInset";
import type { Selection } from "@/data/types";
import { blockById, craneById, truckById, vesselById } from "@/data/port";
import { containerById, shipmentById } from "@/data/containers";
import { facilityById } from "@/data/facilities";
import { GATE_X, SHIP_Z, berthX } from "@/data/layout";
import { hipgBerthPose, hipgCranePose } from "@/data/hipgLayout";
import { sceneRegistry } from "@/sim/simStore";
import type { CameraView } from "@/state/PortProvider";
import { selKey, usePort } from "@/state/PortProvider";
import { useBootRevealed } from "@/state/boot";
import { applyView, viewFromLocation } from "@/lib/viewLink";
import type { SharedView } from "@/lib/viewLink";

type V3 = [number, number, number];

interface Shot {
  target: V3;
  offset: V3;
  follow?: string;
}

const VIEWS: Record<CameraView, Shot> = {
  overview: { target: [0, 0, -40], offset: [170, 230, 230] },
  vessels: { target: [155, 0, 130], offset: [90, 130, 140] },
  yard: { target: [0, 0, 70], offset: [70, 140, 140] },
  gate: { target: [-130, 0, 222], offset: [45, 60, 75] },
  logistics: { target: [-170, 0, -50], offset: [110, 180, 190] },
};

/** Imperative camera API used by the HUD camera rail. */
export const cameraApi: { current: CameraControls | null } = { current: null };

/** Current portrait/landscape pull-back factor, so shared views store a screen-independent range. */
export const cameraFit: { current: number } = { current: 1 };

/** Page effects (selection, view) settle right after the HUD mounts; a shared view holds through that. */
const SHARED_HOLD_MS = 1500;

const tmp = new THREE.Vector3();
const tmpTarget = new THREE.Vector3();

/**
 * Portrait screens see far less of the port horizontally at the same FOV, so shots pull back.
 * Bucketed so small viewport changes (mobile toolbars collapsing) never re-fly the camera.
 */
const fitFor = (aspect: number): number => (aspect >= 1.25 ? 1 : aspect >= 0.85 ? 1.3 : 1.75);

function shotFor(sel: Selection): Shot | null {
  switch (sel.kind) {
    case "vessel": {
      const v = vesselById(sel.id);
      if (!v) return null;
      const pose = hipgBerthPose(v.berth);
      if (v.inScene) return { target: [pose.x, 3, pose.z], offset: [40, 50, 78], follow: `vessel:${v.id}` };
      return { target: [pose.x, 0, pose.z - 4], offset: [34, 44, 64] };
    }
    case "crane": {
      const c = craneById(sel.id);
      if (!c) return null;
      const pose = hipgCranePose(c.id, c.berth, 0);
      return { target: [pose.x, 10, pose.z], offset: [36, 32, 60] };
    }
    case "block": {
      const b = blockById(sel.id);
      return b ? { target: [b.x, 2, b.z], offset: [28, 48, 56] } : null;
    }
    case "container": {
      const c = containerById(sel.id);
      return c ? { target: [c.x, c.y, c.z], offset: [22, 30, 40] } : null;
    }
    case "truck": {
      const t = truckById(sel.id);
      return t ? { target: [-130, 1, 222], offset: [20, 26, 38], follow: `truck:${t.id}` } : null;
    }
    case "facility": {
      const f = facilityById(sel.id);
      if (!f) return null;
      const s = Math.max(0.8, Math.min(2.2, Math.max(f.w, f.d) / 60));
      return { target: [f.x, 2, f.z], offset: [44 * s, 58 * s, 84 * s] };
    }
    case "shipment": {
      const s = shipmentById(sel.id);
      if (!s) return null;
      if (s.truckId) return { target: [-130, 1, 222], offset: [44, 58, 80], follow: `truck:${s.truckId}` };
      const c = containerById(s.containerIds[0]);
      if (s.current <= 1 && s.direction === "import") return shotFor({ kind: "vessel", id: s.vesselId });
      return c ? { target: [c.x, c.y, c.z], offset: [18, 26, 34] } : null;
    }
  }
  return null;
}

/** Flies the camera to the current selection (or the page's default view) and follows moving objects. */
export function CameraRig() {
  const ref = useRef<CameraControls>(null);
  const { selection, view, homeNonce } = usePort();
  const followKey = useRef<string | undefined>(undefined);
  const key = selKey(selection);
  const isRevealed = useBootRevealed();
  const fit = useThree((s) => fitFor(s.size.width / Math.max(1, s.size.height)));
  const viewOff = useRef<{ x: number; y: number; w: number; h: number }>({ x: 0, y: 0, w: 0, h: 0 });
  const fitRef = useRef<number>(fit);
  // A `?cam=` link opens on that exact view instead of the page's default shot.
  const pendingShared = useRef<SharedView | null>(viewFromLocation());
  const sharedUntil = useRef<number>(0);
  cameraFit.current = fit;

  const { gl, camera: threeCamera, raycaster, scene } = useThree();

  useEffect(() => {
    cameraApi.current = ref.current;
    const c = ref.current;
    if (c) {
      // Map-style touch: one finger pans along the ground, two fingers pinch-zoom and rotate/tilt, three truck.
      c.touches.one = CameraControlsImpl.ACTION.TOUCH_TRUCK;
      c.touches.two = CameraControlsImpl.ACTION.TOUCH_DOLLY_ROTATE;
      c.touches.three = CameraControlsImpl.ACTION.TOUCH_TRUCK;

      // Mouse navigation:
      // Left Drag = Pan / Truck across the terminal (natural map navigation)
      // Right Drag / Middle Drag = Orbit / Rotate smoothly around the focused point
      // Shift + Left Drag = Orbit / Rotate
      // Wheel = Dolly smoothly towards cursor position
      c.mouseButtons.left = CameraControlsImpl.ACTION.TRUCK;
      c.mouseButtons.right = CameraControlsImpl.ACTION.ROTATE;
      c.mouseButtons.middle = CameraControlsImpl.ACTION.ROTATE;
      c.mouseButtons.wheel = CameraControlsImpl.ACTION.DOLLY;
      c.truckSpeed = 1.8;
      // Disable dollyToCursor to ensure zooming out always pulls back along the line of sight
      // rather than shifting the camera target into the horizon and collapsing altitude.
      c.dollyToCursor = false;

      // Strict boundaries to prevent the camera from ever dropping to ground level
      c.minPolarAngle = THREE.MathUtils.degToRad(18);
      c.maxPolarAngle = THREE.MathUtils.degToRad(62);
      c.minDistance = 20;
      c.maxDistance = 500;

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Shift" && ref.current) ref.current.mouseButtons.left = CameraControlsImpl.ACTION.ROTATE;
      };
      const onKeyUp = (e: KeyboardEvent) => {
        if (e.key === "Shift" && ref.current) ref.current.mouseButtons.left = CameraControlsImpl.ACTION.TRUCK;
      };
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);

      const onControl = () => {
        followKey.current = undefined;
      };
      c.addEventListener("controlstart", onControl);

      const v = VIEWS.overview;
      c.setLookAt(v.target[0] + v.offset[0], v.offset[1], v.target[2] + v.offset[2], v.target[0], v.target[1], v.target[2], false);

      return () => {
        c.removeEventListener("controlstart", onControl);
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
        cameraApi.current = null;
      };
    }
  }, []);

  // Double-click on terminal / quays to smoothly focus and zoom in to that location
  useEffect(() => {
    const dom = gl.domElement;

    const onDblClick = (e: MouseEvent) => {
      const rect = dom.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );

      raycaster.setFromCamera(mouse, threeCamera);
      const hits = raycaster.intersectObjects(scene.children, true);
      const hit = hits.find(
        (h) =>
          h.object.type === "Mesh" &&
          h.point.y >= -1 &&
          h.distance > 0 &&
          Math.abs(h.point.x) < 320 &&
          Math.abs(h.point.z) < 320,
      );

      if (hit && ref.current) {
        const c = ref.current;
        void c.moveTo(hit.point.x, 0, hit.point.z, true);
        void c.dollyTo(Math.max(40, c.distance * 0.7), true);
      }
    };

    dom.addEventListener("dblclick", onDblClick);
    return () => {
      dom.removeEventListener("dblclick", onDblClick);
    };
  }, [gl, threeCamera, raycaster, scene]);

  useEffect(() => {
    const c = ref.current;
    // Hold the wide establishing shot under the boot screen; the fly-in plays as it lifts.
    if (!c || !isRevealed) return;
    const shared = pendingShared.current;
    if (shared) {
      pendingShared.current = null;
      sharedUntil.current = performance.now() + SHARED_HOLD_MS;
      followKey.current = undefined;
      applyView(c, shared, true, fitRef.current);
      return;
    }
    if (performance.now() < sharedUntil.current) return;
    const shot = (selection ? shotFor(selection) : null) ?? VIEWS[view];
    followKey.current = shot.follow;
    let target: V3 = shot.target;
    if (shot.follow) {
      const obj = sceneRegistry.get(shot.follow);
      if (obj) {
        obj.getWorldPosition(tmp);
        target = [tmp.x, shot.target[1], tmp.z];
      }
    }
    const [tx, ty, tz] = target;
    // Close-ups pull back less than page-wide establishing shots.
    const f = fitRef.current;
    const k = selection ? 1 + (f - 1) * 0.6 : f;
    const [ox, oy, oz] = shot.offset.map((o) => o * k);
    void c.setLookAt(tx + ox, ty + oy, tz + oz, tx, ty, tz, true);
  }, [key, view, homeNonce, selection, isRevealed]);

  // Rotation (portrait <-> landscape): keep the user's current framing and only ease the zoom so the same
  // part of the port stays in view, instead of re-flying the page shot and throwing away their pan/rotate.
  useEffect(() => {
    const prev = fitRef.current;
    fitRef.current = fit;
    const c = ref.current;
    if (!c || prev === fit || !isRevealed) return;
    const ratio = selection ? (1 + (fit - 1) * 0.6) / (1 + (prev - 1) * 0.6) : fit / prev;
    void c.dollyTo(THREE.MathUtils.clamp(c.distance * ratio, 20, 500), true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only a fit change should trigger this.
  }, [fit]);

  useFrame((state, dt) => {
    // Shift the projection so the camera target sits in the middle of the map area the HUD leaves visible.
    const cam = state.camera as THREE.PerspectiveCamera;
    const { left, bottom } = hudInset.get();
    const o = viewOff.current;
    const w = state.size.width;
    const h = state.size.height;
    const goalX = -left / 2;
    const goalY = bottom / 2;
    const ease = Math.min(1, dt * 6);
    const nx = Math.abs(goalX - o.x) < 0.5 ? goalX : o.x + (goalX - o.x) * ease;
    const ny = Math.abs(goalY - o.y) < 0.5 ? goalY : o.y + (goalY - o.y) * ease;
    if (nx !== o.x || ny !== o.y || w !== o.w || h !== o.h) {
      o.x = nx;
      o.y = ny;
      o.w = w;
      o.h = h;
      if (nx === 0 && ny === 0) cam.clearViewOffset();
      else cam.setViewOffset(w, h, nx, ny, w, h);
    }

    const c = ref.current;
    if (c) {
      // 1. Maintain camera altitude above ground:
      // Minimum altitude scales with distance so zooming out always maintains an elevated viewpoint
      // and never drops into the ground, water, or grazing angles.
      const minAltitude = Math.max(16, c.distance * 0.28);
      if (cam.position.y < minAltitude) {
        cam.position.y = minAltitude;
      }

      // 2. Strict polar angle clamping:
      // Instantly clamp polar angle without starting competing animations (passing false)
      const maxPolar = THREE.MathUtils.degToRad(62);
      const minPolar = THREE.MathUtils.degToRad(18);
      if (c.polarAngle > maxPolar) {
        void c.rotatePolarTo(maxPolar, false);
      } else if (c.polarAngle < minPolar) {
        void c.rotatePolarTo(minPolar, false);
      }

      // 3. Keep target near ground level (Y = 0) and within terminal operational boundaries
      c.getTarget(tmpTarget);
      let targetNeedsUpdate = false;
      let newTy = tmpTarget.y;
      let newTx = tmpTarget.x;
      let newTz = tmpTarget.z;

      if (tmpTarget.y < -1 || tmpTarget.y > 15) {
        newTy = THREE.MathUtils.clamp(tmpTarget.y, 0, 8);
        targetNeedsUpdate = true;
      }
      if (Math.abs(tmpTarget.x) > 360) {
        newTx = THREE.MathUtils.clamp(tmpTarget.x, -320, 320);
        targetNeedsUpdate = true;
      }
      if (Math.abs(tmpTarget.z) > 360) {
        newTz = THREE.MathUtils.clamp(tmpTarget.z, -320, 320);
        targetNeedsUpdate = true;
      }

      if (targetNeedsUpdate) {
        void c.setTarget(newTx, newTy, newTz, false);
      }
    }

    const k = followKey.current;
    if (!c || !k) return;
    const obj = sceneRegistry.get(k);
    if (!obj || !obj.visible) return;
    obj.getWorldPosition(tmp);
    const cur = c.getTarget(tmpTarget);
    if (cur.distanceToSquared(tmp.setY(cur.y)) > 0.04) void c.moveTo(tmp.x, cur.y, tmp.z, true);
  });

  return (
    <CameraControls
      ref={ref}
      makeDefault
      smoothTime={0.25}
      draggingSmoothTime={0.08}
      minDistance={20}
      maxDistance={500}
      minPolarAngle={THREE.MathUtils.degToRad(18)}
      maxPolarAngle={THREE.MathUtils.degToRad(62)}
      dollyToCursor={false}
      truckSpeed={1.8}
    />
  );
}
