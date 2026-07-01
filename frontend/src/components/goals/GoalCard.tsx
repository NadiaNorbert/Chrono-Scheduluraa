"use client";

import { useState } from "react";
import { Target, Calendar, Pencil, Trash2, MoreHorizontal, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDeleteGoal, useToggleMilestone, useAddMilestone } from "@/hooks/useGoals";
import type { Goal } from "@/types/goals";

const STATUS_STYLES: Record<string, string> = {
  active:    "bg-primary/10 text-primary border-primary/20",
  completed: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400",
  paused:    "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400",
  abandoned: "bg-muted text-muted-foreground border-border",
};

const COLOR_BORDER: Record<string, string> = {
  primary: "border-l-primary",
  blue:    "border-l-blue-500",
  purple:  "border-l-purple-500",
  orange:  "border-l-orange-500",
  red:     "border-l-red-500",
  teal:    "border-l-teal-500",
};

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
}

export function GoalCard({ goal, onEdit }: GoalCardProps) {
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [addingMs,      setAddingMs]      = useState(false);
  const [newMsTitle,    setNewMsTitle]    = useState("");
  const deleteGoal      = useDeleteGoal();
  const toggleMilestone = useToggleMilestone();
  const addMilestone    = useAddMilestone();

  const colorBorder = COLOR_BORDER[goal.color ?? "primary"] ?? "border-l-primary";
  const statusStyle = STATUS_STYLES[goal.status] ?? STATUS_STYLES.active;

  const daysLeft = goal.targetDate
    ? Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / 86400000)
    : null;

  async function handleAddMilestone() {
    if (!newMsTitle.trim()) return;
    await addMilestone.mutateAsync({
      goalId: goal.id,
      payload: { title: newMsTitle.trim(), orderIndex: goal.milestones.length },
    });
    setNewMsTitle("");
    setAddingMs(false);
  }

  return (
    <div className={cn(
      "rounded-xl bg-card ring-1 ring-foreground/5 border-l-4 p-4 space-y-4",
      "hover:shadow-sm transition-all",
      colorBorder
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {goal.icon && <span className="text-xl shrink-0">{goal.icon}</span>}
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{goal.title}</p>
            {goal.description && (
              <p className="text-xs text-muted-foreground truncate">{goal.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase", statusStyle)}>
            {goal.status}
          </span>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted cursor-pointer"
            >
              <MoreHorizontal className="size-4" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden />
                <div className="absolute right-0 top-7 z-20 min-w-[130px] rounded-lg border border-border bg-popover p-1 shadow-lg">
                  <button
                    onClick={() => { setMenuOpen(false); onEdit(goal); }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm hover:bg-muted cursor-pointer"
                  >
                    <Pencil className="size-3.5 text-muted-foreground" /> Edit
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); if (confirm(`Delete "${goal.title}"?`)) deleteGoal.mutate(goal.id); }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 cursor-pointer"
                  >
                    <Trash2 className="size-3.5" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-semibold text-foreground">{goal.progress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${goal.progress}%` }}
          />
        </div>
      </div>

      {/* Target date */}
      {goal.targetDate && (
        <div className={cn(
          "flex items-center gap-1.5 text-xs",
          daysLeft !== null && daysLeft < 0 ? "text-destructive" : "text-muted-foreground"
        )}>
          <Calendar className="size-3.5" />
          {daysLeft !== null && daysLeft < 0
            ? `${Math.abs(daysLeft)} days overdue`
            : daysLeft === 0
            ? "Due today"
            : daysLeft !== null
            ? `${daysLeft} days left`
            : new Date(goal.targetDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          }
        </div>
      )}

      {/* Milestones */}
      {(goal.milestones.length > 0 || addingMs) && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            Milestones ({goal.milestones.filter((m) => m.isDone).length}/{goal.milestones.length})
          </p>
          <ul className="space-y-1">
            {goal.milestones.map((ms) => (
              <li key={ms.id} className="flex items-center gap-2">
                <button
                  onClick={() => toggleMilestone.mutate({ goalId: goal.id, msId: ms.id, isDone: !ms.isDone })}
                  className={cn(
                    "flex size-4 shrink-0 cursor-pointer items-center justify-center rounded border transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    ms.isDone ? "border-primary bg-primary" : "border-border hover:border-primary"
                  )}
                  aria-label={ms.isDone ? "Mark incomplete" : "Mark complete"}
                >
                  {ms.isDone && <Check className="size-2.5 text-primary-foreground stroke-[3]" />}
                </button>
                <span className={cn(
                  "text-xs flex-1 truncate",
                  ms.isDone ? "line-through text-muted-foreground" : "text-foreground"
                )}>
                  {ms.title}
                </span>
                {ms.dueDate && (
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {new Date(ms.dueDate + "T00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                )}
              </li>
            ))}
          </ul>

          {/* Add milestone inline */}
          {addingMs && (
            <div className="flex items-center gap-1.5 mt-1">
              <input
                autoFocus
                value={newMsTitle}
                onChange={(e) => setNewMsTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddMilestone(); if (e.key === "Escape") setAddingMs(false); }}
                placeholder="Milestone title…"
                className="flex-1 h-7 rounded-md border border-input bg-transparent px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button
                onClick={handleAddMilestone}
                className="text-xs text-primary hover:text-primary/80 cursor-pointer font-medium"
              >
                Add
              </button>
              <button
                onClick={() => setAddingMs(false)}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add milestone button */}
      {!addingMs && (
        <button
          onClick={() => setAddingMs(true)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
        >
          <Plus className="size-3.5" />
          Add milestone
        </button>
      )}
    </div>
  );
}
