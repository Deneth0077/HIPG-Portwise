import { memo } from "react";
import {
  Car,
  Box,
  Video,
  Building2,
  ShieldCheck,
  Shield,
  Route,
  Zap,
  RotateCw,
  X,
  Plus,
  Info,
  Crosshair,
} from "lucide-react";
import {
  useInteractiveTwin,
} from "@/state/InteractiveTwinProvider";
import {
  INFRASTRUCTURE_CATEGORIES,
  INFRASTRUCTURE_CATALOG,
  InfrastructureCatalogItem,
  InfrastructureCategory,
} from "@/data/infrastructureCatalog";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<InfrastructureCategory, typeof Car> = {
  roro: Car,
  container: Box,
  cctv: Video,
  buildings: Building2,
  gates: ShieldCheck,
  roads: Route,
  utilities: Zap,
  fences: Shield,
};

export const ClashBuildDock = memo(function ClashBuildDock() {
  const {
    mode,
    activeCategory,
    setActiveCategory,
    activeBuildItem,
    startBuild,
    cancelBuild,
    rotateObject,
    buildPreview,
    drawingFenceType,
    isDrawingFenceLine,
    startDrawingFenceLine,
    cancelDrawingFenceLine,
    fenceStartPoint,
    focusCamera,
  } = useInteractiveTwin();

  if (mode !== "build") {
    return null;
  }

  const items = INFRASTRUCTURE_CATALOG.filter((i) => i.category === activeCategory);

  const fenceTypeLabel =
    drawingFenceType === "heavy_mesh"
      ? "Anti-Climb Heavy Security Mesh"
      : drawingFenceType === "wall"
      ? "Precast Concrete Security Wall"
      : "Industrial Chain-Link Fence";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex flex-col items-center gap-2 px-4 animate-in fade-in slide-in-from-bottom-4">
      {/* 1. Free-form 3D Fence Line Drawing Banner */}
      {isDrawingFenceLine && (
        <div className="pointer-events-auto flex items-center gap-3 rounded-[14px] border border-signal/40 bg-paper/95 px-4 py-2.5 shadow-panel backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-signal" />
            </span>
            <div className="leading-tight">
              <p className="text-[12.5px] font-bold text-ink">
                Drawing 3D Fence: <span className="text-signal">{fenceTypeLabel}</span>
              </p>
              <p className="text-[11px] text-slate">
                {fenceStartPoint
                  ? "Move mouse to set length and direction · Click to place fence segment"
                  : "Click anywhere on the 3D map to set Start Point (Point A)"}
              </p>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-hairline" />

          {/* Focus Camera Button */}
          <button
            type="button"
            onClick={focusCamera}
            className="flex items-center gap-1 rounded-[8px] bg-sand px-2.5 py-1.5 text-[11.5px] font-bold text-ink hover:bg-hairline transition-colors"
            title="Focus camera onto active line drawing point (F)"
          >
            <Crosshair className="h-3.5 w-3.5 text-signal" />
            <span>Focus (F)</span>
          </button>

          <button
            type="button"
            onClick={cancelDrawingFenceLine}
            className="flex items-center gap-1 rounded-[8px] border border-hairline px-2.5 py-1.5 text-[11.5px] font-semibold text-slate hover:bg-sand hover:text-ink transition-colors"
            title="Finish Drawing and restore dock (Esc)"
          >
            <X className="h-3.5 w-3.5" />
            <span>Finish (Esc)</span>
          </button>
        </div>
      )}

      {/* 2. Clash of Clans Active Placement Control Bar */}
      {activeBuildItem && !isDrawingFenceLine && (
        <div className="pointer-events-auto flex items-center gap-3 rounded-[14px] border border-signal/40 bg-paper/95 px-4 py-2.5 shadow-panel backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span
                className={cn(
                  "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                  buildPreview?.isValid ? "bg-moss" : "bg-brick"
                )}
              />
              <span
                className={cn(
                  "relative inline-flex rounded-full h-3 w-3",
                  buildPreview?.isValid ? "bg-moss" : "bg-brick"
                )}
              />
            </span>
            <div className="leading-tight">
              <p className="text-[12.5px] font-bold text-ink">
                Placing: <span className="text-signal">{activeBuildItem.name}</span>
              </p>
              <p className="text-[11px] text-slate">
                Move cursor over port land · Click to place · Press{" "}
                <kbd className="rounded bg-sand px-1 font-mono text-[10px] font-semibold text-ink">
                  R
                </kbd>{" "}
                to rotate ·{" "}
                <kbd className="rounded bg-sand px-1 font-mono text-[10px] font-semibold text-ink">
                  F
                </kbd>{" "}
                to focus
              </p>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-hairline" />

          {/* Quick Focus Camera Button */}
          <button
            type="button"
            onClick={focusCamera}
            className="flex items-center gap-1 rounded-[8px] bg-sand px-2.5 py-1.5 text-[11.5px] font-bold text-ink hover:bg-hairline transition-colors"
            title="Focus Camera onto Active Work Point (F)"
          >
            <Crosshair className="h-3.5 w-3.5 text-signal" />
            <span>Focus (F)</span>
          </button>

          {/* Quick Rotate Buttons */}
          <button
            type="button"
            onClick={() => rotateObject(45)}
            className="flex items-center gap-1 rounded-[8px] bg-sand px-2.5 py-1.5 text-[11.5px] font-bold text-ink hover:bg-hairline transition-colors"
            title="Rotate 45° Clockwise (R)"
          >
            <RotateCw className="h-3.5 w-3.5 text-signal" />
            <span>Rotate 45°</span>
          </button>

          {/* Cancel Placement Button */}
          <button
            type="button"
            onClick={cancelBuild}
            className="flex items-center gap-1 rounded-[8px] border border-hairline px-2.5 py-1.5 text-[11.5px] font-semibold text-slate hover:bg-sand hover:text-ink transition-colors"
            title="Cancel Placement (Esc)"
          >
            <X className="h-3.5 w-3.5" />
            <span>Cancel</span>
          </button>
        </div>
      )}

      {/* 3. Clash of Clans Bottom Infrastructure Dock (Hidden while drawing fence line or placing an object to keep the 3D map completely clear!) */}
      {!isDrawingFenceLine && !activeBuildItem && (
        <div className="pointer-events-auto flex w-full max-w-4xl flex-col rounded-[18px] border border-hairline/90 bg-paper/95 p-2 shadow-panel backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
        {/* Category Tabs Header */}
        <div className="flex items-center justify-between border-b border-hairline/60 pb-2">
          <div className="scroll-thin flex items-center gap-1 overflow-x-auto">
            {INFRASTRUCTURE_CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id] || Box;
              const isActive = activeCategory === cat.id;
              const count = INFRASTRUCTURE_CATALOG.filter((i) => i.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat.id);
                    cancelBuild();
                    cancelDrawingFenceLine();
                  }}
                  className={cn(
                    "flex items-center gap-1.5 whitespace-nowrap rounded-[10px] px-3 py-1.5 text-[12px] font-bold transition-all",
                    isActive
                      ? "bg-signal text-white shadow-xs"
                      : "text-ink/75 hover:bg-sand hover:text-ink"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{cat.shortLabel}</span>
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.2 text-[10px] font-mono",
                      isActive ? "bg-white/20 text-white" : "bg-sand text-slate"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <span className="hidden items-center gap-1 text-[11px] font-medium text-slate sm:flex">
            <Info className="h-3 w-3" /> Select object to place in 3D
          </span>
        </div>

        {/* Building Cards Carousel / Horizontal Grid */}
        <div className="scroll-thin mt-2 flex items-stretch gap-2.5 overflow-x-auto pb-1">
          {items.map((item) => {
            const isSelected = activeBuildItem?.id === item.id;
            const Icon = CATEGORY_ICONS[item.category] || Box;

            const isFence = item.category === "fences";
            const handleItemClick = () => {
              if (isFence) {
                cancelBuild();
                startDrawingFenceLine(item.subType as any);
              } else {
                cancelDrawingFenceLine();
                startBuild(item);
              }
            };

            return (
              <div
                key={item.id}
                onClick={handleItemClick}
                className={cn(
                  "group relative flex w-[230px] shrink-0 cursor-pointer flex-col justify-between rounded-[12px] border p-2.5 transition-all hover:scale-[1.02]",
                  isSelected
                    ? "border-signal bg-signal-soft/40 ring-2 ring-signal/30"
                    : "border-hairline bg-card/60 hover:border-signal/50 hover:bg-sand/40"
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-1.5">
                    <div
                      className="grid h-8 w-8 place-items-center rounded-[8px] text-white shadow-xs"
                      style={{ backgroundColor: item.accentColor }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="font-mono text-[10px] font-bold text-slate">
                        {isFence ? "Custom Line Path" : `${item.width}m × ${item.length}m`}
                      </span>
                      {item.capacity && (
                        <span className="rounded bg-moss/10 px-1 font-mono text-[9.5px] font-bold text-moss">
                          {item.capacity} {item.capacityUnit?.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="mt-2 text-[12.5px] font-bold text-ink line-clamp-1 group-hover:text-signal transition-colors">
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-[10.5px] leading-tight text-slate line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="mt-2.5 flex items-center justify-between border-t border-hairline/60 pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate">
                    {item.category}
                  </span>
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-1 rounded-[6px] px-2 py-1 text-[11px] font-bold transition-colors",
                      isSelected
                        ? "bg-signal text-white"
                        : "bg-sand text-ink group-hover:bg-signal group-hover:text-white"
                    )}
                  >
                    {isFence ? <Route className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                    <span>{isFence ? "Draw Line" : "Place"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}
    </div>
  );
});

