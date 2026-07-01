"use client";

import { useCalendarStore } from "@/store/calendarStore";
import { cn } from "@/lib/utils";
import {
  getWeekDays, isToday, isSameDay, toDateStr,
  formatTime, getEventColors,
} from "@/lib/calendarUtils";
import type { CalendarEvent } from "@/types/calendar";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface WeekViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onSlotClick:  (dateStr: string, hour?: number) => void;
}

export function WeekView({ events, onEventClick, onSlotClick }: WeekViewProps) {
  const selectedDate = useCalendarStore((s) => s.selectedDate);
  const weekDays = getWeekDays(new Date(selectedDate + "T00:00:00"));

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Day headers */}
      <div className="grid border-b border-border" style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}>
        <div className="border-r border-border" />
        {weekDays.map((day) => (
          <div key={day.toISOString()} className={cn(
            "py-2 text-center border-r border-border last:border-0",
          )}>
            <p className="text-xs text-muted-foreground">
              {day.toLocaleDateString("en-US", { weekday: "short" })}
            </p>
            <span className={cn(
              "inline-flex size-7 items-center justify-center rounded-full text-sm font-semibold mt-0.5",
              isToday(day)
                ? "bg-primary text-primary-foreground"
                : isSameDay(day, new Date(selectedDate + "T00:00:00"))
                ? "bg-primary/15 text-primary"
                : "text-foreground"
            )}>
              {day.getDate()}
            </span>
          </div>
        ))}
      </div>

      {/* Time grid — scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="relative grid" style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}>
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

          {/* Day columns */}
          {weekDays.map((day) => {
            const dayStr = toDateStr(day);
            const dayEvents = events.filter((e) => {
              const start = new Date(e.start);
              return toDateStr(start) === dayStr && !e.allDay;
            });

            return (
              <div
                key={dayStr}
                className="relative border-r border-border last:border-0"
              >
                {/* Hour slots */}
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
                    ((end.getTime() - start.getTime()) / (1000 * 60 * 60)) * 56,
                    28
                  );
                  const colors = getEventColors(event.colorTag);

                  return (
                    <button
                      key={event.id}
                      onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                      style={{ top: `${top}px`, height: `${height}px` }}
                      className={cn(
                        "absolute left-0.5 right-0.5 rounded-md px-1.5 py-0.5 text-left",
                        "overflow-hidden cursor-pointer transition-opacity hover:opacity-80",
                        "border-l-2 text-[11px] font-medium z-10",
                        colors.bg, colors.text, colors.border
                      )}
                    >
                      <p className="truncate">{event.title}</p>
                      <p className="truncate opacity-75">
                        {formatTime(start)}
                      </p>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
