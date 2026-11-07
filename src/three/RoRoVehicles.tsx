import { memo, useMemo } from "react";
import { HIPG_YARD_BLOCKS, type HipgYardBlockDef } from "@/data/hipgLayout";
import { mulberry32 } from "@/data/containers";
import { COLORS } from "@/data/layout";
import { Text } from "@react-three/drei";
import { FONT_URL } from "./Terrain";
import type { VehicleInstance, VehicleClass } from "./vehicles/types";
import {
  SEDAN_PAINTS,
  COMPACT_PAINTS,
  LUXURY_PAINTS,
  SUV_PAINTS,
  VAN_PAINTS,
  PICKUP_PAINTS,
  TRUCK_PAINTS,
  TRANSPORTER_PAINTS,
} from "./vehicles/types";
import { PassengerCar } from "./vehicles/PassengerCar";
import { SUV } from "./vehicles/SUV";
import { Van } from "./vehicles/Van";
import { LightCommercial } from "./vehicles/LightCommercial";
import { Truck } from "./vehicles/Truck";
import { useYardManagement } from "@/state/YardManagementProvider";

// ============================================================================
// 1. CONFIGURATION
// ============================================================================

/** Configurable RoRo occupancy ratio across the terminal */
export const RORO_CONFIG = {
  defaultOccupancy: 0.84, // 84% filled stalls on average
  customsOccupancy: 0.58, // Lower density for customs inspection / MTV bays
  apronOccupancy: 0.72,   // Buffer density for alternative quay aprons
};

// ============================================================================
// 2. PARKING MATRIX & AISLE ALGORITHM (PRESERVES EXACT STALL COORDINATES)
// ============================================================================

function pickRandom<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function generateBlockVehicles(
  block: HipgYardBlockDef,
  seed: number,
  targetOccupancy: number
): VehicleInstance[] {
  const vehicles: VehicleInstance[] = [];
  const rand = mulberry32(seed);

  const w = block.provisionalPosition.approxWidth ?? 50;
  const d = block.provisionalPosition.approxDepth ?? 25;
  const cx = block.provisionalPosition.x;
  const cz = block.provisionalPosition.z;

  // Set safe clearance from block perimeter road edges so vehicles never overflow pad edges
  const marginX = 2.4;
  const marginZ = 2.4;
  const usableW = Math.max(6, w - marginX * 2);
  const usableD = Math.max(5, d - marginZ * 2);

  // If block is wider along X, rows run along X (vehicles face Z)
  // If block is deeper along Z, rows run along Z (vehicles face X)
  const isWide = usableW >= usableD;
  const isAlternativeApron = block.category === "roro_alt";
  const isCustoms = block.id === "NEW_CUSTOMS";

  // Determine a SINGLE dedicated vehicle class and palette for this entire yard block
  // This guarantees each yard is homogeneous and neatly segregated by vehicle type
  let blockVehicleClass: VehicleClass = "sedan";
  let blockPalette: string[] = SEDAN_PAINTS;

  const bId = block.id.toUpperCase();
  if (bId.includes("CUSTOMS") || bId.startsWith("A0") || bId.startsWith("B0")) {
    blockVehicleClass = "pickup";
    blockPalette = PICKUP_PAINTS;
  } else if (bId === "04A" || bId === "11W") {
    // Dedicated SUV block
    blockVehicleClass = "suv";
    blockPalette = SUV_PAINTS;
  } else if (bId === "03A" || bId === "10W") {
    // Dedicated Passenger Sedan block
    blockVehicleClass = "sedan";
    blockPalette = SEDAN_PAINTS;
  } else if (bId === "02A" || bId === "09W") {
    // Dedicated Compact hatchback block
    blockVehicleClass = "compact";
    blockPalette = COMPACT_PAINTS;
  } else if (bId === "01A" || bId === "CY01") {
    // Dedicated Luxury Sedan block
    blockVehicleClass = "luxury_sedan";
    blockPalette = LUXURY_PAINTS;
  } else if (bId === "02C" || bId === "01C") {
    // Dedicated Commercial Delivery Van block
    blockVehicleClass = "van";
    blockPalette = VAN_PAINTS;
  } else if (bId === "02D" || bId === "01D") {
    // Dedicated Light Commercial / Pickup block
    blockVehicleClass = "pickup";
    blockPalette = PICKUP_PAINTS;
  } else if (bId === "01E") {
    // Dedicated SUV block
    blockVehicleClass = "suv";
    blockPalette = SUV_PAINTS;
  } else if (bId === "01F") {
    // Dedicated Passenger Sedan block
    blockVehicleClass = "sedan";
    blockPalette = SEDAN_PAINTS;
  } else if (bId === "01G") {
    // Dedicated Compact Car block
    blockVehicleClass = "compact";
    blockPalette = COMPACT_PAINTS;
  } else if (isAlternativeApron) {
    blockVehicleClass = "truck";
    blockPalette = TRUCK_PAINTS;
  } else {
    // Deterministic fallback based on block seed
    const classes: VehicleClass[] = ["sedan", "compact", "suv", "van", "pickup", "luxury_sedan"];
    const hash = Math.abs(seed) % classes.length;
    blockVehicleClass = classes[hash];
    blockPalette =
      blockVehicleClass === "suv"
        ? SUV_PAINTS
        : blockVehicleClass === "compact"
        ? COMPACT_PAINTS
        : blockVehicleClass === "van"
        ? VAN_PAINTS
        : blockVehicleClass === "pickup"
        ? PICKUP_PAINTS
        : blockVehicleClass === "luxury_sedan"
        ? LUXURY_PAINTS
        : SEDAN_PAINTS;
  }

  let vehicleIdx = 0;

  const createVehicle = (x: number, z: number, rotY: number) => {
    vehicleIdx++;
    const color = pickRandom(blockPalette, rand);

    vehicles.push({
      id: `${block.id}-${vehicleIdx}`,
      vehicleClass: blockVehicleClass,
      x,
      y: 0,
      z,
      rotY,
      color,
      blockId: block.id,
    });
  };

  if (isWide) {
    const colPitch = 2.2; // Width per car parking stall
    const stallLen = 4.2; // Length per car stall
    const aisleW = 4.6;   // Driving corridor between facing stalls
    const numCols = Math.floor(usableW / colPitch);

    let currentZ = cz - usableD / 2 + stallLen / 2;
    const maxZ = cz + usableD / 2 - stallLen / 2;

    while (currentZ <= maxZ) {
      // Row 1 of pair (facing +Z)
      for (let c = 0; c < numCols; c++) {
        const x = cx - usableW / 2 + (c + 0.5) * colPitch;
        const z = currentZ;

        if (rand() < targetOccupancy) {
          createVehicle(x, z, 0);
        }
      }

      // Row 2 of pair (facing -Z)
      const companionZ = currentZ + stallLen + 0.4;
      if (companionZ <= maxZ) {
        for (let c = 0; c < numCols; c++) {
          const x = cx - usableW / 2 + (c + 0.5) * colPitch;
          const z = companionZ;

          if (rand() < targetOccupancy) {
            createVehicle(x, z, Math.PI);
          }
        }
        currentZ = companionZ + stallLen / 2 + aisleW + stallLen / 2;
      } else {
        currentZ += stallLen + aisleW;
      }
    }
  } else {
    // Narrow block: rows run along Z (vehicles face X)
    const rowPitch = 2.2;
    const stallLen = 4.2;
    const aisleW = 4.6;
    const numRows = Math.floor(usableD / rowPitch);

    let currentX = cx - usableW / 2 + stallLen / 2;
    const maxX = cx + usableW / 2 - stallLen / 2;

    while (currentX <= maxX) {
      for (let rIdx = 0; rIdx < numRows; rIdx++) {
        const x = currentX;
        const z = cz - usableD / 2 + (rIdx + 0.5) * rowPitch;

        if (rand() < targetOccupancy) {
          createVehicle(x, z, Math.PI / 2);
        }
      }
      currentX += stallLen + aisleW;
    }
  }

  return vehicles;
}

// ============================================================================
// 3. MAIN EXPORTED RORO YARD COMPONENT
// ============================================================================

export const YardRoRoVehicles = memo(function YardRoRoVehicles() {
  const { yards, selectedYardId, draftPosition, draftDimensions } = useYardManagement();

  const roroBlocks = useMemo(() => {
    return yards
      .filter(
        (y) =>
          y.status !== "inactive" &&
          (y.yardType === "roro" ||
            y.capacityUnit === "slots" ||
            y.yardType === "customs" ||
            y.yardType === "dual_purpose")
      )
      .map((y) => {
        const isDraft = y.id === selectedYardId && draftPosition;
        const isDimDraft = y.id === selectedYardId && draftDimensions;
        const posX = isDraft ? draftPosition.x : y.position.x;
        const posZ = isDraft ? draftPosition.z : y.position.z;
        const w = isDimDraft ? draftDimensions.width : y.width;
        const d = isDimDraft ? draftDimensions.length : y.length;

        const def: HipgYardBlockDef = {
          id: y.id,
          label: y.code,
          category: y.yardType === "roro" ? "roro" : y.yardType === "customs" ? "customs" : "roro_alt",
          provisionalPosition: {
            x: posX,
            z: posZ,
            approxWidth: w,
            approxDepth: d,
          },
        };
        return def;
      });
  }, [yards, selectedYardId, draftPosition, draftDimensions]);

  // Generate vehicle lists for all RoRo blocks deterministically
  const allVehicles = useMemo(() => {
    const list: VehicleInstance[] = [];

    roroBlocks.forEach((block, idx) => {
      const occupancy =
        block.id === "NEW_CUSTOMS"
          ? RORO_CONFIG.customsOccupancy
          : block.category === "roro_alt"
          ? RORO_CONFIG.apronOccupancy
          : RORO_CONFIG.defaultOccupancy;

      const blockVehicles = generateBlockVehicles(block, 8107 + idx * 43, occupancy);
      list.push(...blockVehicles);
    });

    return list;
  }, [roroBlocks]);

  return (
    <group name="hipg-roro-vehicles">
      {/* 1. RoRo Asphalt Parking Bay Demarcation Lines */}
      {roroBlocks.map((b) => {
        const w = b.provisionalPosition.approxWidth ?? 50;
        const d = b.provisionalPosition.approxDepth ?? 25;
        const numStallLines = Math.min(24, Math.floor((w - 4) / 2.2));

        return (
          <group
            key={`pad-${b.id}`}
            position={[b.provisionalPosition.x, 0.065, b.provisionalPosition.z]}
          >
            {/* White parking bay divider lines */}
            {Array.from({ length: numStallLines }, (_, c) => {
              const stallX = -w / 2 + 2.4 + c * 2.2;
              return (
                <mesh key={`stall-${c}`} rotation={[-Math.PI / 2, 0, 0]} position={[stallX, 0.002, 0]}>
                  <planeGeometry args={[0.08, Math.max(4, d - 4)]} />
                  <meshBasicMaterial color="#FFFFFF" transparent opacity={0.45} depthWrite={false} />
                </mesh>
              );
            })}

            {/* Central Aisle Directional Paint */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
              <planeGeometry args={[w - 6, 0.18]} />
              <meshBasicMaterial color="#EAB308" transparent opacity={0.65} depthWrite={false} />
            </mesh>
          </group>
        );
      })}

      {/* 2. PASSENGER CARS (Sedans, Compacts/Hatchbacks, Luxury Sedans) */}
      <PassengerCar vehicles={allVehicles} />

      {/* 3. SUVS & 4X4 OFF-ROAD VEHICLES */}
      <SUV vehicles={allVehicles} />

      {/* 4. COMMERCIAL DELIVERY VANS & PASSENGER MINIBUSES */}
      <Van vehicles={allVehicles} />

      {/* 5. LIGHT COMMERCIAL PICKUP TRUCKS */}
      <LightCommercial vehicles={allVehicles} />

      {/* 6. HEAVY PORT TRACTOR UNITS & VEHICLE TRANSPORTERS */}
      <Truck vehicles={allVehicles} />
    </group>
  );
});
