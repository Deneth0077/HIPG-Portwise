import { memo, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import {
  BERTH_SPACING,
  BLOCK_HALF_X,
  BLOCK_HALF_Z,
  COLORS,
  COL_ROADS_X,
  CONTAINER_COLORS,
  GATE_X,
  LAND_RAIL_Z,
  QUAY_MAX_X,
  QUAY_MIN_X,
  QUAY_Z,
  ROAD_END_X,
  ROW_ROADS_Z,
  SEA_RAIL_Z,
  berthX,
} from "@/data/layout";
import { BERTH_COUNT, PORT_NAME, YARD_BLOCKS } from "@/data/port";
import { mat, unitBox, unitCyl } from "./parts";
import { mulberry32 } from "@/data/containers";
import { Glow, LIGHT, LightCone, Pool, litMat } from "./nightLights";
import { HipgQuays } from "./HipgQuays";
import { InteractiveBuildings } from "./InteractiveBuildings";

export const FONT_URL = "/fonts/BeVietnamPro-Bold.ttf";

export function Flat({
  x,
  z,
  w,
  d,
  color,
  y = 0.02,
  polygonOffset = false,
  offsetFactor = 0,
}: {
  x: number;
  z: number;
  w: number;
  d: number;
  color: string;
  y?: number;
  polygonOffset?: boolean;
  offsetFactor?: number;
}) {
  const material = useMemo(() => {
    const m = mat(color, { rough: 1 });
    if (polygonOffset) {
      m.polygonOffset = true;
      m.polygonOffsetFactor = offsetFactor;
      m.polygonOffsetUnits = offsetFactor;
    }
    return m;
  }, [color, polygonOffset, offsetFactor]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, y, z]} receiveShadow material={material}>
      <planeGeometry args={[w, d]} />
    </mesh>
  );
}

interface Seg {
  x: number;
  z: number;
  w: number;
  d: number;
}

const QUAY_W = QUAY_MAX_X - QUAY_MIN_X;
const QUAY_CX = (QUAY_MAX_X + QUAY_MIN_X) / 2;
const YARD_LEFT = COL_ROADS_X[0] - 2.1;
const SPINE_RIGHT = 181.5;
const PLAZA_X0 = SPINE_RIGHT;

const ROADS: Seg[] = [
  { x: QUAY_CX, z: 8, w: QUAY_W, d: 4.2 },
  { x: QUAY_CX, z: 15, w: QUAY_W, d: 4.2 },
  ...ROW_ROADS_Z.map((z) => ({ x: (YARD_LEFT + SPINE_RIGHT) / 2, z, w: SPINE_RIGHT - YARD_LEFT, d: 4.2 })),
  ...COL_ROADS_X.map((x) => ({ x, z: -21.5, w: 4.2, d: 59 })),
  { x: 176.5, z: -21, w: 10, d: 60 },
  { x: (PLAZA_X0 + ROAD_END_X) / 2, z: -11.5, w: ROAD_END_X - PLAZA_X0, d: 23 },
];

/** White dashed centre lines along the main lanes. */
function LaneDashes() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dashes = useMemo(() => {
    const out: Array<[number, number, number, number]> = [];
    for (let x = QUAY_MIN_X + 4; x < QUAY_MAX_X; x += 6) out.push([x, 11.5, 0, 0]);
    for (const z of ROW_ROADS_Z) for (let x = YARD_LEFT + 4; x < 172; x += 6) out.push([x, z, 0, 0]);
    for (let z = 4; z > -50; z -= 6) out.push([176.5, z, 1, 1]);
    for (let x = PLAZA_X0 + 4; x < ROAD_END_X; x += 6) {
      out.push([x, -5.5, 0, 0]);
      out.push([x, -11.5, 1, 0]);
      out.push([x, -17.5, 0, 0]);
    }
    return out;
  }, []);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const yellow = new THREE.Color(COLORS.amber);
    const white = new THREE.Color("#F8F5EE");
    dashes.forEach(([x, z, kind, vertical], i) => {
      o.position.set(x, 0.03, z);
      o.rotation.set(-Math.PI / 2, 0, vertical ? Math.PI / 2 : 0);
      o.scale.set(2.6, 0.22, 1);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, kind === 1 ? yellow : white);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [dashes]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, dashes.length]} receiveShadow>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial roughness={1} />
    </instancedMesh>
  );
}

import { useYardManagement } from "@/state/YardManagementProvider";

function BlockPads() {
  const { yards, selectedYardId, draftPosition, draftDimensions } = useYardManagement();

  const containerBlocks = useMemo(() => {
    return yards
      .filter(
        (y) =>
          y.status !== "inactive" &&
          (y.yardType === "container" ||
            y.yardType === "reefer" ||
            y.yardType === "dual_purpose" ||
            y.yardType === "customs" ||
            y.capacityUnit === "teu")
      )
      .map((y) => {
        const isDraft = y.id === selectedYardId && draftPosition;
        const isDimDraft = y.id === selectedYardId && draftDimensions;
        return {
          id: y.id,
          x: isDraft ? draftPosition.x : y.position.x,
          z: isDraft ? draftPosition.z : y.position.z,
          width: isDimDraft ? draftDimensions.width : y.width,
          depth: isDimDraft ? draftDimensions.length : y.length,
          category: y.yardType,
        };
      });
  }, [yards, selectedYardId, draftPosition, draftDimensions]);

  return (
    <group>
      {containerBlocks.map((b) => {
        const w = b.width ?? 50;
        const d = b.depth ?? 12;
        const isReefer = b.category === "reefer" || b.id === "CC0" || b.id === "C09";
        const isCustoms = b.category === "customs";
        const padColor = isReefer ? "#DCE4E8" : isCustoms ? "#D4C2B4" : COLORS.pad;
        return (
          <group key={b.id}>
            <Flat x={b.x} z={b.z} w={w} d={d} color={padColor} y={0.03} polygonOffset offsetFactor={-1} />
            {/* Yellow perimeter safety lines */}
            <Flat x={b.x} z={b.z + d / 2} w={w} d={0.25} color={COLORS.amber} y={0.06} polygonOffset offsetFactor={-2} />
            <Flat x={b.x} z={b.z - d / 2} w={w} d={0.25} color={COLORS.amber} y={0.06} polygonOffset offsetFactor={-2} />
            <Flat x={b.x - w / 2} z={b.z} w={0.25} d={d} color={COLORS.amber} y={0.06} polygonOffset offsetFactor={-2} />
            <Flat x={b.x + w / 2} z={b.z} w={0.25} d={d} color={COLORS.amber} y={0.06} polygonOffset offsetFactor={-2} />
            <Text
              font={FONT_URL}
              fontSize={d > 14 ? 1.8 : 1.3}
              color="#545B64"
              position={[b.x - w / 2 + 1.8, 0.08, b.z + d / 2 + 0.9]}
              rotation={[-Math.PI / 2, 0, 0]}
              anchorX="left"
              anchorY="middle"
            >
              {b.id}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

function Quay() {
  const fenders = useMemo(() => {
    const out: number[] = [];
    for (let x = QUAY_MIN_X + 3; x < QUAY_MAX_X; x += 6) out.push(x);
    return out;
  }, []);
  return (
    <group>
      <mesh geometry={unitBox} material={mat(COLORS.quayWall)} position={[0, -1.6, QUAY_Z - 0.3]} scale={[1800, 3.2, 0.6]} receiveShadow />
      <mesh geometry={unitBox} material={mat(COLORS.quay)} position={[QUAY_CX, -0.05, 14]} scale={[QUAY_W, 0.1, 12]} receiveShadow />
      <mesh geometry={unitBox} material={mat("#F3F0E8")} position={[QUAY_CX, 0.02, QUAY_Z - 0.35]} scale={[QUAY_W, 0.08, 0.5]} />
      {[LAND_RAIL_Z, SEA_RAIL_Z].map((z) => (
        <mesh key={z} geometry={unitBox} material={mat("#7D7466", { metal: 0.3, rough: 0.5 })} position={[QUAY_CX, 0.04, z]} scale={[QUAY_W, 0.06, 0.25]} />
      ))}
      {fenders.map((x) => (
        <mesh key={x} geometry={unitBox} material={mat("#2B2F36")} position={[x, -0.8, QUAY_Z + 0.05]} scale={[1.2, 1.4, 0.4]} />
      ))}
      {fenders
        .filter((_, i) => i % 2 === 0)
        .map((x) => (
          <mesh key={`b${x}`} geometry={unitCyl} material={mat(COLORS.ink)} position={[x + 3, 0.35, QUAY_Z - 0.9]} scale={[0.45, 0.7, 0.45]} castShadow />
        ))}
      {Array.from({ length: BERTH_COUNT }, (_, i) => i + 1).map((n) => (
        <group key={n}>
          <Text font={FONT_URL} fontSize={1.5} color="#8C836F" position={[berthX(n) - BERTH_SPACING / 2 + 3, 0.06, 18.9]} rotation={[-Math.PI / 2, 0, 0]} anchorX="left">
            {`BERTH ${n}`}
          </Text>
          {n > 1 ? (
            <mesh geometry={unitBox} material={mat(COLORS.amber)} position={[berthX(n) - BERTH_SPACING / 2, 0.05, 18.9]} scale={[0.25, 0.06, 1.6]} />
          ) : null}
        </group>
      ))}
    </group>
  );
}

function Gate01() {
  return (
    <group position={[-130, 0, 222]}>
      {/* Overhead Gate Canopy */}
      <mesh geometry={unitBox} material={mat("#2A313D")} position={[0, 5.5, 0]} scale={[16, 0.9, 8]} castShadow receiveShadow />
      <mesh geometry={unitBox} material={litMat(COLORS.signal, "#38BDF8", 0.9)} position={[0, 4.9, 0]} scale={[16.2, 0.25, 8.2]} />
      {/* Support Columns */}
      {[-7, 0, 7].map((dx) =>
        [-3, 3].map((dz) => (
          <mesh key={`${dx}${dz}`} geometry={unitBox} material={mat("#8C8578")} position={[dx, 2.5, dz]} scale={[0.5, 5, 0.5]} castShadow />
        ))
      )}
      {/* Canopy Lighting */}
      {[-5, 0, 5].map((dx) => (
        <Glow key={`g${dx}`} position={[dx, 4.7, 0]} color={LIGHT.white} size={2.5} />
      ))}
      <Pool position={[0, 0.08, 0]} radius={8} stretch={1.6} color={LIGHT.white} base={0.4} />
      {/* Security Check Booth */}
      <mesh geometry={unitBox} material={mat("#ECE7DC")} position={[0, 1.2, 0]} scale={[2.2, 2.4, 2.8]} castShadow />
      {/* Clearance indicators */}
      <Glow position={[-4, 2.8, 3.2]} color={LIGHT.green} size={0.9} />
      <Glow position={[4, 2.8, -3.2]} color={LIGHT.green} size={0.9} />
      {/* Gate Signage */}
      <Text font={FONT_URL} fontSize={1.2} color="#FFFFFF" position={[0, 5.5, 4.05]} rotation={[0, 0, 0]} anchorX="center" anchorY="middle">
        GATE 01 · HIPG
      </Text>
      <Text font={FONT_URL} fontSize={1.2} color="#FFFFFF" position={[0, 5.5, -4.05]} rotation={[0, Math.PI, 0]} anchorX="center" anchorY="middle">
        GATE 01 · HIPG
      </Text>
    </group>
  );
}

function Building({ x, z, w, d, h, roof = "#C9D2D6", wall = "#F4F1EA", band = COLORS.ink }: { x: number; z: number; w: number; d: number; h: number; roof?: string; wall?: string; band?: string }) {
  const floors = Math.max(1, Math.floor(h / 3.2));
  return (
    <group position={[x, 0, z]}>
      <mesh geometry={unitBox} material={mat(wall)} position={[0, h / 2, 0]} scale={[w, h, d]} castShadow receiveShadow />
      <mesh geometry={unitBox} material={mat(roof)} position={[0, h + 0.15, 0]} scale={[w + 0.3, 0.3, d + 0.3]} castShadow />
      {Array.from({ length: floors }, (_, i) => (
        <mesh key={i} geometry={unitBox} material={litMat(band, LIGHT.window, 0.9 + ((i * 7) % 3) * 0.35)} position={[0, 1.8 + i * 3.2, 0]} scale={[w + 0.04, 0.9, d + 0.04]} />
      ))}
      <Glow position={[0, h + 0.8, 0]} color={LIGHT.red} size={1.4} blink={2.2} phase={x * 0.01} />
    </group>
  );
}

function Warehouse({ x, z, w, d }: { x: number; z: number; w: number; d: number }) {
  const doors = Math.floor(w / 5);
  return (
    <group position={[x, 0, z]}>
      <mesh geometry={unitBox} material={mat("#ECE7DC")} position={[0, 3.2, 0]} scale={[w, 6.4, d]} castShadow receiveShadow />
      <mesh geometry={unitBox} material={mat("#B9C6CC")} position={[0, 6.9, -d / 4]} rotation={[0.28, 0, 0]} scale={[w + 0.4, 0.3, d / 2 + 0.6]} castShadow />
      <mesh geometry={unitBox} material={mat("#AFBDC4")} position={[0, 6.9, d / 4]} rotation={[-0.28, 0, 0]} scale={[w + 0.4, 0.3, d / 2 + 0.6]} castShadow />
      {Array.from({ length: doors }, (_, i) => (
        <mesh key={i} geometry={unitBox} material={i % 3 === 1 ? litMat(COLORS.ink, LIGHT.sodium, 0.9) : mat(COLORS.ink)} position={[-w / 2 + 2.5 + i * 5, 1.6, d / 2 + 0.02]} scale={[2.6, 3.2, 0.06]} />
      ))}
      {Array.from({ length: doors }, (_, i) => (
        <Glow key={`g${i}`} position={[-w / 2 + 2.5 + i * 5, 3.7, d / 2 + 0.5]} color={LIGHT.sodium} size={1.4} base={0.8} />
      ))}
    </group>
  );
}

/** Static stacks of empty containers in the depot beside the gate – adds scale, not clickable. */
function EmptyDepot() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const boxes = useMemo(() => {
    const r = mulberry32(404);
    const palette = [CONTAINER_COLORS.steel, CONTAINER_COLORS.navy, CONTAINER_COLORS.brick, CONTAINER_COLORS.sand, CONTAINER_COLORS.moss, CONTAINER_COLORS.orange];
    const out: Array<{ x: number; y: number; z: number; c: THREE.Color }> = [];
    for (let row = 0; row < 4; row++) {
      for (let bay = 0; bay < 18; bay++) {
        for (let lane = 0; lane < 3; lane++) {
          const h = 2 + Math.floor(r() * 4);
          const x = 196 + bay * 3.3;
          const z = -32 - row * 7 - lane * 1.45;
          for (let t = 0; t < h; t++) out.push({ x, y: 0.65 + t * 1.3, z, c: new THREE.Color(palette[Math.floor(r() * palette.length)]) });
        }
      }
    }
    return out;
  }, []);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    boxes.forEach((b, i) => {
      o.position.set(b.x, b.y, b.z);
      o.scale.set(3.0, 1.25, 1.3);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, b.c);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [boxes]);
  return (
    <group>
      <Flat x={225} z={-43} w={66} d={32} color={COLORS.pad} y={0.012} />
      <instancedMesh ref={ref} args={[undefined, undefined, boxes.length]} geometry={unitBox} castShadow receiveShadow raycast={() => null}>
        <meshStandardMaterial roughness={0.85} />
      </instancedMesh>
      <Text font={FONT_URL} fontSize={2.2} color="#9E9583" position={[194, 0.05, -26.5]} rotation={[-Math.PI / 2, 0, 0]} anchorX="left">
        EMPTY DEPOT
      </Text>
    </group>
  );
}

/** Authentic tropical landscaping strictly placed on dry terminal hillsides and buffer parks (zero trees in water). */
function Trees() {
  const crowns = useRef<THREE.InstancedMesh>(null);
  const trunks = useRef<THREE.InstancedMesh>(null);
  const spots = useMemo(() => {
    const r = mulberry32(109);
    const out: Array<[number, number, number]> = [];

    // Helper: checks if a point is strictly on land and not in water/basin/apron
    const isSafeLand = (x: number, z: number): boolean => {
      if (inBasin(x, z)) return false; // Never in internal basin water
      if (x > 152) return false; // Never in eastern open sea
      if (z < -170 && x > -140 && x < 155) return false; // Never in northern basin entrance
      if (z > -18 && z < 18 && x > -145 && x < 152) return false; // Never on basin quay apron
      return true;
    };

    // 1. Lush tropical hill ridge north of BY4 and Berths 09-11 (Authentic HIPG hill topography)
    for (let x = -130; x < 155; x += 5.5) {
      for (let z = -280; z < -215; z += 6.0) {
        if (r() > 0.28 && isSafeLand(x, z)) {
          out.push([x + (r() - 0.5) * 3, z + (r() - 0.5) * 3, 0.85 + r() * 0.55]);
        }
      }
    }

    // 2. Green landscaped park / tree grove surrounding the New Customs compound near Gate 01
    for (let x = -105; x < -10; x += 6.5) {
      for (let z = 120; z < 210; z += 7.0) {
        // Leave central access road clear
        if (Math.abs(x - (-8)) > 12 && r() > 0.35 && isSafeLand(x, z)) {
          out.push([x + (r() - 0.5) * 3, z + (r() - 0.5) * 3, 0.8 + r() * 0.5]);
        }
      }
    }

    // 3. Western perimeter green buffer along BY2 expressway
    for (let z = -240; z < 60; z += 5.5) {
      const x = -236 + (r() - 0.5) * 4;
      if (isSafeLand(x, z)) {
        out.push([x, z, 0.9 + r() * 0.4]);
      }
    }

    // 4. Far south-western hinterland
    for (let x = -220; x < -150; x += 8.0) {
      for (let z = 205; z < 265; z += 9.0) {
        if (r() > 0.32 && isSafeLand(x, z)) {
          out.push([x + (r() - 0.5) * 4, z + (r() - 0.5) * 4, 0.85 + r() * 0.5]);
        }
      }
    }

    return out;
  }, []);

  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    const a = new THREE.Color(COLORS.tree);
    const b = new THREE.Color(COLORS.treeDark);
    const r = mulberry32(17);
    spots.forEach(([x, z, s], i) => {
      o.position.set(x, 2.6 * s + 1.2, z);
      o.scale.setScalar(s * 2.2);
      o.updateMatrix();
      crowns.current?.setMatrixAt(i, o.matrix);
      crowns.current?.setColorAt(i, r() > 0.5 ? a : b);
      o.position.set(x, 1.1 * s, z);
      o.scale.set(0.35, 2.2 * s, 0.35);
      o.updateMatrix();
      trunks.current?.setMatrixAt(i, o.matrix);
    });
    if (crowns.current) {
      crowns.current.instanceMatrix.needsUpdate = true;
      if (crowns.current.instanceColor) crowns.current.instanceColor.needsUpdate = true;
    }
    if (trunks.current) trunks.current.instanceMatrix.needsUpdate = true;
  }, [spots]);

  return (
    <group>
      <instancedMesh ref={crowns} args={[undefined, undefined, spots.length]} castShadow raycast={() => null}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial roughness={0.9} flatShading />
      </instancedMesh>
      <instancedMesh ref={trunks} args={[undefined, undefined, spots.length]} castShadow geometry={unitCyl} material={mat("#8A6E52")} raycast={() => null} />
    </group>
  );
}

function Lamps() {
  /** High-mast floodlight towers positioned along key road intersections on land (zero in water). */
  const yardMasts = useMemo(() => {
    return [
      // Central yard main spine crossings
      [-80, 52],
      [-8, 52],
      [64, 52],
      [-80, 106],
      [-8, 106],
      [64, 106],
      // Eastern road & crane buffer
      [130, 40],
      [130, 100],
      [130, 160],
      [130, 220],
      // Southern Basin Apron road
      [-110, 16],
      [-50, 16],
      [10, 16],
      [70, 16],
      // Western finger feeder roads
      [-185, -63],
      [-185, -85],
      [-185, -180],
      // Gate 01 & Customs
      [-130, 150],
      [-100, 220],
    ] as Array<[number, number]>;
  }, []);

  return (
    <group>
      {yardMasts.map(([x, z], idx) => (
        <group key={`m${idx}`} position={[x, 0, z]}>
          <mesh geometry={unitCyl} material={mat("#8C8578")} position={[0, 9, 0]} scale={[0.3, 18, 0.3]} castShadow />
          <mesh geometry={unitBox} material={litMat("#F6F3EC", LIGHT.sodium, 2.2)} position={[0, 18.1, 0]} scale={[2.4, 0.5, 2.4]} />
          <Glow position={[0, 17.6, 0]} color={LIGHT.sodium} size={5.5} />
          <LightCone position={[0, 17.6, 0]} height={17.5} radius={7} color={LIGHT.sodium} base={0.05} />
          <Pool position={[0, 0.09, 0]} radius={15} color={LIGHT.sodium} base={0.36} />
        </group>
      ))}
    </group>
  );
}

/** Authentic HIPG internal yard road network conforming to the 2024.09 master plan. */
function YardRoads() {
  return (
    <group name="hipg-yard-roads">
      {/* 1. WESTERN FINGER ROADS & HIGHWAY */}
      {/* BY2 4-Lane Western Perimeter Highway */}
      <Flat x={-228} z={-40} w={9.0} d={380} color="#20242B" y={0.04} polygonOffset offsetFactor={-1} />
      {/* BY2 Highway painted median divider */}
      <Flat x={-228} z={-40} w={0.35} d={378} color="#E6C844" y={0.07} polygonOffset offsetFactor={-2} />

      {/* Feeder A-C: North-south artery connecting finger blocks to BY2 */}
      <Flat x={-220} z={-140} w={6.5} d={205} color="#232830" y={0.04} polygonOffset offsetFactor={-1} />

      {/* Feeder A-B: Between Customs A-blocks and Dual B-blocks */}
      <Flat x={-185} z={-63} w={68} d={6.0} color="#232830" y={0.04} polygonOffset offsetFactor={-1} />
      <Flat x={-185} z={-63} w={66} d={0.2} color="#FFFFFF" y={0.07} polygonOffset offsetFactor={-2} />

      {/* Feeder B-C: Between B-blocks and C-blocks */}
      <Flat x={-185} z={-85} w={68} d={6.0} color="#232830" y={0.04} polygonOffset offsetFactor={-1} />
      <Flat x={-185} z={-85} w={66} d={0.2} color="#FFFFFF" y={0.07} polygonOffset offsetFactor={-2} />

      {/* BY3 Northern finger terminal road */}
      <Flat x={-185} z={-242} w={72} d={6.5} color="#232830" y={0.04} polygonOffset offsetFactor={-1} />

      {/* 2. BASIN APRON & QUAY ROADS */}
      {/* Southern Basin Apron Road behind Berths 04-06 (clear of crane rails at z = -14.5 to -8.5) */}
      <Flat x={-8} z={16} w={275} d={7.5} color="#232830" y={0.04} polygonOffset offsetFactor={-1} />
      <Flat x={-8} z={16} w={272} d={0.22} color="#FFFFFF" y={0.07} polygonOffset offsetFactor={-2} />

      {/* Northern Basin Apron Road along Berths 09-11 */}
      <Flat x={0} z={-172} w={280} d={7.0} color="#232830" y={0.04} polygonOffset offsetFactor={-1} />
      <Flat x={0} z={-172} w={278} d={0.2} color="#FFFFFF" y={0.07} polygonOffset offsetFactor={-2} />

      {/* Eastern Quay Service Road (running north-south along Berths 02, 01 down to CY0) */}
      <Flat x={130} z={130} w={8.0} d={240} color="#232830" y={0.04} polygonOffset offsetFactor={-1} />
      <Flat x={130} z={130} w={0.22} d={238} color="#FFFFFF" y={0.07} polygonOffset offsetFactor={-2} />

      {/* Eastern Quay Southern Turn at CY0 (connecting Eastern Quay Road to East Spine) */}
      <Flat x={97} z={236} w={72} d={7.5} color="#232830" y={0.04} polygonOffset offsetFactor={-1} />
      <Flat x={97} z={236} w={70} d={0.22} color="#FFFFFF" y={0.07} polygonOffset offsetFactor={-2} />

      {/* 3. MAIN CENTRAL CIRCULATION CORRIDORS */}
      {/* MAIN ROAD: Central Arterial Boulevard between H-blocks and L-blocks */}
      <Flat x={-18} z={52} w={300} d={8.5} color="#232830" y={0.04} polygonOffset offsetFactor={-1} />
      <Flat x={-18} z={52} w={298} d={0.25} color="#E6C844" y={0.07} polygonOffset offsetFactor={-2} />
      {/* "MAIN ROAD" Painted Road Markings matching the master plan */}
      <Text font={FONT_URL} fontSize={1.9} color="#E6C844" position={[-8, 0.08, 52]} rotation={[-Math.PI / 2, 0, 0]} anchorX="center" anchorY="middle">
        MAIN ROAD
      </Text>
      <Text font={FONT_URL} fontSize={1.9} color="#E6C844" position={[-80, 0.08, 52]} rotation={[-Math.PI / 2, 0, 0]} anchorX="center" anchorY="middle">
        MAIN ROAD
      </Text>
      <Text font={FONT_URL} fontSize={1.9} color="#E6C844" position={[64, 0.08, 52]} rotation={[-Math.PI / 2, 0, 0]} anchorX="center" anchorY="middle">
        MAIN ROAD
      </Text>

      {/* Inter-Container Stack Handling Corridor (Between L-blocks and M-blocks) */}
      <Flat x={-18} z={80} w={300} d={6.5} color="#232830" y={0.04} polygonOffset offsetFactor={-1} />

      {/* Arterial Corridor 2: Between M-blocks and Southern RoRo Tier 3 (02C/02D, 01C-01G) */}
      <Flat x={-18} z={106} w={300} d={8.5} color="#232830" y={0.04} polygonOffset offsetFactor={-1} />
      <Flat x={-18} z={106} w={298} d={0.25} color="#E6C844" y={0.07} polygonOffset offsetFactor={-2} />

      {/* Southern Peripheral Circulation Road (Around 02D and leading to Gate 01) */}
      <Flat x={-18} z={175} w={300} d={7.5} color="#232830" y={0.04} polygonOffset offsetFactor={-1} />

      {/* 4. NORTH-SOUTH TRANSVERSE ACCESS SPINES */}
      {/* Continuous Western Perimeter Avenue: Gate 01 (z=226) to Basin Apron Road (z=16) */}
      <Flat x={-165} z={121} w={7.5} d={214} color="#232830" y={0.04} polygonOffset offsetFactor={-1} />
      <Flat x={-165} z={121} w={0.22} d={212} color="#FFFFFF" y={0.07} polygonOffset offsetFactor={-2} />

      {/* West Spine (Between 04A and 03A, leading to Basin Ramp) */}
      <Flat x={-80} z={65} w={6.0} d={105} color="#232830" y={0.04} polygonOffset offsetFactor={-1} />

      {/* Central Main Spine (Between 03A and 02A, high-capacity crossroads) */}
      <Flat x={-8} z={95} w={7.5} d={168} color="#232830" y={0.04} polygonOffset offsetFactor={-1} />
      <Flat x={-8} z={95} w={0.22} d={166} color="#FFFFFF" y={0.07} polygonOffset offsetFactor={-2} />

      {/* East Spine (Between 02A/02C and 01A/01C) */}
      <Flat x={64} z={126} w={7.0} d={226} color="#232830" y={0.04} polygonOffset offsetFactor={-1} />

      {/* 5. GATE 01 & NEW CUSTOMS COMPOUND ACCESS */}
      <Flat x={-95} z={185} w={6.5} d={75} color="#232830" y={0.04} polygonOffset offsetFactor={-1} />
      <Flat x={-130} z={148} w={76} d={6.5} color="#232830" y={0.04} polygonOffset offsetFactor={-1} />
      <Flat x={-130} z={222} w={76} d={6.5} color="#232830" y={0.04} polygonOffset offsetFactor={-1} />
    </group>
  );
}

/** Checks whether a 2D position lies inside the HIPG internal harbour basin. */
export const inBasin = (x: number, z: number): boolean =>
  x > -140 && x < 155.76 && z > -170 && z < -16.67;

/** Static environment: HIPG multi-sided quays, basin-conforming pavements, buildings, and lighting. */
export const Terrain = memo(function Terrain() {
  return (
    <group>
      {/* 1. Surrounding Regional Land (positioned outside the water basin and eastern sea) */}
      {/* Western regional land */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-570, -0.05, 0]}
        receiveShadow
        material={mat(COLORS.land, { rough: 1 })}
      >
        <planeGeometry args={[860, 1200]} />
      </mesh>
      {/* Southern regional hinterland */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[8, -0.05, 450]}
        receiveShadow
        material={mat(COLORS.land, { rough: 1 })}
      >
        <planeGeometry args={[300, 700]} />
      </mesh>
      {/* Northern regional land (north of Berths 09-11) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.05, -485]}
        receiveShadow
        material={mat(COLORS.land, { rough: 1 })}
      >
        <planeGeometry args={[600, 500]} />
      </mesh>

      {/* 2. Terminal Ground Pavements (conforming to the HIPG yard sectors) */}
      {/* Main Southern Yard Pavement (Container stacks & RoRo blocks) */}
      <Flat x={-42} z={130} w={395} d={290} color={COLORS.pavement} y={0} polygonOffset offsetFactor={1} />
      {/* Western Yard Finger (Customs Inspection & Dual Purpose blocks) */}
      <Flat x={-190} z={-93} w={100} d={215} color={COLORS.pavement} y={0} polygonOffset offsetFactor={1} />
      {/* Northern Apron Pavement (09W, 10W, 11W) */}
      <Flat x={0} z={-200} w={280} d={60} color={COLORS.pavement} y={0} polygonOffset offsetFactor={1} />
      {/* Northeastern Elevated Plateau (BY4 structure area) */}
      <Flat x={185} z={-255} w={110} d={90} color="#D5DCC3" y={0} polygonOffset offsetFactor={1} />

      {/* Dark asphalt road network providing clear corridor boundaries */}
      <YardRoads />

      {/* Concrete container pads with yellow boundary markings */}
      <BlockPads />

      {/* 3. HIPG Multi-Sided Quays (Berths 01-11 & Service Berth) */}
      <HipgQuays />

      {/* 4. Peripheral Structures, Warehouses & Administration (Interactive Drag & Drop) */}
      <InteractiveBuildings />

      {/* Gate 01 Main Terminal Entrance & Inspection Portal */}
      <Gate01 />

      <Trees />
    </group>
  );
});
