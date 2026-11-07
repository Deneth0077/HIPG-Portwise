import { memo, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useInteractiveTwin } from "@/state/InteractiveTwinProvider";
import { FONT_URL } from "../Terrain";
import { unitBox, unitCyl } from "../parts";

export const BuildPlacementGhost = memo(function BuildPlacementGhost() {
  const {
    mode,
    activeBuildItem,
    buildPreview,
    updateBuildCursor,
    confirmBuild,
    cancelBuild,
  } = useInteractiveTwin();

  const { camera, gl } = useThree();
  const groundPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const intersectionPoint = useRef(new THREE.Vector3());

  // Listen for pointer move over entire window/canvas for silky smooth ghost tracking
  useEffect(() => {
    if (mode !== "build" || !activeBuildItem) return;

    const onPointerMove = (e: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      if (raycaster.ray.intersectPlane(groundPlane, intersectionPoint.current)) {
        const pt = intersectionPoint.current;
        updateBuildCursor(pt.x, pt.z);
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [mode, activeBuildItem, camera, gl, groundPlane, raycaster, updateBuildCursor]);

  if (mode !== "build" || !activeBuildItem || !buildPreview || activeBuildItem.category === "fences") {
    return null;
  }

  const { x, z, rotation, isValid, reason } = buildPreview;
  const { width, length, height, name, accentColor } = activeBuildItem;
  const rotRad = (rotation * Math.PI) / 180;

  // Clash of Clans styling: Vibrant Emerald Green (#10B981) for valid, Crimson Red (#EF4444) for invalid
  const themeColor = isValid ? "#10B981" : "#EF4444";
  const glowColor = isValid ? "#34D399" : "#F87171";

  return (
    <group name="hipg-clash-build-ghost">
      {/* 1. Invisible full-terminal Raycast catching plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.08, 0]}
        onClick={(e) => {
          e.stopPropagation();
          confirmBuild();
        }}
        onPointerMove={(e) => {
          e.stopPropagation();
          updateBuildCursor(e.point.x, e.point.z);
        }}
        onContextMenu={(e) => {
          e.stopPropagation();
          cancelBuild();
        }}
      >
        <planeGeometry args={[1600, 1600]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* 2. Floating Clash of Clans Ghost Preview Object */}
      <group position={[x, 0, z]} rotation={[0, -rotRad, 0]}>
        {/* Holographic Footprint Grid Pad */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12, 0]}>
          <planeGeometry args={[width, length]} />
          <meshBasicMaterial
            color={themeColor}
            transparent
            opacity={isValid ? 0.35 : 0.45}
            depthWrite={false}
          />
        </mesh>

        {/* Pulsing Outer Perimeter Ring */}
        <group position={[0, 0.14, 0]}>
          {[
            [0, length / 2, width + 0.6, 0.4],
            [0, -length / 2, width + 0.6, 0.4],
            [width / 2, 0, 0.4, length + 0.6],
            [-width / 2, 0, 0.4, length + 0.6],
          ].map(([bx, bz, bw, bd], i) => (
            <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[bx, 0, bz]}>
              <planeGeometry args={[bw, bd]} />
              <meshBasicMaterial color={glowColor} depthWrite={false} />
            </mesh>
          ))}
        </group>

        {/* 4 Corner Alignment Brackets */}
        {[
          [-width / 2, -length / 2],
          [width / 2, -length / 2],
          [-width / 2, length / 2],
          [width / 2, length / 2],
        ].map(([cx, cz], i) => (
          <group key={`c${i}`} position={[cx, 0.16, cz]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[2, 2]} />
              <meshBasicMaterial color={themeColor} depthWrite={false} />
            </mesh>
          </group>
        ))}

        {/* Directional Front Indicator Arrow */}
        <group position={[0, 0.18, -length / 2 - 2.5]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[1.4, 3, 3]} />
            <meshBasicMaterial color={themeColor} depthWrite={false} />
          </mesh>
        </group>

        {/* 3D Semi-transparent Hologram Geometry */}
        {height > 1 ? (
          <mesh
            geometry={unitBox}
            position={[0, height / 2, 0]}
            scale={[width, height, length]}
          >
            <meshStandardMaterial
              color={themeColor}
              emissive={themeColor}
              emissiveIntensity={isValid ? 0.35 : 0.6}
              transparent
              opacity={0.35}
              roughness={0.2}
              metalness={0.1}
            />
          </mesh>
        ) : (
          <mesh
            geometry={unitBox}
            position={[0, 0.3, 0]}
            scale={[width, 0.4, length]}
          >
            <meshStandardMaterial
              color={themeColor}
              emissive={themeColor}
              emissiveIntensity={0.4}
              transparent
              opacity={0.4}
            />
          </mesh>
        )}

        {/* Floating Clash of Clans Style Status Banner Badge */}
        <group position={[0, Math.max(height + 3, 7), 0]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[18, 3]} />
            <meshBasicMaterial
              color={isValid ? "#064E3B" : "#7F1D1D"}
              transparent
              opacity={0.92}
              depthWrite={false}
            />
          </mesh>

          <Text
            font={FONT_URL}
            fontSize={1.05}
            color="#FFFFFF"
            position={[0, 0.5, 0.05]}
            anchorX="center"
            anchorY="middle"
          >
            {name.toUpperCase()}
          </Text>

          <Text
            font={FONT_URL}
            fontSize={0.75}
            color={isValid ? "#6EE7B7" : "#FCA5A5"}
            position={[0, -0.65, 0.05]}
            anchorX="center"
            anchorY="middle"
          >
            {isValid
              ? `✓ Click to Place · [${x.toFixed(1)}, ${z.toFixed(1)}] · 'R' to Rotate`
              : `✕ ${reason || "Cannot place here"} (Water/Boundary)`}
          </Text>
        </group>
      </group>
    </group>
  );
});

