import type { CctvCameraConfig, CctvCameraType, CctvTowerConfig, CreateCctvTowerInput } from "./cctvTypes";

const STORAGE_KEY = "hipg_cctv_management_v1";

export const CCTV_CAMERA_COLORS = [
  "#0284C7", // Cyan / Sky
  "#10B981", // Emerald Green
  "#F59E0B", // Amber
  "#EF4444", // Red / Crimson
  "#8B5CF6", // Purple / Violet
  "#EC4899", // Pink
  "#06B6D4", // Teal
  "#F97316", // Orange
];

export const DEFAULT_HIPG_TOWERS: CctvTowerConfig[] = [
  {
    id: "cctv-t01",
    code: "CCTV-T01",
    name: "Main Gate & Plaza Security Mast",
    x: 185,
    y: 0,
    z: -12,
    height: 16,
    rotation: 0,
    status: "active",
    notes: "Main terminal access gate & truck weighbridge incoming corridor.",
    cameras: [
      {
        id: "cam-t01-01",
        name: "Gate Inbound ANPR",
        type: "bullet",
        ipAddress: "192.168.10.101",
        model: "Hikvision DS-2CD7A46G0/P-IZHS (ANPR)",
        mountingHeight: 15.2,
        yaw: 85,
        pitch: -28,
        hfov: 65,
        vfov: 42,
        range: 38,
        status: "active",
        coverageColor: CCTV_CAMERA_COLORS[0],
        notes: "Monitoring truck entry lanes and license plates",
      },
      {
        id: "cam-t01-02",
        name: "Plaza Wide Overview",
        type: "dome",
        ipAddress: "192.168.10.102",
        model: "Axis P3245-V 1080p Dome",
        mountingHeight: 14.5,
        yaw: 260,
        pitch: -22,
        hfov: 85,
        vfov: 55,
        range: 35,
        status: "active",
        coverageColor: CCTV_CAMERA_COLORS[1],
        notes: "Main gate holding yard overview",
      },
      {
        id: "cam-t01-03",
        name: "South Spine PTZ",
        type: "ptz",
        ipAddress: "192.168.10.103",
        model: "Dahua SD8A840-HNF-PA 4K 40x PTZ",
        mountingHeight: 15.8,
        yaw: 175,
        pitch: -18,
        hfov: 45,
        vfov: 32,
        range: 48,
        status: "active",
        coverageColor: CCTV_CAMERA_COLORS[2],
        notes: "High zoom tracking south logistics corridor",
      },
    ],
  },
  {
    id: "cctv-t02",
    code: "CCTV-T02",
    name: "Container Yard West Tower",
    x: -38,
    y: 0,
    z: 48,
    height: 18,
    rotation: 0,
    status: "active",
    notes: "Overlooks container blocks B, C and central cross roads.",
    cameras: [
      {
        id: "cam-t02-01",
        name: "Block B Inter-lane",
        type: "bullet",
        mountingHeight: 17.2,
        yaw: 0,
        pitch: -32,
        hfov: 70,
        vfov: 45,
        range: 35,
        status: "active",
        coverageColor: CCTV_CAMERA_COLORS[0],
      },
      {
        id: "cam-t02-02",
        name: "Block C Gantry Lane",
        type: "bullet",
        mountingHeight: 17.2,
        yaw: 180,
        pitch: -30,
        hfov: 70,
        vfov: 45,
        range: 35,
        status: "active",
        coverageColor: CCTV_CAMERA_COLORS[3],
      },
      {
        id: "cam-t02-03",
        name: "West Haul Road Dome",
        type: "dome",
        mountingHeight: 16.5,
        yaw: 270,
        pitch: -25,
        hfov: 80,
        vfov: 50,
        range: 36,
        status: "active",
        coverageColor: CCTV_CAMERA_COLORS[4],
      },
      {
        id: "cam-t02-04",
        name: "East Crossroad PTZ",
        type: "ptz",
        mountingHeight: 17.8,
        yaw: 90,
        pitch: -20,
        hfov: 50,
        vfov: 35,
        range: 48,
        status: "active",
        coverageColor: CCTV_CAMERA_COLORS[2],
      },
    ],
  },
  {
    id: "cctv-t03",
    code: "CCTV-T03",
    name: "Quay Berth 01/02 Crane Apron",
    x: 82,
    y: 0,
    z: 14,
    height: 20,
    rotation: 0,
    status: "active",
    notes: "Main container berths apron and STS crane rail track safety zone.",
    cameras: [
      {
        id: "cam-t03-01",
        name: "Berth 01 Apron North",
        type: "bullet",
        mountingHeight: 19.2,
        yaw: 95,
        pitch: -24,
        hfov: 60,
        vfov: 40,
        range: 40,
        status: "active",
        coverageColor: CCTV_CAMERA_COLORS[0],
      },
      {
        id: "cam-t03-02",
        name: "Berth 02 Apron South",
        type: "bullet",
        mountingHeight: 19.2,
        yaw: 275,
        pitch: -24,
        hfov: 60,
        vfov: 40,
        range: 40,
        status: "active",
        coverageColor: CCTV_CAMERA_COLORS[1],
      },
    ],
  },
  {
    id: "cctv-t04",
    code: "CCTV-T04",
    name: "RoRo Terminal & Basin Hub",
    x: -128,
    y: 0,
    z: -85,
    height: 18,
    rotation: 0,
    status: "active",
    notes: "Berths 06-08 western basin and RoRo vehicle yard staging lanes.",
    cameras: [
      {
        id: "cam-t04-01",
        name: "RoRo Staging Yard North",
        type: "dome",
        mountingHeight: 17.0,
        yaw: 45,
        pitch: -25,
        hfov: 80,
        vfov: 50,
        range: 40,
        status: "active",
        coverageColor: CCTV_CAMERA_COLORS[0],
      },
      {
        id: "cam-t04-02",
        name: "Basin Water Front Monitor",
        type: "ptz",
        mountingHeight: 17.5,
        yaw: 135,
        pitch: -15,
        hfov: 55,
        vfov: 38,
        range: 50,
        status: "active",
        coverageColor: CCTV_CAMERA_COLORS[5],
      },
      {
        id: "cam-t04-03",
        name: "West Logistics Access",
        type: "bullet",
        mountingHeight: 16.5,
        yaw: 240,
        pitch: -28,
        hfov: 65,
        vfov: 42,
        range: 36,
        status: "active",
        coverageColor: CCTV_CAMERA_COLORS[2],
      },
    ],
  },
];

class CctvRepository {
  private towers: CctvTowerConfig[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.load();
  }

  private load(): void {
    if (typeof window === "undefined") {
      this.towers = [...DEFAULT_HIPG_TOWERS];
      return;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Schema sanitization & migration safeguards
          this.towers = parsed.map((t: any, idx: number): CctvTowerConfig => ({
            id: String(t.id || `cctv-t${Date.now()}-${idx}`),
            code: String(t.code || `CCTV-${String(idx + 1).padStart(3, "0")}`),
            name: String(t.name || `CCTV Tower ${idx + 1}`),
            x: typeof t.x === "number" ? t.x : 0,
            y: typeof t.y === "number" ? t.y : 0,
            z: typeof t.z === "number" ? t.z : 0,
            height: typeof t.height === "number" && t.height >= 4 ? t.height : 16,
            rotation: typeof t.rotation === "number" ? t.rotation : 0,
            status: t.status === "inactive" || t.status === "maintenance" ? t.status : "active",
            notes: typeof t.notes === "string" ? t.notes : "",
            cameras: Array.isArray(t.cameras)
              ? t.cameras.map((c: any, cIdx: number): CctvCameraConfig => ({
                  id: String(c.id || `cam-${t.id}-${cIdx + 1}`),
                  name: String(c.name || `Camera ${cIdx + 1}`),
                  type: (["bullet", "dome", "ptz", "fixed", "other"].includes(c.type) ? c.type : "bullet") as CctvCameraType,
                  mountingHeight: typeof c.mountingHeight === "number" ? c.mountingHeight : Math.max(2, (t.height || 16) - 1),
                  yaw: typeof c.yaw === "number" ? c.yaw : (cIdx * 90) % 360,
                  pitch: typeof c.pitch === "number" ? c.pitch : -25,
                  hfov: typeof c.hfov === "number" ? c.hfov : 65,
                  vfov: typeof c.vfov === "number" ? c.vfov : 45,
                  range: typeof c.range === "number" ? Math.max(12, Math.min(30, Math.round(c.range > 30 ? c.range * 0.35 : c.range))) : 24,
                  status: c.status === "inactive" || c.status === "maintenance" ? c.status : "active",
                  coverageColor: typeof c.coverageColor === "string" ? c.coverageColor : CCTV_CAMERA_COLORS[cIdx % CCTV_CAMERA_COLORS.length],
                  notes: typeof c.notes === "string" ? c.notes : "",
                }))
              : [],
            createdAt: typeof t.createdAt === "string" ? t.createdAt : new Date().toISOString(),
            updatedAt: typeof t.updatedAt === "string" ? t.updatedAt : new Date().toISOString(),
          }));
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to parse CCTV storage, reverting to default layout", e);
    }

    this.towers = JSON.parse(JSON.stringify(DEFAULT_HIPG_TOWERS));
    this.save();
  }

  private save(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.towers));
    } catch (e) {
      console.error("Failed to save CCTV configurations", e);
    }
    this.notify();
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getAll(): CctvTowerConfig[] {
    return [...this.towers];
  }

  public getById(id: string): CctvTowerConfig | null {
    return this.towers.find((t) => t.id === id) ?? null;
  }

  public getCamera(towerId: string, cameraId: string): CctvCameraConfig | null {
    const tower = this.getById(towerId);
    if (!tower) return null;
    return tower.cameras.find((c) => c.id === cameraId) ?? null;
  }

  public getTotalCameraCount(): number {
    return this.towers.reduce((acc, t) => acc + (t.cameras?.length || 0), 0);
  }

  public addTower(input: CreateCctvTowerInput): CctvTowerConfig {
    const id = `cctv-${Date.now()}`;
    const initialCount = Math.max(1, Math.min(6, input.initialCamerasCount || 2));
    const h = Math.max(4, Math.min(40, input.height));

    const cameras: CctvCameraConfig[] = [];
    for (let i = 0; i < initialCount; i++) {
      cameras.push({
        id: `cam-${id}-${i + 1}`,
        name: `Camera ${i + 1}`,
        type: i === 0 ? "bullet" : i === 1 ? "dome" : "ptz",
        mountingHeight: Math.max(2, h - 0.8),
        yaw: (i * (360 / initialCount)) % 360,
        pitch: -25,
        hfov: 65,
        vfov: 42,
        range: 35,
        status: "active",
        coverageColor: CCTV_CAMERA_COLORS[i % CCTV_CAMERA_COLORS.length],
      });
    }

    const newTower: CctvTowerConfig = {
      id,
      code: input.code.trim().toUpperCase() || `CCTV-${String(this.towers.length + 1).padStart(3, "0")}`,
      name: input.name.trim() || `CCTV Tower ${this.towers.length + 1}`,
      x: input.x,
      y: input.y ?? 0,
      z: input.z,
      height: h,
      rotation: input.rotation ?? 0,
      status: input.status,
      notes: input.notes?.trim() || "",
      cameras,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.towers.push(newTower);
    this.save();
    return newTower;
  }

  public updateTower(id: string, updates: Partial<Omit<CctvTowerConfig, "id" | "cameras">>): CctvTowerConfig | null {
    const idx = this.towers.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const current = this.towers[idx];
    const updated: CctvTowerConfig = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // If tower height was changed, constrain camera mounting heights if necessary
    if (updates.height !== undefined && updates.height > 0) {
      updated.cameras = updated.cameras.map((c) => ({
        ...c,
        mountingHeight: Math.min(c.mountingHeight, updates.height! - 0.5),
      }));
    }

    this.towers[idx] = updated;
    this.save();
    return updated;
  }

  public duplicateTower(id: string): CctvTowerConfig | null {
    const original = this.getById(id);
    if (!original) return null;

    const newId = `cctv-${Date.now()}`;
    const duplicated: CctvTowerConfig = {
      ...JSON.parse(JSON.stringify(original)),
      id: newId,
      code: `${original.code}-COPY`,
      name: `${original.name} (Copy)`,
      x: original.x + 8,
      z: original.z + 8,
      cameras: original.cameras.map((c, i) => ({
        ...c,
        id: `cam-${newId}-${i + 1}`,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.towers.push(duplicated);
    this.save();
    return duplicated;
  }

  public deleteTower(id: string): boolean {
    const initialLen = this.towers.length;
    this.towers = this.towers.filter((t) => t.id !== id);
    if (this.towers.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public addCameraToTower(towerId: string, cameraData?: Partial<CctvCameraConfig>): CctvCameraConfig | null {
    const idx = this.towers.findIndex((t) => t.id === towerId);
    if (idx === -1) return null;

    const tower = this.towers[idx];
    const cameraCount = tower.cameras.length;
    const newCameraId = `cam-${towerId}-${Date.now()}`;
    const newCam: CctvCameraConfig = {
      id: newCameraId,
      name: cameraData?.name || `Camera ${cameraCount + 1}`,
      type: cameraData?.type || "bullet",
      mountingHeight: cameraData?.mountingHeight ?? Math.max(2, tower.height - 0.8),
      yaw: cameraData?.yaw ?? (cameraCount * 60) % 360,
      pitch: cameraData?.pitch ?? -25,
      hfov: cameraData?.hfov ?? 65,
      vfov: cameraData?.vfov ?? 42,
      range: cameraData?.range ?? 75,
      status: cameraData?.status || "active",
      ipAddress: cameraData?.ipAddress || "",
      model: cameraData?.model || "",
      coverageColor: cameraData?.coverageColor || CCTV_CAMERA_COLORS[cameraCount % CCTV_CAMERA_COLORS.length],
      notes: cameraData?.notes || "",
    };

    tower.cameras.push(newCam);
    tower.updatedAt = new Date().toISOString();
    this.save();
    return newCam;
  }

  public updateCamera(towerId: string, cameraId: string, updates: Partial<CctvCameraConfig>): CctvCameraConfig | null {
    const tower = this.towers.find((t) => t.id === towerId);
    if (!tower) return null;

    const camIdx = tower.cameras.findIndex((c) => c.id === cameraId);
    if (camIdx === -1) return null;

    const currentCam = tower.cameras[camIdx];
    const updatedCam: CctvCameraConfig = {
      ...currentCam,
      ...updates,
    };

    // Bounds checks
    if (updates.hfov !== undefined) updatedCam.hfov = Math.max(10, Math.min(140, updates.hfov));
    if (updates.vfov !== undefined) updatedCam.vfov = Math.max(10, Math.min(120, updates.vfov));
    if (updates.pitch !== undefined) updatedCam.pitch = Math.max(-89, Math.min(89, updates.pitch));
    if (updates.range !== undefined) updatedCam.range = Math.max(5, Math.min(250, updates.range));
    if (updates.mountingHeight !== undefined) updatedCam.mountingHeight = Math.max(1, Math.min(tower.height, updates.mountingHeight));

    tower.cameras[camIdx] = updatedCam;
    tower.updatedAt = new Date().toISOString();
    this.save();
    return updatedCam;
  }

  public deleteCamera(towerId: string, cameraId: string): boolean {
    const tower = this.towers.find((t) => t.id === towerId);
    if (!tower) return false;

    const initialLen = tower.cameras.length;
    tower.cameras = tower.cameras.filter((c) => c.id !== cameraId);
    if (tower.cameras.length !== initialLen) {
      tower.updatedAt = new Date().toISOString();
      this.save();
      return true;
    }
    return false;
  }

  public resetToDefaults(): void {
    this.towers = JSON.parse(JSON.stringify(DEFAULT_HIPG_TOWERS));
    this.save();
  }
}

export const cctvRepository = new CctvRepository();
