import * as THREE from "three";
import type { VehicleClass } from "./types";
import {
  createSedanGeometries,
  createCompactGeometries,
  createLuxurySedanGeometries,
  type VehicleGeometries,
} from "./models/PassengerCar";
import { createSUVGeometries } from "./models/SUV";
import { createDeliveryVanGeometries, createMinibusGeometries } from "./models/Van";
import { createPickupGeometries } from "./models/LightCommercial";
import { createTruckGeometries, createTransporterGeometries } from "./models/Truck";
import {
  createPaintMaterial,
  VEHICLE_GLASS_MATERIAL,
  VEHICLE_TYRE_MATERIAL,
  VEHICLE_RIM_MATERIAL,
  VEHICLE_DETAILS_MATERIAL,
} from "./materials";

/**
 * Singleton Vehicle Asset Factory
 * Caches high-detail procedural vehicle geometries and materials to avoid redundant allocations.
 */
class VehicleFactorySingleton {
  private geoCache = new Map<VehicleClass, VehicleGeometries>();

  public getGeometries(cls: VehicleClass): VehicleGeometries {
    let geos = this.geoCache.get(cls);
    if (!geos) {
      switch (cls) {
        case "sedan":
          geos = createSedanGeometries();
          break;
        case "compact":
          geos = createCompactGeometries();
          break;
        case "luxury_sedan":
          geos = createLuxurySedanGeometries();
          break;
        case "suv":
          geos = createSUVGeometries();
          break;
        case "van":
          geos = createDeliveryVanGeometries();
          break;
        case "minibus":
          geos = createMinibusGeometries();
          break;
        case "pickup":
          geos = createPickupGeometries();
          break;
        case "truck":
          geos = createTruckGeometries();
          break;
        case "transporter":
          geos = createTransporterGeometries();
          break;
      }
      this.geoCache.set(cls, geos);
    }
    return geos;
  }

  public getMaterials() {
    return {
      paintMaterial: createPaintMaterial(0.28, 0.40),
      glassMaterial: VEHICLE_GLASS_MATERIAL,
      tyreMaterial: VEHICLE_TYRE_MATERIAL,
      rimMaterial: VEHICLE_RIM_MATERIAL,
      detailsMaterial: VEHICLE_DETAILS_MATERIAL,
    };
  }

  public dispose() {
    this.geoCache.forEach((geos) => {
      geos.bodyGeo.dispose();
      geos.glassGeo.dispose();
      geos.wheelsGeo.dispose();
      geos.rimsGeo.dispose();
      geos.detailsGeo.dispose();
    });
    this.geoCache.clear();
  }
}

export const VehicleFactory = new VehicleFactorySingleton();
