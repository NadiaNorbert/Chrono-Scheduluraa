/**
 * Analytics type contracts — mirrors backend response schema.
 */

export type AnalyticsPeriod = "day" | "week" | "month";

export interface DailyDataPoint {
  date:             string;  // YYYY-MM-DD
  tasksCompleted:   number;
  habitCompletions: number;
}

export interface ProductivityReport {
  period:            AnalyticsPeriod;
  start:             string;
  generatedAt:       string;
  tasksCreated:      number;
  tasksCompleted:    number;
  overdueTasks:      number;
  completionRate:    number;  // 0–100
  priorityBreakdown: Record<string, number>;
  habitCompletions:  number;
  activeHabits:      number;
  habitRate:         number;  // 0–100
  eventsAttended:    number;
  meetingMinutes:    number;
  dailySeries:       DailyDataPoint[];
}

// Keep existing event type for tracking
export interface AnalyticsEvent {
  eventName:  string;
  userId:     string;
  properties: Record<string, unknown>;
  timestamp:  string;
}
