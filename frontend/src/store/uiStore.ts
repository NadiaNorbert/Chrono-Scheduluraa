/**
 * Global UI state store — sidebar collapse, mobile drawer.
 *
 * Sidebar persistence (localStorage) is handled by useSidebar hook,
 * not here, to keep the store pure and SSR-safe.
 */

import { create } from "zustand";

interface UIState {
  /** Whether the sidebar is in collapsed (icon-only) mode. */
  collapsed: boolean;
  /** Whether the mobile drawer overlay is open. */
  mobileDrawerOpen: boolean;
  /** Toggle the sidebar collapsed state. */
  toggleSidebar: () => void;
  /** Set sidebar collapsed state explicitly. */
  setSidebarCollapsed: (collapsed: boolean) => void;
  /** Open the mobile sidebar drawer. */
  openMobileDrawer: () => void;
  /** Close the mobile sidebar drawer. */
  closeMobileDrawer: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  collapsed: false,
  mobileDrawerOpen: false,

  toggleSidebar: () => set((state) => ({ collapsed: !state.collapsed })),
  setSidebarCollapsed: (collapsed) => set({ collapsed }),
  openMobileDrawer: () => set({ mobileDrawerOpen: true }),
  closeMobileDrawer: () => set({ mobileDrawerOpen: false }),
}));
