import { memo } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  Compass,
  Move,
  RotateCcw,
  RotateCw,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { useCctvManagement } from "@/state/CctvManagementProvider";

export const Cctv3DControls = memo(function Cctv3DControls() {
  const {
    isPickingLocation,
    cancelPickingLocation,
    selectedTower,
    selectedCamera,
    selectTower,
    selectCamera,
    draftPosition,
    setDraftPosition,
    applyDraftPosition,
    updateTower,
    deleteTower,
    updateCamera,
  } = useCctvManagement();

  // 1. Picking Location Banner Prompt
  if (isPickingLocation) {
    return (
      <div className="pointer-events-auto fixed bottom-24 left-1/2 z-40 -translate-x-1/2 flex items-center gap-3 rounded-[14px] border border-signal/40 bg-paper/95 px-5 py-3 shadow-panel backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-signal">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-signal" />
          </span>
          Click anywhere on the 3D port yard to place the new CCTV Tower
        </div>
        <button
          type="button"
          onClick={cancelPickingLocation}
          className="rounded-[8px] border border-hairline px-3 py-1.5 text-[12px] font-semibold text-slate hover:bg-sand hover:text-ink transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  // 2. Direct On-Screen 3D Transform Bar for Selected Tower
  if (!selectedTower) {
    return null;
  }

  const curX = draftPosition ? draftPosition.x : selectedTower.x;
  const curZ = draftPosition ? draftPosition.z : selectedTower.z;
  const curRot = selectedTower.rotation ?? 0;

  const nudge = (dx: number, dz: number) => {
    const nx = Math.round((curX + dx) * 10) / 10;
    const nz = Math.round((curZ + dz) * 10) / 10;
    setDraftPosition({ x: nx, z: nz });
    updateTower(selectedTower.id, { x: nx, z: nz });
  };

  const rotate = (delta: number) => {
    const nRot = (curRot + delta + 360) % 360;
    updateTower(selectedTower.id, { rotation: nRot });
  };

  return (
    <div className="pointer-events-auto fixed bottom-24 left-1/2 z-40 -translate-x-1/2 flex flex-col items-center gap-2 rounded-[16px] border border-signal/40 bg-paper/95 p-3.5 shadow-panel backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
      {/* Top Header Row */}
      <div className="flex w-full items-center justify-between gap-4 border-b border-hairline/70 pb-2">
        <div className="flex items-center gap-2">
          <Move className="h-4 w-4 text-signal animate-pulse" />
          <div>
            <span className="text-[13px] font-bold text-ink">{selectedTower.code}</span>
            <span className="ml-1.5 text-[12px] text-slate font-medium">({selectedTower.name})</span>
            <span className="ml-2 font-mono text-[11px] text-slate">
              [{curX.toFixed(1)}, {curZ.toFixed(1)}] · {curRot}° · {selectedTower.height}m
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => selectTower(null)}
            className="grid h-7 w-7 place-items-center rounded-[7px] border border-hairline text-slate hover:bg-sand hover:text-ink transition-colors"
            title="Deselect"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Control Buttons Grid */}
      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11.5px]">
        {/* Nudge Directional Pad */}
        <div className="flex items-center gap-1">
          <span className="font-semibold text-slate mr-1">Move:</span>
          <button
            type="button"
            onClick={() => nudge(-2, 0)}
            className="grid h-7 w-7 place-items-center rounded-[6px] border border-hairline bg-sand/60 text-ink hover:bg-sand"
            title="Move West (-X)"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => nudge(2, 0)}
            className="grid h-7 w-7 place-items-center rounded-[6px] border border-hairline bg-sand/60 text-ink hover:bg-sand"
            title="Move East (+X)"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => nudge(0, -2)}
            className="grid h-7 w-7 place-items-center rounded-[6px] border border-hairline bg-sand/60 text-ink hover:bg-sand"
            title="Move North (-Z)"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => nudge(0, 2)}
            className="grid h-7 w-7 place-items-center rounded-[6px] border border-hairline bg-sand/60 text-ink hover:bg-sand"
            title="Move South (+Z)"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Rotate Buttons */}
        <div className="flex items-center gap-1 border-l border-hairline/80 pl-2.5">
          <span className="font-semibold text-slate mr-1">Rotate:</span>
          <button
            type="button"
            onClick={() => rotate(-15)}
            className="grid h-7 w-7 place-items-center rounded-[6px] border border-hairline bg-sand/60 text-ink hover:bg-sand"
            title="Rotate -15°"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => rotate(15)}
            className="grid h-7 w-7 place-items-center rounded-[6px] border border-hairline bg-sand/60 text-ink hover:bg-sand"
            title="Rotate +15°"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Camera Selector and Angle Controls */}
        <div className="flex items-center gap-1.5 border-l border-hairline/80 pl-2.5">
          <span className="font-semibold text-slate flex items-center gap-1">
            <Video className="h-3.5 w-3.5 text-signal" /> Cam:
          </span>
          <select
            value={selectedCamera?.id || selectedTower.cameras[0]?.id || ""}
            onChange={(e) => {
              const cam = selectedTower.cameras.find((c) => c.id === e.target.value);
              if (cam) selectCamera(cam.id);
            }}
            className="rounded-[6px] border border-hairline bg-sand/60 px-2 py-1 text-[11.5px] font-bold text-ink hover:bg-sand focus:outline-none focus:ring-1 focus:ring-signal"
          >
            {selectedTower.cameras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.yaw}° / {c.pitch}°)
              </option>
            ))}
          </select>

          {(() => {
            const activeCam = selectedCamera || selectedTower.cameras[0];
            if (!activeCam) return null;
            return (
              <div className="flex items-center gap-1">
                {/* Pan Left / Right */}
                <span className="font-semibold text-slate ml-1 text-[11px]">Pan:</span>
                <button
                  type="button"
                  onClick={() =>
                    updateCamera(selectedTower.id, activeCam.id, {
                      yaw: (activeCam.yaw - 15 + 360) % 360,
                    })
                  }
                  className="grid h-7 w-7 place-items-center rounded-[6px] border border-hairline bg-sand/60 text-ink hover:bg-sand font-mono text-[11px] font-bold"
                  title="Pan Left (-15°)"
                >
                  -15°
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateCamera(selectedTower.id, activeCam.id, {
                      yaw: (activeCam.yaw + 15) % 360,
                    })
                  }
                  className="grid h-7 w-7 place-items-center rounded-[6px] border border-hairline bg-sand/60 text-ink hover:bg-sand font-mono text-[11px] font-bold"
                  title="Pan Right (+15°)"
                >
                  +15°
                </button>

                {/* Tilt Up / Down */}
                <span className="font-semibold text-slate ml-1 text-[11px]">Tilt:</span>
                <button
                  type="button"
                  onClick={() =>
                    updateCamera(selectedTower.id, activeCam.id, {
                      pitch: Math.min(30, activeCam.pitch + 5),
                    })
                  }
                  className="grid h-7 w-7 place-items-center rounded-[6px] border border-hairline bg-sand/60 text-ink hover:bg-sand font-mono text-[11px] font-bold"
                  title="Tilt Up (+5°)"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateCamera(selectedTower.id, activeCam.id, {
                      pitch: Math.max(-80, activeCam.pitch - 5),
                    })
                  }
                  className="grid h-7 w-7 place-items-center rounded-[6px] border border-hairline bg-sand/60 text-ink hover:bg-sand font-mono text-[11px] font-bold"
                  title="Tilt Down (-5°)"
                >
                  ▼
                </button>
              </div>
            );
          })()}
        </div>

        {/* Done / Close Button */}
        <div className="border-l border-hairline/80 pl-2.5">
          <button
            type="button"
            onClick={() => {
              applyDraftPosition();
              selectTower(null);
            }}
            className="flex items-center gap-1 rounded-[8px] bg-ink px-3 py-1 font-semibold text-paper hover:bg-ink/90 shadow-sm"
          >
            <Check className="h-3.5 w-3.5" /> Done
          </button>
        </div>
      </div>
    </div>
  );
});
