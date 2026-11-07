/**
 * Port Ground Placement & Boundary Validation
 *
 * Validates whether a proposed 3D coordinate and bounding box is on legitimate
 * port terminal land, or invalid (e.g. open sea, harbour water basin, outside concession boundary).
 */

interface Point2D {
  x: number;
  z: number;
}

// Hambantota Harbour Basin polygon (water coordinates)
const WATER_BASIN_POLYGON: Point2D[] = [
  { x: -140.0, z: -170.0 }, // NW basin corner (Berths 09 & 08)
  { x: -140.0, z: -16.67 }, // SW basin corner (Berths 07 & 06)
  { x: 106.73, z: -16.67 }, // Southern basin quay end (Berth 04 end)
  { x: 155.76, z: 32.36 },  // Angled Berth 03 end / Berth 02 start
  { x: 155.76, z: 267.36 }, // Service Berth end (Eastern quay southern tip)
  { x: 155.76, z: 750.0 },  // Deep southern sea limit
  { x: 1200.0, z: 750.0 },  // Far south-eastern sea boundary
  { x: 1200.0, z: -450.0 }, // Far north-eastern sea boundary
  { x: 190.0, z: -450.0 },  // North channel boundary
  { x: 190.0, z: -220.0 },  // Channel bend
  { x: 139.51, z: -220.0 }, // Northern basin channel mouth
  { x: 139.51, z: -170.0 }, // NE quay corner (Berth 11 end)
];

// Terminal Land concession boundaries
export const PORT_BOUNDS = {
  minX: -280,
  maxX: 260,
  minZ: -290,
  maxZ: 260,
};

/**
 * Standard ray-casting point-in-polygon algorithm
 */
function isPointInPolygon(point: Point2D, polygon: Point2D[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const zi = polygon[i].z;
    const xj = polygon[j].x;
    const zj = polygon[j].z;

    const intersect =
      zi > point.z !== zj > point.z &&
      point.x < ((xj - xi) * (point.z - zi)) / (zj - zi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export interface PlacementValidationResult {
  isValid: boolean;
  reason?: string;
}

/**
 * Validates whether an object of given size at (x, z) can be legally placed on the port map.
 */
export function validatePortPlacement(
  x: number,
  z: number,
  width: number = 4,
  length: number = 4,
  rotationDeg: number = 0
): PlacementValidationResult {
  // 1. Concession boundary check
  if (
    x < PORT_BOUNDS.minX ||
    x > PORT_BOUNDS.maxX ||
    z < PORT_BOUNDS.minZ ||
    z > PORT_BOUNDS.maxZ
  ) {
    return {
      isValid: false,
      reason: "Position is outside HIPG terminal concession boundary",
    };
  }

  // 2. Check center point against water basin
  if (isPointInPolygon({ x, z }, WATER_BASIN_POLYGON)) {
    return {
      isValid: false,
      reason: "Cannot place infrastructure in water or harbour basin",
    };
  }

  // 3. Check 4 bounding box footprint corners
  const rad = (rotationDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const hw = width / 2;
  const hl = length / 2;

  const corners: Point2D[] = [
    { x: x + (-hw * cos - -hl * sin), z: z + (-hw * sin + -hl * cos) },
    { x: x + (hw * cos - -hl * sin), z: z + (hw * sin + -hl * cos) },
    { x: x + (hw * cos - hl * sin), z: z + (hw * sin + hl * cos) },
    { x: x + (-hw * cos - hl * sin), z: z + (-hw * sin + hl * cos) },
  ];

  for (const corner of corners) {
    if (
      corner.x < PORT_BOUNDS.minX ||
      corner.x > PORT_BOUNDS.maxX ||
      corner.z < PORT_BOUNDS.minZ ||
      corner.z > PORT_BOUNDS.maxZ
    ) {
      return {
        isValid: false,
        reason: "Object footprint extends outside concession boundaries",
      };
    }

    if (isPointInPolygon(corner, WATER_BASIN_POLYGON)) {
      return {
        isValid: false,
        reason: "Object footprint overlaps with water basin / quay edge",
      };
    }
  }

  return {
    isValid: true,
  };
}

