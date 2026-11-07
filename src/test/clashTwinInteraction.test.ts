import { describe, it, expect, beforeEach } from "vitest";
import { validatePortPlacement, PORT_BOUNDS } from "@/lib/placementValidation";
import { INFRASTRUCTURE_CATALOG, INFRASTRUCTURE_CATEGORIES } from "@/data/infrastructureCatalog";
import { yardRepository } from "@/data/yardRepository";
import { buildingRepository } from "@/data/buildingRepository";
import { roadRepository } from "@/data/roadRepository";
import { cctvRepository } from "@/data/cctvRepository";
import { fenceRepository } from "@/data/fenceRepository";

describe("Clash of Clans-Style Digital Twin Interaction System", () => {
  beforeEach(() => {
    yardRepository.resetToDefault();
    buildingRepository.reset();
    roadRepository.resetToDefault();
    cctvRepository.resetToDefaults();
    fenceRepository.resetToDefault();
  });

  describe("Placement & Boundary Validation Engine", () => {
    it("approves valid positions on port yard land", () => {
      // Yard land near south container/RoRo area
      const result = validatePortPlacement(-50, 80, 40, 20, 0);
      expect(result.isValid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it("rejects placement in Hambantota harbour water basin", () => {
      // Basin coordinates between -140 and 106 along X, and -170 to -16 along Z
      const waterResult = validatePortPlacement(0, -80, 20, 20, 0);
      expect(waterResult.isValid).toBe(false);
      expect(waterResult.reason).toContain("water");
    });

    it("rejects placement outside concession boundaries", () => {
      const outResult = validatePortPlacement(PORT_BOUNDS.maxX + 100, 0, 10, 10, 0);
      expect(outResult.isValid).toBe(false);
      expect(outResult.reason).toContain("outside HIPG terminal concession boundary");
    });

    it("evaluates rotated bounding box corners against water and boundaries", () => {
      // Center might be close to water quay edge, but rotating places footprint over water
      const rotatedResult = validatePortPlacement(100, -20, 30, 40, 45);
      expect(rotatedResult.isValid).toBe(false);
      expect(rotatedResult.reason).toBeDefined();
    });
  });

  describe("Infrastructure Catalog", () => {
    it("contains all 7 required infrastructure categories", () => {
      const catIds = INFRASTRUCTURE_CATEGORIES.map((c) => c.id);
      expect(catIds).toContain("roro");
      expect(catIds).toContain("container");
      expect(catIds).toContain("cctv");
      expect(catIds).toContain("buildings");
      expect(catIds).toContain("gates");
      expect(catIds).toContain("roads");
      expect(catIds).toContain("utilities");
    });

    it("defines valid dimensional properties and specs for each catalog item", () => {
      for (const item of INFRASTRUCTURE_CATALOG) {
        expect(item.id).toBeTruthy();
        expect(item.name).toBeTruthy();
        expect(item.width).toBeGreaterThan(0);
        expect(item.length).toBeGreaterThan(0);
        expect(item.height).toBeGreaterThan(0);
        expect(item.accentColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(item.defaultProperties).toBeDefined();
      }
    });

    it("includes RoRo, Container, CCTV, and Warehouse items with realistic capacities", () => {
      const roroItem = INFRASTRUCTURE_CATALOG.find((i) => i.id === "roro-standard-staging");
      expect(roroItem).toBeDefined();
      expect(roroItem?.capacity).toBe(60);
      expect(roroItem?.capacityUnit).toBe("slots");

      const containerItem = INFRASTRUCTURE_CATALOG.find((i) => i.id === "container-block-standard");
      expect(containerItem).toBeDefined();
      expect(containerItem?.capacity).toBe(192);
      expect(containerItem?.capacityUnit).toBe("teu");

      const cctvItem = INFRASTRUCTURE_CATALOG.find((i) => i.id === "cctv-tower-24m");
      expect(cctvItem).toBeDefined();
      expect(cctvItem?.height).toBe(24);
      expect(cctvItem?.capacity).toBe(3);
    });
  });

  describe("Integrated Layout Repositories & Modifications", () => {
    it("can create, move, rotate, and delete RoRo / Container yard blocks", () => {
      const initialCount = yardRepository.getAll().length;

      const created = yardRepository.create({
        code: "TEST-01",
        name: "Test RoRo Block",
        yardType: "roro",
        capacityUnit: "slots",
        totalCapacity: 80,
        occupiedCount: 20,
        width: 45,
        length: 25,
        rotation: 0,
        position: { x: -60, z: 90 },
        status: "active",
      });

      expect(created.id).toBeDefined();
      expect(yardRepository.getAll().length).toBe(initialCount + 1);

      // Move and rotate
      const updated = yardRepository.update(created.id, {
        position: { x: -70, z: 100 },
        rotation: 45,
      });
      expect(updated.position.x).toBe(-70);
      expect(updated.rotation).toBe(45);

      // Duplicate
      const copy = yardRepository.duplicate(created.id);
      expect(copy.id).not.toBe(created.id);
      expect(yardRepository.getAll().length).toBe(initialCount + 2);

      // Delete
      const deleted = yardRepository.delete(created.id);
      expect(deleted).toBe(true);
      expect(yardRepository.getById(created.id)).toBeUndefined();
    });

    it("can create, modify, and reset custom buildings and warehouses", () => {
      const created = buildingRepository.add({
        name: "Custom Logistics Center",
        type: "warehouse",
        x: -180,
        z: 40,
        width: 38,
        depth: 18,
        height: 7.5,
        rotation: 90,
      });

      expect(created.id).toBeDefined();
      expect(buildingRepository.getById(created.id)?.width).toBe(38);

      buildingRepository.update(created.id, { rotation: 180 });
      expect(buildingRepository.getById(created.id)?.rotation).toBe(180);

      buildingRepository.reset();
      expect(buildingRepository.getById(created.id)).toBeUndefined();
    });

    it("can create, update, and manage road corridors", () => {
      const created = roadRepository.add({
        name: "Heavy Haul Link Road",
        x: 0,
        z: 140,
        width: 12,
        depth: 50,
        rotation: 0,
      });

      expect(created.id).toBeDefined();
      expect(roadRepository.getById(created.id)?.width).toBe(12);

      roadRepository.update(created.id, { width: 16 });
      expect(roadRepository.getById(created.id)?.width).toBe(16);

      const deleted = roadRepository.delete(created.id);
      expect(deleted).toBe(true);
      expect(roadRepository.getById(created.id)).toBeUndefined();
    });

    it("can draw free-form 3D fence lines and create perimeter fence lines around an area", () => {
      const initialFences = fenceRepository.getAll().length;

      // 1. Point-to-point free-form line drawing (Point A: [0, 0] -> Point B: [30, 40])
      const line = fenceRepository.add({
        name: "Security Barrier Line A",
        type: "chainlink",
        startPoint: { x: 0, z: 0 },
        endPoint: { x: 30, z: 40 },
        hasBarbedWire: true,
      });

      expect(line.id).toBeDefined();
      expect(line.length).toBe(50); // hypot(30, 40) = 50m
      expect(line.x).toBe(15); // midpoint X
      expect(line.z).toBe(20); // midpoint Z
      expect(line.hasBarbedWire).toBe(true);

      // Drag endpoint B to [30, 0] -> new length is 30m, rotation is 0°
      const adjusted = fenceRepository.updateEndpoint(line.id, "end", { x: 30, z: 0 });
      expect(adjusted?.length).toBe(30);
      expect(adjusted?.rotation).toBe(0);

      // 2. Automatically wrap independent 3D perimeter fence lines around a yard area
      const yard = yardRepository.getAll()[0];
      const perimeterLines = fenceRepository.createPerimeterLinesForArea(
        {
          id: yard.id,
          name: yard.name,
          x: yard.position.x,
          z: yard.position.z,
          width: yard.width,
          length: yard.length,
          rotation: yard.rotation,
        },
        "chainlink"
      );

      expect(perimeterLines.length).toBeGreaterThanOrEqual(4);
      perimeterLines.forEach((seg) => {
        expect(seg.length).toBeGreaterThan(0);
        expect(seg.startPoint).toBeDefined();
        expect(seg.endPoint).toBeDefined();
      });

      // Cleanup
      fenceRepository.delete(line.id);
      perimeterLines.forEach((l) => fenceRepository.delete(l.id));
      expect(fenceRepository.getAll().length).toBe(initialFences);
    });
  });
});

