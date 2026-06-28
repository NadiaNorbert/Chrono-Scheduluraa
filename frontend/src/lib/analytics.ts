/**
 * [FUTURE M4 — Analytics] Analytics event emitter stub.
 *
 * Replace the no-op implementation with a real analytics provider
 * (PostHog, Segment, Mixpanel, etc.) in Milestone 4.
 */

import type { AnalyticsEvent } from "@/types/analytics";

/**
 * Track a user analytics event.
 *
 * @param event - The analytics event to record.
 */
export function trackEvent(_event: AnalyticsEvent): void {
  // TODO: Implement in Milestone 4
  // e.g. posthog.capture(event.eventName, event.properties)
}

/**
 * Identify the current user in the analytics provider.
 *
 * @param userId - The Clerk user ID.
 * @param traits - Optional user properties to associate.
 */
export function identifyUser(_userId: string, _traits?: Record<string, unknown>): void {
  // TODO: Implement in Milestone 4
}
