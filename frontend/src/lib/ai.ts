/**
 * [FUTURE M3 — AI] Gemini API client wrapper stub.
 *
 * Implement the real client here in Milestone 3.
 * This stub exports the typed interface so TypeScript validates call sites now.
 */

import type { AIRequest, AIResponse } from "@/types/ai";

/**
 * Send a raw prompt to the Gemini API.
 *
 * @param request - The AI request payload.
 * @returns The AI response.
 * @throws Will throw in M3 implementation if the API is unreachable.
 */
export async function sendAIRequest(_request: AIRequest): Promise<AIResponse> {
  // TODO: Implement in Milestone 3 using NEXT_PUBLIC_API_URL + /api/v1/scheduler/ai
  throw new Error("[FUTURE M3] AI client not yet implemented.");
}
