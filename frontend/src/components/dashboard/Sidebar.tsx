"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/useSidebar";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PRIMARY_NAV, BOTTOM_NAV, type NavItem } from "@/config/navigation";

/**
 * Persistent desktop sidebar.
 *
 * - Collapsible (icon-only ↔ full) with localStorage persistence via useSidebar.
 * - Active state uses startsWith so nested routes stay highlighted.
 * - Every item navigates — no "coming soon" blocking.
 * - Hidden on mobile; MobileNav handles small screens.
 */
export function Sidebar() {
  const { collapsed, toggle } = useSidebar();
  const { unreadCount } = useNotifications();
  const pathname = usePathname();

  return (
    <aside
      aria-label="Main navigation"
      className={cn(
        "hidden lg:flex flex-col h-screen sticky top-0 shrink-0",
        "border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        "transition-[width] duration-200 ease-in-out",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* ── Logo ── */}
      <Link
        href="/dashboard"
        className={cn(
          "flex items-center gap-3 px-4 py-5 border-b border-sidebar-border shrink-0",
          "hover:bg-sidebar-accent transition-colors",
          collapsed && "justify-center px-0"
        )}
        aria-label="Go to dashboard"
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm select-none">
          CS
        </div>
        {!collapsed && (
          <span className="font-semibold text-sm tracking-tight truncate">
            Chrono Schedulura
          </span>
        )}
      </Link>

      {/* ── Primary nav ── */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2" aria-label="Primary navigation">
        {PRIMARY_NAV.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            collapsed={collapsed}
            isActive={isActiveRoute(pathname, item.href)}
          />
        ))}
      </nav>

      {/* ── Bottom nav ── */}
      <div className="border-t border-sidebar-border py-3 space-y-0.5 px-2">
        {BOTTOM_NAV.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            collapsed={collapsed}
            isActive={isActiveRoute(pathname, item.href)}
            badge={item.label === "Notifications" && unreadCount > 0 ? unreadCount : undefined}
          />
        ))}
      </div>

      {/* ── Collapse toggle ── */}
      <div className="px-2 pb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="w-full h-7 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          {collapsed
            ? <ChevronRight className="size-4" />
            : <ChevronLeft className="size-4" />}
        </Button>
      </div>
    </aside>
  );
}

// ── SidebarLink ────────────────────────────────────────────────────────────

interface SidebarLinkProps {
  item: NavItem;
  collapsed: boolean;
  isActive: boolean;
  badge?: number;
}

function SidebarLink({ item, collapsed, isActive, badge }: SidebarLinkProps) {
  const Icon = item.icon;

  const linkEl = (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        collapsed && "justify-center px-0"
      )}
    >
      <Icon className={cn("size-4 shrink-0", isActive && "stroke-[2.5]")} />

      {!collapsed && (
        <span className="truncate flex-1">{item.label}</span>
      )}

      {!collapsed && badge !== undefined && badge > 0 && (
        <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-medium">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={linkEl} />
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  }

  return linkEl;
}

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Returns true when the current pathname matches this nav item.
 * Exact match for /dashboard, startsWith for all nested routes.
 */
function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}
