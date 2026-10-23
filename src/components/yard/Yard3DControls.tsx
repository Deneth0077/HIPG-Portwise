import { memo } from "react";
import { Check, Compass, HelpCircle, Move, RotateCw, Ruler, X, ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from "lucide-react";
import { useYardManagement } from "@/state/YardManagementProvider";
import { cn } from "@/lib/utils";

export const Yard3DControls = memo(function Yard3DControls() {
  const {
    is3DEditMode,
    setIs3DEditMode,
    selectedYard,
    draftPosition,
    setDraftPosition,
    draftDimensions,
    setDraftDimensions,
    applyDraftPosition,
    cancelDraftPosition,
    isPickingLocation,
    cancelPickingLocation,
  } = useYardManagement();

  if (!is3DEditMode && !isPickingLocation) return null;

  if (isPickingLocation) {
    return (
      <div className="pointer-events-auto fixed bottom-24 left-1/2 z-40 -translate-x-1/2 flex items-center gap-3 rounded-[14px] border border-harbor/40 bg-paper/95 px-5 py-3 shadow-panel backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-harbor">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-harbor opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-harbor" />
          </span>
          Click anywhere on the yard terrain to place the block
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

  if (!selectedYard) {
    return (
      <div className="pointer-events-auto fixed bottom-24 left-1/2 z-40 -translate-x-1/2 flex items-center gap-3 rounded-[14px] border border-signal/40 bg-paper/95 px-5 py-3 shadow-panel backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-ink">
          <Move className="h-4 w-4 text-signal animate-pulse" />
          Click any yard block in the 3D scene to move, rotate, or resize it
        </div>
        <button
          type="button"
          onClick={() => setIs3DEditMode(false)}
          className="rounded-[8px] bg-sand px-3 py-1.5 text-[12px] font-semibold text-ink hover:bg-hairline transition-colors"
        >
          Exit 3D Edit
        </button>
      </div>
    );
  }

  // Current values (draft or saved)
  const currentPos = draftPosition || selectedYard.position;
  const currentDim = draftDimensions || {
    width: selectedYard.width,
    length: selectedYard.length,
    rotation: selectedYard.rotation,
  };

  const hasUnsavedDraft = draftPosition !== null || draftDimensions !== null;

  const moveX = (delta: number) => {
    setDraftPosition({
      x: Math.round((currentPos.x + delta) * 10) / 10,
      z: currentPos.z,
    });
  };

  const moveZ = (delta: number) => {
    setDraftPosition({
      x: currentPos.x,
      z: Math.round((currentPos.z + delta) * 10) / 10,
    });
  };

  const resize = (deltaW: number, deltaL: number) => {
    setDraftDimensions({
      ...currentDim,
      width: Math.max(8, currentDim.width + deltaW),
      length: Math.max(6, currentDim.length + deltaL),
    });
  };

  const rotate = (deg: number) => {
    setDraftDimensions({
      ...currentDim,
      rotation: (currentDim.rotation + deg + 360) % 360,
    });
  };

  return (
    <div className="pointer-events-auto fixed bottom-20 left-1/2 z-40 -translate-x-1/2 flex flex-col items-center gap-2 rounded-[16px] border border-hairline bg-paper/95 p-3.5 shadow-panel backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 max-w-[620px] w-[95vw] sm:w-auto">
      {/* Top status line */}
      <div className="flex w-full items-center justify-between gap-3 border-b border-hairline/60 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[14px] font-bold text-signal bg-signal-soft px-2 py-0.5 rounded-[6px]">
            {selectedYard.code}
          </span>
          <span className="text-[12.5px] font-bold text-ink truncate max-w-[220px]">
            {selectedYard.name}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {hasUnsavedDraft && (
            <>
              <button
                type="button"
                onClick={applyDraftPosition}
                className="flex items-center gap-1 rounded-[8px] bg-moss px-3 py-1.5 text-[11.5px] font-bold text-white shadow-sm hover:bg-moss/90 active:scale-95 transition-all"
              >
                <Check className="h-3.5 w-3.5" />
                Save Placement
              </button>
              <button
                type="button"
                onClick={cancelDraftPosition}
                className="rounded-[8px] bg-sand px-2.5 py-1.5 text-[11.5px] font-semibold text-slate hover:text-ink transition-colors"
              >
                Reset
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => {
              if (hasUnsavedDraft) cancelDraftPosition();
              setIs3DEditMode(false);
            }}
            aria-label="Exit 3D Edit Mode"
            className="grid h-8 w-8 place-items-center rounded-[8px] text-slate hover:bg-sand hover:text-ink transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stepper controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-[11.5px]">
        {/* Nudge Position */}
        <div className="flex items-center gap-1 bg-sand/60 px-2 py-1 rounded-[10px]">
          <span className="font-semibold text-slate mr-1">Position:</span>
          <button
            type="button"
            onClick={() => moveX(-2)}
            title="Move West (-X)"
            className="grid h-7 w-7 place-items-center rounded-[6px] bg-paper text-ink shadow-sm hover:bg-sand transition-colors font-bold"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => moveX(2)}
            title="Move East (+X)"
            className="grid h-7 w-7 place-items-center rounded-[6px] bg-paper text-ink shadow-sm hover:bg-sand transition-colors font-bold"
          >
            →
          </button>
          <button
            type="button"
            onClick={() => moveZ(-2)}
            title="Move North (-Z)"
            className="grid h-7 w-7 place-items-center rounded-[6px] bg-paper text-ink shadow-sm hover:bg-sand transition-colors font-bold"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => moveZ(2)}
            title="Move South (+Z)"
            className="grid h-7 w-7 place-items-center rounded-[6px] bg-paper text-ink shadow-sm hover:bg-sand transition-colors font-bold"
          >
            ↓
          </button>
          <span className="font-mono text-slate text-[10.5px] ml-1">
            [{currentPos.x.toFixed(0)}, {currentPos.z.toFixed(0)}]m
          </span>
        </div>

        {/* Rotate */}
        <div className="flex items-center gap-1 bg-sand/60 px-2 py-1 rounded-[10px]">
          <span className="font-semibold text-slate mr-1">Rotation:</span>
          <button
            type="button"
            onClick={() => rotate(-15)}
            className="grid h-7 px-2 place-items-center rounded-[6px] bg-paper text-ink shadow-sm hover:bg-sand transition-colors font-bold"
            title="Rotate -15°"
          >
            ↺ -15°
          </button>
          <button
            type="button"
            onClick={() => rotate(15)}
            className="grid h-7 px-2 place-items-center rounded-[6px] bg-paper text-ink shadow-sm hover:bg-sand transition-colors font-bold"
            title="Rotate +15°"
          >
            ↻ +15°
          </button>
          <span className="font-mono text-slate text-[10.5px] ml-0.5">{currentDim.rotation}°</span>
        </div>

        {/* Size */}
        <div className="flex items-center gap-1 bg-sand/60 px-2 py-1 rounded-[10px]">
          <span className="font-semibold text-slate mr-1">Size:</span>
          <button
            type="button"
            onClick={() => resize(-4, 0)}
            className="grid h-7 w-6 place-items-center rounded-[6px] bg-paper text-ink shadow-sm hover:bg-sand transition-colors font-bold"
            title="Shrink Width"
          >
            W-
          </button>
          <button
            type="button"
            onClick={() => resize(4, 0)}
            className="grid h-7 w-6 place-items-center rounded-[6px] bg-paper text-ink shadow-sm hover:bg-sand transition-colors font-bold"
            title="Expand Width"
          >
            W+
          </button>
          <button
            type="button"
            onClick={() => resize(0, -2)}
            className="grid h-7 w-6 place-items-center rounded-[6px] bg-paper text-ink shadow-sm hover:bg-sand transition-colors font-bold"
            title="Shrink Length"
          >
            L-
          </button>
          <button
            type="button"
            onClick={() => resize(0, 2)}
            className="grid h-7 w-6 place-items-center rounded-[6px] bg-paper text-ink shadow-sm hover:bg-sand transition-colors font-bold"
            title="Expand Length"
          >
            L+
          </button>
          <span className="font-mono text-slate text-[10.5px] ml-1">
            {currentDim.width}×{currentDim.length}m
          </span>
        </div>
      </div>
    </div>
  );
});
