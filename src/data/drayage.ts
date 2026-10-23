import type { RoutePoint, Truck } from "./types";
import { facilityById } from "./facilities";

interface DraySpec {
  plate: string;
  carrier: string;
  driver: string;
  facility: string;
  facilityName: string;
  dockX: number;
  dockZ: number;
  /** true = delivers a box to the facility; false = collects an export box there. */
  delivers: boolean;
  cab: string;
  box: string;
  offset: number;
}

/** Gate 01 → Western Perimeter Avenue → Facility Dock → back out through Gate 01. */
function drayRoute(s: DraySpec): RoutePoint[] {
  const name = s.facilityName;
  const route: RoutePoint[] = [
    { p: [-105, 222], hidden: true, load: s.delivers, status: `Inbound to ${name}` },
    { p: [-130, 222], wait: 3, status: "Gate 01 Clearance" },
    { p: [-165, 222], status: `To ${name}` },
    { p: [-165, s.dockZ], status: `To ${name}` },
  ];

  if (s.dockX !== -165) {
    route.push({ p: [s.dockX, s.dockZ], status: `Docking at ${name}` });
  }

  route.push({
    p: [s.dockX, s.dockZ],
    wait: 14,
    load: !s.delivers,
    status: s.delivers ? `Unloading at ${name}` : `Loading at ${name}`,
  });

  if (s.dockX !== -165) {
    route.push({ p: [-165, s.dockZ], status: "Returning to Gate 01" });
  }

  route.push(
    { p: [-165, 222], status: "To Gate 01" },
    { p: [-130, 222], wait: 3, status: "Gate 01 Outbound Scan" },
    { p: [-105, 222], status: "Departed" },
  );

  return route;
}

const SPECS: DraySpec[] = [
  { plate: "XD2154A", carrier: "HIPG Logistics", driver: "Kelvin Ng", facility: "cfs", facilityName: "INSEE Warehouse", dockX: -165, dockZ: 70, delivers: true, cab: "#F2622E", box: "#1E3A66", offset: 0 },
  { plate: "XE6620R", carrier: "HIPG Haulage", driver: "Rahman Ali", facility: "bonded", facilityName: "HIPL Warehouse", dockX: -165, dockZ: 85, delivers: true, cab: "#F6F3EC", box: "#B5463A", offset: 47 },
  { plate: "XB4092C", carrier: "Lanka Cold Chain", driver: "Tan Boon Huat", facility: "cold-hub", facilityName: "Main Road CFS Hub", dockX: -80, dockZ: 52, delivers: true, cab: "#2C6FB0", box: "#EDEBE4", offset: 95 },
  { plate: "XD7339L", carrier: "HIPG Logistics", driver: "Hazwan Rosli", facility: "seastar-dc", facilityName: "New Customs Yard", dockX: -130, dockZ: 185, delivers: true, cab: "#F2622E", box: "#F2622E", offset: 22 },
  { plate: "XE1185D", carrier: "HIPG Haulage", driver: "Ong Swee Lan", facility: "electronics", facilityName: "RTG Service Bay", dockX: -165, dockZ: 110, delivers: true, cab: "#F6F3EC", box: "#4F6D8F", offset: 70 },
  { plate: "XD9041E", carrier: "Southern Haulage", driver: "Prakash Das", facility: "garments", facilityName: "HIPG Complex BY1", dockX: -185, dockZ: -60, delivers: false, cab: "#4E7A5A", box: "#D9B26A", offset: 118 },
  { plate: "XB3507U", carrier: "Ruhuna Transport", driver: "Low Kah Wai", facility: "seafood", facilityName: "Technical Base BY2", dockX: -185, dockZ: -140, delivers: false, cab: "#1E3A66", box: "#EDEBE4", offset: 140 },
  { plate: "XD2876Z", carrier: "HIPG Equipment", driver: "Zulkifli Omar", facility: "mnr", facilityName: "RoRo Inspection 02C", dockX: 28, dockZ: 126, delivers: true, cab: "#E8A317", box: "#4F6D8F", offset: 160 },
];

/** Inland drayage trucks shuttling between Gate 01, warehousing, and logistics facilities. */
export const DRAYAGE_TRUCKS: Truck[] = SPECS.map((s) => ({
  id: s.plate,
  plate: s.plate,
  carrier: s.carrier,
  kind: "drayage",
  trip: `Gate 01 ⇄ ${s.facilityName}`,
  facilityId: s.facility,
  cab: s.cab,
  gate: "Gate 01",
  driver: s.driver,
  containerColor: s.box,
  speed: 9.5,
  offset: s.offset,
  route: drayRoute(s),
}));
