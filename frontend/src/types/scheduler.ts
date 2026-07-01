/**
 * Task and scheduler type contracts.
 * These mirror the backend Pydantic schemas exactly.
 */

export type Priority = "high" | "medium" | "low";

export type TaskFilter = "all" | "today" | "upcoming" | "completed" | "overdue";

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  priority: Priority;
  dueAt: string | null;        // ISO 8601 UTC
  estimatedMinutes: number | null;
  completedAt: string | null;  // ISO 8601 UTC
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/** POST /api/v1/tasks */
export interface TaskCreate {
  title: string;
  description?: string | null;
  priority?: Priority;
  dueAt?: string | null;
  estimatedMinutes?: number | null;
  tags?: string[];
}

/** PATCH /api/v1/tasks/:id */
export interface TaskUpdate {
  title?: string;
  description?: string | null;
  priority?: Priority;
  dueAt?: string | null;
  estimatedMinutes?: number | null;
  completedAt?: string | null;
  tags?: string[];
}

/** GET /api/v1/tasks response envelope */
export interface TaskListResponse {
  items: Task[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/** Query params for list endpoint */
export interface TaskListParams {
  filterBy?: TaskFilter;
  priority?: Priority;
  search?: string;
  page?: number;
  pageSize?: number;
}

// ── AI types (future M4) ──────────────────────────────────────────────────────

export interface AIScheduledTask {
  taskId: string;
  start: string;
  end: string;
  confidence: number;
}

export interface AIScheduleResult {
  scheduledTasks: AIScheduledTask[];
  explanation: string;
  modelVersion: string;
}

export interface AISuggestion {
  suggestionId: string;
  type: "reschedule" | "focus_block" | "habit_reminder" | "deadline_warning";
  message: string;
  confidence: number;
  actionUrl: string | null;
}
