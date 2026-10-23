/** World layout constants. Water lies at z > QUAY_Z, land at z < QUAY_Z. +x points right on screen. */
export const QUAY_Z = 20;
export const WATER_Y = -1.4;
export const LAND_RAIL_Z = 12;
export const SEA_RAIL_Z = 18;
export const CRANE_LANE_Z = 15;
export const APRON_Z = 8;
export const SHIP_Z = 25.2;

export const BERTH_SPACING = 50;
export const berthX = (berth: number): number => -175 + (berth - 1) * BERTH_SPACING;

/** Quay extent along x. */
export const QUAY_MIN_X = -212;
export const QUAY_MAX_X = 212;

export const CONTAINER_L = 3.0;
export const CONTAINER_W = 1.3;
export const CONTAINER_H = 1.3;

export const BLOCK_BAYS = 8;
export const BLOCK_ROWS = 6;
export const BLOCK_TIERS = 4;
export const BAY_PITCH = 3.2;
export const ROW_PITCH = 1.45;
export const BLOCK_HALF_X = (BLOCK_BAYS * BAY_PITCH) / 2;
export const BLOCK_HALF_Z = (BLOCK_ROWS * ROW_PITCH) / 2;

/** Ten block columns on the Southern terminal land; vertical roads run between them. */
export const BLOCK_COL_X = Array.from({ length: 10 }, (_, i) => -115 + i * 26);
export const BLOCK_ROW_Z: Record<string, number> = { A: 30, B: 56, C: 82, D: 108 };
export const ROW_ROADS_Z = [17, 43, 69, 95, 121];
export const COL_ROADS_X = Array.from({ length: 11 }, (_, k) => -128 + k * 26);


/** Main north–south spine linking the gate plaza to every yard lane. */
export const SPINE_X = 176;
export const GATE_X = 200;
/** Gate plaza road runs east to the far kerb of the port avenue (see facilities.ts AVE_X). */
export const ROAD_END_X = 326;

export const COLORS = {
  ink: "#12233F",
  paper: "#FFFDF8",
  canvas: "#D9ECFA",
  land: "#D5DDE5",
  pavement: "#D1D8DF",
  road: "#95A2AE",
  pad: "#C4CBD2",
  quay: "#C8D0D8",
  quayWall: "#7A8794",
  coping: "#F4F7FA",
  signal: "#0267D2",
  moss: "#2F8F6B",
  amber: "#E8A317",
  brick: "#C8423B",
  slate: "#6B7280",
  steelDark: "#2B3442",
  white: "#FFFFFF",
  tree: "#5B8C5A",
  treeDark: "#416E45",
} as const;

export const CONTAINER_COLORS = {
  orange: "#0284C7",
  navy: "#245285",
  brick: "#C84438",
  moss: "#388566",
  sand: "#E0B768",
  steel: "#5B7D9E",
  reefer: "#F7F7F7",
} as const;
