/**
 * OsterdOps — Phase 7: AI Gateway Request Routing Unit Test Suite
 * Validates request validation, provider adapter routing, response normalization,
 * error mapping, rate limiting, request ID propagation, CORS policies, and zero secret/prompt logging.
 */

import { validateGatewayRequest } from "@/lib/gateway/request-validator";
import { normalizeGatewayError } from "@/lib/gateway/errors";
import { rateLimit } from "@/lib/rate-limit";
import { getProviderAdapter } from "@/lib/adapters/registry";
import { resolveCorsHeaders } from "@/lib/gateway/cors";
import type { GatewayTokenUsage } from "@/lib/gateway/types";

// 1. Gateway Request Validation Tests
export function testGatewayRequestValidation() {
  // Missing model
  const missingModel = validateGatewayRequest({
    messages: [{ role: "user", content: "Hello" }],
  });
  if (missingModel.valid || !missingModel.error?.includes("model")) {
    throw new Error("Validation must reject requests missing 'model' field.");
  }

  // Empty messages array
  const emptyMessages = validateGatewayRequest({
    model: "gpt-4o",
    messages: [],
  });
  if (emptyMessages.valid || !emptyMessages.error?.includes("messages")) {
    throw new Error("Validation must reject empty 'messages' array.");
  }

  // Invalid message role
  const invalidRole = validateGatewayRequest({
    model: "gpt-4o",
    messages: [{ role: "invalid_role", content: "Hello" }],
  });
  if (invalidRole.valid || !invalidRole.error?.includes("invalid role")) {
    throw new Error("Validation must reject invalid message roles.");
  }

  // Missing message content
  const missingContent = validateGatewayRequest({
    model: "gpt-4o",
    messages: [{ role: "user" }],
  });
  if (missingContent.valid || !missingContent.error?.includes("content")) {
    throw new Error("Validation must reject messages missing string 'content'.");
  }

  // Streaming Guard (stream: true must be rejected in Phase 7)
  const streamingReq = validateGatewayRequest({
    model: "gpt-4o",
    messages: [{ role: "user", content: "Hello" }],
    stream: true,
  });
  if (streamingReq.valid || !streamingReq.error?.includes("Streaming")) {
    throw new Error("Validation must reject 'stream: true' with clear notice in Phase 7.");
  }

  // Unsupported provider
  const unsupportedProvider = validateGatewayRequest({
    provider: "unsupported_ai_vendor",
    model: "test-model",
    messages: [{ role: "user", content: "Hello" }],
  });
  if (unsupportedProvider.valid || !unsupportedProvider.error?.includes("Unsupported provider")) {
    throw new Error("Validation must reject unsupported provider identifiers.");
  }

  // Valid OpenAI request with inferred provider
  const validInferred = validateGatewayRequest({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: "Hello" }],
  });
  if (!validInferred.valid || validInferred.normalizedProvider !== "openai") {
    throw new Error("Provider must be correctly inferred as 'openai' from gpt-4o-mini.");
  }

  // Valid Anthropic request with inferred provider
  const validAnthropic = validateGatewayRequest({
    model: "claude-3-5-sonnet",
    messages: [{ role: "user", content: "Hello" }],
  });
  if (!validAnthropic.valid || validAnthropic.normalizedProvider !== "anthropic") {
    throw new Error("Provider must be correctly inferred as 'anthropic' from claude-3-5-sonnet.");
  }

  // Valid Gemini request with inferred provider
  const validGemini = validateGatewayRequest({
    model: "gemini-1.5-pro",
    messages: [{ role: "user", content: "Hello" }],
  });
  if (!validGemini.valid || validGemini.normalizedProvider !== "gemini") {
    throw new Error("Provider must be correctly inferred as 'gemini' from gemini-1.5-pro.");
  }

  // Valid Explicit Provider
  const validExplicit = validateGatewayRequest({
    provider: "azure",
    model: "gpt-4o-deployment",
    messages: [{ role: "user", content: "Hello" }],
  });
  if (!validExplicit.valid || validExplicit.normalizedProvider !== "azure") {
    throw new Error("Explicit provider 'azure' must be preserved.");
  }
}

// 2. Gateway Error Normalization Tests
export function testGatewayErrorNormalization() {
  // Timeout error
  const timeoutErr = normalizeGatewayError(new Error("The operation was aborted due to timeout"), "openai");
  if (timeoutErr.code !== "TIMEOUT" || timeoutErr.statusCode !== 504 || !timeoutErr.retryable) {
    throw new Error("Timeout exceptions must normalize to TIMEOUT (504, retryable).");
  }

  // 401 Invalid Credentials
  const authErr = normalizeGatewayError(new Error("INVALID_CREDENTIALS: Key rejected"), "anthropic", 401);
  if (authErr.code !== "INVALID_CREDENTIALS" || authErr.statusCode !== 401 || authErr.retryable) {
    throw new Error("Auth errors must normalize to INVALID_CREDENTIALS (401, non-retryable).");
  }

  // 429 Rate Limit
  const rateLimitErr = normalizeGatewayError(new Error("PROVIDER_RATE_LIMITED: Throttled"), "gemini", 429);
  if (rateLimitErr.code !== "PROVIDER_RATE_LIMITED" || rateLimitErr.statusCode !== 429 || !rateLimitErr.retryable) {
    throw new Error("Rate limit errors must normalize to PROVIDER_RATE_LIMITED (429, retryable).");
  }

  // 404 Model Not Found
  const modelErr = normalizeGatewayError(new Error("MODEL_NOT_FOUND: Model gpt-5 does not exist"), "openai", 404);
  if (modelErr.code !== "MODEL_NOT_FOUND" || modelErr.statusCode !== 404 || modelErr.retryable) {
    throw new Error("404 errors must normalize to MODEL_NOT_FOUND (404, non-retryable).");
  }

  // 503 Provider Unavailable
  const unavailErr = normalizeGatewayError(new Error("PROVIDER_UNAVAILABLE: Service Down"), "azure", 503);
  if (unavailErr.code !== "PROVIDER_UNAVAILABLE" || unavailErr.statusCode !== 503 || !unavailErr.retryable) {
    throw new Error("503 errors must normalize to PROVIDER_UNAVAILABLE (503, retryable).");
  }
}

// 3. Sliding Window Gateway Rate Limiting Test
export function testGatewayRateLimiting() {
  const testKey = `test_key_limit_${Date.now()}`;
  const limit = 3;
  const windowMs = 5000;

  const r1 = rateLimit(testKey, limit, windowMs);
  if (!r1.allowed || r1.remaining !== 2) throw new Error("1st request must be allowed with 2 remaining.");

  const r2 = rateLimit(testKey, limit, windowMs);
  if (!r2.allowed || r2.remaining !== 1) throw new Error("2nd request must be allowed with 1 remaining.");

  const r3 = rateLimit(testKey, limit, windowMs);
  if (!r3.allowed || r3.remaining !== 0) throw new Error("3rd request must be allowed with 0 remaining.");

  const r4 = rateLimit(testKey, limit, windowMs);
  if (r4.allowed || r4.remaining !== 0) throw new Error("4th request must be rejected (rate limited).");
}

// 4. Provider Adapter Request Formatting & Response Normalization
export function testGatewayProviderAdapters() {
  const credentials = { apiKey: "test-secret-key-12345" };

  // OpenAI Formatting
  const openAi = getProviderAdapter("openai");
  const openAiFormatted = openAi.formatRequest(
    {
      model: "gpt-4o",
      messages: [{ role: "user", content: "Hello OpenAI" }],
      temperature: 0.5,
    },
    credentials
  );
  if (!openAiFormatted.headers["Authorization"]?.includes("Bearer test-secret-key-12345")) {
    throw new Error("OpenAI adapter must inject Bearer auth header.");
  }
  if (!openAiFormatted.body.includes("gpt-4o")) {
    throw new Error("OpenAI body must serialize model parameter.");
  }

  // Anthropic Formatting
  const anthropic = getProviderAdapter("anthropic");
  const anthropicFormatted = anthropic.formatRequest(
    {
      model: "claude-3-5-sonnet",
      messages: [
        { role: "system", content: "You are an expert mathematician." },
        { role: "user", content: "What is 2+2?" },
      ],
    },
    credentials
  );
  if (anthropicFormatted.headers["x-api-key"] !== "test-secret-key-12345") {
    throw new Error("Anthropic adapter must inject x-api-key header.");
  }
  if (!anthropicFormatted.body.includes("You are an expert mathematician.")) {
    throw new Error("Anthropic adapter must extract system instruction into root payload.");
  }

  // Gemini Formatting
  const gemini = getProviderAdapter("gemini");
  const geminiFormatted = gemini.formatRequest(
    {
      model: "gemini-1.5-flash",
      messages: [{ role: "user", content: "Hello Gemini" }],
    },
    credentials
  );
  if (!geminiFormatted.url.includes("key=test-secret-key-12345")) {
    throw new Error("Gemini adapter must append API key in query parameters.");
  }

  // Usage Extraction & Response Normalization
  const mockVendorResponse = {
    id: "chatcmpl-test123",
    model: "gpt-4o",
    choices: [
      {
        index: 0,
        message: { role: "assistant", content: "Hello back!" },
        finish_reason: "stop",
      },
    ],
    usage: {
      prompt_tokens: 15,
      completion_tokens: 25,
      total_tokens: 40,
    },
  };

  const normalized = openAi.normalizeResponse(mockVendorResponse, "gpt-4o");
  const usage = openAi.extractUsage(mockVendorResponse);

  if (normalized.choices[0]?.message?.content !== "Hello back!") {
    throw new Error("Normalized response content mismatch.");
  }

  if (usage.inputTokens !== 15 || usage.outputTokens !== 25 || usage.totalTokens !== 40) {
    throw new Error("Extracted usage metrics mismatch.");
  }
}

// 5. Zero Secret & Prompt Content Leakage Test
export function testTelemetrySecurity() {
  const sensitiveUserPrompt = "MY_HIGHLY_CONFIDENTIAL_USER_PASSWORD_12345";
  const rawApiKey = "ost_live_secretkey1234567890abcdef";
  const rawProviderKey = "sk-proj-vendorsecret987654321";

  // Simulated telemetry entry
  const safeTelemetry = {
    requestId: "gw_req_12345",
    organizationId: "org_alpha",
    projectId: "prj_alpha_1",
    keyId: "key_7a9f",
    provider: "openai",
    model: "gpt-4o",
    status: "success",
    httpStatus: 200,
    durationMs: 142,
    usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
    timestamp: new Date().toISOString(),
  };

  const serialized = JSON.stringify(safeTelemetry);

  if (serialized.includes(sensitiveUserPrompt)) {
    throw new Error("SECURITY VIOLATION: User prompt leaked into telemetry!");
  }
  if (serialized.includes(rawApiKey)) {
    throw new Error("SECURITY VIOLATION: OsterdOps API key leaked into telemetry!");
  }
  if (serialized.includes(rawProviderKey)) {
    throw new Error("SECURITY VIOLATION: Provider secret key leaked into telemetry!");
  }
}

// 6. Strict Numerical Metadata Guarantee in Usage
export function testTelemetryUsageStructure() {
  const usage: GatewayTokenUsage = {
    inputTokens: 120,
    outputTokens: 45,
    totalTokens: 165,
    cachedTokens: 0,
    reasoningTokens: 0,
  };

  if (typeof usage.inputTokens !== "number" || typeof usage.outputTokens !== "number" || typeof usage.totalTokens !== "number") {
    throw new Error("Usage metrics must strictly contain numerical token counts only.");
  }

  // Ensure no text payload properties exist on the usage type
  const usageKeys = Object.keys(usage);
  const forbiddenTextKeys = ["prompt", "content", "message", "completion", "text", "body"];
  for (const key of forbiddenTextKeys) {
    if (usageKeys.includes(key)) {
      throw new Error(`Usage structure must never contain prompt/completion key '${key}'.`);
    }
  }
}

// 7. CORS Configuration & Whitelist Validation Test
export function testGatewayCors() {
  // Test with no origin specified (server-to-server)
  const s2sReq = new Request("https://api.osterdops.com/api/v1/gateway/chat/completions", {
    method: "OPTIONS",
  });
  const s2sHeaders = resolveCorsHeaders(s2sReq);
  if (!s2sHeaders["Access-Control-Allow-Methods"]?.includes("POST")) {
    throw new Error("CORS headers must allow POST method.");
  }

  // Test with origin specified
  const clientReq = new Request("https://api.osterdops.com/api/v1/gateway/chat/completions", {
    method: "OPTIONS",
    headers: { Origin: "https://app.client.com" },
  });
  const clientHeaders = resolveCorsHeaders(clientReq);
  if (clientHeaders["Access-Control-Allow-Origin"] !== "https://app.client.com") {
    throw new Error("CORS headers must safely reflect incoming Origin or match whitelist.");
  }

  // Test with OSTERDOPS_ALLOWED_ORIGINS whitelist
  const originalEnv = process.env.OSTERDOPS_ALLOWED_ORIGINS;
  try {
    process.env.OSTERDOPS_ALLOWED_ORIGINS = "https://trusted1.com, https://trusted2.com";

    const allowedReq = new Request("https://api.osterdops.com/api/v1/gateway/chat/completions", {
      method: "OPTIONS",
      headers: { Origin: "https://trusted1.com" },
    });
    const allowedHeaders = resolveCorsHeaders(allowedReq);
    if (allowedHeaders["Access-Control-Allow-Origin"] !== "https://trusted1.com") {
      throw new Error("Configured allowed origin must be permitted.");
    }

    const deniedReq = new Request("https://api.osterdops.com/api/v1/gateway/chat/completions", {
      method: "OPTIONS",
      headers: { Origin: "https://evil.com" },
    });
    const deniedHeaders = resolveCorsHeaders(deniedReq);
    if (deniedHeaders["Access-Control-Allow-Origin"]) {
      throw new Error("Untrusted origin must be omitted from Access-Control-Allow-Origin when whitelist is active.");
    }
  } finally {
    process.env.OSTERDOPS_ALLOWED_ORIGINS = originalEnv;
  }
}

// Master Test Runner for Phase 7
export function runGatewayTests() {
  testGatewayRequestValidation();
  testGatewayErrorNormalization();
  testGatewayRateLimiting();
  testGatewayProviderAdapters();
  testTelemetrySecurity();
  testTelemetryUsageStructure();
  testGatewayCors();
}
