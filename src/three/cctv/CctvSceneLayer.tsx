import { memo, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useCctvManagement } from "@/state/CctvManagementProvider";
import { cameraApi } from "../CameraRig";
import { CctvTowerModel } from "./CctvTowerModel";

export const CctvSceneLayer = memo(function CctvSceneLayer() {
  const {
    towers,
    selectedTowerId,
    selectedCameraId,
    showTowers,
    coverageFilter,
    isPickingLocation,
    confirmLocationPicked,
    draftPosition,
    setDraftPosition,
    applyDraftPosition,
    selectTower,
    selectCamera,
  } = useCctvManagement();

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const isDragging = useRef(false);
  const dragOffset = useRef<{ x: number; z: number }>({ x: 0, z: 0 });

  const { camera, gl } = useThree();
  const groundPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const intersectionPoint = useRef(new THREE.Vector3());

  // Window pointer listeners for smooth 3D dragging across entire canvas without losing focus
  useEffect(() => {
    const onWindowPointerMove = (e: PointerEvent) => {
      if (!isDragging.current || !selectedTowerId) return;
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
        applyDraftPosition();
      }
    };

    window.addEventListener("pointermove", onWindowPointerMove);
    window.addEventListener("pointerup", onWindowPointerUp);
    return () => {
      window.removeEventListener("pointermove", onWindowPointerMove);
      window.removeEventListener("pointerup", onWindowPointerUp);
    };
  }, [camera, gl, groundPlane, raycaster, selectedTowerId, setDraftPosition, applyDraftPosition]);

  if (!showTowers && !isPickingLocation) {
    return null;
  }

  return (
    <group name="hipg-cctv-towers-layer">
      {/* 1. Large ground raycast plane for picking new CCTV tower locations */}
      {isPickingLocation && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.15, 0]}
          onClick={(e) => {
            e.stopPropagation();
            confirmLocationPicked({
              x: Math.round(e.point.x),
              z: Math.round(e.point.z),
            });
          }}
          onPointerMove={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "crosshair";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "";
          }}
        >
          <planeGeometry args={[1400, 1400]} />
          <meshBasicMaterial color="#0284C7" transparent opacity={0.18} depthWrite={false} />
        </mesh>
      )}

      {/* 2. Render all CCTV Towers with their procedural models, cameras, and coverage frustums */}
      {showTowers &&
        towers.map((tower) => {
          const isSelected = selectedTowerId === tower.id;
          const posX = isSelected && draftPosition ? draftPosition.x : tower.x;
          const posZ = isSelected && draftPosition ? draftPosition.z : tower.z;

          return (
            <group
              key={tower.id}
              position={[posX, tower.y ?? 0, posZ]}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredId(tower.id);
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                setHoveredId((prev) => (prev === tower.id ? null : prev));
                if (!isDragging.current) {
                  document.body.style.cursor = "";
                }
              }}
            >
              <CctvTowerModel
                tower={tower}
                isSelected={isSelected}
                selectedCameraId={isSelected ? selectedCameraId : null}
                showCoverage={true}
                coverageFilter={coverageFilter}
                onSelectTower={(id) => {
                  selectTower(id);
                }}
                onSelectCamera={(camId) => {
                  selectCamera(camId);
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  selectTower(tower.id);
                  isDragging.current = true;
                  dragOffset.current = {
                    x: e.point.x - posX,
                    z: e.point.z - posZ,
                  };
                  if (cameraApi.current) cameraApi.current.enabled = false;
                  document.body.style.cursor = "grabbing";
                }}
              />
            </group>
          );
        })}
    </group>
  );
});
