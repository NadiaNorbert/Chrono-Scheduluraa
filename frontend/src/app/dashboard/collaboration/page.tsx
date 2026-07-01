import type { Metadata } from "next";
import { ComingSoonPage } from "../_coming-soon";

export const metadata: Metadata = { title: "Team" };

export default function CollaborationPage() {
  return (
    <ComingSoonPage
      title="Team"
      emoji="👥"
      description="Collaborate with your team in shared workspaces. Schedule together, assign tasks, and see everyone's availability in real time."
      features={[
        "Shared team workspaces",
        "Real-time presence and availability",
        "Collaborative task assignment",
        "Meeting scheduling with availability detection",
        "Team productivity dashboards",
      ]}
    />
  );
}
