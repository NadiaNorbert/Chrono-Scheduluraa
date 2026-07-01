import type { Metadata } from "next";
import { ComingSoonPage } from "../_coming-soon";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <ComingSoonPage
      title="Search"
      emoji="🔍"
      description="Instantly search across all your tasks, events, habits, goals, and notes with intelligent full-text search."
      features={[
        "Full-text search across all content",
        "Filter by type, date, and priority",
        "Recent searches history",
        "Keyboard shortcut (⌘K)",
        "AI-powered semantic search",
      ]}
    />
  );
}
