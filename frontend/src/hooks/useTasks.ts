"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchTasks,
  fetchTask,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskComplete,
} from "@/lib/tasks";
import type { TaskListParams, TaskCreate, TaskUpdate, Task } from "@/types/scheduler";

// ── Query keys ─────────────────────────────────────────────────────────────

export const taskKeys = {
  all:    ()             => ["tasks"] as const,
  lists:  ()             => ["tasks", "list"] as const,
  list:   (p: TaskListParams) => ["tasks", "list", p] as const,
  detail: (id: string)   => ["tasks", "detail", id] as const,
};

// ── Queries ────────────────────────────────────────────────────────────────

/**
 * Fetch a paginated, filtered list of tasks.
 * Falls back to mock data when the backend is unavailable.
 */
export function useTasks(params: TaskListParams = {}) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn:  () => fetchTasks(params),
    placeholderData: (prev) => prev,
  });
}

/** Fetch a single task by ID. */
export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn:  () => fetchTask(id),
    enabled:  !!id,
  });
}

// ── Mutations ──────────────────────────────────────────────────────────────

/** Create a new task with optimistic UI feedback. */
export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TaskCreate) => createTask(payload),
    onSuccess: (task) => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
      toast.success("Task created", { description: task.title });
    },
    onError: () => {
      toast.error("Failed to create task. Please try again.");
    },
  });
}

/** Update an existing task. */
export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TaskUpdate }) =>
      updateTask(id, payload),
    onSuccess: (task) => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
      qc.setQueryData(taskKeys.detail(task.id), task);
      toast.success("Task updated");
    },
    onError: () => {
      toast.error("Failed to update task.");
    },
  });
}

/** Delete a task with optimistic removal. */
export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
      toast.success("Task deleted");
    },
    onError: () => {
      toast.error("Failed to delete task.");
    },
  });
}

/** Toggle a task complete/incomplete with optimistic update. */
export function useToggleTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toggleTaskComplete(id),
    onMutate: async (id: string) => {
      // Cancel outgoing refetches
      await qc.cancelQueries({ queryKey: taskKeys.lists() });
      // Snapshot for rollback
      const previous = qc.getQueriesData({ queryKey: taskKeys.lists() });
      // Optimistically toggle in all cached list queries
      qc.setQueriesData(
        { queryKey: taskKeys.lists() },
        (old: unknown) => {
          if (!old || typeof old !== "object") return old;
          const data = old as { items: Task[] };
          return {
            ...data,
            items: data.items.map((t) =>
              t.id === id
                ? { ...t, completedAt: t.completedAt ? null : new Date().toISOString() }
                : t
            ),
          };
        }
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previous) {
        context.previous.forEach(([key, data]) => qc.setQueryData(key, data));
      }
      toast.error("Failed to update task.");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}
