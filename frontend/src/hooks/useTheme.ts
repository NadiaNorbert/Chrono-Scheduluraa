"use client";

import { useTheme as useNextTheme } from "next-themes";

/**
 * Wrapper around next-themes `useTheme`.
 *
 * Provides the current resolved theme and a toggle function that
 * cycles between "light" and "dark". All components use this hook
 * instead of importing next-themes directly.
 *
 * @returns `theme` (current theme string), `setTheme`, and `toggle`.
 */
export function useTheme() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme();

  const toggle = () => {
    const current = resolvedTheme ?? theme;
    setTheme(current === "dark" ? "light" : "dark");
  };

  return {
    /** The active theme: "light" | "dark" | "system". */
    theme,
    /** The resolved theme (never "system"): "light" | "dark". */
    resolvedTheme,
    /** The OS-level preferred theme. */
    systemTheme,
    /** Explicitly set the theme. */
    setTheme,
    /** Toggle between light and dark. */
    toggle,
  };
}
