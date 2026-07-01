/**
 * Single source of truth for all application navigation.
 *
 * Both Sidebar and MobileNav import from here so adding a new route
 * only ever requires a change in one place.
 */

import {
  LayoutDashboard,
  CalendarDays,
  ListChecks,
  Target,
  Repeat2,
  Sparkles,
  BarChart3,
  Users,
  Clock,
  Bell,
  Settings,
  UserCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Badge count — set dynamically at render time, not here. */
  badge?: number;
}

/** Primary navigation — shown in the main nav section of the sidebar. */
export const PRIMARY_NAV: NavItem[] = [
  { href: "/dashboard",               label: "Dashboard",  icon: LayoutDashboard },
  { href: "/dashboard/calendar",      label: "Calendar",   icon: CalendarDays    },
  { href: "/dashboard/schedule",      label: "Schedule",   icon: Clock           },
  { href: "/dashboard/tasks",         label: "Tasks",      icon: ListChecks      },
  { href: "/dashboard/goals",         label: "Goals",      icon: Target          },
  { href: "/dashboard/habits",        label: "Habits",     icon: Repeat2         },
  { href: "/dashboard/ai",            label: "AI Planner", icon: Sparkles        },
  { href: "/dashboard/analytics",     label: "Analytics",  icon: BarChart3       },
  { href: "/dashboard/collaboration", label: "Team",       icon: Users           },
];

/** Bottom navigation — utility links at the bottom of the sidebar. */
export const BOTTOM_NAV: NavItem[] = [
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell     },
  { href: "/dashboard/profile",       label: "Profile",       icon: UserCircle },
  { href: "/dashboard/settings",      label: "Settings",      icon: Settings  },
];

/** All nav items combined — used by MobileNav. */
export const ALL_NAV: NavItem[] = [...PRIMARY_NAV, ...BOTTOM_NAV];
