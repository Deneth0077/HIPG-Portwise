import { memo, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useInteractiveTwin } from "@/state/InteractiveTwinProvider";
import { useYardManagement } from "@/state/YardManagementProvider";
import { useCctvManagement } from "@/state/CctvManagementProvider";
import { useBuildingManagement } from "@/state/BuildingManagementProvider";
import { useRoadManagement } from "@/state/RoadManagementProvider";
import { fenceRepository } from "@/data/fenceRepository";
import { FONT_URL } from "../Terrain";
import { cameraApi } from "../CameraRig";
import { unitBox } from "../parts";

export const EditSelectionGizmo = memo(function EditSelectionGizmo() {
  const {
    mode,
    selectedObject,
    selectObject,
    rotateObject,
    duplicateSelected,
    deleteSelected,
    snapGrid,
  } = useInteractiveTwin();

  const yardMgr = useYardManagement();
  const cctvMgr = useCctvManagement();
  const bldMgr = useBuildingManagement();
  const roadMgr = useRoadManagement();

  const isDragging = useRef(false);
  const dragOffset = useRef<{ x: number; z: number }>({ x: 0, z: 0 });
  const startDragPos = useRef<{ x: number; z: number }>({ x: 0, z: 0 });

  const { camera, gl } = useThree();
  const groundPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const intersectionPoint = useRef(new THREE.Vector3());

  // Listen to window pointer events when dragging selected object
  useEffect(() => {
    const onWindowPointerMove = (e: PointerEvent) => {
      if (!isDragging.current || !selectedObject) return;

      const rect = gl.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      if (raycaster.ray.intersectPlane(groundPlane, intersectionPoint.current)) {
        const pt = intersectionPoint.current;
        let newX = pt.x - dragOffset.current.x;
        let newZ = pt.z - dragOffset.current.z;

        if (snapGrid > 0) {
          newX = Math.round(newX / snapGrid) * snapGrid;
          newZ = Math.round(newZ / snapGrid) * snapGrid;
        } else {
          newX = Math.round(newX * 10) / 10;
          newZ = Math.round(newZ * 10) / 10;
        }

        if (selectedObject.category === "yard") {
          yardMgr.setDraftPosition({ x: newX, z: newZ });
        } else if (selectedObject.category === "cctv") {
          cctvMgr.setDraftPosition({ x: newX, z: newZ });
        } else if (selectedObject.category === "building") {
          bldMgr.setDraftPosition({ x: newX, z: newZ });
        } else if (selectedObject.category === "road") {
          const dx = newX - selectedObject.position.x;
          const dz = newZ - selectedObject.position.z;
          roadMgr.setDraftPosition({
            x: selectedObject.position.x + dx,
            z: selectedObject.position.z + dz,
          });
        } else if (selectedObject.category === "fence") {
          fenceRepository.update(selectedObject.id, { x: newX, z: newZ });
        }
      }
    };

    const onWindowPointerUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        if (cameraApi.current) cameraApi.current.enabled = true;
        document.body.style.cursor = "";

        if (selectedObject?.category === "yard") {
          yardMgr.applyDraftPosition();
        } else if (selectedObject?.category === "cctv") {
          cctvMgr.applyDraftPosition();
        } else if (selectedObject?.category === "building") {
          bldMgr.applyDraft();
        } else if (selectedObject?.category === "road") {
          roadMgr.applyDraft();
        }
      }
    };

    window.addEventListener("pointermove", onWindowPointerMove);
    window.addEventListener("pointerup", onWindowPointerUp);
    return () => {
      window.removeEventListener("pointermove", onWindowPointerMove);
      window.removeEventListener("pointerup", onWindowPointerUp);
    };
  }, [
    camera,
    gl,
    groundPlane,
    raycaster,
    selectedObject,
    snapGrid,
    yardMgr,
    cctvMgr,
    bldMgr,
    roadMgr,
  ]);

  if (!selectedObject) {
    return null;
  }

  // Fences are free-form linear entities (Point A to Point B).
  // They use specialized endpoint manipulators and line drag pads in InteractiveFences.tsx
  // to avoid rigid rectangular box bounding gizmos.
  if (selectedObject.category === "fence") {
    return null;
  }

  const { position, rotation, dimensions, name, category } = selectedObject;
  const width = dimensions?.width || 6;
  const length = dimensions?.length || 6;
  const height = dimensions?.height || 2;
  const rotRad = (rotation * Math.PI) / 180;

  const isEditMode = mode === "edit";
  const ringColor = isEditMode ? "#0284C7" : "#F59E0B";

  return (
    <group position={[position.x, 0, position.z]} rotation={[0, -rotRad, 0]}>
      {/* 1. Ground Selection Ring & Drag Hit Area */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.09, 0]}
        onPointerDown={(e) => {
          if (!isEditMode) return;
          e.stopPropagation();
          isDragging.current = true;
          startDragPos.current = { x: position.x, z: position.z };
          dragOffset.current = {
            x: e.point.x - position.x,
            z: e.point.z - position.z,
          };
          if (cameraApi.current) cameraApi.current.enabled = false;
          document.body.style.cursor = "grabbing";
        }}
        onPointerOver={() => {
          if (isEditMode) document.body.style.cursor = "grab";
        }}
        onPointerOut={() => {
          if (!isDragging.current) document.body.style.cursor = "";
        }}
      >
        <planeGeometry args={[width + 3, length + 3]} />
        <meshBasicMaterial
          color={ringColor}
          transparent
          opacity={isEditMode ? 0.35 : 0.2}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Perimeter Line Border */}
      <group position={[0, 0.11, 0]}>
        {[
          [0, length / 2 + 1.2, width + 2.8, 0.3],
          [0, -length / 2 - 1.2, width + 2.8, 0.3],
          [width / 2 + 1.2, 0, 0.3, length + 2.8],
          [-width / 2 - 1.2, 0, 0.3, length + 2.8],
        ].map(([bx, bz, bw, bd], i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[bx, 0, bz]}>
            <planeGeometry args={[bw, bd]} />
            <meshBasicMaterial color={ringColor} depthWrite={false} />
          </mesh>
        ))}
      </group>

      {/* 3. 4 Corner Handles */}
      {[
        [-width / 2 - 1.2, -length / 2 - 1.2],
        [width / 2 + 1.2, -length / 2 - 1.2],
        [-width / 2 - 1.2, length / 2 + 1.2],
        [width / 2 + 1.2, length / 2 + 1.2],
      ].map(([cx, cz], i) => (
        <group key={`corner-${i}`} position={[cx, 0.13, cz]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.8, 1.8]} />
            <meshBasicMaterial color={ringColor} depthWrite={false} />
          </mesh>
        </group>
      ))}

      {/* 4. Directional Front Facing Marker */}
      <group position={[0, 0.14, -length / 2 - 2.8]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[1.2, 2.5, 3]} />
          <meshBasicMaterial color={ringColor} depthWrite={false} />
        </mesh>
      </group>

      {/* 5. Clash of Clans Floating Overhead 3D Action Strip */}
      <group position={[0, Math.max(height + 2.8, 6), 0]}>
        {/* Overhead Name Plate */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[16, 2.8]} />
          <meshBasicMaterial color="#0F172A" transparent opacity={0.92} depthWrite={false} />
        </mesh>

        <Text
          font={FONT_URL}
          fontSize={0.95}
          color="#FFFFFF"
          position={[0, 0.45, 0.05]}
          anchorX="center"
          anchorY="middle"
        >
          {name.toUpperCase()}
        </Text>

        <Text
          font={FONT_URL}
          fontSize={0.65}
          color="#38BDF8"
          position={[0, -0.55, 0.05]}
          anchorX="center"
          anchorY="middle"
        >
          {isEditMode
            ? `[${position.x.toFixed(1)}, ${position.z.toFixed(1)}] · ${rotation}° · Drag to Move`
            : `Selected · Switch to Edit Mode to Move`}
        </Text>

        {/* 3D Action Buttons in Edit Mode */}
        {isEditMode && (
          <group position={[0, 2.4, 0]}>
            {/* Quick Rotate -45 button */}
            <group
              position={[-4.5, 0, 0]}
              onClick={(e) => {
                e.stopPropagation();
                rotateObject(-45);
              }}
            >
              <mesh>
                <planeGeometry args={[2.5, 1.6]} />
                <meshBasicMaterial color="#1E293B" />
              </mesh>
              <Text
                font={FONT_URL}
                fontSize={0.65}
                color="#E2E8F0"
                position={[0, 0, 0.05]}
                anchorX="center"
                anchorY="middle"
              >
                -45°
              </Text>
            </group>

            {/* Quick Rotate +45 button */}
            <group
              position={[-1.5, 0, 0]}
              onClick={(e) => {
                e.stopPropagation();
                rotateObject(45);
              }}
            >
              <mesh>
                <planeGeometry args={[2.5, 1.6]} />
                <meshBasicMaterial color="#1E293B" />
              </mesh>
              <Text
                font={FONT_URL}
                fontSize={0.65}
                color="#E2E8F0"
                position={[0, 0, 0.05]}
                anchorX="center"
                anchorY="middle"
              >
                +45°
              </Text>
            </group>

            {/* Duplicate button */}
            <group
              position={[1.5, 0, 0]}
              onClick={(e) => {
                e.stopPropagation();
                duplicateSelected();
              }}
            >
              <mesh>
                <planeGeometry args={[2.8, 1.6]} />
                <meshBasicMaterial color="#0369A1" />
              </mesh>
              <Text
                font={FONT_URL}
                fontSize={0.62}
                color="#FFFFFF"
                position={[0, 0, 0.05]}
                anchorX="center"
                anchorY="middle"
              >
                Duplicate
              </Text>
            </group>

            {/* Close / Done button */}
            <group
              position={[4.5, 0, 0]}
              onClick={(e) => {
                e.stopPropagation();
                selectObject(null);
              }}
            >
              <mesh>
                <planeGeometry args={[2.4, 1.6]} />
                <meshBasicMaterial color="#334155" />
              </mesh>
              <Text
                font={FONT_URL}
                fontSize={0.65}
                color="#FFFFFF"
                position={[0, 0, 0.05]}
                anchorX="center"
                anchorY="middle"
              >
                Done
              </Text>
            </group>
          </group>
        )}
      </group>
    </group>
  );
});

