import { memo, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { COLORS, WATER_Y } from "@/data/layout";
import { Glow, LIGHT, litMat } from "./nightLights";
import { FONT_URL } from "./Terrain";

const unitBox = new THREE.BoxGeometry(1, 1, 1);
const unitCyl = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
const UP = new THREE.Vector3(0, 1, 0);

interface HarbourTugProps {
  name?: string;
  hullColor?: string;
  isPushing?: boolean;
  throttle?: number; // 0 to 1
}

/**
 * High-Fidelity 3D ASD Harbour Tugboat Model (HIPG Port Authority Escort & Berthing Tug)
 * Features:
 * - Sculpted ASD tug hull with red anti-fouling underwater boot-topping
 * - Heavy cylindrical rubber bow pusher fender and gunwale D-fenders
 * - Low aft working deck with towing H-bitt / hook and forward escort towing winch
 * - Modern 360-degree panoramic bridge with tinted glass and safety brow
 * - Twin exhaust funnels with company band
 * - Navigation mast with radar scanner dome and dual FiFi fire-fighting water monitor cannons
 * - Working navigation & deck flood lights
 */
export const HarbourTug = memo(function HarbourTug({
  name = "HIPG TUG 01",
  hullColor = "#1B4D3E",
  isPushing = false,
  throttle = 0.85,
}: HarbourTugProps) {
  const radarRef = useRef<THREE.Group>(null);
  const foamRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    // Spin radar scanner dome
    if (radarRef.current) {
      radarRef.current.rotation.y += delta * 4.2;
    }
    // Animate prop wash foam pulse
    if (foamRef.current) {
      const pulse = 0.92 + Math.sin(Date.now() * 0.008) * 0.08;
      foamRef.current.scale.set(1.0, 1.0, pulse);
    }
  });

  return (
    <group name="harbour-tug">
      {/* ---------------- 1. HULL & RUNNING GEAR ---------------- */}
      {/* Red underwater anti-fouling hull */}
      <mesh
        geometry={unitBox}
        material={new THREE.MeshStandardMaterial({ color: "#9E2A2B", roughness: 0.65 })}
        position={[0, -0.45, 0]}
        scale={[9.2, 0.7, 4.0]}
      />
      {/* Main Hull */}
      <mesh
        geometry={unitBox}
        material={new THREE.MeshStandardMaterial({ color: hullColor, roughness: 0.35, metalness: 0.25 })}
        position={[0, 0.25, 0]}
        scale={[9.4, 0.9, 4.15]}
        castShadow
        receiveShadow
      />
      {/* White sheerline accent stripe */}
      <mesh
        geometry={unitBox}
        material={new THREE.MeshStandardMaterial({ color: "#F4F6F8", roughness: 0.4 })}
        position={[0, 0.68, 0]}
        scale={[9.45, 0.08, 4.2]}
      />

      {/* ---------------- 2. HEAVY RUBBER FENDERING ---------------- */}
      {/* Massive Cylindrical Bow Pusher Fender (pushes against ships) */}
      <group position={[4.65, 0.45, 0]}>
        <mesh
          geometry={unitCyl}
          material={new THREE.MeshStandardMaterial({ color: "#141618", roughness: 0.92 })}
          rotation={[0, 0, Math.PI / 2]}
          scale={[1.1, 1.1, 3.4]}
          castShadow
        />
        {/* Upper cylindrical rubber bumper */}
        <mesh
          geometry={unitCyl}
          material={new THREE.MeshStandardMaterial({ color: "#111214", roughness: 0.95 })}
          rotation={[0, 0, Math.PI / 2]}
          position={[-0.45, 0.65, 0]}
          scale={[0.75, 0.75, 3.0]}
        />
      </group>
      {/* Continuous Gunwale D-Fender Belting */}
      <mesh
        geometry={unitBox}
        material={new THREE.MeshStandardMaterial({ color: "#121315", roughness: 0.9 })}
        position={[0, 0.62, 0]}
        scale={[9.55, 0.26, 4.3]}
      />

      {/* ---------------- 3. WORKING DECKS & TOWING GEAR ---------------- */}
      {/* Aft low working deck (non-slip industrial grey) */}
      <mesh
        geometry={unitBox}
        material={new THREE.MeshStandardMaterial({ color: "#2E3339", roughness: 0.85 })}
        position={[-1.8, 0.52, 0]}
        scale={[5.4, 0.08, 3.7]}
        receiveShadow
      />
      {/* Aft Towing H-Bitt / Heavy Tow Hook */}
      <group position={[-2.8, 0.95, 0]}>
        <mesh
          geometry={unitBox}
          material={new THREE.MeshStandardMaterial({ color: "#495057", roughness: 0.4, metalness: 0.7 })}
          scale={[0.4, 0.85, 1.4]}
          castShadow
        />
        <mesh
          geometry={unitCyl}
          material={new THREE.MeshStandardMaterial({ color: "#CFD4DA", roughness: 0.25, metalness: 0.85 })}
          rotation={[0, 0, Math.PI / 2]}
          position={[0, 0.35, 0]}
          scale={[0.22, 0.22, 1.6]}
        />
      </group>
      {/* Forward Escort Towing Winch & Heavy Staple */}
      <group position={[2.2, 0.95, 0]}>
        {/* Winch body & motor */}
        <mesh
          geometry={unitBox}
          material={new THREE.MeshStandardMaterial({ color: "#343A40", roughness: 0.5, metalness: 0.6 })}
          scale={[1.1, 0.75, 1.8]}
          castShadow
        />
        {/* Cable spool with wound towing hawser */}
        <mesh
          geometry={unitCyl}
          material={new THREE.MeshStandardMaterial({ color: "#DDA15E", roughness: 0.75 })}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[0.65, 0.65, 1.4]}
        />
        {/* Heavy Forward Towing Staple (Bitt) */}
        <mesh
          geometry={unitCyl}
          material={new THREE.MeshStandardMaterial({ color: "#495057", roughness: 0.35, metalness: 0.75 })}
          position={[0.8, 0.35, 0]}
          scale={[0.3, 0.3, 1.2]}
        />
      </group>

      {/* ---------------- 4. SUPERSTRUCTURE & WHEELHOUSE ---------------- */}
      {/* Lower deckhouse */}
      <mesh
        geometry={unitBox}
        material={new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.28, metalness: 0.2 })}
        position={[-0.1, 1.25, 0]}
        scale={[4.8, 1.05, 2.9]}
        castShadow
        receiveShadow
      />
      {/* Wheelhouse (Raised 360-degree command bridge) */}
      <mesh
        geometry={unitBox}
        material={new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.28, metalness: 0.2 })}
        position={[0.3, 2.25, 0]}
        scale={[3.4, 1.05, 2.5]}
        castShadow
      />
      {/* Deep tinted wrap-around 360-degree bridge windows */}
      <mesh
        geometry={unitBox}
        material={new THREE.MeshStandardMaterial({
          color: new THREE.Color("#0C1520"),
          roughness: 0.08,
          metalness: 0.92,
        })}
        position={[0.3, 2.42, 0]}
        scale={[3.48, 0.52, 2.58]}
      />
      {/* Wheelhouse roof brow & safety orange visor */}
      <mesh
        geometry={unitBox}
        material={new THREE.MeshStandardMaterial({ color: "#F8F9FA", roughness: 0.3 })}
        position={[0.3, 2.82, 0]}
        scale={[3.65, 0.12, 2.7]}
      />
      <mesh
        geometry={unitBox}
        material={new THREE.MeshStandardMaterial({ color: "#E65100", roughness: 0.4 })}
        position={[0.3, 2.90, 0]}
        scale={[3.4, 0.06, 2.5]}
      />

      {/* ---------------- 5. EXHAUST STACKS & ENGINES ---------------- */}
      {[-0.85, 0.85].map((sz) => {
        return (
          <group key={sz} position={[-1.4, 2.25, sz]}>
            {/* Stack casing */}
            <mesh
              geometry={unitBox}
              material={new THREE.MeshStandardMaterial({ color: hullColor, roughness: 0.35, metalness: 0.3 })}
              scale={[0.7, 1.7, 0.65]}
              castShadow
            />
            {/* White and orange band */}
            <mesh
              geometry={unitBox}
              material={new THREE.MeshStandardMaterial({ color: "#FFFFFF" })}
              position={[0, 0.2, 0]}
              scale={[0.72, 0.25, 0.67]}
            />
            {/* Exhaust crown */}
            <mesh
              geometry={unitCyl}
              material={new THREE.MeshStandardMaterial({ color: "#16181B", roughness: 0.8 })}
              position={[0, 0.95, 0]}
              scale={[0.3, 0.3, 0.35]}
            />
          </group>
        );
      })}

      {/* ---------------- 6. MAST, RADAR & FIFI WATER CANNONS ---------------- */}
      {/* Steel central tubular mast */}
      <mesh
        geometry={unitCyl}
        material={new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.35 })}
        position={[-0.2, 3.8, 0]}
        scale={[0.18, 0.18, 1.8]}
        castShadow
      />
      {/* Radar yardarm & spinning radar scanner */}
      <group position={[-0.2, 4.6, 0]}>
        <mesh
          geometry={unitBox}
          material={new THREE.MeshStandardMaterial({ color: "#CFD4DA", metalness: 0.7 })}
          scale={[0.1, 0.1, 1.8]}
        />
        <group ref={radarRef} position={[0, 0.18, 0]}>
          <mesh
            geometry={unitBox}
            material={new THREE.MeshStandardMaterial({ color: "#1D2128", roughness: 0.5 })}
            scale={[0.16, 0.12, 1.3]}
          />
        </group>
      </group>

      {/* Dual Fire-Fighting (FiFi) High-Pressure Water Monitor Cannons */}
      {[-0.65, 0.65].map((fz) => {
        return (
          <group key={fz} position={[0.65, 3.12, fz]}>
            {/* Red cannon body */}
            <mesh
              geometry={unitBox}
              material={new THREE.MeshStandardMaterial({ color: "#C0392B", roughness: 0.3 })}
              scale={[0.35, 0.35, 0.35]}
            />
            {/* Chrome nozzle */}
            <mesh
              geometry={unitCyl}
              material={new THREE.MeshStandardMaterial({ color: "#DEE2E6", metalness: 0.9, roughness: 0.2 })}
              rotation={[0, 0, Math.PI / 2]}
              position={[0.35, 0.05, 0]}
              scale={[0.12, 0.12, 0.45]}
            />
          </group>
        );
      })}

      {/* ---------------- 7. LIGHTING & IDENTIFICATION ---------------- */}
      {/* Port Red Navigation Light */}
      <mesh
        geometry={unitBox}
        material={new THREE.MeshStandardMaterial({ color: "#E63946", emissive: "#E63946", emissiveIntensity: 1.2 })}
        position={[0.3, 2.5, 1.38]}
        scale={[0.14, 0.14, 0.1]}
      />
      {/* Starboard Green Navigation Light */}
      <mesh
        geometry={unitBox}
        material={new THREE.MeshStandardMaterial({ color: "#2A9D8F", emissive: "#2A9D8F", emissiveIntensity: 1.2 })}
        position={[0.3, 2.5, -1.38]}
        scale={[0.14, 0.14, 0.1]}
      />
      {/* Masthead Steaming Light */}
      <mesh
        geometry={unitBox}
        material={new THREE.MeshStandardMaterial({ color: "#FFFFFF", emissive: "#FFFFFF", emissiveIntensity: 1.5 })}
        position={[-0.2, 4.4, 0]}
        scale={[0.14, 0.14, 0.14]}
      />
      <Glow position={[-0.2, 4.4, 0]} color={LIGHT.white} size={1.6} base={0.9} />

      {/* Vessel Name Lettering */}
      <Text
        font={FONT_URL}
        fontSize={0.45}
        color="#FFFFFF"
        position={[0.3, 1.32, 1.48]}
        rotation={[0, 0, 0]}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.06}
      >
        {name}
      </Text>
      <Text
        font={FONT_URL}
        fontSize={0.45}
        color="#FFFFFF"
        position={[0.3, 1.32, -1.48]}
        rotation={[0, Math.PI, 0]}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.06}
      >
        {name}
      </Text>

      {/* ---------------- 8. THRUSTER PROP WASH & FOAM CHURN ---------------- */}
      {/* Dynamic foaming wake behind the tug's azimuth stern thrusters */}
      <group position={[-5.2, -0.15, 0]}>
        <mesh
          ref={foamRef}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[isPushing ? -1.8 : -1.2, 0, 0]}
        >
          <planeGeometry args={[isPushing ? 6.5 : 5.0, 3.6]} />
          <meshBasicMaterial
            color="#FFFFFF"
            transparent
            opacity={0.65 * throttle}
            depthWrite={false}
          />
        </mesh>
        {/* Turbulent inner core */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[isPushing ? -1.2 : -0.8, 0.01, 0]}
        >
          <planeGeometry args={[3.2, 2.2]} />
          <meshBasicMaterial
            color="#EBF4F6"
            transparent
            opacity={0.85 * throttle}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
});

interface TowLineProps {
  from: [number, number, number];
  to: [number, number, number];
  color?: string;
  diameter?: number;
  slack?: number;
}

/**
 * 3D Dynamic Towing Hawser Cable
 * Stretches between the tug's towing winch and the vessel's Panama chock / bitt
 */
export const DynamicTowLine = memo(function DynamicTowLine({
  from,
  to,
  color = "#D48B38", // High-visibility marine towing rope
  diameter = 0.08,
}: TowLineProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const pA = new THREE.Vector3(...from);
    const pB = new THREE.Vector3(...to);
    const dir = pB.clone().sub(pA);
    const len = dir.length();

    if (len < 0.1) {
      mesh.visible = false;
      return;
    }
    mesh.visible = true;

    const mid = pA.add(pB).multiplyScalar(0.5);
    mesh.position.copy(mid);
    mesh.scale.set(diameter, len, diameter);

    const q = new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize());
    mesh.quaternion.copy(q);
  });

  return (
    <mesh ref={meshRef} geometry={unitCyl}>
      <meshStandardMaterial color={color} roughness={0.65} metalness={0.2} />
    </mesh>
  );
});
