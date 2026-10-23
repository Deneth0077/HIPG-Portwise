import * as THREE from "three";
import {
  createBox,
  createColoredBox,
  createColoredCylinder,
  generateFourWheels,
  safeMerge,
  DETAIL_COLORS,
} from "../geometryHelpers";

export interface VehicleGeometries {
  bodyGeo: THREE.BufferGeometry;
  glassGeo: THREE.BufferGeometry;
  wheelsGeo: THREE.BufferGeometry;
  rimsGeo: THREE.BufferGeometry;
  detailsGeo: THREE.BufferGeometry;
}

/**
 * 1. Standard Midsize Family / Executive Sedan
 */
export function createSedanGeometries(): VehicleGeometries {
  const bodyParts: THREE.BufferGeometry[] = [];
  const glassParts: THREE.BufferGeometry[] = [];
  const detailParts: THREE.BufferGeometry[] = [];

  // Wheel configuration
  const trackX = 0.81;
  const axleY = 0.31;
  const frontZ = 1.28;
  const rearZ = -1.28;
  const tyreR = 0.31;
  const tyreW = 0.21;
  const rimR = 0.20;

  // ---------------- BODY PANELS ----------------
  // Lower chassis & rocker sills
  bodyParts.push(createBox(1.70, 0.26, 2.40, [0, 0.34, 0.0]));

  // Front bumper & nose
  bodyParts.push(createBox(1.72, 0.38, 0.40, [0, 0.38, 1.98]));

  // Front hood (sloping gently forward)
  bodyParts.push(createBox(1.66, 0.16, 1.25, [0, 0.74, 1.30], [-0.06, 0, 0]));

  // Front side fenders (left & right)
  bodyParts.push(createBox(0.18, 0.32, 1.20, [-0.76, 0.60, 1.28]));
  bodyParts.push(createBox(0.18, 0.32, 1.20, [0.76, 0.60, 1.28]));

  // Passenger cabin base / doors
  bodyParts.push(createBox(1.72, 0.48, 1.70, [0, 0.66, -0.15]));

  // Rear trunk / boot deck
  bodyParts.push(createBox(1.68, 0.22, 1.05, [0, 0.76, -1.48]));

  // Rear bumper & lower apron
  bodyParts.push(createBox(1.72, 0.38, 0.38, [0, 0.38, -1.98]));

  // Roof panel
  bodyParts.push(createBox(1.36, 0.07, 1.40, [0, 1.38, -0.16]));

  // A-pillars (sloping down to hood)
  bodyParts.push(createBox(0.08, 0.08, 0.68, [-0.67, 1.10, 0.58], [0.55, 0, 0]));
  bodyParts.push(createBox(0.08, 0.08, 0.68, [0.67, 1.10, 0.58], [0.55, 0, 0]));

  // C-pillars (sloping down to trunk)
  bodyParts.push(createBox(0.10, 0.08, 0.65, [-0.67, 1.10, -0.92], [-0.55, 0, 0]));
  bodyParts.push(createBox(0.10, 0.08, 0.65, [0.67, 1.10, -0.92], [-0.55, 0, 0]));

  // Side mirrors (painted outer shell)
  bodyParts.push(createBox(0.16, 0.10, 0.12, [-0.94, 0.90, 0.52]));
  bodyParts.push(createBox(0.16, 0.10, 0.12, [0.94, 0.90, 0.52]));

  // ---------------- TINTED GLASS ----------------
  // Windshield (sloped)
  glassParts.push(createBox(1.34, 0.48, 0.04, [0, 1.10, 0.60], [0.58, 0, 0]));

  // Rear glass (sloped)
  glassParts.push(createBox(1.32, 0.44, 0.04, [0, 1.10, -0.94], [-0.56, 0, 0]));

  // Left & right side windows
  glassParts.push(createBox(0.03, 0.40, 1.34, [-0.67, 1.10, -0.16]));
  glassParts.push(createBox(0.03, 0.40, 1.34, [0.67, 1.10, -0.16]));

  // ---------------- DETAILS (LIGHTS, GRILLE, PLATES) ----------------
  // LED Headlights (xenon bright)
  detailParts.push(createColoredBox(0.34, 0.12, 0.14, [-0.62, 0.70, 2.06], DETAIL_COLORS.HEADLIGHT));
  detailParts.push(createColoredBox(0.34, 0.12, 0.14, [0.62, 0.70, 2.06], DETAIL_COLORS.HEADLIGHT));

  // Front radiator grille (dark satin slats)
  detailParts.push(createColoredBox(0.70, 0.16, 0.08, [0, 0.66, 2.08], DETAIL_COLORS.GRILLE));
  detailParts.push(createColoredBox(0.74, 0.03, 0.09, [0, 0.74, 2.08], DETAIL_COLORS.CHROME));

  // Lower bumper air intake
  detailParts.push(createColoredBox(0.92, 0.12, 0.08, [0, 0.36, 2.09], DETAIL_COLORS.DARK_PLASTIC));

  // Taillights (ruby red LED clusters)
  detailParts.push(createColoredBox(0.36, 0.14, 0.12, [-0.62, 0.74, -2.06], DETAIL_COLORS.TAILLIGHT));
  detailParts.push(createColoredBox(0.36, 0.14, 0.12, [0.62, 0.74, -2.06], DETAIL_COLORS.TAILLIGHT));
  detailParts.push(createColoredBox(0.12, 0.05, 0.13, [-0.46, 0.72, -2.07], DETAIL_COLORS.TAILLIGHT_AMBER));
  detailParts.push(createColoredBox(0.12, 0.05, 0.13, [0.46, 0.72, -2.07], DETAIL_COLORS.TAILLIGHT_AMBER));

  // Front & rear license plates
  detailParts.push(createColoredBox(0.48, 0.12, 0.03, [0, 0.42, 2.12], DETAIL_COLORS.PLATE_WHITE));
  detailParts.push(createColoredBox(0.48, 0.12, 0.03, [0, 0.46, -2.12], DETAIL_COLORS.PLATE_YELLOW));

  // Mirror glass faces
  detailParts.push(createColoredBox(0.02, 0.08, 0.10, [-0.94, 0.90, 0.48], DETAIL_COLORS.MIRROR_FACE));
  detailParts.push(createColoredBox(0.02, 0.08, 0.10, [0.94, 0.90, 0.48], DETAIL_COLORS.MIRROR_FACE));

  // Shark fin roof antenna
  detailParts.push(createColoredBox(0.06, 0.08, 0.16, [0, 1.44, -0.66], DETAIL_COLORS.BLACK_TRIM));

  // Chrome dual exhaust tips
  detailParts.push(createColoredCylinder(0.04, 0.04, 0.12, 10, [0.55, 0.26, -2.08], DETAIL_COLORS.EXHAUST, [Math.PI / 2, 0, 0]));
  detailParts.push(createColoredCylinder(0.04, 0.04, 0.12, 10, [0.68, 0.26, -2.08], DETAIL_COLORS.EXHAUST, [Math.PI / 2, 0, 0]));

  // Underbody shadow plane
  detailParts.push(createColoredBox(1.58, 0.02, 3.6, [0, 0.12, 0], 0x0a0c0e));

  // ---------------- WHEELS & RIMS ----------------
  const { tyres, rims } = generateFourWheels(trackX, axleY, frontZ, rearZ, tyreR, tyreW, rimR, 5);

  return {
    bodyGeo: safeMerge(bodyParts),
    glassGeo: safeMerge(glassParts),
    wheelsGeo: safeMerge(tyres),
    rimsGeo: safeMerge(rims),
    detailsGeo: safeMerge(detailParts),
  };
}

/**
 * 2. Compact / Hatchback (short rear overhang, steep tailgate, nimble profile)
 */
export function createCompactGeometries(): VehicleGeometries {
  const bodyParts: THREE.BufferGeometry[] = [];
  const glassParts: THREE.BufferGeometry[] = [];
  const detailParts: THREE.BufferGeometry[] = [];

  const trackX = 0.77;
  const axleY = 0.29;
  const frontZ = 1.15;
  const rearZ = -1.15;
  const tyreR = 0.29;
  const tyreW = 0.19;
  const rimR = 0.18;

  // Lower chassis
  bodyParts.push(createBox(1.62, 0.24, 2.15, [0, 0.32, 0.0]));

  // Front bumper
  bodyParts.push(createBox(1.64, 0.36, 0.38, [0, 0.36, 1.74]));

  // Front hood (rounded steep slope)
  bodyParts.push(createBox(1.58, 0.16, 1.05, [0, 0.72, 1.14], [-0.09, 0, 0]));
  bodyParts.push(createBox(0.16, 0.30, 1.05, [-0.73, 0.58, 1.14]));
  bodyParts.push(createBox(0.16, 0.30, 1.05, [0.73, 0.58, 1.14]));

  // Passenger cabin
  bodyParts.push(createBox(1.64, 0.48, 1.65, [0, 0.65, -0.15]));

  // Rear steep hatchback hatch & short bumper
  bodyParts.push(createBox(1.64, 0.40, 0.32, [0, 0.38, -1.72]));
  bodyParts.push(createBox(1.58, 0.28, 0.45, [0, 0.74, -1.48]));

  // Roof & rear roof spoiler
  bodyParts.push(createBox(1.30, 0.06, 1.35, [0, 1.40, -0.22]));
  bodyParts.push(createBox(1.32, 0.06, 0.22, [0, 1.42, -0.92])); // Hatch spoiler lip

  // Pillars
  bodyParts.push(createBox(0.07, 0.07, 0.64, [-0.63, 1.10, 0.48], [0.60, 0, 0]));
  bodyParts.push(createBox(0.07, 0.07, 0.64, [0.63, 1.10, 0.48], [0.60, 0, 0]));
  bodyParts.push(createBox(0.08, 0.07, 0.55, [-0.64, 1.12, -0.82], [-0.45, 0, 0]));
  bodyParts.push(createBox(0.08, 0.07, 0.55, [0.64, 1.12, -0.82], [-0.45, 0, 0]));

  // Mirrors
  bodyParts.push(createBox(0.15, 0.10, 0.11, [-0.89, 0.88, 0.44]));
  bodyParts.push(createBox(0.15, 0.10, 0.11, [0.89, 0.88, 0.44]));

  // Glass
  glassParts.push(createBox(1.26, 0.46, 0.04, [0, 1.10, 0.50], [0.62, 0, 0]));
  glassParts.push(createBox(1.22, 0.46, 0.04, [0, 1.12, -0.82], [-0.48, 0, 0])); // Steep hatch glass
  glassParts.push(createBox(0.03, 0.42, 1.25, [-0.64, 1.10, -0.20]));
  glassParts.push(createBox(0.03, 0.42, 1.25, [0.64, 1.10, -0.20]));

  // Details
  detailParts.push(createColoredBox(0.32, 0.12, 0.12, [-0.58, 0.68, 1.82], DETAIL_COLORS.HEADLIGHT));
  detailParts.push(createColoredBox(0.32, 0.12, 0.12, [0.58, 0.68, 1.82], DETAIL_COLORS.HEADLIGHT));
  detailParts.push(createColoredBox(0.60, 0.14, 0.08, [0, 0.64, 1.84], DETAIL_COLORS.GRILLE));
  detailParts.push(createColoredBox(0.80, 0.10, 0.08, [0, 0.35, 1.84], DETAIL_COLORS.DARK_PLASTIC));

  detailParts.push(createColoredBox(0.28, 0.22, 0.12, [-0.58, 0.80, -1.74], DETAIL_COLORS.TAILLIGHT));
  detailParts.push(createColoredBox(0.28, 0.22, 0.12, [0.58, 0.80, -1.74], DETAIL_COLORS.TAILLIGHT));

  detailParts.push(createColoredBox(0.44, 0.11, 0.03, [0, 0.40, 1.86], DETAIL_COLORS.PLATE_WHITE));
  detailParts.push(createColoredBox(0.44, 0.11, 0.03, [0, 0.44, -1.84], DETAIL_COLORS.PLATE_YELLOW));

  detailParts.push(createColoredBox(0.02, 0.08, 0.09, [-0.89, 0.88, 0.40], DETAIL_COLORS.MIRROR_FACE));
  detailParts.push(createColoredBox(0.02, 0.08, 0.09, [0.89, 0.88, 0.40], DETAIL_COLORS.MIRROR_FACE));

  detailParts.push(createColoredCylinder(0.035, 0.035, 0.10, 8, [0.48, 0.25, -1.82], DETAIL_COLORS.EXHAUST, [Math.PI / 2, 0, 0]));
  detailParts.push(createColoredBox(1.50, 0.02, 3.1, [0, 0.12, 0], 0x0a0c0e));

  const { tyres, rims } = generateFourWheels(trackX, axleY, frontZ, rearZ, tyreR, tyreW, rimR, 5);

  return {
    bodyGeo: safeMerge(bodyParts),
    glassGeo: safeMerge(glassParts),
    wheelsGeo: safeMerge(tyres),
    rimsGeo: safeMerge(rims),
    detailsGeo: safeMerge(detailParts),
  };
}

/**
 * 3. Luxury Executive Sedan (longer wheelbase, elongated hood, chrome accents)
 */
export function createLuxurySedanGeometries(): VehicleGeometries {
  const bodyParts: THREE.BufferGeometry[] = [];
  const glassParts: THREE.BufferGeometry[] = [];
  const detailParts: THREE.BufferGeometry[] = [];

  const trackX = 0.84;
  const axleY = 0.31;
  const frontZ = 1.42;
  const rearZ = -1.45;
  const tyreR = 0.31;
  const tyreW = 0.23;
  const rimR = 0.21;

  // Lower chassis
  bodyParts.push(createBox(1.78, 0.26, 2.75, [0, 0.34, 0.0]));

  // Front bumper
  bodyParts.push(createBox(1.80, 0.38, 0.42, [0, 0.38, 2.18]));

  // Elongated prestigious hood
  bodyParts.push(createBox(1.74, 0.16, 1.45, [0, 0.74, 1.44], [-0.05, 0, 0]));
  bodyParts.push(createBox(0.18, 0.32, 1.45, [-0.80, 0.60, 1.44]));
  bodyParts.push(createBox(0.18, 0.32, 1.45, [0.80, 0.60, 1.44]));

  // Executive passenger cabin
  bodyParts.push(createBox(1.78, 0.48, 1.95, [0, 0.66, -0.22]));

  // Sculpted rear boot deck
  bodyParts.push(createBox(1.74, 0.22, 1.15, [0, 0.76, -1.68]));
  bodyParts.push(createBox(1.80, 0.38, 0.40, [0, 0.38, -2.18]));

  // Sleek tapered roof
  bodyParts.push(createBox(1.40, 0.07, 1.62, [0, 1.40, -0.24]));

  // Pillars
  bodyParts.push(createBox(0.08, 0.08, 0.72, [-0.70, 1.11, 0.62], [0.55, 0, 0]));
  bodyParts.push(createBox(0.08, 0.08, 0.72, [0.70, 1.11, 0.62], [0.55, 0, 0]));
  bodyParts.push(createBox(0.09, 0.08, 0.75, [-0.70, 1.11, -1.08], [-0.52, 0, 0]));
  bodyParts.push(createBox(0.09, 0.08, 0.75, [0.70, 1.11, -1.08], [-0.52, 0, 0]));

  // Mirrors
  bodyParts.push(createBox(0.17, 0.10, 0.12, [-0.98, 0.90, 0.58]));
  bodyParts.push(createBox(0.17, 0.10, 0.12, [0.98, 0.90, 0.58]));

  // Glass
  glassParts.push(createBox(1.38, 0.50, 0.04, [0, 1.11, 0.65], [0.57, 0, 0]));
  glassParts.push(createBox(1.36, 0.48, 0.04, [0, 1.11, -1.10], [-0.54, 0, 0]));
  glassParts.push(createBox(0.03, 0.42, 1.58, [-0.69, 1.11, -0.24]));
  glassParts.push(createBox(0.03, 0.42, 1.58, [0.69, 1.11, -0.24]));

  // Details
  detailParts.push(createColoredBox(0.38, 0.12, 0.15, [-0.66, 0.70, 2.26], DETAIL_COLORS.HEADLIGHT));
  detailParts.push(createColoredBox(0.38, 0.12, 0.15, [0.66, 0.70, 2.26], DETAIL_COLORS.HEADLIGHT));

  // Chrome waterfall grille
  detailParts.push(createColoredBox(0.80, 0.20, 0.09, [0, 0.66, 2.28], DETAIL_COLORS.GRILLE));
  detailParts.push(createColoredBox(0.84, 0.04, 0.10, [0, 0.77, 2.28], DETAIL_COLORS.CHROME));
  detailParts.push(createColoredBox(0.04, 0.20, 0.10, [0, 0.66, 2.29], DETAIL_COLORS.CHROME));

  // Continuous LED rear light bar
  detailParts.push(createColoredBox(1.56, 0.09, 0.10, [0, 0.74, -2.26], DETAIL_COLORS.TAILLIGHT));
  detailParts.push(createColoredBox(0.42, 0.14, 0.12, [-0.66, 0.74, -2.25], DETAIL_COLORS.TAILLIGHT));
  detailParts.push(createColoredBox(0.42, 0.14, 0.12, [0.66, 0.74, -2.25], DETAIL_COLORS.TAILLIGHT));
  detailParts.push(createColoredBox(1.60, 0.03, 0.11, [0, 0.79, -2.26], DETAIL_COLORS.CHROME)); // Chrome strip

  // Quad chrome exhaust tips
  detailParts.push(createColoredCylinder(0.04, 0.04, 0.12, 10, [-0.55, 0.26, -2.28], DETAIL_COLORS.EXHAUST, [Math.PI / 2, 0, 0]));
  detailParts.push(createColoredCylinder(0.04, 0.04, 0.12, 10, [-0.66, 0.26, -2.28], DETAIL_COLORS.EXHAUST, [Math.PI / 2, 0, 0]));
  detailParts.push(createColoredCylinder(0.04, 0.04, 0.12, 10, [0.55, 0.26, -2.28], DETAIL_COLORS.EXHAUST, [Math.PI / 2, 0, 0]));
  detailParts.push(createColoredCylinder(0.04, 0.04, 0.12, 10, [0.66, 0.26, -2.28], DETAIL_COLORS.EXHAUST, [Math.PI / 2, 0, 0]));

  // License plates
  detailParts.push(createColoredBox(0.50, 0.12, 0.03, [0, 0.42, 2.32], DETAIL_COLORS.PLATE_WHITE));
  detailParts.push(createColoredBox(0.50, 0.12, 0.03, [0, 0.46, -2.32], DETAIL_COLORS.PLATE_YELLOW));

  // Mirror glass
  detailParts.push(createColoredBox(0.02, 0.08, 0.10, [-0.98, 0.90, 0.54], DETAIL_COLORS.MIRROR_FACE));
  detailParts.push(createColoredBox(0.02, 0.08, 0.10, [0.98, 0.90, 0.54], DETAIL_COLORS.MIRROR_FACE));

  // Shark fin
  detailParts.push(createColoredBox(0.06, 0.08, 0.18, [0, 1.46, -0.80], DETAIL_COLORS.BLACK_TRIM));
  detailParts.push(createColoredBox(1.68, 0.02, 4.0, [0, 0.12, 0], 0x0a0c0e));

  const { tyres, rims } = generateFourWheels(trackX, axleY, frontZ, rearZ, tyreR, tyreW, rimR, 8);

  return {
    bodyGeo: safeMerge(bodyParts),
    glassGeo: safeMerge(glassParts),
    wheelsGeo: safeMerge(tyres),
    rimsGeo: safeMerge(rims),
    detailsGeo: safeMerge(detailParts),
  };
}
