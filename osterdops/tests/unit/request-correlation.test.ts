/**
 * OsterdOps — Phase 14: Request Correlation Unit Tests
 */

import { extractOrGenerateRequestId } from "@/lib/observability/request-context";

export function testRequestCorrelation() {
  // 1. Existing header: x-osterdops-request-id
  const id1 = extractOrGenerateRequestId({
    "x-osterdops-request-id": "req_custom_alpha_12345",
  });
  if (id1 !== "req_custom_alpha_12345") {
    throw new Error(`x-osterdops-request-id extraction failed, got: ${id1}`);
  }

  // 2. Existing header: x-request-id
  const id2 = extractOrGenerateRequestId({
    "x-request-id": "req_standard_beta_67890",
  });
  if (id2 !== "req_standard_beta_67890") {
    throw new Error(`x-request-id extraction failed, got: ${id2}`);
  }

  // 3. Fallback to generation when absent
  const generatedId = extractOrGenerateRequestId({});
  if (!generatedId || !generatedId.startsWith("req_")) {
    throw new Error(`Generated request ID invalid format: ${generatedId}`);
  }
}

export function runRequestCorrelationTests() {
  testRequestCorrelation();
}
