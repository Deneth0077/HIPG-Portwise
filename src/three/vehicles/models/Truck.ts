import * as THREE from "three";
import {
  createBox,
  createColoredBox,
  createColoredCylinder,
  generateTruckWheels,
  safeMerge,
  DETAIL_COLORS,
} from "../geometryHelpers";
import type { VehicleGeometries } from "./PassengerCar";

/**
 * 1. Port Tractor Unit / Heavy Prime Mover
 */
export function createTruckGeometries(): VehicleGeometries {
  const bodyParts: THREE.BufferGeometry[] = [];
  const glassParts: THREE.BufferGeometry[] = [];
  const detailParts: THREE.BufferGeometry[] = [];

  const trackX = 1.05;
  const axleY = 0.48;
  const frontZ = 1.85;
  const rearZ1 = -1.15;
  const rearZ2 = -2.45;
  const tyreR = 0.48;
  const tyreW = 0.28;
  const rimR = 0.26;

  // ---------------- BODY (CAB & AIR DEFLECTOR) ----------------
  // Main forward-control cab block
  bodyParts.push(createBox(2.28, 1.80, 2.15, [0, 1.72, 1.25]));

  // Aerodynamic roof wind deflector cap
  bodyParts.push(createBox(2.20, 0.45, 1.80, [0, 2.80, 1.20], [-0.08, 0, 0]));

  // Cab lower skirt / entry step panels
  bodyParts.push(createBox(2.32, 0.50, 1.20, [0, 0.82, 1.25]));

  // Front heavy impact bumper
  bodyParts.push(createBox(2.35, 0.55, 0.40, [0, 0.70, 2.32]));

  // Cab mirrors (painted outer shells)
  [-1.24, 1.24].forEach((mx) => {
    bodyParts.push(createBox(0.12, 0.38, 0.16, [mx, 2.05, 2.05]));
  });

  // ---------------- TINTED GLASS ----------------
  // Wide panoramic wrap-around truck windshield
  glassParts.push(createBox(2.12, 0.76, 0.04, [0, 2.05, 2.30], [0.12, 0, 0]));

  // Cab side door windows
  glassParts.push(createBox(0.04, 0.65, 0.88, [-1.15, 2.05, 1.45]));
  glassParts.push(createBox(0.04, 0.65, 0.88, [1.15, 2.05, 1.45]));

  // ---------------- DETAILS (CHASSIS, FUEL TANKS, FIFTH WHEEL, LIGHTS) ----------------
  // Heavy Twin Steel Chassis Rails (extending to rear)
  [-0.45, 0.45].forEach((cx) => {
    detailParts.push(createColoredBox(0.18, 0.28, 5.2, [cx, 0.65, -0.4], DETAIL_COLORS.BLACK_TRIM));
  });

  // Fifth Wheel Coupling Turntable Plate (for semi-trailers)
  detailParts.push(createColoredCylinder(0.48, 0.48, 0.08, 16, [0, 0.90, -1.80], DETAIL_COLORS.FIFTH_WHEEL));
  detailParts.push(createColoredBox(0.16, 0.06, 0.35, [0, 0.92, -1.90], DETAIL_COLORS.CHROME)); // Kingpin slot

  // Large Cylindrical Diesel Fuel Tanks (Aluminium)
  [-1.02, 1.02].forEach((tx) => {
    // Tank cylinder (oriented along Z axis)
    detailParts.push(createColoredCylinder(0.32, 0.32, 1.60, 16, [tx, 0.62, -0.15], DETAIL_COLORS.CHROME, [Math.PI / 2, 0, 0]));
    // Mounting brackets / straps
    detailParts.push(createColoredBox(0.06, 0.66, 0.06, [tx, 0.62, 0.45], DETAIL_COLORS.BLACK_TRIM));
    detailParts.push(createColoredBox(0.06, 0.66, 0.06, [tx, 0.62, -0.75], DETAIL_COLORS.BLACK_TRIM));
  });

  // Vertical exhaust stack / snorkel behind cab
  detailParts.push(createColoredCylinder(0.07, 0.07, 2.2, 12, [0.82, 2.10, 0.05], DETAIL_COLORS.CHROME));
  detailParts.push(createColoredCylinder(0.08, 0.06, 0.25, 12, [0.82, 3.25, 0.05], DETAIL_COLORS.CHROME));

  // Front bold truck radiator grille (multi-slats)
  detailParts.push(createColoredBox(1.35, 0.75, 0.10, [0, 1.25, 2.34], DETAIL_COLORS.GRILLE));
  detailParts.push(createColoredBox(1.40, 0.06, 0.12, [0, 1.50, 2.34], DETAIL_COLORS.CHROME));
  detailParts.push(createColoredBox(1.40, 0.06, 0.12, [0, 1.25, 2.34], DETAIL_COLORS.CHROME));
  detailParts.push(createColoredBox(1.40, 0.06, 0.12, [0, 1.00, 2.34], DETAIL_COLORS.CHROME));

  // Heavy Duty Headlights + Amber Turn Indicators
  detailParts.push(createColoredBox(0.42, 0.22, 0.14, [-0.88, 0.72, 2.48], DETAIL_COLORS.HEADLIGHT));
  detailParts.push(createColoredBox(0.42, 0.22, 0.14, [0.88, 0.72, 2.48], DETAIL_COLORS.HEADLIGHT));
  detailParts.push(createColoredBox(0.12, 0.18, 0.12, [-1.08, 0.72, 2.45], DETAIL_COLORS.TAILLIGHT_AMBER));
  detailParts.push(createColoredBox(0.12, 0.18, 0.12, [1.08, 0.72, 2.45], DETAIL_COLORS.TAILLIGHT_AMBER));

  // Roof Cab Clearance Marker Lights
  [-0.85, -0.42, 0, 0.42, 0.85].forEach((lx) => {
    detailParts.push(createColoredBox(0.08, 0.04, 0.06, [lx, 2.64, 2.05], DETAIL_COLORS.TAILLIGHT_AMBER));
  });

  // Mirror glass & brackets
  [-1.24, 1.24].forEach((mx) => {
    detailParts.push(createColoredBox(0.02, 0.34, 0.12, [mx, 2.05, 2.02], DETAIL_COLORS.MIRROR_FACE));
    const armX = mx < 0 ? mx + 0.07 : mx - 0.07;
    detailParts.push(createColoredBox(0.12, 0.04, 0.04, [armX, 2.18, 2.04], DETAIL_COLORS.BLACK_TRIM));
    detailParts.push(createColoredBox(0.12, 0.04, 0.04, [armX, 1.92, 2.04], DETAIL_COLORS.BLACK_TRIM));
  });

  // Rear Mudguards & LED Taillights
  detailParts.push(createColoredBox(2.30, 0.12, 0.16, [0, 0.62, -2.95], DETAIL_COLORS.BLACK_TRIM));
  detailParts.push(createColoredBox(0.35, 0.16, 0.08, [-0.85, 0.62, -3.02], DETAIL_COLORS.TAILLIGHT));
  detailParts.push(createColoredBox(0.35, 0.16, 0.08, [0.85, 0.62, -3.02], DETAIL_COLORS.TAILLIGHT));

  // Front & rear license plates
  detailParts.push(createColoredBox(0.52, 0.14, 0.03, [0, 0.50, 2.52], DETAIL_COLORS.PLATE_WHITE));
  detailParts.push(createColoredBox(0.52, 0.14, 0.03, [0, 0.45, -3.03], DETAIL_COLORS.PLATE_YELLOW));

  // Heavy truck underbody shadow
  detailParts.push(createColoredBox(2.20, 0.02, 5.4, [0, 0.16, -0.4], 0x0a0c0e));

  // ---------------- WHEELS & RIMS (10 Tyres: 2 steer + 8 rear duals) ----------------
  const { tyres, rims } = generateTruckWheels(trackX, axleY, frontZ, rearZ1, rearZ2, tyreR, tyreW, rimR);

  return {
    bodyGeo: safeMerge(bodyParts),
    glassGeo: safeMerge(glassParts),
    wheelsGeo: safeMerge(tyres),
    rimsGeo: safeMerge(rims),
    detailsGeo: safeMerge(detailParts),
  };
}

/**
 * 2. Dedicated Multi-Deck Port Vehicle Transporter (Car Carrier)
 */
export function createTransporterGeometries(): VehicleGeometries {
  const truck = createTruckGeometries();
  const bodyParts: THREE.BufferGeometry[] = [];
  const detailParts: THREE.BufferGeometry[] = [];

  // Lower vehicle transport deck (perforated steel ramp surface)
  bodyParts.push(createBox(2.32, 0.20, 4.8, [0, 0.85, -1.2]));

  // Upper vehicle transport deck (angled automotive deck)
  bodyParts.push(createBox(2.28, 0.14, 4.6, [0, 2.15, -1.1], [-0.03, 0, 0]));

  // Structural skeletal side truss uprights
  [-1.12, 1.12].forEach((sx) => {
    // Upright pillars
    [-3.2, -2.0, -0.8, 0.4].forEach((sz) => {
      detailParts.push(createColoredBox(0.08, 1.35, 0.08, [sx, 1.50, sz], DETAIL_COLORS.DARK_PLASTIC));
    });
    // Diagonal structural bracing
    detailParts.push(createColoredBox(0.06, 0.06, 1.55, [sx, 1.50, -2.6], DETAIL_COLORS.DARK_PLASTIC, [0.65, 0, 0]));
    detailParts.push(createColoredBox(0.06, 0.06, 1.55, [sx, 1.50, -1.4], DETAIL_COLORS.DARK_PLASTIC, [-0.65, 0, 0]));
    detailParts.push(createColoredBox(0.06, 0.06, 1.55, [sx, 1.50, -0.2], DETAIL_COLORS.DARK_PLASTIC, [0.65, 0, 0]));
    // Safety guardrails
    detailParts.push(createColoredBox(0.04, 0.06, 4.6, [sx, 2.30, -1.1], DETAIL_COLORS.DARK_PLASTIC));
  });

  const mergedBody = safeMerge([truck.bodyGeo, ...bodyParts]);
  const mergedDetails = safeMerge([truck.detailsGeo, ...detailParts]);

  return {
    bodyGeo: mergedBody,
    glassGeo: truck.glassGeo,
    wheelsGeo: truck.wheelsGeo,
    rimsGeo: truck.rimsGeo,
    detailsGeo: mergedDetails,
  };
}
