/**
 * HIPG 3D Digital Twin - Line-Based 3D Security Fence & Wall Types
 *
 * Supports free-form line segments, point-to-point drawing,
 * adjustable endpoints, posts, wire mesh, and barbed wire.
 */

export type FenceType = "chainlink" | "security_mesh" | "concrete_wall" | "barbed_wire";

export interface FencePoint {
  x: number;
  z: number;
}

export interface FenceSegment {
  id: string;
  name: string;
  type: FenceType;
  /** Start point of the fence line in 3D ground coordinates */
  startPoint: FencePoint;
  /** End point of the fence line in 3D ground coordinates */
  endPoint: FencePoint;
  /** Midpoint X coordinate (derived or stored) */
  x: number;
  /** Midpoint Z coordinate (derived or stored) */
  z: number;
  /** Exact length of the fence line segment in meters */
  length: number;
  /** Direction angle of the fence line in degrees [0, 360) */
  rotation: number;
  /** Height of the fence in meters (typically 2.0m - 4.0m) */
  height: number;
  /** Thickness / depth of the fence posts & mesh (typically 0.15m - 0.3m) */
  depth: number;
  /** Whether the fence line includes a top 3-strand barbed wire / razor wire topper */
  hasBarbedWire?: boolean;
  /** Whether the fence line displays reflective security warning placards */
  hasWarningSign?: boolean;
  /** Optional custom color override */
  color?: string;
  /** Optional reference to the yard or building it encloses */
  attachedToAreaId?: string;
  isCustom?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFenceInput {
  id?: string;
  name?: string;
  type?: FenceType;
  startPoint: FencePoint;
  endPoint: FencePoint;
  height?: number;
  depth?: number;
  hasBarbedWire?: boolean;
  hasWarningSign?: boolean;
  color?: string;
  attachedToAreaId?: string;
  isCustom?: boolean;
}

/**
 * Computes midpoint, length, and rotation angle for a fence line connecting two points.
 */
export function computeFenceLineGeometry(start: FencePoint, end: FencePoint) {
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const length = Math.max(1, Math.round(Math.hypot(dx, dz) * 10) / 10);
  const midX = Math.round(((start.x + end.x) / 2) * 10) / 10;
  const midZ = Math.round(((start.z + end.z) / 2) * 10) / 10;
  const angleRad = Math.atan2(dz, dx);
  const rotation = Math.round(((angleRad * 180) / Math.PI + 360) % 360);

  return { midX, midZ, length, rotation };
}
