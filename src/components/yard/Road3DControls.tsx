import { memo } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  Compass,
  MapPin,
  Move,
  Plus,
  RotateCcw,
  RotateCw,
  Trash2,
  X,
} from "lucide-react";
import { useRoadManagement } from "@/state/RoadManagementProvider";

export const Road3DControls = memo(function Road3DControls() {
  const {
    isRoadEditMode,
    setIsRoadEditMode,
    isPickingRoadStart,
    pickedStartPoint,
    startAddRoad,
    cancelAddRoad,
    selectedRoad,
    selectRoad,
    draftPosition,
    setDraftPosition,
    draftDimensions,
    setDraftDimensions,
    applyDraft,
    cancelDraft,
    deleteRoad,
    resetRoads,
  } = useRoadManagement();

  // If road edit mode is not active, don't show controls
  if (!isRoadEditMode && !isPickingRoadStart) {
    return null;
  }

  // 1. Picking road start/end point guidance banner
  if (isPickingRoadStart) {
    return (
      <div className="pointer-events-auto fixed bottom-24 left-1/2 z-40 -translate-x-1/2 flex items-center gap-3 rounded-[16px] border border-signal/40 bg-paper/95 px-5 py-3 shadow-panel backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-signal">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-signal" />
          </span>
          {pickedStartPoint
            ? "Click second point on the port map to set the road's end position"
            : "Click first point on the port map to start your new road path"}
        </div>
        <button
          type="button"
          onClick={cancelAddRoad}
          className="rounded-[8px] border border-hairline px-3 py-1.5 text-[12px] font-semibold text-slate hover:bg-sand hover:text-ink transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  // 2. Road Edit Toolbar when no road is selected
  if (!selectedRoad) {
    return (
      <div className="pointer-events-auto fixed bottom-24 left-1/2 z-40 -translate-x-1/2 flex items-center gap-3 rounded-[16px] border border-signal/40 bg-paper/95 px-5 py-3 shadow-panel backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-ink">
          <MapPin className="h-4 w-4 text-signal animate-pulse" />
          Click any road to move/resize, or add a custom road path
        </div>
        <button
          type="button"
          onClick={startAddRoad}
          className="flex items-center gap-1.5 rounded-[8px] bg-signal px-3 py-1.5 text-[12px] font-bold text-white shadow-sm hover:bg-signal/90 transition-all"
        >
          <Plus className="h-3.5 w-3.5" /> Add Road
        </button>
        <button
          type="button"
          onClick={() => setIsRoadEditMode(false)}
          className="rounded-[8px] bg-sand px-3 py-1.5 text-[12px] font-semibold text-ink hover:bg-hairline transition-colors"
        >
          Exit Road Mode
        </button>
      </div>
    );
  }

  // 3. Selected Road Active Controls Bar
  const curX = draftPosition ? draftPosition.x : selectedRoad.x;
  const curZ = draftPosition ? draftPosition.z : selectedRoad.z;
  const curW = draftDimensions ? draftDimensions.width : selectedRoad.width;
  const curD = draftDimensions ? draftDimensions.depth : selectedRoad.depth;
  const curRot = draftDimensions ? draftDimensions.rotation : (selectedRoad.rotation ?? 0);

  const moveX = (dx: number) => {
    setDraftPosition({ x: Math.round((curX + dx) * 10) / 10, z: curZ });
  };

  const moveZ = (dz: number) => {
    setDraftPosition({ x: curX, z: Math.round((curZ + dz) * 10) / 10 });
  };

  const resize = (dW: number, dD: number) => {
    setDraftDimensions({
      width: Math.max(4, Math.round((curW + dW) * 10) / 10),
      depth: Math.max(3, Math.round((curD + dD) * 10) / 10),
      rotation: curRot,
    });
  };

  const rotate = (deg: number) => {
    setDraftDimensions({
      width: curW,
      depth: curD,
      rotation: (curRot + deg + 360) % 360,
    });
  };

  return (
    <div className="pointer-events-auto fixed bottom-24 left-1/2 z-40 -translate-x-1/2 flex flex-col items-center gap-2 rounded-[16px] border border-signal/40 bg-paper/95 p-3.5 shadow-panel backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
      {/* Top Header Row */}
      <div className="flex w-full items-center justify-between gap-4 border-b border-hairline/70 pb-2">
        <div className="flex items-center gap-2">
          <Move className="h-4 w-4 text-signal animate-pulse" />
          <div>
            <span className="text-[13px] font-bold text-ink">{selectedRoad.name}</span>
            <span className="ml-2 font-mono text-[11px] text-slate">
              [{curX.toFixed(1)}, {curZ.toFixed(1)}] · {curW.toFixed(0)}m × {curD.toFixed(0)}m · {curRot}°
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={startAddRoad}
            className="flex items-center gap-1 rounded-[7px] border border-hairline bg-sand/60 px-2 py-1 text-[11px] font-semibold text-ink hover:bg-sand"
            title="Add another road"
          >
            <Plus className="h-3 w-3" /> New
          </button>
          <button
            type="button"
            onClick={() => deleteRoad(selectedRoad.id)}
            className="grid h-7 w-7 place-items-center rounded-[7px] border border-hairline text-slate hover:bg-brick-soft hover:text-brick transition-colors"
            title="Delete this road"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => selectRoad(null)}
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
            onClick={() => moveX(-2)}
            className="grid h-7 w-7 place-items-center rounded-[6px] border border-hairline bg-sand/60 text-ink hover:bg-sand font-bold"
            title="Move West (-X)"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => moveX(2)}
            className="grid h-7 w-7 place-items-center rounded-[6px] border border-hairline bg-sand/60 text-ink hover:bg-sand font-bold"
            title="Move East (+X)"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => moveZ(-2)}
            className="grid h-7 w-7 place-items-center rounded-[6px] border border-hairline bg-sand/60 text-ink hover:bg-sand font-bold"
            title="Move North (-Z)"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => moveZ(2)}
            className="grid h-7 w-7 place-items-center rounded-[6px] border border-hairline bg-sand/60 text-ink hover:bg-sand font-bold"
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

        {/* Resize Controls */}
        <div className="flex items-center gap-1 border-l border-hairline/80 pl-2.5">
          <span className="font-semibold text-slate mr-1">Length:</span>
          <button
            type="button"
            onClick={() => resize(-4, 0)}
            className="rounded-[6px] border border-hairline bg-sand/60 px-1.5 py-1 font-mono text-[11px] font-bold text-ink hover:bg-sand"
            title="Shrink length"
          >
            -4m
          </button>
          <button
            type="button"
            onClick={() => resize(4, 0)}
            className="rounded-[6px] border border-hairline bg-sand/60 px-1.5 py-1 font-mono text-[11px] font-bold text-ink hover:bg-sand"
            title="Extend length"
          >
            +4m
          </button>
          <span className="font-semibold text-slate ml-1 mr-1">Width:</span>
          <button
            type="button"
            onClick={() => resize(0, -1)}
            className="rounded-[6px] border border-hairline bg-sand/60 px-1.5 py-1 font-mono text-[11px] font-bold text-ink hover:bg-sand"
            title="Narrow width"
          >
            -1m
          </button>
          <button
            type="button"
            onClick={() => resize(0, 1)}
            className="rounded-[6px] border border-hairline bg-sand/60 px-1.5 py-1 font-mono text-[11px] font-bold text-ink hover:bg-sand"
            title="Widen road"
          >
            +1m
          </button>
        </div>

        {/* Done Button */}
        <div className="border-l border-hairline/80 pl-2.5">
          <button
            type="button"
            onClick={() => {
              applyDraft();
              selectRoad(null);
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
