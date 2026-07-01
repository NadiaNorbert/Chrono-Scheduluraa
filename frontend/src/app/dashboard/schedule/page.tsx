"use client";

import { useState } from "react";
import {
  ChevronLeft, ChevronRight, Sparkles,
  CheckSquare, CalendarDays, Flame, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isToday, formatTime } from "@/lib/calendarUtils";

interface ScheduleBlock {
  id:      string;
  type:    "task" | "event" | "habit" | "focus" | "break";
  title:   string;
  start:   Date;
  end:     Date;
  color:   string;
  aiNote?: string;
}

const TYPE_CONFIG = {
  task:  { icon: CheckSquare, label: "Task",       cls: "border-l-primary bg-primary/8 text-primary" },
  event: { icon: CalendarDays, label: "Event",     cls: "border-l-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300" },
  habit: { icon: Flame,        label: "Habit",     cls: "border-l-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300" },
  focus: { icon: Sparkles,     label: "Focus",     cls: "border-l-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300" },
  break: { icon: Clock,        label: "Break",     cls: "border-l-muted-foreground bg-muted text-muted-foreground" },
};

function getMockSchedule(date: Date): ScheduleBlock[] {
  const d = (h: number, m = 0) => { const n = new Date(date); n.setHours(h, m, 0, 0); return n; };
  return [
    { id: "s1", type: "habit", title: "Morning exercise",    start: d(7),    end: d(7, 30), color: "orange", aiNote: "Protects your 7-day streak" },
    { id: "s2", type: "habit", title: "Meditation",          start: d(7, 35),end: d(7, 45), color: "teal" },
    { id: "s3", type: "focus", title: "Deep work block",     start: d(9),    end: d(11),    color: "purple", aiNote: "AI-scheduled — your peak focus time" },
    { id: "s4", type: "task",  title: "Q3 budget summary",   start: d(9),    end: d(9, 45), color: "primary" },
    { id: "s5", type: "task",  title: "Review product deck", start: d(10),   end: d(10, 30), color: "primary" },
    { id: "s6", type: "event", title: "Morning standup",     start: d(11),   end: d(11, 30), color: "blue" },
    { id: "s7", type: "break", title: "Lunch break",         start: d(12),   end: d(13),    color: "muted" },
    { id: "s8", type: "task",  title: "Team update email",   start: d(13),   end: d(13, 20), color: "primary" },
    { id: "s9", type: "event", title: "1:1 with manager",    start: d(14),   end: d(14, 45), color: "blue" },
    { id:"s10", type: "focus", title: "Focus: research",     start: d(15),   end: d(17),    color: "purple", aiNote: "Protected from new meeting requests" },
    { id:"s11", type: "event", title: "Team sync",           start: d(17),   end: d(18),    color: "blue" },
  ];
}

function formatDateHeader(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
}

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const schedule = getMockSchedule(selectedDate);

  const nav = (dir: 1 | -1) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir);
    setSelectedDate(d);
  };

  const taskCount  = schedule.filter((b) => b.type === "task").length;
  const focusMins  = schedule.filter((b) => b.type === "focus")
    .reduce((s, b) => s + (b.end.getTime() - b.start.getTime()) / 60_000, 0);
  const meetingMins = schedule.filter((b) => b.type === "event")
    .reduce((s, b) => s + (b.end.getTime() - b.start.getTime()) / 60_000, 0);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Schedule</h1>
          <p className="text-sm text-muted-foreground mt-0.5">AI-optimised daily planner</p>
        </div>

        {/* Date nav */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => nav(-1)} aria-label="Previous day">
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline" size="sm"
            onClick={() => setSelectedDate(new Date())}
            className={cn(isToday(selectedDate) && "border-primary text-primary")}
          >
            {isToday(selectedDate) ? "Today" : "Go to today"}
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => nav(1)} aria-label="Next day">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Date heading */}
      <div className="flex items-baseline gap-2">
        <h2 className="text-base font-semibold text-foreground">
          {formatDateHeader(selectedDate)}
        </h2>
        {isToday(selectedDate) && (
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
            Today
          </span>
        )}
      </div>

      {/* Day stats */}
      <div className="flex items-center gap-3 flex-wrap">
        {[
          { label: "Tasks",        value: taskCount,             icon: CheckSquare,  cls: "text-primary" },
          { label: "Focus",        value: `${focusMins / 60}h`,  icon: Sparkles,     cls: "text-purple-600" },
          { label: "Meetings",     value: `${meetingMins / 60}h`,icon: CalendarDays, cls: "text-blue-600" },
        ].map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className="flex items-center gap-1.5 rounded-lg bg-muted/60 px-3 py-1.5 text-sm">
            <Icon className={cn("size-3.5", cls)} />
            <span className="font-semibold text-foreground">{value}</span>
            <span className="text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* AI banner */}
      <div className="flex items-start gap-3 rounded-xl bg-primary/8 border border-primary/20 px-4 py-3">
        <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-foreground">
          <span className="font-semibold text-primary">Chrono AI</span>
          {" "}optimised your schedule — focus blocks are protected and habits come first.
          Your peak hours (9–11 AM) are reserved for deep work.
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-2">
        {schedule.map((block) => {
          const cfg  = TYPE_CONFIG[block.type];
          const Icon = cfg.icon;
          const dur  = Math.round((block.end.getTime() - block.start.getTime()) / 60_000);

          return (
            <div
              key={block.id}
              className={cn(
                "flex items-start gap-3 rounded-xl border-l-4 px-4 py-3",
                "ring-1 ring-foreground/5 hover:ring-primary/20 transition-all",
                cfg.cls
              )}
            >
              <div className="shrink-0 mt-0.5">
                <Icon className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-snug">{block.title}</p>
                <p className="text-xs opacity-70 mt-0.5">
                  {formatTime(block.start)} – {formatTime(block.end)}
                  <span className="ml-1.5">· {dur < 60 ? `${dur}m` : `${dur / 60}h`}</span>
                </p>
                {block.aiNote && (
                  <p className="text-[10px] opacity-60 flex items-center gap-1 mt-1">
                    <Sparkles className="size-2.5" />
                    {block.aiNote}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-[10px] font-medium uppercase opacity-50 mt-0.5">
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
