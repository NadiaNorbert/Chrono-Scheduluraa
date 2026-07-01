import type { Metadata } from "next";
import { Sidebar, TopBar, MobileNav } from "@/components/dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
};

/**
 * Authenticated dashboard shell layout.
 *
 * Structure:
 *   ┌──────────┬───────────────────────────────────┐
 *   │          │  TopBar                           │
 *   │ Sidebar  ├───────────────────────────────────┤
 *   │ (lg+)    │  <page content>                   │
 *   │          │                                   │
 *   └──────────┴───────────────────────────────────┘
 *
 * - Sidebar is sticky and desktop-only; MobileNav handles small screens.
 * - TopBar is sticky at the top of the content area.
 * - The main scroll container is the right column, not the whole page.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile drawer — portal, renders on top */}
      <MobileNav />

      {/* Main content column */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
