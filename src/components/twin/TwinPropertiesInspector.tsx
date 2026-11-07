import { memo, useState } from "react";
import {
  X,
  Copy,
  Trash2,
  RotateCw,
  RotateCcw,
  Move,
  Maximize2,
  Box,
  Building2,
  Video,
  Route,
  Shield,
  Ship,
  Truck,
  Car,
  ChevronDown,
  ChevronRight,
  Plus,
  Compass,
  Layers,
  Check,
} from "lucide-react";
import { useInteractiveTwin } from "@/state/InteractiveTwinProvider";
import { useYardManagement } from "@/state/YardManagementProvider";
import { useCctvManagement } from "@/state/CctvManagementProvider";
import { useBuildingManagement } from "@/state/BuildingManagementProvider";
import { useRoadManagement } from "@/state/RoadManagementProvider";
import { roadRepository } from "@/data/roadRepository";
import { fenceRepository } from "@/data/fenceRepository";
import type { FenceType } from "@/data/fenceTypes";
import { YardType, CapacityUnit, calculateYardMetrics } from "@/data/yardTypes";
import { BuildingType } from "@/data/buildingTypes";
import { cn } from "@/lib/utils";

export const TwinPropertiesInspector = memo(function TwinPropertiesInspector() {
  const {
    selectedObject,
    selectObject,
    rotateObject,
    duplicateSelected,
    deleteSelected,
    createPerimeterFenceForSelectedArea,
    startDrawingFenceLine,
    mode,
    setMode,
  } = useInteractiveTwin();

  const yardMgr = useYardManagement();
  const cctvMgr = useCctvManagement();
  const bldMgr = useBuildingManagement();
  const roadMgr = useRoadManagement();

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"transform" | "properties">("transform");

  if (!selectedObject) {
    return null;
  }

  const { id, category, name, position, rotation, dimensions, data } = selectedObject;
  const isEditMode = mode === "edit";

  // Handlers for coordinate modifications
  const handleMove = (dx: number, dz: number) => {
    const newX = Math.round((position.x + dx) * 10) / 10;
    const newZ = Math.round((position.z + dz) * 10) / 10;

    if (category === "yard") {
      yardMgr.setDraftPosition({ x: newX, z: newZ });
      yardMgr.applyDraftPosition();
    } else if (category === "cctv") {
      cctvMgr.updateTower(id, { x: newX, z: newZ });
    } else if (category === "building") {
      bldMgr.updateBuilding(id, { x: newX, z: newZ });
    } else if (category === "road") {
      roadRepository.update(id, { x: newX, z: newZ });
    } else if (category === "fence") {
      fenceRepository.update(id, { x: newX, z: newZ });
    }
  };

  const handleDimensionChange = (key: "width" | "length" | "height", val: number) => {
    const safeVal = Math.max(1, Math.round(val * 10) / 10);

    if (category === "yard") {
      const curDim = yardMgr.draftDimensions || {
        width: dimensions.width,
        length: dimensions.length,
        rotation,
      };
      const updated = {
        ...curDim,
        [key === "length" ? "length" : "width"]: safeVal,
      };
      yardMgr.setDraftDimensions(updated);
      yardMgr.applyDraftPosition();
    } else if (category === "building") {
      bldMgr.updateBuilding(id, {
        [key === "length" ? "depth" : key]: safeVal,
      });
    } else if (category === "cctv" && key === "height") {
      cctvMgr.updateTower(id, { height: safeVal });
    } else if (category === "road") {
      roadRepository.update(id, {
        [key === "length" ? "depth" : "width"]: safeVal,
      });
    } else if (category === "fence") {
      fenceRepository.update(id, {
        [key === "length" ? "depth" : key]: safeVal,
      });
    }
  };

  const handleFenceEndpointChange = (which: "start" | "end", coord: "x" | "z", val: number) => {
    const safeVal = Math.round(val * 10) / 10;
    const f = fenceRepository.getById(id);
    if (!f) return;
    const currentPoint = which === "start" ? f.startPoint : f.endPoint;
    const newPoint = {
      ...currentPoint,
      [coord]: safeVal,
    };
    fenceRepository.updateEndpoint(id, which, newPoint);
  };

  const handleFenceEndpointNudge = (which: "start" | "end", dx: number, dz: number) => {
    const f = fenceRepository.getById(id);
    if (!f) return;
    const pt = which === "start" ? f.startPoint : f.endPoint;
    fenceRepository.updateEndpoint(id, which, {
      x: Math.round((pt.x + dx) * 10) / 10,
      z: Math.round((pt.z + dz) * 10) / 10,
    });
  };

  const handleFenceLengthChange = (newLen: number) => {
    const safeLen = Math.max(1.5, Math.round(newLen * 10) / 10);
    const f = fenceRepository.getById(id);
    if (!f) return;
    const angleRad = (f.rotation * Math.PI) / 180;
    const newEnd = {
      x: Math.round((f.startPoint.x + Math.cos(angleRad) * safeLen) * 10) / 10,
      z: Math.round((f.startPoint.z + Math.sin(angleRad) * safeLen) * 10) / 10,
    };
    fenceRepository.updateEndpoint(id, "end", newEnd);
  };

  return (
    <aside
      aria-label="Object Inspector"
      className="pointer-events-auto fixed right-4 top-[calc(var(--hud-top)+1rem)] z-30 flex w-[330px] max-w-[calc(100vw-2rem)] flex-col rounded-[16px] border border-hairline/90 bg-paper/95 shadow-panel backdrop-blur-md animate-in fade-in slide-in-from-right-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-hairline p-3.5">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-[8px] bg-sand text-ink">
            {category === "yard" && <Box className="h-4 w-4 text-signal" />}
            {category === "cctv" && <Video className="h-4 w-4 text-signal" />}
            {category === "building" && <Building2 className="h-4 w-4 text-signal" />}
            {category === "road" && <Route className="h-4 w-4 text-signal" />}
            {category === "fence" && <Shield className="h-4 w-4 text-signal" />}
            {category === "vessel" && <Ship className="h-4 w-4 text-signal" />}
            {category === "truck" && <Truck className="h-4 w-4 text-signal" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="rounded bg-signal/10 px-1.5 py-0.2 font-mono text-[9px] font-bold uppercase tracking-wider text-signal">
                {category}
              </span>
              <span className="font-mono text-[10px] text-slate">{id}</span>
            </div>
            <p className="mt-0.5 text-[13.5px] font-bold text-ink leading-tight truncate max-w-[190px]">
              {name}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => selectObject(null)}
          className="grid h-7 w-7 place-items-center rounded-[6px] text-slate hover:bg-sand hover:text-ink transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-hairline bg-sand/40 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("transform")}
          className={cn(
            "flex-1 rounded-[7px] py-1 text-center text-[11.5px] font-bold transition-all",
            activeTab === "transform"
              ? "bg-paper text-ink shadow-xs"
              : "text-slate hover:text-ink"
          )}
        >
          3D Transform
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("properties")}
          className={cn(
            "flex-1 rounded-[7px] py-1 text-center text-[11.5px] font-bold transition-all",
            activeTab === "properties"
              ? "bg-paper text-ink shadow-xs"
              : "text-slate hover:text-ink"
          )}
        >
          Parameters & Specs
        </button>
      </div>

      {/* Content */}
      <div className="scroll-thin max-h-[calc(100vh-280px)] overflow-y-auto p-3.5 space-y-4">
        {activeTab === "transform" ? (
          <>
            {/* Position Coordinates Card */}
            <div className="rounded-[10px] border border-hairline bg-card/50 p-2.5">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate">
                  <Move className="h-3 w-3 text-signal" /> Position (X, Z)
                </span>
                {!isEditMode && (
                  <button
                    type="button"
                    onClick={() => setMode("edit")}
                    className="text-[10px] font-bold text-signal hover:underline"
                  >
                    Enable 3D Edit
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-[11.5px]">
                <div className="flex items-center justify-between rounded-[6px] border border-hairline bg-paper px-2 py-1">
                  <span className="font-bold text-slate">X:</span>
                  <input
                    type="number"
                    value={Math.round(position.x * 10) / 10}
                    onChange={(e) => handleMove(parseFloat(e.target.value) - position.x, 0)}
                    className="w-16 text-right font-bold text-ink focus:outline-none"
                  />
                  <span className="text-slate/60 text-[10px]">m</span>
                </div>

                <div className="flex items-center justify-between rounded-[6px] border border-hairline bg-paper px-2 py-1">
                  <span className="font-bold text-slate">Z:</span>
                  <input
                    type="number"
                    value={Math.round(position.z * 10) / 10}
                    onChange={(e) => handleMove(0, parseFloat(e.target.value) - position.z)}
                    className="w-16 text-right font-bold text-ink focus:outline-none"
                  />
                  <span className="text-slate/60 text-[10px]">m</span>
                </div>
              </div>

              {/* Nudge Buttons */}
              <div className="mt-2 flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => handleMove(-5, 0)}
                  className="flex-1 rounded-[6px] bg-sand py-1 text-center font-mono text-[10px] font-bold text-ink hover:bg-hairline"
                >
                  -5m X
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(5, 0)}
                  className="flex-1 rounded-[6px] bg-sand py-1 text-center font-mono text-[10px] font-bold text-ink hover:bg-hairline"
                >
                  +5m X
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(0, -5)}
                  className="flex-1 rounded-[6px] bg-sand py-1 text-center font-mono text-[10px] font-bold text-ink hover:bg-hairline"
                >
                  -5m Z
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(0, 5)}
                  className="flex-1 rounded-[6px] bg-sand py-1 text-center font-mono text-[10px] font-bold text-ink hover:bg-hairline"
                >
                  +5m Z
                </button>
              </div>
            </div>

            {/* Rotation Controls Card */}
            <div className="rounded-[10px] border border-hairline bg-card/50 p-2.5">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate">
                  <Compass className="h-3 w-3 text-signal" /> Rotation Angle
                </span>
                <span className="font-mono text-[11.5px] font-bold text-ink">
                  {rotation}°
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1">
                {[-90, -45, -15, 15, 45, 90].map((deg) => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() => rotateObject(deg)}
                    className="rounded-[6px] bg-sand py-1 text-center font-mono text-[10.5px] font-bold text-ink hover:bg-hairline transition-colors"
                  >
                    {deg > 0 ? `+${deg}°` : `${deg}°`}
                  </button>
                ))}
              </div>
            </div>

            {/* Line-based Fence Geometry Editor OR Standard Object Dimensions Card */}
            {category === "fence" && data ? (
              <div className="space-y-3">
                {/* 1. Fence Line Length & Height */}
                <div className="rounded-[10px] border border-hairline bg-card/50 p-2.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate">
                      <Route className="h-3 w-3 text-signal" /> Fence Line Span
                    </span>
                    <span className="font-mono text-[10px] font-bold text-signal">
                      {rotation}° Heading
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 font-mono text-[11.5px]">
                    <div className="flex items-center justify-between rounded-[6px] border border-hairline bg-paper px-2 py-1">
                      <span className="font-bold text-slate">Length:</span>
                      <input
                        type="number"
                        value={dimensions.width}
                        onChange={(e) => handleFenceLengthChange(parseFloat(e.target.value))}
                        className="w-14 text-right font-bold text-ink focus:outline-none"
                      />
                      <span className="text-slate/60 text-[10px]">m</span>
                    </div>

                    <div className="flex items-center justify-between rounded-[6px] border border-hairline bg-paper px-2 py-1">
                      <span className="font-bold text-slate">Height:</span>
                      <input
                        type="number"
                        value={dimensions.height || 2.6}
                        onChange={(e) => fenceRepository.update(id, { height: parseFloat(e.target.value) })}
                        className="w-14 text-right font-bold text-ink focus:outline-none"
                      />
                      <span className="text-slate/60 text-[10px]">m</span>
                    </div>
                  </div>
                </div>

                {/* 2. Point A (Start Point Coordinates) */}
                <div className="rounded-[10px] border border-hairline bg-card/50 p-2.5">
                  <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate mb-1.5">
                    <span className="h-2 w-2 rounded-full bg-sky-500 inline-block" /> Start Point (Point A)
                  </span>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11.5px]">
                    <div className="flex items-center justify-between rounded-[6px] border border-hairline bg-paper px-2 py-1">
                      <span className="font-bold text-slate">X:</span>
                      <input
                        type="number"
                        value={Math.round((data.startPoint?.x ?? (position.x - dimensions.width / 2)) * 10) / 10}
                        onChange={(e) => handleFenceEndpointChange("start", "x", parseFloat(e.target.value))}
                        className="w-14 text-right font-bold text-ink focus:outline-none"
                      />
                      <span className="text-slate/60 text-[10px]">m</span>
                    </div>
                    <div className="flex items-center justify-between rounded-[6px] border border-hairline bg-paper px-2 py-1">
                      <span className="font-bold text-slate">Z:</span>
                      <input
                        type="number"
                        value={Math.round((data.startPoint?.z ?? position.z) * 10) / 10}
                        onChange={(e) => handleFenceEndpointChange("start", "z", parseFloat(e.target.value))}
                        className="w-14 text-right font-bold text-ink focus:outline-none"
                      />
                      <span className="text-slate/60 text-[10px]">m</span>
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-1 font-mono text-[9.5px]">
                    <button
                      type="button"
                      onClick={() => handleFenceEndpointNudge("start", -1, 0)}
                      className="flex-1 rounded bg-sand py-0.5 text-center font-bold text-ink hover:bg-hairline"
                    >
                      -1m X
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFenceEndpointNudge("start", 1, 0)}
                      className="flex-1 rounded bg-sand py-0.5 text-center font-bold text-ink hover:bg-hairline"
                    >
                      +1m X
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFenceEndpointNudge("start", 0, -1)}
                      className="flex-1 rounded bg-sand py-0.5 text-center font-bold text-ink hover:bg-hairline"
                    >
                      -1m Z
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFenceEndpointNudge("start", 0, 1)}
                      className="flex-1 rounded bg-sand py-0.5 text-center font-bold text-ink hover:bg-hairline"
                    >
                      +1m Z
                    </button>
                  </div>
                </div>

                {/* 3. Point B (End Point Coordinates) */}
                <div className="rounded-[10px] border border-hairline bg-card/50 p-2.5">
                  <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate mb-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" /> End Point (Point B)
                  </span>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11.5px]">
                    <div className="flex items-center justify-between rounded-[6px] border border-hairline bg-paper px-2 py-1">
                      <span className="font-bold text-slate">X:</span>
                      <input
                        type="number"
                        value={Math.round((data.endPoint?.x ?? (position.x + dimensions.width / 2)) * 10) / 10}
                        onChange={(e) => handleFenceEndpointChange("end", "x", parseFloat(e.target.value))}
                        className="w-14 text-right font-bold text-ink focus:outline-none"
                      />
                      <span className="text-slate/60 text-[10px]">m</span>
                    </div>
                    <div className="flex items-center justify-between rounded-[6px] border border-hairline bg-paper px-2 py-1">
                      <span className="font-bold text-slate">Z:</span>
                      <input
                        type="number"
                        value={Math.round((data.endPoint?.z ?? position.z) * 10) / 10}
                        onChange={(e) => handleFenceEndpointChange("end", "z", parseFloat(e.target.value))}
                        className="w-14 text-right font-bold text-ink focus:outline-none"
                      />
                      <span className="text-slate/60 text-[10px]">m</span>
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-1 font-mono text-[9.5px]">
                    <button
                      type="button"
                      onClick={() => handleFenceEndpointNudge("end", -1, 0)}
                      className="flex-1 rounded bg-sand py-0.5 text-center font-bold text-ink hover:bg-hairline"
                    >
                      -1m X
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFenceEndpointNudge("end", 1, 0)}
                      className="flex-1 rounded bg-sand py-0.5 text-center font-bold text-ink hover:bg-hairline"
                    >
                      +1m X
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFenceEndpointNudge("end", 0, -1)}
                      className="flex-1 rounded bg-sand py-0.5 text-center font-bold text-ink hover:bg-hairline"
                    >
                      -1m Z
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFenceEndpointNudge("end", 0, 1)}
                      className="flex-1 rounded bg-sand py-0.5 text-center font-bold text-ink hover:bg-hairline"
                    >
                      +1m Z
                    </button>
                  </div>
                </div>

                {/* 4. Continue Drawing Connected Fence Line */}
                <button
                  type="button"
                  onClick={() => startDrawingFenceLine(data.type, data.endPoint)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-[8px] bg-signal px-3 py-2 text-[12px] font-bold text-white hover:bg-signal/90 shadow-xs transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Draw Connected Line From Point B</span>
                </button>
              </div>
            ) : (
              <>
                {/* Dimensions Card (Width, Length, Height) */}
                <div className="rounded-[10px] border border-hairline bg-card/50 p-2.5">
                  <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate mb-2">
                    <Maximize2 className="h-3 w-3 text-signal" /> Dimensions (Meters)
                  </span>

                  <div className="grid grid-cols-2 gap-2 font-mono text-[11.5px]">
                    <div className="flex items-center justify-between rounded-[6px] border border-hairline bg-paper px-2 py-1">
                      <span className="font-bold text-slate">Width:</span>
                      <input
                        type="number"
                        value={dimensions.width}
                        onChange={(e) => handleDimensionChange("width", parseFloat(e.target.value))}
                        className="w-14 text-right font-bold text-ink focus:outline-none"
                      />
                      <span className="text-slate/60 text-[10px]">m</span>
                    </div>

                    <div className="flex items-center justify-between rounded-[6px] border border-hairline bg-paper px-2 py-1">
                      <span className="font-bold text-slate">Length:</span>
                      <input
                        type="number"
                        value={dimensions.length}
                        onChange={(e) => handleDimensionChange("length", parseFloat(e.target.value))}
                        className="w-14 text-right font-bold text-ink focus:outline-none"
                      />
                      <span className="text-slate/60 text-[10px]">m</span>
                    </div>
                  </div>

                  {dimensions.height && dimensions.height > 1 && (
                    <div className="mt-2 flex items-center justify-between rounded-[6px] border border-hairline bg-paper px-2 py-1 font-mono text-[11.5px]">
                      <span className="font-bold text-slate">Height:</span>
                      <input
                        type="number"
                        value={dimensions.height}
                        onChange={(e) => handleDimensionChange("height", parseFloat(e.target.value))}
                        className="w-14 text-right font-bold text-ink focus:outline-none"
                      />
                      <span className="text-slate/60 text-[10px]">m</span>
                    </div>
                  )}
                </div>

                {/* 3D Perimeter Security Fence Quick Builder */}
                {(category === "yard" || category === "building") && (
                  <div className="rounded-[10px] border border-signal/30 bg-signal-soft/30 p-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="flex items-center gap-1.5 text-[11.5px] font-bold text-signal">
                        <Shield className="h-4 w-4" /> 3D Perimeter Fence Lines
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate mb-2">
                      Generate 4 editable fence lines around this {category}. Each line can be moved, angled, or removed independently.
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => createPerimeterFenceForSelectedArea("chainlink")}
                        className="flex-1 flex items-center justify-center gap-1 rounded-[6px] bg-signal px-2 py-1.5 text-[11px] font-bold text-white hover:bg-signal/90 shadow-xs transition-colors"
                      >
                        <Plus className="h-3 w-3" /> Chain-Link
                      </button>
                      <button
                        type="button"
                        onClick={() => createPerimeterFenceForSelectedArea("security_mesh")}
                        className="flex-1 flex items-center justify-center gap-1 rounded-[6px] bg-sand px-2 py-1.5 text-[11px] font-bold text-ink hover:bg-hairline transition-colors"
                      >
                        <Plus className="h-3 w-3" /> Heavy Mesh
                      </button>
                      <button
                        type="button"
                        onClick={() => createPerimeterFenceForSelectedArea("concrete_wall")}
                        className="flex-1 flex items-center justify-center gap-1 rounded-[6px] bg-sand px-2 py-1.5 text-[11px] font-bold text-ink hover:bg-hairline transition-colors"
                      >
                        <Plus className="h-3 w-3" /> Concrete Wall
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {/* Category-Specific Properties */}
            {category === "yard" && data && (
              <div className="space-y-3">
                <div className="rounded-[10px] border border-hairline bg-card/50 p-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate">
                    Yard Capacity & Occupancy
                  </span>

                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-medium text-slate">Yard Type:</span>
                      <span className="font-bold text-ink uppercase">{data.yardType}</span>
                    </div>

                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-medium text-slate">Total Capacity:</span>
                      <span className="font-mono font-bold text-ink">
                        {data.totalCapacity} {data.capacityUnit}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-medium text-slate">Occupied:</span>
                      <span className="font-mono font-bold text-ink">
                        {data.occupiedCount} {data.capacityUnit}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-medium text-slate">Free Capacity:</span>
                      <span className="font-mono font-bold text-moss">
                        {data.freeCapacity} {data.capacityUnit}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2">
                      <div className="flex justify-between text-[10px] font-mono text-slate mb-1">
                        <span>Utilization</span>
                        <span>{data.utilizationPercentage}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-sand overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all",
                            data.utilizationPercentage >= 85
                              ? "bg-brick"
                              : data.utilizationPercentage >= 60
                              ? "bg-amber"
                              : "bg-moss"
                          )}
                          style={{ width: `${Math.min(100, data.utilizationPercentage)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {category === "cctv" && data && (
              <div className="space-y-3">
                <div className="rounded-[10px] border border-hairline bg-card/50 p-2.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate">
                      Attached Cameras ({data.cameras?.length || 0})
                    </span>
                    <button
                      type="button"
                      onClick={() => cctvMgr.addCamera(id)}
                      className="flex items-center gap-1 rounded bg-sand px-2 py-0.5 text-[10.5px] font-bold text-ink hover:bg-hairline"
                    >
                      <Plus className="h-3 w-3" /> Add Cam
                    </button>
                  </div>

                  <div className="space-y-2 mt-2">
                    {data.cameras?.map((cam: any) => (
                      <div
                        key={cam.id}
                        className="rounded-[6px] border border-hairline bg-paper p-2 text-[11.5px]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-ink">{cam.name}</span>
                          <span className="font-mono text-[10px] text-slate">
                            {cam.yaw}° / {cam.pitch}°
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              cctvMgr.updateCamera(id, cam.id, {
                                yaw: (cam.yaw - 15 + 360) % 360,
                              })
                            }
                            className="flex-1 rounded bg-sand py-0.5 text-center font-mono text-[10px] font-bold text-ink hover:bg-hairline"
                          >
                            Pan -15°
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              cctvMgr.updateCamera(id, cam.id, {
                                yaw: (cam.yaw + 15) % 360,
                              })
                            }
                            className="flex-1 rounded bg-sand py-0.5 text-center font-mono text-[10px] font-bold text-ink hover:bg-hairline"
                          >
                            Pan +15°
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {category === "building" && data && (
              <div className="rounded-[10px] border border-hairline bg-card/50 p-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate">
                  Building Specs
                </span>
                <div className="mt-2 space-y-2 text-[12px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate font-medium">Type:</span>
                    <span className="font-bold text-ink uppercase">{data.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate font-medium">Height:</span>
                    <span className="font-mono font-bold text-ink">{data.height}m</span>
                  </div>
                </div>
              </div>
            )}

            {category === "fence" && data && (
              <div className="space-y-3">
                <div className="rounded-[10px] border border-hairline bg-card/50 p-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate">
                    3D Fence Configuration
                  </span>

                  <div className="mt-2 space-y-2.5 text-[12px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate font-medium">Fence Material:</span>
                      <select
                        value={data.type}
                        onChange={(e) => fenceRepository.update(id, { type: e.target.value as FenceType })}
                        className="rounded border border-hairline bg-paper px-2 py-1 text-[11px] font-bold text-ink"
                      >
                        <option value="chainlink">Chain-Link Wire Mesh</option>
                        <option value="security_mesh">Anti-Climb Heavy Mesh</option>
                        <option value="concrete_wall">Concrete Security Wall</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate font-medium">Vehicle Gate:</span>
                      <button
                        type="button"
                        onClick={() => fenceRepository.update(id, { isOpen: !data.isOpen })}
                        className={cn(
                          "rounded px-2.5 py-0.5 text-[11px] font-bold transition-colors",
                          data.isOpen ? "bg-moss/15 text-moss" : "bg-brick/15 text-brick"
                        )}
                      >
                        {data.isOpen ? "Open (Access Gap)" : "Closed (Full Wall)"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate font-medium">Top Barbed Wire:</span>
                      <button
                        type="button"
                        onClick={() => fenceRepository.update(id, { hasBarbedWire: !data.hasBarbedWire })}
                        className={cn(
                          "rounded px-2.5 py-0.5 text-[11px] font-bold transition-colors",
                          data.hasBarbedWire ? "bg-signal-soft text-signal" : "bg-sand text-slate"
                        )}
                      >
                        {data.hasBarbedWire ? "Equipped (3-Strand)" : "None"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate font-medium">Security Sign:</span>
                      <button
                        type="button"
                        onClick={() => fenceRepository.update(id, { hasWarningSign: !data.hasWarningSign })}
                        className={cn(
                          "rounded px-2.5 py-0.5 text-[11px] font-bold transition-colors",
                          data.hasWarningSign ? "bg-amber/15 text-amber" : "bg-sand text-slate"
                        )}
                      >
                        {data.hasWarningSign ? "Displayed" : "Hidden"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-hairline p-3 flex items-center gap-2">
        <button
          type="button"
          onClick={duplicateSelected}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-[8px] bg-sand py-2 text-[12px] font-bold text-ink hover:bg-hairline transition-colors"
        >
          <Copy className="h-3.5 w-3.5 text-signal" />
          <span>Duplicate</span>
        </button>

        <button
          type="button"
          onClick={deleteSelected}
          className="flex items-center justify-center gap-1.5 rounded-[8px] border border-brick/40 bg-brick/10 px-3 py-2 text-[12px] font-bold text-brick hover:bg-brick hover:text-white transition-colors"
          title="Delete selected infrastructure"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete</span>
        </button>

        <button
          type="button"
          onClick={() => selectObject(null)}
          className="grid h-8 w-8 place-items-center rounded-[8px] bg-signal text-white hover:bg-signal/90 transition-colors"
          title="Done editing"
        >
          <Check className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
});
