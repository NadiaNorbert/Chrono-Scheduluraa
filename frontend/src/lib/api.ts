"use client";

import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { toast } from "sonner";

/**
 * Axios API client for Chrono Schedulura.
 *
 * - Injects the Clerk Bearer token on every request via a request interceptor.
 * - Dispatches `auth:unauthorized` custom event on 401 so the auth layout
 *   can sign the user out without circular imports.
 * - Shows a toast on network errors.
 *
 * Usage:
 *   import { apiClient } from "@/lib/api";
 *   const user = await apiClient.get("/api/v1/users/me");
 */

// Token getter is set by the useAuth hook after Clerk initialises.
// We use a ref-style mutable to avoid circular imports.
let _getToken: (() => Promise<string | null>) | null = null;

/**
 * Register the Clerk token getter. Called once from useAuth on mount.
 *
 * @param getter - Async function returning the current Clerk session token.
 */
export function registerTokenGetter(getter: () => Promise<string | null>): void {
  _getToken = getter;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor — inject Bearer token ──────────────────────────────
apiClient.interceptors.request.use(async (config) => {
  if (_getToken) {
    const token = await _getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ── Response interceptor — handle 401 and network errors ──────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Signal the authenticated layout to sign out and redirect to /login
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
    } else if (!error.response) {
      // Network / CORS / timeout error
      toast.error("Connection error. Please try again.");
    }
    return Promise.reject(error);
  }
);

export { apiClient };
export type { AxiosRequestConfig };
