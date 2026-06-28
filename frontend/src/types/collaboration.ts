/**
 * [FUTURE M5 — Collaboration] Workspace and member type contracts.
 */

export interface WorkspaceMember {
  userId: string;
  role: "owner" | "editor" | "viewer";
  joinedAt: string; // ISO 8601
  presenceStatus: "online" | "away" | "offline";
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  members: WorkspaceMember[];
  createdAt: string; // ISO 8601
}
