import * as THREE from "three";

/**
 * Shared Physically-Based Materials for Vehicle Rendering
 * Optimized for Three.js ACESFilmicToneMapping and terminal sunlight.
 */

// 1. Vehicle Body Paint: clearcoat-style subtle reflection without plastic sheen
export function createPaintMaterial(roughness = 0.28, metalness = 0.40): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    roughness,
    metalness,
  });
}

// 2. High-grade Automotive Glass: deep tint, low roughness for crisp environment reflections
export const VEHICLE_GLASS_MATERIAL = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#0D1620"),
  roughness: 0.08,
  metalness: 0.92,
});

// 3. Matte Rubber Tyres: realistic vulcanized tyre compound with low specular response
export const VEHICLE_TYRE_MATERIAL = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#161719"),
  roughness: 0.88,
  metalness: 0.06,
});

// 4. Alloy Rims: precision machined silver metallic finish
export const VEHICLE_RIM_MATERIAL = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#CFD4DA"),
  roughness: 0.22,
  metalness: 0.86,
});

// 5. Exterior Trim, Lights & Details: unified vertex-colored material (lights, badges, grilles, plates)
export const VEHICLE_DETAILS_MATERIAL = new THREE.MeshStandardMaterial({
  vertexColors: true,
  roughness: 0.32,
  metalness: 0.42,
});

// 6. Heavy Mechanical & Chassis Parts (Chassis rails, fifth wheel, suspension)
export const VEHICLE_CHASSIS_MATERIAL = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#27292D"),
  roughness: 0.70,
  metalness: 0.25,
});
