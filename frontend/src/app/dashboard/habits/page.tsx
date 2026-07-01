"use client";

import { useState } from "react";
import { Plus, Flame, RefreshCw } from "lucide-react";
import { useHabits } from "@/hooks/useHabits";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HabitCard, HabitFormModal } from "@/components/habits";
import type { Habit } from "@/types/habits";

/** Rich mock habits shown when the backend is offline. */
function getMockHabits(): Habit[] {
  return [
    { id: "h1", userId: "mock", title: "Morning exercise", description: "30 min workout",
      frequency: "daily", targetDays: [], color: "orange", icon: "🏃", isActive: true,
      createdAt: "", updatedAt: "", currentStreak: 7, longestStreak: 14,
      completionsThisWeek: 5, loggedToday: true },
    { id: "h2", userId: "mock", title: "Read for 20 minutes", description: null,
      frequency: "daily", targetDays: [], color: "blue", icon: "📚", isActive: true,
      createdAt: "", updatedAt: "", currentStreak: 3, longestStreak: 21,
      completionsThisWeek: 4, loggedToday: false },
    { id: "h3", userId: "mock", title: "Drink 8 glasses of water", description: null,
      frequency: "daily", targetDays: [], color: "teal", icon: "💧", isActive: true,
      createdAt: "", updatedAt: "", currentStreak: 12, longestStreak: 30,
      completionsThisWeek: 6, loggedToday: false },
    { id: "h4", userId: "mock", title: "Meditate", description: "10 min session",
      frequency: "daily", targetDays: [], color: "purple", icon: "🧘", isActive: true,
      createdAt: "", updatedAt: "", currentStreak: 2, longestStreak: 10,
      completionsThisWeek: 3, loggedToday: false },
  ];
}

export default function HabitsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const { data, isLoading, isError, refetch } = useHabits();
  const habits = data?.items ?? getMockHabits();

  const totalStreak     = habits.reduce((s, h) => s + h.currentStreak, 0);
  const completedToday  = habits.filter((h) => h.loggedToday).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Habits</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Build consistency, one day at a time.
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5 shrink-0">
          <Plus className="size-4" />
          New habit
        </Button>
      </div>

      {/* Summary bar */}
      {!isLoading && habits.length > 0 && (
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 px-3 py-2 text-sm">
            <Flame className="size-4 text-orange-500" />
            <span className="font-semibold text-foreground">{totalStreak}</span>
            <span className="text-muted-foreground">total streak days</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-primary/8 px-3 py-2 text-sm">
            <span className="text-lg">✅</span>
            <span className="font-semibold text-foreground">{completedToday}/{habits.length}</span>
            <span className="text-muted-foreground">done today</span>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <p className="text-sm font-medium text-foreground">Could not load habits</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw className="size-3.5" /> Try again
          </Button>
        </div>
      ) : habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <span className="text-5xl">🌱</span>
          <div>
            <p className="text-base font-semibold text-foreground">No habits yet</p>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs">
              Start building your first habit. Small steps lead to big changes.
            </p>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5">
            <Plus className="size-4" /> Create first habit
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onEdit={setEditingHabit}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <HabitFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <HabitFormModal
        habit={editingHabit ?? undefined}
        open={!!editingHabit}
        onClose={() => setEditingHabit(null)}
      />
    </div>
  );
}
