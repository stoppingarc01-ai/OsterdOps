/**
 * OsterdOps — Job Retry Policy & Error Classification (Phase 14)
 * Pure utility functions for exponential backoff and error retryability classification.
 */

/**
 * Calculates exponential backoff delay with bounded maximum.
 */
export function calculateExponentialBackoff(
  attempt: number,
  baseMs = 100,
  maxMs = 10000,
  factor = 2
): number {
  if (attempt <= 1) return baseMs;
  const delay = baseMs * Math.pow(factor, attempt - 1);
  return Math.min(maxMs, Math.round(delay));
}

/**
 * Determines whether an error is transient (retryable) or permanent (non-retryable).
 */
export function isRetryableError(error: unknown): boolean {
  if (!error) return false;

  const msg = (error instanceof Error ? error.message : String(error)).toLowerCase();

  // Non-retryable permanent error patterns
  const permanentPatterns = [
    "unauthorized",
    "invalid api key",
    "forbidden",
    "permission denied",
    "bad request",
    "not found",
    "invalid plan",
    "invalid parameter",
    "validation failed",
    "permanent",
  ];

  for (const pattern of permanentPatterns) {
    if (msg.includes(pattern)) {
      return false;
    }
  }

  // Explicit retryable transient patterns
  const retryablePatterns = [
    "timeout",
    "timed out",
    "econnreset",
    "econnrefused",
    "rate limit",
    "429",
    "500",
    "502",
    "503",
    "504",
    "network error",
    "unavailable",
    "temporary",
  ];

  for (const pattern of retryablePatterns) {
    if (msg.includes(pattern)) {
      return true;
    }
  }

  // Default to non-retryable for safety
  return false;
}
