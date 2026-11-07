import type { FenceSegment, CreateFenceInput, FenceType, FencePoint } from "./fenceTypes";
import { computeFenceLineGeometry } from "./fenceTypes";

const STORAGE_KEY = "hipg_fence_management_v2";

export const DEFAULT_HIPG_FENCES: FenceSegment[] = [
  // 1. Customs Bonded Area Perimeter Lines
  {
    id: "fence-bonded-north",
    name: "Bonded Yard North Fence",
    type: "chainlink",
    startPoint: { x: -99, z: 48 },
    endPoint: { x: -71, z: 48 },
    x: -85,
    z: 48,
    length: 28,
    rotation: 0,
    height: 2.6,
    depth: 0.2,
    hasBarbedWire: true,
    hasWarningSign: true,
    color: "#94A3B8",
    isCustom: false,
  },
  {
    id: "fence-bonded-south",
    name: "Bonded Yard South Fence",
    type: "chainlink",
    startPoint: { x: -99, z: 64 },
    endPoint: { x: -79, z: 64 }, // leaves 8m opening for gate
    x: -89,
    z: 64,
    length: 20,
    rotation: 0,
    height: 2.6,
    depth: 0.2,
    hasBarbedWire: true,
    hasWarningSign: true,
    color: "#94A3B8",
    isCustom: false,
  },
  {
    id: "fence-bonded-west",
    name: "Bonded Yard West Fence",
    type: "chainlink",
    startPoint: { x: -99, z: 48 },
    endPoint: { x: -99, z: 64 },
    x: -99,
    z: 56,
    length: 16,
    rotation: 90,
    height: 2.6,
    depth: 0.2,
    hasBarbedWire: true,
    hasWarningSign: true,
    color: "#94A3B8",
    isCustom: false,
  },
  {
    id: "fence-bonded-east",
    name: "Bonded Yard East Fence",
    type: "chainlink",
    startPoint: { x: -71, z: 48 },
    endPoint: { x: -71, z: 64 },
    x: -71,
    z: 56,
    length: 16,
    rotation: 90,
    height: 2.6,
    depth: 0.2,
    hasBarbedWire: true,
    hasWarningSign: true,
    color: "#94A3B8",
    isCustom: false,
  },

  // 2. Hazmat / Chemical Depot Boundary Line
  {
    id: "fence-hazmat-perimeter",
    name: "Hazmat Buffer Barrier Line",
    type: "security_mesh",
    startPoint: { x: 136, z: -156 },
    endPoint: { x: 248, z: -156 },
    x: 192,
    z: -156,
    length: 112,
    rotation: 0,
    height: 3.0,
    depth: 0.2,
    hasBarbedWire: true,
    hasWarningSign: true,
    color: "#64748B",
    isCustom: false,
  },
];

class FenceRepositoryImpl {
  private fences: FenceSegment[] = [];
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
      this.fences = [...DEFAULT_HIPG_FENCES];
      return;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.fences = parsed.map((f: any, idx: number): FenceSegment => {
            const startPoint: FencePoint = {
              x: typeof f.startPoint?.x === "number" ? f.startPoint.x : (f.x || 0) - (f.width || 20) / 2,
              z: typeof f.startPoint?.z === "number" ? f.startPoint.z : f.z || 0,
            };
            const endPoint: FencePoint = {
              x: typeof f.endPoint?.x === "number" ? f.endPoint.x : (f.x || 0) + (f.width || 20) / 2,
              z: typeof f.endPoint?.z === "number" ? f.endPoint.z : f.z || 0,
            };
            const geom = computeFenceLineGeometry(startPoint, endPoint);

            return {
              id: String(f.id || `fence-${Date.now()}-${idx}`),
              name: String(f.name || `Fence Line ${idx + 1}`),
              type: (["chainlink", "security_mesh", "concrete_wall", "barbed_wire"].includes(f.type)
                ? f.type
                : "chainlink") as FenceType,
              startPoint,
              endPoint,
              x: geom.midX,
              z: geom.midZ,
              length: geom.length,
              rotation: geom.rotation,
              height: typeof f.height === "number" && f.height >= 1 ? f.height : 2.6,
              depth: typeof f.depth === "number" ? f.depth : 0.2,
              color: typeof f.color === "string" ? f.color : "#94A3B8",
              hasBarbedWire: typeof f.hasBarbedWire === "boolean" ? f.hasBarbedWire : true,
              hasWarningSign: typeof f.hasWarningSign === "boolean" ? f.hasWarningSign : true,
              attachedToAreaId: typeof f.attachedToAreaId === "string" ? f.attachedToAreaId : undefined,
              isCustom: typeof f.isCustom === "boolean" ? f.isCustom : true,
              createdAt: typeof f.createdAt === "string" ? f.createdAt : new Date().toISOString(),
              updatedAt: typeof f.updatedAt === "string" ? f.updatedAt : new Date().toISOString(),
            };
          });
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to parse fence storage, resetting to defaults", e);
    }

    this.fences = JSON.parse(JSON.stringify(DEFAULT_HIPG_FENCES));
    this.saveToStorage();
  }

  private saveToStorage() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.fences));
    } catch (e) {
      console.error("Failed to save fences to storage", e);
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

  public getAll(): FenceSegment[] {
    return [...this.fences];
  }

  public getById(id: string): FenceSegment | undefined {
    return this.fences.find((f) => f.id === id);
  }

  /**
   * Add a new straight 3D fence line between startPoint and endPoint
   */
  public add(input: CreateFenceInput): FenceSegment {
    const geom = computeFenceLineGeometry(input.startPoint, input.endPoint);
    const newFence: FenceSegment = {
      id: input.id || `fence-line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: input.name || `Security Fence Line`,
      type: input.type || "chainlink",
      startPoint: input.startPoint,
      endPoint: input.endPoint,
      x: geom.midX,
      z: geom.midZ,
      length: geom.length,
      rotation: geom.rotation,
      height: Math.max(1.2, input.height || 2.6),
      depth: input.depth || 0.2,
      hasBarbedWire: input.hasBarbedWire !== undefined ? input.hasBarbedWire : true,
      hasWarningSign: input.hasWarningSign !== undefined ? input.hasWarningSign : true,
      color: input.color || (input.type === "concrete_wall" ? "#CBD5E1" : "#94A3B8"),
      attachedToAreaId: input.attachedToAreaId,
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.fences.push(newFence);
    this.saveToStorage();
    return newFence;
  }

  public update(id: string, updates: Partial<FenceSegment>): FenceSegment | null {
    const idx = this.fences.findIndex((f) => f.id === id);
    if (idx === -1) return null;

    const current = this.fences[idx];
    let startPoint = updates.startPoint || current.startPoint;
    let endPoint = updates.endPoint || current.endPoint;

    // If x and z midpoint changed (e.g. from whole-object dragging), shift start and end points
    if (updates.x !== undefined || updates.z !== undefined) {
      const targetX = updates.x !== undefined ? updates.x : current.x;
      const targetZ = updates.z !== undefined ? updates.z : current.z;
      const dx = targetX - current.x;
      const dz = targetZ - current.z;
      startPoint = { x: current.startPoint.x + dx, z: current.startPoint.z + dz };
      endPoint = { x: current.endPoint.x + dx, z: current.endPoint.z + dz };
    }

    const geom = computeFenceLineGeometry(startPoint, endPoint);

    this.fences[idx] = {
      ...current,
      ...updates,
      startPoint,
      endPoint,
      x: geom.midX,
      z: geom.midZ,
      length: geom.length,
      rotation: updates.rotation !== undefined ? updates.rotation : geom.rotation,
      updatedAt: new Date().toISOString(),
    };

    this.saveToStorage();
    return this.fences[idx];
  }

  /**
   * Update start or end point directly when user drags a line endpoint handle in 3D
   */
  public updateEndpoint(id: string, which: "start" | "end", point: FencePoint): FenceSegment | null {
    const fence = this.getById(id);
    if (!fence) return null;

    const newStart = which === "start" ? point : fence.startPoint;
    const newEnd = which === "end" ? point : fence.endPoint;
    return this.update(id, { startPoint: newStart, endPoint: newEnd });
  }

  public duplicate(id: string): FenceSegment | null {
    const orig = this.getById(id);
    if (!orig) return null;
    const offset = 4;
    return this.add({
      ...orig,
      id: undefined,
      name: `${orig.name} (Copy)`,
      startPoint: { x: orig.startPoint.x + offset, z: orig.startPoint.z + offset },
      endPoint: { x: orig.endPoint.x + offset, z: orig.endPoint.z + offset },
      isCustom: true,
    });
  }

  public delete(id: string): boolean {
    const idx = this.fences.findIndex((f) => f.id === id);
    if (idx === -1) return false;
    this.fences.splice(idx, 1);
    this.saveToStorage();
    return true;
  }

  /**
   * Creates 4 individual, fully editable fence lines surrounding a selected area (yard or building).
   * Unlike rigid boxes, each of the 4 lines is an independent fence that can be moved, deleted,
   * angled, or resized individually!
   */
  public createPerimeterLinesForArea(
    area: {
      id: string;
      name: string;
      x: number;
      z: number;
      width: number;
      length: number;
      rotation?: number;
    },
    fenceType: FenceType = "chainlink"
  ): FenceSegment[] {
    const margin = 2.5; // clearance margin around the area
    const hw = area.width / 2 + margin;
    const hl = area.length / 2 + margin;
    const rotRad = ((area.rotation || 0) * Math.PI) / 180;
    const cos = Math.cos(rotRad);
    const sin = Math.sin(rotRad);

    // Transform local corner coordinates to world coordinates
    const toWorld = (lx: number, lz: number): FencePoint => ({
      x: Math.round((area.x + (lx * cos - lz * sin)) * 10) / 10,
      z: Math.round((area.z + (lx * sin + lz * cos)) * 10) / 10,
    });

    const nw = toWorld(-hw, -hl);
    const ne = toWorld(hw, -hl);
    const se = toWorld(hw, hl);
    const sw = toWorld(-hw, hl);

    // Leave a gate gap on the south side
    const gateMargin = Math.min(6, area.width * 0.3);
    const swGate = toWorld(-gateMargin / 2, hl);
    const seGate = toWorld(gateMargin / 2, hl);

    const lines: FenceSegment[] = [];

    // 1. North fence line
    lines.push(
      this.add({
        name: `${area.name} · North Fence`,
        type: fenceType,
        startPoint: nw,
        endPoint: ne,
        attachedToAreaId: area.id,
      })
    );

    // 2. East fence line
    lines.push(
      this.add({
        name: `${area.name} · East Fence`,
        type: fenceType,
        startPoint: ne,
        endPoint: se,
        attachedToAreaId: area.id,
      })
    );

    // 3. South fence lines (left wing and right wing with gate opening)
    lines.push(
      this.add({
        name: `${area.name} · South Fence (Left)`,
        type: fenceType,
        startPoint: sw,
        endPoint: swGate,
        attachedToAreaId: area.id,
      })
    );
    lines.push(
      this.add({
        name: `${area.name} · South Fence (Right)`,
        type: fenceType,
        startPoint: seGate,
        endPoint: se,
        attachedToAreaId: area.id,
      })
    );

    // 4. West fence line
    lines.push(
      this.add({
        name: `${area.name} · West Fence`,
        type: fenceType,
        startPoint: nw,
        endPoint: sw,
        attachedToAreaId: area.id,
      })
    );

    return lines;
  }

  /**
   * Alias for createPerimeterLinesForArea
   */
  public createPerimeterFenceForArea(
    area: {
      id: string;
      name: string;
      x: number;
      z: number;
      width: number;
      length: number;
      rotation?: number;
    },
    fenceType: FenceType = "chainlink"
  ): FenceSegment[] {
    return this.createPerimeterLinesForArea(area, fenceType);
  }

  public resetToDefault() {
    this.fences = JSON.parse(JSON.stringify(DEFAULT_HIPG_FENCES));
    this.saveToStorage();
  }
}

export const fenceRepository = new FenceRepositoryImpl();
