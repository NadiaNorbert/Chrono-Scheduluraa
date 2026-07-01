"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProductivityReport } from "@/lib/analytics";
import type { AnalyticsPeriod } from "@/types/analytics";

export const analyticsKeys = {
  report: (period: AnalyticsPeriod) => ["analytics", "report", period] as const,
};

export function useAnalyticsReport(period: AnalyticsPeriod = "week") {
  return useQuery({
    queryKey: analyticsKeys.report(period),
    queryFn:  () => fetchProductivityReport(period),
    staleTime: 5 * 60 * 1000, // 5 min — analytics don't need instant freshness
  });
}

// Keep old export name for backward compatibility
export function useAnalytics() {
  return { report: null, isLoading: false };
}
