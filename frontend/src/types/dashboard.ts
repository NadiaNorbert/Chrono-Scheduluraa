/**
 * Dashboard-specific view-model types.
 *
 * These are frontend-only aggregations used by the dashboard module.
 * They are separate from the canonical domain types in scheduler.ts / calendar.ts
 * so that the dashboard can evolve its data shape independently.
 */

import type { Task } from "@/types/scheduler";
import type { CalendarEvent } from "@/types/calendar";

/** A single stat shown in the quick-statistics row. */
export interface StatCard {
  id: string;
  label: string;
  value: number | string;
  /** Percentage change relative to previous period, e.g. +12 means +12%. */
  change: number | null;
  /** Icon name from lucide-react. */
  icon: string;
  /** Which CSS color role to use for the icon background. */
  color: "primary" | "secondary" | "accent" | "destructive";
}

/** Dashboard summary data returned by the API (or a mock while M3/M4 are pending). */
export interface DashboardSummary {
  tasksTotal: number;
  tasksDueToday: number;
  tasksCompleted: number;
  focusMinutesToday: number;
  upcomingTasks: Task[];
  todayEvents: CalendarEvent[];
  recentActivity: ActivityItem[];
}

/** A single entry in the recent-activity feed. */
export interface ActivityItem {
  id: string;
  type: "task_completed" | "event_created" | "habit_logged" | "ai_suggestion";
  title: string;
  description: string;
  timestamp: string; // ISO 8601
  icon: string;      // lucide icon name
}
