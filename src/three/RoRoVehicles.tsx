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

  // Set safe clearance from block perimeter road edges
  const marginX = 2.8;
  const marginZ = 2.8;
  const usableW = Math.max(10, w - marginX * 2);
  const usableD = Math.max(6, d - marginZ * 2);

  // If block is wider along X, rows run along X (vehicles face Z)
  // If block is deeper along Z, rows run along Z (vehicles face X)
  const isWide = usableW >= usableD;
  const isAlternativeApron = block.category === "roro_alt";
  const isCustoms = block.id === "NEW_CUSTOMS";

  let vehicleIdx = 0;

  const createVehicle = (x: number, z: number, rotY: number) => {
    vehicleIdx++;
    const rType = rand();

    let vehicleClass: VehicleClass;
    let color: string;

    const isHeavyTransporter = isAlternativeApron && rType < 0.12;
    const isCommercialUtility = isCustoms ? rType < 0.38 : rType < 0.20;

    if (isHeavyTransporter) {
      // Alternative apron heavy vehicle spots
      const isCarCarrier = rand() < 0.60;
      if (isCarCarrier) {
        vehicleClass = "transporter";
        color = pickRandom(TRANSPORTER_PAINTS, rand);
      } else {
        vehicleClass = "truck";
        color = pickRandom(TRUCK_PAINTS, rand);
      }
    } else if (isCommercialUtility) {
      // Vans, minibuses, and light commercial pickup trucks
      const utilRoll = rand();
      if (utilRoll < 0.55) {
        vehicleClass = "van";
        color = pickRandom(VAN_PAINTS, rand);
      } else if (utilRoll < 0.78) {
        vehicleClass = "pickup";
        color = pickRandom(PICKUP_PAINTS, rand);
      } else {
        vehicleClass = "minibus";
        color = pickRandom(VAN_PAINTS, rand);
      }
    } else {
      // Passenger cars: compacts, sedans, luxury sedans, and SUVs
      const carRoll = rand();
      if (carRoll < 0.36) {
        vehicleClass = "sedan";
        color = pickRandom(SEDAN_PAINTS, rand);
      } else if (carRoll < 0.60) {
        vehicleClass = "compact";
        color = pickRandom(COMPACT_PAINTS, rand);
      } else if (carRoll < 0.80) {
        vehicleClass = "suv";
        color = pickRandom(SUV_PAINTS, rand);
      } else {
        vehicleClass = "luxury_sedan";
        color = pickRandom(LUXURY_PAINTS, rand);
      }
    }

    vehicles.push({
      id: `${block.id}-${vehicleIdx}`,
      vehicleClass,
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

import { useYardManagement } from "@/state/YardManagementProvider";

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
      {/* 1. RoRo Asphalt Parking Pads with Boundary Demarcations */}
      {roroBlocks.map((b) => {
        const w = b.provisionalPosition.approxWidth ?? 50;
        const d = b.provisionalPosition.approxDepth ?? 25;
        const isAlt = b.category === "roro_alt";
        const isCustoms = b.id === "NEW_CUSTOMS";
        const padColor = isCustoms ? "#2B313A" : isAlt ? "#262C34" : "#1F242C";

        return (
          <group
            key={`pad-${b.id}`}
            position={[b.provisionalPosition.x, 0.011, b.provisionalPosition.z]}
          >
            {/* Dark asphalt parking pad */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[w, d]} />
              <meshStandardMaterial color={padColor} roughness={0.92} />
            </mesh>

            {/* Perimeter safety line */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
              <planeGeometry args={[w, d]} />
              <meshBasicMaterial
                color={isCustoms ? COLORS.signal : isAlt ? "#DDA15E" : "#E9C46A"}
                wireframe
              />
            </mesh>

            {/* Block Identification Text on ground */}
            <Text
              font={FONT_URL}
              fontSize={d > 25 ? 2.5 : 1.8}
              color="#A0AAB5"
              fillOpacity={0.75}
              position={[0, 0.016, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              anchorX="center"
              anchorY="middle"
            >
              {b.label}
            </Text>
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
