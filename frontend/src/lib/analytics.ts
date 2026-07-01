/**
 * Analytics API service.
 */
import { apiClient } from "@/lib/api";
import type { ProductivityReport, AnalyticsPeriod } from "@/types/analytics";

function mapReport(r: Record<string, unknown>): ProductivityReport {
  return {
    period:            r.period as ProductivityReport["period"],
    start:             r.start as string,
    generatedAt:       r.generated_at as string,
    tasksCreated:      r.tasks_created as number,
    tasksCompleted:    r.tasks_completed as number,
    overdueTasks:      r.overdue_tasks as number,
    completionRate:    r.completion_rate as number,
    priorityBreakdown: (r.priority_breakdown ?? {}) as Record<string, number>,
    habitCompletions:  r.habit_completions as number,
    activeHabits:      r.active_habits as number,
    habitRate:         r.habit_rate as number,
    eventsAttended:    r.events_attended as number,
    meetingMinutes:    r.meeting_minutes as number,
    dailySeries: ((r.daily_series ?? []) as Record<string, unknown>[]).map((d) => ({
      date:             d.date as string,
      tasksCompleted:   d.tasks_completed as number,
      habitCompletions: d.habit_completions as number,
    })),
  };
}

export async function fetchProductivityReport(period: AnalyticsPeriod): Promise<ProductivityReport> {
  const res = await apiClient.get("/api/v1/analytics/report", { params: { period } });
  return mapReport(res.data as Record<string, unknown>);
}

export function trackEvent(_event: import("@/types/analytics").AnalyticsEvent): void {
  // Wire up PostHog / Segment in production
}

export function identifyUser(_userId: string, _traits?: Record<string, unknown>): void {
  // Wire up in production
}
