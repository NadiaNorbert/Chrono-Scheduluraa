/** Authenticated user record mirroring the backend UserRead schema. */
export interface User {
  id: string;
  clerkUserId: string;
  email: string;
  displayName: string | null;
  timezone: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Profile update payload for PATCH /api/v1/users/me */
export interface UserUpdate {
  displayName?: string;
  timezone?: string;
}
