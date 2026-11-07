import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { yardRepository } from "@/data/yardRepository";
import { cctvRepository } from "@/data/cctvRepository";
import { buildingRepository } from "@/data/buildingRepository";
import { roadRepository } from "@/data/roadRepository";
import { fenceRepository } from "@/data/fenceRepository";
import type { FenceConfig } from "@/data/fenceTypes";
import { useYardManagement } from "./YardManagementProvider";
import { useCctvManagement } from "./CctvManagementProvider";
import { useBuildingManagement } from "./BuildingManagementProvider";
import { useRoadManagement } from "./RoadManagementProvider";
import {
  INFRASTRUCTURE_CATALOG,
  InfrastructureCatalogItem,
  InfrastructureCategory,
} from "@/data/infrastructureCatalog";
import { validatePortPlacement } from "@/lib/placementValidation";
import { haptic } from "@/lib/haptics";
import { cameraApi } from "@/three/CameraRig";

export type TwinInteractionMode = "view" | "edit" | "build";

export interface SelectedTwinObject {
  id: string;
  category: "yard" | "cctv" | "building" | "road" | "fence" | "vessel" | "crane" | "truck" | "facility";
  name: string;
  position: { x: number; y: number; z: number };
  rotation: number;
  dimensions: { width: number; length: number; height?: number };
  data?: any;
}

export interface TwinHistoryAction {
  id: string;
  type: "move" | "rotate" | "resize" | "add" | "delete" | "duplicate" | "edit";
  description: string;
  undo: () => void;
  redo: () => void;
}

export const [InteractiveTwinProvider, useInteractiveTwin] = createContextHook(() => {
  const yardMgr = useYardManagement();
  const cctvMgr = useCctvManagement();
  const bldMgr = useBuildingManagement();
  const roadMgr = useRoadManagement();

  // 1. Interaction Mode: View (Default) | Edit | Build
  const [mode, setModeState] = useState<TwinInteractionMode>("view");

  // 2. Grid Snapping: 0 (Free) | 1 (1m) | 5 (5m) | 10 (10m)
  const [snapGrid, setSnapGrid] = useState<number>(1);

  // 3. Build Mode State
  const [activeCategory, setActiveCategory] = useState<InfrastructureCategory>("roro");
  const [activeBuildItem, setActiveBuildItem] = useState<InfrastructureCatalogItem | null>(null);
  const [buildPreview, setBuildPreview] = useState<{
    x: number;
    z: number;
    rotation: number;
    isValid: boolean;
    reason?: string;
  } | null>(null);

  // 4. Edit / Selected Object State
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SelectedTwinObject["category"] | null>(null);

  // 5. Undo & Redo History Stacks
  const [undoStack, setUndoStack] = useState<TwinHistoryAction[]>([]);
  const [redoStack, setRedoStack] = useState<TwinHistoryAction[]>([]);

  // 6. Reset confirmation dialog visibility
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // 7. Interactive Free-Form 3D Fence Line Drawing State
  const [isDrawingFenceLine, setIsDrawingFenceLine] = useState(false);
  const [fenceStartPoint, setFenceStartPoint] = useState<{ x: number; z: number } | null>(null);
  const [fenceCursorPoint, setFenceCursorPoint] = useState<{ x: number; z: number } | null>(null);
  const [drawingFenceType, setDrawingFenceType] = useState<any>("chainlink");
  const [fencesVersion, setFencesVersion] = useState(0);

  useEffect(() => {
    return fenceRepository.subscribe(() => {
      setFencesVersion((v) => v + 1);
    });
  }, []);

  // Helper to push history action
  const pushAction = useCallback((action: Omit<TwinHistoryAction, "id">) => {
    const fullAction: TwinHistoryAction = {
      ...action,
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setUndoStack((prev) => [...prev.slice(-30), fullAction]);
    setRedoStack([]); // clear redo stack on new action
  }, []);

  // Sync mode changes with underlying providers
  const setMode = useCallback((newMode: TwinInteractionMode) => {
    setModeState(newMode);
    haptic("selection");

    if (newMode === "view") {
      yardMgr.setIs3DEditMode(false);
      cctvMgr.setIsCctvMode(false);
      setActiveBuildItem(null);
      setBuildPreview(null);
      setIsDrawingFenceLine(false);
      setFenceStartPoint(null);
    } else if (newMode === "edit") {
      yardMgr.setIs3DEditMode(true);
      setActiveBuildItem(null);
      setBuildPreview(null);
      setIsDrawingFenceLine(false);
      setFenceStartPoint(null);
    } else if (newMode === "build") {
      yardMgr.setIs3DEditMode(false);
      // Select first item in active category by default if none selected
      if (!activeBuildItem && !isDrawingFenceLine) {
        if (activeCategory === "fences") {
          setIsDrawingFenceLine(true);
          setDrawingFenceType("chainlink");
        } else {
          const first = INFRASTRUCTURE_CATALOG.find((i) => i.category === activeCategory);
          if (first) {
            setActiveBuildItem(first);
          }
        }
      }
    }
  }, [yardMgr, cctvMgr, activeBuildItem, isDrawingFenceLine, activeCategory]);

  // Unified resolution of selected object
  const selectedObject = useMemo<SelectedTwinObject | null>(() => {
    if (!selectedObjectId || !selectedCategory) return null;

    if (selectedCategory === "yard") {
      const y = yardMgr.yards.find((item) => item.id === selectedObjectId);
      if (!y) return null;
      const posX = yardMgr.draftPosition ? yardMgr.draftPosition.x : y.position.x;
      const posZ = yardMgr.draftPosition ? yardMgr.draftPosition.z : y.position.z;
      const w = yardMgr.draftDimensions ? yardMgr.draftDimensions.width : y.width;
      const l = yardMgr.draftDimensions ? yardMgr.draftDimensions.length : y.length;
      const rot = yardMgr.draftDimensions ? yardMgr.draftDimensions.rotation : y.rotation;
      return {
        id: y.id,
        category: "yard",
        name: y.name,
        position: { x: posX, y: 0.1, z: posZ },
        rotation: rot,
        dimensions: { width: w, length: l, height: 1.2 },
        data: y,
      };
    }

    if (selectedCategory === "cctv") {
      const t = cctvMgr.towers.find((item) => item.id === selectedObjectId);
      if (!t) return null;
      const posX = cctvMgr.draftPosition ? cctvMgr.draftPosition.x : t.x;
      const posZ = cctvMgr.draftPosition ? cctvMgr.draftPosition.z : t.z;
      const rot = cctvMgr.draftRotation !== null ? cctvMgr.draftRotation : t.rotation;
      return {
        id: t.id,
        category: "cctv",
        name: t.name,
        position: { x: posX, y: 0, z: posZ },
        rotation: rot,
        dimensions: { width: 4, length: 4, height: t.height },
        data: t,
      };
    }

    if (selectedCategory === "building") {
      const b = bldMgr.buildings.find((item) => item.id === selectedObjectId);
      if (!b) return null;
      const posX = bldMgr.draftPosition ? bldMgr.draftPosition.x : b.x;
      const posZ = bldMgr.draftPosition ? bldMgr.draftPosition.z : b.z;
      const w = bldMgr.draftDimensions ? bldMgr.draftDimensions.width : b.width;
      const d = bldMgr.draftDimensions ? bldMgr.draftDimensions.depth : b.depth;
      const rot = bldMgr.draftDimensions ? bldMgr.draftDimensions.rotation : b.rotation;
      return {
        id: b.id,
        category: "building",
        name: b.name,
        position: { x: posX, y: 0, z: posZ },
        rotation: rot,
        dimensions: { width: w, length: d, height: b.height },
        data: b,
      };
    }

    if (selectedCategory === "road") {
      const r = roadMgr.roads.find((item) => item.id === selectedObjectId);
      if (!r) return null;
      return {
        id: r.id,
        category: "road",
        name: r.name,
        position: { x: r.x, y: 0.05, z: r.z },
        rotation: r.rotation ?? 0,
        dimensions: { width: r.width, length: r.depth, height: 0.1 },
        data: r,
      };
    }

    if (selectedCategory === "fence") {
      const f = fenceRepository.getById(selectedObjectId);
      if (!f) return null;
      return {
        id: f.id,
        category: "fence",
        name: f.name,
        position: { x: f.x, y: 0.05, z: f.z },
        rotation: f.rotation ?? 0,
        dimensions: { width: f.length, length: f.depth, height: f.height },
        data: f,
      };
    }

    return null;
  }, [
    selectedObjectId,
    selectedCategory,
    fencesVersion,
    yardMgr.yards,
    yardMgr.draftPosition,
    yardMgr.draftDimensions,
    cctvMgr.towers,
    cctvMgr.draftPosition,
    cctvMgr.draftRotation,
    bldMgr.buildings,
    bldMgr.draftPosition,
    bldMgr.draftDimensions,
    roadMgr.roads,
  ]);

  // Sync selection from sub-providers
  useEffect(() => {
    if (yardMgr.selectedYardId) {
      setSelectedObjectId(yardMgr.selectedYardId);
      setSelectedCategory("yard");
    }
  }, [yardMgr.selectedYardId]);

  useEffect(() => {
    if (cctvMgr.selectedTowerId) {
      setSelectedObjectId(cctvMgr.selectedTowerId);
      setSelectedCategory("cctv");
    }
  }, [cctvMgr.selectedTowerId]);

  useEffect(() => {
    if (bldMgr.selectedBuildingId) {
      setSelectedObjectId(bldMgr.selectedBuildingId);
      setSelectedCategory("building");
    }
  }, [bldMgr.selectedBuildingId]);

  useEffect(() => {
    if (roadMgr.selectedRoadId) {
      setSelectedObjectId(roadMgr.selectedRoadId);
      setSelectedCategory("road");
    }
  }, [roadMgr.selectedRoadId]);

  // Select an object across all providers
  const selectObject = useCallback((obj: { id: string; category: SelectedTwinObject["category"] } | null) => {
    if (!obj) {
      setSelectedObjectId(null);
      setSelectedCategory(null);
      yardMgr.selectYard(null);
      cctvMgr.selectTower(null);
      bldMgr.selectBuilding(null);
      roadMgr.selectRoad(null);
      return;
    }

    setSelectedObjectId(obj.id);
    setSelectedCategory(obj.category);
    haptic("selection");

    if (obj.category === "yard") {
      yardMgr.selectYard(obj.id);
      cctvMgr.selectTower(null);
      bldMgr.selectBuilding(null);
      roadMgr.selectRoad(null);
    } else if (obj.category === "cctv") {
      cctvMgr.selectTower(obj.id);
      yardMgr.selectYard(null);
      bldMgr.selectBuilding(null);
      roadMgr.selectRoad(null);
    } else if (obj.category === "building") {
      bldMgr.selectBuilding(obj.id);
      yardMgr.selectYard(null);
      cctvMgr.selectTower(null);
      roadMgr.selectRoad(null);
    } else if (obj.category === "road") {
      roadMgr.selectRoad(obj.id);
      yardMgr.selectYard(null);
      cctvMgr.selectTower(null);
      bldMgr.selectBuilding(null);
    }
  }, [yardMgr, cctvMgr, bldMgr, roadMgr]);

  // Start building an item
  const startBuild = useCallback((item: InfrastructureCatalogItem) => {
    setActiveBuildItem(item);
    setActiveCategory(item.category);
    setModeState("build");
    haptic("selection");
    toast.info(`Ready to place ${item.name}`, {
      description: "Move across port land to preview. Click to place, 'R' to rotate.",
      duration: 3000,
    });
  }, []);

  const cancelBuild = useCallback(() => {
    setActiveBuildItem(null);
    setBuildPreview(null);
    haptic("light");
  }, []);

  // Update build cursor position and validate placement
  const updateBuildCursor = useCallback((rawX: number, rawZ: number, rotDeg?: number) => {
    if (!activeBuildItem) return;

    // Apply grid snapping
    let x = rawX;
    let z = rawZ;
    if (snapGrid > 0) {
      x = Math.round(x / snapGrid) * snapGrid;
      z = Math.round(z / snapGrid) * snapGrid;
    }

    const rotation = rotDeg !== undefined ? rotDeg : buildPreview?.rotation ?? 0;
    const validation = validatePortPlacement(
      x,
      z,
      activeBuildItem.width,
      activeBuildItem.length,
      rotation
    );

    setBuildPreview({
      x,
      z,
      rotation,
      isValid: validation.isValid,
      reason: validation.reason,
    });
  }, [activeBuildItem, snapGrid, buildPreview?.rotation]);

  // Rotate preview or selected object
  const rotateObject = useCallback((deltaDegrees: number) => {
    haptic("selection");

    // 1. In Build Mode: rotate placement preview
    if (mode === "build" && buildPreview && activeBuildItem) {
      const newRot = (buildPreview.rotation + deltaDegrees + 360) % 360;
      updateBuildCursor(buildPreview.x, buildPreview.z, newRot);
      return;
    }

    // 2. In Edit Mode: rotate selected object
    if (selectedObject) {
      const prevRot = selectedObject.rotation;
      const newRot = (prevRot + deltaDegrees + 360) % 360;

      if (selectedObject.category === "yard") {
        yardRepository.update(selectedObject.id, { rotation: newRot });
        pushAction({
          type: "rotate",
          description: `Rotate Yard ${selectedObject.name} to ${newRot}°`,
          undo: () => {
            yardRepository.update(selectedObject.id, { rotation: prevRot });
          },
          redo: () => {
            yardRepository.update(selectedObject.id, { rotation: newRot });
          },
        });
      } else if (selectedObject.category === "cctv") {
        cctvRepository.updateTower(selectedObject.id, { rotation: newRot });
        pushAction({
          type: "rotate",
          description: `Rotate Tower ${selectedObject.name} to ${newRot}°`,
          undo: () => cctvRepository.updateTower(selectedObject.id, { rotation: prevRot }),
          redo: () => cctvRepository.updateTower(selectedObject.id, { rotation: newRot }),
        });
      } else if (selectedObject.category === "building") {
        buildingRepository.update(selectedObject.id, { rotation: newRot });
        pushAction({
          type: "rotate",
          description: `Rotate Building ${selectedObject.name} to ${newRot}°`,
          undo: () => buildingRepository.update(selectedObject.id, { rotation: prevRot }),
          redo: () => buildingRepository.update(selectedObject.id, { rotation: newRot }),
        });
      } else if (selectedObject.category === "road") {
        roadRepository.update(selectedObject.id, { rotation: newRot });
        pushAction({
          type: "rotate",
          description: `Rotate Road ${selectedObject.name} to ${newRot}°`,
          undo: () => roadRepository.update(selectedObject.id, { rotation: prevRot }),
          redo: () => roadRepository.update(selectedObject.id, { rotation: newRot }),
        });
      } else if (selectedObject.category === "fence") {
        fenceRepository.update(selectedObject.id, { rotation: newRot });
        pushAction({
          type: "rotate",
          description: `Rotate Fence ${selectedObject.name} to ${newRot}°`,
          undo: () => fenceRepository.update(selectedObject.id, { rotation: prevRot }),
          redo: () => fenceRepository.update(selectedObject.id, { rotation: newRot }),
        });
      }
    }
  }, [
    mode,
    buildPreview,
    activeBuildItem,
    selectedObject,
    updateBuildCursor,
    pushAction,
  ]);

  // Confirm placing new infrastructure item
  const confirmBuild = useCallback(() => {
    if (!activeBuildItem || !buildPreview) return;

    if (!buildPreview.isValid) {
      toast.error("Invalid placement location", {
        description: buildPreview.reason || "Object cannot be placed here.",
      });
      haptic("rigid");
      return;
    }

    const { x, z, rotation } = buildPreview;
    const cat = activeBuildItem.category;

    if (cat === "roro" || cat === "container") {
      const code = `Y-${Date.now().toString().slice(-4)}`;
      const newYard = yardRepository.create({
        code,
        name: activeBuildItem.name,
        yardType: activeBuildItem.defaultProperties.yardType || "roro",
        capacityUnit: activeBuildItem.defaultProperties.capacityUnit || "slots",
        totalCapacity: activeBuildItem.defaultProperties.totalCapacity || 100,
        occupiedCount: activeBuildItem.defaultProperties.occupiedCount || 0,
        width: activeBuildItem.width,
        length: activeBuildItem.length,
        rotation,
        position: { x, z },
        status: "active",
        isCustom: true,
      });

      pushAction({
        type: "add",
        description: `Add Yard ${activeBuildItem.name}`,
        undo: () => yardRepository.delete(newYard.id),
        redo: () => yardRepository.create(newYard),
      });

      // Switch to Edit Mode with the new yard selected
      setModeState("edit");
      yardMgr.setIs3DEditMode(true);
      selectObject({ id: newYard.id, category: "yard" });
    } else if (cat === "cctv" || activeBuildItem.id.includes("floodlight")) {
      const code = `CCTV-${Date.now().toString().slice(-3)}`;
      const newTower = cctvRepository.addTower({
        code,
        name: activeBuildItem.name,
        x,
        z,
        height: activeBuildItem.height,
        rotation,
        status: "active",
        initialCamerasCount: activeBuildItem.defaultProperties.cameraCount || 2,
      });

      pushAction({
        type: "add",
        description: `Add CCTV Tower ${activeBuildItem.name}`,
        undo: () => cctvRepository.deleteTower(newTower.id),
        redo: () => cctvRepository.addTower(newTower),
      });

      setModeState("edit");
      selectObject({ id: newTower.id, category: "cctv" });
    } else if (cat === "buildings" || cat === "gates" || cat === "utilities") {
      const newBld = buildingRepository.add({
        name: activeBuildItem.name,
        type: activeBuildItem.defaultProperties.type || "warehouse",
        x,
        z,
        width: activeBuildItem.width,
        depth: activeBuildItem.length,
        height: activeBuildItem.height,
        rotation,
        bandColor: activeBuildItem.defaultProperties.bandColor,
      });

      pushAction({
        type: "add",
        description: `Add Building ${activeBuildItem.name}`,
        undo: () => buildingRepository.delete(newBld.id),
        redo: () => buildingRepository.add(newBld),
      });

      setModeState("edit");
      selectObject({ id: newBld.id, category: "building" });
    } else if (cat === "roads") {
      const newRoad = roadRepository.add({
        name: activeBuildItem.name,
        x,
        z,
        width: activeBuildItem.width,
        depth: activeBuildItem.length,
        rotation,
        color: "#232830",
        hasMarking: true,
      });

      pushAction({
        type: "add",
        description: `Add Road ${activeBuildItem.name}`,
        undo: () => roadRepository.delete(newRoad.id),
        redo: () => roadRepository.add(newRoad),
      });

      setModeState("edit");
      selectObject({ id: newRoad.id, category: "road" });
    } else if (cat === "fences") {
      const newFence = fenceRepository.add({
        name: activeBuildItem.name,
        type: activeBuildItem.defaultProperties.type || "chainlink",
        x,
        z,
        width: activeBuildItem.width,
        depth: activeBuildItem.length,
        height: activeBuildItem.height,
        rotation,
        isOpen: activeBuildItem.defaultProperties.isOpen ?? true,
        hasBarbedWire: activeBuildItem.defaultProperties.hasBarbedWire ?? true,
        hasWarningSign: activeBuildItem.defaultProperties.hasWarningSign ?? true,
      });

      pushAction({
        type: "add",
        description: `Add 3D Fence ${activeBuildItem.name}`,
        undo: () => fenceRepository.delete(newFence.id),
        redo: () => fenceRepository.add(newFence),
      });

      setModeState("edit");
      selectObject({ id: newFence.id, category: "fence" });
    }

    haptic("success");
    toast.success(`Placed ${activeBuildItem.name}!`, {
      description: "Now editing in 3D. Fine-tune parameters in the properties panel.",
    });

    setActiveBuildItem(null);
    setBuildPreview(null);
  }, [
    activeBuildItem,
    buildPreview,
    yardMgr,
    pushAction,
    selectObject,
  ]);

  // Duplicate selected object
  const duplicateSelected = useCallback(() => {
    if (!selectedObject) return;

    const offset = 8;
    const newX = selectedObject.position.x + offset;
    const newZ = selectedObject.position.z + offset;

    if (selectedObject.category === "yard") {
      const orig = yardRepository.getById(selectedObject.id);
      if (!orig) return;
      const duplicated = yardRepository.duplicate(selectedObject.id);
      yardRepository.update(duplicated.id, {
        position: { x: newX, z: newZ },
      });
      selectObject({ id: duplicated.id, category: "yard" });
      pushAction({
        type: "duplicate",
        description: `Duplicate Yard ${selectedObject.name}`,
        undo: () => yardRepository.delete(duplicated.id),
        redo: () => yardRepository.create(duplicated),
      });
      toast.success(`Duplicated ${selectedObject.name}`);
    } else if (selectedObject.category === "cctv") {
      const orig = cctvRepository.getById(selectedObject.id);
      if (!orig) return;
      const dup = cctvRepository.duplicateTower(selectedObject.id);
      if (dup) {
        cctvRepository.updateTower(dup.id, { x: newX, z: newZ });
        selectObject({ id: dup.id, category: "cctv" });
        pushAction({
          type: "duplicate",
          description: `Duplicate CCTV Tower ${selectedObject.name}`,
          undo: () => cctvRepository.deleteTower(dup.id),
          redo: () => cctvRepository.addTower(dup),
        });
        toast.success(`Duplicated ${selectedObject.name}`);
      }
    } else if (selectedObject.category === "building") {
      const orig = buildingRepository.getById(selectedObject.id);
      if (!orig) return;
      const dup = buildingRepository.add({
        name: `${orig.name} (Copy)`,
        type: orig.type,
        x: newX,
        z: newZ,
        width: orig.width,
        depth: orig.depth,
        height: orig.height,
        rotation: orig.rotation,
        bandColor: orig.bandColor,
      });
      selectObject({ id: dup.id, category: "building" });
      pushAction({
        type: "duplicate",
        description: `Duplicate Building ${selectedObject.name}`,
        undo: () => buildingRepository.delete(dup.id),
        redo: () => buildingRepository.add(dup),
      });
      toast.success(`Duplicated ${selectedObject.name}`);
    } else if (selectedObject.category === "road") {
      const orig = roadRepository.getById(selectedObject.id);
      if (!orig) return;
      const dup = roadRepository.add({
        name: `${orig.name} (Copy)`,
        x: newX,
        z: newZ,
        width: orig.width,
        depth: orig.depth,
        rotation: orig.rotation,
        color: orig.color,
        hasMarking: orig.hasMarking,
      });
      selectObject({ id: dup.id, category: "road" });
      pushAction({
        type: "duplicate",
        description: `Duplicate Road ${selectedObject.name}`,
        undo: () => roadRepository.delete(dup.id),
        redo: () => roadRepository.add(dup),
      });
      toast.success(`Duplicated ${selectedObject.name}`);
    } else if (selectedObject.category === "fence") {
      const orig = fenceRepository.getById(selectedObject.id);
      if (!orig) return;
      const dup = fenceRepository.duplicate(selectedObject.id);
      if (dup) {
        selectObject({ id: dup.id, category: "fence" });
        pushAction({
          type: "duplicate",
          description: `Duplicate Fence ${selectedObject.name}`,
          undo: () => fenceRepository.delete(dup.id),
          redo: () => fenceRepository.add(dup),
        });
        toast.success(`Duplicated ${selectedObject.name}`);
      }
    }
  }, [selectedObject, selectObject, pushAction]);

  // Delete selected object with confirmation
  const deleteSelected = useCallback(() => {
    if (!selectedObject) return;

    const id = selectedObject.id;
    const cat = selectedObject.category;
    const name = selectedObject.name;

    if (cat === "yard") {
      const orig = yardRepository.getById(id);
      if (orig) {
        yardRepository.delete(id);
        pushAction({
          type: "delete",
          description: `Delete Yard ${name}`,
          undo: () => yardRepository.create(orig),
          redo: () => yardRepository.delete(id),
        });
      }
    } else if (cat === "cctv") {
      const orig = cctvRepository.getById(id);
      if (orig) {
        cctvRepository.deleteTower(id);
        pushAction({
          type: "delete",
          description: `Delete CCTV Tower ${name}`,
          undo: () => cctvRepository.addTower(orig),
          redo: () => cctvRepository.deleteTower(id),
        });
      }
    } else if (cat === "building") {
      const orig = buildingRepository.getById(id);
      if (orig) {
        buildingRepository.delete(id);
        pushAction({
          type: "delete",
          description: `Delete Building ${name}`,
          undo: () => buildingRepository.add(orig),
          redo: () => buildingRepository.delete(id),
        });
      }
    } else if (cat === "road") {
      const orig = roadRepository.getById(id);
      if (orig) {
        roadRepository.delete(id);
        pushAction({
          type: "delete",
          description: `Delete Road ${name}`,
          undo: () => roadRepository.add(orig),
          redo: () => roadRepository.delete(id),
        });
      }
    } else if (cat === "fence") {
      const orig = fenceRepository.getById(id);
      if (orig) {
        fenceRepository.delete(id);
        pushAction({
          type: "delete",
          description: `Delete Fence ${name}`,
          undo: () => fenceRepository.add(orig),
          redo: () => fenceRepository.delete(id),
        });
      }
    }

    selectObject(null);
    haptic("rigid");
    toast.info(`Deleted ${name}`);
  }, [selectedObject, pushAction, selectObject]);

  // Undo
  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const action = undoStack[undoStack.length - 1];
    action.undo();
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, action]);
    haptic("selection");
    toast.info(`Undo: ${action.description}`);
  }, [undoStack]);

  // Redo
  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const action = redoStack[redoStack.length - 1];
    action.redo();
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, action]);
    haptic("selection");
    toast.info(`Redo: ${action.description}`);
  }, [redoStack]);

  // Save current layout to local persistence
  const saveLayout = useCallback(() => {
    haptic("success");
    toast.success("HIPG Port Digital Twin Layout Saved", {
      description: "All yard blocks, CCTV surveillance, buildings, roads, and security fences are stored in browser persistence.",
    });
  }, []);

  // Instantly build 3D perimeter security fence lines around currently selected area (yard or building)
  const createPerimeterFenceForSelectedArea = useCallback((fenceType: any = "chainlink") => {
    if (!selectedObject) {
      toast.error("Please select a yard, building, or area first");
      return;
    }

    const { id, name, position, dimensions, rotation } = selectedObject;
    const newLines = fenceRepository.createPerimeterLinesForArea(
      {
        id,
        name,
        x: position.x,
        z: position.z,
        width: dimensions.width,
        length: dimensions.length,
        rotation,
      },
      fenceType
    );

    pushAction({
      type: "add",
      description: `Add 3D Perimeter Fence Lines around ${name}`,
      undo: () => {
        newLines.forEach((l) => fenceRepository.delete(l.id));
      },
      redo: () => {
        newLines.forEach((l) => fenceRepository.add(l));
      },
    });

    if (newLines.length > 0) {
      selectObject({ id: newLines[0].id, category: "fence" });
    }
    haptic("success");
    toast.success(`3D Perimeter Fence Lines Installed!`, {
      description: `Surrounded ${name} with 4 editable security fence lines.`,
    });
  }, [selectedObject, pushAction, selectObject]);

  // Start point-to-point 3D fence line drawing tool
  const startDrawingFenceLine = useCallback((type: any = "chainlink", fromPoint?: { x: number; z: number }) => {
    setIsDrawingFenceLine(true);
    setFenceStartPoint(fromPoint || null);
    setFenceCursorPoint(fromPoint || null);
    setDrawingFenceType(type);
    setSelectedObjectId(null);
    setSelectedCategory(null);
    setActiveBuildItem(null);
    setBuildPreview(null);
    haptic("selection");
    if (fromPoint) {
      toast.info("Continuing Fence Line Chain", {
        description: `Starting from [${fromPoint.x.toFixed(1)}, ${fromPoint.z.toFixed(1)}]. Click next point to place fence segment.`,
      });
    } else {
      toast.info("Click Start Point on Map to Draw Fence Line", {
        description: "Click point A, move cursor to point B and click to place fence. Esc to finish.",
      });
    }
  }, []);

  const cancelDrawingFenceLine = useCallback(() => {
    setIsDrawingFenceLine(false);
    setFenceStartPoint(null);
    setFenceCursorPoint(null);
    haptic("light");
  }, []);

  // Raycast click handler for free-form fence line drawing
  const onFenceMapClick = useCallback((rawPt: { x: number; z: number }) => {
    if (!isDrawingFenceLine) return;

    let pt = rawPt;
    if (snapGrid > 0) {
      pt = {
        x: Math.round(rawPt.x / snapGrid) * snapGrid,
        z: Math.round(rawPt.z / snapGrid) * snapGrid,
      };
    }

    if (!fenceStartPoint) {
      setFenceStartPoint(pt);
      haptic("selection");
      toast.info("Start Point Set", {
        description: "Move mouse and click End Point to place fence line segment.",
      });
    } else {
      const dx = pt.x - fenceStartPoint.x;
      const dz = pt.z - fenceStartPoint.z;
      const dist = Math.hypot(dx, dz);

      if (dist < 1.5) {
        toast.warning("Fence segment too short (minimum 1.5m)");
        return;
      }

      const newFence = fenceRepository.add({
        name: `Fence Line ${fenceRepository.getAll().length + 1}`,
        type: drawingFenceType,
        startPoint: fenceStartPoint,
        endPoint: pt,
      });

      pushAction({
        type: "add",
        description: `Add Fence Line (${Math.round(dist)}m)`,
        undo: () => fenceRepository.delete(newFence.id),
        redo: () => fenceRepository.add(newFence),
      });

      haptic("success");
      toast.success(`Fence Line Placed (${Math.round(dist)}m)`, {
        description: "Click next point to continue chain, or press Esc to finish.",
      });

      // Chain continuous drawing mode: current end becomes next start!
      setFenceStartPoint(pt);
    }
  }, [isDrawingFenceLine, fenceStartPoint, snapGrid, drawingFenceType, pushAction]);

  // Reset entire port to original HIPG baseline layout
  const resetLayout = useCallback(() => {
    yardRepository.resetToDefault();
    cctvRepository.resetToDefaults();
    buildingRepository.reset();
    roadRepository.resetToDefault();
    fenceRepository.resetToDefault();
    selectObject(null);
    setUndoStack([]);
    setRedoStack([]);
    setModeState("view");
    setIsResetConfirmOpen(false);
    haptic("success");
    toast.success("Port layout restored to HIPG baseline standards");
  }, [selectObject]);

  // Smoothly focus 3D camera onto the active drawing point, selected object, or build preview
  const focusCamera = useCallback(() => {
    let tx = 0;
    let tz = 0;
    let found = false;

    if (isDrawingFenceLine && fenceStartPoint) {
      tx = fenceStartPoint.x;
      tz = fenceStartPoint.z;
      found = true;
    } else if (isDrawingFenceLine && fenceCursorPoint) {
      tx = fenceCursorPoint.x;
      tz = fenceCursorPoint.z;
      found = true;
    } else if (selectedObject) {
      tx = selectedObject.position.x;
      tz = selectedObject.position.z;
      found = true;
    } else if (buildPreview) {
      tx = buildPreview.x;
      tz = buildPreview.z;
      found = true;
    }

    if (found && cameraApi.current) {
      cameraApi.current.setLookAt(
        tx + 30,
        42,
        tz + 52,
        tx,
        0,
        tz,
        true
      );
      haptic("selection");
      toast.info("Camera Focused on Work Area");
    }
  }, [isDrawingFenceLine, fenceStartPoint, fenceCursorPoint, selectedObject, buildPreview]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input, textarea, or contentEditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // 1. Mode shortcuts: '1' -> View, '2' -> Edit, '3' -> Build
      if (e.key === "1") {
        setMode("view");
      } else if (e.key === "2") {
        setMode("edit");
      } else if (e.key === "3") {
        setMode("build");
      }

      // 2. Rotate with 'r' / 'R'
      if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        const delta = e.shiftKey ? -45 : 45;
        rotateObject(delta);
      }

      // 3. Escape -> Cancel placement or clear selection
      if (e.key === "Escape") {
        if (isDrawingFenceLine) {
          cancelDrawingFenceLine();
        } else if (activeBuildItem) {
          cancelBuild();
        } else if (selectedObject) {
          selectObject(null);
        }
      }

      // 4. Undo: Ctrl+Z / Cmd+Z (without Shift)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // 5. Redo: Ctrl+Y / Cmd+Y or Ctrl+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z")
      ) {
        e.preventDefault();
        redo();
      }

      // 6. Delete key -> delete selected object
      if (e.key === "Delete" && selectedObject) {
        e.preventDefault();
        deleteSelected();
      }

      // 7. Focus camera on active element with 'f' / 'F'
      if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        focusCamera();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    setMode,
    rotateObject,
    activeBuildItem,
    cancelBuild,
    selectedObject,
    selectObject,
    undo,
    redo,
    deleteSelected,
    focusCamera,
  ]);

  return {
    mode,
    setMode,
    snapGrid,
    setSnapGrid,
    activeCategory,
    setActiveCategory,
    activeBuildItem,
    setActiveBuildItem,
    buildPreview,
    startBuild,
    cancelBuild,
    updateBuildCursor,
    confirmBuild,
    selectedObject,
    selectObject,
    rotateObject,
    duplicateSelected,
    deleteSelected,
    undoStack,
    redoStack,
    undo,
    redo,
    saveLayout,
    resetLayout,
    createPerimeterFenceForSelectedArea,
    drawingFenceType,
    isDrawingFenceLine,
    fenceStartPoint,
    fenceCursorPoint,
    setFenceCursorPoint,
    startDrawingFenceLine,
    cancelDrawingFenceLine,
    onFenceMapClick,
    focusCamera,
    isResetConfirmOpen,
    setIsResetConfirmOpen,
  };
});
