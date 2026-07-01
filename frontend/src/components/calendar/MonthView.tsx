"use client";

import { useCalendarStore } from "@/store/calendarStore";
import { cn } from "@/lib/utils";
import {
  getMonthGrid, isSameDay, isToday, toDateStr, getEventColors,
} from "@/lib/calendarUtils";
import type { CalendarEvent } from "@/types/calendar";

const WEEK_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface MonthViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onSlotClick:  (dateStr: string) => void;
}

export function MonthView({ events, onEventClick, onSlotClick }: MonthViewProps) {
  const selectedDate = useCalendarStore((s) => s.selectedDate);
  const ref = new Date(selectedDate + "T00:00:00");
  const grid = getMonthGrid(ref.getFullYear(), ref.getMonth());
  const currentMonth = ref.getMonth();

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {WEEK_HEADERS.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* 6-week grid */}
      <div className="grid grid-cols-7 flex-1 divide-x divide-y divide-border">
        {grid.map((day, i) => {
          const dayStr       = toDateStr(day);
          const isCurrentMonth = day.getMonth() === currentMonth;
          const today        = isToday(day);
          const isSelected   = isSameDay(day, ref);
          const dayEvents    = events.filter((e) => {
            const eStart = toDateStr(new Date(e.start));
            const eEnd   = toDateStr(new Date(e.end));
            return dayStr >= eStart && dayStr <= eEnd;
          });

          return (
            <div
              key={i}
              onClick={() => onSlotClick(dayStr)}
              className={cn(
                "relative min-h-[90px] p-1.5 cursor-pointer group transition-colors",
                "hover:bg-muted/40",
                !isCurrentMonth && "bg-muted/20"
              )}
            >
              {/* Date number */}
              <div className="flex justify-end mb-1">
                <span className={cn(
                  "inline-flex size-6 items-center justify-center rounded-full text-xs font-medium",
                  today
                    ? "bg-primary text-primary-foreground"
                    : isSelected
                    ? "bg-primary/15 text-primary"
                    : isCurrentMonth
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}>
                  {day.getDate()}
                </span>
              </div>

              {/* Events — show up to 3, then "+N more" */}
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((event) => {
                  const colors = getEventColors(event.colorTag);
                  return (
                    <button
                      key={event.id}
                      onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                      className={cn(
                        "w-full truncate rounded px-1.5 py-0.5 text-left text-[11px] font-medium",
                        "cursor-pointer transition-opacity hover:opacity-80",
                        colors.bg, colors.text
                      )}
                    >
                      {event.title}
                    </button>
                  );
                })}
                {dayEvents.length > 3 && (
                  <p className="text-[10px] text-muted-foreground pl-1">
                    +{dayEvents.length - 3} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
