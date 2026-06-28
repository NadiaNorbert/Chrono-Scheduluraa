import { QueryClient } from "@tanstack/react-query";

/**
 * TanStack Query client with sensible production defaults.
 *
 * - staleTime: 60 s — data is considered fresh for 1 minute.
 * - retry: 1 — one retry on failure (prevents hammering the API on hard errors).
 * - refetchOnWindowFocus: false — avoids unnecessary re-fetches on tab switches.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
