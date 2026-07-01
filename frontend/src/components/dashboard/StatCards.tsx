"use client";

import Link from "next/link";
import {
  CheckSquare,
  CalendarClock,
  TrendingUp,
  Timer,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { DashboardSummary } from "@/types/dashboard";

interface StatCardsProps {
  data: DashboardSummary | undefined;
  isLoading: boolean;
}

/**
 * Quick-statistics row — four clickable metric cards.
 * Each card navigates to its corresponding section.
 */
export function StatCards({ data, isLoading }: StatCardsProps) {
  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Loading statistics"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const completionRate =
    data && data.tasksTotal > 0
      ? Math.round((data.tasksCompleted / data.tasksTotal) * 100)
      : 0;

  const stats = [
    {
      label: "Tasks today",
      value: data?.tasksDueToday ?? 0,
      sub: `${data?.tasksCompleted ?? 0} completed`,
      icon: CheckSquare,
      iconClass: "bg-primary/10 text-primary",
      change: null as number | null,
      href: "/dashboard/tasks",
    },
    {
      label: "Total tasks",
      value: data?.tasksTotal ?? 0,
      sub: "in your backlog",
      icon: CalendarClock,
      iconClass: "bg-secondary text-secondary-foreground",
      change: null as number | null,
      href: "/dashboard/tasks",
    },
    {
      label: "Completion rate",
      value: `${completionRate}%`,
      sub: "tasks done",
      icon: TrendingUp,
      iconClass: "bg-accent text-accent-foreground",
      change: completionRate >= 50 ? 5 : -3,
      href: "/dashboard/analytics",
    },
    {
      label: "Focus time",
      value: formatMinutes(data?.focusMinutesToday ?? 0),
      sub: "today",
      icon: Timer,
      iconClass: "bg-muted text-muted-foreground",
      change: null as number | null,
      href: "/dashboard/analytics",
    },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}

// ── Individual card ────────────────────────────────────────────────────────

interface StatCardItemProps {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  change: number | null;
  href: string;
}

function StatCard({ label, value, sub, icon: Icon, iconClass, change, href }: StatCardItemProps) {
  return (
    <Link href={href} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
      <Card className="transition-all duration-150 group-hover:shadow-md group-hover:ring-primary/20 cursor-pointer h-full">
        <CardContent className="flex flex-col gap-3 py-4">
          <div className="flex items-start justify-between gap-2">
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-110",
                iconClass
              )}
              aria-hidden="true"
            >
              <Icon className="size-4" />
            </div>
            {change !== null && <ChangeIndicator change={change} />}
          </div>

          <div>
            <p className="text-2xl font-semibold tracking-tight text-foreground">
              {value}
            </p>
            <p className="text-xs font-medium text-foreground mt-0.5">{label}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ChangeIndicator({ change }: { change: number }) {
  const isPositive = change > 0;
  const isNeutral = change === 0;

  return (
    <span
      aria-label={`${isPositive ? "up" : isNeutral ? "no change" : "down"} ${Math.abs(change)}%`}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
        isPositive && "bg-primary/10 text-primary",
        !isPositive && !isNeutral && "bg-destructive/10 text-destructive",
        isNeutral && "bg-muted text-muted-foreground"
      )}
    >
      {isPositive ? (
        <TrendingUp className="size-2.5" />
      ) : isNeutral ? (
        <Minus className="size-2.5" />
      ) : (
        <TrendingDown className="size-2.5" />
      )}
      {Math.abs(change)}%
    </span>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 py-4">
        <div className="flex items-start justify-between">
          <Skeleton className="size-9 rounded-lg" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-14" />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
