"use client";

import { CheckCircle2, Clock, AlertTriangle, ListChecks } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTasks } from "@/hooks/useTasks";

/**
 * Small stat pills at the top of the Tasks page showing quick counts.
 * Fires 4 lightweight parallel queries (each filter = 1 count).
 */
export function TaskStatsBar() {
  const all       = useTasks({ filterBy: "all" });
  const today     = useTasks({ filterBy: "today" });
  const overdue   = useTasks({ filterBy: "overdue" });
  const completed = useTasks({ filterBy: "completed" });

  const loading = all.isLoading;

  const stats = [
    { label: "Total",     value: all.data?.total,       icon: ListChecks,   color: "text-foreground" },
    { label: "Due today", value: today.data?.total,     icon: Clock,        color: "text-primary" },
    { label: "Overdue",   value: overdue.data?.total,   icon: AlertTriangle,color: "text-destructive" },
    { label: "Completed", value: completed.data?.total, icon: CheckCircle2, color: "text-primary" },
  ];

  if (loading) {
    return (
      <div className="flex items-center gap-4 flex-wrap">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-28 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <div
          key={label}
          className="flex items-center gap-1.5 rounded-lg bg-muted/60 px-3 py-1.5 text-sm"
        >
          <Icon className={`size-3.5 ${color}`} aria-hidden />
          <span className="font-semibold text-foreground">{value ?? "—"}</span>
          <span className="text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
}
