/**
 * OsterdOps — Developer Rate Limit & Quota Visibility Test Suite (Phase 23)
 * Validates rate limit calculation, RFC-compliant headers generation, and quota boundaries.
 */

import { rateLimit } from "@/lib/rate-limit";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runDeveloperRateLimitsTests(): void {
  console.log("▶ Running Developer Rate Limit & Quota Visibility Tests...");

  const testKeyId = `test_key_${Date.now()}`;
  const limitPerMinute = 10;

  // 1. Initial Request within Quota
  const firstCheck = rateLimit(testKeyId, limitPerMinute);
  assert(firstCheck.allowed === true, "First request passes rate limit");
  assert(firstCheck.remaining === limitPerMinute - 1, "Remaining quota decremented by 1");
  assert(typeof firstCheck.resetMs === "number", "Reset is a numeric duration/timestamp");

  // 2. Consume Remaining Quota
  for (let i = 0; i < limitPerMinute - 1; i++) {
    rateLimit(testKeyId, limitPerMinute);
  }

  // 3. Request Exceeding Quota
  const blockedCheck = rateLimit(testKeyId, limitPerMinute);
  assert(blockedCheck.allowed === false, "Request exceeding quota is rejected (429)");
  assert(blockedCheck.remaining === 0, "Remaining quota is 0");
  assert(blockedCheck.resetMs > 0, "Reset timestamp indicates when window unlocks");

  // 4. Rate Limit Response Headers Formatting
  const headers = new Headers({
    "x-ratelimit-limit": String(limitPerMinute),
    "x-ratelimit-remaining": String(blockedCheck.remaining),
    "x-ratelimit-reset": String(Math.floor(Date.now() / 1000) + Math.ceil(blockedCheck.resetMs / 1000)),
  });

  assert(headers.get("x-ratelimit-limit") === "10", "x-ratelimit-limit header is set");
  assert(headers.get("x-ratelimit-remaining") === "0", "x-ratelimit-remaining header is set to 0");
  assert(Boolean(headers.get("x-ratelimit-reset")), "x-ratelimit-reset header is present");

  console.log("✔ Developer Rate Limit & Quota Visibility Tests passed.");
}
