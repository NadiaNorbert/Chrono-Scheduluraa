/**
 * [FUTURE M3 — AI Scheduler] Task and AI scheduling type contracts.
 */

export interface Task {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  dueAt: string | null;       // ISO 8601
  estimatedMinutes: number | null;
  completedAt: string | null; // ISO 8601
  userId: string;
  tags: string[];
}

export interface AIScheduledTask {
  taskId: string;
  start: string;      // ISO 8601
  end: string;        // ISO 8601
  confidence: number; // 0–1
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
  confidence: number; // 0–1
  actionUrl: string | null;
}
