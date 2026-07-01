"use client";

import Link from "next/link";
import { Menu, Bell, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useUIStore } from "@/store/uiStore";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getInitials } from "@/lib/utils";
import { MoonIcon, SunIcon } from "lucide-react";

/**
 * Sticky top bar for the authenticated dashboard shell.
 *
 * - Mobile hamburger → opens MobileNav drawer
 * - Search icon → navigates to /dashboard/search (placeholder)
 * - Theme toggle → cycles light ↔ dark
 * - Bell icon → navigates to /dashboard/notifications
 * - Avatar → navigates to /dashboard/profile
 */
export function TopBar() {
  const { user } = useAuth();
  const { resolvedTheme, toggle: toggleTheme } = useTheme();
  const openMobileDrawer = useUIStore((s) => s.openMobileDrawer);
  const { unreadCount } = useNotifications();

  const displayName =
    user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "User";
  const avatarUrl = user?.imageUrl ?? undefined;
  const initials = getInitials(displayName);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-sm lg:px-6">
      {/* Mobile menu trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden shrink-0"
        onClick={openMobileDrawer}
        aria-label="Open navigation menu"
      >
        <Menu className="size-5" />
      </Button>

      {/* Brand — mobile only */}
      <span className="font-semibold text-sm lg:hidden truncate">
        Chrono Schedulura
      </span>

      <div className="flex-1" />

      {/* Action buttons */}
      <div className="flex items-center gap-1">

        {/* Search */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Link
                href="/dashboard/search"
                aria-label="Search"
                className="hidden sm:inline-flex size-8 items-center justify-center rounded-lg text-foreground/70 hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              >
                <Search className="size-4" />
              </Link>
            }
          />
          <TooltipContent>Search</TooltipContent>
        </Tooltip>

        {/* Theme toggle */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                onClick={toggleTheme}
                aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                className="inline-flex size-8 items-center justify-center rounded-lg text-foreground/70 hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              >
                {resolvedTheme === "dark"
                  ? <SunIcon className="size-4" />
                  : <MoonIcon className="size-4" />}
              </button>
            }
          />
          <TooltipContent>
            {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
          </TooltipContent>
        </Tooltip>

        {/* Notification bell */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Link
                href="/dashboard/notifications"
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
                className="relative inline-flex size-8 items-center justify-center rounded-lg text-foreground/70 hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              >
                <Bell className="size-4" />
                {unreadCount > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-background"
                  />
                )}
              </Link>
            }
          />
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>

        {/* User avatar → profile */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Link
                href="/dashboard/profile"
                aria-label={`Profile: ${displayName}`}
                className="ml-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
              >
                <Avatar size="sm">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Link>
            }
          />
          <TooltipContent>Profile</TooltipContent>
        </Tooltip>

      </div>
    </header>
  );
}
