import type { CreateRoadInput, RoadSegment } from "./roadTypes";

const STORAGE_KEY = "hipg_road_network_v1";

export const DEFAULT_HIPG_ROADS: RoadSegment[] = [
  // 1. WESTERN FINGER ROADS & HIGHWAY
  {
    id: "road-by2-hwy",
    name: "BY2 Perimeter Highway",
    x: -228,
    z: -40,
    width: 9.0,
    depth: 380,
    color: "#20242B",
    hasMarking: true,
    markingColor: "#E6C844",
  },
  {
    id: "road-feeder-ac",
    name: "Feeder A-C Artery",
    x: -220,
    z: -140,
    width: 6.5,
    depth: 205,
    color: "#232830",
  },
  {
    id: "road-feeder-ab",
    name: "Feeder A-B Customs Artery",
    x: -185,
    z: -63,
    width: 68,
    depth: 6.0,
    color: "#232830",
    hasMarking: true,
    markingColor: "#FFFFFF",
  },
  {
    id: "road-feeder-bc",
    name: "Feeder B-C Artery",
    x: -185,
    z: -85,
    width: 68,
    depth: 6.0,
    color: "#232830",
    hasMarking: true,
    markingColor: "#FFFFFF",
  },
  {
    id: "road-by3-north",
    name: "BY3 North Finger Road",
    x: -185,
    z: -242,
    width: 72,
    depth: 6.5,
    color: "#232830",
  },

  // 2. BASIN APRON & QUAY ROADS
  {
    id: "road-basin-south-apron",
    name: "Southern Basin Apron Road",
    x: -8,
    z: 16,
    width: 275,
    depth: 7.5,
    color: "#232830",
    hasMarking: true,
    markingColor: "#FFFFFF",
  },
  {
    id: "road-basin-north-apron",
    name: "Northern Basin Apron Road",
    x: 0,
    z: -172,
    width: 280,
    depth: 7.0,
    color: "#232830",
    hasMarking: true,
    markingColor: "#FFFFFF",
  },
  {
    id: "road-quay-east-service",
    name: "Eastern Quay Service Road",
    x: 130,
    z: 130,
    width: 8.0,
    depth: 240,
    color: "#232830",
    hasMarking: true,
    markingColor: "#FFFFFF",
  },
  {
    id: "road-quay-east-turn",
    name: "Eastern Quay South Turn",
    x: 97,
    z: 236,
    width: 72,
    depth: 7.5,
    color: "#232830",
    hasMarking: true,
    markingColor: "#FFFFFF",
  },

  // 3. MAIN CENTRAL CIRCULATION CORRIDORS
  {
    id: "road-main-blvd",
    name: "Main Arterial Boulevard",
    x: -18,
    z: 52,
    width: 300,
    depth: 8.5,
    color: "#232830",
    hasMarking: true,
    markingColor: "#E6C844",
    label: "MAIN ROAD",
  },
  {
    id: "road-inter-stack",
    name: "Inter-Container Handling Corridor",
    x: -18,
    z: 80,
    width: 300,
    depth: 6.5,
    color: "#232830",
  },
  {
    id: "road-arterial-corridor-2",
    name: "Arterial Corridor 2",
    x: -18,
    z: 106,
    width: 300,
    depth: 8.5,
    color: "#232830",
    hasMarking: true,
    markingColor: "#E6C844",
  },
  {
    id: "road-south-circ",
    name: "Southern Peripheral Circulation Road",
    x: -18,
    z: 175,
    width: 300,
    depth: 7.5,
    color: "#232830",
  },

  // 4. NORTH-SOUTH TRANSVERSE ACCESS SPINES
  {
    id: "road-west-perim",
    name: "Western Perimeter Avenue",
    x: -165,
    z: 121,
    width: 7.5,
    depth: 214,
    color: "#232830",
    hasMarking: true,
    markingColor: "#FFFFFF",
  },
  {
    id: "road-west-spine",
    name: "West Central Spine",
    x: -80,
    z: 65,
    width: 6.0,
    depth: 105,
    color: "#232830",
  },
  {
    id: "road-main-spine",
    name: "Central Main Spine",
    x: -8,
    z: 95,
    width: 7.5,
    depth: 168,
    color: "#232830",
    hasMarking: true,
    markingColor: "#FFFFFF",
  },
  {
    id: "road-east-spine",
    name: "East Spine Corridor",
    x: 64,
    z: 126,
    width: 7.0,
    depth: 226,
    color: "#232830",
  },

  // 5. GATE 01 & NEW CUSTOMS COMPOUND ACCESS
  {
    id: "road-customs-lane",
    name: "Customs Access Lane",
    x: -95,
    z: 185,
    width: 6.5,
    depth: 75,
    color: "#232830",
  },
  {
    id: "road-gate01-north",
    name: "Gate 01 Inbound Link",
    x: -130,
    z: 148,
    width: 76,
    depth: 6.5,
    color: "#232830",
  },
  {
    id: "road-gate01-south",
    name: "Gate 01 Plaza Link",
    x: -130,
    z: 222,
    width: 76,
    depth: 6.5,
    color: "#232830",
  },
];

class RoadRepositoryImpl {
  private roads: RoadSegment[] = [];
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
      this.roads = [...DEFAULT_HIPG_ROADS];
      return;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.roads = parsed;
          return;
        }
      }
    } catch (err) {
      console.warn("Failed to read roads from storage, restoring default:", err);
    }

    this.roads = [...DEFAULT_HIPG_ROADS];
    this.saveToStorage();
  }

  private saveToStorage() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.roads));
    } catch (err) {
      console.error("Failed to persist roads:", err);
    }
    this.notify();
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  public getAll(): RoadSegment[] {
    return [...this.roads];
  }

  public getById(id: string): RoadSegment | undefined {
    return this.roads.find((r) => r.id === id);
  }

  public add(input: CreateRoadInput): RoadSegment {
    const newRoad: RoadSegment = {
      ...input,
      id: input.id || `road-${Date.now()}`,
      isCustom: true,
      color: input.color || "#232830",
    };
    this.roads.push(newRoad);
    this.saveToStorage();
    return newRoad;
  }

  public update(id: string, updates: Partial<RoadSegment>): RoadSegment | null {
    const idx = this.roads.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    this.roads[idx] = { ...this.roads[idx], ...updates };
    this.saveToStorage();
    return this.roads[idx];
  }

  public delete(id: string): boolean {
    const idx = this.roads.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    this.roads.splice(idx, 1);
    this.saveToStorage();
    return true;
  }

  public resetToDefault() {
    this.roads = [...DEFAULT_HIPG_ROADS];
    this.saveToStorage();
  }
}

export const roadRepository = new RoadRepositoryImpl();
