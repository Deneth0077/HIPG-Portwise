import { memo, useMemo } from "react";
import type { VehicleInstance } from "./types";
import { VehicleMeshGroup } from "./VehicleMeshGroup";

interface PassengerCarProps {
  vehicles: VehicleInstance[];
}

/**
 * PassengerCar Component
 * Handles compact hatchbacks, executive sedans, and luxury sedans.
 */
export const PassengerCar = memo(function PassengerCar({ vehicles }: PassengerCarProps) {
  const sedans = useMemo(() => vehicles.filter((v) => v.vehicleClass === "sedan"), [vehicles]);
  const compacts = useMemo(() => vehicles.filter((v) => v.vehicleClass === "compact"), [vehicles]);
  const luxurySedans = useMemo(() => vehicles.filter((v) => v.vehicleClass === "luxury_sedan"), [vehicles]);

  return (
    <group name="passenger-cars">
      <VehicleMeshGroup vehicleClass="sedan" instances={sedans} />
      <VehicleMeshGroup vehicleClass="compact" instances={compacts} />
      <VehicleMeshGroup vehicleClass="luxury_sedan" instances={luxurySedans} />
    </group>
  );
});
