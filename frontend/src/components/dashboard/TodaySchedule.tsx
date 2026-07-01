"use client";

import Link from "next/link";
import { CalendarDays, ArrowRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/index";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types/calendar";

interface TodayScheduleProps {
  events: CalendarEvent[] | undefined;
  isLoading: boolean;
}

/** Colour tags to Tailwind classes — mirrors the green/teal palette. */
const COLOR_TAG_MAP: Record<string, string> = {
  primary: "bg-primary",
  secondary: "bg-secondary-foreground/60",
  accent: "bg-accent-foreground/50",
};

/**
 * Today's schedule section — pulls today's events from the calendar API.
 * Falls back to dashboard mock data when the backend is not yet live.
 */
export function TodaySchedule({ events, isLoading }: TodayScheduleProps) {
  const sortedEvents = [...(events ?? [])].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Today&apos;s schedule</CardTitle>
      </CardHeader>

      <CardContent className="flex-1">
        {isLoading ? (
          <ScheduleSkeleton />
        ) : sortedEvents.length === 0 ? (
          <EmptySchedule />
        ) : (
          <ol
            aria-label="Today's events"
            className="relative border-l border-border ml-2 space-y-1 pl-4"
          >
            {sortedEvents.map((event, index) => (
              <EventItem key={event.id} event={event} isLast={index === sortedEvents.length - 1} />
            ))}
          </ol>
        )}
      </CardContent>

      {!isLoading && sortedEvents.length > 0 && (
        <CardFooter>
          <Link
            href="/dashboard/calendar"
            className="ml-auto inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors font-medium py-1"
          >
            Open calendar
            <ArrowRight className="size-3.5" />
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}

// ── Event item ─────────────────────────────────────────────────────────────

function EventItem({
  event,
  isLast,
}: {
  event: CalendarEvent;
  isLast: boolean;
}) {
  const start = new Date(event.start);
  const end = new Date(event.end);
  const isNow = start <= new Date() && new Date() <= end;

  const colorClass = event.colorTag
    ? COLOR_TAG_MAP[event.colorTag] ?? "bg-muted-foreground/40"
    : "bg-muted-foreground/40";

  return (
    <li className={cn("relative pb-4", isLast && "pb-0")}>
      {/* Timeline dot */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute -left-[1.35rem] top-1.5 size-2.5 rounded-full ring-2 ring-background",
          isNow ? "bg-primary" : colorClass
        )}
      />

      <div
        className={cn(
          "rounded-lg px-3 py-2.5 transition-colors",
          isNow
            ? "bg-primary/8 ring-1 ring-primary/20"
            : "bg-muted/40 hover:bg-muted/70"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm font-medium leading-snug",
              isNow && "text-primary"
            )}
          >
            {event.title}
          </p>
          {isNow && (
            <span className="shrink-0 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              Now
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatTime(start)} – {formatTime(end)}
          {event.recurrence && (
            <span className="ml-1.5 text-muted-foreground/70">
              · {event.recurrence.frequency}
            </span>
          )}
        </p>
      </div>
    </li>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────

function EmptySchedule() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <CalendarDays className="size-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">
          Nothing scheduled today
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Your calendar is clear. Enjoy the day!
        </p>
      </div>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function ScheduleSkeleton() {
  return (
    <div role="status" aria-label="Loading schedule" className="ml-2 pl-4 border-l border-border space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
