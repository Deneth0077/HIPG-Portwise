import { memo, useMemo } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { useRoadManagement } from "@/state/RoadManagementProvider";
import { FONT_URL } from "./Terrain";
import { unitBox } from "./parts";

interface RoadSegmentVisualProps {
  w: number;
  d: number;
  roadColor: string;
  hasMarking?: boolean;
  markingColor?: string;
  label?: string;
  isSelected?: boolean;
  isHovered?: boolean;
}

/**
 * Photorealistic 3D Industrial Port Road Model
 * Renders raised asphalt beds, concrete curbs, solid outer shoulder lines,
 * repeating dashed center dividers, and painted road stencils.
 */
function RoadSegmentModel({
  w,
  d,
  roadColor,
  hasMarking = true,
  markingColor = "#E6C844",
  label,
  isSelected = false,
  isHovered = false,
}: RoadSegmentVisualProps) {
  // Determine orientation: running along X (w >= d) or along Z (d > w)
  const isAlongX = w >= d;
  const span = isAlongX ? w : d;
  const widthAcross = isAlongX ? d : w;

  const curbW = 0.35;
  const curbH = 0.11;
  const roadH = 0.055;

  // Compute repeating center dashes for realistic dual-lane traffic
  const dashLen = 3.2;
  const dashGap = 3.2;
  const stride = dashLen + dashGap;
  const numDashes = Math.max(0, Math.floor((span - 4) / stride));

  // Determine if directional traffic arrows should be rendered
  const hasArrows = span >= 30 && widthAcross >= 6.5;

  const asphaltColor = roadColor || "#1E2229";
  const shoulderLineOffset = curbW + 0.18;

  return (
    <group>
      {/* 1. Main Raised Asphalt Road Bed */}
      <mesh position={[0, roadH / 2, 0]} receiveShadow>
        <boxGeometry args={[w, roadH, d]} />
        <meshStandardMaterial color={asphaltColor} roughness={0.88} metalness={0.06} />
      </mesh>

      {/* 2. Concrete Curbs & Shoulder Markings */}
      {isAlongX ? (
        <>
          {/* North Curb */}
          <mesh position={[0, curbH / 2, -d / 2 + curbW / 2]} receiveShadow>
            <boxGeometry args={[w, curbH, curbW]} />
            <meshStandardMaterial color="#64748B" roughness={0.92} />
          </mesh>

          {/* South Curb */}
          <mesh position={[0, curbH / 2, d / 2 - curbW / 2]} receiveShadow>
            <boxGeometry args={[w, curbH, curbW]} />
            <meshStandardMaterial color="#64748B" roughness={0.92} />
          </mesh>

          {/* Solid White Outer Shoulder Lines */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, roadH + 0.005, -d / 2 + shoulderLineOffset]}>
            <planeGeometry args={[w - 0.4, 0.18]} />
            <meshBasicMaterial color="#FFFFFF" depthWrite={false} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, roadH + 0.005, d / 2 - shoulderLineOffset]}>
            <planeGeometry args={[w - 0.4, 0.18]} />
            <meshBasicMaterial color="#FFFFFF" depthWrite={false} />
          </mesh>

          {/* Dashed Center Divider Line */}
          {hasMarking &&
            numDashes > 0 &&
            Array.from({ length: numDashes }, (_, i) => {
              const xPos = -span / 2 + 2.5 + (i + 0.5) * stride;
              return (
                <mesh key={`dash-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[xPos, roadH + 0.006, 0]}>
                  <planeGeometry args={[dashLen, 0.22]} />
                  <meshBasicMaterial color={markingColor} depthWrite={false} />
                </mesh>
              );
            })}

          {/* Directional Traffic Chevrons / Arrows for Arterial Corridors */}
          {hasArrows && (
            <>
              {/* Westbound Lane Arrow */}
              <group position={[-span * 0.25, roadH + 0.007, -widthAcross * 0.22]} rotation={[-Math.PI / 2, 0, 0]}>
                <mesh>
                  <planeGeometry args={[1.8, 0.28]} />
                  <meshBasicMaterial color="#FFFFFF" depthWrite={false} />
                </mesh>
              </group>
              {/* Eastbound Lane Arrow */}
              <group position={[span * 0.25, roadH + 0.007, widthAcross * 0.22]} rotation={[-Math.PI / 2, 0, 0]}>
                <mesh>
                  <planeGeometry args={[1.8, 0.28]} />
                  <meshBasicMaterial color="#FFFFFF" depthWrite={false} />
                </mesh>
              </group>
            </>
          )}
        </>
      ) : (
        <>
          {/* West Curb */}
          <mesh position={[-w / 2 + curbW / 2, curbH / 2, 0]} receiveShadow>
            <boxGeometry args={[curbW, curbH, d]} />
            <meshStandardMaterial color="#64748B" roughness={0.92} />
          </mesh>

          {/* East Curb */}
          <mesh position={[w / 2 - curbW / 2, curbH / 2, 0]} receiveShadow>
            <boxGeometry args={[curbW, curbH, d]} />
            <meshStandardMaterial color="#64748B" roughness={0.92} />
          </mesh>

          {/* Solid White Outer Shoulder Lines */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-w / 2 + shoulderLineOffset, roadH + 0.005, 0]}>
            <planeGeometry args={[0.18, d - 0.4]} />
            <meshBasicMaterial color="#FFFFFF" depthWrite={false} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[w / 2 - shoulderLineOffset, roadH + 0.005, 0]}>
            <planeGeometry args={[0.18, d - 0.4]} />
            <meshBasicMaterial color="#FFFFFF" depthWrite={false} />
          </mesh>

          {/* Dashed Center Divider Line */}
          {hasMarking &&
            numDashes > 0 &&
            Array.from({ length: numDashes }, (_, i) => {
              const zPos = -span / 2 + 2.5 + (i + 0.5) * stride;
              return (
                <mesh key={`dash-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, roadH + 0.006, zPos]}>
                  <planeGeometry args={[0.22, dashLen]} />
                  <meshBasicMaterial color={markingColor} depthWrite={false} />
                </mesh>
              );
            })}

          {/* Directional Traffic Chevrons / Arrows for Arterial Corridors */}
          {hasArrows && (
            <>
              {/* Northbound Lane Arrow */}
              <group position={[-widthAcross * 0.22, roadH + 0.007, -span * 0.25]} rotation={[-Math.PI / 2, 0, 0]}>
                <mesh>
                  <planeGeometry args={[0.28, 1.8]} />
                  <meshBasicMaterial color="#FFFFFF" depthWrite={false} />
                </mesh>
              </group>
              {/* Southbound Lane Arrow */}
              <group position={[widthAcross * 0.22, roadH + 0.007, span * 0.25]} rotation={[-Math.PI / 2, 0, 0]}>
                <mesh>
                  <planeGeometry args={[0.28, 1.8]} />
                  <meshBasicMaterial color="#FFFFFF" depthWrite={false} />
                </mesh>
              </group>
            </>
          )}
        </>
      )}

      {/* 3. Stencil Road Masterplan Label */}
      {label && (
        <Text
          font={FONT_URL}
          fontSize={1.8}
          color={markingColor || "#E6C844"}
          position={[0, roadH + 0.008, 0]}
          rotation={[-Math.PI / 2, 0, isAlongX ? 0 : -Math.PI / 2]}
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}

      {/* 4. Selection & Hover Transform Visualizer */}
      {(isSelected || isHovered) && (
        <group position={[0, curbH + 0.04, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[w + 0.8, d + 0.8]} />
            <meshBasicMaterial
              color={isSelected ? "#0284C7" : "#F59E0B"}
              transparent
              opacity={isSelected ? 0.35 : 0.2}
              depthWrite={false}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[w + 0.8, d + 0.8]} />
            <meshBasicMaterial color={isSelected ? "#38BDF8" : "#FBBF24"} wireframe />
          </mesh>
        </group>
      )}
    </group>
  );
}

export const InteractiveYardRoads = memo(function InteractiveYardRoads() {
  const {
    roads,
    selectedRoadId,
    selectRoad,
    isRoadEditMode,
    isPickingRoadStart,
    pickedStartPoint,
    onMapClick,
    draftPosition,
    draftDimensions,
  } = useRoadManagement();

  return (
    <group name="hipg-dynamic-yard-roads">
      {/* 1. Ground raycast plane for picking road path start & end points */}
      {isPickingRoadStart && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.16, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onMapClick({
              x: Math.round(e.point.x * 2) / 2,
              z: Math.round(e.point.z * 2) / 2,
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
          <planeGeometry args={[1600, 1600]} />
          <meshBasicMaterial color="#38BDF8" transparent opacity={0.15} depthWrite={false} />
        </mesh>
      )}

      {/* 2. Start point indicator marker if first point is clicked */}
      {isPickingRoadStart && pickedStartPoint && (
        <group position={[pickedStartPoint.x, 0.2, pickedStartPoint.z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.5, 2.5, 32]} />
            <meshBasicMaterial color="#0284C7" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 1.5, 0]}>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshStandardMaterial color="#0284C7" emissive="#0284C7" emissiveIntensity={0.6} />
          </mesh>
        </group>
      )}

      {/* 3. Render all Roads with 3D Industrial Realism & Interaction */}
      {roads.map((road) => {
        const isSelected = selectedRoadId === road.id;
        const posX = isSelected && draftPosition ? draftPosition.x : road.x;
        const posZ = isSelected && draftPosition ? draftPosition.z : road.z;
        const w = isSelected && draftDimensions ? draftDimensions.width : road.width;
        const d = isSelected && draftDimensions ? draftDimensions.depth : road.depth;
        const rotDeg = isSelected && draftDimensions ? draftDimensions.rotation : (road.rotation ?? 0);
        const rotRad = (rotDeg * Math.PI) / 180;

        return (
          <group
            key={road.id}
            position={[posX, 0.04, posZ]}
            rotation={[0, -rotRad, 0]}
            onClick={(e) => {
              if (isRoadEditMode && !isPickingRoadStart) {
                e.stopPropagation();
                selectRoad(road.id);
              }
            }}
            onPointerOver={(e) => {
              if (isRoadEditMode && !isPickingRoadStart) {
                e.stopPropagation();
                document.body.style.cursor = "pointer";
              }
            }}
            onPointerOut={(e) => {
              if (isRoadEditMode && !isPickingRoadStart) {
                document.body.style.cursor = "";
              }
            }}
          >
            <RoadSegmentModel
              w={w}
              d={d}
              roadColor={road.color || "#1E2229"}
              hasMarking={road.hasMarking ?? true}
              markingColor={road.markingColor || "#E6C844"}
              label={road.label}
              isSelected={isSelected}
            />
          </group>
        );
      })}
    </group>
  );
});
