import { memo, useState } from "react";
import {
  Building2,
  Check,
  Compass,
  Move,
  Plus,
  RotateCcw,
  RotateCw,
  Trash2,
  Warehouse,
  Wrench,
  X,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useBuildingManagement } from "@/state/BuildingManagementProvider";
import type { BuildingType, CreateBuildingInput } from "@/data/buildingTypes";
import { cn } from "@/lib/utils";

export const Building3DControls = memo(function Building3DControls() {
  const {
    selectedBuilding,
    selectBuilding,
    draftPosition,
    setDraftPosition,
    draftDimensions,
    setDraftDimensions,
    applyDraft,
    updateBuilding,
    deleteBuilding,
    resetBuildings,
    isPickingLocation,
    startPickingLocation,
    cancelPickingLocation,
    isAddModalOpen,
    openAddModal,
    closeAddModal,
  } = useBuildingManagement();

  const [newBuildingName, setNewBuildingName] = useState("");
  const [newBuildingType, setNewBuildingType] = useState<BuildingType>("warehouse");

  // 1. Location picking prompt
  if (isPickingLocation) {
    return (
      <div className="pointer-events-auto fixed bottom-24 left-1/2 z-40 -translate-x-1/2 flex items-center gap-3 rounded-[14px] border border-harbor/40 bg-paper/95 px-5 py-3 shadow-panel backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-harbor">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-harbor opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-harbor" />
          </span>
          Click anywhere on the port map to place the building
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

  // Quick "+ Add Building" Dialog
  if (isAddModalOpen) {
    return (
      <div className="pointer-events-auto fixed bottom-24 left-1/2 z-40 -translate-x-1/2 w-[340px] rounded-[16px] border border-hairline bg-paper/95 p-4 shadow-panel backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between pb-2 border-b border-hairline/70">
          <h3 className="text-[14px] font-bold text-ink flex items-center gap-2">
            <Plus className="h-4 w-4 text-signal" /> Add Port Structure
          </h3>
          <button
            type="button"
            onClick={closeAddModal}
            className="text-slate hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-slate">Building Name</label>
            <input
              type="text"
              value={newBuildingName}
              onChange={(e) => setNewBuildingName(e.target.value)}
              placeholder="e.g. New Logistics Hub..."
              className="mt-1 h-8 w-full rounded-[8px] border border-hairline bg-sand/40 px-2.5 text-[12px] text-ink focus:border-ink focus:bg-paper focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate">Structure Type</label>
            <div className="mt-1 grid grid-cols-3 gap-1.5">
              {[
                { type: "warehouse" as const, label: "Warehouse", icon: <Warehouse className="h-3.5 w-3.5" /> },
                { type: "terminal_building" as const, label: "Office", icon: <Building2 className="h-3.5 w-3.5" /> },
                { type: "workshop" as const, label: "Workshop", icon: <Wrench className="h-3.5 w-3.5" /> },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setNewBuildingType(item.type)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-[8px] border p-2 text-[11px] font-semibold transition-all",
                    newBuildingType === item.type
                      ? "border-signal bg-signal-soft/60 text-signal"
                      : "border-hairline bg-paper text-slate hover:bg-sand"
                  )}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const name = newBuildingName.trim() || (newBuildingType === "warehouse" ? "New Warehouse" : "New Building");
              startPickingLocation({
                name,
                type: newBuildingType,
                width: newBuildingType === "warehouse" ? 32 : 22,
                depth: 14,
                height: newBuildingType === "warehouse" ? 6.8 : 8,
              });
              closeAddModal();
              setNewBuildingName("");
            }}
            className="w-full flex items-center justify-center gap-2 rounded-[9px] bg-ink py-2 text-[12px] font-semibold text-paper hover:bg-ink/90 transition-all shadow-sm"
          >
            Pick Location on Map <Compass className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // 2. Controls when a building is selected
  if (!selectedBuilding) {
    return null;
  }

  const curX = draftPosition ? draftPosition.x : selectedBuilding.x;
  const curZ = draftPosition ? draftPosition.z : selectedBuilding.z;
  const curRot = draftDimensions ? draftDimensions.rotation : selectedBuilding.rotation ?? 0;
  const curW = draftDimensions ? draftDimensions.width : selectedBuilding.width;
  const curD = draftDimensions ? draftDimensions.depth : selectedBuilding.depth;

  const nudge = (dx: number, dz: number) => {
    const nx = Math.round((curX + dx) * 10) / 10;
    const nz = Math.round((curZ + dz) * 10) / 10;
    setDraftPosition({ x: nx, z: nz });
    updateBuilding(selectedBuilding.id, { x: nx, z: nz });
  };

  const rotate = (delta: number) => {
    const nRot = (curRot + delta + 360) % 360;
    updateBuilding(selectedBuilding.id, { rotation: nRot });
  };

  const resize = (dw: number, dd: number) => {
    const nw = Math.max(8, curW + dw);
    const nd = Math.max(6, curD + dd);
    updateBuilding(selectedBuilding.id, { width: nw, depth: nd });
  };

  return (
    <div className="pointer-events-auto fixed bottom-24 left-1/2 z-40 -translate-x-1/2 flex flex-col items-center gap-2 rounded-[16px] border border-signal/40 bg-paper/95 p-3.5 shadow-panel backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
      {/* Top Header Row */}
      <div className="flex w-full items-center justify-between gap-4 border-b border-hairline/70 pb-2">
        <div className="flex items-center gap-2">
          <Move className="h-4 w-4 text-signal animate-pulse" />
          <div>
            <span className="text-[13px] font-bold text-ink">{selectedBuilding.name}</span>
            <span className="ml-2 font-mono text-[11px] text-slate">
              [{curX.toFixed(1)}, {curZ.toFixed(1)}] · {curRot}°
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {selectedBuilding.isCustom && (
            <button
              type="button"
              onClick={() => deleteBuilding(selectedBuilding.id)}
              className="grid h-7 w-7 place-items-center rounded-[7px] border border-brick/30 text-brick hover:bg-brick-soft transition-colors"
              title="Delete this custom building"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => selectBuilding(null)}
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

        {/* Rotate Button */}
        <div className="flex items-center gap-1 border-l border-hairline/80 pl-2.5">
          <span className="font-semibold text-slate mr-0.5">Rotate:</span>
          <button
            type="button"
            onClick={() => rotate(90)}
            className="flex items-center gap-1 rounded-[6px] border border-hairline bg-sand/60 px-2 py-1 font-semibold text-ink hover:bg-sand"
          >
            <RotateCw className="h-3 w-3" /> 90°
          </button>
        </div>

        {/* Resize (+ / -) */}
        <div className="flex items-center gap-1 border-l border-hairline/80 pl-2.5">
          <span className="font-semibold text-slate mr-0.5">Size:</span>
          <button
            type="button"
            onClick={() => resize(2, 0)}
            className="rounded-[6px] border border-hairline bg-sand/60 px-1.5 py-1 font-mono text-[11px] font-bold text-ink hover:bg-sand"
            title="Widen (+2m)"
          >
            W+
          </button>
          <button
            type="button"
            onClick={() => resize(-2, 0)}
            className="rounded-[6px] border border-hairline bg-sand/60 px-1.5 py-1 font-mono text-[11px] font-bold text-ink hover:bg-sand"
            title="Narrow (-2m)"
          >
            W-
          </button>
          <button
            type="button"
            onClick={() => resize(0, 2)}
            className="rounded-[6px] border border-hairline bg-sand/60 px-1.5 py-1 font-mono text-[11px] font-bold text-ink hover:bg-sand"
            title="Lengthen (+2m)"
          >
            D+
          </button>
          <button
            type="button"
            onClick={() => resize(0, -2)}
            className="rounded-[6px] border border-hairline bg-sand/60 px-1.5 py-1 font-mono text-[11px] font-bold text-ink hover:bg-sand"
            title="Shorten (-2m)"
          >
            D-
          </button>
        </div>

        {/* Done / Close Button */}
        <div className="border-l border-hairline/80 pl-2.5">
          <button
            type="button"
            onClick={() => {
              applyDraft();
              selectBuilding(null);
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
