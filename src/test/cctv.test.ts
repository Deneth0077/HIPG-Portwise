import { describe, it, expect, beforeEach } from "vitest";
import { cctvRepository } from "../data/cctvRepository";

describe("CCTV Repository and Management Service", () => {
  beforeEach(() => {
    cctvRepository.resetToDefaults();
  });

  it("loads default HIPG security towers", () => {
    const towers = cctvRepository.getAll();
    expect(towers.length).toBeGreaterThanOrEqual(4);
    expect(towers.some((t) => t.code === "CCTV-T01")).toBe(true);
  });

  it("can add a new tower with multiple cameras", () => {
    const newTower = cctvRepository.addTower({
      code: "CCTV-T99",
      name: "North Breakwater Mast",
      x: 100,
      z: -150,
      height: 22,
      status: "active",
      initialCamerasCount: 3,
    });

    expect(newTower.id).toBeDefined();
    expect(newTower.code).toBe("CCTV-T99");
    expect(newTower.cameras.length).toBe(3);
    expect(newTower.cameras[0].mountingHeight).toBeGreaterThan(0);
  });

  it("can add, update, and remove cameras on a tower", () => {
    const tower = cctvRepository.getAll()[0];
    const initialCamCount = tower.cameras.length;

    // Add camera
    const addedCam = cctvRepository.addCameraToTower(tower.id, {
      name: "Gate West Barrier PTZ",
      type: "ptz",
      yaw: 120,
      pitch: -30,
      hfov: 75,
      range: 80,
    });
    expect(addedCam).toBeDefined();

    const updatedTower = cctvRepository.getById(tower.id);
    expect(updatedTower?.cameras.length).toBe(initialCamCount + 1);

    // Update camera angles
    cctvRepository.updateCamera(tower.id, addedCam!.id, {
      yaw: 135,
      pitch: -15,
      range: 120,
    });
    const refreshedCam = cctvRepository.getCamera(tower.id, addedCam!.id);
    expect(refreshedCam?.yaw).toBe(135);
    expect(refreshedCam?.pitch).toBe(-15);
    expect(refreshedCam?.range).toBe(120);

    // Remove camera
    const deleted = cctvRepository.deleteCamera(tower.id, addedCam!.id);
    expect(deleted).toBe(true);
    expect(cctvRepository.getCamera(tower.id, addedCam!.id)).toBeNull();
  });

  it("can duplicate a tower", () => {
    const original = cctvRepository.getAll()[0];
    const dup = cctvRepository.duplicateTower(original.id);

    expect(dup).not.toBeNull();
    expect(dup?.id).not.toBe(original.id);
    expect(dup?.code).toContain("-COPY");
    expect(dup?.cameras.length).toBe(original.cameras.length);
  });

  it("can delete a tower", () => {
    const all = cctvRepository.getAll();
    const target = all[0];
    const success = cctvRepository.deleteTower(target.id);

    expect(success).toBe(true);
    expect(cctvRepository.getById(target.id)).toBeNull();
  });
});
