import type { Alert, BerthBooking, QuayCrane, RoutePoint, Truck, Vessel, YardBlock } from "./types";
import { BLOCK_COL_X, BLOCK_ROW_Z, GATE_X } from "./layout";
import { AVE_N, AVE_S } from "./facilities";
import { DRAYAGE_TRUCKS } from "./drayage";

export const PORT_NAME = "Hambantota International Port";
/** Port authority / city shown alongside the terminal name. */
export const PORT_CITY = "HIPG · Sri Lanka";
/** Active demo berth count kept at 8 for the 3D scene in Phase 1; full HIPG berth count is 12. */
export const BERTH_COUNT = 9;
export const CARRIER_NAME = "HIPG Logistics";

import {
  HIPG_YARD_BLOCKS,
  toLegacyYardBlock,
} from "./hipgLayout";

export {
  HIPG_PORT_NAME,
  HIPG_PORT_CITY,
  HIPG_BERTH_COUNT,
  HIPG_BERTHS,
  HIPG_YARD_BLOCKS,
  HIPG_CATEGORY_META,
  HIPG_BUILDINGS,
  HIPG_FEEDER_ROADS,
  hipgBerthById,
  hipgBlockById,
  toLegacyYardBlock,
} from "./hipgLayout";


export const VESSELS: Vessel[] = [
  {
    id: "seastar-07",
    name: "MV SEASTAR 07",
    short: "SEASTAR 07",
    imo: "9784512",
    line: "Seastar Lines",
    flag: "Singapore",
    voyage: "SS07-2441N",
    from: "Shanghai",
    to: "Port Klang",
    berth: 2,
    status: "discharging",
    dischargeTotal: 1310,
    discharged: 812,
    loadTotal: 940,
    loaded: 0,
    eta: "05:40",
    etb: "06:15",
    etd: "21:30",
    cranes: ["STS-02", "STS-03", "STS-04"],
    hull: "#1E3A66",
    length: 42,
    inScene: true,
  },
  {
    id: "merlion-star",
    name: "MV MERLION STAR",
    short: "MERLION STAR",
    imo: "9652207",
    line: "Seastar Lines",
    flag: "Singapore",
    voyage: "MK11-2440S",
    from: "Laem Chabang",
    to: "Kaohsiung",
    berth: 1,
    status: "scheduled",
    dischargeTotal: 620,
    discharged: 620,
    loadTotal: 580,
    loaded: 580,
    eta: "00:20",
    etb: "01:00",
    etd: "09:51",
    cranes: [],
    hull: "#2F5D4E",
    length: 34,
    inScene: false,
  },
  {
    id: "orient-lotus",
    name: "MV ORIENT LOTUS",
    short: "ORIENT LOTUS",
    imo: "9810344",
    line: "Orient Pacific",
    flag: "Panama",
    voyage: "OL03-2442W",
    from: "Hong Kong",
    to: "Jakarta",
    berth: 1,
    status: "discharging",
    dischargeTotal: 980,
    discharged: 529,
    loadTotal: 760,
    loaded: 0,
    eta: "08:45",
    etb: "09:50",
    etd: "23:40",
    cranes: ["STS-01", "STS-07", "STS-08"],
    hull: "#B5463A",
    length: 38,
    inScene: true,
    delayMin: 0,
  },
  {
    id: "jade-river",
    name: "MV JADE RIVER",
    short: "JADE RIVER",
    imo: "9725590",
    line: "Seastar Lines",
    flag: "Singapore",
    voyage: "JR04-2441S",
    from: "Ho Chi Minh",
    to: "Manila",
    berth: 5,
    status: "loading",
    dischargeTotal: 450,
    discharged: 450,
    loadTotal: 820,
    loaded: 388,
    eta: "03:10",
    etb: "03:45",
    etd: "14:00",
    cranes: [],
    hull: "#2C6FB0",
    length: 40,
    inScene: false,
  },
  {
    id: "pacific-harmony",
    name: "MV PACIFIC HARMONY",
    short: "PACIFIC HARMONY",
    imo: "9690212",
    line: "Asia Link",
    flag: "Singapore",
    voyage: "PH22-2441N",
    from: "Port Klang",
    to: "Busan",
    berth: 4, // Dedicated HIPG RoRo / Multipurpose berth with ramp to 4W yard
    status: "discharging",
    dischargeTotal: 1140,
    discharged: 356,
    loadTotal: 900,
    loaded: 0,
    eta: "07:30",
    etb: "08:05",
    etd: "23:15",
    cranes: [], // RoRo vehicle cargo operations use ramp, not STS cranes
    hull: "#4F6D8F",
    length: 42,
    inScene: true,
  },
  {
    id: "coral-bay",
    name: "MV CORAL BAY",
    short: "CORAL BAY",
    imo: "9758830",
    line: "Orient Pacific",
    flag: "Hong Kong",
    voyage: "CB09-2440E",
    from: "Shenzhen",
    to: "Bangkok",
    berth: 7,
    status: "discharging",
    dischargeTotal: 960,
    discharged: 702,
    loadTotal: 640,
    loaded: 0,
    eta: "02:00",
    etb: "02:40",
    etd: "16:20",
    cranes: [],
    hull: "#8A3B34",
    length: 38,
    inScene: false,
  },
  {
    id: "nordic-spirit",
    name: "MV NORDIC SPIRIT",
    short: "NORDIC SPIRIT",
    imo: "9601178",
    line: "Seastar Lines",
    flag: "Singapore",
    voyage: "NS15-2441W",
    from: "Tanjung Pelepas",
    to: "Colombo",
    berth: 8,
    status: "discharging",
    dischargeTotal: 1180,
    discharged: 410,
    loadTotal: 860,
    loaded: 0,
    eta: "06:40",
    etb: "07:10",
    etd: "22:15",
    cranes: ["STS-13", "STS-14"],
    hull: "#1E3A66",
    length: 44,
    inScene: true,
  },
  {
    id: "harmony-star",
    name: "MV HARMONY STAR",
    short: "HARMONY STAR",
    imo: "9733901",
    line: "Pan-Asia Lines",
    flag: "Liberia",
    voyage: "HS07-2441E",
    from: "Colombo",
    to: "Port Klang",
    berth: 8,
    status: "scheduled",
    dischargeTotal: 920,
    discharged: 0,
    loadTotal: 780,
    loaded: 0,
    eta: "21:30",
    etb: "22:00",
    etd: "10:00 (+1)",
    cranes: [],
    hull: "#3A6B4C",
    length: 36,
    inScene: false,
  },
  {
    id: "blue-marlin",
    name: "MV BLUE MARLIN",
    short: "BLUE MARLIN",
    imo: "9533018",
    line: "Seastar Lines",
    flag: "Singapore",
    voyage: "BM08-2441N",
    from: "Bangkok",
    to: "Busan",
    berth: 1,
    status: "scheduled",
    dischargeTotal: 540,
    discharged: 0,
    loadTotal: 610,
    loaded: 0,
    eta: "09:53",
    etb: "13:30",
    etd: "22:00",
    cranes: [],
    hull: "#1E3A66",
    length: 32,
    inScene: true,
  },
  {
    id: "jakarta-express",
    name: "MV JAKARTA EXPRESS",
    short: "JAKARTA EXP.",
    imo: "9701425",
    line: "Seastar Lines",
    flag: "Singapore",
    voyage: "HP02-2441N",
    from: "Surabaya",
    to: "Jakarta",
    berth: 4,
    status: "scheduled",
    dischargeTotal: 420,
    discharged: 0,
    loadTotal: 380,
    loaded: 0,
    eta: "15:10",
    etb: "15:30",
    etd: "23:59",
    cranes: [],
    hull: "#1E3A66",
    length: 30,
    inScene: false,
  },
  {
    id: "asian-dawn",
    name: "MV ASIAN DAWN",
    short: "ASIAN DAWN",
    imo: "9466731",
    line: "Asia Link",
    flag: "Singapore",
    voyage: "AD15-2442E",
    from: "Port Klang",
    to: "Shanghai",
    berth: 5,
    status: "discharging",
    dischargeTotal: 860,
    discharged: 320,
    loadTotal: 720,
    loaded: 0,
    eta: "06:10",
    etb: "06:45",
    etd: "20:30",
    cranes: [],
    hull: "#385273",
    length: 42,
    inScene: true,
  },
  {
    id: "roro-vanguard",
    name: "MV RORO VANGUARD",
    short: "RORO VANGUARD",
    imo: "9824419",
    line: "Global Auto Carrier",
    flag: "Panama",
    voyage: "RV02-2441N",
    from: "Yokohama",
    to: "Hambantota",
    berth: 6,
    status: "discharging",
    dischargeTotal: 1250,
    discharged: 480,
    loadTotal: 800,
    loaded: 0,
    eta: "05:00",
    etb: "05:30",
    etd: "21:00",
    cranes: [],
    hull: "#2B475D",
    length: 44,
    inScene: true,
  },
];

export const vesselById = (id: string): Vessel | undefined => VESSELS.find((v) => v.id === id);

export const BERTH_SCHEDULE: BerthBooking[] = [
  { berth: 1, label: "ORIENT LOTUS", vesselId: "orient-lotus", start: 8.75, end: 23.5, kind: "active" },
  { berth: 1, label: "BLUE MARLIN", vesselId: "blue-marlin", start: 23.5, end: 24, kind: "planned" },
  { berth: 2, label: "SEASTAR 07", vesselId: "seastar-07", start: 6.25, end: 21.5, kind: "active" },
  { berth: 3, label: "WAN HAI 316", start: 0, end: 4.5, kind: "done" },
  { berth: 4, label: "PACIFIC HARMONY", vesselId: "pacific-harmony", start: 8.08, end: 23.25, kind: "active" },
  { berth: 4, label: "KOTA LAYANG", start: 0, end: 7.2, kind: "done" },
  { berth: 4, label: "JAKARTA EXP.", vesselId: "jakarta-express", start: 15.5, end: 24, kind: "planned" },
  { berth: 5, label: "ASIAN DAWN", vesselId: "asian-dawn", start: 6.75, end: 20.5, kind: "active" },
  { berth: 6, label: "RORO VANGUARD", vesselId: "roro-vanguard", start: 5.5, end: 21.0, kind: "active" },
  { berth: 7, label: "CORAL BAY", vesselId: "coral-bay", start: 2.67, end: 16.33, kind: "active" },
  { berth: 8, label: "NORDIC SPIRIT", vesselId: "nordic-spirit", start: 7.17, end: 22.25, kind: "active" },
  { berth: 8, label: "HARMONY STAR", vesselId: "harmony-star", start: 22.0, end: 24, kind: "planned" },
];

export const QUAY_CRANES: QuayCrane[] = [
  { id: "STS-01", x: 137.5, berth: 1, vesselId: "orient-lotus", mode: "discharge", movesPerHour: 32, movesToday: 210, model: "ZPMC 65t", operator: "Ahmad Rahman" },
  { id: "STS-07", x: 137.5, berth: 1, vesselId: "orient-lotus", mode: "discharge", movesPerHour: 30, movesToday: 185, model: "ZPMC 65t", operator: "Kavinda Silva" },
  { id: "STS-08", x: 137.5, berth: 1, vesselId: "orient-lotus", mode: "discharge", movesPerHour: 33, movesToday: 192, model: "Liebherr STS 70t", operator: "Nimal Perera" },
  { id: "STS-02", x: 137.5, berth: 2, vesselId: "seastar-07", mode: "discharge", movesPerHour: 32, movesToday: 198, model: "ZPMC 65t", operator: "Tan Wei Ming" },
  { id: "STS-03", x: 137.5, berth: 2, vesselId: "seastar-07", mode: "discharge", movesPerHour: 34, movesToday: 214, model: "Liebherr STS 70t", operator: "Priya Nair" },
  { id: "STS-04", x: 137.5, berth: 2, vesselId: "seastar-07", mode: "paused", movesPerHour: 0, movesToday: 88, model: "ZPMC 65t", operator: "Lim Jun Hao", reason: "Squall stop" },
  { id: "STS-05", x: 127.5, berth: 3, mode: "idle", movesPerHour: 0, movesToday: 0, model: "Liebherr STS 70t", operator: "Hafiz Ismail", reason: "Berth standby" },
  { id: "STS-06", x: 50.0, berth: 4, mode: "idle", movesPerHour: 0, movesToday: 64, model: "Portal 40t", operator: "Chen Jia Hui", reason: "Berth standby" },
  { id: "STS-13", x: -158.2, berth: 8, vesselId: "nordic-spirit", mode: "discharge", movesPerHour: 29, movesToday: 156, model: "ZPMC 65t", operator: "Suraj Menon" },
  { id: "STS-14", x: -158.2, berth: 8, vesselId: "nordic-spirit", mode: "discharge", movesPerHour: 31, movesToday: 172, model: "Liebherr STS 70t", operator: "Amara Perera" },
];

export const craneById = (id: string): QuayCrane | undefined => QUAY_CRANES.find((c) => c.id === id);

export const YARD_BLOCKS: YardBlock[] = HIPG_YARD_BLOCKS.map((hb, i) => toLegacyYardBlock(hb, i));

export const blockById = (id: string): YardBlock | undefined => YARD_BLOCKS.find((b) => b.id === id);

export const CATEGORY_LABEL: Record<YardBlock["category"], string> = {
  import: "Container (Import)",
  export: "Container (Export)",
  reefer: "Reefer Stacking",
  container: "Container Stacking Area",
  roro: "RoRo Cargo Parking",
  roro_alt: "Alternative RoRo Yard",
  customs: "Customs Inspection",
  dual_purpose: "Dual Purpose (RoRo/Container)",
};

export const ALERTS: Alert[] = [
  {
    id: "al-wind",
    severity: "danger",
    title: "Monsoon squall 14 m/s – STS-04 stopped",
    detail: "A coastal monsoon squall is crossing the bay with gusts above the 13 m/s safety limit. STS-04 has raised its boom and is waiting for the wind to drop.",
    time: "09:32",
    target: { kind: "crane", id: "STS-04" },
  },
  {
    id: "al-gate",
    severity: "warning",
    title: "Gate B congestion · 18 min wait",
    detail: "3 trucks queued in the Gate B inbound lane. Suggest diverting to Gate A.",
    time: "09:18",
    target: { kind: "truck", id: "XD3390H" },
  },
  {
    id: "al-berth1",
    severity: "info",
    title: "Berth 01 active · MV ORIENT LOTUS alongside",
    detail: "3 STS cranes deployed (STS-01, STS-07, STS-08). Active container discharge operations underway.",
    time: "09:40",
    target: { kind: "vessel", id: "orient-lotus" },
  },
  {
    id: "al-block",
    severity: "warning",
    title: "Block L02 nearly full · 92%",
    detail: "Suggest routing SEASTAR 07 import boxes to block L03.",
    time: "08:31",
    target: { kind: "block", id: "L02" },
  },
  {
    id: "al-maint",
    severity: "info",
    title: "Berth 4 fender repair until 13:00",
    detail: "STS-06 parked. JAKARTA EXPRESS keeps its 15:30 berthing window.",
    time: "08:05",
    target: { kind: "crane", id: "STS-06" },
  },
  {
    id: "al-merlion",
    severity: "success",
    title: "MERLION STAR discharge complete",
    detail: "620/620 TEU discharged. Loading exports, expected to sail 09:51.",
    time: "07:55",
    target: { kind: "vessel", id: "merlion-star" },
  },
];

interface ExternalSpec {
  blockId: string;
  load: boolean;
  queue?: number;
  useMainRoad?: boolean;
}

/** Gate 01 → Western Perimeter Avenue → Handling Corridor / Main Road → Block → Corridor 2 → Gate 01. */
function externalRoute({ blockId, load, queue, useMainRoad }: ExternalSpec): RoutePoint[] {
  const block = blockById(blockId);
  const blockX = block?.x ?? -44;
  const handlingZ = useMainRoad ? 53.5 : 80;
  const startStatus = queue ? "Queued at Gate 01" : "Approaching Gate 01";

  const route: RoutePoint[] = [
    { p: [-105, 222], hidden: true, load: !load, status: startStatus },
    { p: [-125, 222], status: queue ? "Queued at Gate 01" : "Arriving Gate 01" },
  ];

  if (queue) {
    route.push({ p: [-125, 222], wait: queue, status: "Queued at Gate 01" });
  }

  route.push(
    // Gate 01 security, scanning & weighbridge
    { p: [-130, 222], wait: 3, status: "Gate 01 Inspection" },
    // Turn onto Western Perimeter Avenue
    { p: [-165, 222], status: "Entering Yard" },
    { p: [-165, 175] },
    { p: [-165, 106] },
    { p: [-165, handlingZ] },
    // Drive eastbound along Handling Corridor (z=80) or Main Road (z=53.5)
    { p: [blockX, handlingZ], wait: 7, load, status: `Handling at ${blockId}` },
    // Continue eastbound to Eastern Quay Road or East Spine
    { p: [130, handlingZ], status: "Exiting Block" },
    // Turn south down Eastern Quay Road to Arterial Corridor 2 (z=106)
    { p: [130, 106] },
    // Drive westbound along Corridor 2 (z=106) following the map's westbound arrows
    { p: [64, 106] },
    { p: [-8, 106] },
    { p: [-80, 106] },
    { p: [-165, 106] },
    // Drive south along Western Perimeter Avenue
    { p: [-165, 175] },
    { p: [-165, 222] },
    // Gate 01 Outbound Lane
    { p: [-130, 222], wait: 3, status: "Gate 01 Clearance" },
    { p: [-105, 222], status: "Departed" },
  );

  return route;
}

interface ItvSpec {
  craneId: string;
  blockId: string;
  loading: boolean;
}

/** Quay crane ⇄ yard block shuttle along the HIPG paved road network.
 *
 * Lane discipline (left-hand traffic, Sri Lanka):
 *  • Inbound  to crane / yard:  travels on the near (lower-z) lane  → z offset -1.8
 *  • Outbound from crane / yard: travels on the far  (higher-z) lane → z offset +1.8
 *
 * ITV goes under the STS crane outreach boom at x = 130 (CRANE_LANE_Z = 15 in crane-local
 * space), picks up / drops off at the apron lane, then heads to the yard or quay road.
 */
function itvRoute({ craneId, blockId, loading }: ItvSpec): RoutePoint[] {
  const block = blockById(blockId);
  const bx = block?.x ?? 28;

  // ── Berth 08 Western Basin cranes (STS-13, STS-14) ──────────────────────────
  // These cranes sit at x = -158.2. The ITV enters from the south (z = -93→-130),
  // drives under the boom at x = -158.2 and collects from the apron, then routes
  // east to the Basin Apron Road (z = 16), turns into the yard via the West Spine.
  if (craneId === "STS-13" || craneId === "STS-14") {
    const craneZMap: Record<string, number> = { "STS-13": -118, "STS-14": -144 };
    const cz = craneZMap[craneId] ?? -130;
    const cx = -158.2;
    // Lane offsets along the western perimeter avenue (x = -165 ± 1.8)
    const inboundX = -163.2;   // left lane (closer to quay)
    const outboundX = -166.8;  // right lane (away from quay)
    if (!loading) {
      // Discharge: enter under crane boom, carry container to yard block
      return [
        // Drive inbound lane south to the crane position
        { p: [inboundX, 16], hidden: true, load: false, status: `To ${craneId}` },
        { p: [inboundX, cz], status: `Approaching ${craneId}` },
        // Pull under the crane boom at the crane's apron position
        { p: [cx, cz], wait: 7, load: true, status: `Loading at ${craneId}` },
        // Back on outbound lane northbound
        { p: [outboundX, cz], status: "To yard" },
        { p: [outboundX, 16] },
        // Turn east along Basin Apron Road (z=16) toward West Spine
        { p: [-80, 16] },
        { p: [-80, 80] },
        { p: [bx, 80], wait: 6, load: false, status: `Grounding at ${blockId}` },
        // Return west via Corridor 2 (z=106+1.8 = outbound lane)
        { p: [bx, 107.8], status: "Back to crane" },
        { p: [-80, 107.8] },
        { p: [-80, 16] },
        { p: [inboundX, 16], hidden: true },
      ];
    } else {
      // Loading: pick container from yard, deliver to crane
      return [
        { p: [bx, 80], wait: 6, load: true, status: `Picking at ${blockId}` },
        { p: [bx, 104.2], status: `To ${craneId}` },
        { p: [-80, 104.2] },
        { p: [-80, 16] },
        { p: [outboundX, 16] },
        { p: [outboundX, cz] },
        { p: [cx, cz], wait: 7, load: false, status: `Delivering to ${craneId}` },
        { p: [inboundX, cz], hidden: true, status: "Back to yard" },
        { p: [inboundX, 16], hidden: true },
        { p: [-80, 16] },
        { p: [-80, 80] },
      ];
    }
  }

  // ── Berth 04 Portal crane (STS-06) ──────────────────────────────────────────
  if (craneId === "STS-06") {
    const cx = 58;
    const cz = 16;
    return [
      { p: [cx, cz], wait: 7, load: !loading, status: `${loading ? "Delivering to" : "Loading at"} ${craneId}` },
      { p: [64, cz + 1.8], status: "To yard" },
      { p: [64, 81.8] },
      { p: [bx, 81.8], wait: 6, load: loading, status: `Grounding at ${blockId}` },
      { p: [-8, 78.2], status: `Back to ${craneId}` },
      { p: [-8, cz - 1.8] },
      { p: [cx, cz] },
    ];
  }

  // ── Eastern Quay STS cranes (Berths 01 / 02) ────────────────────────────────
  // Road lanes: inbound (to crane) uses z = cz - 1.8, outbound uses z = cz + 1.8.
  // The ITV drives on the inbound (lower-z) quay road lane to reach the crane,
  // enters under the outreach boom at x = 130, waits for container, then exits
  // on the outbound (higher-z) lane.
  const craneZMap: Record<string, number> = {
    "STS-01": 168, "STS-07": 182, "STS-08": 196,
    "STS-02": 62,  "STS-03": 85,  "STS-04": 108,
    "STS-09": 140, "STS-10": 154, "STS-11": 170, "STS-12": 184,
  };
  const cz = craneZMap[craneId] ?? 85;
  // STS boom outreach: the ITV drives to x=126 (under the boom), then to x=130 apron
  // Quay service road lane centres: inbound at x=128.2 (southbound on right), outbound at x=131.8
  const inboundLaneX = 128.2;
  const outboundLaneX = 131.8;
  const boomEntryX = 130;       // directly under the crane boom tip at the apron

  const spineTurnX = bx > 64 ? 64 : bx > -8 ? -8 : -80;

  if (!loading) {
    // Discharge: ITV drives to crane, picks up container, brings to yard block
    return [
      // Approach crane on inbound lane (x = 128.2)
      { p: [inboundLaneX, cz], status: `Approaching ${craneId}` },
      // Pull into crane apron – drives right under the outreach boom
      { p: [boomEntryX, cz], wait: 7, load: true, status: `Loading at ${craneId}` },
      // Exit on outbound lane (x = 131.8), head south toward Corridor 2 (z = 106+1.8)
      { p: [outboundLaneX, cz], status: "To yard" },
      { p: [outboundLaneX, 107.8] },
      // Westbound along Corridor 2 outbound lane toward block's spine
      { p: [spineTurnX, 107.8] },
      { p: [spineTurnX, 81.8] },
      // Drop container at block
      { p: [bx, 81.8], wait: 6, load: false, status: `Grounding at ${blockId}` },
      // Loop north onto MAIN ROAD inbound eastbound lane (z = 53.5 - 1.8 = 51.7)
      { p: [bx, 51.7], status: "Back to quay" },
      { p: [inboundLaneX, 51.7] },
      // Back north along inbound quay lane to crane
      { p: [inboundLaneX, cz] },
    ];
  } else {
    // Loading: pick container at yard, deliver under crane boom
    return [
      { p: [bx, 81.8], wait: 6, load: true, status: `Picking at ${blockId}` },
      // Move to MAIN ROAD outbound eastbound lane (z = 53.5 + 1.8 = 55.3)
      { p: [bx, 55.3], status: `To ${craneId}` },
      { p: [outboundLaneX, 55.3] },
      // Head north along outbound quay lane to crane
      { p: [outboundLaneX, cz] },
      // Pull under the outreach boom to deliver
      { p: [boomEntryX, cz], wait: 7, load: false, status: `Delivering to ${craneId}` },
      // Exit on inbound lane, return south via Corridor 2
      { p: [inboundLaneX, cz], status: "Back to yard" },
      { p: [inboundLaneX, 104.2] },
      { p: [spineTurnX, 104.2] },
      { p: [spineTurnX, 81.8] },
    ];
  }
}

export const TRUCKS: Truck[] = [
  {
    id: "XD4821K",
    plate: "XD4821K",
    carrier: "Seastar Logistics",
    kind: "external",
    cab: "#F6F3EC",
    gate: "Gate 01",
    driver: "Rizal Hamid",
    containerColor: "#F2622E",
    speed: 9,
    offset: 40,
    shipmentId: "SHP-20931",
    baseWait: 3,
    route: externalRoute({ blockId: "L02", load: true }),
  },
  {
    id: "XE1204M",
    plate: "XE1204M",
    carrier: "HIPG Haulage",
    kind: "external",
    cab: "#2C6FB0",
    gate: "Gate 01",
    driver: "Sunil Perera",
    containerColor: "#1E3A66",
    speed: 9,
    offset: 10,
    baseWait: 1,
    route: externalRoute({ blockId: "L01", load: false }),
  },
  {
    id: "XD3390H",
    plate: "XD3390H",
    carrier: "Maersk",
    kind: "external",
    cab: "#4F6D8F",
    gate: "Gate 01",
    driver: "Suresh Pillai",
    containerColor: "#4F6D8F",
    speed: 8.5,
    offset: 0,
    baseWait: 18,
    route: externalRoute({ blockId: "M02", load: false, queue: 26 }),
  },
  {
    id: "XB7715S",
    plate: "XB7715S",
    carrier: "Hapag-Lloyd",
    kind: "external",
    cab: "#F6F3EC",
    gate: "Gate 01",
    driver: "Lee Mei Ling",
    containerColor: "#B5463A",
    speed: 9,
    offset: 38,
    baseWait: 2,
    route: externalRoute({ blockId: "H01", load: false, useMainRoad: true }),
  },
  {
    id: "XE4531P",
    plate: "XE4531P",
    carrier: "Evergreen",
    kind: "external",
    cab: "#4E7A5A",
    gate: "Gate 01",
    driver: "Azman Yusof",
    containerColor: "#4E7A5A",
    speed: 8.5,
    offset: 22,
    baseWait: 11,
    route: externalRoute({ blockId: "M03", load: false, queue: 22 }),
  },
  {
    id: "XD9076T",
    plate: "XD9076T",
    carrier: "Seastar Logistics",
    kind: "external",
    cab: "#F2622E",
    gate: "Gate 01",
    driver: "Wong Chee Keong",
    containerColor: "#D9B26A",
    speed: 9,
    offset: 64,
    baseWait: 4,
    route: externalRoute({ blockId: "L03", load: true }),
  },
  {
    id: "XB2140G",
    plate: "XB2140G",
    carrier: "CMA CGM",
    kind: "external",
    cab: "#1E3A66",
    gate: "Gate 01",
    driver: "Vijay Menon",
    containerColor: "#1E3A66",
    speed: 9,
    offset: 92,
    baseWait: 2,
    route: externalRoute({ blockId: "M01", load: true }),
  },
  {
    id: "XE3882J",
    plate: "XE3882J",
    carrier: "ONE",
    kind: "external",
    cab: "#F6F3EC",
    gate: "Gate 01",
    driver: "Chua Hui Min",
    containerColor: "#EDEBE4",
    speed: 9,
    offset: 120,
    baseWait: 5,
    route: externalRoute({ blockId: "L04", load: true }),
  },
];

const ITV_SPECS: Array<[string, string, string, boolean, number]> = [
  ["ITV-07", "STS-02", "L01", false, 0],
  ["ITV-12", "STS-03", "M01", false, 9],
  ["ITV-15", "STS-01", "H01", true, 4],
  ["ITV-21", "STS-07", "L02", true, 15],
  ["ITV-24", "STS-08", "M02", true, 3],
  ["ITV-28", "STS-03", "L03", false, 11],
  ["ITV-30", "STS-02", "M03", false, 6],
  ["ITV-33", "STS-06", "L04", false, 2],
  ["ITV-36", "STS-06", "M04", false, 13],
  ["ITV-41", "STS-07", "H02", true, 8],
  ["ITV-44", "STS-08", "L01", true, 17],
  // Berth 08 Western Basin ITV shuttles
  ["ITV-51", "STS-13", "L02", false, 5],
  ["ITV-52", "STS-14", "M02", false, 14],
  ["ITV-53", "STS-13", "L03", false, 21],
  ["ITV-54", "STS-14", "M01", false, 7],
];

const ITV_DRIVERS = ["Luc Ngo", "Ravi Kumar", "Vinh Dinh", "Truong Mai", "Hai Lam", "Kiet Vo", "Nhan Ho", "Tin Le", "Bao Ha", "Thinh Ly", "An Trinh"];
const ITV_BOXES = ["#F2622E", "#1E3A66", "#D9B26A", "#4E7A5A", "#B5463A", "#4F6D8F"];

TRUCKS.push(
  ...ITV_SPECS.map(([id, craneId, blockId, loading, offset], i): Truck => ({
    id,
    plate: id,
    carrier: "HIPG Terminal Internal Fleet",
    kind: "itv",
    cab: "#E8A317",
    driver: ITV_DRIVERS[i % ITV_DRIVERS.length],
    containerColor: ITV_BOXES[i % ITV_BOXES.length],
    speed: 10,
    offset,
    route: itvRoute({ craneId, blockId, loading }),
  })),
);

TRUCKS.push(...DRAYAGE_TRUCKS);

export const truckById = (id: string): Truck | undefined => TRUCKS.find((t) => t.id === id);

export const GATE_TRUCK_IDS = TRUCKS.filter((t) => t.kind === "external").map((t) => t.id);
