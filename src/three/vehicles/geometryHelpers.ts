import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export const DETAIL_COLORS = {
  HEADLIGHT: 0xf5faff,
  HEADLIGHT_INNER: 0xd6e5f5,
  TAILLIGHT: 0xdb1422,
  TAILLIGHT_AMBER: 0xfca311,
  TAILLIGHT_REVERSE: 0xffffff,
  GRILLE: 0x16181b,
  GRILLE_ACCENT: 0x2b2e34,
  CHROME: 0xdee2e6,
  PLATE_WHITE: 0xf4f5f0,
  PLATE_YELLOW: 0xe8c538,
  BLACK_TRIM: 0x17191c,
  DARK_PLASTIC: 0x222428,
  SKID_PLATE: 0xadb5bd,
  MIRROR_FACE: 0x8da4bc,
  EXHAUST: 0xc4c9d0,
  BED_LINER: 0x24272b,
  ROLL_BAR: 0x343a40,
  ROOF_RAIL: 0x212529,
  FIFTH_WHEEL: 0x202226,
  STEP_BAR: 0x3a3f47,
};

/**
 * Creates an uncolored BoxBufferGeometry with translation and optional rotation.
 */
export function createBox(
  w: number,
  h: number,
  d: number,
  pos: [number, number, number],
  rot?: [number, number, number]
): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(w, h, d);
  if (rot) {
    if (rot[0]) geo.rotateX(rot[0]);
    if (rot[1]) geo.rotateY(rot[1]);
    if (rot[2]) geo.rotateZ(rot[2]);
  }
  geo.translate(pos[0], pos[1], pos[2]);
  return geo;
}

/**
 * Creates an uncolored CylinderBufferGeometry with translation and optional rotation.
 */
export function createCylinder(
  rTop: number,
  rBot: number,
  height: number,
  radialSegs: number,
  pos: [number, number, number],
  rot?: [number, number, number]
): THREE.BufferGeometry {
  const geo = new THREE.CylinderGeometry(rTop, rBot, height, radialSegs);
  if (rot) {
    if (rot[0]) geo.rotateX(rot[0]);
    if (rot[1]) geo.rotateY(rot[1]);
    if (rot[2]) geo.rotateZ(rot[2]);
  }
  geo.translate(pos[0], pos[1], pos[2]);
  return geo;
}

/**
 * Creates a BoxBufferGeometry with a specified vertex color attribute.
 */
export function createColoredBox(
  w: number,
  h: number,
  d: number,
  pos: [number, number, number],
  colorHex: number,
  rot?: [number, number, number]
): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(w, h, d);
  if (rot) {
    if (rot[0]) geo.rotateX(rot[0]);
    if (rot[1]) geo.rotateY(rot[1]);
    if (rot[2]) geo.rotateZ(rot[2]);
  }
  geo.translate(pos[0], pos[1], pos[2]);

  const c = new THREE.Color(colorHex);
  const count = geo.attributes.position.count;
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geo;
}

/**
 * Creates a CylinderBufferGeometry with a specified vertex color attribute.
 */
export function createColoredCylinder(
  rTop: number,
  rBot: number,
  height: number,
  radialSegs: number,
  pos: [number, number, number],
  colorHex: number,
  rot?: [number, number, number]
): THREE.BufferGeometry {
  const geo = new THREE.CylinderGeometry(rTop, rBot, height, radialSegs);
  if (rot) {
    if (rot[0]) geo.rotateX(rot[0]);
    if (rot[1]) geo.rotateY(rot[1]);
    if (rot[2]) geo.rotateZ(rot[2]);
  }
  geo.translate(pos[0], pos[1], pos[2]);

  const c = new THREE.Color(colorHex);
  const count = geo.attributes.position.count;
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geo;
}

/**
 * Merges a list of geometries safely, returning an empty geometry if list is empty.
 */
export function safeMerge(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  if (parts.length === 0) return new THREE.BufferGeometry();
  const merged = mergeGeometries(parts, false);
  if (!merged) {
    // Fallback if merge returned null
    return new THREE.BufferGeometry();
  }
  merged.computeVertexNormals();
  return merged;
}

/**
 * Generates realistic cylindrical 4-wheel assemblies (tyre + alloy rim with spokes/center hub)
 */
export function generateFourWheels(
  trackX: number,
  axleY: number,
  frontZ: number,
  rearZ: number,
  tyreRadius: number,
  tyreWidth: number,
  rimRadius: number,
  spokeCount = 5
): { tyres: THREE.BufferGeometry[]; rims: THREE.BufferGeometry[] } {
  const tyres: THREE.BufferGeometry[] = [];
  const rims: THREE.BufferGeometry[] = [];
  const segs = 18;

  const positions: Array<[number, number, number, boolean]> = [
    [-trackX, axleY, frontZ, true],   // Front Left
    [trackX, axleY, frontZ, false],   // Front Right
    [-trackX, axleY, rearZ, true],    // Rear Left
    [trackX, axleY, rearZ, false],    // Rear Right
  ];

  positions.forEach(([x, y, z, isLeft]) => {
    // Outer Tyre Cylinder (oriented along X axis)
    const tyre = new THREE.CylinderGeometry(tyreRadius, tyreRadius, tyreWidth, segs);
    tyre.rotateZ(Math.PI / 2);
    tyre.translate(x, y, z);
    tyres.push(tyre);

    // Inner Rim Cylinder
    const rimCyl = new THREE.CylinderGeometry(rimRadius, rimRadius, tyreWidth * 0.94, segs);
    rimCyl.rotateZ(Math.PI / 2);
    rimCyl.translate(x, y, z);
    rims.push(rimCyl);

    // Center Hubcap Button
    const hubOffset = isLeft ? -tyreWidth * 0.49 : tyreWidth * 0.49;
    const hub = new THREE.CylinderGeometry(rimRadius * 0.28, rimRadius * 0.28, tyreWidth * 0.12, 10);
    hub.rotateZ(Math.PI / 2);
    hub.translate(x + hubOffset, y, z);
    rims.push(hub);

    // Alloy Spoke Blades
    for (let s = 0; s < spokeCount; s++) {
      const angle = (s * Math.PI * 2) / spokeCount;
      const spoke = new THREE.BoxGeometry(tyreWidth * 0.1, rimRadius * 1.6, rimRadius * 0.22);
      spoke.rotateX(angle);
      spoke.translate(x + hubOffset * 0.85, y, z);
      rims.push(spoke);
    }
  });

  return { tyres, rims };
}

/**
 * Generates heavy multi-axle truck wheels (front single, rear dual wheels)
 */
export function generateTruckWheels(
  trackX: number,
  axleY: number,
  frontZ: number,
  rearZ1: number,
  rearZ2: number,
  tyreRadius: number,
  tyreWidth: number,
  rimRadius: number
): { tyres: THREE.BufferGeometry[]; rims: THREE.BufferGeometry[] } {
  const tyres: THREE.BufferGeometry[] = [];
  const rims: THREE.BufferGeometry[] = [];
  const segs = 18;

  // Front Steer Axle (Singles)
  [-trackX, trackX].forEach((x) => {
    const isLeft = x < 0;
    const t = new THREE.CylinderGeometry(tyreRadius, tyreRadius, tyreWidth, segs);
    t.rotateZ(Math.PI / 2);
    t.translate(x, axleY, frontZ);
    tyres.push(t);

    const r = new THREE.CylinderGeometry(rimRadius, rimRadius, tyreWidth * 0.96, segs);
    r.rotateZ(Math.PI / 2);
    r.translate(x, axleY, frontZ);
    rims.push(r);

    const hub = new THREE.CylinderGeometry(rimRadius * 0.35, rimRadius * 0.35, tyreWidth * 0.15, 10);
    hub.rotateZ(Math.PI / 2);
    hub.translate(x + (isLeft ? -tyreWidth * 0.48 : tyreWidth * 0.48), axleY, frontZ);
    rims.push(hub);
  });

  // Rear Drive Axles (Dual Wheels each side)
  [rearZ1, rearZ2].forEach((z) => {
    [-trackX, trackX].forEach((baseX) => {
      const isLeft = baseX < 0;
      const innerX = isLeft ? baseX + tyreWidth * 0.55 : baseX - tyreWidth * 0.55;
      const outerX = isLeft ? baseX - tyreWidth * 0.55 : baseX + tyreWidth * 0.55;

      [innerX, outerX].forEach((x) => {
        const t = new THREE.CylinderGeometry(tyreRadius, tyreRadius, tyreWidth, segs);
        t.rotateZ(Math.PI / 2);
        t.translate(x, axleY, z);
        tyres.push(t);

        const r = new THREE.CylinderGeometry(rimRadius, rimRadius, tyreWidth * 0.92, segs);
        r.rotateZ(Math.PI / 2);
        r.translate(x, axleY, z);
        rims.push(r);
      });

      // Outer Axle Hub with Lug Ring
      const hub = new THREE.CylinderGeometry(rimRadius * 0.42, rimRadius * 0.42, tyreWidth * 0.22, 10);
      hub.rotateZ(Math.PI / 2);
      hub.translate(outerX + (isLeft ? -tyreWidth * 0.48 : tyreWidth * 0.48), axleY, z);
      rims.push(hub);
    });
  });

  return { tyres, rims };
}
