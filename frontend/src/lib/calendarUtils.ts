/**
 * Pure date/calendar utility functions.
 * No React, no side effects — safe to import anywhere.
 */

/** Return the Monday of the week containing `date`. */
export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Return array of 7 Date objects starting from Monday of the week of `date`. */
export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

/** Return array of Date objects for all days in the month grid (6 weeks × 7). */
export function getMonthGrid(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const startDay = startOfWeek(firstDay);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(startDay);
    d.setDate(startDay.getDate() + i);
    return d;
  });
}

/** Format as "Mon 3", "Wed 25" etc. */
export function formatWeekDay(date: Date): { day: string; num: number } {
  return {
    day: date.toLocaleDateString("en-US", { weekday: "short" }),
    num: date.getDate(),
  };
}

/** Return ISO YYYY-MM-DD for a Date. */
export function toDateStr(date: Date): string {
  return date.toISOString().split("T")[0];
}

/** True if two dates are the same calendar day. */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
}

/** True if `date` is today. */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/** Format time as "9:00 AM". */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

/** Format as "June 2026", "Week of Jun 30", etc. */
export function formatHeader(date: Date, viewMode: string): string {
  if (viewMode === "month") {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }
  if (viewMode === "week") {
    const start = startOfWeek(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const sm = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const em = end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `${sm} – ${em}`;
  }
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

/** Event color to Tailwind class mapping. */
export const COLOR_CLASSES: Record<string, { bg: string; text: string; border: string }> = {
  primary:  { bg: "bg-primary/15",    text: "text-primary",      border: "border-primary/30"  },
  blue:     { bg: "bg-blue-100",      text: "text-blue-700",     border: "border-blue-200"    },
  purple:   { bg: "bg-purple-100",    text: "text-purple-700",   border: "border-purple-200"  },
  pink:     { bg: "bg-pink-100",      text: "text-pink-700",     border: "border-pink-200"    },
  orange:   { bg: "bg-orange-100",    text: "text-orange-700",   border: "border-orange-200"  },
  yellow:   { bg: "bg-yellow-100",    text: "text-yellow-700",   border: "border-yellow-200"  },
  teal:     { bg: "bg-teal-100",      text: "text-teal-700",     border: "border-teal-200"    },
  red:      { bg: "bg-red-100",       text: "text-red-700",      border: "border-red-200"     },
  default:  { bg: "bg-muted",         text: "text-muted-foreground", border: "border-border"  },
};

export function getEventColors(colorTag: string | null) {
  if (!colorTag) return COLOR_CLASSES.primary;
  return COLOR_CLASSES[colorTag] ?? COLOR_CLASSES.primary;
}
