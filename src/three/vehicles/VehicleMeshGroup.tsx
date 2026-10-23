import { memo, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { VehicleClass, VehicleInstance } from "./types";
import { VehicleFactory } from "./VehicleFactory";

interface VehicleMeshGroupProps {
  vehicleClass: VehicleClass;
  instances: VehicleInstance[];
}

/**
 * Renders an entire class of vehicles (e.g. all Sedans or all SUVs)
 * using 5 high-performance InstancedMeshes (Body, Glass, Tyres, Rims, Details).
 */
export const VehicleMeshGroup = memo(function VehicleMeshGroup({
  vehicleClass,
  instances,
}: VehicleMeshGroupProps) {
  const count = instances.length;
  if (count === 0) return null;

  const geos = useMemo(() => VehicleFactory.getGeometries(vehicleClass), [vehicleClass]);
  const mats = useMemo(() => VehicleFactory.getMaterials(), []);

  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const glassRef = useRef<THREE.InstancedMesh>(null);
  const wheelsRef = useRef<THREE.InstancedMesh>(null);
  const rimsRef = useRef<THREE.InstancedMesh>(null);
  const detailsRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const bMesh = bodyRef.current;
    const gMesh = glassRef.current;
    const wMesh = wheelsRef.current;
    const rMesh = rimsRef.current;
    const dMesh = detailsRef.current;
    if (!bMesh || count === 0) return;

    const o = new THREE.Object3D();
    const col = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const v = instances[i];
      o.position.set(v.x, v.y, v.z);
      o.rotation.set(0, v.rotY, 0);
      o.updateMatrix();

      bMesh.setMatrixAt(i, o.matrix);
      col.set(v.color);
      bMesh.setColorAt(i, col);

      if (gMesh) gMesh.setMatrixAt(i, o.matrix);
      if (wMesh) wMesh.setMatrixAt(i, o.matrix);
      if (rMesh) rMesh.setMatrixAt(i, o.matrix);
      if (dMesh) dMesh.setMatrixAt(i, o.matrix);
    }

    bMesh.instanceMatrix.needsUpdate = true;
    if (bMesh.instanceColor) bMesh.instanceColor.needsUpdate = true;
    if (gMesh) gMesh.instanceMatrix.needsUpdate = true;
    if (wMesh) wMesh.instanceMatrix.needsUpdate = true;
    if (rMesh) rMesh.instanceMatrix.needsUpdate = true;
    if (dMesh) dMesh.instanceMatrix.needsUpdate = true;

    bMesh.computeBoundingSphere();
    if (gMesh) gMesh.computeBoundingSphere();
    if (wMesh) wMesh.computeBoundingSphere();
    if (rMesh) rMesh.computeBoundingSphere();
    if (dMesh) dMesh.computeBoundingSphere();
  }, [instances, count]);

  return (
    <group name={`vehicle-group-${vehicleClass}`}>
      {/* 1. Automotive Paint Body */}
      <instancedMesh
        ref={bodyRef}
        args={[geos.bodyGeo, mats.paintMaterial, count]}
        castShadow
        receiveShadow
      />
      {/* 2. Automotive Tinted Glass */}
      <instancedMesh
        ref={glassRef}
        args={[geos.glassGeo, mats.glassMaterial, count]}
        castShadow
      />
      {/* 3. Rubber Tyres */}
      <instancedMesh
        ref={wheelsRef}
        args={[geos.wheelsGeo, mats.tyreMaterial, count]}
        castShadow
      />
      {/* 4. Alloy Rims */}
      <instancedMesh
        ref={rimsRef}
        args={[geos.rimsGeo, mats.rimMaterial, count]}
        castShadow
      />
      {/* 5. Headlights, Taillights, Grille, Plates, Trim */}
      <instancedMesh
        ref={detailsRef}
        args={[geos.detailsGeo, mats.detailsMaterial, count]}
        castShadow
      />
    </group>
  );
});
