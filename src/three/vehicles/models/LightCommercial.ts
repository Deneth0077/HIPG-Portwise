import * as THREE from "three";
import {
  createBox,
  createColoredBox,
  createColoredCylinder,
  generateFourWheels,
  safeMerge,
  DETAIL_COLORS,
} from "../geometryHelpers";
import type { VehicleGeometries } from "./PassengerCar";

/**
 * Light Commercial Vehicle (Dual-Cab Pickup Truck / Utility)
 * Features: 4-door passenger cab, open rear cargo bed, tubular roll bar, all-terrain stance.
 */
export function createPickupGeometries(): VehicleGeometries {
  const bodyParts: THREE.BufferGeometry[] = [];
  const glassParts: THREE.BufferGeometry[] = [];
  const detailParts: THREE.BufferGeometry[] = [];

  const trackX = 0.85;
  const axleY = 0.35;
  const frontZ = 1.30;
  const rearZ = -1.30;
  const tyreR = 0.35;
  const tyreW = 0.24;
  const rimR = 0.22;

  // ---------------- BODY PANELS ----------------
  // Heavy ladder frame / rocker base
  bodyParts.push(createBox(1.78, 0.28, 2.60, [0, 0.44, 0.0]));

  // Front bumper & steel impact bar
  bodyParts.push(createBox(1.82, 0.42, 0.40, [0, 0.46, 2.10]));

  // Muscular high hood
  bodyParts.push(createBox(1.74, 0.20, 1.30, [0, 0.88, 1.38], [-0.04, 0, 0]));
  bodyParts.push(createBox(0.20, 0.36, 1.30, [-0.80, 0.72, 1.36]));
  bodyParts.push(createBox(0.20, 0.36, 1.30, [0.80, 0.72, 1.36]));

  // Dual-Cab Passenger Compartment
  bodyParts.push(createBox(1.80, 0.54, 1.50, [0, 0.76, 0.12]));

  // Cab Roof
  bodyParts.push(createBox(1.44, 0.07, 1.30, [0, 1.62, 0.08]));

  // Cab A-pillars & rear cab pillars
  bodyParts.push(createBox(0.08, 0.08, 0.70, [-0.71, 1.28, 0.68], [0.52, 0, 0]));
  bodyParts.push(createBox(0.08, 0.08, 0.70, [0.71, 1.28, 0.68], [0.52, 0, 0]));
  bodyParts.push(createBox(0.12, 0.50, 0.12, [-0.71, 1.30, -0.52]));
  bodyParts.push(createBox(0.12, 0.50, 0.12, [0.71, 1.30, -0.52]));

  // Open Cargo Bed Outer Walls & Tailgate
  bodyParts.push(createBox(0.16, 0.52, 1.55, [-0.81, 0.76, -1.35])); // Left side wall
  bodyParts.push(createBox(0.16, 0.52, 1.55, [0.81, 0.76, -1.35]));  // Right side wall
  bodyParts.push(createBox(1.80, 0.52, 0.14, [0, 0.76, -2.08]));     // Drop Tailgate
  bodyParts.push(createBox(1.82, 0.36, 0.26, [0, 0.44, -2.14]));     // Rear bumper step

  // Mirrors
  bodyParts.push(createBox(0.18, 0.12, 0.13, [-1.02, 1.05, 0.55]));
  bodyParts.push(createBox(0.18, 0.12, 0.13, [1.02, 1.05, 0.55]));

  // ---------------- TINTED GLASS ----------------
  // Windshield
  glassParts.push(createBox(1.42, 0.54, 0.04, [0, 1.28, 0.70], [0.54, 0, 0]));

  // Rear vertical cab window
  glassParts.push(createBox(1.36, 0.44, 0.04, [0, 1.32, -0.54]));

  // Dual-cab side windows
  glassParts.push(createBox(0.03, 0.48, 1.18, [-0.71, 1.30, 0.08]));
  glassParts.push(createBox(0.03, 0.48, 1.18, [0.71, 1.30, 0.08]));

  // ---------------- DETAILS (ROLL BAR, BED LINER, LIGHTS) ----------------
  // Tubular Roll Bar / Sports Bar behind cab
  [-0.68, 0.68].forEach((bx) => {
    // Upright tubular pillar
    detailParts.push(createColoredCylinder(0.04, 0.04, 0.65, 10, [bx, 1.34, -0.68], DETAIL_COLORS.ROLL_BAR));
    // Diagonal support stay
    detailParts.push(createColoredBox(0.06, 0.06, 0.70, [bx, 1.18, -0.98], DETAIL_COLORS.ROLL_BAR, [0.65, 0, 0]));
  });
  // Cross horizontal tube
  detailParts.push(createColoredCylinder(0.04, 0.04, 1.40, 10, [0, 1.64, -0.68], DETAIL_COLORS.ROLL_BAR, [0, 0, Math.PI / 2]));

  // Bed Liner (Inner ribbed floor and bulkheads)
  detailParts.push(createColoredBox(1.46, 0.04, 1.45, [0, 0.52, -1.35], DETAIL_COLORS.BED_LINER));
  detailParts.push(createColoredBox(1.46, 0.44, 0.04, [0, 0.74, -0.62], DETAIL_COLORS.BED_LINER));

  // Wheel arch flares
  [-frontZ, frontZ].forEach((z) => {
    [-0.88, 0.88].forEach((x) => {
      detailParts.push(createColoredBox(0.10, 0.16, 0.76, [x, 0.48, z], DETAIL_COLORS.DARK_PLASTIC));
    });
  });

  // Front bold truck grille & skid plate
  detailParts.push(createColoredBox(0.92, 0.28, 0.08, [0, 0.78, 2.20], DETAIL_COLORS.GRILLE));
  detailParts.push(createColoredBox(0.96, 0.05, 0.09, [0, 0.90, 2.20], DETAIL_COLORS.CHROME));
  detailParts.push(createColoredBox(0.78, 0.18, 0.12, [0, 0.36, 2.24], DETAIL_COLORS.SKID_PLATE, [-0.25, 0, 0]));

  // Headlights
  detailParts.push(createColoredBox(0.36, 0.16, 0.14, [-0.68, 0.82, 2.18], DETAIL_COLORS.HEADLIGHT));
  detailParts.push(createColoredBox(0.36, 0.16, 0.14, [0.68, 0.82, 2.18], DETAIL_COLORS.HEADLIGHT));

  // Vertical rear taillights
  detailParts.push(createColoredBox(0.14, 0.42, 0.10, [-0.82, 0.78, -2.12], DETAIL_COLORS.TAILLIGHT));
  detailParts.push(createColoredBox(0.14, 0.42, 0.10, [0.82, 0.78, -2.12], DETAIL_COLORS.TAILLIGHT));

  // License plates
  detailParts.push(createColoredBox(0.50, 0.12, 0.03, [0, 0.50, 2.26], DETAIL_COLORS.PLATE_WHITE));
  detailParts.push(createColoredBox(0.50, 0.12, 0.03, [0, 0.46, -2.26], DETAIL_COLORS.PLATE_YELLOW));

  // Mirror glass
  detailParts.push(createColoredBox(0.02, 0.10, 0.11, [-1.02, 1.05, 0.51], DETAIL_COLORS.MIRROR_FACE));
  detailParts.push(createColoredBox(0.02, 0.10, 0.11, [1.02, 1.05, 0.51], DETAIL_COLORS.MIRROR_FACE));

  // Exhaust
  detailParts.push(createColoredCylinder(0.045, 0.045, 0.12, 10, [0.65, 0.30, -2.16], DETAIL_COLORS.EXHAUST, [Math.PI / 2, 0, 0]));

  // Underbody shadow
  detailParts.push(createColoredBox(1.70, 0.02, 3.8, [0, 0.14, 0], 0x0a0c0e));

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
