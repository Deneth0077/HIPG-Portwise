import { memo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  Car,
  Check,
  Compass,
  Copy,
  Edit3,
  Layers,
  MapPin,
  Move,
  Package,
  Ruler,
  Trash2,
  X,
} from "lucide-react";
import { useYardManagement } from "@/state/YardManagementProvider";
import {
  YARD_TYPE_LABELS,
  CAPACITY_UNIT_LABELS,
  YARD_STATUS_LABELS,
  type YardBlockConfig,
} from "@/data/yardTypes";
import { DefRow, Panel, PanelHeader, ProgressBar, StatusChip, type Tone } from "@/components/hud/primitives";
import { cn } from "@/lib/utils";

const nf = new Intl.NumberFormat("en-US");

export const yardFillTone = (fill: number): Tone => {
  if (fill >= 0.95) return "brick";
  if (fill >= 0.8) return "signal";
  if (fill >= 0.6) return "amber";
  return "moss";
};

export const YardDetailsPanel = memo(function YardDetailsPanel({
  yard,
  onClose,
}: {
  yard: YardBlockConfig;
  onClose?: () => void;
}) {
  const {
    openEditModal,
    updateYardCapacity,
    duplicateYardAction,
    deleteYardAction,
    is3DEditMode,
    setIs3DEditMode,
    focusOnYard,
  } = useYardManagement();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isEditingCapacity, setIsEditingCapacity] = useState(false);
  const [totalCapInput, setTotalCapInput] = useState(String(yard.totalCapacity));
  const [occupiedInput, setOccupiedInput] = useState(String(yard.occupiedCount));
  const [capError, setCapError] = useState<string | null>(null);

  const fillRatio = yard.totalCapacity > 0 ? yard.occupiedCount / yard.totalCapacity : 0;
  const isRoRo = yard.capacityUnit === "slots" || yard.yardType === "roro";
  const unitLabel = CAPACITY_UNIT_LABELS[yard.capacityUnit];

  const statusTone: Tone =
    yard.status === "active"
      ? "moss"
      : yard.status === "full"
      ? "brick"
      : yard.status === "maintenance"
      ? "amber"
      : "slate";

  return (
    <Panel className="w-full p-4" aria-label={`Yard Block ${yard.code}`}>
      <PanelHeader
        eyebrow={YARD_TYPE_LABELS[yard.yardType]}
        title={`Block ${yard.code}`}
        icon={isRoRo ? <Car className="h-5 w-5 text-[#1B4D3E]" /> : <Boxes className="h-5 w-5 text-harbor" />}
        right={
          onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid h-9 w-9 place-items-center rounded-[10px] text-ink hover:bg-sand transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          ) : undefined
        }
      />

      {/* Yard Name & Badges */}
      <div className="mt-2.5">
        <p className="text-[13.5px] font-semibold text-ink leading-snug">{yard.name}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <StatusChip tone={statusTone}>{YARD_STATUS_LABELS[yard.status]}</StatusChip>
          <span className="rounded-[6px] bg-sand px-2 py-0.5 font-mono text-[11px] font-semibold text-slate">
            {unitLabel}
          </span>
          {yard.isCustom && (
            <span className="rounded-[6px] bg-harbor/15 px-2 py-0.5 text-[11px] font-semibold text-harbor">
              Custom Yard
            </span>
          )}
        </div>
      </div>

      {/* Utilization & Capacity Section with Direct Manual Capacity Editor */}
      <div className="mt-4 rounded-[12px] border border-hairline bg-sand/40 p-3 space-y-2.5">
        <div className="flex items-center justify-between text-[12.5px]">
          <span className="font-semibold text-ink flex items-center gap-1.5">
            Occupancy:{" "}
            <strong className="font-mono text-ink">
              {nf.format(yard.occupiedCount)} / {nf.format(yard.totalCapacity)}
            </strong>{" "}
            <span className="text-slate font-normal">{unitLabel}</span>
          </span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-ink tnum">{yard.utilizationPercentage}%</span>
            <button
              type="button"
              onClick={() => {
                if (isEditingCapacity) {
                  setIsEditingCapacity(false);
                } else {
                  setTotalCapInput(String(yard.totalCapacity));
                  setOccupiedInput(String(yard.occupiedCount));
                  setCapError(null);
                  setIsEditingCapacity(true);
                }
              }}
              title="Manually adjust capacity values"
              className={cn(
                "rounded-[6px] px-1.5 py-0.5 text-[11px] font-semibold transition-colors flex items-center gap-1",
                isEditingCapacity
                  ? "bg-ink text-white"
                  : "bg-paper border border-hairline text-slate hover:text-ink hover:border-slate/40"
              )}
            >
              <Edit3 className="h-3 w-3" />
              {isEditingCapacity ? "Cancel" : "Edit Capacity"}
            </button>
          </div>
        </div>

        <ProgressBar value={fillRatio} tone={yardFillTone(fillRatio)} height="h-2.5" />

        {/* Inline Manual Capacity Editor Form */}
        {isEditingCapacity ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const tot = parseInt(totalCapInput, 10);
              const occ = parseInt(occupiedInput, 10);
              if (isNaN(tot) || tot <= 0) {
                setCapError("Total capacity must be > 0");
                return;
              }
              if (isNaN(occ) || occ < 0) {
                setCapError("Occupied cannot be negative");
                return;
              }
              if (occ > tot) {
                setCapError("Occupied cannot exceed total");
                return;
              }
              const res = updateYardCapacity(yard.id, tot, occ);
              if (res.success) {
                setIsEditingCapacity(false);
                setCapError(null);
              } else {
                setCapError(res.error || "Failed to update");
              }
            }}
            className="rounded-[10px] border border-signal/40 bg-paper p-2.5 space-y-2 mt-2 shadow-sm animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-ink border-b border-hairline/60 pb-1">
              <span>Manual Capacity Editor</span>
              <span className="text-harbor font-mono">{unitLabel}</span>
            </div>

            {capError && (
              <p className="text-[11px] text-brick font-medium">{capError}</p>
            )}

            <div className="grid grid-cols-2 gap-2 text-[11.5px]">
              <div>
                <label className="block text-[10.5px] font-semibold text-slate mb-1">
                  Total Capacity:
                </label>
                <input
                  type="number"
                  min={1}
                  max={100000}
                  value={totalCapInput}
                  onChange={(e) => setTotalCapInput(e.target.value)}
                  className="h-8 w-full rounded-[6px] border border-hairline bg-sand/30 px-2 font-mono text-[12.5px] font-bold text-ink focus:border-ink focus:bg-paper focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10.5px] font-semibold text-slate mb-1">
                  Occupied Count:
                </label>
                <input
                  type="number"
                  min={0}
                  max={100000}
                  value={occupiedInput}
                  onChange={(e) => setOccupiedInput(e.target.value)}
                  className="h-8 w-full rounded-[6px] border border-hairline bg-sand/30 px-2 font-mono text-[12.5px] font-bold text-ink focus:border-ink focus:bg-paper focus:outline-none"
                />
              </div>
            </div>

            {/* Quick Presets / Sliders */}
            <div className="flex items-center justify-between gap-1 pt-1 text-[10.5px]">
              <span className="text-slate">Quick Fill:</span>
              <div className="flex items-center gap-1">
                {[0, 25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      const tot = parseInt(totalCapInput, 10) || yard.totalCapacity;
                      setOccupiedInput(String(Math.round((tot * pct) / 100)));
                    }}
                    className="rounded bg-sand px-1.5 py-0.5 font-mono text-[10px] text-slate hover:bg-slate/20 hover:text-ink transition-colors"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-hairline/60">
              <button
                type="button"
                onClick={() => setIsEditingCapacity(false)}
                className="rounded-[6px] px-2.5 py-1 text-[11px] font-semibold text-slate hover:text-ink transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-[6px] bg-ink px-3 py-1 text-[11px] font-semibold text-paper shadow-sm hover:bg-ink/90 active:scale-95 transition-all flex items-center gap-1"
              >
                <Check className="h-3 w-3" /> Save Capacity
              </button>
            </div>
          </form>
        ) : null}

        <div className="flex items-center justify-between text-[11.5px] text-slate pt-1 border-t border-hairline/60">
          <span>
            Free Capacity: <strong className="font-mono text-moss">{nf.format(yard.freeCapacity)}</strong> {unitLabel}
          </span>
          <span className="text-[10px] text-slate/80">Custom / Telemetry editable</span>
        </div>
      </div>

      {/* Geometry and Coordinates */}
      <dl className="mt-3.5 space-y-1 divide-y divide-hairline/60 text-[12.5px]">
        <DefRow
          label={
            <span className="inline-flex items-center gap-1.5 text-slate">
              <MapPin className="h-3.5 w-3.5" /> 3D Coordinates
            </span>
          }
        >
          <span className="font-mono text-ink">
            X: {yard.position.x.toFixed(1)}m, Z: {yard.position.z.toFixed(1)}m
          </span>
        </DefRow>

        <DefRow
          label={
            <span className="inline-flex items-center gap-1.5 text-slate">
              <Ruler className="h-3.5 w-3.5" /> Dimensions
            </span>
          }
        >
          <span className="font-mono text-ink">
            {yard.width}m (W) × {yard.length}m (L)
          </span>
        </DefRow>

        {yard.rotation !== 0 && (
          <DefRow
            label={
              <span className="inline-flex items-center gap-1.5 text-slate">
                <Compass className="h-3.5 w-3.5" /> Rotation
              </span>
            }
          >
            <span className="font-mono text-ink">{yard.rotation}°</span>
          </DefRow>
        )}

        {yard.notes && (
          <div className="pt-2 text-[12px] text-slate">
            <span className="font-semibold text-ink block mb-0.5">Notes:</span>
            <p className="rounded-[8px] bg-sand/60 p-2 text-ink/90 leading-relaxed">{yard.notes}</p>
          </div>
        )}
      </dl>

      {/* Quick Action Buttons */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => openEditModal(yard)}
          className="flex items-center justify-center gap-1.5 rounded-[9px] border border-hairline bg-paper px-3 py-2 text-[12.5px] font-semibold text-ink hover:bg-sand transition-colors"
        >
          <Edit3 className="h-3.5 w-3.5 text-slate" />
          Edit Details
        </button>

        <button
          type="button"
          onClick={() => {
            setIs3DEditMode(true);
            focusOnYard(yard);
          }}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-[9px] px-3 py-2 text-[12.5px] font-semibold transition-all",
            is3DEditMode
              ? "bg-signal text-white shadow-sm"
              : "border border-hairline bg-paper text-ink hover:bg-sand"
          )}
        >
          <Move className="h-3.5 w-3.5" />
          {is3DEditMode ? "In 3D Edit Mode" : "3D Move / Resize"}
        </button>

        <button
          type="button"
          onClick={() => duplicateYardAction(yard.id)}
          className="flex items-center justify-center gap-1.5 rounded-[9px] border border-hairline bg-paper px-3 py-2 text-[12.5px] font-semibold text-ink hover:bg-sand transition-colors"
        >
          <Copy className="h-3.5 w-3.5 text-slate" />
          Duplicate
        </button>

        <button
          type="button"
          onClick={() => focusOnYard(yard)}
          className="flex items-center justify-center gap-1.5 rounded-[9px] border border-hairline bg-paper px-3 py-2 text-[12.5px] font-semibold text-ink hover:bg-sand transition-colors"
        >
          <Compass className="h-3.5 w-3.5 text-slate" />
          Focus 3D
        </button>
      </div>

      {/* Delete Yard Section with Confirmation */}
      <div className="mt-4 border-t border-hairline pt-3">
        {confirmDelete ? (
          <div className="rounded-[11px] border border-brick/30 bg-brick-soft p-3 text-[12px] space-y-2">
            <div className="flex items-start gap-2 text-brick font-semibold">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Delete yard block {yard.code}?{" "}
                {yard.occupiedCount > 0 && (
                  <span className="block font-normal mt-0.5 text-brick/90">
                    Warning: this yard currently has {yard.occupiedCount} {unitLabel} recorded.
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-[8px] bg-paper px-3 py-1.5 font-semibold text-slate hover:text-ink transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteYardAction(yard.id);
                  if (onClose) onClose();
                }}
                className="rounded-[8px] bg-brick px-3.5 py-1.5 font-semibold text-white shadow-sm hover:bg-brick/90 active:scale-95 transition-all"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="flex items-center justify-center gap-1.5 w-full rounded-[9px] border border-hairline bg-paper py-2 text-[12px] font-semibold text-brick/80 hover:bg-brick-soft hover:text-brick transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Yard Block
          </button>
        )}
      </div>
    </Panel>
  );
});
