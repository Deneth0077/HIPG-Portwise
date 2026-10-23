import { memo, useMemo } from "react";
import type { VehicleInstance } from "./types";
import { VehicleMeshGroup } from "./VehicleMeshGroup";

interface SUVProps {
  vehicles: VehicleInstance[];
}

/**
 * SUV Component
 * Handles modern SUVs and rugged 4x4 vehicles.
 */
export const SUV = memo(function SUV({ vehicles }: SUVProps) {
  const suvs = useMemo(() => vehicles.filter((v) => v.vehicleClass === "suv"), [vehicles]);

  return (
    <group name="suvs-4x4">
      <VehicleMeshGroup vehicleClass="suv" instances={suvs} />
    </group>
  );
});
