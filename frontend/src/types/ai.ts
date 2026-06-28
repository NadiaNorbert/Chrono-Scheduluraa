/**
 * [FUTURE M3 — AI] Raw AI request/response type contracts for the Gemini client.
 */

export interface AIRequest {
  prompt: string;
  context: Record<string, unknown>;
  modelVersion?: string;
}

export interface AIResponse {
  content: string;
  modelVersion: string;
  tokensUsed: number;
  latencyMs: number;
}
