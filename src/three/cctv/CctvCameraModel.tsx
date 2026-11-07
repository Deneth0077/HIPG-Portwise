import { memo } from "react";
import * as THREE from "three";
import type { CctvCameraConfig } from "@/data/cctvTypes";
import { mat, unitBox, unitCyl } from "../parts";

interface CctvCameraModelProps {
  camera: CctvCameraConfig;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const CctvCameraModel = memo(function CctvCameraModel({
  camera,
  isSelected = false,
  onSelect,
}: CctvCameraModelProps) {
  const { type, yaw, pitch, mountingHeight, status, coverageColor = "#0284C7" } = camera;

  const yawRad = THREE.MathUtils.degToRad(-yaw);
  const pitchRad = THREE.MathUtils.degToRad(-pitch);

  const housingColor = isSelected ? "#F8FAFC" : status === "active" ? "#E2E8F0" : "#94A3B8";
  const lensRingColor = isSelected ? coverageColor : "#0F172A";

  return (
    <group
      position={[0, mountingHeight, 0]}
      rotation={[0, yawRad, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
    >
      {/* Horizontal mounting arm extending out from tower mast (Compact) */}
      <mesh
        geometry={unitBox}
        material={mat("#475569", { metal: 0.8, rough: 0.3 })}
        position={[0, 0, -0.35]}
        scale={[0.06, 0.06, 0.7]}
        castShadow
      />

      {/* Arm mount clamp bracket */}
      <mesh
        geometry={unitCyl}
        material={mat("#334155")}
        position={[0, 0, 0]}
        scale={[0.18, 0.12, 0.18]}
      />

      {/* Camera head assembly - tilts according to pitch */}
      <group position={[0, -0.04, -0.7]} rotation={[pitchRad, 0, 0]}>
        {/* Swivel bracket connector */}
        <mesh
          geometry={unitCyl}
          material={mat("#334155")}
          position={[0, 0.08, 0]}
          scale={[0.09, 0.15, 0.09]}
        />

        {type === "dome" ? (
          /* Dome camera housing */
          <group position={[0, -0.05, 0]}>
            <mesh
              geometry={unitCyl}
              material={mat(housingColor, { rough: 0.4 })}
              scale={[0.5, 0.18, 0.5]}
              castShadow
            />
            {/* Lower glass dome */}
            <mesh position={[0, -0.15, 0]}>
              <sphereGeometry args={[0.22, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
              <meshStandardMaterial
                color="#090D16"
                roughness={0.1}
                metalness={0.9}
              />
            </mesh>
            {/* Status LED */}
            <mesh position={[0, -0.1, 0.22]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshBasicMaterial color={status === "active" ? "#10B981" : "#EF4444"} />
            </mesh>
          </group>
        ) : type === "ptz" ? (
          /* PTZ speed dome camera housing */
          <group position={[0, -0.1, 0]}>
            <mesh
              geometry={unitCyl}
              material={mat(housingColor)}
              scale={[0.42, 0.3, 0.42]}
              castShadow
            />
            <mesh position={[0, -0.22, 0]}>
              <sphereGeometry args={[0.28, 16, 16]} />
              <meshStandardMaterial
                color="#1E293B"
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>
            {/* PTZ Lens optical glass aperture */}
            <mesh position={[0, -0.22, -0.25]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.08, 16]} />
              <meshStandardMaterial color={lensRingColor} roughness={0.1} metalness={0.9} />
            </mesh>
          </group>
        ) : (
          /* Bullet / Fixed camera housing with sunshield hood */
          <group position={[0, 0, -0.1]}>
            {/* Main cylindrical barrel */}
            <mesh
              geometry={unitBox}
              material={mat(housingColor, { rough: 0.35 })}
              scale={[0.28, 0.28, 0.65]}
              castShadow
            />
            {/* Sunshield canopy on top */}
            <mesh
              geometry={unitBox}
              material={mat(isSelected ? "#FFFFFF" : "#CBD5E1")}
              position={[0, 0.16, 0.04]}
              scale={[0.32, 0.04, 0.72]}
              castShadow
            />
            {/* Front optical lens and infrared LED bezel */}
            <mesh position={[0, 0, -0.34]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.12, 0.12, 0.04, 16]} />
              <meshStandardMaterial color={lensRingColor} metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Center lens element */}
            <mesh position={[0, 0, -0.36]}>
              <sphereGeometry args={[0.06, 12, 12]} />
              <meshBasicMaterial color="#0284C7" />
            </mesh>
            {/* Indicator power LED */}
            <mesh position={[0.1, 0.1, -0.32]}>
              <boxGeometry args={[0.03, 0.03, 0.03]} />
              <meshBasicMaterial color={status === "active" ? "#10B981" : "#EF4444"} />
            </mesh>
          </group>
        )}

        {/* Selected camera highlight halo */}
        {isSelected && (
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.7, 16, 16]} />
            <meshBasicMaterial
              color={coverageColor}
              wireframe
              transparent
              opacity={0.7}
            />
          </mesh>
        )}
      </group>
    </group>
  );
});
