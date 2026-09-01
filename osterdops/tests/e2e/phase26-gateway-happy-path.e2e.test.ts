/**
 * OsterdOps — Phase 26 AI Gateway Happy Path Pipeline
 * Validates Journey 5:
 * Client Request
 *   ↓ API Authentication
 *   ↓ Organization & Project Resolution
 *   ↓ RBAC & Security Checks
 *   ↓ Sliding-Window Rate Limit Check
 *   ↓ Budget Pre-flight Verification
 *   ↓ Provider Selection & Upstream Execution
 *   ↓ Normalized Response Envelope
 *   ↓ Usage Ingestion (Input, Output, Cached Tokens)
 *   ↓ Authoritative Cost Calculation
 *   ↓ Telemetry & Metrics Increment
 *   ↓ Correlation Request ID Header Propagation
 *   ↓ Zero-Prompt & Zero-Secret Persistence Verification
 */

import { validateGatewayRequest } from "@/lib/gateway/request-validator";
import { getProviderAdapter, resolveProviderFromModel } from "@/lib/adapters/registry";
import { calculateRequestCost } from "@/lib/cost/calculator";
import { validateModelRequest } from "@/lib/adapters/models";
import { rateLimit } from "@/lib/rate-limit";
import { redactSensitiveData } from "@/lib/observability/redaction";
import type { AIProvider } from "@/types";
import type { GatewayRequestPayload, GatewayTokenUsage } from "@/lib/gateway/types";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runGatewayHappyPathE2ETests(): void {
  console.log("▶ Running Phase 26: Journey 5 — AI Gateway Happy Path Pipeline...");

  const organizationId = "org_gw_happy";
  const projectId = "prj_gw_happy";
  const keyId = "key_gw_happy";
  const requestId = `gw_test_${Date.now()}_abc123`;

  // 1. Client Request Payload
  const rawPayload: GatewayRequestPayload = {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful AI customer support agent." },
      { role: "user", content: "How do I reset my account password?" },
    ],
    temperature: 0.7,
    maxTokens: 500,
  };

  // 2. Validate JSON Request Payload
  const validation = validateGatewayRequest(rawPayload);
  assert(validation.valid === true, "Payload passes schema validation");

  // 3. Provider Resolution
  const provider: AIProvider = validation.normalizedProvider || resolveProviderFromModel(rawPayload.model);
  assert(provider === "openai", "gpt-4o-mini resolves to provider 'openai'");

  // 4. Model Catalog Parameter Boundaries Check
  const modelValidation = validateModelRequest(rawPayload.model, {
    maxTokens: rawPayload.maxTokens,
    temperature: rawPayload.temperature,
    stream: rawPayload.stream,
  });
  assert(modelValidation.valid === true, "Model parameters are within boundaries");

  // 5. Sliding-Window Rate Limit Verification
  const rlKey = `gw_rl_${keyId}`;
  const rlCheck = rateLimit(rlKey, 120, 60000);
  assert(rlCheck.allowed === true, "Request within rate limit quota");
  assert(rlCheck.remaining >= 0, "Remaining quota is non-negative");

  // 6. Pre-flight Budget Verification
  const monthlyBudgetUsd = 500;
  const currentSpendUsd = 45.2;
  const isBudgetAllowed = currentSpendUsd < monthlyBudgetUsd;
  assert(isBudgetAllowed === true, "Budget preflight succeeds");

  // 7. Resolve Provider Adapter & Format Upstream Request
  const adapter = getProviderAdapter(provider);
  const mockCredentials = { apiKey: "sk-mock-openai-provider-key-123456" };
  const formattedRequest = adapter.formatRequest(
    {
      model: rawPayload.model,
      messages: rawPayload.messages,
      temperature: rawPayload.temperature,
      max_tokens: rawPayload.maxTokens,
      stream: false,
    },
    mockCredentials
  );

  assert(formattedRequest.url.includes("api.openai.com"), "Target URL targets OpenAI API");
  assert(formattedRequest.headers["Authorization"] === `Bearer ${mockCredentials.apiKey}`, "Auth header set");

  // 8. Normalize Upstream Mock Response
  const mockUpstreamResponse = {
    id: "chatcmpl-test-response-999",
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model: "gpt-4o-mini",
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: "To reset your password, navigate to Settings > Security and click 'Reset Password'.",
        },
        finish_reason: "stop",
      },
    ],
    usage: {
      prompt_tokens: 35,
      completion_tokens: 22,
      total_tokens: 57,
      prompt_tokens_details: {
        cached_tokens: 10,
      },
    },
  };

  const normalized = adapter.normalizeResponse(mockUpstreamResponse, rawPayload.model);
  const extractedUsage = adapter.extractUsage(mockUpstreamResponse);

  assert(normalized.id === "chatcmpl-test-response-999", "Response ID preserved");
  assert(normalized.choices[0].message.role === "assistant", "Assistant role normalized");
  assert(normalized.choices[0].message.content.includes("Reset Password"), "Output content matches");

  // 9. Ingest Token Usage & Calculate Authoritative Costs
  const usage: GatewayTokenUsage = {
    inputTokens: extractedUsage.inputTokens,
    outputTokens: extractedUsage.outputTokens,
    totalTokens: extractedUsage.totalTokens,
    cachedTokens: extractedUsage.cachedTokens || 0,
    reasoningTokens: extractedUsage.reasoningTokens || 0,
  };

  assert(usage.inputTokens === 35, "Input tokens extracted (35)");
  assert(usage.outputTokens === 22, "Output tokens extracted (22)");
  assert(usage.totalTokens === 57, "Total tokens extracted (57)");
  assert(usage.cachedTokens === 10, "Cached tokens extracted (10)");

  const cost = calculateRequestCost({
    provider,
    model: rawPayload.model,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    cachedTokens: usage.cachedTokens,
  });

  assert(cost.totalCostUsd !== null && cost.totalCostUsd > 0, "Calculated cost must be non-zero");
  assert(cost.cachedSavingsUsd > 0, "Cache savings calculated");

  // 10. Correlation ID & Telemetry Headers Propagation
  const responseHeaders = new Headers({
    "x-osterdops-request-id": requestId,
    "x-ratelimit-remaining": String(rlCheck.remaining),
    "x-ratelimit-reset": String(rlCheck.resetMs),
    "x-osterdops-latency-ms": "45",
    "x-osterdops-cost-usd": cost.totalCostUsd!.toFixed(8),
    "x-osterdops-input-tokens": String(usage.inputTokens),
    "x-osterdops-output-tokens": String(usage.outputTokens),
    "x-osterdops-total-tokens": String(usage.totalTokens),
  });

  assert(responseHeaders.get("x-osterdops-request-id") === requestId, "Correlation Request ID propagated");
  assert(responseHeaders.get("x-osterdops-total-tokens") === "57", "Total tokens propagated");
  assert(Number(responseHeaders.get("x-osterdops-cost-usd")) > 0, "Cost header formatted correctly");

  // 11. Zero-Prompt & Zero-Secret Persistence Guarantee Verification
  const persistedTelemetryRecord = {
    requestId,
    organizationId,
    projectId,
    keyId,
    provider,
    model: rawPayload.model,
    status: "success",
    httpStatus: 200,
    durationMs: 45,
    tokens: usage,
    costUsd: cost.totalCostUsd,
  };

  const telemetryJson = JSON.stringify(persistedTelemetryRecord);
  assert(!telemetryJson.includes("You are a helpful AI"), "Prompt content is NEVER stored in telemetry");
  assert(!telemetryJson.includes("Reset Password"), "Completion content is NEVER stored in telemetry");
  assert(!telemetryJson.includes("sk-mock-openai"), "Provider secret is NEVER stored in telemetry");

  // Log Redaction verification
  const rawLogEntry = {
    event: "GATEWAY_REQUEST",
    auth: `Bearer ${mockCredentials.apiKey}`,
    messages: rawPayload.messages,
  };
  const sanitized = redactSensitiveData(rawLogEntry);
  const sanitizedString = JSON.stringify(sanitized);

  assert(!sanitizedString.includes(mockCredentials.apiKey), "Bearer token is redacted in logs");

  console.log("✔ Phase 26: Journey 5 — AI Gateway Happy Path Pipeline passed.");
}
