/**
 * [FUTURE M3 — Notifications] Notification type contracts.
 */

export interface Notification {
  id: string;
  userId: string;
  type: "reminder" | "ai_suggestion" | "collaboration_invite" | "system";
  title: string;
  body: string;
  readAt: string | null;  // ISO 8601
  createdAt: string;      // ISO 8601
  actionUrl: string | null;
}
