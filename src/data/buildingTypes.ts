export type BuildingType = "warehouse" | "terminal_building" | "workshop";

export interface BuildingConfig {
  id: string;
  name: string;
  type: BuildingType;
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  rotation: number; // degrees (0, 90, 180, 270, etc.)
  bandColor?: string;
  isCustom?: boolean;
}

export interface CreateBuildingInput {
  name: string;
  type: BuildingType;
  x?: number;
  z?: number;
  width?: number;
  depth?: number;
  height?: number;
  rotation?: number;
  bandColor?: string;
}
