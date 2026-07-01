"use client";

import { Flame, Trophy, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useToggleHabitLog, useDeleteHabit } from "@/hooks/useHabits";
import type { Habit } from "@/types/habits";

const COLOR_BG: Record<string, string> = {
  primary: "bg-primary/10 border-primary/20",
  orange:  "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800",
  blue:    "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
  purple:  "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800",
  red:     "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
  teal:    "bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-800",
};

const DOT_COLOR: Record<string, string> = {
  primary: "bg-primary",
  orange:  "bg-orange-500",
  blue:    "bg-blue-500",
  purple:  "bg-purple-500",
  red:     "bg-red-500",
  teal:    "bg-teal-500",
};

interface HabitCardProps {
  habit: Habit;
  onEdit: (habit: Habit) => void;
}

export function HabitCard({ habit, onEdit }: HabitCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleLog  = useToggleHabitLog();
  const deleteHabit = useDeleteHabit();

  const today    = new Date().toISOString().split("T")[0];
  const colorKey = habit.color ?? "primary";
  const cardBg   = COLOR_BG[colorKey] ?? COLOR_BG.primary;
  const dotColor = DOT_COLOR[colorKey] ?? DOT_COLOR.primary;

  function handleToggle() {
    toggleLog.mutate({ id: habit.id, loggedDate: today, isLogged: habit.loggedToday });
  }

  function handleDelete() {
    setMenuOpen(false);
    if (confirm(`Delete habit "${habit.title}"?`)) {
      deleteHabit.mutate(habit.id);
    }
  }

  return (
    <div className={cn(
      "relative rounded-xl border p-4 transition-all hover:shadow-sm",
      cardBg,
      habit.loggedToday && "ring-2 ring-primary/30"
    )}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {habit.icon && (
            <span className="text-xl shrink-0" role="img" aria-label={habit.title}>
              {habit.icon}
            </span>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{habit.title}</p>
            {habit.description && (
              <p className="text-xs text-muted-foreground truncate">{habit.description}</p>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
            aria-label="Habit options"
          >
            <MoreHorizontal className="size-4" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden />
              <div className="absolute right-0 top-7 z-20 min-w-[130px] rounded-lg border border-border bg-popover p-1 shadow-lg">
                <button
                  onClick={() => { setMenuOpen(false); onEdit(habit); }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm hover:bg-muted cursor-pointer"
                >
                  <Pencil className="size-3.5 text-muted-foreground" /> Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 cursor-pointer"
                >
                  <Trash2 className="size-3.5" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Streak stats */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1 text-sm">
          <Flame className={cn("size-4", habit.currentStreak > 0 ? "text-orange-500" : "text-muted-foreground")} />
          <span className="font-semibold text-foreground">{habit.currentStreak}</span>
          <span className="text-xs text-muted-foreground">day streak</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Trophy className="size-3.5 text-yellow-500" />
          <span>Best: {habit.longestStreak}</span>
        </div>
      </div>

      {/* Weekly dots */}
      <WeeklyDots habit={habit} dotColor={dotColor} />

      {/* Complete today button */}
      <button
        onClick={handleToggle}
        disabled={toggleLog.isPending}
        className={cn(
          "mt-3 w-full rounded-lg py-2 text-sm font-medium transition-all cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          habit.loggedToday
            ? "bg-primary/20 text-primary hover:bg-primary/30"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        {habit.loggedToday ? "✓ Done today" : "Mark complete"}
      </button>
    </div>
  );
}

function WeeklyDots({ habit, dotColor }: { habit: Habit; dotColor: string }) {
  const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
  const today      = new Date();
  const monday     = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  return (
    <div className="flex items-center gap-1">
      {DAY_LABELS.map((label, i) => {
        const dayDate  = new Date(monday);
        dayDate.setDate(monday.getDate() + i);
        const isPast   = dayDate <= today;
        const isToday2 = dayDate.toDateString() === today.toDateString();

        return (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] text-muted-foreground">{label}</span>
            <div className={cn(
              "size-3.5 rounded-full border transition-all",
              isToday2 && habit.loggedToday
                ? `${dotColor} border-transparent`
                : isToday2
                ? "border-primary bg-transparent"
                : isPast
                ? "bg-muted border-muted-foreground/20"
                : "bg-muted/50 border-muted-foreground/10"
            )} />
          </div>
        );
      })}
    </div>
  );
}
