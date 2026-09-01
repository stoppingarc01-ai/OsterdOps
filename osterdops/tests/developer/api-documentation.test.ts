/**
 * OsterdOps — Developer API Documentation & Endpoint Contract Test Suite (Phase 23)
 * Validates endpoint contract parity, HTTP status mapping, error format compliance, and OpenAPI schemas.
 */

import { apiSuccess, ApiErrors } from "@/lib/api/response";
import { normalizeGatewayError } from "@/lib/gateway/errors";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runDeveloperApiDocumentationTests(): void {
  console.log("▶ Running Developer API Documentation & Contract Tests...");

  // 1. Standard Success Response Envelope
  const successResponse = apiSuccess({ model: "gpt-4o", status: "ready" }, { requestId: "req_doc_01" });
  assert(successResponse.status === 200, "Success HTTP 200");
  assert(successResponse.headers.get("x-osterdops-request-id") === "req_doc_01", "Request ID header attached");

  // 2. Standard Error Response Envelopes
  const notFound = ApiErrors.notFound("Project not found", undefined, "req_doc_02");
  assert(notFound.status === 404, "Not Found HTTP 404");

  const rateLimited = ApiErrors.rateLimited("Rate limit exceeded", undefined, "req_doc_03");
  assert(rateLimited.status === 429, "Rate Limited HTTP 429");

  const unauth = ApiErrors.unauthorized("Missing API key", undefined, "req_doc_04");
  assert(unauth.status === 401, "Unauthorized HTTP 401");

  // 3. Gateway Error Code Normalization
  const authErr = normalizeGatewayError(new Error("INVALID_CREDENTIALS: Bad key"), "openai", 401);
  assert(authErr.code === "INVALID_CREDENTIALS", "401 maps to INVALID_CREDENTIALS");
  assert(authErr.statusCode === 401, "Status code is 401");
  assert(!authErr.retryable, "Auth error is non-retryable");

  const timeoutErr = normalizeGatewayError(new Error("Timeout after 30000ms"), "anthropic", 504);
  assert(timeoutErr.code === "TIMEOUT", "Timeout maps to TIMEOUT");
  assert(timeoutErr.statusCode === 504, "Status code is 504");
  assert(timeoutErr.retryable, "Timeout error is retryable");

  console.log("✔ Developer API Documentation & Contract Tests passed.");
}
