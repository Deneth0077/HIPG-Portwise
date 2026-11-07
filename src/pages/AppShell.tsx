import { Suspense, lazy, useEffect } from "react";
import { BootScreen } from "@/components/BootScreen";
import { Outlet, useLocation } from "react-router-dom";
import { TopBar } from "@/components/hud/TopBar";
import { SearchDialog } from "@/components/hud/SearchDialog";
import { BerthingToasts } from "@/components/hud/BerthingToasts";
import { TimeBar, TimeKeys } from "@/components/hud/TimeBar";
import { Building3DControls } from "@/components/yard/Building3DControls";
import { Yard3DControls } from "@/components/yard/Yard3DControls";
import { Road3DControls } from "@/components/yard/Road3DControls";
import { CctvControlPanel } from "@/components/cctv/CctvControlPanel";
import { Cctv3DControls } from "@/components/cctv/Cctv3DControls";
import { ClashBuildDock } from "@/components/twin/ClashBuildDock";
import { TwinPropertiesInspector } from "@/components/twin/TwinPropertiesInspector";
import { TwinModeToolbar } from "@/components/twin/TwinModeToolbar";
import { useIsCompact } from "@/hooks/useMediaQuery";
import { usePort } from "@/state/PortProvider";
import { useBootRevealed } from "@/state/boot";
import { installTapHaptics } from "@/lib/haptics";

const PortScene = lazy(() => import("@/three/PortScene"));

/** Persistent 3D scene + top bar; routes render floating HUD panels into the Outlet. */
export default function AppShell() {
  const { pathname } = useLocation();
  const { closeOverride } = usePort();
  const isRevealed = useBootRevealed();
  const isCompact = useIsCompact();

  useEffect(() => installTapHaptics(), []);

  useEffect(() => {
    closeOverride();
  }, [pathname, closeOverride]);

  return (
    <div className="pw-app relative w-full overflow-hidden bg-canvas">
      <div className="absolute inset-x-0 bottom-0 top-[var(--hud-top)]">
        <Suspense fallback={null}>
          <PortScene />
        </Suspense>
      </div>
      <TopBar />
      {/* HUD mounts as the boot screen lifts so its rise-in animations play in view. */}
      {isRevealed ? (
        <>
          <Outlet />
          <TimeKeys />
          <BerthingToasts />
          {/* On phones and tablets the time controls live in the bottom sheet header. */}
          {isCompact ? null : <TimeBar />}
          {isCompact ? (
            <div className="pointer-events-auto fixed top-[calc(var(--hud-top)+0.5rem)] left-1/2 -translate-x-1/2 z-30">
              <TwinModeToolbar />
            </div>
          ) : null}
          <Building3DControls />
          <Yard3DControls />
          <Road3DControls />
          <CctvControlPanel />
          <Cctv3DControls />
          <ClashBuildDock />
          <TwinPropertiesInspector />
        </>
      ) : null}
      <SearchDialog />
      <BootScreen />
    </div>
  );
}
