/**
 * [FUTURE M2 — Calendar] Calendar event type contracts.
 * These types are defined now so TypeScript validates any usage
 * in future milestone components before they're implemented.
 */

export interface RecurrenceRule {
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  until: string | null; // ISO 8601 date
  count: number | null;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO 8601
  end: string;   // ISO 8601
  allDay: boolean;
  recurrence: RecurrenceRule | null;
  userId: string;
  colorTag: string | null;
}

export type CalendarViewMode = "day" | "week" | "month" | "agenda";
