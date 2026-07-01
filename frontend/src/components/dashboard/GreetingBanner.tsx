"use client";

import { useAuth } from "@/hooks/useAuth";
import { capitalise } from "@/lib/utils";

/**
 * Personalised greeting at the top of the dashboard.
 * Derives the time-of-day salutation from the client clock.
 * Falls back to first name, or "there" if no name is available.
 */
export function GreetingBanner() {
  const { user } = useAuth();

  const firstName =
    user?.firstName ??
    user?.fullName?.split(" ")[0] ??
    null;

  const greeting = getGreeting();
  const name = firstName ? capitalise(firstName) : "there";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {greeting}, {name} 👋
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{today}</p>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
