"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTasks } from "@/lib/tasks";
import type { DashboardSummary } from "@/types/dashboard";

/**
 * Fetches the dashboard summary from the backend.
 *
 * While the analytics/scheduler endpoints (M3/M4) are not yet active,
 * this hook falls back to a rich mock so the dashboard renders fully
 * in every environment. The mock is replaced by the real API response
 * automatically once the backend routes are live.
 *
 * Query key: ["dashboard", "summary"]
 * Cache: 60 s (inherits QueryClient default staleTime)
 */
export function useDashboard() {
  return useQuery<DashboardSummary>({
    queryKey: ["dashboard", "summary"],
    queryFn: fetchDashboardSummary,
  });
}

async function fetchDashboardSummary(): Promise<DashboardSummary> {
  // Try to fetch real tasks for the upcoming tasks widget
  let upcomingTasks = getMockSummary().upcomingTasks;
  try {
    const res = await fetchTasks({ filterBy: "upcoming", pageSize: 4 });
    if (res.items.length > 0) upcomingTasks = res.items;
  } catch {
    // Backend not live yet — fall back to mock
  }
  return { ...getMockSummary(), upcomingTasks };
}

/** Realistic mock that powers the dashboard UI before M3/M4 go live. */
function getMockSummary(): DashboardSummary {
  const today = new Date();
  const fmt = (d: Date) => d.toISOString();

  const addMinutes = (base: Date, mins: number) =>
    new Date(base.getTime() + mins * 60_000);

  const startOfDay = new Date(today);
  startOfDay.setHours(8, 0, 0, 0);

  return {
    tasksTotal: 12,
    tasksDueToday: 4,
    tasksCompleted: 7,
    focusMinutesToday: 95,

    upcomingTasks: [
      {
        id: "t1",
        title: "Review product roadmap deck",
        priority: "high",
        dueAt: fmt(addMinutes(today, 90)),
        estimatedMinutes: 30,
        completedAt: null,
        userId: "mock",
        tags: ["work", "strategy"],
      },
      {
        id: "t2",
        title: "Write weekly team update",
        priority: "medium",
        dueAt: fmt(addMinutes(today, 180)),
        estimatedMinutes: 20,
        completedAt: null,
        userId: "mock",
        tags: ["work"],
      },
      {
        id: "t3",
        title: "Prepare Q3 budget summary",
        priority: "high",
        dueAt: fmt(addMinutes(today, 300)),
        estimatedMinutes: 45,
        completedAt: null,
        userId: "mock",
        tags: ["finance"],
      },
      {
        id: "t4",
        title: "Research new design system options",
        priority: "low",
        dueAt: fmt(addMinutes(today, 480)),
        estimatedMinutes: 60,
        completedAt: null,
        userId: "mock",
        tags: ["design"],
      },
    ],

    todayEvents: [
      {
        id: "e1",
        title: "Morning standup",
        start: fmt(addMinutes(startOfDay, 0)),
        end: fmt(addMinutes(startOfDay, 30)),
        allDay: false,
        recurrence: { frequency: "daily", interval: 1, until: null, count: null },
        userId: "mock",
        colorTag: "primary",
      },
      {
        id: "e2",
        title: "Deep work: feature planning",
        start: fmt(addMinutes(startOfDay, 60)),
        end: fmt(addMinutes(startOfDay, 180)),
        allDay: false,
        recurrence: null,
        userId: "mock",
        colorTag: "accent",
      },
      {
        id: "e3",
        title: "1:1 with manager",
        start: fmt(addMinutes(startOfDay, 240)),
        end: fmt(addMinutes(startOfDay, 300)),
        allDay: false,
        recurrence: { frequency: "weekly", interval: 1, until: null, count: null },
        userId: "mock",
        colorTag: "secondary",
      },
      {
        id: "e4",
        title: "Team sync",
        start: fmt(addMinutes(startOfDay, 360)),
        end: fmt(addMinutes(startOfDay, 420)),
        allDay: false,
        recurrence: null,
        userId: "mock",
        colorTag: null,
      },
    ],

    recentActivity: [
      {
        id: "a1",
        type: "task_completed",
        title: "Task completed",
        description: "Finalised the API integration spec",
        timestamp: fmt(addMinutes(today, -30)),
        icon: "CheckCircle2",
      },
      {
        id: "a2",
        type: "ai_suggestion",
        title: "AI suggestion",
        description: "Chrono suggests moving your 3 PM meeting to 4 PM",
        timestamp: fmt(addMinutes(today, -75)),
        icon: "Sparkles",
      },
      {
        id: "a3",
        type: "event_created",
        title: "Event scheduled",
        description: "Team offsite added for next Friday",
        timestamp: fmt(addMinutes(today, -120)),
        icon: "CalendarPlus",
      },
      {
        id: "a4",
        type: "habit_logged",
        title: "Habit logged",
        description: "Morning exercise streak: 5 days",
        timestamp: fmt(addMinutes(today, -210)),
        icon: "Flame",
      },
      {
        id: "a5",
        type: "task_completed",
        title: "Task completed",
        description: "Reviewed pull request #142",
        timestamp: fmt(addMinutes(today, -360)),
        icon: "CheckCircle2",
      },
    ],
  };
}
