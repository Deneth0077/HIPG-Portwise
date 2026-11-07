/**
 * Clash of Clans-Style Infrastructure Build Catalog for HIPG Digital Twin
 *
 * Categorized catalog of all port infrastructure available to instantiate,
 * place, rotate, and manage in 3D.
 */

export type InfrastructureCategory =
  | "roro"
  | "container"
  | "cctv"
  | "buildings"
  | "gates"
  | "roads"
  | "utilities"
  | "fences";

export interface InfrastructureCatalogItem {
  id: string;
  name: string;
  category: InfrastructureCategory;
  subType: string;
  description: string;
  width: number;
  length: number;
  height: number;
  accentColor: string;
  capacity?: number;
  capacityUnit?: "slots" | "teu" | "cameras" | "lanes" | "mw";
  defaultProperties: Record<string, any>;
}

export const INFRASTRUCTURE_CATEGORIES: Array<{
  id: InfrastructureCategory;
  name: string;
  shortLabel: string;
  iconName: string;
}> = [
  { id: "roro", name: "RoRo Vehicle Yards", shortLabel: "RoRo", iconName: "Car" },
  { id: "container", name: "Container Yards", shortLabel: "Container", iconName: "Box" },
  { id: "cctv", name: "CCTV Surveillance", shortLabel: "CCTV", iconName: "Video" },
  { id: "buildings", name: "Buildings & Warehouses", shortLabel: "Buildings", iconName: "Building2" },
  { id: "gates", name: "Gates & Checkpoints", shortLabel: "Gates", iconName: "ShieldCheck" },
  { id: "roads", name: "Corridors & Roads", shortLabel: "Roads", iconName: "Route" },
  { id: "utilities", name: "Utilities & Power", shortLabel: "Utilities", iconName: "Zap" },
  { id: "fences", name: "3D Security Fences & Walls", shortLabel: "3D Fences", iconName: "Shield" },
];

export const INFRASTRUCTURE_CATALOG: InfrastructureCatalogItem[] = [
  // 1. RoRo Yards
  {
    id: "roro-standard-staging",
    name: "RoRo Vehicle Staging Area",
    category: "roro",
    subType: "roro",
    description: "Standard paved staging block for imported and transshipment automobiles.",
    width: 40,
    length: 22,
    height: 0.2,
    accentColor: "#EAB308",
    capacity: 60,
    capacityUnit: "slots",
    defaultProperties: {
      yardType: "roro",
      capacityUnit: "slots",
      totalCapacity: 60,
      occupiedCount: 15,
    },
  },
  {
    id: "roro-heavy-machinery",
    name: "Heavy Machinery & EV Yard",
    category: "roro",
    subType: "roro",
    description: "Heavy-axle load reinforced yard for commercial trucks, buses, and heavy machinery.",
    width: 50,
    length: 26,
    height: 0.2,
    accentColor: "#F97316",
    capacity: 40,
    capacityUnit: "slots",
    defaultProperties: {
      yardType: "roro",
      capacityUnit: "slots",
      totalCapacity: 40,
      occupiedCount: 8,
    },
  },
  {
    id: "roro-high-density",
    name: "High-Capacity Auto Logistics Yard",
    category: "roro",
    subType: "roro",
    description: "Expansive high-volume automobile storage zone with dedicated circulation lanes.",
    width: 60,
    length: 32,
    height: 0.2,
    accentColor: "#3B82F6",
    capacity: 120,
    capacityUnit: "slots",
    defaultProperties: {
      yardType: "roro",
      capacityUnit: "slots",
      totalCapacity: 120,
      occupiedCount: 42,
    },
  },

  // 2. Container Yards
  {
    id: "container-block-standard",
    name: "Standard Container Stacking Block",
    category: "container",
    subType: "container",
    description: "Standard 8-bay × 6-row container stacking yard with RTG gantry clearance.",
    width: 48,
    length: 18,
    height: 0.2,
    accentColor: "#0284C7",
    capacity: 192,
    capacityUnit: "teu",
    defaultProperties: {
      yardType: "container",
      capacityUnit: "teu",
      totalCapacity: 192,
      occupiedCount: 84,
    },
  },
  {
    id: "container-reefer-yard",
    name: "Reefer Cold-Chain Stacking Yard",
    category: "container",
    subType: "reefer",
    description: "Refrigerated container yard equipped with shore electrical monitoring points.",
    width: 36,
    length: 16,
    height: 0.2,
    accentColor: "#10B981",
    capacity: 96,
    capacityUnit: "teu",
    defaultProperties: {
      yardType: "reefer",
      capacityUnit: "teu",
      totalCapacity: 96,
      occupiedCount: 38,
    },
  },
  {
    id: "container-customs-yard",
    name: "Customs Inspection & Quarantine Block",
    category: "container",
    subType: "customs",
    description: "Secure holding area for customs clearance, radiation scan, and physical inspection.",
    width: 30,
    length: 15,
    height: 0.2,
    accentColor: "#8B5CF6",
    capacity: 64,
    capacityUnit: "teu",
    defaultProperties: {
      yardType: "customs",
      capacityUnit: "teu",
      totalCapacity: 64,
      occupiedCount: 22,
    },
  },

  // 3. CCTV Towers
  {
    id: "cctv-tower-16m",
    name: "16m Yard Surveillance Mast",
    category: "cctv",
    subType: "tower",
    description: "Compact 16m lattice tower fitted with dual 180° pan-tilt-zoom cameras.",
    width: 3.5,
    length: 3.5,
    height: 16,
    accentColor: "#06B6D4",
    capacity: 2,
    capacityUnit: "cameras",
    defaultProperties: {
      height: 16,
      cameraCount: 2,
    },
  },
  {
    id: "cctv-tower-24m",
    name: "24m High-Mast Observation Tower",
    category: "cctv",
    subType: "tower",
    description: "Heavy-duty 24m structural mast providing broad 360° yard coverage.",
    width: 4,
    length: 4,
    height: 24,
    accentColor: "#0EA5E9",
    capacity: 3,
    capacityUnit: "cameras",
    defaultProperties: {
      height: 24,
      cameraCount: 3,
    },
  },
  {
    id: "cctv-tower-32m",
    name: "32m Perimeter Defense Tower",
    category: "cctv",
    subType: "tower",
    description: "High-elevation perimeter tower with long-range thermal and telephoto imaging.",
    width: 5,
    length: 5,
    height: 32,
    accentColor: "#6366F1",
    capacity: 4,
    capacityUnit: "cameras",
    defaultProperties: {
      height: 32,
      cameraCount: 4,
    },
  },

  // 4. Buildings & Warehouses
  {
    id: "building-warehouse-logistics",
    name: "Port Logistics Warehouse",
    category: "buildings",
    subType: "warehouse",
    description: "Gabled roof warehouse hall with multi-bay roll-up doors and sodium floodlights.",
    width: 36,
    length: 16,
    height: 7,
    accentColor: "#64748B",
    defaultProperties: {
      type: "warehouse",
      height: 7,
    },
  },
  {
    id: "building-ops-center",
    name: "Terminal Operations Complex",
    category: "buildings",
    subType: "terminal_building",
    description: "Multi-story port administration, dispatch, and harbor master building.",
    width: 14,
    length: 34,
    height: 8.5,
    accentColor: "#475569",
    defaultProperties: {
      type: "terminal_building",
      height: 8.5,
      bandColor: "#0284C7",
    },
  },
  {
    id: "building-maintenance-workshop",
    name: "Equipment Maintenance Workshop",
    category: "buildings",
    subType: "workshop",
    description: "Dedicated workshop for gantry cranes, terminal tractors, and mobile harbor machinery.",
    width: 32,
    length: 14,
    height: 8,
    accentColor: "#78716C",
    defaultProperties: {
      type: "workshop",
      height: 8,
    },
  },

  // 5. Gates & Access
  {
    id: "gate-automated-ingate",
    name: "Automated Terminal Ingate Complex",
    category: "gates",
    subType: "terminal_building",
    description: "Three-lane OCR canopy gate with automated optical license and container scanning.",
    width: 22,
    length: 12,
    height: 6,
    accentColor: "#EC4899",
    capacity: 3,
    capacityUnit: "lanes",
    defaultProperties: {
      type: "terminal_building",
      height: 6,
      bandColor: "#EC4899",
    },
  },
  {
    id: "gate-outgate-weighbridge",
    name: "Outgate Weighbridge & Security Checkpoint",
    category: "gates",
    subType: "terminal_building",
    description: "Dual-lane egress with certified axle weighbridges and customs seal validation.",
    width: 16,
    length: 10,
    height: 5.5,
    accentColor: "#D946EF",
    capacity: 2,
    capacityUnit: "lanes",
    defaultProperties: {
      type: "terminal_building",
      height: 5.5,
      bandColor: "#D946EF",
    },
  },

  // 6. Roads & Corridors
  {
    id: "road-heavy-arterial",
    name: "Dual-Lane Heavy Haul Arterial Road",
    category: "roads",
    subType: "arterial",
    description: "Reinforced 14m wide asphalt corridor connecting quays to gate plazas.",
    width: 14,
    length: 45,
    height: 0.05,
    accentColor: "#64748B",
    defaultProperties: {
      roadType: "arterial",
      width: 14,
      lanes: 2,
    },
  },
  {
    id: "road-feeder-corridor",
    name: "Yard Internal Feeder Road",
    category: "roads",
    subType: "feeder",
    description: "8m wide lane for yard tractors (ITVs) moving containers and RoRo vehicles.",
    width: 8,
    length: 35,
    height: 0.05,
    accentColor: "#94A3B8",
    defaultProperties: {
      roadType: "feeder",
      width: 8,
      lanes: 1,
    },
  },

  // 7. Utilities & Power
  {
    id: "utility-highmast-floodlight",
    name: "High-Mast Area Floodlight Tower",
    category: "utilities",
    subType: "cctv", // uses tower infrastructure model
    description: "28m high-illumination floodlight mast ensuring 24/7 port yard operations safety.",
    width: 4,
    length: 4,
    height: 28,
    accentColor: "#F59E0B",
    defaultProperties: {
      height: 28,
      cameraCount: 1,
    },
  },
  {
    id: "utility-shorepower-substation",
    name: "Shore Power (Cold Ironing) Substation",
    category: "utilities",
    subType: "warehouse",
    description: "High-voltage shore-to-ship power distribution station cutting vessel berth emissions.",
    width: 12,
    length: 8,
    height: 4.8,
    accentColor: "#10B981",
    capacity: 16,
    capacityUnit: "mw",
    defaultProperties: {
      type: "terminal_building",
      height: 4.8,
      bandColor: "#10B981",
    },
  },

  // 8. Fences & Perimeter Security Walls
  {
    id: "fence-chainlink-perimeter",
    name: "Industrial Chain-Link Security Fence (Line)",
    category: "fences",
    subType: "chainlink",
    description: "Point-to-point drawn straight line fence with tubular galvanized steel posts, wire mesh, tension rails, and 3-strand barbed wire.",
    width: 25,
    length: 0.2,
    height: 2.6,
    accentColor: "#94A3B8",
    defaultProperties: {
      type: "chainlink",
      isOpen: true,
      hasBarbedWire: true,
      hasWarningSign: true,
    },
  },
  {
    id: "fence-anti-climb-mesh",
    name: "Anti-Climb Heavy Security Mesh (Line)",
    category: "fences",
    subType: "security_mesh",
    description: "Point-to-point drawn heavy welded wire anti-climb fence line with razor-wire bracket topper for port perimeter.",
    width: 30,
    length: 0.2,
    height: 3.0,
    accentColor: "#64748B",
    defaultProperties: {
      type: "security_mesh",
      isOpen: true,
      hasBarbedWire: true,
      hasWarningSign: true,
    },
  },
  {
    id: "fence-concrete-wall",
    name: "Precast Concrete Security Wall (Line)",
    category: "fences",
    subType: "concrete_wall",
    description: "Point-to-point drawn solid precast concrete blast and vehicle perimeter wall for high-security bonded areas.",
    width: 20,
    length: 0.3,
    height: 2.8,
    accentColor: "#CBD5E1",
    defaultProperties: {
      type: "concrete_wall",
      isOpen: true,
      hasBarbedWire: true,
      hasWarningSign: true,
    },
  },
];

