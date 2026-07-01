"use client";

import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { useTaskStore } from "@/store/taskStore";
import { Button } from "@/components/ui/button";
import {
  TaskFormModal,
  TaskFilters,
  TaskList,
  TaskStatsBar,
} from "@/components/tasks";

/**
 * Tasks page — /dashboard/tasks
 *
 * Full task manager with:
 * - Stats bar (total / today / overdue / completed)
 * - Filter tabs (all / today / upcoming / overdue / completed)
 * - Priority filter pills
 * - Search bar
 * - Task list with optimistic toggle, edit, delete
 * - Create / edit modal
 */
export default function TasksPage() {
  const activeFilter   = useTaskStore((s) => s.activeFilter);
  const activePriority = useTaskStore((s) => s.activePriority);
  const searchQuery    = useTaskStore((s) => s.searchQuery);
  const createModalOpen = useTaskStore((s) => s.createModalOpen);
  const editingTask    = useTaskStore((s) => s.editingTask);
  const openCreateModal = useTaskStore((s) => s.openCreateModal);
  const closeCreateModal = useTaskStore((s) => s.closeCreateModal);
  const closeEditModal   = useTaskStore((s) => s.closeEditModal);

  const { data, isLoading, isError, refetch } = useTasks({
    filterBy:  activeFilter,
    priority:  activePriority ?? undefined,
    search:    searchQuery || undefined,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Tasks
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your work, one task at a time.
          </p>
        </div>
        <Button
          size="sm"
          onClick={openCreateModal}
          className="gap-1.5 shrink-0"
          aria-label="Create new task"
        >
          <Plus className="size-4" />
          New task
        </Button>
      </div>

      {/* ── Stats bar ── */}
      <TaskStatsBar />

      {/* ── Filters ── */}
      <TaskFilters />

      {/* ── Task list ── */}
      <TaskList
        tasks={data?.items}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        total={data?.total ?? 0}
      />

      {/* ── Create modal ── */}
      <TaskFormModal
        open={createModalOpen}
        onClose={closeCreateModal}
      />

      {/* ── Edit modal ── */}
      <TaskFormModal
        task={editingTask ?? undefined}
        open={!!editingTask}
        onClose={closeEditModal}
      />
    </div>
  );
}
