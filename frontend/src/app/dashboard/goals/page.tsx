"use client";

import { useState } from "react";
import { Plus, Target, RefreshCw } from "lucide-react";
import { useGoals } from "@/hooks/useGoals";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GoalCard, GoalFormModal } from "@/components/goals";
import { cn } from "@/lib/utils";
import type { Goal, GoalStatus } from "@/types/goals";

const FILTERS: { value: GoalStatus | "all"; label: string }[] = [
  { value: "all",       label: "All" },
  { value: "active",    label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "paused",    label: "Paused" },
];

function getMockGoals(): Goal[] {
  return [
    { id: "g1", userId: "mock", title: "Launch personal portfolio website", description: "Showcase my projects and skills",
      status: "active", targetDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      color: "primary", icon: "🚀", progress: 60, createdAt: "", updatedAt: "",
      milestones: [
        { id: "m1", goalId: "g1", userId: "mock", title: "Design mockups", isDone: true, dueDate: null, orderIndex: 0, createdAt: "" },
        { id: "m2", goalId: "g1", userId: "mock", title: "Build homepage", isDone: true, dueDate: null, orderIndex: 1, createdAt: "" },
        { id: "m3", goalId: "g1", userId: "mock", title: "Write case studies", isDone: false, dueDate: null, orderIndex: 2, createdAt: "" },
        { id: "m4", goalId: "g1", userId: "mock", title: "Deploy to production", isDone: false, dueDate: null, orderIndex: 3, createdAt: "" },
        { id: "m5", goalId: "g1", userId: "mock", title: "SEO optimisation", isDone: false, dueDate: null, orderIndex: 4, createdAt: "" },
      ]},
    { id: "g2", userId: "mock", title: "Read 12 books this year", description: "One book per month",
      status: "active", targetDate: new Date(new Date().getFullYear(), 11, 31).toISOString().split("T")[0],
      color: "orange", icon: "📖", progress: 42, createdAt: "", updatedAt: "",
      milestones: [
        { id: "m6", goalId: "g2", userId: "mock", title: "Q1 — 3 books", isDone: true, dueDate: null, orderIndex: 0, createdAt: "" },
        { id: "m7", goalId: "g2", userId: "mock", title: "Q2 — 3 books", isDone: false, dueDate: null, orderIndex: 1, createdAt: "" },
        { id: "m8", goalId: "g2", userId: "mock", title: "Q3 — 3 books", isDone: false, dueDate: null, orderIndex: 2, createdAt: "" },
        { id: "m9", goalId: "g2", userId: "mock", title: "Q4 — 3 books", isDone: false, dueDate: null, orderIndex: 3, createdAt: "" },
      ]},
    { id: "g3", userId: "mock", title: "Run a 5K race", description: "First 5K under 30 minutes",
      status: "completed", targetDate: null, color: "teal", icon: "🏆", progress: 100,
      createdAt: "", updatedAt: "", milestones: [] },
  ];
}

export default function GoalsPage() {
  const [filter,       setFilter]       = useState<GoalStatus | "all">("all");
  const [createOpen,   setCreateOpen]   = useState(false);
  const [editingGoal,  setEditingGoal]  = useState<Goal | null>(null);

  const { data, isLoading, isError, refetch } = useGoals(
    filter === "all" ? undefined : filter
  );
  const goals = data?.items ?? getMockGoals().filter(
    (g) => filter === "all" || g.status === filter
  );

  const activeCount    = (data?.items ?? getMockGoals()).filter((g) => g.status === "active").length;
  const completedCount = (data?.items ?? getMockGoals()).filter((g) => g.status === "completed").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Goals</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set meaningful goals, track milestones, achieve more.
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5 shrink-0">
          <Plus className="size-4" /> New goal
        </Button>
      </div>

      {/* Summary */}
      {!isLoading && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 rounded-lg bg-primary/8 px-3 py-1.5 text-sm">
            <Target className="size-4 text-primary" />
            <span className="font-semibold">{activeCount}</span>
            <span className="text-muted-foreground">active goals</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm">
            <span className="text-lg">🏆</span>
            <span className="font-semibold">{completedCount}</span>
            <span className="text-muted-foreground">completed</span>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {FILTERS.map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              filter === f.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="text-sm font-medium">Could not load goals</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw className="size-3.5" /> Try again
          </Button>
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <span className="text-5xl">🎯</span>
          <div>
            <p className="text-base font-semibold">No goals yet</p>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs">
              Set your first goal and break it into actionable milestones.
            </p>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5">
            <Plus className="size-4" /> Create first goal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onEdit={setEditingGoal} />
          ))}
        </div>
      )}

      <GoalFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <GoalFormModal goal={editingGoal ?? undefined} open={!!editingGoal} onClose={() => setEditingGoal(null)} />
    </div>
  );
}
