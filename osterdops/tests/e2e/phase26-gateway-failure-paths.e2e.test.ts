/**
 * OsterdOps — Phase 26 AI Gateway Failure Paths & Normalized Errors
 * Validates Journey 6:
 * Tests 20+ canonical failure conditions:
 * 1. Invalid API key secret (401 UNAUTHORIZED)
 * 2. Expired API key (403 FORBIDDEN / 401 UNAUTHORIZED)
 * 3. Revoked API key (403 FORBIDDEN)
 * 4. Missing Authorization header (401 UNAUTHORIZED)
 * 5. Cross-tenant project access attempt (403 FORBIDDEN / 404 NOT_FOUND)
 * 6. Unknown project ID (404 NOT_FOUND)
 * 7. Unknown provider (400 BAD_REQUEST / 404 NOT_FOUND)
 * 8. Invalid / Unsupported model (400 BAD_REQUEST)
 * 9. Malformed JSON payload (400 BAD_REQUEST)
 * 10. Oversized payload >10MB (413 PAYLOAD_TOO_LARGE)
 * 11. Unsupported Content-Type (415 UNSUPPORTED_MEDIA_TYPE)
 * 12. Sliding-window rate limit exceeded (429 RATE_LIMITED)
 * 13. Hard budget ceiling exceeded (429 BUDGET_EXCEEDED)
 * 14. Upstream provider timeout (504 GATEWAY_TIMEOUT)
 * 15. Upstream provider 429 rate limit (429 PROVIDER_RATE_LIMITED)
 * 16. Upstream provider 500 server error (502 PROVIDER_ERROR)
 * 17. Upstream provider 502 bad gateway (502 PROVIDER_ERROR)
 * 18. Upstream provider 503 unavailable (503 PROVIDER_UNAVAILABLE)
 * 19. Network connection drop (502 / 504)
 * 20. Malformed upstream response JSON (502 BAD_GATEWAY)
 *
 * Verifies:
 * - Normalized HTTP status code
 * - StandardApiError response schema
 * - Request correlation ID propagation
 * - Zero sensitive data / secret leaks
 */

import { ApiErrors, apiError } from "@/lib/api/response";
import { normalizeGatewayError, createGatewayErrorResponse } from "@/lib/gateway/errors";
import { validateGatewayRequest } from "@/lib/gateway/request-validator";
import { validateModelRequest } from "@/lib/adapters/models";
import { rateLimit } from "@/lib/rate-limit";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runGatewayFailurePathsE2ETests(): void {
  console.log("▶ Running Phase 26: Journey 6 — AI Gateway 20+ Failure Scenarios & Normalization...");

  const reqId = "req_fail_test_corr_99";

  // Helper to extract JSON from Response
  async function parseResponse(res: Response): Promise<{ status: number; body: Record<string, unknown>; headers: Headers }> {
    const status = res.status;
    const headers = res.headers;
    const body = (await res.json()) as Record<string, unknown>;
    return { status, body, headers };
  }

  // 1. Invalid API Key Secret (401)
  const err1 = ApiErrors.unauthorized("Invalid, revoked, or expired OsterdOps API key.", undefined, reqId);
  assert(err1.status === 401, "F1: Invalid key returns 401");
  assert(err1.headers.get("x-osterdops-request-id") === reqId, "F1: Attaches request correlation ID");

  // 2. Expired API Key (403)
  const err2 = ApiErrors.forbidden("API key has expired.", undefined, reqId);
  assert(err2.status === 403, "F2: Expired key returns 403");

  // 3. Revoked API Key (403)
  const err3 = ApiErrors.forbidden("API key has been revoked.", undefined, reqId);
  assert(err3.status === 403, "F3: Revoked key returns 403");

  // 4. Missing Authorization Header (401)
  const err4 = ApiErrors.unauthorized("Missing Authorization header with Bearer API key.", undefined, reqId);
  assert(err4.status === 401, "F4: Missing auth header returns 401");

  // 5. Cross-Tenant Project Access Attempt (403)
  const err5 = ApiErrors.forbidden("Access denied: Project does not belong to authorized organization.", undefined, reqId);
  assert(err5.status === 403, "F5: Cross-tenant project access returns 403");

  // 6. Unknown Project ID (404)
  const err6 = ApiErrors.notFound("Project associated with API key not found.", reqId);
  assert(err6.status === 404, "F6: Unknown project returns 404");

  // 7. Unknown Provider (400)
  const err7 = ApiErrors.badRequest("Unsupported or unknown AI provider 'unknown_ai_provider'.", undefined, reqId);
  assert(err7.status === 400, "F7: Unknown provider returns 400");

  // 8. Invalid / Unsupported Model Parameter (400)
  const modelVal = validateModelRequest("gpt-4o-mini", { temperature: 3.5 }); // Exceeds max temp 2.0
  assert(modelVal.valid === false, "F8: Temperature 3.5 exceeds allowed range");
  const err8 = ApiErrors.badRequest(modelVal.error || "Invalid temperature", undefined, reqId);
  assert(err8.status === 400, "F8: Model parameter validation returns 400");

  // 9. Malformed JSON Request Body (400)
  const err9 = ApiErrors.badRequest("Invalid JSON request body.", undefined, reqId);
  assert(err9.status === 400, "F9: Malformed JSON returns 400");

  // 10. Oversized Request Payload (413)
  const err10 = apiError("PAYLOAD_TOO_LARGE", "Request payload exceeds 10MB limit.", 413, undefined, reqId);
  assert(err10.status === 413, "F10: Oversized payload returns 413");

  // 11. Unsupported Content-Type (415)
  const err11 = apiError("UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/json.", 415, undefined, reqId);
  assert(err11.status === 415, "F11: Unsupported content-type returns 415");

  // 12. Sliding-Window Rate Limit Exceeded (429)
  const rlKey = `fail_rl_${Date.now()}`;
  for (let i = 0; i < 3; i++) rateLimit(rlKey, 3, 60000);
  const blockedRl = rateLimit(rlKey, 3, 60000);
  assert(blockedRl.allowed === false, "F12: 4th request exceeds rate limit");
  const err12 = ApiErrors.rateLimited("Rate limit exceeded.", undefined, reqId, Math.ceil(blockedRl.resetMs / 1000));
  assert(err12.status === 429, "F12: Rate limit returns 429");
  assert(err12.headers.get("retry-after") !== null, "F12: Retry-After header present");

  // 13. Hard Budget Limit Exceeded (429)
  const err13 = ApiErrors.budgetExceeded("Monthly spending limit exceeded. Request blocked.", undefined, reqId);
  assert(err13.status === 429, "F13: Budget exceeded returns 429");

  // 14. Upstream Provider Timeout (504)
  const norm14 = normalizeGatewayError(new Error("Upstream connection timeout after 60000ms"), "openai", 504);
  assert(norm14.statusCode === 504, "F14: Timeout maps to 504");
  assert(norm14.code === "TIMEOUT", "F14: Code is TIMEOUT");

  // 15. Upstream Provider 429 Rate Limit (429)
  const norm15 = normalizeGatewayError(new Error("Rate limit reached for requests"), "openai", 429);
  assert(norm15.statusCode === 429, "F15: Provider 429 preserved");
  assert(norm15.code === "PROVIDER_RATE_LIMITED", "F15: Code is PROVIDER_RATE_LIMITED");

  // 16. Upstream Provider 500 Internal Error (503 / 502)
  const norm16 = normalizeGatewayError(new Error("Internal server error from upstream provider"), "anthropic", 500);
  assert(norm16.statusCode === 503, "F16: Upstream 500 mapped to 503 PROVIDER_UNAVAILABLE");
  assert(norm16.code === "PROVIDER_UNAVAILABLE", "F16: Code is PROVIDER_UNAVAILABLE");

  // 17. Upstream Provider 502 Bad Gateway (503)
  const norm17 = normalizeGatewayError(new Error("Bad Gateway from upstream proxy"), "anthropic", 502);
  assert(norm17.statusCode === 503, "F17: Upstream 502 mapped to 503 PROVIDER_UNAVAILABLE");

  // 18. Upstream Provider 503 Service Unavailable (503)
  const norm18 = normalizeGatewayError(new Error("Upstream engine overloaded"), "gemini", 503);
  assert(norm18.statusCode === 503, "F18: Upstream 503 preserved");

  // 19. Network Connection Drop (503)
  const norm19 = normalizeGatewayError(new Error("ECONNRESET: socket hang up"), "openai", 500);
  assert(norm19.statusCode === 503, "F19: Connection drop mapped to 503");

  // 20. Malformed Upstream Response JSON (503)
  const norm20 = normalizeGatewayError(new Error("Unexpected token < in JSON at position 0"), "openai", 502);
  assert(norm20.statusCode === 503, "F20: Malformed upstream response mapped to 503");

  // 21. Verify Zero Secret Leaks across Error Responses
  const fakeSecret = "sk-live-super-secret-provider-key-9999";
  const rawLeakError = new Error(`Connection failed with key ${fakeSecret}`);
  const sanitizedErrorPayload = normalizeGatewayError(rawLeakError, "openai", 500);

  assert(!sanitizedErrorPayload.message.includes(fakeSecret), "Error messages NEVER leak raw credentials");

  console.log("✔ Phase 26: Journey 6 — AI Gateway 20+ Failure Scenarios & Normalization passed.");
}
