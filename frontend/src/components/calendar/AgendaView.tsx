"use client";

import { CalendarDays, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { isToday, isSameDay, formatTime, getEventColors } from "@/lib/calendarUtils";
import type { CalendarEvent } from "@/types/calendar";

interface AgendaViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

/** Group events by date for the agenda list. */
function groupByDate(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>();
  const sorted = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );
  for (const event of sorted) {
    const key = new Date(event.start).toDateString();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(event);
  }
  return map;
}

export function AgendaView({ events, onEventClick }: AgendaViewProps) {
  const grouped = groupByDate(events);

  if (grouped.size === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <CalendarDays className="size-7 text-muted-foreground" aria-hidden />
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">No events</p>
          <p className="mt-1 text-sm text-muted-foreground">
            No events found in this period. Create one to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-6 py-2">
      {Array.from(grouped.entries()).map(([dateStr, dayEvents]) => {
        const date     = new Date(dateStr);
        const todayDay = isToday(date);

        return (
          <div key={dateStr}>
            {/* Date heading */}
            <div className="flex items-center gap-3 mb-2 px-1">
              <div className={cn(
                "flex size-9 shrink-0 flex-col items-center justify-center rounded-xl text-center",
                todayDay ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                <span className={cn("text-[10px] font-medium uppercase leading-none",
                  todayDay ? "text-primary-foreground/80" : "text-muted-foreground"
                )}>
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span className="text-sm font-bold leading-snug">{date.getDate()}</span>
              </div>
              <p className={cn(
                "text-sm font-medium",
                todayDay ? "text-primary" : "text-foreground"
              )}>
                {todayDay ? "Today · " : ""}
                {date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>

            {/* Events for this day */}
            <div className="space-y-2 ml-12">
              {dayEvents.map((event) => {
                const start  = new Date(event.start);
                const end    = new Date(event.end);
                const colors = getEventColors(event.colorTag);

                return (
                  <button
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className={cn(
                      "w-full text-left rounded-xl p-3 border-l-4 cursor-pointer",
                      "hover:shadow-sm transition-all group",
                      "bg-card ring-1 ring-foreground/5 hover:ring-primary/20",
                      colors.border
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {event.title}
                      </p>
                      {event.allDay ? (
                        <span className="text-xs text-muted-foreground shrink-0">All day</span>
                      ) : (
                        <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                          <Clock className="size-3" />
                          {formatTime(start)} – {formatTime(end)}
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                        {event.description}
                      </p>
                    )}
                    {event.location && (
                      <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="size-3" />
                        {event.location}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
