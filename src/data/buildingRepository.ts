import type { BuildingConfig, CreateBuildingInput } from "./buildingTypes";
import { COLORS } from "./layout";

const STORAGE_KEY = "hipg_building_management_v1";

export const DEFAULT_HIPG_BUILDINGS: BuildingConfig[] = [
  {
    id: "insee-wh",
    name: "INSEE Warehouse",
    type: "warehouse",
    x: -202,
    z: 65,
    width: 32,
    depth: 14,
    height: 6.8,
    rotation: 0,
    isCustom: false,
  },
  {
    id: "hipl-wh",
    name: "HIPL Warehouse",
    type: "warehouse",
    x: -202,
    z: 102,
    width: 32,
    depth: 14,
    height: 6.8,
    rotation: 0,
    isCustom: false,
  },
  {
    id: "by1",
    name: "BY1 Terminal Complex",
    type: "terminal_building",
    x: -188,
    z: -60,
    width: 12,
    depth: 32,
    height: 8,
    rotation: 0,
    bandColor: "#4F6D8F",
    isCustom: false,
  },
  {
    id: "by2",
    name: "BY2 Operations Center",
    type: "terminal_building",
    x: -188,
    z: -140,
    width: 12,
    depth: 40,
    height: 8,
    rotation: 0,
    bandColor: "#4F6D8F",
    isCustom: false,
  },
  {
    id: "by3",
    name: "BY3 Workshop Base",
    type: "terminal_building",
    x: -160,
    z: -235,
    width: 32,
    depth: 12,
    height: 8,
    rotation: 0,
    bandColor: "#4F6D8F",
    isCustom: false,
  },
  {
    id: "by4",
    name: "BY4 Northeast Hub",
    type: "terminal_building",
    x: 185,
    z: -255,
    width: 42,
    depth: 26,
    height: 12,
    rotation: 0,
    bandColor: COLORS.signal,
    isCustom: false,
  },
  {
    id: "port-admin",
    name: "HIPG Administration",
    type: "terminal_building",
    x: -202,
    z: 155,
    width: 24,
    depth: 14,
    height: 13,
    rotation: 0,
    bandColor: COLORS.ink,
    isCustom: false,
  },
  {
    id: "rtg-bay",
    name: "RTG Service Bay",
    type: "workshop",
    x: -202,
    z: 28,
    width: 26,
    depth: 14,
    height: 8,
    rotation: 0,
    bandColor: COLORS.amber,
    isCustom: false,
  },
];

class BuildingRepositoryImpl {
  private buildings: BuildingConfig[] = [];
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
      this.buildings = [...DEFAULT_HIPG_BUILDINGS];
      return;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.buildings = parsed;
          return;
        }
      }
    } catch (err) {
      console.warn("Failed to parse stored buildings, falling back to defaults", err);
    }

    this.buildings = [...DEFAULT_HIPG_BUILDINGS];
    this.saveToStorage();
  }

  private saveToStorage() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.buildings));
    } catch (err) {
      console.error("Failed to save buildings to localStorage", err);
    }
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach((fn) => fn());
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  public getAll(): BuildingConfig[] {
    return [...this.buildings];
  }

  public getById(id: string): BuildingConfig | undefined {
    return this.buildings.find((b) => b.id === id);
  }

  public update(id: string, updates: Partial<BuildingConfig>): BuildingConfig | null {
    const idx = this.buildings.findIndex((b) => b.id === id);
    if (idx === -1) return null;

    this.buildings[idx] = {
      ...this.buildings[idx],
      ...updates,
    };
    this.notify();
    return this.buildings[idx];
  }

  public add(input: CreateBuildingInput): BuildingConfig {
    const id = `bld-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newBuilding: BuildingConfig = {
      id,
      name: input.name,
      type: input.type,
      x: input.x ?? -190,
      z: input.z ?? 70,
      width: input.width ?? (input.type === "warehouse" ? 32 : 20),
      depth: input.depth ?? (input.type === "warehouse" ? 14 : 14),
      height: input.height ?? (input.type === "warehouse" ? 6.8 : 8),
      rotation: input.rotation ?? 0,
      bandColor: input.bandColor ?? COLORS.ink,
      isCustom: true,
    };

    this.buildings.push(newBuilding);
    this.notify();
    return newBuilding;
  }

  public delete(id: string): boolean {
    const initialLen = this.buildings.length;
    this.buildings = this.buildings.filter((b) => b.id !== id);
    if (this.buildings.length !== initialLen) {
      this.notify();
      return true;
    }
    return false;
  }

  public reset(): void {
    this.buildings = [...DEFAULT_HIPG_BUILDINGS];
    this.notify();
  }
}

export const buildingRepository = new BuildingRepositoryImpl();
