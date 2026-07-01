"use client";

import {
  GreetingBanner,
  StatCards,
  UpcomingTasks,
  TodaySchedule,
  RecentActivity,
  DashboardError,
} from "@/components/dashboard";
import { useDashboard } from "@/hooks/useDashboard";

/**
 * Dashboard overview page — /dashboard
 *
 * Layout:
 *   - Personalised greeting + date
 *   - Quick statistics row (4 cards)
 *   - Two-column grid:
 *       Left:  Upcoming tasks  (spans 2 cols on wide screens)
 *       Right: Today's schedule
 *   - Full-width: Recent activity
 *
 * All sections handle their own loading (skeleton) and empty states.
 * A single top-level error card is shown if the data fetch fails.
 */
export default function DashboardPage() {
  const { data, isLoading, isError, error, refetch } = useDashboard();

  const errorMessage =
    error instanceof Error ? error.message : undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Greeting */}
      <GreetingBanner />

      {/* Top-level error — replaces content sections when the query errors out */}
      {isError && !isLoading && (
        <DashboardError message={errorMessage} onRetry={refetch} />
      )}

      {/* Statistics row */}
      {!isError && (
        <StatCards data={data} isLoading={isLoading} />
      )}

      {/* Main grid */}
      {!isError && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          {/* Upcoming tasks — wider */}
          <div className="lg:col-span-3">
            <UpcomingTasks
              tasks={data?.upcomingTasks}
              isLoading={isLoading}
            />
          </div>

          {/* Today's schedule — narrower */}
          <div className="lg:col-span-2">
            <TodaySchedule
              events={data?.todayEvents}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      {/* Recent activity — full width */}
      {!isError && (
        <RecentActivity
          items={data?.recentActivity}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
