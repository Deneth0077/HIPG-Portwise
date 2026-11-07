import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { Outlines, Text } from "@react-three/drei";
import { CONTAINERS, containerById, buildContainers } from "@/data/containers";
import type { BlockCategory } from "@/data/types";
import { YARD_BLOCKS, blockById } from "@/data/port";
import { BLOCK_HALF_X, BLOCK_HALF_Z, COLORS, CONTAINER_COLORS } from "@/data/layout";
import { selKey, usePort } from "@/state/PortProvider";
import { sceneRegistry, simT } from "@/sim/simStore";
import { haptic } from "@/lib/haptics";
import { Part, Selectable, mat, unitBox } from "./parts";
import { Chip3D } from "./Chip3D";
import type { ChipTone } from "./Chip3D";
import { Glow, LIGHT } from "./nightLights";
import { useYardManagement } from "@/state/YardManagementProvider";
import { cameraApi } from "./CameraRig";
import { FONT_URL } from "./Terrain";

const MUTED = new THREE.Color("#D8D2C4");

export const fillTone = (fill: number): ChipTone => (fill >= 0.85 ? "brick" : fill >= 0.6 ? "amber" : "moss");

/** All yard containers as a single instanced mesh; dynamically fits custom yard widths, lengths, and positions. */
export function YardContainers() {
  const { yardFilter, selection, hovered, setHovered, open, view } = usePort();
  const { yards, selectedYardId, draftPosition, draftDimensions } = useYardManagement();
  const ref = useRef<THREE.InstancedMesh>(null);

  // Re-generate container coordinates whenever yard blocks are resized or moved
  const activeContainers = useMemo(() => {
    // Map live yard blocks to container generation schema
    const containerBlocks = yards
      .filter((y) => y.status !== "inactive" && (y.yardType === "container" || y.capacityUnit === "teu" || y.yardType === "dual_purpose" || y.yardType === "reefer"))
      .map((y) => {
        const isSel = y.id === selectedYardId;
        const posX = isSel && draftPosition ? draftPosition.x : y.position.x;
        const posZ = isSel && draftPosition ? draftPosition.z : y.position.z;
        const w = isSel && draftDimensions ? draftDimensions.width : y.width;
        const l = isSel && draftDimensions ? draftDimensions.length : y.length;
        return {
          id: y.id,
          category: (y.yardType === "reefer" ? "reefer" : y.yardType === "dual_purpose" ? "dual_purpose" : "container") as BlockCategory,
          x: posX,
          z: posZ,
          width: w,
          depth: l,
          fill: y.totalCapacity > 0 ? y.occupiedCount / y.totalCapacity : 0.6,
        };
      });

    return buildContainers(containerBlocks);
  }, [yards, selectedYardId, draftPosition, draftDimensions]);

  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    activeContainers.forEach((c, i) => {
      o.position.set(c.x, c.y, c.z);
      o.scale.set(3.0, 1.25, 1.3);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [activeContainers]);

  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const col = new THREE.Color();
    activeContainers.forEach((c, i) => {
      const match = view !== "yard" || yardFilter === "all" || c.category === yardFilter;
      col.set(c.color);
      m.setColorAt(i, match ? col : MUTED);
    });
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [activeContainers, yardFilter, view]);

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (e.instanceId === undefined) return;
    const c = activeContainers[e.instanceId];
    if (c && selKey(hovered) !== `container:${c.id}`) setHovered({ kind: "container", id: c.id });
    document.body.style.cursor = "pointer";
  };
  const onOut = () => {
    setHovered(null);
    document.body.style.cursor = "";
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > 6 || e.instanceId === undefined) return;
    const c = activeContainers[e.instanceId];
    if (!c) return;
    haptic("selection");
    open({ kind: "container", id: c.id });
  };

  const selected = selection?.kind === "container" ? (activeContainers.find(x => x.id === selection.id) || containerById(selection.id)) : undefined;
  const hover = hovered?.kind === "container" ? (activeContainers.find(x => x.id === hovered.id) || containerById(hovered.id)) : undefined;

  return (
    <group>
      <instancedMesh ref={ref} args={[undefined, undefined, activeContainers.length]} geometry={unitBox} castShadow receiveShadow onPointerMove={onMove} onPointerOut={onOut} onClick={onClick}>
        <meshStandardMaterial roughness={0.82} />
      </instancedMesh>
      {hover && hover.id !== selected?.id ? (
        <mesh geometry={unitBox} position={[hover.x, hover.y, hover.z]} scale={[3.02, 1.27, 1.32]} raycast={() => null}>
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          <Outlines thickness={0.05} color={COLORS.signal} opacity={0.8} transparent />
        </mesh>
      ) : null}
      {selected ? <SelectedContainer x={selected.x} y={selected.y} z={selected.z} color={selected.color} /> : null}
    </group>
  );
}

function SelectedContainer({ x, y, z, color }: { x: number; y: number; z: number; color: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = y + 0.35 + Math.sin(clock.elapsedTime * 2.4) * 0.12;
  });
  return (
    <group ref={ref} position={[x, y + 0.35, z]}>
      <mesh geometry={unitBox} material={mat(color, { emissive: COLORS.signal, glow: 0.3 })} scale={[3.06, 1.3, 1.36]} castShadow raycast={() => null}>
        <Outlines thickness={0.07} color={COLORS.signal} />
      </mesh>
      <mesh position={[0, 2.2, 0]} raycast={() => null}>
        <coneGeometry args={[0.45, 0.9, 4]} />
        <meshStandardMaterial color={COLORS.signal} emissive={COLORS.signal} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

const KEY_OVERVIEW_BLOCKS = new Set([
  "04A",
  "02A",
  "01A",
  "01C",
  "02C",
  "L02",
  "L04",
  "M02",
  "H01",
  "CC0",
  "C01",
  "B01",
  "09W",
  "NEW_CUSTOMS",
]);



/** Color mapping for yard occupancy health state */
export function getYardOccupancyColor(utilization: number, status: string): string {
  if (status === "maintenance" || status === "inactive") return "#64748B";
  if (utilization >= 98 || status === "full") return "#EF4444";
  if (utilization >= 80) return "#F97316";
  if (utilization >= 60) return "#EAB308";
  return "#10B981";
}

interface IndustrialYardApronProps {
  width: number;
  length: number;
  yardType: string;
  code: string;
  capacity: number;
  capacityUnit: string;
  isSel: boolean;
  isHover: boolean;
  statusColor: string;
}

/**
 * Realistic 3D Industrial Yard Apron
 * Renders heavy-duty concrete/asphalt apron slabs, precast expansion joints,
 * hazard perimeter lines, safety steel corner bollards, and ground stencil codes.
 */
function IndustrialYardApron({
  width,
  length,
  yardType,
  code,
  capacity,
  capacityUnit,
  isSel,
  isHover,
  statusColor,
}: IndustrialYardApronProps) {
  const isRoRo = yardType === "roro";
  const isCustoms = yardType === "customs";
  const isReefer = yardType === "reefer";

  const concreteColor = isRoRo
    ? "#1E242C"
    : isReefer
    ? "#E2E8F0"
    : isCustoms
    ? "#CBD5E1"
    : "#D1D5DB";

  const padHeight = 0.06;

  // Expansion joint grid (etched grooves every 6m)
  const jointSpacing = 6.0;
  const numJointsX = Math.max(0, Math.floor(width / jointSpacing) - 1);
  const numJointsZ = Math.max(0, Math.floor(length / jointSpacing) - 1);

  // 4 Corner Safety Bollards
  const inset = 0.8;
  const bollardPositions = [
    [-width / 2 + inset, -length / 2 + inset],
    [width / 2 - inset, -length / 2 + inset],
    [-width / 2 + inset, length / 2 - inset],
    [width / 2 - inset, length / 2 - inset],
  ];

  return (
    <group>
      {/* 1. Heavy Reinforced Concrete Apron Slab with Physical Depth */}
      <mesh position={[0, padHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[width, padHeight, length]} />
        <meshStandardMaterial
          color={concreteColor}
          roughness={isRoRo ? 0.92 : 0.8}
          metalness={isRoRo ? 0.1 : 0.05}
        />
      </mesh>

      {/* 2. Concrete Slab Expansion Joint Grooves */}
      {!isRoRo && (
        <group position={[0, padHeight + 0.002, 0]}>
          {Array.from({ length: numJointsX }, (_, i) => {
            const x = -width / 2 + (i + 1) * jointSpacing;
            return (
              <mesh key={`jx-${i}`} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.06, length - 0.4]} />
                <meshBasicMaterial color="#94A3B8" depthWrite={false} />
              </mesh>
            );
          })}
          {Array.from({ length: numJointsZ }, (_, i) => {
            const z = -length / 2 + (i + 1) * jointSpacing;
            return (
              <mesh key={`jz-${i}`} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[width - 0.4, 0.06]} />
                <meshBasicMaterial color="#94A3B8" depthWrite={false} />
              </mesh>
            );
          })}
        </group>
      )}

      {/* 3. High-Visibility Hazard Safety Border */}
      <group position={[0, padHeight + 0.004, 0]}>
        {[
          [0, length / 2 - 0.18, width, 0.36],
          [0, -length / 2 + 0.18, width, 0.36],
          [width / 2 - 0.18, 0, 0.36, length],
          [-width / 2 + 0.18, 0, 0.36, length],
        ].map(([px, pz, pw, pd], i) => (
          <mesh key={`border-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[px, 0, pz]}>
            <planeGeometry args={[pw, pd]} />
            <meshBasicMaterial
              color={isSel ? "#0284C7" : isHover ? "#F59E0B" : "#EAB308"}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>

      {/* 4. Industrial Safety Corner Bollards (Yellow Steel + Reflective Collar) */}
      {bollardPositions.map(([bx, bz], i) => (
        <group key={`bollard-${i}`} position={[bx, padHeight, bz]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.16, 0.9, 16]} />
            <meshStandardMaterial color="#EAB308" roughness={0.3} metalness={0.6} />
          </mesh>
          <mesh position={[0, 0.04, 0]}>
            <boxGeometry args={[0.42, 0.08, 0.42]} />
            <meshStandardMaterial color="#334155" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.75, 0]}>
            <cylinderGeometry args={[0.165, 0.165, 0.18, 16]} />
            <meshBasicMaterial color="#F8FAFC" />
          </mesh>
        </group>
      ))}

      {/* 5. Painted Stencil Ground Identification */}
      <Text
        font={FONT_URL}
        fontSize={Math.min(1.8, Math.max(1.1, length * 0.1))}
        color={isRoRo ? "#94A3B8" : "#475569"}
        position={[-width / 2 + 2.5, padHeight + 0.006, length / 2 - 1.8]}
        rotation={[-Math.PI / 2, 0, 0]}
        anchorX="left"
        anchorY="middle"
      >
        {`▶ ${code} · ${yardType.toUpperCase()} · ${capacity} ${capacityUnit.toUpperCase()}`}
      </Text>
    </group>
  );
}

/** Configurable interactive yard blocks with dynamic dimensions, status colors, and 3D map editing */
export function YardBlocks() {
  const { selection, hovered, view, open, yardFilter } = usePort();
  const {
    yards,
    selectedYardId,
    selectYard,
    is3DEditMode,
    draftPosition,
    setDraftPosition,
    draftDimensions,
    isPickingLocation,
    onLocationPicked,
  } = useYardManagement();

  const [dragPlanePoint, setDragPlanePoint] = useState<THREE.Vector3 | null>(null);
  const dragPlaneRef = useRef<THREE.Mesh>(null);
  const isDragging = useRef(false);
  const dragOffset = useRef<{ x: number; z: number }>({ x: 0, z: 0 });

  const selectedBlockId =
    selectedYardId ||
    (selection?.kind === "block"
      ? selection.id
      : selection?.kind === "container"
      ? containerById(selection.id)?.blockId
      : undefined);

  return (
    <group name="hipg-yard-blocks">
      {/* 1. Large ground raycast plane for picking new yard locations */}
      {isPickingLocation && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.08, 0]}
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
          <planeGeometry args={[1000, 1000]} />
          <meshBasicMaterial color="#0284C7" transparent opacity={0.12} depthWrite={false} />
        </mesh>
      )}

      {/* 2. Drag plane active while dragging a yard in 3D edit mode */}
      <mesh
        ref={dragPlaneRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.1, 0]}
        visible={false}
        onPointerMove={(e) => {
          if (!isDragging.current || !selectedBlockId) return;
          e.stopPropagation();
          const newX = Math.round((e.point.x - dragOffset.current.x) * 2) / 2;
          const newZ = Math.round((e.point.z - dragOffset.current.z) * 2) / 2;
          setDraftPosition({ x: newX, z: newZ });
        }}
        onPointerUp={(e) => {
          if (isDragging.current) {
            e.stopPropagation();
            isDragging.current = false;
            if (cameraApi.current) cameraApi.current.enabled = true;
            document.body.style.cursor = "";
          }
        }}
      >
        <planeGeometry args={[2000, 2000]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* 3. Render all configured yard blocks dynamically */}
      {yards.map((b) => {
        const isSel = selectedBlockId === b.id;
        const isHover = hovered?.kind === "block" && hovered.id === b.id;
        const isKey = KEY_OVERVIEW_BLOCKS.has(b.id) || b.isCustom;
        const visibleChip =
          isSel ||
          isHover ||
          (view === "yard" &&
            (yardFilter !== "all"
              ? b.yardType === yardFilter || (b.yardType === "roro" && yardFilter === "roro")
              : isKey));

        // Use draft position/dimensions if currently being transformed in 3D
        const posX = isSel && draftPosition ? draftPosition.x : b.position.x;
        const posZ = isSel && draftPosition ? draftPosition.z : b.position.z;
        const width = isSel && draftDimensions ? draftDimensions.width : b.width;
        const length = isSel && draftDimensions ? draftDimensions.length : b.length;
        const rotationDeg = isSel && draftDimensions ? draftDimensions.rotation : b.rotation;
        const rotRad = (rotationDeg * Math.PI) / 180;

        const statusColor = getYardOccupancyColor(b.utilizationPercentage, b.status);

        return (
          <group
            key={b.id}
            position={[posX, 0, posZ]}
            rotation={[0, -rotRad, 0]}
          >
            {/* 1. Realistic 3D Industrial Yard Apron (Concrete/Asphalt slab, expansion joints, hazard borders, bollards) */}
            <IndustrialYardApron
              width={width}
              length={length}
              yardType={b.yardType}
              code={b.code}
              capacity={b.totalCapacity}
              capacityUnit={b.capacityUnit}
              isSel={isSel}
              isHover={isHover}
              statusColor={statusColor}
            />

            {/* 2. Clickable & Draggable Ground Interaction Layer */}
            <Selectable sel={{ kind: "block", id: b.id }}>
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0.08, 0]}
                onPointerDown={(e) => {
                  if (is3DEditMode && isSel) {
                    e.stopPropagation();
                    isDragging.current = true;
                    dragOffset.current = {
                      x: e.point.x - posX,
                      z: e.point.z - posZ,
                    };
                    if (cameraApi.current) cameraApi.current.enabled = false;
                    document.body.style.cursor = "grabbing";
                  }
                }}
                onClick={(e) => {
                  if (is3DEditMode) {
                    e.stopPropagation();
                    selectYard(b.id);
                  } else {
                    open({ kind: "block", id: b.id });
                  }
                }}
              >
                <planeGeometry args={[width, length]} />
                <meshBasicMaterial
                  color={statusColor}
                  transparent
                  opacity={isSel ? 0.25 : isHover ? 0.18 : 0}
                  depthWrite={false}
                />
              </mesh>
            </Selectable>

            {/* 3D Floating Chip Label */}
            {visibleChip ? (
              <Chip3D
                position={[0, 7.5, 0]}
                tone={fillTone(b.utilizationPercentage / 100)}
                active={isSel}
                onClick={() => {
                  selectYard(b.id);
                  open({ kind: "block", id: b.id });
                }}
              >
                <span className="font-mono flex items-center gap-1">
                  <span>{b.code}</span>
                  <span className="opacity-90">{Math.round(b.utilizationPercentage)}%</span>
                  {b.capacityUnit === "slots" && <span className="text-[9px] opacity-75">slots</span>}
                </span>
              </Chip3D>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}

/** Rubber-tyred gantry crane that shuttles along a yard block. */
export function YardCrane({ blockId, phase }: { blockId: string; phase: number }) {
  const block = blockById(blockId);
  const root = useRef<THREE.Group>(null);
  const trolley = useRef<THREE.Group>(null);
  const hook = useRef<THREE.Group>(null);
  const cable = useRef<THREE.Mesh>(null);
  const halfX = (block?.width ?? (BLOCK_HALF_X * 2)) / 2;
  const halfZ = (block?.depth ?? (BLOCK_HALF_Z * 2)) / 2;
  const span = halfZ + 1.2;
  const H = 7.6;
  const color = useMemo(() => [CONTAINER_COLORS.navy, CONTAINER_COLORS.moss, CONTAINER_COLORS.brick][Math.floor(phase) % 3], [phase]);

  useEffect(() => {
    const g = root.current;
    if (g) sceneRegistry.set(`rtg:${blockId}`, g);
    return () => {
      sceneRegistry.delete(`rtg:${blockId}`);
    };
  }, [blockId]);

  useFrame(() => {
    if (!block || !root.current || !trolley.current || !hook.current || !cable.current) return;
    const t = simT() * 0.12 + phase;
    root.current.position.x = block.x + Math.sin(t) * Math.max(1, halfX - 4);
    trolley.current.position.z = Math.sin(t * 2.3) * Math.max(0.5, halfZ - 1.2);
    const drop = (Math.sin(t * 5.1) * 0.5 + 0.5) * 3.2;
    hook.current.position.y = H - 1.2 - drop;
    cable.current.scale.y = drop + 0.6;
    cable.current.position.y = H - 0.6 - (drop + 0.6) / 2;
  });

  if (!block) return null;
  return (
    <group ref={root} position={[block.x, 0, block.z]}>
      {[-1.6, 1.6].map((x) =>
        [-span, span].map((z) => (
          <group key={`${x}${z}`}>
            <Part position={[x, H / 2, z]} scale={[0.5, H, 0.5]} color={COLORS.signal} />
            <Part position={[x, 0.45, z]} scale={[0.9, 0.9, 0.6]} color="#1D1F24" outline={false} />
          </group>
        )),
      )}
      {[-1.6, 1.6].map((x) => (
        <Part key={`t${x}`} position={[x, H, 0]} scale={[0.6, 0.7, span * 2 + 0.6]} color={COLORS.signal} />
      ))}
      {[-span, span].map((z) => (
        <Part key={`s${z}`} position={[0, 1.2, z]} scale={[3.8, 0.5, 0.6]} color={COLORS.signal} />
      ))}
      <Part position={[2.3, 1.6, span]} scale={[1, 1.6, 1.2]} color="#F4F1EA" />
      {[-span, span].map((z) => (
        <Glow key={`f${z}`} position={[0, H - 0.5, z]} color={LIGHT.white} size={2.2} base={0.85} />
      ))}
      <Glow position={[2.3, 2.8, span]} color={LIGHT.sodium} size={1.4} blink={1.2} phase={phase} />
      <group ref={trolley}>
        <Glow position={[0, H + 0.05, 0]} color={LIGHT.white} size={1.8} />
        <mesh geometry={unitBox} material={mat(COLORS.steelDark)} position={[0, H + 0.5, 0]} scale={[3.6, 0.5, 1.6]} castShadow />
        <mesh ref={cable} geometry={unitBox} material={mat("#3A3F47")} scale={[0.1, 1, 0.1]} />
        <group ref={hook}>
          <mesh geometry={unitBox} material={mat(COLORS.amber)} scale={[3.1, 0.25, 1.3]} castShadow />
          <mesh geometry={unitBox} material={mat(color)} position={[0, -0.75, 0]} scale={[3.0, 1.25, 1.26]} castShadow />
        </group>
      </group>
    </group>
  );
}
