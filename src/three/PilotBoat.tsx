import { memo, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { COLORS, WATER_Y } from "@/data/layout";
import { simT } from "@/sim/simStore";
import { seaState } from "@/sim/weatherFx";
import { T_HEAVE, T_ALONGSIDE, portCall, ORIENT_LOTUS } from "@/sim/ais/portCalls";
import { aisFix, newFix } from "@/sim/ais/tracker";
import { bearingToRotY } from "@/sim/ais/geo";
import { Chip3D } from "./Chip3D";
import { Glow, LIGHT, litMat } from "./nightLights";
import { Part, mat, unitBox, unitCyl } from "./parts";
import { FONT_URL } from "./Terrain";

/** Service berth base coordinates where the pilot boat is stationed when on standby */
const PILOT_BASE: [number, number] = [166.0, 248.0];
const PILOT_BASE_HEADING = 0; // Pointing North along Service Berth

/** Handover rendezvous waypoint in navigable eastern waters */
export const PILOT_HANDOVER_WP: [number, number] = [320.0, 160.0];

/** High-visibility pilot service cutter model */
const PilotBoatHull = memo(function PilotBoatHull({ underway = false }: { underway?: boolean }) {
  return (
    <group>
      {/* 1. Deep-V Planing Hull */}
      <Part position={[0, 0.45, 0]} scale={[11.5, 1.1, 3.8]} color="#1E232B" />
      {/* Black heavy rubber fendering collar */}
      <Part position={[0, 0.85, 0]} scale={[11.8, 0.28, 4.0]} color="#111111" />
      {/* Orange foredeck & sheer line */}
      <Part position={[2.5, 0.98, 0]} scale={[6.2, 0.12, 3.6]} color="#E65100" />
      {/* Aft boarding deck */}
      <Part position={[-3.2, 0.98, 0]} scale={[4.8, 0.12, 3.6]} color="#374151" />

      {/* 2. Pilot Wheelhouse & Superstructure */}
      {/* White main cabin */}
      <Part position={[-0.4, 1.85, 0]} scale={[4.6, 1.6, 2.6]} color="#FFFFFF" />
      {/* High-visibility orange roof */}
      <Part position={[-0.4, 2.7, 0]} scale={[4.8, 0.16, 2.8]} color="#E65100" />
      {/* Dark tinted 360-degree bridge windows */}
      <mesh
        geometry={unitBox}
        material={litMat("#1A222C", LIGHT.window, 1.4)}
        position={[-0.4, 2.05, 0]}
        scale={[4.66, 0.55, 2.66]}
      />

      {/* 3. "PILOT" Identification Decal on Wheelhouse Roof & Sides */}
      <Text
        font={FONT_URL}
        fontSize={0.65}
        color="#FFFFFF"
        position={[-0.4, 2.8, 0]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        anchorX="center"
        anchorY="middle"
      >
        PILOT
      </Text>
      <Text
        font={FONT_URL}
        fontSize={0.45}
        color="#FFFFFF"
        position={[-0.4, 1.85, 1.34]}
        anchorX="center"
        anchorY="middle"
      >
        HIPG PILOT
      </Text>
      <Text
        font={FONT_URL}
        fontSize={0.45}
        color="#FFFFFF"
        position={[-0.4, 1.85, -1.34]}
        rotation={[0, Math.PI, 0]}
        anchorX="center"
        anchorY="middle"
      >
        HIPG PILOT
      </Text>

      {/* 4. Equipment Mast, Radar Scanner & Beacons */}
      <Part position={[-1.2, 3.4, 0]} scale={[0.12, 1.3, 0.12]} color="#FFFFFF" cylinder />
      {/* Turning Radar Array */}
      <Part position={[-1.2, 3.9, 0]} scale={[0.8, 0.14, 0.2]} color="#222222" />
      {/* Amber rotating warning beacon */}
      <mesh position={[-1.2, 4.15, 0]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial color="#FFB703" emissive="#FFB703" emissiveIntensity={underway ? 2.5 : 0.4} />
      </mesh>
      <Glow position={[-1.2, 4.15, 0]} color="#FFB703" size={1.8} blink={1.8} />

      {/* Navigation Lights */}
      <mesh position={[1.8, 1.4, 1.8]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshBasicMaterial color="#22C55E" />
      </mesh>
      <mesh position={[1.8, 1.4, -1.8]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshBasicMaterial color="#EF4444" />
      </mesh>

      {/* 5. Dynamic Water Wake Trail when Underway */}
      {underway ? (
        <group position={[-5.8, 0.05, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[12, 3.8]} />
            <meshBasicMaterial color="#E8F4F8" transparent opacity={0.45} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
});

/**
 * HIPG Pilot Service boat (PILOT-01) that assists incoming and departing ships
 * strictly through navigable waters according to the simulation clock.
 */
export const PilotBoat = memo(function PilotBoat() {
  const group = useRef<THREE.Group>(null);
  const fix = useMemo(newFix, []);
  const olCall = useMemo(() => portCall(ORIENT_LOTUS), []);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const now = simT();
    const sea = seaState();

    // Mission dispatch schedule:
    // T_HEAVE - 600: Pilot boat dispatches from Service Berth
    // T_HEAVE to T_ALONGSIDE: Escorts ORIENT LOTUS to the berth apron
    // T_ALONGSIDE + 300: Returns to Service Berth standby
    const tDispatch = T_HEAVE - 450;
    const tReturn = T_ALONGSIDE + 180;

    if (now >= tDispatch && now <= tReturn && olCall) {
      // Actively assisting ORIENT LOTUS
      const f = aisFix(ORIENT_LOTUS, now, fix);

      // When ORIENT LOTUS is moving, pilot boat runs alongside her seaward quarter (offset 16m)
      const headingRad = (Math.PI / 2 - f.heading * (Math.PI / 180));
      const seawardOffset = 15.0; // 15m to port/starboard in deep water
      const offsetX = seawardOffset * Math.cos(headingRad + Math.PI / 2);
      const offsetZ = seawardOffset * Math.sin(headingRad + Math.PI / 2);

      const targetX = f.x + offsetX;
      const targetZ = f.z + offsetZ;

      g.position.set(targetX, WATER_Y + Math.sin(now * 1.8) * 0.08 * sea, targetZ);
      g.rotation.y = bearingToRotY(f.heading);
      g.rotation.z = Math.sin(now * 2.2) * 0.03 * sea;
      g.rotation.x = Math.sin(now * 1.5) * 0.02 * sea;
    } else {
      // Moored on standby at Service Berth (inside navigable water next to CY01)
      g.position.set(PILOT_BASE[0], WATER_Y + Math.sin(now * 0.8) * 0.04 * sea, PILOT_BASE[1]);
      g.rotation.y = bearingToRotY(PILOT_BASE_HEADING);
      g.rotation.z = 0;
      g.rotation.x = 0;
    }
  });

  const now = simT();
  const isAssisting = now >= T_HEAVE - 450 && now <= T_ALONGSIDE + 180;
  const statusText = isAssisting
    ? "PILOT-01 · Escorting MV ORIENT LOTUS"
    : "PILOT-01 · On Station (Service Berth)";

  return (
    <group ref={group} position={[PILOT_BASE[0], WATER_Y, PILOT_BASE[1]]}>
      <PilotBoatHull underway={isAssisting} />
      <Chip3D
        position={[0, 5.4, 0]}
        tone={isAssisting ? "signal" : "moss"}
      >
        <span className="font-mono text-xs">{statusText}</span>
      </Chip3D>
    </group>
  );
});
