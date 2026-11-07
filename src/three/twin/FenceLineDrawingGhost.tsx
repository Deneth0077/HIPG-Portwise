import { memo, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useInteractiveTwin } from "@/state/InteractiveTwinProvider";
import { fenceRepository } from "@/data/fenceRepository";
import { validatePortPlacement } from "@/lib/placementValidation";
import { mat, unitBox, unitCyl } from "../parts";
import { FONT_URL } from "../Terrain";

export const FenceLineDrawingGhost = memo(function FenceLineDrawingGhost() {
  const {
    isDrawingFenceLine,
    fenceStartPoint,
    fenceCursorPoint,
    setFenceCursorPoint,
    onFenceMapClick,
    cancelDrawingFenceLine,
    snapGrid,
  } = useInteractiveTwin();

  const { camera, gl } = useThree();
  const groundPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const intersectionPoint = useRef(new THREE.Vector3());

  // Listen for pointer move over entire canvas for live 3D rubber-band fence tracking
  useEffect(() => {
    if (!isDrawingFenceLine) return;

    const onPointerMove = (e: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      if (raycaster.ray.intersectPlane(groundPlane, intersectionPoint.current)) {
        const pt = intersectionPoint.current;
        let cursorX = pt.x;
        let cursorZ = pt.z;

        // Check for magnetic vertex snapping to existing fence endpoints
        const existingFences = fenceRepository.getAll();
        const snapDistance = 2.5;
        let snapped = false;

        for (const f of existingFences) {
          if (Math.hypot(cursorX - f.startPoint.x, cursorZ - f.startPoint.z) <= snapDistance) {
            cursorX = f.startPoint.x;
            cursorZ = f.startPoint.z;
            snapped = true;
            break;
          }
          if (Math.hypot(cursorX - f.endPoint.x, cursorZ - f.endPoint.z) <= snapDistance) {
            cursorX = f.endPoint.x;
            cursorZ = f.endPoint.z;
            snapped = true;
            break;
          }
        }

        if (!snapped && snapGrid > 0) {
          cursorX = Math.round(cursorX / snapGrid) * snapGrid;
          cursorZ = Math.round(cursorZ / snapGrid) * snapGrid;
        }

        setFenceCursorPoint({ x: cursorX, z: cursorZ });
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [isDrawingFenceLine, camera, gl, groundPlane, raycaster, snapGrid, setFenceCursorPoint]);

  if (!isDrawingFenceLine) {
    return null;
  }

  // Calculate live rubber-band line geometry if start point exists
  const lineGeom = (() => {
    if (!fenceStartPoint || !fenceCursorPoint) return null;
    const dx = fenceCursorPoint.x - fenceStartPoint.x;
    const dz = fenceCursorPoint.z - fenceStartPoint.z;
    const length = Math.hypot(dx, dz);
    if (length < 0.5) return null;

    const midX = (fenceStartPoint.x + fenceCursorPoint.x) / 2;
    const midZ = (fenceStartPoint.z + fenceCursorPoint.z) / 2;
    const angleRad = Math.atan2(dz, dx);
    const rotation = (angleRad * 180) / Math.PI;
    const postCount = Math.max(2, Math.floor(length / 3)) + 1;

    // Check boundary validity
    const validation = validatePortPlacement(midX, midZ, length, 0.4, rotation);

    return {
      midX,
      midZ,
      length,
      rotation,
      angleRad,
      postCount,
      isValid: validation.isValid,
    };
  })();

  const height = 2.6;
  const themeColor = lineGeom?.isValid !== false ? "#10B981" : "#EF4444";

  return (
    <group name="hipg-fence-drawing-ghost">
      {/* 1. Full-map raycast catching plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.08, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onFenceMapClick({ x: e.point.x, z: e.point.z });
        }}
        onContextMenu={(e) => {
          e.stopPropagation();
          cancelDrawingFenceLine();
        }}
      >
        <planeGeometry args={[1800, 1800]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* 2. Cursor reticle when waiting for first start point */}
      {!fenceStartPoint && fenceCursorPoint && (
        <group position={[fenceCursorPoint.x, 0.15, fenceCursorPoint.z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.8, 1.3, 32]} />
            <meshBasicMaterial color="#38BDF8" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 1.2, 0]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshBasicMaterial color="#0284C7" />
          </mesh>
          <Text
            font={FONT_URL}
            fontSize={0.85}
            color="#FFFFFF"
            position={[0, 2.4, 0]}
            anchorX="center"
            anchorY="middle"
          >
            Click to Start Fence Line
          </Text>
        </group>
      )}

      {/* 3. Start Point Indicator Marker once first point is clicked */}
      {fenceStartPoint && (
        <group position={[fenceStartPoint.x, 0.2, fenceStartPoint.z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.9, 1.4, 32]} />
            <meshBasicMaterial color="#10B981" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 1.3, 0]}>
            <sphereGeometry args={[0.35, 16, 16]} />
            <meshBasicMaterial color="#10B981" />
          </mesh>
        </group>
      )}

      {/* 4. Live 3D Rubber-Band Fence Line Preview */}
      {lineGeom && (
        <group
          position={[lineGeom.midX, 0, lineGeom.midZ]}
          rotation={[0, -lineGeom.angleRad, 0]}
        >
          {/* Ground Footprint Highlight */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.09, 0]}>
            <planeGeometry args={[lineGeom.length, 1.2]} />
            <meshBasicMaterial
              color={themeColor}
              transparent
              opacity={0.35}
              depthWrite={false}
            />
          </mesh>

          {/* Holographic Wire Mesh Panel */}
          <mesh
            geometry={unitBox}
            position={[0, height / 2, 0]}
            scale={[lineGeom.length, height, 0.08]}
          >
            <meshStandardMaterial
              color={themeColor}
              emissive={themeColor}
              emissiveIntensity={0.4}
              transparent
              opacity={0.4}
            />
          </mesh>

          {/* Top Rail */}
          <mesh
            geometry={unitCyl}
            position={[0, height, 0]}
            rotation={[0, 0, Math.PI / 2]}
            scale={[0.07, lineGeom.length, 0.07]}
          >
            <meshBasicMaterial color={themeColor} />
          </mesh>

          {/* Live Posts Preview along Line */}
          {Array.from({ length: lineGeom.postCount }, (_, i) => {
            const xPos = -lineGeom.length / 2 + (i * lineGeom.length) / (lineGeom.postCount - 1);
            return (
              <mesh
                key={`ghost-post-${i}`}
                geometry={unitCyl}
                position={[xPos, (height + 0.2) / 2, 0]}
                scale={[0.18, height + 0.2, 0.18]}
              >
                <meshBasicMaterial color={themeColor} />
              </mesh>
            );
          })}

          {/* Overhead Live Distance & Status Badge */}
          <group position={[0, height + 2.2, 0]}>
            <mesh>
              <planeGeometry args={[14, 2.2]} />
              <meshBasicMaterial color="#0F172A" transparent opacity={0.92} depthWrite={false} />
            </mesh>
            <Text
              font={FONT_URL}
              fontSize={0.85}
              color="#FFFFFF"
              position={[0, 0.35, 0.05]}
              anchorX="center"
              anchorY="middle"
            >
              {`FENCE LINE: ${lineGeom.length.toFixed(1)}m`}
            </Text>
            <Text
              font={FONT_URL}
              fontSize={0.62}
              color="#38BDF8"
              position={[0, -0.45, 0.05]}
              anchorX="center"
              anchorY="middle"
            >
              Click to Place · Esc to Finish
            </Text>
          </group>
        </group>
      )}
    </group>
  );
});

