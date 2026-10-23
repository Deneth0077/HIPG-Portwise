import * as THREE from "three";
import {
  createBox,
  createColoredBox,
  generateFourWheels,
  safeMerge,
  DETAIL_COLORS,
} from "../geometryHelpers";
import type { VehicleGeometries } from "./PassengerCar";

/**
 * Commercial Utility Delivery Van
 */
export function createDeliveryVanGeometries(): VehicleGeometries {
  const bodyParts: THREE.BufferGeometry[] = [];
  const glassParts: THREE.BufferGeometry[] = [];
  const detailParts: THREE.BufferGeometry[] = [];

  const trackX = 0.86;
  const axleY = 0.33;
  const frontZ = 1.35;
  const rearZ = -1.35;
  const tyreR = 0.33;
  const tyreW = 0.22;
  const rimR = 0.20;

  // ---------------- BODY PANELS ----------------
  // Heavy floor base
  bodyParts.push(createBox(1.86, 0.32, 2.70, [0, 0.42, 0.0]));

  // Commercial front bumper & lower nose
  bodyParts.push(createBox(1.88, 0.44, 0.44, [0, 0.44, 2.12]));

  // Short commercial sloping hood
  bodyParts.push(createBox(1.82, 0.32, 0.85, [0, 0.82, 1.62], [-0.12, 0, 0]));

  // Large high-roof cargo box / cabin
  bodyParts.push(createBox(1.88, 1.25, 3.20, [0, 1.25, -0.42]));

  // Cab upper transition (between windshield and roof)
  bodyParts.push(createBox(1.86, 0.22, 0.70, [0, 1.82, 0.85]));

  // A-pillars
  bodyParts.push(createBox(0.09, 0.09, 0.76, [-0.84, 1.32, 1.05], [0.55, 0, 0]));
  bodyParts.push(createBox(0.09, 0.09, 0.76, [0.84, 1.32, 1.05], [0.55, 0, 0]));

  // Rear twin barn door frames & rear step bumper
  bodyParts.push(createBox(1.88, 0.36, 0.28, [0, 0.42, -2.12]));

  // ---------------- TINTED GLASS ----------------
  // Large upright commercial windshield
  glassParts.push(createBox(1.64, 0.62, 0.04, [0, 1.30, 1.10], [0.56, 0, 0]));

  // Driver & passenger cab side windows
  glassParts.push(createBox(0.04, 0.50, 0.75, [-0.91, 1.32, 0.65]));
  glassParts.push(createBox(0.04, 0.50, 0.75, [0.91, 1.32, 0.65]));

  // Rear twin door small windows
  glassParts.push(createBox(0.60, 0.38, 0.04, [-0.44, 1.45, -2.04]));
  glassParts.push(createBox(0.60, 0.38, 0.04, [0.44, 1.45, -2.04]));

  // ---------------- DETAILS (LIGHTS, GRILLE, REAR STEP) ----------------
  // Dark commercial bumper & grille
  detailParts.push(createColoredBox(1.02, 0.32, 0.10, [0, 0.72, 2.22], DETAIL_COLORS.GRILLE));
  detailParts.push(createColoredBox(1.88, 0.16, 0.12, [0, 0.38, 2.26], DETAIL_COLORS.DARK_PLASTIC));

  // Commercial Headlights + Indicators
  detailParts.push(createColoredBox(0.36, 0.18, 0.14, [-0.72, 0.78, 2.22], DETAIL_COLORS.HEADLIGHT));
  detailParts.push(createColoredBox(0.36, 0.18, 0.14, [0.72, 0.78, 2.22], DETAIL_COLORS.HEADLIGHT));
  detailParts.push(createColoredBox(0.12, 0.14, 0.12, [-0.88, 0.76, 2.18], DETAIL_COLORS.TAILLIGHT_AMBER));
  detailParts.push(createColoredBox(0.12, 0.14, 0.12, [0.88, 0.76, 2.18], DETAIL_COLORS.TAILLIGHT_AMBER));

  // High-mounted D-pillar vertical taillights
  detailParts.push(createColoredBox(0.12, 0.65, 0.08, [-0.88, 1.25, -2.05], DETAIL_COLORS.TAILLIGHT));
  detailParts.push(createColoredBox(0.12, 0.65, 0.08, [0.88, 1.25, -2.05], DETAIL_COLORS.TAILLIGHT));

  // Rear loading step bumper
  detailParts.push(createColoredBox(1.50, 0.10, 0.18, [0, 0.32, -2.22], DETAIL_COLORS.DARK_PLASTIC));

  // Rear twin barn door vertical center split seam
  detailParts.push(createColoredBox(0.02, 1.40, 0.02, [0, 1.22, -2.04], DETAIL_COLORS.BLACK_TRIM));
  // Door handles
  detailParts.push(createColoredBox(0.10, 0.04, 0.03, [-0.08, 1.05, -2.05], DETAIL_COLORS.BLACK_TRIM));

  // Large commercial wing mirrors with dual bracket arms
  [-1.04, 1.04].forEach((mx) => {
    detailParts.push(createColoredBox(0.10, 0.22, 0.12, [mx, 1.25, 0.90], DETAIL_COLORS.DARK_PLASTIC));
    detailParts.push(createColoredBox(0.02, 0.18, 0.10, [mx, 1.25, 0.85], DETAIL_COLORS.MIRROR_FACE));
    // Bracket arms connecting to cab door
    const armX = mx < 0 ? mx + 0.06 : mx - 0.06;
    detailParts.push(createColoredBox(0.08, 0.03, 0.03, [armX, 1.32, 0.88], DETAIL_COLORS.BLACK_TRIM));
    detailParts.push(createColoredBox(0.08, 0.03, 0.03, [armX, 1.18, 0.88], DETAIL_COLORS.BLACK_TRIM));
  });

  // Roof longitudinal reinforcement ribs
  [-0.55, -0.20, 0.20, 0.55].forEach((rx) => {
    detailParts.push(createColoredBox(0.04, 0.04, 2.70, [rx, 1.90, -0.45], DETAIL_COLORS.DARK_PLASTIC));
  });

  // License plates
  detailParts.push(createColoredBox(0.50, 0.12, 0.03, [0, 0.44, 2.30], DETAIL_COLORS.PLATE_WHITE));
  detailParts.push(createColoredBox(0.50, 0.12, 0.03, [-0.35, 0.75, -2.06], DETAIL_COLORS.PLATE_YELLOW));

  // Underbody shadow
  detailParts.push(createColoredBox(1.76, 0.02, 4.0, [0, 0.14, 0], 0x0a0c0e));

  // ---------------- WHEELS & RIMS ----------------
  const { tyres, rims } = generateFourWheels(trackX, axleY, frontZ, rearZ, tyreR, tyreW, rimR, 6);

  return {
    bodyGeo: safeMerge(bodyParts),
    glassGeo: safeMerge(glassParts),
    wheelsGeo: safeMerge(tyres),
    rimsGeo: safeMerge(rims),
    detailsGeo: safeMerge(detailParts),
  };
}

/**
 * Passenger Minibus (van chassis with full-length passenger window band and seating greenhouse)
 */
export function createMinibusGeometries(): VehicleGeometries {
  const van = createDeliveryVanGeometries();
  const glassParts: THREE.BufferGeometry[] = [];

  // Window band along both passenger sides
  glassParts.push(createBox(0.04, 0.50, 2.05, [-0.91, 1.35, -0.75]));
  glassParts.push(createBox(0.04, 0.50, 2.05, [0.91, 1.35, -0.75]));

  const mergedGlass = safeMerge([van.glassGeo, ...glassParts]);

  return {
    ...van,
    glassGeo: mergedGlass,
  };
}
