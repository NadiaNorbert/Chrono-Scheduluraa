"use client";

import { useEffect } from "react";
import { useUser, useClerk, useAuth as useClerkAuth } from "@clerk/nextjs";
import { registerTokenGetter } from "@/lib/api";

/**
 * Abstraction over the Clerk SDK.
 *
 * Returns the current user, session token, loading state, and a signOut
 * function. All components use this hook instead of importing Clerk directly,
 * so swapping auth providers only requires changes here.
 *
 * Side effect: registers the Clerk token getter with the Axios API client
 * so requests are automatically authenticated.
 */
export function useAuth() {
  const { user, isLoaded: userLoaded } = useUser();
  const { signOut } = useClerk();
  const { getToken, isLoaded: authLoaded } = useClerkAuth();

  // Register the token getter once Clerk has initialised
  useEffect(() => {
    registerTokenGetter(() => getToken());
  }, [getToken]);

  return {
    /** The Clerk User object, or null when unauthenticated / loading. */
    user,
    /** True once Clerk has finished loading the session. */
    isLoaded: userLoaded && authLoaded,
    /** True when a user session is active. */
    isSignedIn: !!user,
    /**
     * Get the current Clerk session JWT.
     * @returns The token string, or null if unauthenticated.
     */
    getToken: () => getToken(),
    /**
     * Sign the user out and redirect to /login.
     */
    signOut: () => signOut({ redirectUrl: "/" }),
  };
}
