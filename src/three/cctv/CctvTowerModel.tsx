import { memo, useMemo } from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import type { CctvTowerConfig } from "@/data/cctvTypes";
import { mat, unitBox, unitCyl } from "../parts";
import { FONT_URL } from "../Terrain";
import { CctvCameraModel } from "./CctvCameraModel";
import { CctvCoverageFrustum } from "./CctvCoverageFrustum";

interface CctvTowerModelProps {
  tower: CctvTowerConfig;
  isSelected?: boolean;
  selectedCameraId?: string | null;
  showCoverage?: boolean;
  coverageFilter?: "all" | "selected-tower" | "selected-camera" | "none";
  onSelectTower?: (id: string) => void;
  onSelectCamera?: (cameraId: string) => void;
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void;
}

export const CctvTowerModel = memo(function CctvTowerModel({
  tower,
  isSelected = false,
  selectedCameraId = null,
  showCoverage = true,
  coverageFilter = "all",
  onSelectTower,
  onSelectCamera,
  onPointerDown,
}: CctvTowerModelProps) {
  const { code, height, rotation, status, cameras = [] } = tower;

  const rotYRad = THREE.MathUtils.degToRad(rotation);

  // Materials
  const poleColor = isSelected ? "#38BDF8" : status === "active" ? "#64748B" : "#94A3B8";
  const mastMat = useMemo(() => mat(poleColor, { metal: 0.8, rough: 0.25 }), [poleColor]);
  const baseMat = useMemo(() => mat("#334155", { rough: 0.6 }), []);
  const boxMat = useMemo(() => mat("#E2E8F0", { rough: 0.4 }), []);

  // Lattice / rung cross-members count based on height
  const rungCount = Math.floor(height / 2.5);

  return (
    <group
      rotation={[0, rotYRad, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelectTower?.(tower.id);
      }}
      onPointerDown={onPointerDown}
    >
      {/* 1. Heavy Reinforced Concrete & Steel Base Foundation (Slim) */}
      <mesh
        geometry={unitBox}
        material={baseMat}
        position={[0, 0.15, 0]}
        scale={[1.1, 0.3, 1.1]}
        castShadow
        receiveShadow
      />
      {/* Base mounting bolts flange ring */}
      <mesh
        geometry={unitCyl}
        material={mat("#1E293B")}
        position={[0, 0.32, 0]}
        scale={[0.75, 0.06, 0.75]}
      />

      {/* 2. Main Vertical Mast Column (Slimmer profile) */}
      <mesh
        geometry={unitCyl}
        material={mastMat}
        position={[0, height / 2, 0]}
        scale={[0.26, height, 0.26]}
        castShadow
        receiveShadow
      />

      {/* Tapered upper segment */}
      <mesh
        geometry={unitCyl}
        material={mastMat}
        position={[0, height - 0.75, 0]}
        scale={[0.20, 1.5, 0.20]}
        castShadow
      />

      {/* 3. Safety Climbing Rungs / Brackets along mast */}
      {Array.from({ length: rungCount }, (_, i) => {
        const y = 2.5 + i * 2.5;
        if (y >= height - 1.5) return null;
        return (
          <group key={i} position={[0, y, 0]}>
            <mesh
              geometry={unitBox}
              material={mat("#475569")}
              position={[0.18, 0, 0]}
              scale={[0.12, 0.04, 0.36]}
            />
          </group>
        );
      })}

      {/* 4. Weatherproof Industrial Equipment Control Cabinet at base */}
      <group position={[0.38, 1.2, 0]}>
        <mesh
          geometry={unitBox}
          material={boxMat}
          scale={[0.32, 0.65, 0.42]}
          castShadow
          receiveShadow
        />
        {/* Cabinet Door handle / latch */}
        <mesh
          geometry={unitBox}
          material={mat("#0F172A")}
          position={[0.17, 0, 0.1]}
          scale={[0.03, 0.12, 0.03]}
        />
        {/* High Voltage / CCTV Warning Symbol */}
        <mesh position={[0.165, 0.15, 0]}>
          <planeGeometry args={[0.1, 0.1]} />
          <meshBasicMaterial color="#F59E0B" />
        </mesh>
      </group>

      {/* 5. Top CCTV Mounting Head Frame / Cross Platform */}
      <group position={[0, height, 0]}>
        {/* Top platform circular ring */}
        <mesh
          geometry={unitCyl}
          material={baseMat}
          position={[0, 0, 0]}
          scale={[1.0, 0.08, 1.0]}
        />
        {/* Safety rail border */}
        <mesh
          geometry={unitCyl}
          material={mat("#475569")}
          position={[0, 0.3, 0]}
          scale={[0.95, 0.5, 0.95]}
        />
        {/* Lightning arrestor rod on topmost apex */}
        <mesh
          geometry={unitCyl}
          material={mat("#E2E8F0", { metal: 0.9 })}
          position={[0, 0.7, 0]}
          scale={[0.03, 1.2, 0.03]}
        />
        <mesh position={[0, 1.3, 0]}>
          <coneGeometry args={[0.04, 0.2, 8]} />
          <meshBasicMaterial color="#E2E8F0" />
        </mesh>
      </group>

      {/* 6. Tower ID Label Billboard floating above structure */}
      <group position={[0, height + 1.8, 0]}>
        <Text
          font={FONT_URL}
          fontSize={0.9}
          color={isSelected ? "#38BDF8" : "#0F172A"}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.10}
          outlineColor="#FFFFFF"
        >
          {code}
        </Text>
      </group>

      {/* 7. Selection Indicator Ring on Ground */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[1.0, 1.6, 32]} />
          <meshBasicMaterial color="#38BDF8" side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* 8. Render attached cameras on this tower */}
      {cameras.map((cam) => {
        const isCamSelected = selectedCameraId === cam.id;

        // Coverage visibility rule:
        // - if coverageFilter is 'none', hide all
        // - if coverageFilter is 'selected-camera', show only if isCamSelected
        // - if coverageFilter is 'selected-tower', show all cameras of selected tower
        // - if coverageFilter is 'all', show all
        const shouldRenderCoverage =
          showCoverage &&
          (coverageFilter === "all" ||
            (coverageFilter === "selected-tower" && isSelected) ||
            (coverageFilter === "selected-camera" && isCamSelected));

        return (
          <group key={cam.id}>
            <CctvCameraModel
              camera={cam}
              isSelected={isCamSelected}
              onSelect={() => {
                onSelectTower?.(tower.id);
                onSelectCamera?.(cam.id);
              }}
            />
            {shouldRenderCoverage && (
              <CctvCoverageFrustum
                camera={cam}
                towerHeight={height}
                isSelected={isCamSelected}
              />
            )}
          </group>
        );
      })}
    </group>
  );
});
