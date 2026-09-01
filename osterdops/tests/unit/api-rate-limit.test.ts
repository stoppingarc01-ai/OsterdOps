/**
 * Unit Tests — API Rate Limit & 429 Response Standardization
 */

import { RateLimitedError } from "@/lib/api/errors";
import { apiError } from "@/lib/api/response";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export function runApiRateLimitTests() {
  // 1. RateLimitedError properties
  const err = new RateLimitedError("Too many calls", {
    requestId: "req_rl_001",
    retryAfterSeconds: 5,
    details: { limit: 120, remaining: 0 },
  });

  assert(err.statusCode === 429, "Rate limit error status must be 429.");
  assert(err.code === "RATE_LIMITED", "Error code must be RATE_LIMITED.");
  assert(err.retryAfterSeconds === 5, "Retry-After must be 5s.");

  // 2. apiError helper header injection
  const response = apiError("RATE_LIMITED", "Rate limit exceeded", 429, { limit: 120 }, "req_rl_002", 10);
  assert(response.status === 429, "Response status must be 429.");
  assert(response.headers.get("Retry-After") === "10", "Response must contain Retry-After header.");
  assert(response.headers.get("x-osterdops-request-id") === "req_rl_002", "Response must contain correlation ID.");
}
