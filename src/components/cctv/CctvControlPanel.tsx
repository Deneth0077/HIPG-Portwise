import { memo, useState } from "react";
import {
  Cctv,
  Video,
  Plus,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Move,
  RotateCw,
  Search,
  Filter,
  Check,
  X,
  Layers,
  Settings,
  ChevronDown,
  ChevronUp,
  Sliders,
  ShieldAlert,
  Info,
  Network,
  Cpu,
  Tag,
  Edit3,
} from "lucide-react";
import { useCctvManagement, type CoverageViewFilter } from "@/state/CctvManagementProvider";
import type { CctvCameraConfig, CctvCameraType, CctvStatus, CctvTowerConfig } from "@/data/cctvTypes";
import { CCTV_CAMERA_COLORS } from "@/data/cctvRepository";
import { cn } from "@/lib/utils";

const CAMERA_TYPES: { type: CctvCameraType; label: string }[] = [
  { type: "bullet", label: "Bullet (Long Range)" },
  { type: "dome", label: "Dome (Vandal Resistant)" },
  { type: "ptz", label: "PTZ (Pan/Tilt/Zoom)" },
  { type: "fixed", label: "Fixed Box" },
  { type: "other", label: "Specialized" },
];

export const CctvControlPanel = memo(function CctvControlPanel() {
  const {
    towers,
    filteredTowers,
    selectedTower,
    selectedTowerId,
    selectedCamera,
    selectedCameraId,
    totalCamerasCount,
    isCctvMode,
    setIsCctvMode,
    showTowers,
    setShowTowers,
    coverageFilter,
    setCoverageFilter,
    isPickingLocation,
    startAddTower,
    cancelPickingLocation,
    draftPosition,
    setDraftPosition,
    applyDraftPosition,
    selectTower,
    selectCamera,
    focusOnTower,
    updateTower,
    duplicateTower,
    deleteTower,
    addCamera,
    updateCamera,
    deleteCamera,
    resetAllTowers,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
  } = useCctvManagement();

  const [confirmDeleteTowerId, setConfirmDeleteTowerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"towers" | "selected">("towers");

  // Keep activeTab synced to 'selected' when a tower is selected
  const isTowerSelected = Boolean(selectedTower);

  // If CCTV mode is not active and not picking location, don't show the side panel
  if (!isCctvMode) {
    return null;
  }

  return (
    <div className="pointer-events-auto fixed left-4 top-[calc(var(--hud-top)+14px)] z-40 flex h-[calc(100vh-var(--hud-top)-80px)] w-[410px] flex-col rounded-[16px] border border-hairline bg-paper/95 shadow-panel backdrop-blur-md animate-in fade-in slide-in-from-left-4 text-ink">
      {/* 1. Header Toolbar */}
      <div className="flex shrink-0 items-center justify-between border-b border-hairline/80 px-4 py-3 bg-paper">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-signal/15 text-signal">
            <Cctv className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13.5px] font-extrabold tracking-tight text-ink">CCTV Management</span>
              <span className="rounded bg-signal px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-white uppercase">
                HIPG Twin
              </span>
            </div>
            <p className="text-[10.5px] text-slate font-medium">3D Tower & Coverage Simulator</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsCctvMode(false);
            selectTower(null);
          }}
          className="grid h-7 w-7 place-items-center rounded-md border border-hairline text-slate hover:bg-sand hover:text-ink transition-colors"
          title="Exit CCTV Mode"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* 2. Global Metric Badges & Action Buttons */}
      <div className="flex shrink-0 flex-col gap-2.5 border-b border-hairline/80 p-3 bg-sand/30">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-xl border border-hairline/70 bg-paper p-2 shadow-xs">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate">Total Towers</span>
            <span className="font-mono text-[17px] font-black text-ink">{towers.length}</span>
          </div>
          <div className="rounded-xl border border-hairline/70 bg-paper p-2 shadow-xs">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate">Active Cameras</span>
            <span className="font-mono text-[17px] font-black text-signal">{totalCamerasCount}</span>
          </div>
        </div>

        {/* Global Controls & Add Tower CTA */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={startAddTower}
            disabled={isPickingLocation}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-bold shadow-xs transition-all",
              isPickingLocation
                ? "bg-amber-500 text-white animate-pulse"
                : "bg-ink text-paper hover:bg-ink/90 active:scale-98"
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            {isPickingLocation ? "Click 3D Ground to Place" : "Add CCTV Tower"}
          </button>

          <button
            type="button"
            onClick={() => setShowTowers(!showTowers)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border border-hairline px-2.5 py-2 text-[11.5px] font-semibold transition-colors",
              showTowers ? "bg-paper text-ink hover:bg-sand" : "bg-sand text-slate"
            )}
            title="Toggle Tower Visibility"
          >
            {showTowers ? <Eye className="h-3.5 w-3.5 text-signal" /> : <EyeOff className="h-3.5 w-3.5" />}
            Towers
          </button>

          {/* Coverage Filter Selector */}
          <select
            value={coverageFilter}
            onChange={(e) => setCoverageFilter(e.target.value as CoverageViewFilter)}
            className="rounded-lg border border-hairline bg-paper px-2 py-1.5 text-[11px] font-semibold text-ink outline-none hover:bg-sand transition-colors cursor-pointer"
            title="Frustum Coverage Visibility"
          >
            <option value="all">Frustums: All</option>
            <option value="selected-tower">Frustums: Selected Tower</option>
            <option value="selected-camera">Frustums: Selected Cam</option>
            <option value="none">Frustums: Hidden</option>
          </select>
        </div>

        {/* Navigation Tabs if tower selected */}
        <div className="flex rounded-lg border border-hairline bg-paper/60 p-0.5 text-[11.5px] font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("towers")}
            className={cn(
              "flex-1 rounded-md py-1 text-center transition-colors",
              activeTab === "towers" ? "bg-ink text-paper shadow-xs" : "text-slate hover:text-ink"
            )}
          >
            All Towers ({filteredTowers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("selected")}
            disabled={!isTowerSelected}
            className={cn(
              "flex-1 rounded-md py-1 text-center transition-colors",
              activeTab === "selected"
                ? "bg-ink text-paper shadow-xs"
                : isTowerSelected
                ? "text-slate hover:text-ink"
                : "text-slate/40 cursor-not-allowed"
            )}
          >
            Selected Tower {selectedTower ? `(${selectedTower.code})` : ""}
          </button>
        </div>
      </div>

      {/* 3. Main Panel Content */}
      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto p-3">
        {activeTab === "towers" || !selectedTower ? (
          /* LIST OF TOWERS */
          <div className="space-y-2.5">
            {/* Search and Status Filter */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate" />
                <input
                  type="text"
                  placeholder="Search code, name, cameras..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-hairline bg-paper py-1.5 pl-8 pr-2 text-[11.5px] text-ink placeholder:text-slate focus:border-signal outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as CctvStatus | "all")}
                className="rounded-lg border border-hairline bg-paper px-2 py-1.5 text-[11px] font-medium text-slate outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Towers List */}
            {filteredTowers.length === 0 ? (
              <div className="p-8 text-center text-[12px] text-slate">
                No CCTV towers found matching your criteria.
              </div>
            ) : (
              filteredTowers.map((tower) => {
                const isSelected = tower.id === selectedTowerId;
                return (
                  <div
                    key={tower.id}
                    onClick={() => {
                      selectTower(tower.id);
                      setActiveTab("selected");
                      focusOnTower(tower);
                    }}
                    className={cn(
                      "group flex flex-col gap-2 rounded-xl border p-3 cursor-pointer transition-all text-left",
                      isSelected
                        ? "border-signal/80 bg-signal-soft/60 shadow-xs"
                        : "border-hairline/80 bg-paper hover:border-slate/30 hover:bg-sand/40"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[13px] font-bold text-ink group-hover:text-signal transition-colors">
                          {tower.code}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase",
                            tower.status === "active"
                              ? "bg-emerald-100 text-emerald-800"
                              : tower.status === "maintenance"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                          )}
                        >
                          {tower.status}
                        </span>
                      </div>

                      <span className="font-mono text-[11px] font-semibold text-slate">
                        {tower.cameras.length} {tower.cameras.length === 1 ? "Cam" : "Cams"}
                      </span>
                    </div>

                    <div className="text-[12px] font-semibold text-ink line-clamp-1">{tower.name}</div>

                    <div className="flex items-center justify-between text-[10.5px] text-slate font-mono">
                      <span>
                        X: {tower.x.toFixed(1)} · Z: {tower.z.toFixed(1)}
                      </span>
                      <span>Height: {tower.height}m</span>
                    </div>

                    {/* Camera pills summary */}
                    <div className="flex flex-wrap gap-1.5 pt-1 border-t border-hairline/60">
                      {tower.cameras.map((c) => (
                        <span
                          key={c.id}
                          className="flex items-center gap-1.5 rounded-md bg-sand/80 px-2 py-0.5 text-[10px] font-medium text-ink"
                          title={`${c.name} | ${c.type.toUpperCase()}${c.ipAddress ? ` | IP: ${c.ipAddress}` : ""}${c.model ? ` | Model: ${c.model}` : ""}`}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: c.coverageColor || "#0284C7" }}
                          />
                          <span className="font-semibold">{c.name}</span>
                          {c.ipAddress && (
                            <span className="font-mono text-[9px] text-signal bg-signal/10 px-1 rounded">
                              {c.ipAddress}
                            </span>
                          )}
                          {c.model && (
                            <span className="text-[9px] text-slate line-clamp-1 max-w-[90px]">
                              {c.model}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}

            {/* Bottom Reset helper */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Reset all CCTV towers back to the authoritative default HIPG layout?")) {
                    resetAllTowers();
                  }
                }}
                className="w-full text-center text-[11px] font-semibold text-slate hover:text-ink underline py-1"
              >
                Reset Default HIPG Security Layout
              </button>
            </div>
          </div>
        ) : (
          /* SELECTED TOWER CONFIGURATION INSPECTOR */
          <SelectedTowerInspector
            tower={selectedTower}
            selectedCameraId={selectedCameraId}
            onSelectCamera={selectCamera}
            onUpdateTower={updateTower}
            onDuplicateTower={() => duplicateTower(selectedTower.id)}
            onDeleteTower={() => deleteTower(selectedTower.id)}
            onAddCamera={() => addCamera(selectedTower.id)}
            onUpdateCamera={(camId, updates) => updateCamera(selectedTower.id, camId, updates)}
            onDeleteCamera={(camId) => deleteCamera(selectedTower.id, camId)}
            onFocusTower={() => focusOnTower(selectedTower)}
          />
        )}
      </div>
    </div>
  );
});

/**
 * Inspector sub-component for detailed tower and multi-camera configuration
 */
function SelectedTowerInspector({
  tower,
  selectedCameraId,
  onSelectCamera,
  onUpdateTower,
  onDuplicateTower,
  onDeleteTower,
  onAddCamera,
  onUpdateCamera,
  onDeleteCamera,
  onFocusTower,
}: {
  tower: CctvTowerConfig;
  selectedCameraId: string | null;
  onSelectCamera: (id: string | null) => void;
  onUpdateTower: (id: string, updates: Partial<CctvTowerConfig>) => void;
  onDuplicateTower: () => void;
  onDeleteTower: () => void;
  onAddCamera: () => void;
  onUpdateCamera: (camId: string, updates: Partial<CctvCameraConfig>) => void;
  onDeleteCamera: (camId: string) => void;
  onFocusTower: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activeCamTab, setActiveCamTab] = useState<string | null>(selectedCameraId || tower.cameras[0]?.id || null);

  const selectedCam = tower.cameras.find((c) => c.id === (selectedCameraId || activeCamTab)) || tower.cameras[0] || null;

  return (
    <div className="space-y-4 text-[12px]">
      {/* 1. Tower Identification & Actions */}
      <div className="rounded-xl border border-hairline/80 bg-paper p-3 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tower.code}
              onChange={(e) => onUpdateTower(tower.id, { code: e.target.value.toUpperCase() })}
              className="w-28 rounded-md border border-hairline bg-sand/40 px-2 py-1 font-mono text-[13px] font-bold text-ink focus:border-signal outline-none"
              title="Tower Code"
            />
            <select
              value={tower.status}
              onChange={(e) => onUpdateTower(tower.id, { status: e.target.value as CctvStatus })}
              className="rounded-md border border-hairline bg-sand/40 px-2 py-1 text-[11px] font-semibold text-ink outline-none"
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onFocusTower}
              className="rounded-md border border-hairline bg-sand/60 px-2 py-1 text-[11px] font-semibold text-ink hover:bg-sand"
              title="Focus 3D Camera on this tower"
            >
              Focus
            </button>
            <button
              type="button"
              onClick={onDuplicateTower}
              className="grid h-7 w-7 place-items-center rounded-md border border-hairline bg-sand/60 text-ink hover:bg-sand"
              title="Duplicate Tower"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="grid h-7 w-7 place-items-center rounded-md border border-brick/30 text-brick hover:bg-brick-soft"
              title="Delete Tower"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Delete Confirmation prompt */}
        {confirmDelete && (
          <div className="rounded-lg border border-brick/40 bg-brick-soft/80 p-2.5 space-y-2 animate-in fade-in">
            <p className="text-[11.5px] font-semibold text-brick">
              Delete tower {tower.code} and all {tower.cameras.length} cameras?
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onDeleteTower();
                  setConfirmDelete(false);
                }}
                className="flex-1 rounded-md bg-brick py-1 text-[11px] font-bold text-white hover:bg-brick/90"
              >
                Yes, Delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="flex-1 rounded-md border border-hairline bg-paper py-1 text-[11px] font-semibold text-ink hover:bg-sand"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Tower Name & Code Inputs */}
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="flex items-center gap-1 text-[10.5px] font-bold uppercase text-slate">
                <Edit3 className="h-3 w-3 text-signal" />
                <span>Tower Display Name</span>
              </label>
              <span className="text-[10px] text-slate/75">Saved automatically</span>
            </div>
            <input
              type="text"
              value={tower.name}
              onChange={(e) => onUpdateTower(tower.id, { name: e.target.value })}
              placeholder="e.g. Main Gate Security Mast T01"
              className="w-full rounded-md border border-hairline bg-paper px-2.5 py-1.5 text-[12.5px] font-semibold text-ink focus:border-signal outline-none shadow-xs"
            />
          </div>
        </div>

        {/* Position & Height Numeric Adjustments */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate mb-0.5">X (Meters)</label>
            <input
              type="number"
              value={tower.x}
              onChange={(e) => onUpdateTower(tower.id, { x: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-md border border-hairline bg-sand/20 px-2 py-1 font-mono text-[11.5px] text-ink focus:border-signal outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate mb-0.5">Z (Meters)</label>
            <input
              type="number"
              value={tower.z}
              onChange={(e) => onUpdateTower(tower.id, { z: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-md border border-hairline bg-sand/20 px-2 py-1 font-mono text-[11.5px] text-ink focus:border-signal outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate mb-0.5">Height (m)</label>
            <input
              type="number"
              min={4}
              max={40}
              value={tower.height}
              onChange={(e) => onUpdateTower(tower.id, { height: Math.max(4, parseFloat(e.target.value) || 16) })}
              className="w-full rounded-md border border-hairline bg-sand/20 px-2 py-1 font-mono text-[11.5px] text-ink focus:border-signal outline-none"
            />
          </div>
        </div>

        {/* Tower Orientation / Rotation Slider */}
        <div>
          <div className="flex items-center justify-between text-[10.5px] font-semibold text-slate mb-1">
            <span>Tower Rotation</span>
            <span className="font-mono text-ink">{tower.rotation}°</span>
          </div>
          <input
            type="range"
            min={0}
            max={359}
            value={tower.rotation}
            onChange={(e) => onUpdateTower(tower.id, { rotation: parseInt(e.target.value, 10) })}
            className="w-full accent-signal cursor-pointer"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-[10.5px] font-bold uppercase text-slate mb-1">Installation Notes</label>
          <textarea
            rows={2}
            value={tower.notes || ""}
            onChange={(e) => onUpdateTower(tower.id, { notes: e.target.value })}
            placeholder="e.g. Fiber optic junction box, CCTV switch port 4"
            className="w-full rounded-md border border-hairline bg-sand/20 px-2.5 py-1 text-[11px] text-ink focus:border-signal outline-none resize-none"
          />
        </div>
      </div>

      {/* 2. Cameras Section */}
      <div className="rounded-xl border border-hairline/80 bg-paper p-3 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-hairline/70 pb-2">
          <div className="flex items-center gap-1.5">
            <Video className="h-4 w-4 text-signal" />
            <span className="font-bold text-[12.5px] text-ink">
              Attached Cameras ({tower.cameras.length})
            </span>
          </div>

          <button
            type="button"
            onClick={onAddCamera}
            className="flex items-center gap-1 rounded-md bg-ink px-2 py-1 text-[11px] font-semibold text-paper hover:bg-ink/90 transition-colors shadow-xs"
          >
            <Plus className="h-3 w-3" /> Add Camera
          </button>
        </div>

        {/* Camera Selector Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {tower.cameras.map((c, i) => {
            const isSelected = selectedCam?.id === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onSelectCamera(c.id);
                  setActiveCamTab(c.id);
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all",
                  isSelected
                    ? "border-signal bg-signal text-white shadow-xs"
                    : "border-hairline bg-sand/40 text-ink hover:bg-sand"
                )}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: isSelected ? "#FFFFFF" : c.coverageColor || "#0284C7" }}
                />
                {c.name || `Cam ${i + 1}`}
              </button>
            );
          })}
        </div>

        {/* Selected Camera Detailed Properties */}
        {selectedCam && (
          <div className="rounded-lg border border-hairline/70 bg-sand/20 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[12px] text-ink">{selectedCam.name}</span>
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: selectedCam.coverageColor || "#0284C7" }}
                  title="Frustum Color"
                />
              </div>

              <div className="flex items-center gap-1">
                {tower.cameras.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onDeleteCamera(selectedCam.id)}
                    className="grid h-6 w-6 place-items-center rounded border border-brick/30 text-brick hover:bg-brick-soft"
                    title="Remove this camera"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Camera Name & Type */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate mb-0.5">Camera Name</label>
                <input
                  type="text"
                  value={selectedCam.name}
                  onChange={(e) => onUpdateCamera(selectedCam.id, { name: e.target.value })}
                  placeholder="e.g. Inbound Gate ANPR"
                  className="w-full rounded-md border border-hairline bg-paper px-2 py-1 text-[11.5px] font-medium text-ink focus:border-signal outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate mb-0.5">Type</label>
                <select
                  value={selectedCam.type}
                  onChange={(e) => onUpdateCamera(selectedCam.id, { type: e.target.value as CctvCameraType })}
                  className="w-full rounded-md border border-hairline bg-paper px-2 py-1 text-[11px] font-semibold text-ink outline-none"
                >
                  {CAMERA_TYPES.map((t) => (
                    <option key={t.type} value={t.type}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* IP Address & Hardware Model */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate mb-0.5">
                  <Network className="h-3 w-3 text-signal" />
                  <span>IP Address</span>
                </label>
                <input
                  type="text"
                  value={selectedCam.ipAddress || ""}
                  onChange={(e) => onUpdateCamera(selectedCam.id, { ipAddress: e.target.value })}
                  placeholder="e.g. 192.168.10.101"
                  className="w-full rounded-md border border-hairline bg-paper px-2 py-1 font-mono text-[11.5px] text-ink focus:border-signal outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate mb-0.5">
                  <Cpu className="h-3 w-3 text-signal" />
                  <span>Camera Model</span>
                </label>
                <input
                  type="text"
                  value={selectedCam.model || ""}
                  onChange={(e) => onUpdateCamera(selectedCam.id, { model: e.target.value })}
                  placeholder="e.g. Hikvision DS-2CD2T87G2"
                  className="w-full rounded-md border border-hairline bg-paper px-2 py-1 text-[11px] text-ink focus:border-signal outline-none"
                />
              </div>
            </div>

            {/* Mounting Height Slider */}
            <div>
              <div className="flex items-center justify-between text-[10.5px] font-semibold text-slate mb-1">
                <span>Mounting Height</span>
                <span className="font-mono text-ink">{selectedCam.mountingHeight.toFixed(1)}m</span>
              </div>
              <input
                type="range"
                min={2}
                max={tower.height}
                step={0.5}
                value={selectedCam.mountingHeight}
                onChange={(e) => onUpdateCamera(selectedCam.id, { mountingHeight: parseFloat(e.target.value) })}
                className="w-full accent-signal cursor-pointer"
              />
            </div>

            {/* Horizontal Direction (Yaw) Slider */}
            <div>
              <div className="flex items-center justify-between text-[10.5px] font-semibold text-slate mb-1">
                <span>Horizontal Direction (Yaw)</span>
                <span className="font-mono text-ink">{selectedCam.yaw}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={359}
                value={selectedCam.yaw}
                onChange={(e) => onUpdateCamera(selectedCam.id, { yaw: parseInt(e.target.value, 10) })}
                className="w-full accent-signal cursor-pointer"
              />
            </div>

            {/* Vertical Tilt (Pitch) Slider */}
            <div>
              <div className="flex items-center justify-between text-[10.5px] font-semibold text-slate mb-1">
                <span>Vertical Tilt (Pitch)</span>
                <span className="font-mono text-ink">
                  {selectedCam.pitch}° {selectedCam.pitch < 0 ? "(Down)" : "(Up)"}
                </span>
              </div>
              <input
                type="range"
                min={-80}
                max={45}
                value={selectedCam.pitch}
                onChange={(e) => onUpdateCamera(selectedCam.id, { pitch: parseInt(e.target.value, 10) })}
                className="w-full accent-signal cursor-pointer"
              />
            </div>

            {/* FOV Controls (Horizontal & Vertical) */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex items-center justify-between text-[10px] font-semibold text-slate mb-1">
                  <span>H-FOV</span>
                  <span className="font-mono text-ink">{selectedCam.hfov}°</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={130}
                  value={selectedCam.hfov}
                  onChange={(e) => onUpdateCamera(selectedCam.id, { hfov: parseInt(e.target.value, 10) })}
                  className="w-full accent-signal cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-[10px] font-semibold text-slate mb-1">
                  <span>V-FOV</span>
                  <span className="font-mono text-ink">{selectedCam.vfov}°</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={selectedCam.vfov}
                  onChange={(e) => onUpdateCamera(selectedCam.id, { vfov: parseInt(e.target.value, 10) })}
                  className="w-full accent-signal cursor-pointer"
                />
              </div>
            </div>

            {/* Range / Distance Slider */}
            <div>
              <div className="flex items-center justify-between text-[10.5px] font-semibold text-slate mb-1">
                <span>Coverage Distance / Range</span>
                <span className="font-mono text-ink">{selectedCam.range}m</span>
              </div>
              <input
                type="range"
                min={15}
                max={220}
                step={5}
                value={selectedCam.range}
                onChange={(e) => onUpdateCamera(selectedCam.id, { range: parseInt(e.target.value, 10) })}
                className="w-full accent-signal cursor-pointer"
              />
            </div>

            {/* Status & Frustum Color Pick */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-hairline/60">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate mb-0.5">Status</label>
                <select
                  value={selectedCam.status}
                  onChange={(e) => onUpdateCamera(selectedCam.id, { status: e.target.value as CctvStatus })}
                  className="w-full rounded-md border border-hairline bg-paper px-2 py-1 text-[11px] font-semibold text-ink outline-none"
                >
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate mb-0.5">Frustum Color</label>
                <div className="flex items-center gap-1">
                  {CCTV_CAMERA_COLORS.slice(0, 5).map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => onUpdateCamera(selectedCam.id, { coverageColor: col })}
                      className={cn(
                        "h-5 w-5 rounded-full border transition-transform",
                        selectedCam.coverageColor === col ? "scale-115 border-ink" : "border-transparent"
                      )}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Reset to Camera defaults */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() =>
                  onUpdateCamera(selectedCam.id, {
                    yaw: 0,
                    pitch: -25,
                    hfov: 65,
                    vfov: 42,
                    range: 75,
                  })
                }
                className="text-[10.5px] font-semibold text-slate hover:text-ink underline"
              >
                Reset Camera Aim & Angles
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
