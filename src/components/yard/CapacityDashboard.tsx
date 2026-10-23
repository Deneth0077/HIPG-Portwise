import { memo } from "react";
import {
  Boxes,
  Car,
  CheckCircle2,
  Clock,
  Layers,
  Percent,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Wrench,
  Search,
  ArrowUpDown,
  Move,
} from "lucide-react";
import { useYardManagement, type YardSortBy } from "@/state/YardManagementProvider";
import { YARD_TYPE_LABELS, type YardType } from "@/data/yardTypes";
import { cn } from "@/lib/utils";

const nf = new Intl.NumberFormat("en-US");

const TYPE_FILTER_TABS: Array<{ id: YardType | "all"; label: string; icon?: React.ReactNode }> = [
  { id: "all", label: "All Yards" },
  { id: "roro", label: "RoRo Cargo", icon: <Car className="h-3.5 w-3.5" /> },
  { id: "container", label: "Container", icon: <Boxes className="h-3.5 w-3.5" /> },
  { id: "reefer", label: "Reefer" },
  { id: "customs", label: "Customs" },
  { id: "dual_purpose", label: "Dual-Purpose" },
];

import { useBuildingManagement } from "@/state/BuildingManagementProvider";
import { Building2 } from "lucide-react";

export const CapacityDashboard = memo(function CapacityDashboard() {
  const {
    dashboardMetrics,
    typeFilter,
    setTypeFilter,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    openCreateModal,
    is3DEditMode,
    setIs3DEditMode,
    resetLayoutAction,
  } = useYardManagement();

  const { openAddModal } = useBuildingManagement();

  const { roro, container, overallUtilization, totalYards, activeYards, fullYards, maintenanceYards } =
    dashboardMetrics;

  return (
    <div className="space-y-3">
      {/* Top Header & Quick Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-ink" />
          <div>
            <h1 className="text-[16px] font-bold text-ink leading-none">HIPG Yard Capacity Dashboard</h1>
            <p className="text-[11px] text-slate mt-0.5">
              Configurable digital twin yard allocation & live utilization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIs3DEditMode(!is3DEditMode)}
            className={cn(
              "flex items-center gap-1.5 rounded-[9px] px-2.5 py-1.5 text-[12px] font-semibold transition-all shadow-sm",
              is3DEditMode
                ? "bg-signal text-white shadow-signal/30 ring-2 ring-signal/25"
                : "bg-paper text-ink border border-hairline hover:bg-sand"
            )}
            title="Toggle 3D interactive transform and placement mode on the yard map"
          >
            <Move className="h-3.5 w-3.5" />
            {is3DEditMode ? "Exit 3D Edit" : "3D Map Edit"}
          </button>

          <button
            type="button"
            onClick={() => openCreateModal()}
            className="flex items-center gap-1.5 rounded-[9px] bg-ink px-2.5 py-1.5 text-[12px] font-semibold text-paper shadow-sm hover:bg-ink/90 active:scale-95 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Yard
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-1.5 rounded-[9px] border border-hairline bg-paper px-2.5 py-1.5 text-[12px] font-semibold text-ink shadow-sm hover:bg-sand transition-all"
            title="Add a new warehouse, office, or workshop to the 3D map"
          >
            <Building2 className="h-3.5 w-3.5 text-slate" />
            + Building
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm("Reset all yards back to the authoritative 2024.09 HIPG Master Plan layout? Any custom blocks will be reset.")) {
                resetLayoutAction();
              }
            }}
            title="Reset to authoritative default HIPG layout"
            className="grid h-8 w-8 place-items-center rounded-[9px] border border-hairline bg-paper text-slate hover:text-ink hover:bg-sand transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid - Spacious 2-Column Grid with zero overlapping text */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* RoRo Capacity Card */}
        <div className="rounded-[12px] border border-hairline bg-paper p-3 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate">
              <span className="text-[11px] font-semibold uppercase tracking-wider">RoRo Parking</span>
              <Car className="h-4 w-4 text-[#1B4D3E]" />
            </div>
            <div className="mt-1.5 flex items-baseline justify-between gap-1">
              <div className="font-mono text-[17px] font-bold text-ink leading-tight">
                {nf.format(roro.occupiedSlots)}{" "}
                <span className="text-[11px] font-normal text-slate">/ {nf.format(roro.totalSlots)}</span>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[10.5px] font-bold leading-none",
                  roro.utilization >= 90
                    ? "bg-brick-soft text-brick"
                    : roro.utilization >= 75
                    ? "bg-amber-soft text-amber-700"
                    : "bg-moss-soft text-moss"
                )}
              >
                {roro.utilization}%
              </span>
            </div>
            {/* Visual Mini Progress Bar */}
            <div className="mt-2 h-1.5 w-full rounded-full bg-sand overflow-hidden">
              <div
                className="h-full rounded-full bg-moss transition-all duration-500"
                style={{ width: `${Math.min(100, roro.utilization)}%` }}
              />
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate border-t border-hairline/60 pt-1.5">
            <span>Free: <strong className="font-mono text-moss">{nf.format(roro.freeSlots)}</strong> slots</span>
            <span className="font-mono text-slate">{roro.yardCount} blocks</span>
          </div>
        </div>

        {/* Container Capacity Card */}
        <div className="rounded-[12px] border border-hairline bg-paper p-3 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Container Stacks</span>
              <Boxes className="h-4 w-4 text-harbor" />
            </div>
            <div className="mt-1.5 flex items-baseline justify-between gap-1">
              <div className="font-mono text-[17px] font-bold text-ink leading-tight">
                {nf.format(container.occupiedTeu)}{" "}
                <span className="text-[11px] font-normal text-slate">/ {nf.format(container.totalTeu)} TEU</span>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[10.5px] font-bold leading-none",
                  container.utilization >= 90
                    ? "bg-brick-soft text-brick"
                    : container.utilization >= 75
                    ? "bg-amber-soft text-amber-700"
                    : "bg-moss-soft text-moss"
                )}
              >
                {container.utilization}%
              </span>
            </div>
            {/* Visual Mini Progress Bar */}
            <div className="mt-2 h-1.5 w-full rounded-full bg-sand overflow-hidden">
              <div
                className="h-full rounded-full bg-signal transition-all duration-500"
                style={{ width: `${Math.min(100, container.utilization)}%` }}
              />
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate border-t border-hairline/60 pt-1.5">
            <span>Free: <strong className="font-mono text-moss">{nf.format(container.freeTeu)}</strong> TEU</span>
            <span className="font-mono text-slate">{container.yardCount} blocks</span>
          </div>
        </div>

        {/* Total Utilization Card */}
        <div className="rounded-[12px] border border-hairline bg-paper p-3 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Overall Port Yard</span>
              <Percent className="h-4 w-4 text-signal" />
            </div>
            <div className="mt-1.5 flex items-baseline justify-between gap-1">
              <span className="font-mono text-[20px] font-bold text-ink">{overallUtilization}%</span>
              <span className="rounded-full bg-signal-soft px-1.5 py-0.5 font-mono text-[10.5px] font-bold text-signal">
                Live Twin
              </span>
            </div>
            {/* Visual Mini Progress Bar */}
            <div className="mt-2 h-1.5 w-full rounded-full bg-sand overflow-hidden">
              <div
                className="h-full rounded-full bg-signal transition-all duration-500"
                style={{ width: `${Math.min(100, overallUtilization)}%` }}
              />
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate border-t border-hairline/60 pt-1.5">
            <span>Total: <strong className="text-ink">{totalYards} Yards</strong></span>
            <span className="text-moss flex items-center gap-1 font-semibold">
              <CheckCircle2 className="h-3 w-3" /> {activeYards} Active
            </span>
          </div>
        </div>

        {/* Yard Health / Status Card */}
        <div className="rounded-[12px] border border-hairline bg-paper p-3 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Yard Status</span>
              <SlidersHorizontal className="h-4 w-4 text-slate" />
            </div>
            <div className="mt-2 flex items-center justify-between gap-1 text-[11px]">
              <div className="flex items-center gap-1 rounded-[6px] bg-moss-soft/60 px-1.5 py-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-moss" />
                <span className="text-slate font-medium">Act:</span>
                <strong className="font-mono text-moss">{activeYards}</strong>
              </div>
              <div className="flex items-center gap-1 rounded-[6px] bg-sand px-1.5 py-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brick" />
                <span className="text-slate font-medium">Full:</span>
                <strong className="font-mono text-ink">{fullYards}</strong>
              </div>
              <div className="flex items-center gap-1 rounded-[6px] bg-sand px-1.5 py-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-slate" />
                <span className="text-slate font-medium">Mnt:</span>
                <strong className="font-mono text-ink">{maintenanceYards}</strong>
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-hairline/60 pt-1.5 text-[10.5px] text-slate">
            <span>Telemetry:</span>
            <span className="font-semibold text-harbor">Manual & Live</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-2 pt-1">
        {/* Type Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
          {TYPE_FILTER_TABS.map((tab) => {
            const isActive = typeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTypeFilter(tab.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-[9px] px-2.5 py-1 text-[11.5px] font-semibold transition-all",
                  isActive
                    ? "bg-ink text-paper shadow-sm"
                    : "bg-sand/70 text-slate hover:bg-sand hover:text-ink"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search & Sort Row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search yard code or name (e.g. 02A, Customs, H01)..."
              className="h-8 w-full rounded-[8px] border border-hairline bg-sand/40 pl-8 pr-3 text-[12px] text-ink placeholder:text-slate focus:border-ink focus:bg-paper focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as YardSortBy)}
              className="h-8 rounded-[8px] border border-hairline bg-paper px-2 text-[11.5px] font-medium text-ink focus:border-ink focus:outline-none"
            >
              <option value="code">Sort: Code</option>
              <option value="occupancy">Sort: Occupancy %</option>
              <option value="free">Sort: Free Slots/TEU</option>
              <option value="total">Sort: Total Capacity</option>
            </select>

            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="grid h-8 w-8 place-items-center rounded-[8px] border border-hairline bg-paper text-slate hover:text-ink hover:bg-sand transition-colors"
              title={`Order: ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
