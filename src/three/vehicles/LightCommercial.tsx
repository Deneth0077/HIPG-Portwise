import { memo, useMemo } from "react";
import type { VehicleInstance } from "./types";
import { VehicleMeshGroup } from "./VehicleMeshGroup";

interface LightCommercialProps {
  vehicles: VehicleInstance[];
}

/**
 * LightCommercial Component
 * Handles dual-cab pickup trucks and utility vehicles.
 */
export const LightCommercial = memo(function LightCommercial({ vehicles }: LightCommercialProps) {
  const pickups = useMemo(() => vehicles.filter((v) => v.vehicleClass === "pickup"), [vehicles]);

  return (
    <group name="light-commercial-vehicles">
      <VehicleMeshGroup vehicleClass="pickup" instances={pickups} />
    </group>
  );
});
