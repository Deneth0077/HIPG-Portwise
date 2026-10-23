import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Boxes,
  Car,
  Check,
  ChevronRight,
  Copy,
  Cpu,
  Edit3,
  Layers,
  MapPin,
  Package,
  Scale,
  Ship,
  Snowflake,
  X,
  Compass,
} from "lucide-react";
import { HudLayout } from "@/components/hud/HudLayout";
import { DefRow, IconButton, Panel, ProgressBar, StatusChip, type Tone } from "@/components/hud/primitives";
import { CATEGORY_LABEL, vesselById } from "@/data/port";
import { containerById } from "@/data/containers";
import type { Container } from "@/data/types";
import { cn } from "@/lib/utils";
import { usePort } from "@/state/PortProvider";
import { useYardManagement } from "@/state/YardManagementProvider";
import { CapacityDashboard } from "@/components/yard/CapacityDashboard";
import { YardDetailsPanel, yardFillTone } from "@/components/yard/YardDetailsPanel";
import { YardFormModal } from "@/components/yard/YardFormModal";
import { Yard3DControls } from "@/components/yard/Yard3DControls";
import { CAPACITY_UNIT_LABELS, YARD_TYPE_LABELS, type YardBlockConfig } from "@/data/yardTypes";

const nf = new Intl.NumberFormat("en-US");

function YardList() {
  const { filteredYards, selectedYardId, selectYard, focusOnYard, openEditModal } = useYardManagement();
  const { setHovered } = usePort();
  const navigate = useNavigate();

  return (
    <Panel className="flex min-h-0 flex-col p-3.5 space-y-3" aria-label="HIPG Yard Management">
      {/* Top Capacity Dashboard */}
      <CapacityDashboard />

      {/* Yard Blocks List Header */}
      <div className="flex items-center justify-between border-t border-hairline/70 pt-2.5 px-0.5 text-[12px]">
        <span className="font-semibold text-ink flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-slate" /> Yard Blocks
        </span>
        <span className="font-mono text-slate text-[11px]">{filteredYards.length} matching</span>
      </div>

      {/* Yard Blocks List */}
      <ul className="scroll-thin min-h-0 flex-1 overflow-y-auto space-y-1.5 pr-0.5">
        {filteredYards.length === 0 ? (
          <li className="p-6 text-center text-[12.5px] text-slate">
            No yard blocks match your search or filter.
          </li>
        ) : (
          filteredYards.map((yard) => {
            const active = yard.id === selectedYardId;
            const fillRatio = yard.totalCapacity > 0 ? yard.occupiedCount / yard.totalCapacity : 0;
            const isRoRo = yard.capacityUnit === "slots" || yard.yardType === "roro";
            const unitName = CAPACITY_UNIT_LABELS[yard.capacityUnit];

            return (
              <li key={yard.id}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    selectYard(yard.id);
                    focusOnYard(yard);
                    navigate(`/yard/${yard.id}`);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      selectYard(yard.id);
                      focusOnYard(yard);
                      navigate(`/yard/${yard.id}`);
                    }
                  }}
                  onMouseEnter={() => setHovered({ kind: "block", id: yard.id })}
                  onMouseLeave={() => setHovered(null)}
                  className={cn(
                    "group flex cursor-pointer items-center gap-2.5 rounded-[12px] border p-2.5 transition-all text-left",
                    active
                      ? "border-signal/70 bg-signal-soft/60 shadow-sm"
                      : "border-hairline/80 bg-paper hover:border-slate/30 hover:bg-sand/60"
                  )}
                >
                  {/* Left Column: Code & Type Icon */}
                  <div className="flex w-[62px] shrink-0 flex-col">
                    <span className="font-mono text-[14px] font-bold leading-tight text-ink group-hover:text-signal transition-colors">
                      {yard.code}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-slate mt-0.5 truncate">
                      {isRoRo ? (
                        <Car className="h-3 w-3 shrink-0 text-[#1B4D3E]" />
                      ) : (
                        <Boxes className="h-3 w-3 shrink-0 text-harbor" />
                      )}
                      <span className="truncate">{YARD_TYPE_LABELS[yard.yardType]}</span>
                    </span>
                  </div>

                  {/* Middle Column: Progress bar, occupancy count, free count */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-ink truncate pr-2">
                        {yard.name}
                      </span>
                      <span className="font-mono font-bold text-ink tnum shrink-0">
                        {yard.utilizationPercentage}%
                      </span>
                    </div>

                    <ProgressBar value={fillRatio} tone={yardFillTone(fillRatio)} height="h-1.5" />

                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate">
                      <span className="font-mono tnum">
                        {nf.format(yard.occupiedCount)} / {nf.format(yard.totalCapacity)} {isRoRo ? "slots" : "TEU"}
                      </span>
                      <span className="shrink-0 font-medium">
                        Free: <strong className="font-mono text-moss">{nf.format(yard.freeCapacity)}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Edit button & Arrow */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      title={`Edit capacity of ${yard.code}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(yard);
                      }}
                      className="opacity-75 hover:opacity-100 p-1.5 rounded-[7px] text-slate hover:text-ink hover:bg-sand transition-all"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <ChevronRight className="h-4 w-4 text-slate transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </Panel>
  );
}

function ContainerCard({ c }: { c: Container }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState<boolean>(false);
  const vessel = vesselById(c.vesselId);
  const copy = () => {
    void navigator.clipboard?.writeText(c.id).catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };
  const customsTone: Tone = c.customs === "Cleared" ? "moss" : c.customs === "Inspection hold" ? "amber" : "harbor";

  return (
    <Panel className="w-full p-4" aria-label={`Container ${c.code}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-ink">Container details</h2>
        <Link to={`/yard/${c.blockId}`} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-[10px] text-ink hover:bg-sand">
          <X className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <p className="font-mono text-[25px] font-bold tracking-wide text-ink">{c.code}</p>
        <IconButton label={copied ? "Copied" : "Copy container number"} onClick={copy} className="ml-auto h-8 w-8">
          {copied ? <Check className="h-3.5 w-3.5 text-moss" /> : <Copy className="h-3.5 w-3.5 text-ink" />}
        </IconButton>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <StatusChip tone="harbor" dot={false}>
          {c.size} · {CATEGORY_LABEL[c.category]}
        </StatusChip>
        <StatusChip tone="slate" dot={false}>
          {c.line}
        </StatusChip>
      </div>
      <dl className="mt-3">
        <DefRow label={<span className="inline-flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />Position</span>}>{c.position}</DefRow>
        <DefRow label={<span className="inline-flex items-center gap-2"><Cpu className="h-3.5 w-3.5" />Cargo</span>} mono={false}>{c.cargo}</DefRow>
        <DefRow label={<span className="inline-flex items-center gap-2"><Scale className="h-3.5 w-3.5" />Gross weight</span>}>{nf.format(c.weight)} kg</DefRow>
        <DefRow label={<span className="inline-flex items-center gap-2"><Ship className="h-3.5 w-3.5" />Vessel</span>} mono={false}>
          {vessel ? (
            <Link to={`/vessels/${vessel.id}`} className="text-harbor hover:underline">
              {vessel.name}
            </Link>
          ) : (
            "—"
          )}
        </DefRow>
        <DefRow label={<span className="inline-flex items-center gap-2"><Package className="h-3.5 w-3.5" />Customs</span>} mono={false}>
          <StatusChip tone={customsTone}>{c.customs}</StatusChip>
        </DefRow>
      </dl>
      <button
        type="button"
        onClick={() => navigate(`/shipments/${c.shipmentId}`)}
        className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[11px] bg-ink text-[14px] font-semibold text-paper transition-transform hover:bg-ink/90 active:scale-[0.98]"
      >
        View journey <ArrowRight className="h-4 w-4" />
      </button>
    </Panel>
  );
}

export default function Yard() {
  const { blockId } = useParams();
  const [params] = useSearchParams();
  const cId = params.get("c");
  const container = cId ? containerById(cId) : undefined;

  const { yards, selectedYard, selectYard } = useYardManagement();
  const { setPageSelection, setView } = usePort();
  const navigate = useNavigate();

  // Sync route param with selection
  useEffect(() => {
    setView("yard");
    if (blockId) {
      selectYard(blockId);
      setPageSelection({ kind: "block", id: blockId });
    } else if (container) {
      setPageSelection({ kind: "container", id: container.id });
    } else {
      setPageSelection(null);
    }
  }, [blockId, container, selectYard, setPageSelection, setView]);

  const activeYard = useMemo(() => {
    if (blockId) return yards.find((y) => y.id === blockId) ?? null;
    return selectedYard;
  }, [blockId, yards, selectedYard]);

  const right = container ? (
    <ContainerCard c={container} />
  ) : activeYard ? (
    <YardDetailsPanel
      yard={activeYard}
      onClose={() => {
        selectYard(null);
        navigate("/yard");
      }}
    />
  ) : undefined;

  return (
    <>
      <HudLayout
        wideLeft
        left={<YardList />}
        right={right}
        sheetOrder={["right", "left"]}
      />
      <YardFormModal />
      <Yard3DControls />
    </>
  );
}
