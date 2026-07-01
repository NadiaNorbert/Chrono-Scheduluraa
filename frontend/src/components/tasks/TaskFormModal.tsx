"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2 } from "lucide-react";
import { taskFormSchema, type TaskFormValues } from "@/lib/taskSchema";
import { useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import { useTaskStore } from "@/store/taskStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Task } from "@/types/scheduler";

interface TaskFormModalProps {
  /** If provided, the form is in edit mode. */
  task?: Task;
  open: boolean;
  onClose: () => void;
}

/**
 * Create / edit task modal.
 *
 * - Create mode: blank form, calls POST /api/v1/tasks
 * - Edit mode:   pre-filled form, calls PATCH /api/v1/tasks/:id
 */
export function TaskFormModal({ task, open, onClose }: TaskFormModalProps) {
  const isEdit = !!task;
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const isPending  = createTask.isPending || updateTask.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title:              task?.title ?? "",
      description:        task?.description ?? "",
      priority:           task?.priority ?? "medium",
      dueAt:              task?.dueAt ? toDatetimeLocal(task.dueAt) : "",
      estimatedMinutes:   task?.estimatedMinutes ?? undefined,
      tags:               task?.tags?.join(", ") ?? "",
    },
  });

  // Re-initialise form when task prop changes
  useEffect(() => {
    reset({
      title:            task?.title ?? "",
      description:      task?.description ?? "",
      priority:         task?.priority ?? "medium",
      dueAt:            task?.dueAt ? toDatetimeLocal(task.dueAt) : "",
      estimatedMinutes: task?.estimatedMinutes ?? undefined,
      tags:             task?.tags?.join(", ") ?? "",
    });
  }, [task, reset]);

  async function onSubmit(values: TaskFormValues) {
    const parsedTags = values.tags
      ? values.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const payload = {
      title:            values.title,
      description:      values.description || null,
      priority:         values.priority,
      dueAt:            values.dueAt ? new Date(values.dueAt).toISOString() : null,
      estimatedMinutes: values.estimatedMinutes ?? null,
      tags:             parsedTags,
    };

    if (isEdit && task) {
      await updateTask.mutateAsync({ id: task.id, payload });
    } else {
      await createTask.mutateAsync(payload);
    }
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit task" : "New task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">
          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="title" className="text-sm font-medium text-foreground">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              aria-invalid={!!errors.title}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="description" className="text-sm font-medium text-foreground">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="Optional details…"
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              {...register("description")}
            />
          </div>

          {/* Priority + Due date row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="priority" className="text-sm font-medium text-foreground">
                Priority
              </label>
              <select
                id="priority"
                className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                {...register("priority")}
              >
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="dueAt" className="text-sm font-medium text-foreground">
                Due date
              </label>
              <Input
                id="dueAt"
                type="datetime-local"
                className="h-8 text-sm"
                {...register("dueAt")}
              />
            </div>
          </div>

          {/* Estimate + Tags row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="estimatedMinutes" className="text-sm font-medium text-foreground">
                Estimate (min)
              </label>
              <Input
                id="estimatedMinutes"
                type="number"
                min={1}
                max={1440}
                placeholder="e.g. 30"
                className="h-8"
                {...register("estimatedMinutes", { valueAsNumber: true })}
              />
              {errors.estimatedMinutes && (
                <p className="text-xs text-destructive">{errors.estimatedMinutes.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="tags" className="text-sm font-medium text-foreground">
                Tags
              </label>
              <Input
                id="tags"
                placeholder="work, design, urgent"
                className="h-8"
                {...register("tags")}
              />
              <p className="text-[10px] text-muted-foreground">Comma-separated</p>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending && <Loader2 className="size-3.5 animate-spin" />}
              {isEdit ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Convert ISO UTC string to datetime-local input value (local time). */
function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
