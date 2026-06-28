import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS class names, resolving conflicts intelligently.
 *
 * @param inputs - Any number of class values (strings, objects, arrays).
 * @returns A single merged class string.
 *
 * @example
 * cn("px-2 py-1", condition && "bg-blue-500", "px-4") // → "py-1 bg-blue-500 px-4"
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format an ISO 8601 date string into a human-readable short date.
 *
 * @param isoString - ISO 8601 date string.
 * @param locale - BCP 47 locale tag (defaults to "en-US").
 * @returns Formatted date string, e.g. "Jun 28, 2026".
 */
export function formatDate(isoString: string, locale = "en-US"): string {
  return new Date(isoString).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Capitalise the first letter of a string.
 *
 * @param str - Input string.
 * @returns String with first letter uppercased.
 */
export function capitalise(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Return the user's initials from a display name or email.
 *
 * @param name - Display name or email address.
 * @returns Up to 2 uppercase initials, e.g. "JD" or "A".
 */
export function getInitials(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
