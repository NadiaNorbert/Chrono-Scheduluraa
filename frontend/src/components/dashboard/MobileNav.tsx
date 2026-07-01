"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { ALL_NAV, type NavItem } from "@/config/navigation";

/**
 * Mobile slide-out navigation drawer.
 *
 * - Full nav parity with the desktop Sidebar.
 * - Closes on link click and backdrop click.
 * - Controlled by mobileDrawerOpen in Zustand UIStore.
 */
export function MobileNav() {
  const mobileDrawerOpen = useUIStore((s) => s.mobileDrawerOpen);
  const closeMobileDrawer = useUIStore((s) => s.closeMobileDrawer);
  const { unreadCount } = useNotifications();
  const pathname = usePathname();

  if (!mobileDrawerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        onClick={closeMobileDrawer}
      />

      {/* Drawer */}
      <nav
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground shadow-xl lg:hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border shrink-0">
          <Link
            href="/dashboard"
            onClick={closeMobileDrawer}
            className="flex items-center gap-2"
          >
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-xs select-none">
              CS
            </div>
            <span className="font-semibold text-sm">Chrono Schedulura</span>
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={closeMobileDrawer}
            aria-label="Close navigation"
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Nav links */}
        <ul className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5" role="list">
          {ALL_NAV.map((item) => (
            <MobileNavLink
              key={item.href}
              item={item}
              isActive={isActiveRoute(pathname, item.href)}
              onClose={closeMobileDrawer}
              badge={
                item.label === "Notifications" && unreadCount > 0
                  ? unreadCount
                  : undefined
              }
            />
          ))}
        </ul>
      </nav>
    </>
  );
}

// ── MobileNavLink ──────────────────────────────────────────────────────────

interface MobileNavLinkProps {
  item: NavItem;
  isActive: boolean;
  onClose: () => void;
  badge?: number;
}

function MobileNavLink({ item, isActive, onClose, badge }: MobileNavLinkProps) {
  const Icon = item.icon;

  return (
    <li>
      <Link
        href={item.href}
        onClick={onClose}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
      >
        <Icon className={cn("size-4 shrink-0", isActive && "stroke-[2.5]")} />
        <span className="flex-1">{item.label}</span>
        {badge !== undefined && badge > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-medium">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </Link>
    </li>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}
