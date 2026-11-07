import { memo } from "react";
import {
  Eye,
  Hammer,
  RotateCcw,
  RotateCw,
  Save,
  Sliders,
  Undo2,
  Redo2,
  Grid,
  RefreshCw,
  Check,
  AlertTriangle,
} from "lucide-react";
import { useInteractiveTwin, TwinInteractionMode } from "@/state/InteractiveTwinProvider";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const TwinModeToolbar = memo(function TwinModeToolbar() {
  const {
    mode,
    setMode,
    snapGrid,
    setSnapGrid,
    undoStack,
    redoStack,
    undo,
    redo,
    saveLayout,
    resetLayout,
    isResetConfirmOpen,
    setIsResetConfirmOpen,
  } = useInteractiveTwin();

  const MODES: Array<{
    id: TwinInteractionMode;
    label: string;
    icon: typeof Eye;
    badge: string;
    shortcut: string;
  }> = [
    { id: "view", label: "View", icon: Eye, badge: "Port Twin", shortcut: "1" },
    { id: "edit", label: "Edit", icon: Sliders, badge: "Move & Resize", shortcut: "2" },
    { id: "build", label: "Build", icon: Hammer, badge: "Add Infrastructure", shortcut: "3" },
  ];

  return (
    <>
      <div className="pointer-events-auto flex items-center gap-1.5 rounded-[12px] border border-hairline/80 bg-paper/95 p-1 shadow-panel backdrop-blur-md">
        {/* Mode Switcher Segmented Control */}
        <div className="flex items-center gap-0.5 rounded-[9px] bg-sand/60 p-0.5">
          {MODES.map((m) => {
            const isActive = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                title={`${m.label} Mode (Press '${m.shortcut}')`}
                className={cn(
                  "flex items-center gap-1.5 rounded-[7px] px-2.5 py-1 text-[12px] font-bold transition-all",
                  isActive
                    ? "bg-signal text-white shadow-xs"
                    : "text-ink/80 hover:bg-paper hover:text-ink"
                )}
              >
                <m.icon className="h-3.5 w-3.5 shrink-0" />
                <span>{m.label}</span>
                <span
                  className={cn(
                    "ml-0.5 rounded px-1 py-0.2 font-mono text-[9px] font-semibold uppercase",
                    isActive ? "bg-white/20 text-white" : "bg-sand text-slate"
                  )}
                >
                  {m.shortcut}
                </span>
              </button>
            );
          })}
        </div>

        <div className="h-5 w-[1px] bg-hairline" />

        {/* Grid Snapping Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger
            type="button"
            className="flex items-center gap-1.5 rounded-[7px] px-2 py-1 text-[12px] font-semibold text-ink/80 hover:bg-sand transition-colors"
            title="Grid Snapping Precision"
          >
            <Grid className="h-3.5 w-3.5 text-slate" />
            <span className="font-mono text-[11px] font-bold">
              {snapGrid === 0 ? "Free" : `${snapGrid}m`}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel className="text-[11px] text-slate uppercase">
              Grid Snapping
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setSnapGrid(0)} className="font-medium text-[12px]">
              Free Positioning (0m)
              {snapGrid === 0 && <Check className="ml-auto h-3.5 w-3.5 text-signal" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSnapGrid(1)} className="font-medium text-[12px]">
              Fine Grid (1m)
              {snapGrid === 1 && <Check className="ml-auto h-3.5 w-3.5 text-signal" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSnapGrid(5)} className="font-medium text-[12px]">
              Medium Grid (5m)
              {snapGrid === 5 && <Check className="ml-auto h-3.5 w-3.5 text-signal" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSnapGrid(10)} className="font-medium text-[12px]">
              Coarse Grid (10m)
              {snapGrid === 10 && <Check className="ml-auto h-3.5 w-3.5 text-signal" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-5 w-[1px] bg-hairline" />

        {/* Undo & Redo Controls */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={undo}
            disabled={undoStack.length === 0}
            title={
              undoStack.length > 0
                ? `Undo: ${undoStack[undoStack.length - 1].description} (Ctrl+Z)`
                : "Undo (Ctrl+Z)"
            }
            className={cn(
              "grid h-7 w-7 place-items-center rounded-[7px] transition-colors",
              undoStack.length > 0
                ? "text-ink hover:bg-sand"
                : "text-slate/40 cursor-not-allowed"
            )}
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={redoStack.length === 0}
            title={
              redoStack.length > 0
                ? `Redo: ${redoStack[redoStack.length - 1].description} (Ctrl+Y)`
                : "Redo (Ctrl+Y)"
            }
            className={cn(
              "grid h-7 w-7 place-items-center rounded-[7px] transition-colors",
              redoStack.length > 0
                ? "text-ink hover:bg-sand"
                : "text-slate/40 cursor-not-allowed"
            )}
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="h-5 w-[1px] bg-hairline" />

        {/* Save Layout Action */}
        <button
          type="button"
          onClick={saveLayout}
          title="Save layout changes to browser persistence"
          className="flex items-center gap-1.5 rounded-[7px] bg-sand px-2.5 py-1 text-[12px] font-bold text-ink hover:bg-hairline transition-colors"
        >
          <Save className="h-3.5 w-3.5 text-signal" />
          <span className="hidden sm:inline">Save</span>
        </button>

        {/* Reset Layout Action */}
        <button
          type="button"
          onClick={() => setIsResetConfirmOpen(true)}
          title="Reset digital twin to HIPG baseline standards"
          className="grid h-7 w-7 place-items-center rounded-[7px] text-slate hover:bg-sand hover:text-brick transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-brick">
              <AlertTriangle className="h-5 w-5" />
              Reset HIPG Digital Twin Layout?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will restore all RoRo yards, container stacking blocks, CCTV surveillance towers,
              buildings, and roads to their original HIPG port reference layout. Any custom
              infrastructure added will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={resetLayout}
              className="bg-brick text-white hover:bg-brick/90"
            >
              Reset to Baseline
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

