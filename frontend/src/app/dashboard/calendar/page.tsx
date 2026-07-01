"use client";

import type { Metadata } from "next";
import { useCalendarStore } from "@/store/calendarStore";
import { useEvents } from "@/hooks/useCalendar";
import {
  CalendarHeader, EventFormModal,
  MonthView, WeekView, DayView, AgendaView, CalendarSkeleton,
} from "@/components/calendar";
import { toDateStr, startOfWeek } from "@/lib/calendarUtils";
import type { CalendarEvent } from "@/types/calendar";

/**
 * Calendar page — /dashboard/calendar
 *
 * Full custom calendar with month / week / day / agenda views.
 * All data from /api/v1/events (falls back to empty gracefully).
 */
export default function CalendarPage() {
  const viewMode        = useCalendarStore((s) => s.viewMode);
  const selectedDate    = useCalendarStore((s) => s.selectedDate);
  const setSelectedDate = useCalendarStore((s) => s.setSelectedDate);
  const createModalOpen = useCalendarStore((s) => s.createModalOpen);
  const editingEvent    = useCalendarStore((s) => s.editingEvent);
  const openCreateModal = useCalendarStore((s) => s.openCreateModal);
  const openEditModal   = useCalendarStore((s) => s.openEditModal);
  const closeCreateModal = useCalendarStore((s) => s.closeCreateModal);
  const closeEditModal   = useCalendarStore((s) => s.closeEditModal);

  // Compute the visible date range for the current view
  const { rangeStart, rangeEnd } = getVisibleRange(selectedDate, viewMode);

  const { data, isLoading } = useEvents({ start: rangeStart, end: rangeEnd });
  const events: CalendarEvent[] = data?.items ?? getMockEvents();

  function handleEventClick(event: CalendarEvent) {
    openEditModal(event);
  }

  function handleSlotClick(dateStr: string, hour?: number) {
    if (hour !== undefined) {
      const start = new Date(`${dateStr}T${String(hour).padStart(2, "0")}:00:00`);
      const end   = new Date(start.getTime() + 60 * 60_000);
      openCreateModal(start.toISOString(), end.toISOString());
    } else {
      setSelectedDate(dateStr);
      if (viewMode === "month") openCreateModal(`${dateStr}T09:00:00`, `${dateStr}T10:00:00`);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] px-4 py-4 sm:px-6 gap-4">
      {/* Header */}
      <CalendarHeader />

      {/* Calendar body */}
      {isLoading ? (
        <CalendarSkeleton />
      ) : (
        <div className="flex-1 min-h-0 rounded-xl border border-border bg-card overflow-hidden flex flex-col">
          {viewMode === "month" && (
            <MonthView
              events={events}
              onEventClick={handleEventClick}
              onSlotClick={handleSlotClick}
            />
          )}
          {viewMode === "week" && (
            <WeekView
              events={events}
              onEventClick={handleEventClick}
              onSlotClick={handleSlotClick}
            />
          )}
          {viewMode === "day" && (
            <DayView
              events={events}
              onEventClick={handleEventClick}
              onSlotClick={handleSlotClick}
            />
          )}
          {viewMode === "agenda" && (
            <div className="p-4 flex-1 overflow-y-auto">
              <AgendaView events={events} onEventClick={handleEventClick} />
            </div>
          )}
        </div>
      )}

      {/* Create modal */}
      <EventFormModal open={createModalOpen} onClose={closeCreateModal} />

      {/* Edit modal */}
      <EventFormModal
        event={editingEvent ?? undefined}
        open={!!editingEvent}
        onClose={closeEditModal}
      />
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getVisibleRange(
  selectedDate: string,
  viewMode: string
): { rangeStart: string; rangeEnd: string } {
  const d = new Date(selectedDate + "T00:00:00");

  if (viewMode === "month") {
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    // Expand to full 6-week grid
    start.setDate(start.getDate() - start.getDay() + 1);
    end.setDate(end.getDate() + (7 - end.getDay()));
    return { rangeStart: start.toISOString(), rangeEnd: end.toISOString() };
  }

  if (viewMode === "week") {
    const start = startOfWeek(d);
    const end   = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59);
    return { rangeStart: start.toISOString(), rangeEnd: end.toISOString() };
  }

  if (viewMode === "day") {
    const start = new Date(d);
    const end   = new Date(d);
    end.setHours(23, 59, 59);
    return { rangeStart: start.toISOString(), rangeEnd: end.toISOString() };
  }

  // Agenda — next 60 days
  const start = new Date(d);
  const end   = new Date(d);
  end.setDate(end.getDate() + 60);
  return { rangeStart: start.toISOString(), rangeEnd: end.toISOString() };
}

/** Rich mock events shown when the backend is not yet running. */
function getMockEvents(): CalendarEvent[] {
  const today = new Date();
  const fmt   = (d: Date) => d.toISOString();
  const add   = (base: Date, h: number, m = 0) => {
    const d = new Date(base);
    d.setHours(h, m, 0, 0);
    return d;
  };

  return [
    {
      id: "m1", userId: "mock", title: "Morning standup",
      description: "Daily team sync", start: fmt(add(today, 9)), end: fmt(add(today, 9, 30)),
      allDay: false, colorTag: "primary", location: "Google Meet",
      recurrence: { frequency: "daily", interval: 1, until: null, count: null },
      createdAt: fmt(today), updatedAt: fmt(today),
    },
    {
      id: "m2", userId: "mock", title: "Deep work: Feature planning",
      description: null, start: fmt(add(today, 10)), end: fmt(add(today, 12)),
      allDay: false, colorTag: "teal", location: null,
      recurrence: null, createdAt: fmt(today), updatedAt: fmt(today),
    },
    {
      id: "m3", userId: "mock", title: "1:1 with manager",
      description: "Weekly check-in", start: fmt(add(today, 14)), end: fmt(add(today, 14, 45)),
      allDay: false, colorTag: "purple", location: "Zoom",
      recurrence: { frequency: "weekly", interval: 1, until: null, count: null },
      createdAt: fmt(today), updatedAt: fmt(today),
    },
    {
      id: "m4", userId: "mock", title: "Team sync",
      description: null, start: fmt(add(today, 16)), end: fmt(add(today, 17)),
      allDay: false, colorTag: "blue", location: null,
      recurrence: null, createdAt: fmt(today), updatedAt: fmt(today),
    },
    {
      id: "m5", userId: "mock", title: "Product review",
      description: "Q3 roadmap review",
      start: fmt(add(new Date(today.getTime() + 86400000), 10)),
      end:   fmt(add(new Date(today.getTime() + 86400000), 11, 30)),
      allDay: false, colorTag: "orange", location: "Conference Room A",
      recurrence: null, createdAt: fmt(today), updatedAt: fmt(today),
    },
  ];
}
