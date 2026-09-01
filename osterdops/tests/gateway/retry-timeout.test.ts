/**
 * OsterdOps — Resilient Retry Client & Timeout Policy Test Suite (Phase 22)
 */

import {
  parseRetryAfterHeader,
  calculateJitteredBackoff,
  executeProviderHttpWithRetry,
} from "@/lib/gateway/retry-client";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export async function runRetryTimeoutTests(): Promise<void> {
  console.log("▶ Running Resilient Retry & Timeout Policy Tests...");

  // 1. Retry-After Header Parsing
  const numericRetry = parseRetryAfterHeader("5");
  assert(numericRetry === 5000, "Numeric '5' parses to 5000ms");

  const zeroRetry = parseRetryAfterHeader("0");
  assert(zeroRetry === 0, "Numeric '0' parses to 0ms");

  const nullRetry = parseRetryAfterHeader(null);
  assert(nullRetry === null, "Null header parses to null");

  // Future HTTP Date parsing
  const futureDate = new Date(Date.now() + 10000).toUTCString();
  const dateRetry = parseRetryAfterHeader(futureDate);
  assert(dateRetry !== null && dateRetry > 0 && dateRetry <= 10000, "HTTP Date parses to positive ms duration");

  // 2. Jittered Backoff Range
  for (let attempt = 1; attempt <= 3; attempt++) {
    const delay = calculateJitteredBackoff(attempt, 50, 1000);
    assert(delay >= 50, `Delay (${delay}ms) at attempt ${attempt} is >= baseMs`);
    assert(delay <= 1000, `Delay (${delay}ms) at attempt ${attempt} is <= maxMs`);
  }

  // 3. Resilient Retry on Transient HTTP 500
  let attemptsCount = 0;
  const retryResult = await executeProviderHttpWithRetry(
    async () => {
      attemptsCount++;
      if (attemptsCount === 1) {
        // Return 500 on first try
        return new Response(JSON.stringify({ error: "Internal provider glitch" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
      // Return 200 on second try
      return new Response(JSON.stringify({ id: "success-res", choices: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    },
    { maxRetries: 2, baseBackoffMs: 10, maxBackoffMs: 50 }
  );

  assert(retryResult.attempts === 2, "Transient failure retried and succeeded on attempt 2");
  assert(retryResult.rawResponse.status === 200, "Final response status is 200");

  // 4. Non-Retryable Permanent Client Error (401 Unauthorized)
  let authAttempts = 0;
  const nonRetryResult = await executeProviderHttpWithRetry(
    async () => {
      authAttempts++;
      return new Response(JSON.stringify({ error: "Invalid API key" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    },
    { maxRetries: 2, baseBackoffMs: 10 }
  );

  assert(authAttempts === 1, "Permanent 401 error is NOT retried");
  assert(nonRetryResult.rawResponse.status === 401, "Status 401 returned immediately");

  console.log("✔ Resilient Retry & Timeout Policy Tests passed.");
}
