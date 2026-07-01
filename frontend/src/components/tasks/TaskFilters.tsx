"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/store/taskStore";
import type { TaskFilter, Priority } from "@/types/scheduler";

const FILTERS: { value: TaskFilter; label: string }[] = [
  { value: "all",       label: "All" },
  { value: "today",     label: "Today" },
  { value: "upcoming",  label: "Upcoming" },
  { value: "overdue",   label: "Overdue" },
  { value: "completed", label: "Completed" },
];

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: "high",   label: "High",   color: "bg-destructive/10 text-destructive border-destructive/30" },
  { value: "medium", label: "Medium", color: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800" },
  { value: "low",    label: "Low",    color: "bg-primary/8 text-primary border-primary/20" },
];

/**
 * Filter tabs, priority pills, and search bar for the task list.
 */
export function TaskFilters() {
  const activeFilter   = useTaskStore((s) => s.activeFilter);
  const activePriority = useTaskStore((s) => s.activePriority);
  const searchQuery    = useTaskStore((s) => s.searchQuery);
  const setFilter      = useTaskStore((s) => s.setActiveFilter);
  const setPriority    = useTaskStore((s) => s.setActivePriority);
  const setSearch      = useTaskStore((s) => s.setSearchQuery);

  return (
    <div className="space-y-3">
      {/* Filter tabs */}
      <div
        role="tablist"
        aria-label="Task filters"
        className="flex items-center gap-1 flex-wrap"
      >
        {FILTERS.map((f) => (
          <button
            key={f.value}
            role="tab"
            aria-selected={activeFilter === f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              activeFilter === f.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Priority filter + Search */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Priority pills */}
        <div className="flex items-center gap-1">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              onClick={() => setPriority(activePriority === p.value ? null : p.value)}
              aria-pressed={activePriority === p.value}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide transition-all cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                activePriority === p.value
                  ? p.color + " ring-2 ring-offset-1 ring-offset-background ring-primary/30"
                  : p.color + " opacity-50 hover:opacity-100"
              )}
            >
              {p.label}
            </button>
          ))}
          {activePriority && (
            <button
              onClick={() => setPriority(null)}
              aria-label="Clear priority filter"
              className="ml-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative ml-auto min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks…"
            aria-label="Search tasks"
            className="h-8 w-full rounded-lg border border-input bg-transparent pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {searchQuery && (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
