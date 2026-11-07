import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useMemo, useState } from "react";
import { roadRepository } from "@/data/roadRepository";
import type { CreateRoadInput, RoadSegment } from "@/data/roadTypes";
import { cameraApi } from "@/three/CameraRig";

export const [RoadManagementProvider, useRoadManagement] = createContextHook(() => {
  const [roads, setRoads] = useState<RoadSegment[]>(() => roadRepository.getAll());
  const [selectedRoadId, setSelectedRoadId] = useState<string | null>(null);

  // Road Editing Mode & Picking
  const [isRoadEditMode, setIsRoadEditMode] = useState<boolean>(false);
  const [isPickingRoadStart, setIsPickingRoadStart] = useState<boolean>(false);
  const [pickedStartPoint, setPickedStartPoint] = useState<{ x: number; z: number } | null>(null);

  // 3D Draft state for currently selected road
  const [draftPosition, setDraftPosition] = useState<{ x: number; z: number } | null>(null);
  const [draftDimensions, setDraftDimensions] = useState<{ width: number; depth: number; rotation: number } | null>(null);

  useEffect(() => {
    return roadRepository.subscribe(() => {
      setRoads(roadRepository.getAll());
    });
  }, []);

  const selectedRoad = useMemo(() => {
    return roads.find((r) => r.id === selectedRoadId) ?? null;
  }, [roads, selectedRoadId]);

  const selectRoad = useCallback((id: string | null) => {
    setSelectedRoadId(id);
    setDraftPosition(null);
    setDraftDimensions(null);
  }, []);

  const applyDraft = useCallback(() => {
    if (!selectedRoadId) return;
    const updates: Partial<RoadSegment> = {};
    if (draftPosition) {
      updates.x = draftPosition.x;
      updates.z = draftPosition.z;
    }
    if (draftDimensions) {
      updates.width = draftDimensions.width;
      updates.depth = draftDimensions.depth;
      updates.rotation = draftDimensions.rotation;
    }
    if (Object.keys(updates).length > 0) {
      roadRepository.update(selectedRoadId, updates);
    }
    setDraftPosition(null);
    setDraftDimensions(null);
  }, [selectedRoadId, draftPosition, draftDimensions]);

  const cancelDraft = useCallback(() => {
    setDraftPosition(null);
    setDraftDimensions(null);
  }, []);

  const updateRoad = useCallback((id: string, updates: Partial<RoadSegment>) => {
    return roadRepository.update(id, updates);
  }, []);

  const deleteRoad = useCallback((id: string) => {
    if (selectedRoadId === id) selectRoad(null);
    return roadRepository.delete(id);
  }, [selectedRoadId, selectRoad]);

  const resetRoads = useCallback(() => {
    roadRepository.resetToDefault();
    selectRoad(null);
  }, [selectRoad]);

  // Start two-point Road Creation Path on 3D Map
  const startAddRoad = useCallback(() => {
    setIsRoadEditMode(true);
    setIsPickingRoadStart(true);
    setPickedStartPoint(null);
    selectRoad(null);
  }, [selectRoad]);

  const cancelAddRoad = useCallback(() => {
    setIsPickingRoadStart(false);
    setPickedStartPoint(null);
  }, []);

  const onMapClick = useCallback((pos: { x: number; z: number }) => {
    if (!isPickingRoadStart) return;

    if (!pickedStartPoint) {
      // First point clicked (Start of road)
      setPickedStartPoint(pos);
    } else {
      // Second point clicked (End of road) -> Compute segment
      const dx = pos.x - pickedStartPoint.x;
      const dz = pos.z - pickedStartPoint.z;
      const length = Math.hypot(dx, dz);

      if (length < 2) {
        // Points too close, ignore
        return;
      }

      const midX = Math.round(((pickedStartPoint.x + pos.x) / 2) * 10) / 10;
      const midZ = Math.round(((pickedStartPoint.z + pos.z) / 2) * 10) / 10;
      const angleRad = Math.atan2(dz, dx);
      const angleDeg = Math.round((angleRad * 180) / Math.PI);

      const created = roadRepository.add({
        name: `Road Segment ${roads.length + 1}`,
        x: midX,
        z: midZ,
        width: Math.round(length * 10) / 10,
        depth: 7.0, // standard 2-lane port road width
        rotation: angleDeg,
        hasMarking: true,
        markingColor: "#FFFFFF",
      });

      setIsPickingRoadStart(false);
      setPickedStartPoint(null);
      selectRoad(created.id);
    }
  }, [isPickingRoadStart, pickedStartPoint, roads.length, selectRoad]);

  return {
    roads,
    selectedRoadId,
    selectedRoad,
    selectRoad,
    isRoadEditMode,
    setIsRoadEditMode,
    isPickingRoadStart,
    pickedStartPoint,
    startAddRoad,
    cancelAddRoad,
    onMapClick,
    draftPosition,
    setDraftPosition,
    draftDimensions,
    setDraftDimensions,
    applyDraft,
    cancelDraft,
    updateRoad,
    deleteRoad,
    resetRoads,
  };
});
