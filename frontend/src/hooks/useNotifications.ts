"use client";

import { useState, useCallback } from "react";
import type { Notification } from "@/types/notifications";

/** Rich mock notifications — replaced by real API in a future milestone. */
function getMockNotifications(): Notification[] {
  const now = new Date();
  const ago = (m: number) => new Date(now.getTime() - m * 60_000).toISOString();

  return [
    { id: "n1", userId: "mock", type: "ai_suggestion", title: "AI scheduling suggestion",
      body: "Chrono suggests moving your 3 PM meeting to 4 PM to protect your focus block.",
      readAt: null, createdAt: ago(5), actionUrl: "/dashboard/calendar" },
    { id: "n2", userId: "mock", type: "reminder", title: "Task due in 30 minutes",
      body: "\"Prepare Q3 budget summary\" is due at 3:00 PM today.",
      readAt: null, createdAt: ago(25), actionUrl: "/dashboard/tasks" },
    { id: "n3", userId: "mock", type: "reminder", title: "Habit reminder",
      body: "You haven't logged your meditation habit today. Keep your streak alive!",
      readAt: null, createdAt: ago(90), actionUrl: "/dashboard/habits" },
    { id: "n4", userId: "mock", type: "system", title: "Welcome to Chrono Schedulura",
      body: "Your account is all set up. Start by creating your first task or goal.",
      readAt: ago(60), createdAt: ago(1440), actionUrl: "/dashboard" },
    { id: "n5", userId: "mock", type: "ai_suggestion", title: "Weekly planning ready",
      body: "Your AI-generated schedule for next week is ready to review.",
      readAt: ago(30), createdAt: ago(2880), actionUrl: "/dashboard/ai" },
  ];
}

/**
 * Notification state hook with mock data.
 * Wire to GET /api/v1/notifications in a future milestone.
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(getMockNotifications);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, readAt: new Date().toISOString() } : n
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    const now = new Date().toISOString();
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? now })));
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notifications, unreadCount, isLoading: false, markAsRead, markAllAsRead, dismiss };
}
