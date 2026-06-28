/**
 * [FUTURE M5 — Collaboration] Workspace presence state store stub.
 * Connect to WebSocket in Milestone 5.
 */
import { create } from "zustand";
import type { WorkspaceMember } from "@/types/collaboration";

interface CollaborationState {
  activeWorkspaceId: string | null;
  onlineMembers: WorkspaceMember[];
}

export const useCollaborationStore = create<CollaborationState>(() => ({
  activeWorkspaceId: null,
  onlineMembers: [],
}));
