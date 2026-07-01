"use client";

import Link from "next/link";
import { CheckSquare, Clock, Tag, ArrowRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Badge,
} from "@/components/ui/index";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/scheduler";

interface UpcomingTasksProps {
  tasks: Task[] | undefined;
  isLoading: boolean;
}

/**
 * Upcoming tasks section — shows the next 4 tasks ordered by due date.
 * Handles loading (skeletons), empty state, and populated states.
 */
export function UpcomingTasks({ tasks, isLoading }: UpcomingTasksProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Upcoming tasks</CardTitle>
      </CardHeader>

      <CardContent className="flex-1">
        {isLoading ? (
          <TaskListSkeleton />
        ) : !tasks || tasks.length === 0 ? (
          <EmptyTasks />
        ) : (
          <ul className="space-y-2" role="list" aria-label="Upcoming tasks">
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </ul>
        )}
      </CardContent>

      {!isLoading && tasks && tasks.length > 0 && (
        <CardFooter>
          <Link
            href="/dashboard/tasks"
            className="ml-auto inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors font-medium py-1"
          >
            View all
            <ArrowRight className="size-3.5" />
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}

// ── Task row ───────────────────────────────────────────────────────────────

function TaskRow({ task }: { task: Task }) {
  const dueLabel = task.dueAt ? formatRelativeTime(task.dueAt) : null;
  const isOverdue =
    task.dueAt != null &&
    new Date(task.dueAt) < new Date() &&
    !task.completedAt;

  return (
    <li>
      <Link
        href="/dashboard/tasks"
        className="group flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
      {/* Checkbox placeholder */}
      <div
        aria-hidden="true"
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border",
          task.completedAt
            ? "border-primary bg-primary"
            : "border-border bg-background"
        )}
      >
        {task.completedAt && (
          <CheckSquare className="size-3 text-primary-foreground" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-medium leading-snug truncate",
            task.completedAt && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-2">
          {/* Due time */}
          {dueLabel && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs",
                isOverdue ? "text-destructive" : "text-muted-foreground"
              )}
            >
              <Clock className="size-3" aria-hidden="true" />
              {dueLabel}
            </span>
          )}

          {/* Tags */}
          {task.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-[10px] text-muted-foreground"
            >
              <Tag className="size-2.5" aria-hidden="true" />
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Priority badge */}
        <PriorityBadge priority={task.priority} />
      </Link>
    </li>
  );
}

// ── Priority badge ─────────────────────────────────────────────────────────

const PRIORITY_MAP = {
  high: { label: "High", variant: "destructive" as const },
  medium: { label: "Med", variant: "secondary" as const },
  low: { label: "Low", variant: "outline" as const },
};

function PriorityBadge({ priority }: { priority: Task["priority"] }) {
  const { label, variant } = PRIORITY_MAP[priority];
  return (
    <Badge variant={variant} aria-label={`Priority: ${label}`}>
      {label}
    </Badge>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────

function EmptyTasks() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <CheckSquare className="size-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">No tasks due soon</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          You&apos;re all caught up! Add tasks to stay on track.
        </p>
      </div>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function TaskListSkeleton() {
  return (
    <ul role="status" aria-label="Loading tasks" className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="flex items-start gap-3 px-2 py-2.5">
          <Skeleton className="mt-0.5 size-4 rounded shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-5 w-10 rounded-full" />
        </li>
      ))}
    </ul>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatRelativeTime(isoString: string): string {
  const now = new Date();
  const target = new Date(isoString);
  const diffMs = target.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60_000);

  if (diffMins < -1440) return `${Math.abs(Math.round(diffMins / 1440))}d overdue`;
  if (diffMins < -60) return `${Math.abs(Math.round(diffMins / 60))}h overdue`;
  if (diffMins < 0) return "Overdue";
  if (diffMins < 60) return `In ${diffMins}m`;
  if (diffMins < 1440) return `In ${Math.round(diffMins / 60)}h`;
  return `In ${Math.round(diffMins / 1440)}d`;
}
