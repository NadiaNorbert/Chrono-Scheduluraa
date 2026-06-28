/**
 * [FUTURE M3 — Notifications] Notification state store stub.
 * Connect to polling/SSE API in Milestone 3.
 */
import { create } from "zustand";
import type { Notification } from "@/types/notifications";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, readAt: new Date().toISOString() } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
}));
