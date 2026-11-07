import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cctvRepository } from "@/data/cctvRepository";
import type { CctvCameraConfig, CctvStatus, CctvTowerConfig, CreateCctvTowerInput } from "@/data/cctvTypes";
import { cameraApi } from "@/three/CameraRig";

export type CoverageViewFilter = "all" | "selected-tower" | "selected-camera" | "none";

export const [CctvManagementProvider, useCctvManagement] = createContextHook(() => {
  const [towers, setTowers] = useState<CctvTowerConfig[]>(() => cctvRepository.getAll());
  const [selectedTowerId, setSelectedTowerId] = useState<string | null>(null);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);

  // Overall CCTV management mode active (in HUD / 3D)
  const [isCctvMode, setIsCctvMode] = useState<boolean>(false);
  const [showTowers, setShowTowers] = useState<boolean>(true);
  const [coverageFilter, setCoverageFilter] = useState<CoverageViewFilter>("all");

  // Location picking workflow for "Add Tower"
  const [isPickingLocation, setIsPickingLocation] = useState<boolean>(false);
  const [pendingTowerData, setPendingTowerData] = useState<Partial<CreateCctvTowerInput> | null>(null);

  // 3D direct dragging/editing state for selected tower
  const [draftPosition, setDraftPosition] = useState<{ x: number; z: number } | null>(null);
  const [draftRotation, setDraftRotation] = useState<number | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<CctvStatus | "all">("all");

  // Keep towers state synchronized with the repository
  useEffect(() => {
    return cctvRepository.subscribe(() => {
      setTowers(cctvRepository.getAll());
    });
  }, []);

  const selectedTower = useMemo(() => {
    return towers.find((t) => t.id === selectedTowerId) ?? null;
  }, [towers, selectedTowerId]);

  const selectedCamera = useMemo(() => {
    if (!selectedTower) return null;
    return selectedTower.cameras.find((c) => c.id === selectedCameraId) ?? null;
  }, [selectedTower, selectedCameraId]);

  const selectTower = useCallback((id: string | null) => {
    setSelectedTowerId(id);
    setSelectedCameraId(null);
    setDraftPosition(null);
    setDraftRotation(null);
  }, []);

  const selectCamera = useCallback((camId: string | null) => {
    setSelectedCameraId(camId);
  }, []);

  // Filtered towers list
  const filteredTowers = useMemo(() => {
    let result = [...towers];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.code.toLowerCase().includes(q) ||
          t.name.toLowerCase().includes(q) ||
          t.notes?.toLowerCase().includes(q) ||
          t.cameras.some((c) => c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }

    return result;
  }, [towers, searchQuery, statusFilter]);

  const totalCamerasCount = useMemo(() => {
    return towers.reduce((acc, t) => acc + (t.cameras?.length || 0), 0);
  }, [towers]);

  // Camera Fly-to / Focus
  const focusOnTower = useCallback((tower: CctvTowerConfig) => {
    if (!cameraApi.current) return;
    cameraApi.current.setLookAt(
      tower.x + 35,
      Math.max(tower.height + 25, 40),
      tower.z + 45,
      tower.x,
      tower.height * 0.5,
      tower.z,
      true
    );
  }, []);

  // Add Tower Flow
  const startAddTower = useCallback(() => {
    setIsPickingLocation(true);
    setSelectedTowerId(null);
    setSelectedCameraId(null);
  }, []);

  const cancelPickingLocation = useCallback(() => {
    setIsPickingLocation(false);
    setPendingTowerData(null);
  }, []);

  const confirmLocationPicked = useCallback((pos: { x: number; z: number }) => {
    setIsPickingLocation(false);
    // Auto-create new tower with next sequence code
    const count = cctvRepository.getAll().length + 1;
    const newTower = cctvRepository.addTower({
      code: `CCTV-${String(count).padStart(3, "0")}`,
      name: `CCTV Tower ${count}`,
      x: pos.x,
      z: pos.z,
      height: 16,
      rotation: 0,
      status: "active",
      initialCamerasCount: 2,
    });
    setSelectedTowerId(newTower.id);
    setSelectedCameraId(newTower.cameras[0]?.id ?? null);
    focusOnTower(newTower);
  }, [focusOnTower]);

  // Direct operations
  const updateTower = useCallback((id: string, updates: Partial<Omit<CctvTowerConfig, "id" | "cameras">>) => {
    return cctvRepository.updateTower(id, updates);
  }, []);

  const applyDraftPosition = useCallback(() => {
    if (!selectedTowerId || !draftPosition) return;
    cctvRepository.updateTower(selectedTowerId, {
      x: draftPosition.x,
      z: draftPosition.z,
    });
    setDraftPosition(null);
  }, [selectedTowerId, draftPosition]);

  const duplicateTower = useCallback((id: string) => {
    const dup = cctvRepository.duplicateTower(id);
    if (dup) {
      setSelectedTowerId(dup.id);
      setSelectedCameraId(dup.cameras[0]?.id ?? null);
      focusOnTower(dup);
    }
  }, [focusOnTower]);

  const deleteTower = useCallback((id: string) => {
    const success = cctvRepository.deleteTower(id);
    if (success && selectedTowerId === id) {
      setSelectedTowerId(null);
      setSelectedCameraId(null);
      setDraftPosition(null);
      setDraftRotation(null);
    }
    return success;
  }, [selectedTowerId]);

  const addCamera = useCallback((towerId: string) => {
    const cam = cctvRepository.addCameraToTower(towerId);
    if (cam) {
      setSelectedCameraId(cam.id);
    }
  }, []);

  const updateCamera = useCallback((towerId: string, cameraId: string, updates: Partial<CctvCameraConfig>) => {
    return cctvRepository.updateCamera(towerId, cameraId, updates);
  }, []);

  const deleteCamera = useCallback((towerId: string, cameraId: string) => {
    const success = cctvRepository.deleteCamera(towerId, cameraId);
    if (success && selectedCameraId === cameraId) {
      const tower = cctvRepository.getById(towerId);
      setSelectedCameraId(tower?.cameras[0]?.id ?? null);
    }
    return success;
  }, [selectedCameraId]);

  const resetAllTowers = useCallback(() => {
    cctvRepository.resetToDefaults();
    setSelectedTowerId(null);
    setSelectedCameraId(null);
    setDraftPosition(null);
  }, []);

  return {
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
    confirmLocationPicked,
    draftPosition,
    setDraftPosition,
    draftRotation,
    setDraftRotation,
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
  };
});
