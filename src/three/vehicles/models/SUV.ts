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
 * Modern SUV & 4x4 Off-Road Vehicle
 * Features: High ground clearance, all-terrain tyres, roof rails, rugged wheel arches, front skid plate.
 */
export function createSUVGeometries(): VehicleGeometries {
  const bodyParts: THREE.BufferGeometry[] = [];
  const glassParts: THREE.BufferGeometry[] = [];
  const detailParts: THREE.BufferGeometry[] = [];

  const trackX = 0.85;
  const axleY = 0.35;
  const frontZ = 1.32;
  const rearZ = -1.32;
  const tyreR = 0.35;
  const tyreW = 0.24;
  const rimR = 0.22;

  // ---------------- BODY PANELS ----------------
  // Elevated main floor / rocker base
  bodyParts.push(createBox(1.78, 0.28, 2.50, [0, 0.44, 0.0]));

  // Front bumper & robust nose
  bodyParts.push(createBox(1.82, 0.44, 0.42, [0, 0.46, 2.08]));

  // Muscular high hood
  bodyParts.push(createBox(1.74, 0.20, 1.32, [0, 0.88, 1.36], [-0.04, 0, 0]));
  bodyParts.push(createBox(0.20, 0.36, 1.30, [-0.80, 0.72, 1.34]));
  bodyParts.push(createBox(0.20, 0.36, 1.30, [0.80, 0.72, 1.34]));

  // Tall cabin body
  bodyParts.push(createBox(1.82, 0.54, 2.05, [0, 0.76, -0.22]));

  // Upright rear tailgate & bumper
  bodyParts.push(createBox(1.82, 0.44, 0.38, [0, 0.46, -2.06]));
  bodyParts.push(createBox(1.78, 0.32, 0.55, [0, 0.84, -1.82]));

  // Flat high roof panel
  bodyParts.push(createBox(1.44, 0.07, 1.78, [0, 1.62, -0.25]));

  // Pillars (A, B, C, D pillars for full wagon greenhouse)
  bodyParts.push(createBox(0.08, 0.08, 0.72, [-0.71, 1.28, 0.64], [0.52, 0, 0]));
  bodyParts.push(createBox(0.08, 0.08, 0.72, [0.71, 1.28, 0.64], [0.52, 0, 0]));
  bodyParts.push(createBox(0.09, 0.08, 0.60, [-0.71, 1.32, -1.16], [-0.32, 0, 0]));
  bodyParts.push(createBox(0.09, 0.08, 0.60, [0.71, 1.32, -1.16], [-0.32, 0, 0]));

  // Side mirrors
  bodyParts.push(createBox(0.18, 0.12, 0.13, [-1.02, 1.05, 0.55]));
  bodyParts.push(createBox(0.18, 0.12, 0.13, [1.02, 1.05, 0.55]));

  // ---------------- TINTED GLASS ----------------
  // Tall windshield
  glassParts.push(createBox(1.42, 0.54, 0.04, [0, 1.28, 0.66], [0.54, 0, 0]));

  // Upright rear window
  glassParts.push(createBox(1.40, 0.52, 0.04, [0, 1.30, -1.18], [-0.30, 0, 0]));

  // Full-length side windows (front, rear passenger, and rear quarter window)
  glassParts.push(createBox(0.03, 0.48, 1.74, [-0.71, 1.30, -0.26]));
  glassParts.push(createBox(0.03, 0.48, 1.74, [0.71, 1.30, -0.26]));

  // ---------------- DETAILS (LIGHTS, SKID PLATE, ROOF RAILS) ----------------
  // Robust black wheel arch cladding / flares
  [-frontZ, frontZ].forEach((z) => {
    [-0.88, 0.88].forEach((x) => {
      detailParts.push(createColoredBox(0.10, 0.16, 0.76, [x, 0.48, z], DETAIL_COLORS.DARK_PLASTIC));
    });
  });

  // Black lower body rocker guard
  detailParts.push(createColoredBox(1.80, 0.10, 2.30, [0, 0.32, 0.0], DETAIL_COLORS.DARK_PLASTIC));

  // Front bold honeycomb grille
  detailParts.push(createColoredBox(0.86, 0.24, 0.08, [0, 0.78, 2.18], DETAIL_COLORS.GRILLE));
  detailParts.push(createColoredBox(0.90, 0.04, 0.09, [0, 0.90, 2.18], DETAIL_COLORS.CHROME));

  // Brushed aluminum front skid plate
  detailParts.push(createColoredBox(0.78, 0.18, 0.12, [0, 0.36, 2.22], DETAIL_COLORS.SKID_PLATE, [-0.25, 0, 0]));

  // Projector LED Headlights
  detailParts.push(createColoredBox(0.38, 0.15, 0.14, [-0.68, 0.82, 2.16], DETAIL_COLORS.HEADLIGHT));
  detailParts.push(createColoredBox(0.38, 0.15, 0.14, [0.68, 0.82, 2.16], DETAIL_COLORS.HEADLIGHT));

  // Lower bumper fog lamps
  detailParts.push(createColoredBox(0.12, 0.08, 0.08, [-0.70, 0.48, 2.20], DETAIL_COLORS.HEADLIGHT_INNER));
  detailParts.push(createColoredBox(0.12, 0.08, 0.08, [0.70, 0.48, 2.20], DETAIL_COLORS.HEADLIGHT_INNER));

  // Bold vertical rear taillights
  detailParts.push(createColoredBox(0.18, 0.45, 0.12, [-0.75, 1.05, -2.10], DETAIL_COLORS.TAILLIGHT));
  detailParts.push(createColoredBox(0.18, 0.45, 0.12, [0.75, 1.05, -2.10], DETAIL_COLORS.TAILLIGHT));

  // Dual roof utility rails
  [-0.60, 0.60].forEach((rx) => {
    // Longitudinal bar
    detailParts.push(createColoredBox(0.04, 0.04, 1.65, [rx, 1.70, -0.25], DETAIL_COLORS.ROOF_RAIL));
    // Mounting stanchions
    detailParts.push(createColoredBox(0.05, 0.06, 0.08, [rx, 1.66, 0.45], DETAIL_COLORS.DARK_PLASTIC));
    detailParts.push(createColoredBox(0.05, 0.06, 0.08, [rx, 1.66, -0.25], DETAIL_COLORS.DARK_PLASTIC));
    detailParts.push(createColoredBox(0.05, 0.06, 0.08, [rx, 1.66, -0.95], DETAIL_COLORS.DARK_PLASTIC));
  });

  // License plates
  detailParts.push(createColoredBox(0.50, 0.12, 0.03, [0, 0.52, 2.24], DETAIL_COLORS.PLATE_WHITE));
  detailParts.push(createColoredBox(0.50, 0.12, 0.03, [0, 0.54, -2.18], DETAIL_COLORS.PLATE_YELLOW));

  // Mirror glass
  detailParts.push(createColoredBox(0.02, 0.10, 0.11, [-1.02, 1.05, 0.51], DETAIL_COLORS.MIRROR_FACE));
  detailParts.push(createColoredBox(0.02, 0.10, 0.11, [1.02, 1.05, 0.51], DETAIL_COLORS.MIRROR_FACE));

  // Rear dual chrome exhaust
  detailParts.push(createColoredCylinder(0.045, 0.045, 0.12, 10, [-0.60, 0.32, -2.16], DETAIL_COLORS.EXHAUST, [Math.PI / 2, 0, 0]));
  detailParts.push(createColoredCylinder(0.045, 0.045, 0.12, 10, [0.60, 0.32, -2.16], DETAIL_COLORS.EXHAUST, [Math.PI / 2, 0, 0]));

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
