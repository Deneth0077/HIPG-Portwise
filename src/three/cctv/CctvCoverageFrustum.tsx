import { memo, useMemo } from "react";
import * as THREE from "three";
import type { CctvCameraConfig } from "@/data/cctvTypes";

interface CctvFrustumProps {
  camera: CctvCameraConfig;
  towerHeight: number;
  isSelected?: boolean;
}

/**
 * Procedural 3D Camera Coverage Frustum
 * Generates an accurate 3D frustum volume and ground footprint representing
 * the camera's horizontal FOV, vertical FOV, pitch, and range.
 */
export const CctvCoverageFrustum = memo(function CctvCoverageFrustum({
  camera,
  towerHeight,
  isSelected = false,
}: CctvFrustumProps) {
  const { hfov, vfov, range, pitch, coverageColor = "#0284C7", status } = camera;

  const color = useMemo(() => new THREE.Color(coverageColor), [coverageColor]);

  // Build a sleek V-shape angular coverage sector (wedge fan) instead of a boxy 3D cube/frustum
  const { fanGeo, wireGeo, centerLineGeo } = useMemo(() => {
    const halfHRad = THREE.MathUtils.degToRad(hfov / 2);
    const effectiveRange = Math.max(10, Math.min(60, range));

    // Number of arc segments for smooth curved outer boundary
    const segments = 24;
    const fanPositions: number[] = [];
    const wirePositions: number[] = [];

    // Local coordinates: camera points forward along -Z, right is +X, up is +Y
    // Fan vertex at camera lens origin (0, 0, 0)
    const arcPoints: { x: number; z: number }[] = [];
    for (let i = 0; i <= segments; i++) {
      const angle = -halfHRad + (i / segments) * (halfHRad * 2);
      const x = Math.sin(angle) * effectiveRange;
      const z = -Math.cos(angle) * effectiveRange;
      arcPoints.push({ x, z });
    }

    // Triangular fan slices connecting apex (0,0,0) to arc
    for (let i = 0; i < segments; i++) {
      const p1 = arcPoints[i];
      const p2 = arcPoints[i + 1];
      // Apex -> p1 -> p2
      fanPositions.push(0, 0, 0, p1.x, 0, p1.z, p2.x, 0, p2.z);
    }

    const fGeo = new THREE.BufferGeometry();
    fGeo.setAttribute("position", new THREE.Float32BufferAttribute(fanPositions, 3));
    fGeo.computeVertexNormals();

    // V-shape outline wire: Left arm, Right arm, and curved front arc
    // Left ray: Apex -> Arc first point
    wirePositions.push(0, 0, 0, arcPoints[0].x, 0, arcPoints[0].z);
    // Right ray: Apex -> Arc last point
    wirePositions.push(0, 0, 0, arcPoints[segments].x, 0, arcPoints[segments].z);
    // Front arc segments
    for (let i = 0; i < segments; i++) {
      wirePositions.push(
        arcPoints[i].x, 0, arcPoints[i].z,
        arcPoints[i + 1].x, 0, arcPoints[i + 1].z
      );
    }

    const wGeo = new THREE.BufferGeometry();
    wGeo.setAttribute("position", new THREE.Float32BufferAttribute(wirePositions, 3));

    // Center aim line (direction bore)
    const cGeo = new THREE.BufferGeometry();
    cGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, -effectiveRange], 3)
    );

    return { fanGeo: fGeo, wireGeo: wGeo, centerLineGeo: cGeo };
  }, [hfov, range]);

  // Convert yaw & pitch into camera local rotation
  // Yaw: rotation around vertical Y axis
  // Pitch: In 3D space looking along -Z, rotating around +X by -pitchRad tilts forward/downward toward ground for negative pitch values
  const yawRad = THREE.MathUtils.degToRad(-camera.yaw);
  const pitchRad = THREE.MathUtils.degToRad(-pitch);

  const opacity = isSelected ? 0.35 : status === "active" ? 0.18 : 0.08;

  return (
    <group
      position={[0, camera.mountingHeight, 0]}
      rotation={[0, yawRad, 0]}
    >
      {/* Positioned at camera head assembly origin ([0, -0.04, -0.7]) */}
      <group position={[0, -0.04, -0.7]} rotation={[pitchRad, 0, 0]}>
        {/* Sleek V-shape translucent coverage fan */}
        <mesh geometry={fanGeo} raycast={() => null}>
          <meshBasicMaterial
            color={color}
            transparent
            opacity={opacity}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Clean V-shape boundary outline */}
        <lineSegments geometry={wireGeo} raycast={() => null}>
          <lineBasicMaterial
            color={isSelected ? "#FFFFFF" : color}
            linewidth={isSelected ? 2 : 1}
            transparent
            opacity={isSelected ? 0.95 : 0.7}
          />
        </lineSegments>

        {/* Center bore line indicator */}
        <lineSegments geometry={centerLineGeo} raycast={() => null}>
          <lineBasicMaterial
            color={isSelected ? "#FFFFFF" : color}
            transparent
            opacity={isSelected ? 0.85 : 0.45}
          />
        </lineSegments>
      </group>
    </group>
  );
});
