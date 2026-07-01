"use client";

import { useCalendarStore } from "@/store/calendarStore";
import { cn } from "@/lib/utils";
import { isToday, toDateStr, formatTime, getEventColors } from "@/lib/calendarUtils";
import type { CalendarEvent } from "@/types/calendar";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface DayViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onSlotClick:  (dateStr: string, hour?: number) => void;
}

export function DayView({ events, onEventClick, onSlotClick }: DayViewProps) {
  const selectedDate = useCalendarStore((s) => s.selectedDate);
  const day          = new Date(selectedDate + "T00:00:00");
  const dayStr       = toDateStr(day);
  const today        = isToday(day);

  const dayEvents = events.filter((e) => {
    const start = new Date(e.start);
    return toDateStr(start) === dayStr && !e.allDay;
  });

  const allDayEvents = events.filter((e) => {
    return e.allDay && toDateStr(new Date(e.start)) === dayStr;
  });

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Day header */}
      <div className="flex items-center gap-3 py-3 px-4 border-b border-border">
        <div className={cn(
          "flex size-10 items-center justify-center rounded-full text-lg font-semibold",
          today ? "bg-primary text-primary-foreground" : "text-foreground"
        )}>
          {day.getDate()}
        </div>
        <div>
          <p className="font-medium text-sm text-foreground">
            {day.toLocaleDateString("en-US", { weekday: "long" })}
          </p>
          <p className="text-xs text-muted-foreground">
            {day.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* All-day events */}
      {allDayEvents.length > 0 && (
        <div className="px-4 py-2 border-b border-border flex flex-wrap gap-1">
          {allDayEvents.map((e) => {
            const colors = getEventColors(e.colorTag);
            return (
              <button
                key={e.id}
                onClick={() => onEventClick(e)}
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium cursor-pointer",
                  colors.bg, colors.text
                )}
              >
                {e.title}
              </button>
            );
          })}
        </div>
      )}

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="relative grid" style={{ gridTemplateColumns: "56px 1fr" }}>
          {/* Hour labels */}
          <div className="border-r border-border">
            {HOURS.map((h) => (
              <div key={h} className="h-14 flex items-start justify-end pr-2 pt-0.5">
                <span className="text-[10px] text-muted-foreground">
                  {h === 0 ? "" : `${h % 12 || 12}${h < 12 ? "am" : "pm"}`}
                </span>
              </div>
            ))}
          </div>

          {/* Day column */}
          <div className="relative">
            {HOURS.map((h) => (
              <div
                key={h}
                onClick={() => onSlotClick(dayStr, h)}
                className="h-14 border-b border-border/50 cursor-pointer hover:bg-muted/30 transition-colors"
              />
            ))}

            {/* Positioned events */}
            {dayEvents.map((event) => {
              const start  = new Date(event.start);
              const end    = new Date(event.end);
              const top    = ((start.getHours() * 60 + start.getMinutes()) / 60) * 56;
              const height = Math.max(
                ((end.getTime() - start.getTime()) / (1000 * 60 * 60)) * 56, 32
              );
              const colors = getEventColors(event.colorTag);

              return (
                <button
                  key={event.id}
                  onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                  style={{ top: `${top}px`, height: `${height}px` }}
                  className={cn(
                    "absolute left-1 right-1 rounded-lg px-2 py-1 text-left z-10",
                    "border-l-2 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity",
                    colors.bg, colors.text, colors.border
                  )}
                >
                  <p className="text-sm font-medium truncate">{event.title}</p>
                  <p className="text-xs opacity-75">
                    {formatTime(start)} – {formatTime(end)}
                  </p>
                  {event.location && (
                    <p className="text-xs opacity-60 truncate">📍 {event.location}</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
