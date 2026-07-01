import { QueryClient } from "@tanstack/react-query";

/**
 * TanStack Query client with sensible production defaults.
 *
 * - staleTime: 60 s — data is considered fresh for 1 minute.
 * - retry: 1 — one retry on failure (prevents hammering the API on hard errors).
 * - refetchOnWindowFocus: false — avoids unnecessary re-fetches on tab switches.
 * - throwOnError: false — prevents unhandled rejection noise when backend is offline.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: false,           // No retries — hooks fall back to mock immediately
      refetchOnWindowFocus: false,
      throwOnError: false,    // Don't bubble errors to error boundaries by default
    },
    mutations: {
      retry: 0,
      throwOnError: false,
    },
  },
});
