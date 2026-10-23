import { memo, useMemo } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { COLORS } from "@/data/layout";
import { HIPG_BERTHS, type HipgBerthDef } from "@/data/hipgLayout";
import { mat, unitBox, unitCyl } from "./parts";
import { FONT_URL } from "./Terrain";
import { Chip3D } from "./Chip3D";
import { usePort } from "@/state/PortProvider";

const APRON_WIDTH = 12.0;
const WALL_DEPTH = 0.8;
const COPING_WIDTH = 0.55;

interface QuaySegmentData {
  berth: HipgBerthDef;
  cx: number;
  cz: number;
  length: number;
  angle: number;
  // Inward normal (pointing inland from water)
  inlandNx: number;
  inlandNz: number;
  // Outward normal (pointing into water)
  waterNx: number;
  waterNz: number;
  fenderPositions: Array<[number, number]>;
  bollardPositions: Array<[number, number]>;
}

export const HipgQuays = memo(function HipgQuays() {
  const segments = useMemo<QuaySegmentData[]>(() => {
    return HIPG_BERTHS.map((berth) => {
      const [x1, z1] = berth.provisionalCoordinates.start;
      const [x2, z2] = berth.provisionalCoordinates.end;
      const dx = x2 - x1;
      const dz = z2 - z1;
      const length = Math.hypot(dx, dz);
      const angle = Math.atan2(dz, dx);

      // Tangent unit vector along quay
      const tx = dx / length;
      const tz = dz / length;

      // Inward normal (into land): rotate tangent 90 deg clockwise in screen space (X, Z)
      // For Eastern quay (going +Z): (tx=0, tz=1) -> inward is (-1, 0) West. Correct!
      // For Southern quay (going +X): (tx=1, tz=0) -> inward is (0, 1) South. Correct!
      // For Western quay (going +Z): (tx=0, tz=1) -> inward is (-1, 0) West. Correct!
      // For Northern quay (going +X): (tx=1, tz=0) -> inward is (0, -1) North!
      // Wait, for Northern quay, start is (-140, -170) and end is (139.5, -170).
      // Tangent is (+1, 0). Inland is North (-Z). So inward is (0, -1).
      let inlandNx = -tz;
      let inlandNz = tx;

      if (berth.primaryQuayFacing === "south") {
        inlandNx = 0;
        inlandNz = -1;
      } else if (berth.primaryQuayFacing === "north") {
        inlandNx = 0;
        inlandNz = 1;
      } else if (berth.primaryQuayFacing === "east") {
        inlandNx = -1;
        inlandNz = 0;
      } else if (berth.primaryQuayFacing === "northeast") {
        inlandNx = -Math.SQRT1_2;
        inlandNz = Math.SQRT1_2;
      }

      const waterNx = -inlandNx;
      const waterNz = -inlandNz;

      const cx = (x1 + x2) / 2;
      const cz = (z1 + z2) / 2;

      // Fenders along water edge
      const fenderStep = 8.0;
      const fenderCount = Math.max(2, Math.floor(length / fenderStep));
      const fenderPositions: Array<[number, number]> = [];
      const bollardPositions: Array<[number, number]> = [];

      for (let i = 0; i < fenderCount; i++) {
        const u = (i + 0.5) / fenderCount;
        const fx = x1 + dx * u + waterNx * (WALL_DEPTH / 2 + 0.2);
        const fz = z1 + dz * u + waterNz * (WALL_DEPTH / 2 + 0.2);
        fenderPositions.push([fx, fz]);

        if (i % 2 === 0) {
          const bx = x1 + dx * u + inlandNx * 0.45;
          const bz = z1 + dz * u + inlandNz * 0.45;
          bollardPositions.push([bx, bz]);
        }
      }

      return {
        berth,
        cx,
        cz,
        length,
        angle,
        inlandNx,
        inlandNz,
        waterNx,
        waterNz,
        fenderPositions,
        bollardPositions,
      };
    });
  }, []);

  return (
    <group name="hipg-quays">
      {segments.map((seg) => {
        const { berth, cx, cz, length, angle, inlandNx, inlandNz, waterNx, waterNz } = seg;

        // Position of the apron center (offset inland from the water edge)
        const apronCx = cx + inlandNx * (APRON_WIDTH / 2);
        const apronCz = cz + inlandNz * (APRON_WIDTH / 2);

        // Position of the vertical quay wall face (along the water edge)
        const wallCx = cx + waterNx * (WALL_DEPTH / 2);
        const wallCz = cz + waterNz * (WALL_DEPTH / 2);

        // Text orientation
        const textX = cx + inlandNx * 3.5;
        const textZ = cz + inlandNz * 3.5;

        return (
          <group key={berth.id}>
            {/* Concrete apron surface */}
            <mesh
              position={[apronCx, 0.02, apronCz]}
              rotation={[-Math.PI / 2, 0, -angle]}
              receiveShadow
              material={mat(COLORS.quay, { rough: 0.9 })}
            >
              <planeGeometry args={[length, APRON_WIDTH]} />
            </mesh>

            {/* Edge coping strip (bright water-edge demarcation) */}
            <mesh
              position={[cx, 0.04, cz]}
              rotation={[-Math.PI / 2, 0, -angle]}
              material={mat(COLORS.coping, { rough: 0.4 })}
            >
              <planeGeometry args={[length, COPING_WIDTH]} />
            </mesh>

            {/* Vertical quay wall (drops into water) */}
            <mesh
              position={[wallCx, -1.0, wallCz]}
              rotation={[0, -angle, 0]}
              scale={[length, 2.2, WALL_DEPTH]}
              geometry={unitBox}
              material={mat(COLORS.quayWall, { rough: 0.85 })}
              receiveShadow
            />

            {/* Rubber fenders */}
            {seg.fenderPositions.map(([fx, fz], fi) => (
              <mesh
                key={`f-${fi}`}
                position={[fx, -0.7, fz]}
                rotation={[0, -angle, 0]}
                scale={[1.2, 1.4, 0.45]}
                geometry={unitBox}
                material={mat("#2B2F36", { rough: 0.85 })}
              />
            ))}

            {/* Mooring bollards */}
            {seg.bollardPositions.map(([bx, bz], bi) => (
              <mesh
                key={`b-${bi}`}
                position={[bx, 0.35, bz]}
                scale={[0.42, 0.7, 0.42]}
                geometry={unitCyl}
                material={mat(COLORS.ink, { metal: 0.5, rough: 0.4 })}
                castShadow
              />
            ))}

            {/* ======================================================== */}
            {/* GROUND DIMENSION LINES & METERS DEMARCATION (BIMA LINES)  */}
            {/* ======================================================== */}
            {/* 1. Yellow boundary lines cutting across the apron at start and end of each berth */}
            <mesh
              position={[
                berth.provisionalCoordinates.start[0] + inlandNx * (APRON_WIDTH / 2),
                0.06,
                berth.provisionalCoordinates.start[1] + inlandNz * (APRON_WIDTH / 2),
              ]}
              rotation={[-Math.PI / 2, 0, -angle + Math.PI / 2]}
              scale={[APRON_WIDTH, 0.05, 0.4]}
              geometry={unitBox}
              material={mat("#F59E0B")}
            />
            <mesh
              position={[
                berth.provisionalCoordinates.end[0] + inlandNx * (APRON_WIDTH / 2),
                0.06,
                berth.provisionalCoordinates.end[1] + inlandNz * (APRON_WIDTH / 2),
              ]}
              rotation={[-Math.PI / 2, 0, -angle + Math.PI / 2]}
              scale={[APRON_WIDTH, 0.05, 0.4]}
              geometry={unitBox}
              material={mat("#F59E0B")}
            />

            {/* 2. Main Dimension Line on the ground running the entire length of the berth */}
            <mesh
              position={[cx + inlandNx * 5.5, 0.06, cz + inlandNz * 5.5]}
              rotation={[-Math.PI / 2, 0, -angle]}
              scale={[Math.max(1, length - 1.2), 0.04, 0.22]}
              geometry={unitBox}
              material={mat("#FBBF24")}
            />

            {/* 3. Dimension Start & End Arrowhead Caps on the ground */}
            <mesh
              position={[
                berth.provisionalCoordinates.start[0] + (berth.provisionalCoordinates.end[0] - berth.provisionalCoordinates.start[0]) * 0.03 + inlandNx * 5.5,
                0.07,
                berth.provisionalCoordinates.start[1] + (berth.provisionalCoordinates.end[1] - berth.provisionalCoordinates.start[1]) * 0.03 + inlandNz * 5.5,
              ]}
              rotation={[-Math.PI / 2, 0, -angle + Math.PI / 4]}
              scale={[1.4, 0.05, 0.28]}
              geometry={unitBox}
              material={mat("#F59E0B")}
            />
            <mesh
              position={[
                berth.provisionalCoordinates.end[0] - (berth.provisionalCoordinates.end[0] - berth.provisionalCoordinates.start[0]) * 0.03 + inlandNx * 5.5,
                0.07,
                berth.provisionalCoordinates.end[1] - (berth.provisionalCoordinates.end[1] - berth.provisionalCoordinates.start[1]) * 0.03 + inlandNz * 5.5,
              ]}
              rotation={[-Math.PI / 2, 0, -angle - Math.PI / 4]}
              scale={[1.4, 0.05, 0.28]}
              geometry={unitBox}
              material={mat("#F59E0B")}
            />

            {/* 4. Ground Painted Berth Name and Exact Meters (Large ground painted text) */}
            {/* Painted text background pad for extra ground contrast */}
            <mesh
              position={[cx + inlandNx * 5.5, 0.05, cz + inlandNz * 5.5]}
              rotation={[-Math.PI / 2, 0, -angle]}
              scale={[Math.min(length * 0.75, 34), 0.02, 2.8]}
              geometry={unitBox}
              material={mat("#1E293B", { rough: 0.95 })}
            />

            {/* High-contrast ground painted length text */}
            <Text
              font={FONT_URL}
              fontSize={1.7}
              color="#FDE047"
              position={[cx + inlandNx * 5.5, 0.08, cz + inlandNz * 5.5]}
              rotation={[-Math.PI / 2, 0, -angle]}
              anchorX="center"
              anchorY="middle"
            >
              {`◄─ ${berth.name.toUpperCase()} · ${berth.lengthMeters}m ─►`}
            </Text>

            {/* Coping edge painted label */}
            <Text
              font={FONT_URL}
              fontSize={1.2}
              color="#FFFFFF"
              position={[textX, 0.08, textZ]}
              rotation={[-Math.PI / 2, 0, -angle]}
              anchorX="center"
              anchorY="middle"
            >
              {`${berth.name} (${berth.lengthMeters}m)`}
            </Text>

            {/* Floating 3D badge */}
            <Chip3D
              position={[cx + inlandNx * 1.5, 7.5, cz + inlandNz * 1.5]}
              tone={berth.berthNumber === 0 ? "harbor" : berth.berthNumber <= 2 ? "signal" : berth.berthNumber <= 6 ? "moss" : "amber"}
            >
              <span className="font-mono font-bold tracking-wide">
                {`${berth.name}: `}
                <span className="text-signal underline decoration-signal/50">{`${berth.lengthMeters}m`}</span>
              </span>
            </Chip3D>
          </group>
        );
      })}
    </group>
  );
});
