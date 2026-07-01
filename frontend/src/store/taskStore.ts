/**
 * Task UI state store.
 *
 * Handles ephemeral UI state only — which filter is active, search text,
 * which task is selected, and whether the create/edit modal is open.
 *
 * Server state (the actual task list) lives in TanStack Query, not here.
 */

import { create } from "zustand";
import type { TaskFilter, Priority, Task } from "@/types/scheduler";

interface TaskUIState {
  /** Active filter tab */
  activeFilter: TaskFilter;
  /** Active priority filter (null = all priorities) */
  activePriority: Priority | null;
  /** Current search query */
  searchQuery: string;
  /** Task being edited (null = none) */
  editingTask: Task | null;
  /** Whether the "create task" modal is open */
  createModalOpen: boolean;

  setActiveFilter: (filter: TaskFilter) => void;
  setActivePriority: (priority: Priority | null) => void;
  setSearchQuery: (query: string) => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (task: Task) => void;
  closeEditModal: () => void;
}

export const useTaskStore = create<TaskUIState>((set) => ({
  activeFilter:    "all",
  activePriority:  null,
  searchQuery:     "",
  editingTask:     null,
  createModalOpen: false,

  setActiveFilter:   (activeFilter)   => set({ activeFilter }),
  setActivePriority: (activePriority) => set({ activePriority }),
  setSearchQuery:    (searchQuery)    => set({ searchQuery }),

  openCreateModal:  () => set({ createModalOpen: true }),
  closeCreateModal: () => set({ createModalOpen: false }),

  openEditModal:  (task) => set({ editingTask: task }),
  closeEditModal: ()     => set({ editingTask: null }),
}));
