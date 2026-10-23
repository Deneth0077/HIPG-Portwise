/**
 * Hambantota International Port (HIPG), Sri Lanka - Port Layout Data Model
 *
 * Primary reference: HIPG official yard layout diagram (2024.09).
 * NOTE: Phase 1 establishes the data model and metadata contract only.
 * Coordinates are PROVISIONAL and marked for calibration in subsequent phases.
 * Scale convention: 1 scene unit = 3.0 meters (M_PER_UNIT = 3).
 */

import type { YardBlock, BlockCategory } from "./types";

// ============================================================================
// 1. HIPG PORT METADATA CONSTANTS
// ============================================================================

export const HIPG_PORT_NAME = "Hambantota International Port";
export const HIPG_PORT_SHORT = "HIPG";
export const HIPG_PORT_CITY = "Hambantota · Sri Lanka";
export const HIPG_COUNTRY = "Sri Lanka";
export const HIPG_CARRIER_NAME = "HIPG Terminal Services";

/** Total berths documented in the 2024.09 official layout (11 numbered berths + 1 Service Berth). */
export const HIPG_BERTH_COUNT = 12;

/** Total quay front length across all 12 berths in meters. */
export const HIPG_TOTAL_QUAY_LENGTH_METERS = 2951.7;

// ============================================================================
// 2. BERTH DEFINITIONS (EXACT LENGTHS FROM HIPG REFERENCE)
// ============================================================================

export type HipgBerthId =
  | "B01"
  | "SERVICE"
  | "B02"
  | "B03"
  | "B04"
  | "B05"
  | "B06"
  | "B07"
  | "B08"
  | "B09"
  | "B10"
  | "B11";

export type HipgBerthType =
  | "container"      // Berths 01, 02 (STS Cranes on rails)
  | "service"        // Service Berth (105m, adjacent to CY01)
  | "corner"         // Berth 03 (208m angled transitional quay)
  | "multipurpose"   // Berths 04, 05, 06 (Portal/Jib cranes, RoRo ramps)
  | "roro"           // Berth 07 (Dedicated RoRo ramp berth)
  | "basin_general"; // Berths 08, 09, 10, 11 (General cargo, Bulk, RoRo alternative)

export interface HipgBerthDef {
  id: HipgBerthId;
  berthNumber: number; // 1-11, 0 for Service Berth
  name: string;
  lengthMeters: number; // Exact length specified on the reference diagram
  berthType: HipgBerthType;
  primaryQuayFacing: "east" | "northeast" | "north" | "south";
  equipmentNotes: string;
  hasRamp?: boolean;
  /**
   * PROVISIONAL local scene coordinates [x, z].
   * Subject to calibration in Phase 2 during terrain/water modeling.
   */
  provisionalCoordinates: {
    start: [number, number];
    end: [number, number];
  };
}

/**
 * All 12 berths at HIPG with exact lengths from the 2024.09 layout.
 * Total length = 300 + 105 + 300 + 208 + 287.2 + 245 + 208 + 230 + 230 + 279.5 + 279.5 + 279.5 = 2951.7m
 */
export const HIPG_BERTHS: HipgBerthDef[] = [
  {
    id: "SERVICE",
    berthNumber: 0,
    name: "Service Berth",
    lengthMeters: 105.0,
    berthType: "service",
    primaryQuayFacing: "east",
    equipmentNotes: "Service berth adjacent to CY01 alternative yard",
    provisionalCoordinates: {
      start: [155.76, 232.36],
      end: [155.76, 267.36],
    },
  },
  {
    id: "B01",
    berthNumber: 1,
    name: "Berth 01",
    lengthMeters: 300.0,
    berthType: "container",
    primaryQuayFacing: "east",
    equipmentNotes: "Container berth with 3 STS quay cranes alongside",
    provisionalCoordinates: {
      start: [155.76, 132.36],
      end: [155.76, 232.36],
    },
  },
  {
    id: "B02",
    berthNumber: 2,
    name: "Berth 02",
    lengthMeters: 300.0,
    berthType: "container",
    primaryQuayFacing: "east",
    equipmentNotes: "Container berth with 2-3 STS quay cranes alongside",
    provisionalCoordinates: {
      start: [155.76, 32.36],
      end: [155.76, 132.36],
    },
  },
  {
    id: "B03",
    berthNumber: 3,
    name: "Berth 03",
    lengthMeters: 208.0,
    berthType: "corner",
    primaryQuayFacing: "northeast",
    equipmentNotes: "Angled transitional quay between Eastern and Southern basin quays",
    provisionalCoordinates: {
      start: [106.73, -16.67],
      end: [155.76, 32.36],
    },
  },
  {
    id: "B04",
    berthNumber: 4,
    name: "Berth 04",
    lengthMeters: 287.2,
    berthType: "multipurpose",
    primaryQuayFacing: "north",
    equipmentNotes: "Multipurpose/RoRo with 4W alternative yard and ramp",
    hasRamp: true,
    provisionalCoordinates: {
      start: [11.0, -16.67],
      end: [106.73, -16.67],
    },
  },
  {
    id: "B05",
    berthNumber: 5,
    name: "Berth 05",
    lengthMeters: 245.0,
    berthType: "multipurpose",
    primaryQuayFacing: "north",
    equipmentNotes: "Multipurpose berth with 5W alternative yard, two portal/jib cranes, and ramp",
    hasRamp: true,
    provisionalCoordinates: {
      start: [-70.67, -16.67],
      end: [11.0, -16.67],
    },
  },
  {
    id: "B06",
    berthNumber: 6,
    name: "Berth 06",
    lengthMeters: 306.0,
    berthType: "multipurpose",
    primaryQuayFacing: "north",
    equipmentNotes: "Western quayside of Southern basin with portal cranes/bollards (306m)",
    provisionalCoordinates: {
      start: [-140.0, -16.67],
      end: [-70.67, -16.67],
    },
  },
  {
    id: "B07",
    berthNumber: 7,
    name: "Berth 07",
    lengthMeters: 230.0,
    berthType: "roro",
    primaryQuayFacing: "east",
    equipmentNotes: "Dedicated RoRo ramp berth with vehicle boarding bridge",
    hasRamp: true,
    provisionalCoordinates: {
      start: [-140.0, -93.33],
      end: [-140.0, -16.67],
    },
  },
  {
    id: "B08",
    berthNumber: 8,
    name: "Berth 08",
    lengthMeters: 230.0,
    berthType: "basin_general",
    primaryQuayFacing: "east",
    equipmentNotes: "Western basin quay for general cargo and RoRo",
    provisionalCoordinates: {
      start: [-140.0, -170.0],
      end: [-140.0, -93.33],
    },
  },
  {
    id: "B09",
    berthNumber: 9,
    name: "Berth 09",
    lengthMeters: 279.5,
    berthType: "basin_general",
    primaryQuayFacing: "south",
    equipmentNotes: "Northern basin quay with 09W alternative RoRo yard",
    provisionalCoordinates: {
      start: [-140.0, -170.0],
      end: [-46.83, -170.0],
    },
  },
  {
    id: "B10",
    berthNumber: 10,
    name: "Berth 10",
    lengthMeters: 279.5,
    berthType: "basin_general",
    primaryQuayFacing: "south",
    equipmentNotes: "Northern basin quay with 10W alternative RoRo yard",
    provisionalCoordinates: {
      start: [-46.83, -170.0],
      end: [46.34, -170.0],
    },
  },
  {
    id: "B11",
    berthNumber: 11,
    name: "Berth 11",
    lengthMeters: 279.5,
    berthType: "basin_general",
    primaryQuayFacing: "south",
    equipmentNotes: "Northern basin quay with 11W alternative RoRo yard",
    provisionalCoordinates: {
      start: [46.34, -170.0],
      end: [139.51, -170.0],
    },
  },
];

// ============================================================================
// 3. YARD ZONE CATEGORIES & COLOR SYSTEM
// ============================================================================

export type HipgYardCategory =
  | "container"     // Container stacking area (Blue)
  | "roro"          // RORO cargo parking area (Patterned Beige)
  | "roro_alt"      // Alternative Yard area for RORO (Yellowish Tan)
  | "customs"       // Customs Inspection Yard (Orange/Brown Striped)
  | "dual_purpose"; // Dual Purpose Yard (RORO/Container) (Light Green)

export interface HipgCategoryMeta {
  category: HipgYardCategory;
  label: string;
  colorHex: string;
  description: string;
}

export const HIPG_CATEGORY_META: Record<HipgYardCategory, HipgCategoryMeta> = {
  container: {
    category: "container",
    label: "Container Stacking Area",
    colorHex: "#9AC8E2", // Light blue from map legend
    description: "Dedicated container stacking blocks with RTG lanes and reefer points",
  },
  roro: {
    category: "roro",
    label: "RORO Cargo Parking Area",
    colorHex: "#EBDCCB", // Light brown/beige pattern from map legend
    description: "Designated surface parking area for imported and transshipment vehicles",
  },
  roro_alt: {
    category: "roro_alt",
    label: "Alternative Yard Area for RORO",
    colorHex: "#F2E2A8", // Yellowish tan from map legend
    description: "Flexible apron and buffer zones utilized for high-volume RoRo discharge",
  },
  customs: {
    category: "customs",
    label: "Customs Inspection Yard",
    colorHex: "#D9822B", // Orange/brown striped from map legend
    description: "Sri Lanka Customs inspection yards, IMDG hazmat bays, and MTV inspection",
  },
  dual_purpose: {
    category: "dual_purpose",
    label: "Dual Purpose Yard (RORO/Container)",
    colorHex: "#A3D991", // Light green from map legend
    description: "Multi-modal yard surface configurable for either RoRo parking or container stacks",
  },
};

// ============================================================================
// 4. HIPG YARD BLOCKS (ALL LABELED ZONES FROM REFERENCE)
// ============================================================================

export interface HipgYardBlockDef {
  id: string;
  label: string;
  category: HipgYardCategory;
  description?: string;
  hasReefer?: boolean;
  hasImdg?: boolean;
  isMTV?: boolean;
  /**
   * PROVISIONAL local scene coordinates [x, z].
   * Subject to calibration in Phase 3 during 3D yard mesh placement.
   */
  provisionalPosition: {
    x: number;
    z: number;
    approxWidth?: number;
    approxDepth?: number;
  };
}

export const HIPG_YARD_BLOCKS: HipgYardBlockDef[] = [
  // --------------------------------------------------------------------------
  // A. RoRo Cargo Parking Areas (11 Blocks)
  // --------------------------------------------------------------------------
  { id: "04A", label: "04A", category: "roro", description: "RoRo parking block 04A (Northern yard tier)", provisionalPosition: { x: -116, z: 35, approxWidth: 68, approxDepth: 32 } },
  { id: "03A", label: "03A", category: "roro", description: "RoRo parking block 03A (Northern yard tier)", provisionalPosition: { x: -44, z: 35, approxWidth: 68, approxDepth: 32 } },
  { id: "02A", label: "02A", category: "roro", description: "RoRo parking block 02A (Northern yard tier)", provisionalPosition: { x: 28, z: 35, approxWidth: 68, approxDepth: 32 } },
  { id: "01A", label: "01A", category: "roro", description: "RoRo parking block 01A (Berth 04/03 corner)", provisionalPosition: { x: 96, z: 32, approxWidth: 60, approxDepth: 28 } },
  { id: "02C", label: "02C", category: "roro", description: "RoRo parking block 02C (Central southern tier)", provisionalPosition: { x: 28, z: 126, approxWidth: 68, approxDepth: 26 } },
  { id: "02D", label: "02D", category: "roro", description: "RoRo parking block 02D (Central southern tier)", provisionalPosition: { x: 28, z: 158, approxWidth: 68, approxDepth: 26 } },
  { id: "01C", label: "01C", category: "roro", description: "RoRo parking block 01C (Eastern tier facing quays)", provisionalPosition: { x: 96, z: 120, approxWidth: 60, approxDepth: 20 } },
  { id: "01D", label: "01D", category: "roro", description: "RoRo parking block 01D (Eastern tier facing quays)", provisionalPosition: { x: 96, z: 144, approxWidth: 60, approxDepth: 20 } },
  { id: "01E", label: "01E", category: "roro", description: "RoRo parking block 01E (Eastern tier facing quays)", provisionalPosition: { x: 96, z: 168, approxWidth: 60, approxDepth: 20 } },
  { id: "01F", label: "01F", category: "roro", description: "RoRo parking block 01F (Eastern tier facing quays)", provisionalPosition: { x: 96, z: 192, approxWidth: 60, approxDepth: 20 } },
  { id: "01G", label: "01G", category: "roro", description: "RoRo parking block 01G (Eastern tier facing quays)", provisionalPosition: { x: 96, z: 216, approxWidth: 60, approxDepth: 20 } },

  // --------------------------------------------------------------------------
  // B. Alternative Yard Area for RoRo (7 Areas)
  // --------------------------------------------------------------------------
  { id: "09W", label: "09W", category: "roro_alt", description: "Alternative RoRo yard at Berth 09 apron", provisionalPosition: { x: -90, z: -185, approxWidth: 88, approxDepth: 20 } },
  { id: "10W", label: "10W", category: "roro_alt", description: "Alternative RoRo yard at Berth 10 apron", provisionalPosition: { x: 0, z: -185, approxWidth: 88, approxDepth: 20 } },
  { id: "11W", label: "11W", category: "roro_alt", description: "Alternative RoRo yard at Berth 11 apron", provisionalPosition: { x: 90, z: -185, approxWidth: 88, approxDepth: 20 } },
  { id: "5W", label: "5W", category: "roro_alt", description: "Alternative RoRo yard at Berth 05 apron with ramps", provisionalPosition: { x: -27, z: 3, approxWidth: 70, approxDepth: 14 } },
  { id: "4W", label: "4W", category: "roro_alt", description: "Alternative RoRo yard at Berth 04 apron with ramps", provisionalPosition: { x: 48, z: 3, approxWidth: 80, approxDepth: 14 } },
  { id: "03A-04A", label: "03A-04A", category: "roro_alt", description: "Alternative RoRo connector strip between 03A and 04A", provisionalPosition: { x: -80, z: 35, approxWidth: 8, approxDepth: 32 } },
  { id: "CY01", label: "CY01", category: "roro_alt", description: "Alternative RoRo area adjacent to Service Berth", provisionalPosition: { x: 112, z: 246, approxWidth: 26, approxDepth: 20 } },

  // --------------------------------------------------------------------------
  // C. Container Stacking Areas (13 Blocks)
  // --------------------------------------------------------------------------
  { id: "H01", label: "H01", category: "container", description: "Container block H01 (Central spine, LDN)", provisionalPosition: { x: 96, z: 60, approxWidth: 60, approxDepth: 10 } },
  { id: "H02", label: "H02", category: "container", description: "Container block H02 (Central spine, LDN)", provisionalPosition: { x: 96, z: 72, approxWidth: 60, approxDepth: 10 } },
  { id: "L01", label: "L01", category: "container", description: "Container block L01 (Central spine, LDN)", provisionalPosition: { x: 96, z: 84, approxWidth: 60, approxDepth: 10 } },
  { id: "M01", label: "M01", category: "container", description: "Container block M01 (Central spine, LDN)", provisionalPosition: { x: 96, z: 96, approxWidth: 60, approxDepth: 10 } },
  { id: "L02", label: "L02", category: "container", description: "Container block L02 (Central spine, LDN)", provisionalPosition: { x: 28, z: 72, approxWidth: 68, approxDepth: 12 } },
  { id: "M02", label: "M02", category: "container", description: "Container block M02 (Central spine, LDN)", provisionalPosition: { x: 28, z: 88, approxWidth: 68, approxDepth: 12 } },
  { id: "L03", label: "L03", category: "container", description: "Container block L03 (Central spine, LDN)", provisionalPosition: { x: -44, z: 72, approxWidth: 68, approxDepth: 12 } },
  { id: "M03", label: "M03", category: "container", description: "Container block M03 (Central spine, LDN)", provisionalPosition: { x: -44, z: 88, approxWidth: 68, approxDepth: 12 } },
  { id: "L04", label: "L04", category: "container", description: "Container block L04 (Central spine, LDN)", provisionalPosition: { x: -116, z: 72, approxWidth: 68, approxDepth: 12 } },
  { id: "M04", label: "M04", category: "container", description: "Container block M04 (Central spine, DOG / MTY)", provisionalPosition: { x: -116, z: 88, approxWidth: 68, approxDepth: 12 } },
  { id: "CC0", label: "CC0", category: "container", hasReefer: true, description: "Reefer container block CC0 (North-west finger)", provisionalPosition: { x: -185, z: -212, approxWidth: 38, approxDepth: 14 } },
  { id: "C09", label: "C09", category: "container", hasReefer: true, description: "Reefer container block C09 (North-west finger)", provisionalPosition: { x: -185, z: -196, approxWidth: 38, approxDepth: 14 } },
  { id: "A01", label: "A01", category: "container", description: "Container block A01 (Western sector)", provisionalPosition: { x: -160, z: -52, approxWidth: 10, approxDepth: 18 } },

  // --------------------------------------------------------------------------
  // D. Customs Inspection Yards (6 Areas)
  // --------------------------------------------------------------------------
  { id: "A06", label: "A06", category: "customs", isMTV: true, description: "Customs Inspection Yard A06 (MTV)", provisionalPosition: { x: -210, z: -52, approxWidth: 10, approxDepth: 18 } },
  { id: "A05", label: "A05", category: "customs", description: "Customs Inspection Yard A05", provisionalPosition: { x: -200, z: -52, approxWidth: 10, approxDepth: 18 } },
  { id: "A04", label: "A04", category: "customs", description: "Customs Inspection Yard A04", provisionalPosition: { x: -190, z: -52, approxWidth: 10, approxDepth: 18 } },
  { id: "A03", label: "A03", category: "customs", hasImdg: true, description: "Customs Inspection Yard A03 (IMDG dangerous goods)", provisionalPosition: { x: -180, z: -52, approxWidth: 10, approxDepth: 18 } },
  { id: "A02", label: "A02", category: "customs", hasImdg: true, description: "Customs Inspection Yard A02 (IMDG dangerous goods)", provisionalPosition: { x: -170, z: -52, approxWidth: 10, approxDepth: 18 } },
  { id: "NEW_CUSTOMS", label: "New Customs Yard", category: "customs", description: "New Customs Inspection Yard (Near Gate 01)", provisionalPosition: { x: -130, z: 185, approxWidth: 60, approxDepth: 74 } },

  // --------------------------------------------------------------------------
  // E. Dual Purpose Yard (RoRo / Container) (16 Blocks)
  // --------------------------------------------------------------------------
  { id: "KD1", label: "KD1", category: "dual_purpose", description: "Dual Purpose yard KD1 (Northern tip)", provisionalPosition: { x: -185, z: -230, approxWidth: 36, approxDepth: 14 } },
  { id: "C08", label: "C08", category: "dual_purpose", description: "Dual Purpose yard block C08", provisionalPosition: { x: -185, z: -180, approxWidth: 36, approxDepth: 8 } },
  { id: "C07", label: "C07", category: "dual_purpose", description: "Dual Purpose yard block C07", provisionalPosition: { x: -185, z: -168, approxWidth: 36, approxDepth: 8 } },
  { id: "C06", label: "C06", category: "dual_purpose", description: "Dual Purpose yard block C06", provisionalPosition: { x: -185, z: -156, approxWidth: 36, approxDepth: 8 } },
  { id: "C05", label: "C05", category: "dual_purpose", description: "Dual Purpose yard block C05", provisionalPosition: { x: -185, z: -144, approxWidth: 36, approxDepth: 8 } },
  { id: "C04", label: "C04", category: "dual_purpose", description: "Dual Purpose yard block C04", provisionalPosition: { x: -185, z: -132, approxWidth: 36, approxDepth: 8 } },
  { id: "C03", label: "C03", category: "dual_purpose", description: "Dual Purpose yard block C03", provisionalPosition: { x: -185, z: -120, approxWidth: 36, approxDepth: 8 } },
  { id: "C02", label: "C02", category: "dual_purpose", description: "Dual Purpose yard block C02", provisionalPosition: { x: -185, z: -108, approxWidth: 36, approxDepth: 8 } },
  { id: "C01", label: "C01", category: "dual_purpose", description: "Dual Purpose yard block C01", provisionalPosition: { x: -185, z: -96, approxWidth: 36, approxDepth: 8 } },
  { id: "B06", label: "B06", category: "dual_purpose", description: "Dual Purpose yard block B06", provisionalPosition: { x: -210, z: -76, approxWidth: 8, approxDepth: 16 } },
  { id: "B05", label: "B05", category: "dual_purpose", description: "Dual Purpose yard block B05", provisionalPosition: { x: -200, z: -76, approxWidth: 8, approxDepth: 16 } },
  { id: "B04", label: "B04", category: "dual_purpose", description: "Dual Purpose yard block B04", provisionalPosition: { x: -190, z: -76, approxWidth: 8, approxDepth: 16 } },
  { id: "B03", label: "B03", category: "dual_purpose", description: "Dual Purpose yard block B03", provisionalPosition: { x: -180, z: -76, approxWidth: 8, approxDepth: 16 } },
  { id: "B02", label: "B02", category: "dual_purpose", description: "Dual Purpose yard block B02", provisionalPosition: { x: -170, z: -76, approxWidth: 8, approxDepth: 16 } },
  { id: "B01", label: "B01", category: "dual_purpose", description: "Dual Purpose yard block B01", provisionalPosition: { x: -160, z: -76, approxWidth: 8, approxDepth: 16 } },
  { id: "QMSE", label: "QMSE", category: "dual_purpose", description: "Dual Purpose yard area QMSE (Corner of 01A)", provisionalPosition: { x: 64, z: 44, approxWidth: 10, approxDepth: 10 } },
];

// ============================================================================
// 5. KEY BUILDINGS & LOGISTICS STRUCTURES
// ============================================================================

export interface HipgBuildingDef {
  id: string;
  name: string;
  type: "warehouse" | "terminal_building" | "workshop";
  provisionalPosition: {
    x: number;
    z: number;
    approxWidth: number;
    approxDepth: number;
    height: number;
  };
}

export const HIPG_BUILDINGS: HipgBuildingDef[] = [
  { id: "insee-wh", name: "Insee Warehouse", type: "warehouse", provisionalPosition: { x: -180, z: 70, approxWidth: 12, approxDepth: 45, height: 10 } },
  { id: "hipl-wh", name: "HIPL Warehouse", type: "warehouse", provisionalPosition: { x: -165, z: 70, approxWidth: 12, approxDepth: 45, height: 10 } },
  { id: "by1", name: "BY1", type: "terminal_building", provisionalPosition: { x: -188, z: -60, approxWidth: 8, approxDepth: 40, height: 7 } },
  { id: "by2", name: "BY2", type: "terminal_building", provisionalPosition: { x: -188, z: -140, approxWidth: 8, approxDepth: 50, height: 7 } },
  { id: "by3", name: "BY3", type: "terminal_building", provisionalPosition: { x: -160, z: -235, approxWidth: 40, approxDepth: 8, height: 8 } },
  { id: "by4", name: "BY4", type: "terminal_building", provisionalPosition: { x: 120, z: -280, approxWidth: 50, approxDepth: 35, height: 14 } },
];

// ============================================================================
// 6. FEEDER ROADS & TRAFFIC CIRCULATION CORRIDORS
// ============================================================================

export interface HipgFeederRoadDef {
  id: string;
  name: string;
  description: string;
  connectedZones: string[];
}

export const HIPG_FEEDER_ROADS: HipgFeederRoadDef[] = [
  {
    id: "feeder-a-b",
    name: "Feeder A-B",
    description: "Connects Customs Inspection yards (A02-A06) to Dual Purpose yards (B01-B06)",
    connectedZones: ["A01-A06", "B01-B06"],
  },
  {
    id: "feeder-b-c",
    name: "Feeder B-C",
    description: "East-west feeder connector between block lines B and C",
    connectedZones: ["B01-B06", "C01-C08"],
  },
  {
    id: "feeder-a-c",
    name: "Feeder A-C",
    description: "North-south arterial feeder running along the western terminal fence",
    connectedZones: ["BY1", "BY2", "C01-C08", "KD1"],
  },
];

// ============================================================================
// 7. COMPATIBILITY & MIGRATION HELPERS
// ============================================================================

/**
 * Maps an HIPG yard category to the legacy demo BlockCategory
 * so that any legacy UI or container filters remain strictly type-safe.
 */
export function hipgToLegacyCategory(cat: HipgYardCategory): BlockCategory {
  switch (cat) {
    case "container":
      return "import";
    case "dual_purpose":
      return "export";
    default:
      return "reefer";
  }
}

/**
 * Adapts an HIPG yard block into the existing YardBlock interface for
 * seamless backward compatibility with existing components during transition.
 */
export function toLegacyYardBlock(block: HipgYardBlockDef, index = 0): YardBlock {
  return {
    id: block.id,
    x: block.provisionalPosition.x,
    z: block.provisionalPosition.z,
    category: block.category,
    fill: 0.55 + ((index * 7) % 35) * 0.01,
    capacity: 1200,
    width: block.provisionalPosition.approxWidth,
    depth: block.provisionalPosition.approxDepth,
    label: block.label,
    hipgCategory: block.category,
  };
}

export const hipgBerthById = (id: HipgBerthId | string): HipgBerthDef | undefined =>
  HIPG_BERTHS.find((b) => b.id === id || b.name.toLowerCase() === id.toLowerCase());

export const hipgBlockById = (id: string): HipgYardBlockDef | undefined =>
  HIPG_YARD_BLOCKS.find((b) => b.id === id);

export interface HipgBerthPose {
  x: number;
  z: number;
  rotY: number;
  name: string;
}

/**
 * Computes the 3D mooring position and heading rotation for a vessel
 * or crane stationed at any HIPG berth.
 */
export function hipgBerthPose(berthNumber: number): HipgBerthPose {
  const b = HIPG_BERTHS.find((x) => x.berthNumber === berthNumber);
  if (!b) return { x: 170.26, z: 82.36, rotY: Math.PI / 2, name: "Berth" };
  const [x1, z1] = b.provisionalCoordinates.start;
  const [x2, z2] = b.provisionalCoordinates.end;
  const cx = (x1 + x2) / 2;
  const cz = (z1 + z2) / 2;

  if (b.primaryQuayFacing === "east") {
    return { x: cx + 14.5, z: cz, rotY: Math.PI / 2, name: b.name };
  } else if (b.primaryQuayFacing === "north") {
    return { x: cx, z: cz - 14.5, rotY: 0, name: b.name };
  } else if (b.primaryQuayFacing === "south") {
    return { x: cx, z: cz + 14.5, rotY: Math.PI, name: b.name };
  } else {
    // northeast (Berth 03 angled transitional quay)
    return { x: cx + 11.0, z: cz - 11.0, rotY: (3 * Math.PI) / 4, name: b.name };
  }
}

export interface HipgCranePose {
  x: number;
  z: number;
  rotY: number;
}

/**
 * Computes the 3D position and orientation of a STS / portal crane along the
 * HIPG quay apron corresponding to its berth assignment.
 */
export function hipgCranePose(craneId: string, berthNumber: number, index = 0): HipgCranePose {
  if (berthNumber === 1) {
    const offsets: Record<string, number> = { "STS-01": 168.0, "STS-07": 182.0, "STS-08": 196.0 };
    return { x: 137.5, z: offsets[craneId] ?? (168.0 + (index % 3) * 14), rotY: Math.PI / 2 };
  }
  if (berthNumber === 2) {
    const offsets: Record<string, number> = { "STS-02": 62.0, "STS-03": 85.0, "STS-04": 108.0 };
    return { x: 137.5, z: offsets[craneId] ?? (65.0 + (index % 3) * 22), rotY: Math.PI / 2 };
  }
  if (berthNumber === 3) {
    // STS-05 stationed along Berth 03 angled quay apron, facing northeast over the vessel
    return { x: 127.5, z: 11.5, rotY: (3 * Math.PI) / 4 };
  }
  if (berthNumber === 4) {
    const offsets: Record<string, number> = { "STS-06": 58.0 };
    return { x: offsets[craneId] ?? 50.0, z: 2.0, rotY: Math.PI };
  }
  if (berthNumber === 5) {
    const offsets: Record<string, number> = { "STS-07": -12.0, "STS-08": -42.0 };
    return { x: offsets[craneId] ?? -25.0, z: 3.5, rotY: Math.PI };
  }
  if (berthNumber === 6) {
    const offsets: Record<string, number> = { "STS-09": -85.0, "STS-10": -115.0 };
    return { x: offsets[craneId] ?? -100.0, z: 3.5, rotY: Math.PI };
  }
  if (berthNumber === 7) {
    const offsets: Record<string, number> = { "STS-11": -46.0, "STS-12": -72.0 };
    return { x: -158.2, z: offsets[craneId] ?? -60.0, rotY: Math.PI / 2 };
  }
  if (berthNumber === 8) {
    // Berth 08: western basin quay, cranes face east (rotY = Math.PI/2) into the basin.
    // Rail runs along x = -140. Crane sits at x = -158.2 (boom tip reaches over the water).
    const offsets: Record<string, number> = { "STS-13": -118.0, "STS-14": -144.0 };
    return { x: -158.2, z: offsets[craneId] ?? -130.0, rotY: Math.PI / 2 };
  }
  return { x: 137.5, z: 150.0, rotY: Math.PI / 2 };
}

