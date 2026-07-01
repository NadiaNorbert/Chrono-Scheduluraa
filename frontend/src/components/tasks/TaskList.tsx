"use client";

import { ListChecks, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { TaskItem } from "./TaskItem";
import type { Task } from "@/types/scheduler";

interface TaskListProps {
  tasks:     Task[] | undefined;
  isLoading: boolean;
  isError:   boolean;
  onRetry:   () => void;
  total:     number;
}

/**
 * Renders the list of tasks with loading, empty, and error states.
 */
export function TaskList({ tasks, isLoading, isError, onRetry, total }: TaskListProps) {
  if (isLoading) {
    return (
      <ul role="status" aria-label="Loading tasks" className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-xl bg-card px-4 py-3.5 ring-1 ring-foreground/5"
          >
            <Skeleton className="mt-0.5 size-5 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-5 w-12 rounded-full shrink-0" />
          </li>
        ))}
      </ul>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <p className="text-sm font-medium text-foreground">Could not load tasks</p>
        <p className="text-xs text-muted-foreground">
          Check your connection or try again.
        </p>
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5">
          <RefreshCw className="size-3.5" />
          Try again
        </Button>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground px-1">
        {total} task{total !== 1 ? "s" : ""}
      </p>
      <ul role="list" aria-label="Tasks" className="space-y-2">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </ul>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <ListChecks className="size-7 text-muted-foreground" aria-hidden />
      </div>
      <div>
        <p className="text-base font-semibold text-foreground">No tasks here</p>
        <p className="mt-1 text-sm text-muted-foreground max-w-xs">
          Create a task to get started. Use the button above.
        </p>
      </div>
    </div>
  );
}
