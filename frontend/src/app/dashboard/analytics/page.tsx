"use client";

import { useState } from "react";
import {
  CheckSquare, Flame, CalendarDays, Clock,
  TrendingUp, AlertTriangle, RefreshCw,
} from "lucide-react";
import { useAnalyticsReport } from "@/hooks/useAnalytics";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, RadialProgress, StatTile } from "@/components/analytics";
import { cn } from "@/lib/utils";
import type { AnalyticsPeriod, ProductivityReport } from "@/types/analytics";

const PERIODS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "day",   label: "Today" },
  { value: "week",  label: "This week" },
  { value: "month", label: "This month" },
];

/** Rich mock shown when the backend is offline. */
function getMockReport(period: AnalyticsPeriod): ProductivityReport {
  const today = new Date();
  const days  = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return {
      date:             d.toISOString().split("T")[0],
      tasksCompleted:   Math.floor(Math.random() * 6) + 1,
      habitCompletions: Math.floor(Math.random() * 4),
    };
  });
  return {
    period, start: today.toISOString(), generatedAt: today.toISOString(),
    tasksCreated: 14, tasksCompleted: 9, overdueTasks: 2, completionRate: 64,
    priorityBreakdown: { high: 3, medium: 4, low: 2 },
    habitCompletions: 18, activeHabits: 4, habitRate: 75,
    eventsAttended: 8, meetingMinutes: 290,
    dailySeries: days,
  };
}

function formatMinutes(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h === 0) return `${min}m`;
  return min === 0 ? `${h}h` : `${h}h ${min}m`;
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("week");
  const { data, isLoading, isError, refetch } = useAnalyticsReport(period);
  const report = data ?? getMockReport(period);

  const chartData = report.dailySeries.map((d) => ({
    label:  new Date(d.date + "T00:00").toLocaleDateString("en-US", { weekday: "short" }),
    value:  d.tasksCompleted,
    value2: d.habitCompletions,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your productivity at a glance.
          </p>
        </div>

        {/* Period switcher */}
        <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 gap-0.5">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-all cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                period === p.value
                  ? "bg-background text-foreground font-medium shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {isError && (
        <div className="flex items-center gap-3 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="size-4 shrink-0" />
          Could not load analytics.
          <Button variant="ghost" size="sm" onClick={() => refetch()} className="ml-auto gap-1">
            <RefreshCw className="size-3.5" /> Retry
          </Button>
        </div>
      )}

      {/* Stat tiles */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile
            label="Tasks completed"
            value={report.tasksCompleted}
            sublabel={`of ${report.tasksCreated} created`}
            icon={CheckSquare}
            iconClass="bg-primary/10 text-primary"
            trend={report.completionRate >= 60 ? "up" : "down"}
            trendVal={`${report.completionRate}%`}
          />
          <StatTile
            label="Habit completions"
            value={report.habitCompletions}
            sublabel={`${report.habitRate}% consistency`}
            icon={Flame}
            iconClass="bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
            trend={report.habitRate >= 70 ? "up" : "neutral"}
            trendVal={`${report.habitRate}%`}
          />
          <StatTile
            label="Events attended"
            value={report.eventsAttended}
            sublabel={`${formatMinutes(report.meetingMinutes)} in meetings`}
            icon={CalendarDays}
            iconClass="bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
          />
          <StatTile
            label="Overdue tasks"
            value={report.overdueTasks}
            sublabel="need attention"
            icon={AlertTriangle}
            iconClass={report.overdueTasks > 0
              ? "bg-destructive/10 text-destructive"
              : "bg-primary/10 text-primary"}
            trend={report.overdueTasks === 0 ? "up" : report.overdueTasks > 3 ? "down" : "neutral"}
            trendVal={report.overdueTasks === 0 ? "All clear" : undefined}
          />
        </div>
      )}

      {/* Main grid: chart + radials */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* Activity chart */}
        <div className="lg:col-span-2 rounded-xl bg-card ring-1 ring-foreground/5 p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            Daily activity — last 7 days
          </h2>
          {isLoading ? (
            <Skeleton className="h-40 w-full rounded-lg" />
          ) : (
            <BarChart
              data={chartData}
              label1="Tasks"
              label2="Habits"
              color1="bg-primary"
              color2="bg-accent-foreground/40"
              height={160}
            />
          )}
        </div>

        {/* Radial progress rings */}
        <div className="rounded-xl bg-card ring-1 ring-foreground/5 p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-foreground">Completion rates</h2>
          {isLoading ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-28 w-28 rounded-full mx-auto" />
              <Skeleton className="h-28 w-28 rounded-full mx-auto" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <RadialProgress
                value={report.completionRate}
                label="Task completion"
                sublabel="rate"
                size={110}
              />
              <RadialProgress
                value={report.habitRate}
                label="Habit consistency"
                sublabel="rate"
                size={110}
                color="oklch(0.65 0.18 35)"
              />
            </div>
          )}
        </div>
      </div>

      {/* Priority breakdown */}
      {!isLoading && Object.keys(report.priorityBreakdown).length > 0 && (
        <div className="rounded-xl bg-card ring-1 ring-foreground/5 p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            Completed tasks by priority
          </h2>
          <div className="flex items-center gap-3 flex-wrap">
            {Object.entries(report.priorityBreakdown).map(([priority, count]) => {
              const total = Object.values(report.priorityBreakdown).reduce((a, b) => a + b, 0);
              const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
              const colors: Record<string, string> = {
                high:   "bg-destructive/10 text-destructive",
                medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
                low:    "bg-primary/10 text-primary",
              };
              return (
                <div key={priority} className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                  colors[priority] ?? "bg-muted text-muted-foreground"
                )}>
                  <span className="font-semibold text-base">{count}</span>
                  <div>
                    <p className="font-medium capitalize">{priority}</p>
                    <p className="text-xs opacity-70">{pct}% of completed</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
