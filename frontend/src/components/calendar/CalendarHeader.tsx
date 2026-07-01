"use client";

import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useCalendarStore } from "@/store/calendarStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatHeader } from "@/lib/calendarUtils";
import type { CalendarViewMode } from "@/types/calendar";

const VIEW_OPTIONS: { value: CalendarViewMode; label: string }[] = [
  { value: "month",  label: "Month"  },
  { value: "week",   label: "Week"   },
  { value: "day",    label: "Day"    },
  { value: "agenda", label: "Agenda" },
];

export function CalendarHeader() {
  const viewMode       = useCalendarStore((s) => s.viewMode);
  const selectedDate   = useCalendarStore((s) => s.selectedDate);
  const setViewMode    = useCalendarStore((s) => s.setViewMode);
  const navigatePrev   = useCalendarStore((s) => s.navigatePrev);
  const navigateNext   = useCalendarStore((s) => s.navigateNext);
  const navigateToday  = useCalendarStore((s) => s.navigateToday);
  const openCreateModal = useCalendarStore((s) => s.openCreateModal);

  const headerLabel = formatHeader(new Date(selectedDate + "T00:00:00"), viewMode);

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      {/* Left: nav controls */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={navigateToday}>
          Today
        </Button>
        <div className="flex items-center">
          <Button
            variant="ghost" size="icon-sm"
            onClick={navigatePrev}
            aria-label="Previous"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost" size="icon-sm"
            onClick={navigateNext}
            aria-label="Next"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <h2 className="text-base font-semibold text-foreground min-w-[180px]">
          {headerLabel}
        </h2>
      </div>

      {/* Right: view switcher + create button */}
      <div className="flex items-center gap-2">
        {/* View tabs */}
        <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 gap-0.5">
          {VIEW_OPTIONS.map((v) => (
            <button
              key={v.value}
              onClick={() => setViewMode(v.value)}
              className={cn(
                "px-3 py-1 text-sm rounded-md transition-all cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                viewMode === v.value
                  ? "bg-background text-foreground font-medium shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>

        <Button size="sm" onClick={() => openCreateModal()} className="gap-1.5">
          <Plus className="size-4" />
          New event
        </Button>
      </div>
    </div>
  );
}
