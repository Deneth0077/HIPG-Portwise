import { memo, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { COLORS } from "@/data/layout";
import { mat, unitBox } from "./parts";
import { FONT_URL } from "./Terrain";
import { Glow, LIGHT, litMat } from "./nightLights";
import { useBuildingManagement } from "@/state/BuildingManagementProvider";
import { useCctvManagement } from "@/state/CctvManagementProvider";
import { cameraApi } from "./CameraRig";

function WarehouseModel({
  w,
  d,
  h = 6.4,
  isSelected,
  name,
}: {
  w: number;
  d: number;
  h?: number;
  isSelected?: boolean;
  name: string;
}) {
  const doors = Math.max(1, Math.floor(w / 5));
  return (
    <group>
      {/* Main warehouse hall */}
      <mesh
        geometry={unitBox}
        material={mat(isSelected ? "#F5EFE6" : "#ECE7DC", { rough: 0.85 })}
        position={[0, h / 2, 0]}
        scale={[w, h, d]}
        castShadow
        receiveShadow
      />
      {/* Angled gabled roof */}
      <mesh
        geometry={unitBox}
        material={mat(isSelected ? "#CFD8DC" : "#B9C6CC")}
        position={[0, h + 0.5, -d / 4]}
        rotation={[0.28, 0, 0]}
        scale={[w + 0.4, 0.3, d / 2 + 0.6]}
        castShadow
      />
      <mesh
        geometry={unitBox}
        material={mat(isSelected ? "#C5D0D5" : "#AFBDC4")}
        position={[0, h + 0.5, d / 4]}
        rotation={[-0.28, 0, 0]}
        scale={[w + 0.4, 0.3, d / 2 + 0.6]}
        castShadow
      />
      {/* Loading bay rollup doors */}
      {Array.from({ length: doors }, (_, i) => (
        <mesh
          key={i}
          geometry={unitBox}
          material={i % 3 === 1 ? litMat(COLORS.ink, LIGHT.sodium, 0.9) : mat(COLORS.ink)}
          position={[-w / 2 + 2.5 + i * 5, 1.6, d / 2 + 0.02]}
          scale={[2.6, 3.2, 0.06]}
        />
      ))}
      {Array.from({ length: doors }, (_, i) => (
        <Glow
          key={`g${i}`}
          position={[-w / 2 + 2.5 + i * 5, 3.7, d / 2 + 0.5]}
          color={LIGHT.sodium}
          size={1.4}
          base={0.8}
        />
      ))}
      {/* Building Painted Label on Wall */}
      <Text
        font={FONT_URL}
        fontSize={1.4}
        color={isSelected ? COLORS.signal : "#6D6455"}
        position={[0, h + 0.9, d / 2 + 0.2]}
        anchorX="center"
        anchorY="bottom"
      >
        {name.toUpperCase()}
      </Text>
    </group>
  );
}

function OfficeBuildingModel({
  w,
  d,
  h,
  band = COLORS.ink,
  isSelected,
  name,
}: {
  w: number;
  d: number;
  h: number;
  band?: string;
  isSelected?: boolean;
  name: string;
}) {
  const floors = Math.max(1, Math.floor(h / 3.2));
  return (
    <group>
      <mesh
        geometry={unitBox}
        material={mat(isSelected ? "#FAF7F2" : "#F4F1EA")}
        position={[0, h / 2, 0]}
        scale={[w, h, d]}
        castShadow
        receiveShadow
      />
      <mesh
        geometry={unitBox}
        material={mat("#C9D2D6")}
        position={[0, h + 0.15, 0]}
        scale={[w + 0.3, 0.3, d + 0.3]}
        castShadow
      />
      {Array.from({ length: floors }, (_, i) => (
        <mesh
          key={i}
          geometry={unitBox}
          material={litMat(band, LIGHT.window, 0.9 + ((i * 7) % 3) * 0.35)}
          position={[0, 1.8 + i * 3.2, 0]}
          scale={[w + 0.04, 0.9, d + 0.04]}
        />
      ))}
      <Glow position={[0, h + 0.8, 0]} color={LIGHT.red} size={1.4} blink={2.2} />
      <Text
        font={FONT_URL}
        fontSize={Math.min(1.6, w / 16)}
        color={isSelected ? COLORS.signal : COLORS.ink}
        position={[0, h + 1.2, 0]}
        anchorX="center"
        anchorY="bottom"
      >
        {name.toUpperCase()}
      </Text>
    </group>
  );
}

export const InteractiveBuildings = memo(function InteractiveBuildings() {
  const {
    buildings,
    selectedBuildingId,
    selectBuilding,
    draftPosition,
    setDraftPosition,
    applyDraft,
    isPickingLocation,
    onLocationPicked,
  } = useBuildingManagement();
  const { isCctvMode } = useCctvManagement();

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const isDragging = useRef(false);
  const dragOffset = useRef<{ x: number; z: number }>({ x: 0, z: 0 });

  const { camera, gl } = useThree();
  const groundPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const intersectionPoint = useRef(new THREE.Vector3());

  // Window pointer listeners for smooth 3D dragging across entire canvas
  useEffect(() => {
    const onWindowPointerMove = (e: PointerEvent) => {
      if (!isDragging.current || !selectedBuildingId) return;
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      if (raycaster.ray.intersectPlane(groundPlane, intersectionPoint.current)) {
        const pt = intersectionPoint.current;
        const newX = Math.round((pt.x - dragOffset.current.x) * 2) / 2;
        const newZ = Math.round((pt.z - dragOffset.current.z) * 2) / 2;
        setDraftPosition({ x: newX, z: newZ });
      }
    };

    const onWindowPointerUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        if (cameraApi.current) cameraApi.current.enabled = true;
        document.body.style.cursor = "";
        applyDraft();
      }
    };

    window.addEventListener("pointermove", onWindowPointerMove);
    window.addEventListener("pointerup", onWindowPointerUp);
    return () => {
      window.removeEventListener("pointermove", onWindowPointerMove);
      window.removeEventListener("pointerup", onWindowPointerUp);
    };
  }, [camera, gl, groundPlane, raycaster, selectedBuildingId, setDraftPosition, applyDraft]);

  return (
    <group name="hipg-interactive-buildings">
      {/* Raycast plane for picking new building location */}
      {isPickingLocation && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.12, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onLocationPicked({ x: Math.round(e.point.x), z: Math.round(e.point.z) });
          }}
          onPointerMove={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "crosshair";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "";
          }}
        >
          <planeGeometry args={[1200, 1200]} />
          <meshBasicMaterial color="#0284C7" transparent opacity={0.15} depthWrite={false} />
        </mesh>
      )}

      {/* Dynamic Interactive Buildings */}
      {buildings.map((b) => {
        const isSelected = selectedBuildingId === b.id;
        const isHovered = hoveredId === b.id;
        const posX = isSelected && draftPosition ? draftPosition.x : b.x;
        const posZ = isSelected && draftPosition ? draftPosition.z : b.z;
        const rotY = ((b.rotation ?? 0) * Math.PI) / 180;

        return (
          <group
            key={b.id}
            position={[posX, 0, posZ]}
            rotation={[0, rotY, 0]}
            onPointerOver={(e) => {
              if (isCctvMode) return;
              e.stopPropagation();
              setHoveredId(b.id);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              if (isCctvMode) return;
              setHoveredId((prev) => (prev === b.id ? null : prev));
              if (!isDragging.current) {
                document.body.style.cursor = "";
              }
            }}
            onPointerDown={(e) => {
              if (isCctvMode) return;
              e.stopPropagation();
              selectBuilding(b.id);
              isDragging.current = true;
              dragOffset.current = {
                x: e.point.x - posX,
                z: e.point.z - posZ,
              };
              if (cameraApi.current) cameraApi.current.enabled = false;
              document.body.style.cursor = "grabbing";
            }}
          >
            {/* Building Geometry based on Type */}
            {b.type === "warehouse" ? (
              <WarehouseModel
                w={b.width}
                d={b.depth}
                h={b.height}
                isSelected={isSelected}
                name={b.name}
              />
            ) : (
              <OfficeBuildingModel
                w={b.width}
                d={b.depth}
                h={b.height}
                band={b.bandColor}
                isSelected={isSelected}
                name={b.name}
              />
            )}

            {/* Selection highlight base boundary ring */}
            {(isSelected || isHovered) && (
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0.05, 0]}
              >
                <planeGeometry args={[b.width + 2.5, b.depth + 2.5]} />
                <meshBasicMaterial
                  color={isSelected ? "#0284C7" : "#EAB308"}
                  transparent
                  opacity={isSelected ? 0.35 : 0.2}
                  depthWrite={false}
                />
              </mesh>
            )}

            {/* Floating Selection Badge & Coordinates */}
            {isSelected && (
              <group position={[0, b.height + 2.8, 0]}>
                <mesh position={[0, 0, 0]}>
                  <planeGeometry args={[14, 2.2]} />
                  <meshBasicMaterial color="#12233F" transparent opacity={0.92} depthWrite={false} />
                </mesh>
                <Text
                  font={FONT_URL}
                  fontSize={0.85}
                  color="#FFFFFF"
                  position={[0, 0.3, 0.05]}
                  anchorX="center"
                  anchorY="middle"
                >
                  {b.name}
                </Text>
                <Text
                  font={FONT_URL}
                  fontSize={0.65}
                  color="#38BDF8"
                  position={[0, -0.4, 0.05]}
                  anchorX="center"
                  anchorY="middle"
                >
                  Drag to Move · [{posX.toFixed(1)}, {posZ.toFixed(1)}]
                </Text>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
});
