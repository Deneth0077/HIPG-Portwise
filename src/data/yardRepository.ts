/**
 * HIPG Yard Management Repository
 *
 * Implements a robust repository pattern for yard blocks with local persistence,
 * schema versioning, validation, event dispatching, and backend API readiness.
 */

import { HIPG_YARD_BLOCKS, type HipgYardBlockDef } from "./hipgLayout";
import type { YardBlock, BlockCategory } from "./types";
import {
  type YardBlockConfig,
  type CreateYardInput,
  type UpdateYardInput,
  type YardType,
  type CapacityUnit,
  type CapacityDashboardMetrics,
  calculateYardMetrics,
} from "./yardTypes";

const STORAGE_KEY = "hipg_yard_management_v4";
const STORAGE_VERSION = 4;

/** Maps legacy HIPG block category to new YardType & default capacity unit */
function mapHipgCategory(category: string): { yardType: YardType; capacityUnit: CapacityUnit } {
  switch (category) {
    case "roro":
    case "roro_alt":
      return { yardType: "roro", capacityUnit: "slots" };
    case "reefer":
      return { yardType: "reefer", capacityUnit: "teu" };
    case "customs":
      return { yardType: "customs", capacityUnit: "slots" };
    case "dual_purpose":
      return { yardType: "dual_purpose", capacityUnit: "slots" };
    case "container":
    case "import":
    case "export":
    default:
      return { yardType: "container", capacityUnit: "teu" };
  }
}

/** Converts an authoritative HIPG layout block to default YardBlockConfig */
function createSeedBlock(b: HipgYardBlockDef, index: number): YardBlockConfig {
  const { yardType, capacityUnit } = mapHipgCategory(b.category);

  // Default capacities based on real HIPG yard scale
  const isRoRo = yardType === "roro";
  const totalCapacity = isRoRo ? 1200 : yardType === "customs" ? 450 : yardType === "reefer" ? 600 : 1400;

  // Realistic occupancy distribution across tiers
  const fillFactor = 0.55 + ((index * 7) % 35) * 0.01;
  const occupiedCount = Math.round(totalCapacity * fillFactor);
  const metrics = calculateYardMetrics(totalCapacity, occupiedCount);

  return {
    id: b.id,
    code: b.label || b.id,
    name: b.description || `${b.label} Terminal Area`,
    yardType,
    capacityUnit,
    totalCapacity: metrics.totalCapacity,
    occupiedCount: metrics.occupiedCount,
    freeCapacity: metrics.freeCapacity,
    utilizationPercentage: metrics.utilizationPercentage,
    position: {
      x: b.provisionalPosition.x,
      z: b.provisionalPosition.z,
    },
    rotation: 0,
    width: b.provisionalPosition.approxWidth ?? (isRoRo ? 64 : 56),
    length: b.provisionalPosition.approxDepth ?? (isRoRo ? 24 : 12),
    status: metrics.utilizationPercentage >= 98 ? "full" : "active",
    notes: b.hasReefer ? "Equipped with reefer plug stations" : b.hasImdg ? "Certified for IMDG hazardous cargo" : undefined,
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

class YardRepositoryImpl {
  private yards: YardBlockConfig[] = [];
  private listeners = new Set<() => void>();
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;
    this.initialized = true;
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === "undefined") {
      this.yards = HIPG_YARD_BLOCKS.map(createSeedBlock);
      return;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.version === STORAGE_VERSION && Array.isArray(parsed.yards) && parsed.yards.length > 0) {
          this.yards = parsed.yards.map((y: YardBlockConfig) => {
            const metrics = calculateYardMetrics(y.totalCapacity, y.occupiedCount);
            return {
              ...y,
              ...metrics,
              rotation: y.rotation ?? 0,
              width: Math.max(5, y.width || 50),
              length: Math.max(4, y.length || 20),
            };
          });
          return;
        }
      }
    } catch (err) {
      console.warn("Failed to read saved yard layout from storage, resetting to authoritative HIPG layout:", err);
    }

    // Seed defaults
    this.yards = HIPG_YARD_BLOCKS.map(createSeedBlock);
    this.saveToStorage();
  }

  private saveToStorage() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: STORAGE_VERSION,
          updatedAt: new Date().toISOString(),
          yards: this.yards,
        }),
      );
    } catch (err) {
      console.error("Failed to persist yard layout to storage:", err);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (err) {
        console.error("YardRepository subscriber error:", err);
      }
    });
  }

  public getAll(): YardBlockConfig[] {
    return [...this.yards];
  }

  public getById(id: string): YardBlockConfig | undefined {
    return this.yards.find((y) => y.id === id);
  }

  public getByCode(code: string): YardBlockConfig | undefined {
    const clean = code.trim().toLowerCase();
    return this.yards.find((y) => y.code.trim().toLowerCase() === clean);
  }

  public create(input: CreateYardInput): YardBlockConfig {
    const cleanCode = input.code.trim().toUpperCase();
    if (!cleanCode) throw new Error("Yard block code is required");

    if (this.getByCode(cleanCode)) {
      throw new Error(`Yard block code "${cleanCode}" already exists`);
    }

    const id = input.id || cleanCode.replace(/[^A-Z0-9_-]/g, "_");
    if (this.getById(id)) {
      throw new Error(`Yard ID "${id}" already exists`);
    }

    const metrics = calculateYardMetrics(input.totalCapacity, input.occupiedCount);

    const newYard: YardBlockConfig = {
      ...input,
      id,
      code: cleanCode,
      name: input.name.trim() || `Block ${cleanCode}`,
      totalCapacity: metrics.totalCapacity,
      occupiedCount: metrics.occupiedCount,
      freeCapacity: metrics.freeCapacity,
      utilizationPercentage: metrics.utilizationPercentage,
      width: Math.max(5, input.width),
      length: Math.max(4, input.length),
      rotation: input.rotation ?? 0,
      status: input.status || (metrics.utilizationPercentage >= 98 ? "full" : "active"),
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.yards.push(newYard);
    this.saveToStorage();
    return newYard;
  }

  public update(id: string, updates: UpdateYardInput): YardBlockConfig {
    const idx = this.yards.findIndex((y) => y.id === id);
    if (idx === -1) throw new Error(`Yard with ID "${id}" not found`);

    const current = this.yards[idx];

    // Check code uniqueness if code changed
    if (updates.code) {
      const cleanCode = updates.code.trim().toUpperCase();
      const existing = this.getByCode(cleanCode);
      if (existing && existing.id !== id) {
        throw new Error(`Yard block code "${cleanCode}" is already in use by another yard`);
      }
      updates.code = cleanCode;
    }

    const totalCap = updates.totalCapacity !== undefined ? updates.totalCapacity : current.totalCapacity;
    const occupied = updates.occupiedCount !== undefined ? updates.occupiedCount : current.occupiedCount;
    const metrics = calculateYardMetrics(totalCap, occupied);

    const updated: YardBlockConfig = {
      ...current,
      ...updates,
      ...metrics,
      position: updates.position ? { ...updates.position } : current.position,
      width: updates.width ? Math.max(5, updates.width) : current.width,
      length: updates.length ? Math.max(4, updates.length) : current.length,
      rotation: updates.rotation !== undefined ? updates.rotation : current.rotation,
      updatedAt: new Date().toISOString(),
    };

    this.yards[idx] = updated;
    this.saveToStorage();
    return updated;
  }

  public duplicate(id: string): YardBlockConfig {
    const src = this.getById(id);
    if (!src) throw new Error(`Yard "${id}" not found`);

    let copyNum = 1;
    let newCode = `${src.code}_COPY`;
    while (this.getByCode(newCode)) {
      copyNum++;
      newCode = `${src.code}_COPY${copyNum}`;
    }

    return this.create({
      ...src,
      id: newCode,
      code: newCode,
      name: `${src.name} (Copy)`,
      position: {
        x: src.position.x + 12,
        z: src.position.z + 12,
      },
      isCustom: true,
    });
  }

  public delete(id: string): boolean {
    const idx = this.yards.findIndex((y) => y.id === id);
    if (idx === -1) return false;

    this.yards.splice(idx, 1);
    this.saveToStorage();
    return true;
  }

  public resetToDefault(): YardBlockConfig[] {
    this.yards = HIPG_YARD_BLOCKS.map(createSeedBlock);
    this.saveToStorage();
    return [...this.yards];
  }

  /** Calculates comprehensive capacity dashboard metrics */
  public getDashboardMetrics(): CapacityDashboardMetrics {
    let roroYards = 0;
    let roroTotal = 0;
    let roroOccupied = 0;

    let containerYards = 0;
    let containerTotal = 0;
    let containerOccupied = 0;

    let fullYards = 0;
    let maintenanceYards = 0;
    let activeYards = 0;

    for (const y of this.yards) {
      if (y.status === "full" || y.utilizationPercentage >= 99) fullYards++;
      if (y.status === "maintenance") maintenanceYards++;
      if (y.status === "active") activeYards++;

      if (y.capacityUnit === "slots" || y.yardType === "roro") {
        roroYards++;
        roroTotal += y.totalCapacity;
        roroOccupied += y.occupiedCount;
      } else {
        containerYards++;
        containerTotal += y.totalCapacity;
        containerOccupied += y.occupiedCount;
      }
    }

    const roroUtil = roroTotal > 0 ? (roroOccupied / roroTotal) * 100 : 0;
    const containerUtil = containerTotal > 0 ? (containerOccupied / containerTotal) * 100 : 0;
    const totalSlotsTeu = roroTotal + containerTotal;
    const totalOcc = roroOccupied + containerOccupied;
    const overallUtil = totalSlotsTeu > 0 ? (totalOcc / totalSlotsTeu) * 100 : 0;

    return {
      totalYards: this.yards.length,
      activeYards,
      fullYards,
      maintenanceYards,
      roro: {
        yardCount: roroYards,
        totalSlots: roroTotal,
        occupiedSlots: roroOccupied,
        freeSlots: Math.max(0, roroTotal - roroOccupied),
        utilization: Math.round(roroUtil * 10) / 10,
      },
      container: {
        yardCount: containerYards,
        totalTeu: containerTotal,
        occupiedTeu: containerOccupied,
        freeTeu: Math.max(0, containerTotal - containerOccupied),
        utilization: Math.round(containerUtil * 10) / 10,
      },
      overallUtilization: Math.round(overallUtil * 10) / 10,
      isSimulatedData: true,
    };
  }

  /** Converts a YardBlockConfig to the legacy YardBlock format for backward compatibility */
  public toLegacyYardBlock(cfg: YardBlockConfig): YardBlock {
    let cat: BlockCategory = "container";
    if (cfg.yardType === "roro") cat = "roro";
    else if (cfg.yardType === "reefer") cat = "reefer";
    else if (cfg.yardType === "customs") cat = "customs";
    else if (cfg.yardType === "dual_purpose") cat = "dual_purpose";

    return {
      id: cfg.id,
      x: cfg.position.x,
      z: cfg.position.z,
      category: cat,
      fill: cfg.totalCapacity > 0 ? cfg.occupiedCount / cfg.totalCapacity : 0,
      capacity: cfg.totalCapacity,
      width: cfg.width,
      depth: cfg.length,
      label: cfg.code,
      hipgCategory: cfg.yardType,
    };
  }
}

export const yardRepository = new YardRepositoryImpl();
