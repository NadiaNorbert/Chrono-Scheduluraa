/**
 * [FUTURE M2 — Calendar] Calendar view state store stub.
 * Implement in Milestone 2 — connect to API and wire up real actions.
 */

import { create } from "zustand";
import type { CalendarEvent, CalendarViewMode } from "@/types/calendar";

interface CalendarState {
  viewMode: CalendarViewMode;
  selectedDate: string; // ISO 8601 date string (YYYY-MM-DD)
  events: CalendarEvent[];
  setViewMode: (mode: CalendarViewMode) => void;
  setSelectedDate: (date: string) => void;
}

// Stub — fully implement in Milestone 2
export const useCalendarStore = create<CalendarState>((set) => ({
  viewMode: "week",
  selectedDate: new Date().toISOString().split("T")[0],
  events: [],

  setViewMode: (viewMode) => set({ viewMode }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
}));
