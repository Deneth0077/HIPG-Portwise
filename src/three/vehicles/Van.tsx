import { memo, useMemo } from "react";
import type { VehicleInstance } from "./types";
import { VehicleMeshGroup } from "./VehicleMeshGroup";

interface VanProps {
  vehicles: VehicleInstance[];
}

/**
 * Van Component
 * Handles commercial delivery vans and passenger minibuses.
 */
export const Van = memo(function Van({ vehicles }: VanProps) {
  const deliveryVans = useMemo(() => vehicles.filter((v) => v.vehicleClass === "van"), [vehicles]);
  const minibuses = useMemo(() => vehicles.filter((v) => v.vehicleClass === "minibus"), [vehicles]);

  return (
    <group name="commercial-vans">
      <VehicleMeshGroup vehicleClass="van" instances={deliveryVans} />
      <VehicleMeshGroup vehicleClass="minibus" instances={minibuses} />
    </group>
  );
});
