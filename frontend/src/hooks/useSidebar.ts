"use client";

import { useEffect } from "react";
import { useUIStore } from "@/store/uiStore";

const STORAGE_KEY = "sidebar_collapsed";

/**
 * Sidebar collapse state hook with localStorage persistence.
 *
 * Reads the saved state from localStorage on first render and syncs
 * every toggle back to storage. The Zustand store is the source of
 * truth during the session; localStorage persists it across reloads.
 *
 * @returns `collapsed` (boolean) and `toggle` (function).
 */
export function useSidebar() {
  const collapsed = useUIStore((s) => s.collapsed);
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  // Restore from localStorage on mount (client only)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        setSidebarCollapsed(saved === "true");
      }
    } catch {
      // localStorage not available (SSR / private browsing)
    }
  }, [setSidebarCollapsed]);

  const toggle = () => {
    const next = !collapsed;
    toggleSidebar();
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // ignore
    }
  };

  return { collapsed, toggle };
}
