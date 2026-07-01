"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Sparkles,
  CalendarPlus,
  Flame,
  Activity,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/index";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/types/dashboard";

interface RecentActivityProps {
  items: ActivityItem[] | undefined;
  isLoading: boolean;
}

/** Icon map — keyed by icon name from the ActivityItem type. */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  CheckCircle2,
  Sparkles,
  CalendarPlus,
  Flame,
};

const ACTIVITY_COLORS: Record<ActivityItem["type"], string> = {
  task_completed: "bg-primary/10 text-primary",
  ai_suggestion: "bg-accent text-accent-foreground",
  event_created: "bg-secondary text-secondary-foreground",
  habit_logged: "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
};

/**
 * Recent activity feed — shows the last 5 user actions across all modules.
 */
export function RecentActivity({ items, isLoading }: RecentActivityProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>

      <CardContent className="flex-1">
        {isLoading ? (
          <ActivitySkeleton />
        ) : !items || items.length === 0 ? (
          <EmptyActivity />
        ) : (
          <ul
            role="list"
            aria-label="Recent activity"
            className="space-y-1"
          >
            {items.map((item) => (
              <ActivityRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </CardContent>

      {!isLoading && items && items.length > 0 && (
        <CardFooter>
          <Link
            href="/dashboard/notifications"
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

// ── Activity row ───────────────────────────────────────────────────────────

function ActivityRow({ item }: { item: ActivityItem }) {
  const Icon = ICON_MAP[item.icon] ?? Activity;
  const colorClass = ACTIVITY_COLORS[item.type];

  return (
    <li className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50">
      <div
        aria-hidden="true"
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg mt-0.5",
          colorClass
        )}
      >
        <Icon className="size-3.5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground leading-snug">
          {item.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
          {item.description}
        </p>
      </div>

      <time
        dateTime={item.timestamp}
        className="shrink-0 text-xs text-muted-foreground mt-0.5"
      >
        {formatRelativeTime(item.timestamp)}
      </time>
    </li>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────

function EmptyActivity() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Activity className="size-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">No recent activity</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Your actions will appear here as you use the app.
        </p>
      </div>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function ActivitySkeleton() {
  return (
    <ul role="status" aria-label="Loading activity" className="space-y-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i} className="flex items-start gap-3 px-2 py-2.5">
          <Skeleton className="mt-0.5 size-8 rounded-lg shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-3 w-10 mt-0.5 shrink-0" />
        </li>
      ))}
    </ul>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatRelativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diffMs / 60_000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
