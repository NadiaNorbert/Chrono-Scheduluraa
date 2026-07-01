"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

/**
 * TanStack Query provider.
 *
 * Wraps the app so any component can use useQuery / useMutation.
 * This must be a Client Component because QueryClientProvider uses context.
 * The queryClient instance lives in lib/queryClient.ts to keep this file minimal.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
