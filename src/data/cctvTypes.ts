export type CctvCameraType = "bullet" | "dome" | "ptz" | "fixed" | "other";

export type CctvStatus = "active" | "inactive" | "maintenance";

export interface CctvCameraConfig {
  id: string;
  name: string;
  type: CctvCameraType;
  /** Vertical mounting offset from tower base (meters) */
  mountingHeight: number;
  /** Horizontal direction / yaw in degrees [0, 360) where 0 = +Z (South), 90 = +X (East), etc. */
  yaw: number;
  /** Vertical tilt / pitch in degrees [-89, 89], negative tilts down toward ground, positive tilts up */
  pitch: number;
  /** Horizontal Field of View (degrees) [10, 140] */
  hfov: number;
  /** Vertical Field of View (degrees) [10, 120] */
  vfov: number;
  /** Effective detection/coverage range in scene units/meters [5, 250] */
  range: number;
  status: CctvStatus;
  /** IP Address assigned to this network CCTV camera */
  ipAddress?: string;
  /** Camera hardware model / make (e.g. Hikvision DS-2CD2T87G2-L, Dahua IPC-HFW5842E-Z4E) */
  model?: string;
  /** Optional camera color for distinguishing coverage frustums */
  coverageColor?: string;
  notes?: string;
}

export interface CctvTowerConfig {
  id: string;
  code: string;
  name: string;
  /** 3D World coordinates */
  x: number;
  y: number; // Ground height, typically 0
  z: number;
  /** Tower structure height in meters [4, 40] */
  height: number;
  /** Overall tower base rotation (degrees) [0, 360) */
  rotation: number;
  status: CctvStatus;
  notes?: string;
  cameras: CctvCameraConfig[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCctvTowerInput {
  code: string;
  name: string;
  x: number;
  y?: number;
  z: number;
  height: number;
  rotation?: number;
  status: CctvStatus;
  notes?: string;
  initialCamerasCount?: number;
}
