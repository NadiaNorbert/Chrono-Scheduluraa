/**
 * Shared API response types used across all frontend modules.
 * All cross-module API contracts live here — no module imports from another module directly.
 */

/** Standard error envelope returned on all API error responses. */
export interface ApiError {
  detail: string;
  code: string;
}

/** Generic paginated list response envelope. */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
