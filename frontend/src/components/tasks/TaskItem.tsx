"use client";

import { useState } from "react";
import { Clock, Tag, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToggleTask, useDeleteTask } from "@/hooks/useTasks";
import { useTaskStore } from "@/store/taskStore";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@/types/scheduler";

interface TaskItemProps {
  task: Task;
}

const PRIORITY_STYLES: Record<Task["priority"], string> = {
  high:   "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400",
  low:    "bg-primary/8 text-primary border-primary/20",
};

const PRIORITY_LABELS: Record<Task["priority"], string> = {
  high: "High", medium: "Med", low: "Low",
};

/**
 * Single task row — checkbox toggle, title, metadata, action menu.
 */
export function TaskItem({ task }: TaskItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleTask  = useToggleTask();
  const deleteTask  = useDeleteTask();
  const openEditModal = useTaskStore((s) => s.openEditModal);

  const isCompleted = !!task.completedAt;
  const isOverdue   = !isCompleted && !!task.dueAt && new Date(task.dueAt) < new Date();

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    toggleTask.mutate(task.id);
  }

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation();
    setMenuOpen(false);
    openEditModal(task);
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    setMenuOpen(false);
    if (confirm(`Delete "${task.title}"?`)) {
      deleteTask.mutate(task.id);
    }
  }

  return (
    <li
      className={cn(
        "group relative flex items-start gap-3 rounded-xl px-4 py-3.5 transition-all",
        "bg-card ring-1 ring-foreground/5 hover:ring-primary/20 hover:shadow-sm",
        isCompleted && "opacity-60"
      )}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
        disabled={toggleTask.isPending}
        className={cn(
          "mt-0.5 flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isCompleted
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border hover:border-primary"
        )}
      >
        {isCompleted && (
          <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <polyline points="2,6 5,9 10,3" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className={cn(
          "text-sm font-medium leading-snug text-foreground",
          isCompleted && "line-through text-muted-foreground"
        )}>
          {task.title}
        </p>

        {task.description && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
            {task.description}
          </p>
        )}

        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {/* Due date */}
          {task.dueAt && (
            <span className={cn(
              "inline-flex items-center gap-1 text-xs",
              isOverdue ? "text-destructive font-medium" : "text-muted-foreground"
            )}>
              <Clock className="size-3" aria-hidden />
              {formatDue(task.dueAt)}
            </span>
          )}
          {/* Estimate */}
          {task.estimatedMinutes && (
            <span className="text-xs text-muted-foreground">
              ~{formatMinutes(task.estimatedMinutes)}
            </span>
          )}
          {/* Tags */}
          {task.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground"
            >
              <Tag className="size-2.5" aria-hidden />
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Priority badge */}
      <span className={cn(
        "shrink-0 self-start rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        PRIORITY_STYLES[task.priority]
      )}>
        {PRIORITY_LABELS[task.priority]}
      </span>

      {/* Action menu */}
      <div className="relative shrink-0 self-start">
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
          aria-label="Task actions"
          className={cn(
            "flex size-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            "hover:bg-muted focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          <MoreHorizontal className="size-4" />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
              aria-hidden
            />
            <div className="absolute right-0 top-7 z-20 min-w-[140px] rounded-lg border border-border bg-popover p-1 shadow-lg">
              <button
                onClick={handleEdit}
                className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-foreground hover:bg-muted cursor-pointer"
              >
                <Pencil className="size-3.5 text-muted-foreground" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 cursor-pointer"
              >
                <Trash2 className="size-3.5" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </li>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDue(iso: string): string {
  const now = new Date();
  const d   = new Date(iso);
  const diff = d.getTime() - now.getTime();
  const mins = Math.round(diff / 60_000);
  if (mins < -1440) return `${Math.abs(Math.round(mins / 1440))}d overdue`;
  if (mins < -60)   return `${Math.abs(Math.round(mins / 60))}h overdue`;
  if (mins < 0)     return "Overdue";
  if (mins < 60)    return `In ${mins}m`;
  if (mins < 1440)  return `In ${Math.round(mins / 60)}h`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatMinutes(m: number): string {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r === 0 ? `${h}h` : `${h}h ${r}m`;
}
