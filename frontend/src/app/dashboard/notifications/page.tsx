"use client";

import Link from "next/link";
import { Bell, CheckCheck, X, Sparkles, Clock, Info, Users } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/notifications";

const TYPE_CONFIG: Record<Notification["type"], {
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  label: string;
}> = {
  ai_suggestion:       { icon: Sparkles,  iconClass: "bg-primary/10 text-primary",       label: "AI suggestion" },
  reminder:            { icon: Clock,     iconClass: "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400", label: "Reminder" },
  system:              { icon: Info,      iconClass: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400", label: "System" },
  collaboration_invite:{ icon: Users,     iconClass: "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400", label: "Invite" },
};

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismiss } = useNotifications();

  const unread = notifications.filter((n) => !n.readAt);
  const read   = notifications.filter((n) => n.readAt);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Stay on top of reminders, AI suggestions, and updates.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-1.5 shrink-0">
            <CheckCheck className="size-3.5" />
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Bell className="size-7 text-muted-foreground" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">All caught up!</p>
            <p className="mt-1 text-sm text-muted-foreground">No notifications right now.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Unread */}
          {unread.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                Unread
              </p>
              {unread.map((n) => (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  onRead={() => markAsRead(n.id)}
                  onDismiss={() => dismiss(n.id)}
                />
              ))}
            </div>
          )}

          {/* Read */}
          {read.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                Earlier
              </p>
              {read.map((n) => (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  onRead={() => markAsRead(n.id)}
                  onDismiss={() => dismiss(n.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface NotificationRowProps {
  notification: Notification;
  onRead:    () => void;
  onDismiss: () => void;
}

function NotificationRow({ notification: n, onRead, onDismiss }: NotificationRowProps) {
  const cfg    = TYPE_CONFIG[n.type];
  const Icon   = cfg.icon;
  const isRead = !!n.readAt;

  const inner = (
    <div
      onClick={!isRead ? onRead : undefined}
      className={cn(
        "group flex items-start gap-3 rounded-xl p-4 transition-all",
        "ring-1 ring-foreground/5 hover:ring-primary/20 hover:shadow-sm",
        isRead ? "bg-card opacity-70" : "bg-card cursor-pointer"
      )}
    >
      {/* Icon */}
      <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg mt-0.5", cfg.iconClass)}>
        <Icon className="size-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm font-medium leading-snug", !isRead && "text-foreground")}>
            {n.title}
          </p>
          <div className="flex items-center gap-1 shrink-0">
            {!isRead && (
              <span className="size-2 rounded-full bg-primary shrink-0 mt-1" aria-label="Unread" />
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onDismiss(); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded"
              aria-label="Dismiss"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
        <p className="text-[10px] text-muted-foreground mt-1.5">{formatRelativeTime(n.createdAt)}</p>
      </div>
    </div>
  );

  if (n.actionUrl) {
    return (
      <Link href={n.actionUrl} onClick={onRead}>
        {inner}
      </Link>
    );
  }

  return inner;
}
