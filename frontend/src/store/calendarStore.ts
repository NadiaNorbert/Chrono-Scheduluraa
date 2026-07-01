/**
 * Calendar UI state store.
 *
 * Manages view mode, selected date, and modal state.
 * Actual event data lives in TanStack Query cache, not here.
 */

import { create } from "zustand";
import type { CalendarViewMode, CalendarEvent } from "@/types/calendar";

interface CalendarUIState {
  viewMode:         CalendarViewMode;
  /** Currently displayed date — ISO YYYY-MM-DD */
  selectedDate:     string;
  /** Event being edited in the modal (null = none) */
  editingEvent:     CalendarEvent | null;
  /** Whether create-event modal is open */
  createModalOpen:  boolean;
  /** Pre-filled start time when clicking a slot */
  slotStart:        string | null;
  slotEnd:          string | null;

  setViewMode:       (mode: CalendarViewMode) => void;
  setSelectedDate:   (date: string) => void;
  navigatePrev:      () => void;
  navigateNext:      () => void;
  navigateToday:     () => void;
  openCreateModal:   (start?: string, end?: string) => void;
  closeCreateModal:  () => void;
  openEditModal:     (event: CalendarEvent) => void;
  closeEditModal:    () => void;
}

function shiftDate(dateStr: string, viewMode: CalendarViewMode, direction: 1 | -1): string {
  const d = new Date(dateStr);
  if (viewMode === "month") d.setMonth(d.getMonth() + direction);
  else if (viewMode === "week") d.setDate(d.getDate() + direction * 7);
  else d.setDate(d.getDate() + direction);
  return d.toISOString().split("T")[0];
}

export const useCalendarStore = create<CalendarUIState>((set, get) => ({
  viewMode:        "week",
  selectedDate:    new Date().toISOString().split("T")[0],
  editingEvent:    null,
  createModalOpen: false,
  slotStart:       null,
  slotEnd:         null,

  setViewMode:     (viewMode)     => set({ viewMode }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),

  navigatePrev: () => set((s) => ({
    selectedDate: shiftDate(s.selectedDate, s.viewMode, -1),
  })),
  navigateNext: () => set((s) => ({
    selectedDate: shiftDate(s.selectedDate, s.viewMode, 1),
  })),
  navigateToday: () => set({
    selectedDate: new Date().toISOString().split("T")[0],
  }),

  openCreateModal:  (start, end) => set({ createModalOpen: true, slotStart: start ?? null, slotEnd: end ?? null }),
  closeCreateModal: () => set({ createModalOpen: false, slotStart: null, slotEnd: null }),
  openEditModal:    (event) => set({ editingEvent: event }),
  closeEditModal:   () => set({ editingEvent: null }),
}));
