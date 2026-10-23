import { hipgBerthPose } from "@/data/hipgLayout";
import { ARRIVAL_SECONDS } from "../constants";
import { KN, M_PER_UNIT } from "./geo";
import { buildVoyage } from "./voyage";
import type { Truth, Voyage, VoyagePhase } from "./voyage";
import { shipClassOf } from "./static";
import type { ShipClass } from "@/data/shipClasses";

/*
 * Port calls for the simulated morning, scripted the way a VTS sees them:
 * a voyage is a chain of legs (sea passage → anchorage → pilotage → tug-assisted berthing → alongside
 * → unberthing → outbound passage), and every nav-status change is a real AIS event.
 *
 * Hambantota International Port (HIPG) water geometry:
 *   • Quays: Eastern berths (01, 02) along x ≈ 155.76, facing East into the Fairway (x ≈ 170–300).
 *   • Berth 03: Angled transitional quay (midpoint x = 142.25, z = -2.40, heading 315°).
 *   • Fairway channel: Navigable water x ∈ [200, 320], z ∈ [0, 260].
 *   • Eastern Deep Water Anchorage (AWW): x ∈ [400, 700], z ∈ [220, 320], completely clear of land.
 *   • International shipping lanes (TSS off Sri Lanka): z ≥ 340 deep water.
 */

export const ORIENT_LOTUS = "orient-lotus";
export const MERLION_STAR = "merlion-star";
export const BLUE_MARLIN = "blue-marlin";

/** ORIENT LOTUS drops anchor at the Eastern Anchorage after her sea passage (08:45:40). */
export const T_OL_ANCHORED = -3500;
/** ORIENT LOTUS heaves anchor and proceeds to HIPG under pilotage. */
export const T_HEAVE = -300;
/** End of her channel leg; tugs push her the last 40 m alongside Berth 03. */
export const T_ALONGSIDE = 260;
/** MERLION STAR's last export box is loaded; STS-01 raises its boom. */
export const T_MK_CARGO_DONE = -240;
export const T_MK_PILOT = 300;
/** MERLION STAR lets go all lines (ATD 09:51). */
export const T_MK_SLIP = 420;
const T_MK_OFF = 580;
const T_MK_PATH_END = 1480;
/** BLUE MARLIN anchors at the Eastern Anchorage to wait for her 13:30 berth window. */
export const T_BM_ANCHORED = 560;

const OL_ANCHOR: [number, number] = [450, 240];
const BM_ANCHOR: [number, number] = [585, 252];
/** Port limit / fairway buoy: an outbound ship east of this counts as sailed. */
export const PORT_LIMIT_X = 520;

export const laneZ = (dir: "W" | "E", x: number): number => (dir === "W" ? 380 : 340) + 8 * Math.sin(x / 170);
const kn = (k: number): number => (k * KN) / M_PER_UNIT;

/* ------------------------------------------------------------------ */
/* Terminal port calls                                                 */
/* ------------------------------------------------------------------ */

// Berth 03 berthed coordinates
const B03_POSE = hipgBerthPose(3);
// Berth 01 berthed coordinates
const B01_POSE = hipgBerthPose(1);

const orientLotus = buildVoyage({ x: 1080, z: 320, heading: 290 }, -4200, [
  { kind: "path", until: T_OL_ANCHORED, pts: [[820, 280], [620, 250], OL_ANCHOR], startKn: 10, endKn: 0, phase: "inbound", drift: 0.8 },
  { kind: "anchor", until: T_HEAVE, swing: 294 },
  {
    kind: "path",
    until: T_ALONGSIDE,
    pts: [
      [380, 200], // Departing anchorage
      [320, 160], // Rendezvous with HIPG Pilot Boat PILOT-01
      [265, 160], // Eastern Fairway channel approach
      [220, 182.36], // Guiding along Fairway parallel to Berth 01
      [195, 182.36], // Tugs made fast on seaward side
    ],
    endKn: 0.7,
    phase: "inbound",
    turnSec: 70,
    drift: 1.6,
  },
  { kind: "push", until: ARRIVAL_SECONDS, to: [B01_POSE.x, B01_POSE.z], heading: 180, phase: "berthing" },
  { kind: "moored", until: Infinity, berth: 1, heading: 180 },
], [[-100, ARRIVAL_SECONDS + 150]]);

const merlionStar = buildVoyage({ x: B01_POSE.x, z: B01_POSE.z, heading: 180 }, -1e6, [
  { kind: "moored", until: T_MK_SLIP, berth: 1, heading: 180 },
  { kind: "push", until: T_MK_OFF, to: [B01_POSE.x + 35, B01_POSE.z], heading: 180, phase: "unberthing" },
  {
    kind: "path",
    until: T_MK_PATH_END,
    pts: [
      [235, 160], // In fairway
      [280, 120], // Outbound channel
      [360, 80],  // Outer fairway
      [480, 60],  // Sea lane approach
      [620, 40],  // Open water
      [800, 30],  // Clear into eastern sea
    ],
    endKn: 10,
    phase: "outbound",
    turnSec: 90,
    drift: 1.2,
  },
  { kind: "cruise", sailedAfter: 0 },
]);

const blueMarlin = buildVoyage({ x: 1120, z: 340, heading: 290 }, -130, [
  { kind: "path", until: T_BM_ANCHORED, pts: [[900, 310], [720, 276], BM_ANCHOR], startKn: 9, endKn: 0, phase: "inbound", drift: 0.8 },
  { kind: "anchor", until: Infinity, swing: 292 },
]);

function firstTime(v: Voyage, pred: (s: Truth) => boolean, from: number, to: number): number {
  const s: Truth = { x: 0, z: 0, heading: 0, status: 0 };
  for (let t = from; t <= to; t += 1) if (pred(v.truth(t, s))) return t;
  return to;
}

/** MERLION STAR clears the port limit (computed from her track, not scripted). */
export const T_MK_SAILED = firstTime(merlionStar, (s) => s.x > PORT_LIMIT_X, T_MK_OFF, T_MK_PATH_END + 600);

export type MovementKind = "arrival" | "departure";

export interface PortCall {
  id: string;
  kind: MovementKind;
  voyage: Voyage;
  berth: number;
  /** Heading when moored (bow west = 270 for ships that swung on arrival). */
  berthHeading: number;
  /** Where the current leg is heading, for distance/ETA readouts. */
  target: (t: number) => [number, number] | null;
  phaseAt: (t: number) => VoyagePhase;
}

const legTarget =
  (v: Voyage) =>
  (t: number): [number, number] | null => {
    const l = v.legAt(t);
    if (!Number.isFinite(l.t1) || l.kind === "anchor" || l.kind === "moored") return null;
    const s: Truth = { x: 0, z: 0, heading: 0, status: 0 };
    // Arrivals aim for the berth through the push leg; departures for the port limit.
    let end = l.t1;
    const next = v.legs[v.legs.indexOf(l) + 1];
    if (l.kind === "path" && next?.kind === "push") end = next.t1;
    v.truth(end, s);
    return [s.x, s.z];
  };

export const PORT_CALLS: PortCall[] = [
  {
    id: MERLION_STAR,
    kind: "departure",
    voyage: merlionStar,
    berth: 1,
    berthHeading: 180,
    target: (t) => (t >= T_MK_SLIP && t < T_MK_SAILED ? [PORT_LIMIT_X, laneZ("E", PORT_LIMIT_X)] : null),
    phaseAt: (t) => (t >= T_MK_SAILED ? "sailed" : merlionStar.phaseAt(t)),
  },
  { id: BLUE_MARLIN, kind: "arrival", voyage: blueMarlin, berth: 1, berthHeading: 180, target: legTarget(blueMarlin), phaseAt: (t) => blueMarlin.phaseAt(t) },
];

export const portCall = (id: string): PortCall | undefined => PORT_CALLS.find((p) => p.id === id);

/* ------------------------------------------------------------------ */
/* Movement log                                                        */
/* ------------------------------------------------------------------ */

export interface PortEvent {
  id: string;
  t: number;
  vesselId: string;
  /** Short label for the time-bar marker; omitted for minor events. */
  marker?: string;
  /** Line in the vessel activity log. */
  text: string;
  tone: "harbor" | "moss" | "amber" | "brick";
}

const EVENTS: PortEvent[] = [
  { id: "ol-anchor", t: T_OL_ANCHORED, vesselId: ORIENT_LOTUS, marker: "ORIENT LOTUS anchored (AIS: At anchor)", text: "AIS status → At anchor · ORIENT LOTUS anchored at the Eastern Deepwater Anchorage (AWW), waiting for Berth 01", tone: "amber" },
  { id: "ol-pilot", t: T_HEAVE - 480, vesselId: ORIENT_LOTUS, text: "HIPG pilot cutter PILOT-01 rendezvoused at Eastern Fairway Handover Waypoint", tone: "harbor" },
  { id: "ol-heave", t: T_HEAVE, vesselId: ORIENT_LOTUS, marker: "ORIENT LOTUS heaves anchor (AIS: Under way)", text: "AIS status → Under way · ORIENT LOTUS heaved anchor, proceeding under pilotage to HIPG Fairway", tone: "harbor" },
  { id: "ol-tugs", t: T_ALONGSIDE - 150, vesselId: ORIENT_LOTUS, text: "HIPG harbour tugs made fast · ORIENT LOTUS guiding into Berth 01", tone: "harbor" },
  { id: "ol-berth", t: ARRIVAL_SECONDS, vesselId: ORIENT_LOTUS, marker: "ORIENT LOTUS moored (AIS) · STS-01 starts", text: "AIS status → Moored · ORIENT LOTUS all fast at Berth 01 – STS-01 boom lowered", tone: "moss" },
  { id: "mk-cargo", t: T_MK_CARGO_DONE, vesselId: MERLION_STAR, marker: "MERLION STAR cargo complete", text: "MERLION STAR cargo complete · 580/580 TEU loaded, STS-01 boom raised", tone: "moss" },
  { id: "mk-pilot", t: T_MK_PILOT, vesselId: MERLION_STAR, text: "HIPG pilot boarded MERLION STAR · harbour tugs on standby at Berth 01", tone: "harbor" },
  { id: "mk-slip", t: T_MK_SLIP, vesselId: MERLION_STAR, marker: "MERLION STAR unberths (AIS: Under way)", text: "AIS status → Under way · MERLION STAR let go all lines from Berth 01, proceeding outbound", tone: "harbor" },
  { id: "mk-sailed", t: T_MK_SAILED, vesselId: MERLION_STAR, marker: "MERLION STAR clears HIPG port limits", text: "MERLION STAR cleared HIPG port limit · pilot disembarked to cutter, vessel bound for Kaohsiung", tone: "moss" },
  { id: "bm-anchor", t: T_BM_ANCHORED, vesselId: BLUE_MARLIN, marker: "BLUE MARLIN anchored (AIS: At anchor)", text: "AIS status → At anchor · BLUE MARLIN anchored at Eastern Anchorage, awaiting her 13:30 Berth 01 window", tone: "amber" },
];

/** Every port movement of the morning, oldest first. */
export const PORT_EVENTS: PortEvent[] = EVENTS.sort((a, b) => a.t - b.t);

/* ------------------------------------------------------------------ */
/* Shipping traffic passing off Hambantota (TSS)                      */
/* ------------------------------------------------------------------ */

/** A ship off the terminal that never calls at it: Strait transit traffic or a ship swinging at anchor. */
export interface Transit {
  id: string;
  name: string;
  kind: "transit" | "anchored";
  cls: ShipClass;
  length: number;
  hull: string;
  voyage: Voyage;
}

interface TransitSpec {
  id: string;
  name: string;
  dir: "W" | "E";
  kn: number;
  /** Sim time she passes x = 0. */
  passT: number;
  length: number;
  hull: string;
}

interface AnchoredSpec {
  id: string;
  name: string;
  at: [number, number];
  /** Heading she lies to her anchor (into the tidal stream). */
  swing: number;
  length: number;
  hull: string;
}

const STRAIT_EAST = 1200;
const STRAIT_WEST = -400;

function transitVoyage(dir: "W" | "E", speedKn: number, passT: number): Voyage {
  const xs: number[] = [];
  const step = 150;
  if (dir === "W") for (let x = STRAIT_EAST; x >= STRAIT_WEST; x -= step) xs.push(x);
  else for (let x = STRAIT_WEST; x <= STRAIT_EAST; x += step) xs.push(x);
  const pts: Array<[number, number]> = xs.map((x) => [x, laneZ(dir, x)]);
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  const v = kn(speedKn);
  const x0 = pts[0][0];
  const t0 = passT - Math.abs(x0) / v;
  return buildVoyage({ x: x0, z: pts[0][1], heading: dir === "W" ? 270 : 90 }, t0, [
    { kind: "path", until: t0 + len / v, pts: pts.slice(1), startKn: speedKn, endKn: speedKn, phase: "inbound", turnSec: 1, drift: 1 },
    { kind: "cruise", sailedAfter: 0 },
  ]);
}

const TRANSIT_SPECS: TransitSpec[] = [
  { id: "kota-ria", name: "KOTA RIA", dir: "W", kn: 9.0, passT: -2600, length: 24, hull: "#2F5D4E" },
  { id: "batam-link", name: "BATAM LINK", dir: "E", kn: 8.6, passT: -1700, length: 26, hull: "#1E3A66" },
  { id: "jurong-08", name: "JURONG 08", dir: "E", kn: 7.5, passT: -1000, length: 20, hull: "#8A3B34" },
  { id: "sinar-bintan", name: "SINAR BINTAN", dir: "W", kn: 9.4, passT: 420, length: 24, hull: "#4F6D8F" },
  { id: "straits-03", name: "STRAITS 03", dir: "E", kn: 6.5, passT: 1500, length: 20, hull: "#6B5A3E" },
  { id: "ocean-grace", name: "OCEAN GRACE", dir: "W", kn: 10.2, passT: 1750, length: 28, hull: "#B5463A" },
  { id: "johor-pride", name: "JOHOR PRIDE", dir: "W", kn: 8.8, passT: 2500, length: 22, hull: "#2C6FB0" },
  { id: "pacific-21", name: "PACIFIC 21", dir: "E", kn: 8.2, passT: 2950, length: 24, hull: "#2F5D4E" },
  { id: "cape-ophir", name: "CAPE OPHIR", dir: "E", kn: 10.4, passT: -420, length: 44, hull: "#1E3A66" },
  { id: "ocean-pearl", name: "OCEAN PEARL", dir: "W", kn: 11.2, passT: 180, length: 46, hull: "#3B4A5C" },
];

/** Tankers and bulk carriers lying at the Eastern Anchorage off Hambantota, in deep water clear of all fairway routes. */
const ANCHORED_SPECS: AnchoredSpec[] = [
  { id: "eagle-tuas", name: "EAGLE TUAS", at: [480, 310], swing: 250, length: 44, hull: "#8A3B34" },
  { id: "cape-keppel", name: "CAPE KEPPEL", at: [560, 280], swing: 262, length: 44, hull: "#2F5D4E" },
  { id: "golden-harvest", name: "GOLDEN HARVEST", at: [640, 330], swing: 258, length: 38, hull: "#B5463A" },
  { id: "sentosa-glory", name: "SENTOSA GLORY", at: [760, 290], swing: 268, length: 34, hull: "#2B3442" },
];

export const TRANSITS: Transit[] = [
  ...TRANSIT_SPECS.map<Transit>(({ dir, kn: speed, passT, ...s }) => ({ ...s, kind: "transit", cls: shipClassOf(s.id), voyage: transitVoyage(dir, speed, passT) })),
  ...ANCHORED_SPECS.map<Transit>(({ at, swing, ...s }) => ({
    ...s,
    kind: "anchored",
    cls: shipClassOf(s.id),
    voyage: buildVoyage({ x: at[0], z: at[1], heading: swing }, -1e6, [{ kind: "anchor", until: Infinity, swing }]),
  })),
];

/** Ships further out than this are beyond the scene's fog and hidden. */
export const VISIBLE_X = 960;
