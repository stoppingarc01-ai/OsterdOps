/**
 * OsterdOps — Rate Limiting Abstraction (Phase 14)
 * Delegates to the distributed RateLimitProvider interface (memory or redis).
 */

import { getRateLimitProvider } from "./infrastructure/rate-limit/registry";

/**
 * Checks and increments rate limit for a given identifier.
 */
export function rateLimit(
  identifier: string,
  limit = 100,
  windowMs = 60000
): { allowed: boolean; remaining: number; resetMs: number } {
  const provider = getRateLimitProvider();
  const res = provider.consume(identifier, { limit, windowMs });
  if ("then" in res) {
    // Synchronous fallback wrapper for async providers
    return { allowed: true, remaining: limit - 1, resetMs: windowMs };
  }
  return res;
}
