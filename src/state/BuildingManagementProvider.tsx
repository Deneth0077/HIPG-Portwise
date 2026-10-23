import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useMemo, useState } from "react";
import { buildingRepository } from "@/data/buildingRepository";
import type { BuildingConfig, CreateBuildingInput } from "@/data/buildingTypes";
import { cameraApi } from "@/three/CameraRig";

export const [BuildingManagementProvider, useBuildingManagement] = createContextHook(() => {
  const [buildings, setBuildings] = useState<BuildingConfig[]>(() => buildingRepository.getAll());
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);

  // 3D Real-time dragging & draft state
  const [draftPosition, setDraftPosition] = useState<{ x: number; z: number } | null>(null);
  const [draftDimensions, setDraftDimensions] = useState<{ width: number; depth: number; height: number; rotation: number } | null>(null);

  // Location picking mode for adding new buildings
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [pendingBuildingInput, setPendingBuildingInput] = useState<CreateBuildingInput | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Synchronize with repository
  useEffect(() => {
    return buildingRepository.subscribe(() => {
      setBuildings(buildingRepository.getAll());
    });
  }, []);

  const selectedBuilding = useMemo(() => {
    return buildings.find((b) => b.id === selectedBuildingId) ?? null;
  }, [buildings, selectedBuildingId]);

  const selectBuilding = useCallback((id: string | null) => {
    setSelectedBuildingId(id);
    setDraftPosition(null);
    setDraftDimensions(null);
  }, []);

  const focusOnBuilding = useCallback((b: BuildingConfig) => {
    if (cameraApi.current) {
      cameraApi.current.setLookAt(b.x + 35, 45, b.z + 45, b.x, 3, b.z, true);
    }
  }, []);

  const applyDraft = useCallback(() => {
    if (!selectedBuildingId) return;
    const updates: Partial<BuildingConfig> = {};
    if (draftPosition) {
      updates.x = draftPosition.x;
      updates.z = draftPosition.z;
    }
    if (draftDimensions) {
      updates.width = draftDimensions.width;
      updates.depth = draftDimensions.depth;
      updates.height = draftDimensions.height;
      updates.rotation = draftDimensions.rotation;
    }

    if (Object.keys(updates).length > 0) {
      buildingRepository.update(selectedBuildingId, updates);
    }

    setDraftPosition(null);
    setDraftDimensions(null);
  }, [selectedBuildingId, draftPosition, draftDimensions]);

  const cancelDraft = useCallback(() => {
    setDraftPosition(null);
    setDraftDimensions(null);
  }, []);

  const updateBuilding = useCallback((id: string, updates: Partial<BuildingConfig>) => {
    return buildingRepository.update(id, updates);
  }, []);

  const addBuilding = useCallback((input: CreateBuildingInput) => {
    const created = buildingRepository.add(input);
    selectBuilding(created.id);
    focusOnBuilding(created);
    return created;
  }, [selectBuilding, focusOnBuilding]);

  const deleteBuilding = useCallback((id: string) => {
    if (selectedBuildingId === id) {
      selectBuilding(null);
    }
    return buildingRepository.delete(id);
  }, [selectedBuildingId, selectBuilding]);

  const resetBuildings = useCallback(() => {
    buildingRepository.reset();
    selectBuilding(null);
  }, [selectBuilding]);

  const startPickingLocation = useCallback((input: CreateBuildingInput) => {
    setPendingBuildingInput(input);
    setIsPickingLocation(true);
    selectBuilding(null);
  }, [selectBuilding]);

  const cancelPickingLocation = useCallback(() => {
    setIsPickingLocation(false);
    setPendingBuildingInput(null);
  }, []);

  const onLocationPicked = useCallback((pos: { x: number; z: number }) => {
    if (!pendingBuildingInput) return;
    const created = buildingRepository.add({
      ...pendingBuildingInput,
      x: pos.x,
      z: pos.z,
    });
    setIsPickingLocation(false);
    setPendingBuildingInput(null);
    selectBuilding(created.id);
    focusOnBuilding(created);
  }, [pendingBuildingInput, selectBuilding, focusOnBuilding]);

  return {
    buildings,
    selectedBuildingId,
    selectedBuilding,
    selectBuilding,
    focusOnBuilding,
    draftPosition,
    setDraftPosition,
    draftDimensions,
    setDraftDimensions,
    applyDraft,
    cancelDraft,
    updateBuilding,
    addBuilding,
    deleteBuilding,
    resetBuildings,
    isPickingLocation,
    startPickingLocation,
    cancelPickingLocation,
    onLocationPicked,
    isAddModalOpen,
    openAddModal: () => setIsAddModalOpen(true),
    closeAddModal: () => setIsAddModalOpen(false),
  };
});
