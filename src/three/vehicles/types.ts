/**
 * 3D Vehicle Types, Classifications, and Automotive Palettes
 * Professional Port Digital Twin Vehicle Asset System
 */

export type VehicleClass =
  | "sedan"
  | "compact"
  | "luxury_sedan"
  | "suv"
  | "van"
  | "minibus"
  | "pickup"
  | "truck"
  | "transporter";

export interface VehicleInstance {
  id: string;
  vehicleClass: VehicleClass;
  x: number;
  y: number;
  z: number;
  rotY: number;
  color: string;
  blockId: string;
}

// ---------------------------------------------------------------------------
// Believable Automotive Color Palettes (Curated OEM & Commercial Finishes)
// ---------------------------------------------------------------------------

export const SEDAN_PAINTS = [
  "#F5F6F8", // Alpine White
  "#E8EDF2", // Glacier Pearl
  "#CED4DA", // Billet Silver Metallic
  "#6C757D", // Granite Crystal
  "#1A1D20", // Obsidian Black
  "#1D3557", // Deep Navy Metallic
  "#2A6F97", // Cobalt Blue
  "#8B1E2B", // Velvet Red Pearl
  "#C5BDB2", // Elegant Cashmere
];

export const COMPACT_PAINTS = [
  "#FFFFFF", // Pure White
  "#DCE1E7", // Ceramic Silver
  "#343A40", // Charcoal Metallic
  "#1B263B", // Midnight Blue
  "#A31621", // Crimson Red
  "#2A9D8F", // Pacific Teal
  "#E9C46A", // Sunset Gold
  "#212529", // Jet Black
];

export const LUXURY_PAINTS = [
  "#0F1115", // Executive Onyx Black
  "#262A30", // Magnetic Dark Titanium
  "#F8F9FA", // Pearl White Tricoat
  "#CFD4DA", // Liquid Silver
  "#14213D", // Imperial Navy
  "#4A1521", // Deep Burgundy Pearl
  "#2B3D2E", // British Racing Green
];

export const SUV_PAINTS = [
  "#F4F6F8", // Oxford White
  "#5A626A", // Storm Grey Metallic
  "#1E2125", // Shadow Black
  "#284B63", // Deep Ocean Blue
  "#8D1C24", // Royal Ruby Red
  "#9C8E7B", // Mojave Sand / Khaki
  "#384638", // Forest Green Metallic
  "#BDC3C7", // Highline Billet Silver
];

export const VAN_PAINTS = [
  "#FFFFFF", // Fleet Pure White
  "#E9ECEF", // Arctic White
  "#ADB5BD", // Fleet Silver
  "#495057", // Logistic Charcoal
  "#1A2E40", // Industrial Fleet Blue
  "#D3D8DE", // Commercial Aluminium
];

export const PICKUP_PAINTS = [
  "#F8F9FA", // Polar White
  "#4B535D", // Carbonized Grey
  "#181A1D", // Tuxedo Black
  "#A72626", // Rapid Red
  "#8F8372", // Desert Earth
  "#203859", // Atlas Blue
];

export const TRUCK_PAINTS = [
  "#FFFFFF", // Carrier White
  "#1E3D6B", // Maritime Blue
  "#C4232C", // Logistics Red
  "#D97724", // Industrial Safety Orange
  "#2C3539", // Heavy Dark Slate
];

export const TRANSPORTER_PAINTS = [
  "#BD2230", // Transporter Red
  "#1B3B6F", // Fleet Marine Blue
  "#D66B27", // Industrial Orange
  "#2A9D8F", // Port Green
  "#3A4048", // Graphite Heavy Transport
];
