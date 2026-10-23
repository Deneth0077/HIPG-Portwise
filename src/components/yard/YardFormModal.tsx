import { memo } from "react";
import { AlertCircle, Check, MapPin, X, RotateCw } from "lucide-react";
import { useYardManagement } from "@/state/YardManagementProvider";
import {
  YARD_TYPE_LABELS,
  CAPACITY_UNIT_LABELS,
  YARD_STATUS_LABELS,
  type YardType,
  type CapacityUnit,
  type YardStatus,
} from "@/data/yardTypes";

export const YardFormModal = memo(function YardFormModal() {
  const {
    isModalOpen,
    modalMode,
    yardForm,
    setYardForm,
    formError,
    closeModal,
    saveYardForm,
    startPickingLocation,
  } = useYardManagement();

  if (!isModalOpen || !yardForm) return null;

  const isCreate = modalMode === "create";

  const onTypeChange = (newType: YardType) => {
    // Automatically configure sensible defaults based on yard type
    let autoUnit: CapacityUnit = "slots";
    let defaultCap = 1200;

    if (newType === "container") {
      autoUnit = "teu";
      defaultCap = 1400;
    } else if (newType === "reefer") {
      autoUnit = "teu";
      defaultCap = 600;
    } else if (newType === "customs") {
      autoUnit = "slots";
      defaultCap = 450;
    }

    setYardForm({
      ...yardForm,
      yardType: newType,
      capacityUnit: autoUnit,
      totalCapacity: defaultCap,
      occupiedCount: Math.min(yardForm.occupiedCount, defaultCap),
    });
  };

  const freeCapacity = Math.max(0, yardForm.totalCapacity - yardForm.occupiedCount);
  const utilization = yardForm.totalCapacity > 0
    ? Math.round((yardForm.occupiedCount / yardForm.totalCapacity) * 1000) / 10
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="yard-modal-title"
        className="relative flex max-h-[92vh] w-full max-w-[560px] flex-col rounded-[16px] border border-hairline bg-paper p-5 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hairline pb-3.5">
          <div>
            <h2 id="yard-modal-title" className="text-[17px] font-bold text-ink">
              {isCreate ? "Create New Yard Block" : `Edit Yard Block ${yardForm.code}`}
            </h2>
            <p className="text-[12px] text-slate mt-0.5">
              Configure operational parameters, 3D footprint, and capacity units
            </p>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="grid h-9 w-9 place-items-center rounded-[10px] text-slate hover:bg-sand hover:text-ink transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Error Banner */}
        {formError && (
          <div className="mt-3 flex items-center gap-2 rounded-[10px] bg-brick-soft p-3 text-[12.5px] font-medium text-brick">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="scroll-thin mt-4 flex-1 space-y-4 overflow-y-auto pr-1">
          {/* Section 1: Identification */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11.5px] font-semibold text-slate uppercase tracking-wider mb-1">
                Yard Code <span className="text-brick">*</span>
              </label>
              <input
                type="text"
                value={yardForm.code}
                onChange={(e) => setYardForm({ ...yardForm, code: e.target.value.toUpperCase() })}
                placeholder="e.g. 05A, CY02"
                className="h-9 w-full rounded-[9px] border border-hairline bg-sand/40 px-3 font-mono text-[13px] font-bold text-ink focus:border-ink focus:bg-paper focus:outline-none"
              />
              <span className="text-[10px] text-slate mt-0.5 block">Unique 3D block identifier</span>
            </div>

            <div>
              <label className="block text-[11.5px] font-semibold text-slate uppercase tracking-wider mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={yardForm.name}
                onChange={(e) => setYardForm({ ...yardForm, name: e.target.value })}
                placeholder="e.g. RoRo Parking Tier 5"
                className="h-9 w-full rounded-[9px] border border-hairline bg-sand/40 px-3 text-[13px] text-ink focus:border-ink focus:bg-paper focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Type, Status & Capacity Unit */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11.5px] font-semibold text-slate uppercase tracking-wider mb-1">
                Yard Type
              </label>
              <select
                value={yardForm.yardType}
                onChange={(e) => onTypeChange(e.target.value as YardType)}
                className="h-9 w-full rounded-[9px] border border-hairline bg-sand/40 px-2 text-[12.5px] font-medium text-ink focus:border-ink focus:bg-paper focus:outline-none"
              >
                {Object.entries(YARD_TYPE_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11.5px] font-semibold text-slate uppercase tracking-wider mb-1">
                Capacity Unit
              </label>
              <select
                value={yardForm.capacityUnit}
                onChange={(e) => setYardForm({ ...yardForm, capacityUnit: e.target.value as CapacityUnit })}
                className="h-9 w-full rounded-[9px] border border-hairline bg-sand/40 px-2 text-[12.5px] font-medium text-ink focus:border-ink focus:bg-paper focus:outline-none"
              >
                {Object.entries(CAPACITY_UNIT_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11.5px] font-semibold text-slate uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={yardForm.status}
                onChange={(e) => setYardForm({ ...yardForm, status: e.target.value as YardStatus })}
                className="h-9 w-full rounded-[9px] border border-hairline bg-sand/40 px-2 text-[12.5px] font-medium text-ink focus:border-ink focus:bg-paper focus:outline-none"
              >
                {Object.entries(YARD_STATUS_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 3: Capacity Calculation Panel */}
          <div className="rounded-[12px] border border-hairline bg-sand/50 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-ink">Capacity & Telemetry Settings</span>
              <span className="font-mono text-[11px] font-semibold text-harbor">
                Unit: {CAPACITY_UNIT_LABELS[yardForm.capacityUnit]}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate mb-1">Total Capacity</label>
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={yardForm.totalCapacity}
                  onChange={(e) => setYardForm({ ...yardForm, totalCapacity: Math.max(1, Number(e.target.value)) })}
                  className="h-9 w-full rounded-[8px] border border-hairline bg-paper px-3 font-mono text-[13px] font-bold text-ink focus:border-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate mb-1">Occupied Count</label>
                <input
                  type="number"
                  min={0}
                  max={yardForm.totalCapacity}
                  value={yardForm.occupiedCount}
                  onChange={(e) => setYardForm({ ...yardForm, occupiedCount: Math.max(0, Number(e.target.value)) })}
                  className="h-9 w-full rounded-[8px] border border-hairline bg-paper px-3 font-mono text-[13px] font-bold text-ink focus:border-ink focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-hairline/60 pt-2 text-[12px]">
              <span>
                Free Capacity: <strong className="font-mono text-moss">{freeCapacity}</strong> {yardForm.capacityUnit}
              </span>
              <span>
                Utilization: <strong className="font-mono text-ink">{utilization}%</strong>
              </span>
            </div>
          </div>

          {/* Section 4: 3D Positioning and Geometry */}
          <div className="space-y-2.5 rounded-[12px] border border-hairline bg-sand/30 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-ink">3D World Placement & Footprint</span>
              <button
                type="button"
                onClick={() => {
                  closeModal();
                  startPickingLocation();
                }}
                className="flex items-center gap-1.5 rounded-[8px] bg-harbor/15 px-2.5 py-1 text-[11px] font-semibold text-harbor hover:bg-harbor/25 transition-colors"
                title="Click on the 3D ground plane to pick location"
              >
                <MapPin className="h-3 w-3" />
                Pick on 3D Map
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate mb-1">Position X (East-West)</label>
                <input
                  type="number"
                  value={yardForm.position.x}
                  onChange={(e) => setYardForm({ ...yardForm, position: { ...yardForm.position, x: Number(e.target.value) } })}
                  className="h-9 w-full rounded-[8px] border border-hairline bg-paper px-3 font-mono text-[12.5px] text-ink focus:border-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate mb-1">Position Z (North-South)</label>
                <input
                  type="number"
                  value={yardForm.position.z}
                  onChange={(e) => setYardForm({ ...yardForm, position: { ...yardForm.position, z: Number(e.target.value) } })}
                  className="h-9 w-full rounded-[8px] border border-hairline bg-paper px-3 font-mono text-[12.5px] text-ink focus:border-ink focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate mb-1">Width (m)</label>
                <input
                  type="number"
                  min={5}
                  max={300}
                  value={yardForm.width}
                  onChange={(e) => setYardForm({ ...yardForm, width: Math.max(5, Number(e.target.value)) })}
                  className="h-9 w-full rounded-[8px] border border-hairline bg-paper px-3 font-mono text-[12.5px] text-ink focus:border-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate mb-1">Length / Depth (m)</label>
                <input
                  type="number"
                  min={4}
                  max={300}
                  value={yardForm.length}
                  onChange={(e) => setYardForm({ ...yardForm, length: Math.max(4, Number(e.target.value)) })}
                  className="h-9 w-full rounded-[8px] border border-hairline bg-paper px-3 font-mono text-[12.5px] text-ink focus:border-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate mb-1">Rotation (°)</label>
                <input
                  type="number"
                  min={0}
                  max={360}
                  value={yardForm.rotation || 0}
                  onChange={(e) => setYardForm({ ...yardForm, rotation: Number(e.target.value) % 360 })}
                  className="h-9 w-full rounded-[8px] border border-hairline bg-paper px-3 font-mono text-[12.5px] text-ink focus:border-ink focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Operational Notes */}
          <div>
            <label className="block text-[11.5px] font-semibold text-slate uppercase tracking-wider mb-1">
              Operational Notes
            </label>
            <textarea
              rows={2}
              value={yardForm.notes || ""}
              onChange={(e) => setYardForm({ ...yardForm, notes: e.target.value })}
              placeholder="e.g. Dedicated for car carriers, MTV inspection, or IMDG segregation..."
              className="w-full rounded-[9px] border border-hairline bg-sand/40 p-2.5 text-[12.5px] text-ink placeholder:text-slate focus:border-ink focus:bg-paper focus:outline-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 flex items-center justify-end gap-2 border-t border-hairline pt-3.5">
          <button
            type="button"
            onClick={closeModal}
            className="rounded-[9px] border border-hairline px-4 py-2 text-[13px] font-semibold text-slate hover:bg-sand hover:text-ink transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              const res = saveYardForm();
              if (!res.success && res.error) {
                // error displayed in banner
              }
            }}
            className="flex items-center gap-1.5 rounded-[9px] bg-ink px-5 py-2 text-[13px] font-semibold text-paper shadow-sm hover:bg-ink/90 active:scale-95 transition-all"
          >
            <Check className="h-4 w-4" />
            {isCreate ? "Create Yard Block" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
});
