import { QUAY_CRANES } from "./port";
import { hipgCranePose } from "./hipgLayout";

const STORAGE_KEY = "hipg_crane_positions_v1";

export interface CraneCustomPose {
  x: number;
  z: number;
  rotY?: number;
}

class CranePositionRepositoryImpl {
  private customPoses: Record<string, CraneCustomPose> = {};
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
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.customPoses = JSON.parse(raw);
      }
    } catch (e) {
      console.warn("Failed to load custom crane positions:", e);
    }
  }

  private saveToStorage() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.customPoses));
    } catch (e) {
      console.warn("Failed to persist custom crane positions:", e);
    }
  }

  public getPose(craneId: string, berth: number, index = 0): { x: number; z: number; rotY: number } {
    this.init();
    const defaultPose = hipgCranePose(craneId, berth, index);
    const custom = this.customPoses[craneId];
    if (custom) {
      return {
        x: custom.x,
        z: custom.z,
        rotY: custom.rotY ?? defaultPose.rotY,
      };
    }
    return defaultPose;
  }

  public setPose(craneId: string, pose: CraneCustomPose) {
    this.customPoses[craneId] = { ...this.customPoses[craneId], ...pose };
    this.saveToStorage();
    this.notify();
  }

  public resetCrane(craneId: string) {
    delete this.customPoses[craneId];
    this.saveToStorage();
    this.notify();
  }

  public resetAll() {
    this.customPoses = {};
    this.saveToStorage();
    this.notify();
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }
}

export const cranePositionRepository = new CranePositionRepositoryImpl();
