import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useMemo, useState } from "react";
import { yardRepository } from "@/data/yardRepository";
import type {
  YardBlockConfig,
  CreateYardInput,
  YardType,
  YardStatus,
  CapacityDashboardMetrics,
} from "@/data/yardTypes";
import { cameraApi } from "@/three/CameraRig";

export type YardSortBy = "code" | "occupancy" | "free" | "total";

export const [YardManagementProvider, useYardManagement] = createContextHook(() => {
  const [yards, setYards] = useState<YardBlockConfig[]>(() => yardRepository.getAll());
  const [selectedYardId, setSelectedYardId] = useState<string | null>(null);

  // Modal / Drawer state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [yardForm, setYardForm] = useState<CreateYardInput | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // 3D Interactive Map editing state
  const [is3DEditMode, setIs3DEditMode] = useState(false);
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [draftPosition, setDraftPosition] = useState<{ x: number; z: number } | null>(null);
  const [draftDimensions, setDraftDimensions] = useState<{ width: number; length: number; rotation: number } | null>(null);

  // Search, filter, and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<YardType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<YardStatus | "all">("all");
  const [sortBy, setSortBy] = useState<YardSortBy>("code");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Keep yards synchronized with the repository
  useEffect(() => {
    return yardRepository.subscribe(() => {
      setYards(yardRepository.getAll());
    });
  }, []);

  const selectedYard = useMemo(() => {
    return yards.find((y) => y.id === selectedYardId) ?? null;
  }, [yards, selectedYardId]);

  const dashboardMetrics: CapacityDashboardMetrics = useMemo(() => {
    return yardRepository.getDashboardMetrics();
  }, [yards]);

  const selectYard = useCallback((id: string | null) => {
    setSelectedYardId(id);
    setDraftPosition(null);
    setDraftDimensions(null);
  }, []);

  // Filtered & sorted yards
  const filteredYards = useMemo(() => {
    let result = [...yards];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (y) => y.code.toLowerCase().includes(q) || y.name.toLowerCase().includes(q) || y.notes?.toLowerCase().includes(q),
      );
    }

    if (typeFilter !== "all") {
      result = result.filter((y) => y.yardType === typeFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter((y) => y.status === statusFilter);
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case "code":
          cmp = a.code.localeCompare(b.code, undefined, { numeric: true });
          break;
        case "occupancy":
          cmp = a.utilizationPercentage - b.utilizationPercentage;
          break;
        case "free":
          cmp = a.freeCapacity - b.freeCapacity;
          break;
        case "total":
          cmp = a.totalCapacity - b.totalCapacity;
          break;
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return result;
  }, [yards, searchQuery, typeFilter, statusFilter, sortBy, sortOrder]);

  // Open Create Form
  const openCreateModal = useCallback((defaultPos?: { x: number; z: number }) => {
    setModalMode("create");
    setFormError(null);
    setYardForm({
      code: "",
      name: "",
      yardType: "roro",
      capacityUnit: "slots",
      totalCapacity: 1200,
      occupiedCount: 0,
      position: defaultPos || { x: 0, z: 50 },
      rotation: 0,
      width: 64,
      length: 24,
      status: "active",
      notes: "",
    });
    setIsModalOpen(true);
  }, []);

  // Open Edit Form
  const openEditModal = useCallback((yard: YardBlockConfig) => {
    setModalMode("edit");
    setFormError(null);
    setSelectedYardId(yard.id);
    setYardForm({
      code: yard.code,
      name: yard.name,
      yardType: yard.yardType,
      capacityUnit: yard.capacityUnit,
      totalCapacity: yard.totalCapacity,
      occupiedCount: yard.occupiedCount,
      position: { ...yard.position },
      rotation: yard.rotation,
      width: yard.width,
      length: yard.length,
      status: yard.status,
      notes: yard.notes || "",
    });
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setYardForm(null);
    setFormError(null);
  }, []);

  // Save create/edit form
  const saveYardForm = useCallback(() => {
    if (!yardForm) return { success: false, error: "No form data" };

    const cleanCode = yardForm.code.trim().toUpperCase();
    if (!cleanCode) {
      setFormError("Yard code is required");
      return { success: false, error: "Yard code is required" };
    }

    if (yardForm.totalCapacity <= 0) {
      setFormError("Total capacity must be greater than 0");
      return { success: false, error: "Total capacity must be greater than 0" };
    }

    if (yardForm.occupiedCount < 0) {
      setFormError("Occupied count cannot be negative");
      return { success: false, error: "Occupied count cannot be negative" };
    }

    if (yardForm.occupiedCount > yardForm.totalCapacity) {
      setFormError("Occupied count cannot exceed total capacity");
      return { success: false, error: "Occupied count cannot exceed total capacity" };
    }

    try {
      if (modalMode === "create") {
        const created = yardRepository.create({
          ...yardForm,
          code: cleanCode,
          name: yardForm.name.trim() || `Block ${cleanCode}`,
        });
        setSelectedYardId(created.id);
      } else if (modalMode === "edit" && selectedYardId) {
        yardRepository.update(selectedYardId, {
          ...yardForm,
          code: cleanCode,
          name: yardForm.name.trim() || `Block ${cleanCode}`,
        });
      }
      setIsModalOpen(false);
      setYardForm(null);
      setFormError(null);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save yard";
      setFormError(msg);
      return { success: false, error: msg };
    }
  }, [yardForm, modalMode, selectedYardId]);

  // Direct Capacity Update for quick inline edits
  const updateYardCapacity = useCallback((id: string, totalCapacity: number, occupiedCount: number) => {
    try {
      const safeTotal = Math.max(1, Math.round(totalCapacity));
      const safeOccupied = Math.max(0, Math.min(safeTotal, Math.round(occupiedCount)));
      const updated = yardRepository.update(id, {
        totalCapacity: safeTotal,
        occupiedCount: safeOccupied,
      });
      return { success: true, yard: updated };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update capacity";
      return { success: false, error: msg };
    }
  }, []);

  // Duplicate Action
  const duplicateYardAction = useCallback((id: string) => {
    try {
      const copy = yardRepository.duplicate(id);
      setSelectedYardId(copy.id);
      return { success: true, yard: copy };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to duplicate";
      return { success: false, error: msg };
    }
  }, []);

  // Delete Action
  const deleteYardAction = useCallback((id: string) => {
    const success = yardRepository.delete(id);
    if (success && selectedYardId === id) {
      setSelectedYardId(null);
    }
    return success;
  }, [selectedYardId]);

  // Reset to default authoritative HIPG layout
  const resetLayoutAction = useCallback(() => {
    yardRepository.resetToDefault();
    setSelectedYardId(null);
    setDraftPosition(null);
    setDraftDimensions(null);
    setIs3DEditMode(false);
  }, []);

  // 3D Map Location Picker
  const startPickingLocation = useCallback(() => {
    setIsPickingLocation(true);
  }, []);

  const cancelPickingLocation = useCallback(() => {
    setIsPickingLocation(false);
  }, []);

  const onLocationPicked = useCallback((pos: { x: number; z: number }) => {
    setIsPickingLocation(false);
    if (yardForm) {
      setYardForm((prev) => (prev ? { ...prev, position: pos } : null));
    } else if (selectedYardId) {
      yardRepository.update(selectedYardId, { position: pos });
    }
  }, [yardForm, selectedYardId]);

  // Apply draft 3D position to the active yard
  const applyDraftPosition = useCallback(() => {
    if (!selectedYardId) return;
    const updates: { position?: { x: number; z: number }; width?: number; length?: number; rotation?: number } = {};
    if (draftPosition) updates.position = draftPosition;
    if (draftDimensions) {
      updates.width = draftDimensions.width;
      updates.length = draftDimensions.length;
      updates.rotation = draftDimensions.rotation;
    }
    if (Object.keys(updates).length > 0) {
      yardRepository.update(selectedYardId, updates);
    }
    setDraftPosition(null);
    setDraftDimensions(null);
  }, [selectedYardId, draftPosition, draftDimensions]);

  const cancelDraftPosition = useCallback(() => {
    setDraftPosition(null);
    setDraftDimensions(null);
  }, []);

  // Focus camera on yard
  const focusOnYard = useCallback((yard: YardBlockConfig) => {
    setSelectedYardId(yard.id);
    if (cameraApi.current) {
      void cameraApi.current.setLookAt(
        yard.position.x + 35,
        50,
        yard.position.z + 55,
        yard.position.x,
        0,
        yard.position.z,
        true,
      );
    }
  }, []);

  return useMemo(
    () => ({
      yards,
      selectedYardId,
      selectedYard,
      selectYard,
      dashboardMetrics,
      filteredYards,
      // Modals
      isModalOpen,
      modalMode,
      yardForm,
      setYardForm,
      formError,
      setFormError,
      openCreateModal,
      openEditModal,
      closeModal,
      saveYardForm,
      updateYardCapacity,
      duplicateYardAction,
      deleteYardAction,
      resetLayoutAction,
      // 3D Editing
      is3DEditMode,
      setIs3DEditMode,
      isPickingLocation,
      startPickingLocation,
      cancelPickingLocation,
      onLocationPicked,
      draftPosition,
      setDraftPosition,
      draftDimensions,
      setDraftDimensions,
      applyDraftPosition,
      cancelDraftPosition,
      focusOnYard,
      // Search & filters
      searchQuery,
      setSearchQuery,
      typeFilter,
      setTypeFilter,
      statusFilter,
      setStatusFilter,
      sortBy,
      setSortBy,
      sortOrder,
      setSortOrder,
    }),
    [
      yards,
      selectedYardId,
      selectedYard,
      selectYard,
      dashboardMetrics,
      filteredYards,
      isModalOpen,
      modalMode,
      yardForm,
      formError,
      openCreateModal,
      openEditModal,
      closeModal,
      saveYardForm,
      updateYardCapacity,
      duplicateYardAction,
      deleteYardAction,
      resetLayoutAction,
      is3DEditMode,
      isPickingLocation,
      startPickingLocation,
      cancelPickingLocation,
      onLocationPicked,
      draftPosition,
      draftDimensions,
      applyDraftPosition,
      cancelDraftPosition,
      focusOnYard,
      searchQuery,
      typeFilter,
      statusFilter,
      sortBy,
      sortOrder,
    ],
  );
});
