/**
 * OsterdOps — Phase 14: Retry Policy & Error Classification Unit Tests
 */

import { calculateExponentialBackoff, isRetryableError } from "@/lib/jobs/retry";

export function testRetryPolicy() {
  // 1. Exponential backoff
  const b1 = calculateExponentialBackoff(1, 100, 10000, 2);
  const b2 = calculateExponentialBackoff(2, 100, 10000, 2);
  const b3 = calculateExponentialBackoff(3, 100, 10000, 2);
  const bMax = calculateExponentialBackoff(10, 100, 5000, 2);

  if (b1 !== 100 || b2 !== 200 || b3 !== 400) {
    throw new Error(`Exponential backoff values incorrect: ${b1}, ${b2}, ${b3}`);
  }
  if (bMax !== 5000) {
    throw new Error("Exponential backoff did not cap at maxMs.");
  }

  // 2. Error classification: Transient (Retryable)
  if (!isRetryableError(new Error("Network timeout while calling upstream provider"))) {
    throw new Error("Timeout should be classified as retryable.");
  }
  if (!isRetryableError(new Error("HTTP 429 Rate Limit Exceeded"))) {
    throw new Error("429 Rate Limit should be classified as retryable.");
  }
  if (!isRetryableError(new Error("503 Service Unavailable"))) {
    throw new Error("503 should be classified as retryable.");
  }

  // 3. Error classification: Permanent (Non-retryable)
  if (isRetryableError(new Error("401 Unauthorized - Invalid API Key"))) {
    throw new Error("401 Unauthorized must not be retryable.");
  }
  if (isRetryableError(new Error("403 Forbidden - Insufficient permissions"))) {
    throw new Error("403 Forbidden must not be retryable.");
  }
  if (isRetryableError(new Error("Bad Request: Invalid plan parameters"))) {
    throw new Error("Bad request must not be retryable.");
  }
}

export function runRetryTests() {
  testRetryPolicy();
}
