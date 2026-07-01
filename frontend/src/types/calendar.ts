/**
 * Calendar event type contracts — mirrors backend Pydantic schemas.
 */

export type CalendarViewMode = "month" | "week" | "day" | "agenda";

export type EventColor =
  | "primary" | "blue" | "purple" | "pink"
  | "orange" | "yellow" | "teal" | "red";

export interface RecurrenceRule {
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  interval:  number;
  until:     string | null;  // ISO 8601
  count:     number | null;
}

export interface CalendarEvent {
  id:          string;
  userId:      string;
  title:       string;
  description: string | null;
  start:       string;       // ISO 8601 (kept as "start" for dashboard compat)
  end:         string;       // ISO 8601
  allDay:      boolean;
  colorTag:    EventColor | string | null;
  location:    string | null;
  recurrence:  RecurrenceRule | null;
  createdAt:   string;
  updatedAt:   string;
}

/** POST /api/v1/events */
export interface EventCreate {
  title:       string;
  description?: string | null;
  start:        string;       // ISO 8601
  end:          string;
  allDay?:      boolean;
  colorTag?:    string | null;
  location?:    string | null;
  recurrence?:  RecurrenceRule | null;
}

/** PATCH /api/v1/events/:id */
export interface EventUpdate {
  title?:       string;
  description?: string | null;
  start?:       string;
  end?:         string;
  allDay?:      boolean;
  colorTag?:    string | null;
  location?:    string | null;
  recurrence?:  RecurrenceRule | null;
}

export interface EventListResponse {
  items:    CalendarEvent[];
  total:    number;
  page:     number;
  pageSize: number;
  hasMore:  boolean;
}

export interface EventListParams {
  start?:    string;  // ISO 8601
  end?:      string;
  page?:     number;
  pageSize?: number;
}
