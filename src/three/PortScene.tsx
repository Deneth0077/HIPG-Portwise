import { Suspense } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import { VESSELS, QUAY_CRANES } from "@/data/port";
import { COLORS } from "@/data/layout";
import { Water } from "./Water";
import { Terrain } from "./Terrain";
import { BerthedVessel, ChannelTraffic, PortCallVessel } from "./Vessel";
import { PilotBoat } from "./PilotBoat";
import { portCall } from "@/sim/ais/portCalls";
import { AisOverlay } from "./AisOverlay";
import { QuayCrane } from "./QuayCrane";
import { YardBlocks, YardContainers, YardCrane } from "./Yard";
import { YardRoRoVehicles } from "./RoRoVehicles";
import { Trucks } from "./Trucks";
import { District } from "./district/District";
import { CameraRig } from "./CameraRig";
import { boot } from "@/state/boot";
import { SceneReady } from "./SceneReady";
import { Lightning, Rain, SkyRig } from "./Atmosphere";
import { CctvSceneLayer } from "./cctv/CctvSceneLayer";
import { BuildPlacementGhost } from "./twin/BuildPlacementGhost";
import { EditSelectionGizmo } from "./twin/EditSelectionGizmo";
import { InteractiveFences } from "./twin/InteractiveFences";
import { FenceLineDrawingGhost } from "./twin/FenceLineDrawingGhost";

/** Phones and tablets: lighter pixel ratio and shadow map to keep frame rate and battery in check. */
const IS_LITE = typeof window !== "undefined" && (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 1024);
const DPR: [number, number] = IS_LITE ? [1, 1.5] : [1, 1.75];

const YARD_CRANES: Array<[string, number]> = [
  ["L02", 0],
  ["L03", 1.7],
  ["L04", 3.1],
  ["M01", 0.9],
  ["M02", 2.4],
  ["M03", 4.2],
  ["H01", 1.2],
  ["H02", 3.6],
];

function World() {
  return (
    <>
      <Terrain />
      <Water />
      <ChannelTraffic />
      <PilotBoat />
      <AisOverlay />
      {VESSELS.filter((v) => v.inScene && !portCall(v.id)).map((v) => (
        <BerthedVessel key={v.id} vessel={v} />
      ))}
      {VESSELS.filter((v) => v.inScene && portCall(v.id)).map((v) => (
        <PortCallVessel key={v.id} vessel={v} />
      ))}
      {QUAY_CRANES.map((c, i) => (
        <QuayCrane key={c.id} crane={c} index={i} />
      ))}
      <YardRoRoVehicles />
      <YardContainers />
      <YardBlocks />
      {YARD_CRANES.map(([id, phase]) => (
        <YardCrane key={id} blockId={id} phase={phase} />
      ))}
      <Trucks />
      <CctvSceneLayer />
      <InteractiveFences />
      <FenceLineDrawingGhost />
      <BuildPlacementGhost />
      <EditSelectionGizmo />
      <Rain />
      <Lightning />
    </>
  );
}

/** Full-bleed live 3D terminal. Rendered once and kept alive across routes. */
export default function PortScene() {
  return (
    <Canvas
      shadows
      dpr={DPR}
      camera={{ fov: 30, near: 1.5, far: 2400, position: [170, 230, 190] }}
      gl={{
        antialias: true,
        logarithmicDepthBuffer: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.12,
      }}
      onCreated={() => boot.mark("engine")}
      onPointerMissed={() => {
        document.body.style.cursor = "";
      }}
    >
      <color attach="background" args={[COLORS.canvas]} />
      <fog attach="fog" args={[COLORS.canvas, 650, 1800]} />
      <SkyRig />
      <Suspense fallback={null}>
        <World />
        <SceneReady />
      </Suspense>
      <CameraRig />
      <AdaptiveDpr pixelated={false} />
    </Canvas>
  );
}
