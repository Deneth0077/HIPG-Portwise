import { memo, useMemo } from "react";
import type { VehicleInstance } from "./types";
import { VehicleMeshGroup } from "./VehicleMeshGroup";

interface TruckProps {
  vehicles: VehicleInstance[];
}

/**
 * Truck Component
 * Handles heavy port tractor units (prime movers) and multi-deck vehicle transporters.
 */
export const Truck = memo(function Truck({ vehicles }: TruckProps) {
  const tractorUnits = useMemo(() => vehicles.filter((v) => v.vehicleClass === "truck"), [vehicles]);
  const transporters = useMemo(() => vehicles.filter((v) => v.vehicleClass === "transporter"), [vehicles]);

  return (
    <group name="heavy-trucks-transporters">
      <VehicleMeshGroup vehicleClass="truck" instances={tractorUnits} />
      <VehicleMeshGroup vehicleClass="transporter" instances={transporters} />
    </group>
  );
});
