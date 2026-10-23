/**
 * HIPG RoRo & Container Yard Management System - Data Types & Validation
 *
 * Defines the comprehensive data model for configurable yard blocks,
 * capacity calculation, validation rules, and capacity dashboard metrics.
 */

export type YardType = "roro" | "container" | "reefer" | "dual_purpose" | "customs" | "other";

export type CapacityUnit = "slots" | "teu";

export type YardStatus = "active" | "inactive" | "full" | "maintenance";

export interface YardBlockConfig {
  id: string;
  code: string; // e.g. "02A", "03A", unique identifier
  name: string; // Display name, e.g. "RoRo Cargo Parking Block 02A"
  yardType: YardType;
  capacityUnit: CapacityUnit; // "slots" for RoRo, "teu" for Container
  totalCapacity: number;
  occupiedCount: number;
  freeCapacity: number; // Automatically calculated: max(0, totalCapacity - occupiedCount)
  utilizationPercentage: number; // Automatically calculated: (occupiedCount / totalCapacity) * 100
  position: {
    x: number;
    z: number;
  };
  rotation: number; // in degrees (0 to 360)
  width: number; // width in scene units / meters
  length: number; // length (depth) in scene units / meters
  polygonBoundary?: Array<[number, number]>; // optional polygon boundary for irregular shapes
  status: YardStatus;
  notes?: string;
  isCustom?: boolean; // created by user vs seed HIPG layout
  createdAt?: string;
  updatedAt?: string;
}

export type CreateYardInput = Omit<
  YardBlockConfig,
  "id" | "freeCapacity" | "utilizationPercentage" | "createdAt" | "updatedAt"
> & {
  id?: string;
};

export type UpdateYardInput = Partial<
  Omit<YardBlockConfig, "id" | "freeCapacity" | "utilizationPercentage">
>;

/**
 * Calculates free capacity and utilization percentage with strict validation bounds.
 */
export function calculateYardMetrics(totalCapacity: number, occupiedCount: number) {
  const safeTotal = Math.max(0, Math.round(totalCapacity));
  const safeOccupied = Math.max(0, Math.min(safeTotal, Math.round(occupiedCount)));
  const freeCapacity = Math.max(0, safeTotal - safeOccupied);
  const utilizationPercentage = safeTotal > 0 ? (safeOccupied / safeTotal) * 100 : 0;

  return {
    totalCapacity: safeTotal,
    occupiedCount: safeOccupied,
    freeCapacity,
    utilizationPercentage: Math.round(utilizationPercentage * 10) / 10,
  };
}

export const YARD_TYPE_LABELS: Record<YardType, string> = {
  roro: "RoRo Cargo Parking",
  container: "Container Stacking",
  reefer: "Reefer Stacking",
  dual_purpose: "Dual-Purpose Yard",
  customs: "Customs Inspection",
  other: "General Cargo / Other",
};

export const CAPACITY_UNIT_LABELS: Record<CapacityUnit, string> = {
  slots: "Vehicle Slots",
  teu: "TEU",
};

export const YARD_STATUS_LABELS: Record<YardStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  full: "Full",
  maintenance: "Maintenance",
};

export interface CapacityDashboardMetrics {
  totalYards: number;
  activeYards: number;
  fullYards: number;
  maintenanceYards: number;

  // RoRo specific capacity in vehicle slots
  roro: {
    yardCount: number;
    totalSlots: number;
    occupiedSlots: number;
    freeSlots: number;
    utilization: number;
  };

  // Container specific capacity in TEU
  container: {
    yardCount: number;
    totalTeu: number;
    occupiedTeu: number;
    freeTeu: number;
    utilization: number;
  };

  // Overall system-wide utilization
  overallUtilization: number;
  isSimulatedData: boolean; // clearly identifies non-sensor manual/telemetry data
}
