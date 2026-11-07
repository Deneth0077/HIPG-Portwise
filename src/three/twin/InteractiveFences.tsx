import { memo, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { fenceRepository } from "@/data/fenceRepository";
import type { FenceSegment } from "@/data/fenceTypes";
import { useInteractiveTwin } from "@/state/InteractiveTwinProvider";
import { mat, unitBox, unitCyl } from "../parts";
import { FONT_URL } from "../Terrain";
import { cameraApi } from "../CameraRig";

interface FenceLineProps {
  fence: FenceSegment;
  isSelected: boolean;
  isHovered: boolean;
}

/**
 * 3D Line-Based Security Fence Segment
 * Renders an authentic industrial port fence along a straight line vector
 * with steel posts, top rails, mesh paneling, and barbed wire.
 */
function FenceLineModel({ fence, isSelected, isHovered }: FenceLineProps) {
  const { length, height = 2.6, type, hasBarbedWire = true, hasWarningSign = true } = fence;

  const postSpacing = 3.0;
  const numLinePosts = Math.max(1, Math.floor(length / postSpacing));

  const steelColor = isSelected ? "#38BDF8" : isHovered ? "#FBBF24" : "#64748B";
  const meshColor = isSelected ? "#0284C7" : isHovered ? "#D97706" : fence.color || "#94A3B8";
  const isConcrete = type === "concrete_wall";

  return (
    <group>
      {/* 1. Main Mesh / Concrete Wall Panel along line */}
      <mesh
        geometry={unitBox}
        material={mat(meshColor, {
          rough: isConcrete ? 0.9 : 0.5,
          metal: isConcrete ? 0.05 : 0.5,
        })}
        position={[0, height / 2, 0]}
        scale={[length, height - 0.15, isConcrete ? 0.25 : 0.06]}
        castShadow
      />

      {/* 2. Top Tension Rail */}
      {!isConcrete && (
        <mesh
          geometry={unitCyl}
          material={mat(steelColor, { rough: 0.35, metal: 0.65 })}
          position={[0, height, 0]}
          rotation={[0, 0, Math.PI / 2]}
          scale={[0.07, length, 0.07]}
        />
      )}

      {/* 3. Bottom Tension Rail */}
      {!isConcrete && (
        <mesh
          geometry={unitCyl}
          material={mat(steelColor, { rough: 0.4, metal: 0.6 })}
          position={[0, 0.12, 0]}
          rotation={[0, 0, Math.PI / 2]}
          scale={[0.05, length, 0.05]}
        />
      )}

      {/* 4. Terminal End Posts (Start & End) */}
      <mesh
        geometry={unitCyl}
        material={mat(steelColor, { rough: 0.3, metal: 0.7 })}
        position={[-length / 2, (height + 0.3) / 2, 0]}
        scale={[0.2, height + 0.3, 0.2]}
        castShadow
      />
      <mesh
        geometry={unitCyl}
        material={mat(steelColor, { rough: 0.3, metal: 0.7 })}
        position={[length / 2, (height + 0.3) / 2, 0]}
        scale={[0.2, height + 0.3, 0.2]}
        castShadow
      />

      {/* Base plates for end posts */}
      <mesh
        geometry={unitBox}
        material={mat("#475569")}
        position={[-length / 2, 0.04, 0]}
        scale={[0.45, 0.08, 0.45]}
      />
      <mesh
        geometry={unitBox}
        material={mat("#475569")}
        position={[length / 2, 0.04, 0]}
        scale={[0.45, 0.08, 0.45]}
      />

      {/* 5. Intermediate Line Posts */}
      {Array.from({ length: numLinePosts - 1 }, (_, i) => {
        const xPos = -length / 2 + ((i + 1) * length) / numLinePosts;
        return (
          <group key={`post-${i}`} position={[xPos, 0, 0]}>
            <mesh
              geometry={unitCyl}
              material={mat(steelColor, { rough: 0.3, metal: 0.7 })}
              position={[0, height / 2, 0]}
              scale={[0.15, height, 0.15]}
              castShadow
            />
            {/* Top extension bracket */}
            {hasBarbedWire && (
              <mesh
                geometry={unitBox}
                material={mat("#94A3B8")}
                position={[0, height + 0.18, 0.08]}
                rotation={[0.35, 0, 0]}
                scale={[0.04, 0.38, 0.04]}
              />
            )}
          </group>
        );
      })}

      {/* 6. Top Barbed Wire Strands */}
      {hasBarbedWire && (
        <group position={[0, height + 0.2, 0.06]}>
          <mesh
            geometry={unitBox}
            material={mat("#E2E8F0", { rough: 0.2, metal: 0.9 })}
            position={[0, 0, 0]}
            scale={[length, 0.03, 0.12]}
          />
        </group>
      )}

      {/* 7. Reflective Security Warning Placard */}
      {hasWarningSign && length >= 6 && (
        <group position={[0, height * 0.65, 0.06]}>
          <mesh>
            <planeGeometry args={[2.2, 0.85]} />
            <meshBasicMaterial color="#FEF08A" />
          </mesh>
          <Text
            font={FONT_URL}
            fontSize={0.2}
            color="#78350F"
            position={[0, 0.12, 0.02]}
            anchorX="center"
            anchorY="middle"
          >
            RESTRICTED AREA
          </Text>
          <Text
            font={FONT_URL}
            fontSize={0.15}
            color="#991B1B"
            position={[0, -0.14, 0.02]}
            anchorX="center"
            anchorY="middle"
          >
            HIPG SECURITY
          </Text>
        </group>
      )}
    </group>
  );
}

export const InteractiveFences = memo(function InteractiveFences() {
  const [fences, setFences] = useState<FenceSegment[]>(() => fenceRepository.getAll());
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const {
    selectedObject,
    selectObject,
    mode,
    snapGrid,
    rotateObject,
    duplicateSelected,
    deleteSelected,
    startDrawingFenceLine,
  } = useInteractiveTwin();

  // Dragging state: either whole fence dragging or endpoint handle dragging
  const dragTarget = useRef<"center" | "start" | "end" | null>(null);
  const dragOffset = useRef<{ x: number; z: number }>({ x: 0, z: 0 });

  const { camera, gl } = useThree();
  const groundPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const intersectionPoint = useRef(new THREE.Vector3());

  // Subscribe to fence changes
  useEffect(() => {
    return fenceRepository.subscribe(() => {
      setFences(fenceRepository.getAll());
    });
  }, []);

  const isEditMode = mode === "edit";

  // Raycast ground pointer drag listener
  useEffect(() => {
    const onWindowPointerMove = (e: PointerEvent) => {
      if (!dragTarget.current || !selectedObject || selectedObject.category !== "fence") return;

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
        }

        if (dragTarget.current === "center") {
          fenceRepository.update(selectedObject.id, { x: newX, z: newZ });
        } else if (dragTarget.current === "start") {
          fenceRepository.updateEndpoint(selectedObject.id, "start", { x: newX, z: newZ });
        } else if (dragTarget.current === "end") {
          fenceRepository.updateEndpoint(selectedObject.id, "end", { x: newX, z: newZ });
        }
      }
    };

    const onWindowPointerUp = () => {
      if (dragTarget.current) {
        dragTarget.current = null;
        if (cameraApi.current) cameraApi.current.enabled = true;
        document.body.style.cursor = "";
      }
    };

    window.addEventListener("pointermove", onWindowPointerMove);
    window.addEventListener("pointerup", onWindowPointerUp);
    return () => {
      window.removeEventListener("pointermove", onWindowPointerMove);
      window.removeEventListener("pointerup", onWindowPointerUp);
    };
  }, [camera, gl, groundPlane, raycaster, selectedObject, snapGrid]);

  return (
    <group name="hipg-interactive-fences">
      {fences.map((f) => {
        const isSelected = selectedObject?.category === "fence" && selectedObject?.id === f.id;
        const isHovered = hoveredId === f.id;
        const rotRad = ((f.rotation || 0) * Math.PI) / 180;

        return (
          <group key={f.id} position={[f.x, 0, f.z]} rotation={[0, -rotRad, 0]}>
            {/* Clickable & Draggable Ground Collision Pad */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, 0.04, 0]}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredId(f.id);
                document.body.style.cursor = isEditMode ? "grab" : "pointer";
              }}
              onPointerOut={() => {
                setHoveredId((prev) => (prev === f.id ? null : prev));
                if (!dragTarget.current) {
                  document.body.style.cursor = "";
                }
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                selectObject({ id: f.id, category: "fence" });
                if (isEditMode) {
                  dragTarget.current = "center";
                  dragOffset.current = {
                    x: e.point.x - f.x,
                    z: e.point.z - f.z,
                  };
                  if (cameraApi.current) cameraApi.current.enabled = false;
                  document.body.style.cursor = "grabbing";
                }
              }}
            >
              <planeGeometry args={[f.length + 0.8, 1.6]} />
              <meshBasicMaterial
                color={isSelected ? "#0284C7" : isHovered ? "#F59E0B" : "#000000"}
                transparent
                opacity={isSelected ? 0.35 : isHovered ? 0.2 : 0}
                depthWrite={false}
              />
            </mesh>

            {/* Render 3D Line Fence Model */}
            <FenceLineModel fence={f} isSelected={isSelected} isHovered={isHovered} />

            {/* Interactive Start & End Point Handles & Overhead Action Strip when Selected in Edit Mode */}
            {isSelected && isEditMode && (
              <>
                {/* Overhead Floating Action Strip */}
                <group position={[0, (f.height || 2.6) + 2.8, 0]}>
                  {/* Name and metrics badge */}
                  <mesh position={[0, 0, 0]}>
                    <planeGeometry args={[16, 2.8]} />
                    <meshBasicMaterial color="#0F172A" transparent opacity={0.92} depthWrite={false} />
                  </mesh>

                  <Text
                    font={FONT_URL}
                    fontSize={0.9}
                    color="#FFFFFF"
                    position={[0, 0.45, 0.05]}
                    anchorX="center"
                    anchorY="middle"
                  >
                    {`${f.name.toUpperCase()} · ${f.length.toFixed(1)}M`}
                  </Text>

                  <Text
                    font={FONT_URL}
                    fontSize={0.62}
                    color="#38BDF8"
                    position={[0, -0.55, 0.05]}
                    anchorX="center"
                    anchorY="middle"
                  >
                    {`[${f.startPoint.x.toFixed(1)}, ${f.startPoint.z.toFixed(1)}] → [${f.endPoint.x.toFixed(1)}, ${f.endPoint.z.toFixed(1)}] · Drag Endpoints or Line`}
                  </Text>

                  {/* Quick Action Buttons */}
                  <group position={[0, 2.3, 0]}>
                    {/* Rotate -45 */}
                    <group
                      position={[-5.5, 0, 0]}
                      onClick={(e) => {
                        e.stopPropagation();
                        rotateObject(-45);
                      }}
                    >
                      <mesh>
                        <planeGeometry args={[2.2, 1.5]} />
                        <meshBasicMaterial color="#1E293B" />
                      </mesh>
                      <Text
                        font={FONT_URL}
                        fontSize={0.6}
                        color="#E2E8F0"
                        position={[0, 0, 0.05]}
                        anchorX="center"
                        anchorY="middle"
                      >
                        -45°
                      </Text>
                    </group>

                    {/* Rotate +45 */}
                    <group
                      position={[-3.1, 0, 0]}
                      onClick={(e) => {
                        e.stopPropagation();
                        rotateObject(45);
                      }}
                    >
                      <mesh>
                        <planeGeometry args={[2.2, 1.5]} />
                        <meshBasicMaterial color="#1E293B" />
                      </mesh>
                      <Text
                        font={FONT_URL}
                        fontSize={0.6}
                        color="#E2E8F0"
                        position={[0, 0, 0.05]}
                        anchorX="center"
                        anchorY="middle"
                      >
                        +45°
                      </Text>
                    </group>

                    {/* Continue Line Chain (+) */}
                    <group
                      position={[-0.4, 0, 0]}
                      onClick={(e) => {
                        e.stopPropagation();
                        startDrawingFenceLine(f.type, f.endPoint);
                      }}
                    >
                      <mesh>
                        <planeGeometry args={[2.8, 1.5]} />
                        <meshBasicMaterial color="#0284C7" />
                      </mesh>
                      <Text
                        font={FONT_URL}
                        fontSize={0.58}
                        color="#FFFFFF"
                        position={[0, 0, 0.05]}
                        anchorX="center"
                        anchorY="middle"
                      >
                        + Continue
                      </Text>
                    </group>

                    {/* Duplicate */}
                    <group
                      position={[2.4, 0, 0]}
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateSelected();
                      }}
                    >
                      <mesh>
                        <planeGeometry args={[2.4, 1.5]} />
                        <meshBasicMaterial color="#1E293B" />
                      </mesh>
                      <Text
                        font={FONT_URL}
                        fontSize={0.58}
                        color="#E2E8F0"
                        position={[0, 0, 0.05]}
                        anchorX="center"
                        anchorY="middle"
                      >
                        Duplicate
                      </Text>
                    </group>

                    {/* Delete */}
                    <group
                      position={[4.8, 0, 0]}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSelected();
                      }}
                    >
                      <mesh>
                        <planeGeometry args={[2.0, 1.5]} />
                        <meshBasicMaterial color="#991B1B" />
                      </mesh>
                      <Text
                        font={FONT_URL}
                        fontSize={0.58}
                        color="#FFFFFF"
                        position={[0, 0, 0.05]}
                        anchorX="center"
                        anchorY="middle"
                      >
                        Delete
                      </Text>
                    </group>

                    {/* Done */}
                    <group
                      position={[6.8, 0, 0]}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectObject(null);
                      }}
                    >
                      <mesh>
                        <planeGeometry args={[1.6, 1.5]} />
                        <meshBasicMaterial color="#059669" />
                      </mesh>
                      <Text
                        font={FONT_URL}
                        fontSize={0.65}
                        color="#FFFFFF"
                        position={[0, 0, 0.05]}
                        anchorX="center"
                        anchorY="middle"
                      >
                        ✓
                      </Text>
                    </group>
                  </group>
                </group>

                {/* Start Point Endpoint Handle (Point A) */}
                <group
                  position={[-f.length / 2, 0.3, 0]}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    dragTarget.current = "start";
                    dragOffset.current = { x: 0, z: 0 };
                    if (cameraApi.current) cameraApi.current.enabled = false;
                    document.body.style.cursor = "crosshair";
                  }}
                >
                  <mesh>
                    <sphereGeometry args={[0.55, 16, 16]} />
                    <meshBasicMaterial color="#38BDF8" />
                  </mesh>
                  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]}>
                    <ringGeometry args={[0.8, 1.2, 32]} />
                    <meshBasicMaterial color="#0284C7" side={THREE.DoubleSide} />
                  </mesh>
                  <Text
                    font={FONT_URL}
                    fontSize={0.6}
                    color="#FFFFFF"
                    position={[0, 1.1, 0]}
                    anchorX="center"
                    anchorY="middle"
                  >
                    Point A
                  </Text>
                </group>

                {/* End Point Endpoint Handle (Point B) */}
                <group
                  position={[f.length / 2, 0.3, 0]}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    dragTarget.current = "end";
                    dragOffset.current = { x: 0, z: 0 };
                    if (cameraApi.current) cameraApi.current.enabled = false;
                    document.body.style.cursor = "crosshair";
                  }}
                >
                  <mesh>
                    <sphereGeometry args={[0.55, 16, 16]} />
                    <meshBasicMaterial color="#38BDF8" />
                  </mesh>
                  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]}>
                    <ringGeometry args={[0.8, 1.2, 32]} />
                    <meshBasicMaterial color="#0284C7" side={THREE.DoubleSide} />
                  </mesh>
                  <Text
                    font={FONT_URL}
                    fontSize={0.6}
                    color="#FFFFFF"
                    position={[0, 1.1, 0]}
                    anchorX="center"
                    anchorY="middle"
                  >
                    Point B
                  </Text>
                </group>
              </>
            )}
          </group>
        );
      })}
    </group>
  );
});
