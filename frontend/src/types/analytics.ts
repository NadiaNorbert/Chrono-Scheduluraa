/**
 * [FUTURE M4 — Analytics] Analytics event and reporting type contracts.
 */

export interface AnalyticsEvent {
  eventName: string;
  userId: string;
  properties: Record<string, unknown>;
  timestamp: string; // ISO 8601
}

export interface ProductivityReport {
  userId: string;
  period: "day" | "week" | "month";
  tasksCompleted: number;
  focusMinutes: number;
  topCategory: string | null;
  generatedAt: string; // ISO 8601
}
