"use client";

/**
 * [FUTURE M3 — Notifications] Notification polling / SSE hook stub.
 * Connect to GET /api/v1/notifications in Milestone 3.
 */
export function useNotifications() {
  return {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
  };
}
