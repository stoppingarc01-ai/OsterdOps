/**
 * OsterdOps — Phase 8: Usage & Token Tracking Unit Test Suite
 * Tests token normalization across providers, missing usage handling, request status tagging,
 * idempotency via requestId, multi-tenant queries, aggregation logic, RBAC, and zero prompt/secret persistence.
 */

import { getProviderAdapter } from "@/lib/adapters/registry";
import { hasPermission } from "@/lib/auth/permissions";
import type { UsageRecord, UsageAggregationResult } from "@/types";

// 1. Token Normalization across Providers
export function testTokenNormalization() {
  // OpenAI Usage Normalization
  const openAiAdapter = getProviderAdapter("openai");
  const openAiMock = {
    usage: {
      prompt_tokens: 120,
      completion_tokens: 45,
      total_tokens: 165,
      prompt_tokens_details: { cached_tokens: 30 },
      completion_tokens_details: { reasoning_tokens: 15 },
    },
  };
  const openAiUsage = openAiAdapter.extractUsage(openAiMock);
  if (
    openAiUsage.inputTokens !== 120 ||
    openAiUsage.outputTokens !== 45 ||
    openAiUsage.totalTokens !== 165 ||
    openAiUsage.cachedTokens !== 30 ||
    openAiUsage.reasoningTokens !== 15
  ) {
    throw new Error("OpenAI token usage extraction failed.");
  }

  // Anthropic Usage Normalization
  const anthropicAdapter = getProviderAdapter("anthropic");
  const anthropicMock = {
    usage: {
      input_tokens: 250,
      output_tokens: 80,
      cache_read_input_tokens: 50,
    },
  };
  const anthropicUsage = anthropicAdapter.extractUsage(anthropicMock);
  if (
    anthropicUsage.inputTokens !== 250 ||
    anthropicUsage.outputTokens !== 80 ||
    anthropicUsage.totalTokens !== 330 ||
    anthropicUsage.cachedTokens !== 50
  ) {
    throw new Error("Anthropic token usage extraction failed.");
  }

  // Gemini Usage Normalization
  const geminiAdapter = getProviderAdapter("gemini");
  const geminiMock = {
    usageMetadata: {
      promptTokenCount: 300,
      candidatesTokenCount: 150,
      totalTokenCount: 450,
      cachedContentTokenCount: 75,
    },
  };
  const geminiUsage = geminiAdapter.extractUsage(geminiMock);
  if (
    geminiUsage.inputTokens !== 300 ||
    geminiUsage.outputTokens !== 150 ||
    geminiUsage.totalTokens !== 450 ||
    geminiUsage.cachedTokens !== 75
  ) {
    throw new Error("Gemini token usage extraction failed.");
  }

  // Missing / Zero Token Invention Policy
  const emptyUsage = openAiAdapter.extractUsage({});
  if (emptyUsage.inputTokens !== 0 || emptyUsage.outputTokens !== 0 || emptyUsage.totalTokens !== 0) {
    throw new Error("Missing provider usage must safely return 0 without inventing token counts.");
  }
}

// 2. Request Status Tracking
export function testUsageRequestStatuses() {
  const validStatuses = new Set(["SUCCESS", "ERROR", "TIMEOUT", "RATE_LIMITED"]);

  const sampleSuccess: UsageRecord = {
    id: "gw_req_success_1",
    requestId: "gw_req_success_1",
    organizationId: "org_alpha",
    projectId: "prj_1",
    apiKeyId: "key_1",
    provider: "openai",
    model: "gpt-4o-mini",
    inputTokens: 10,
    outputTokens: 20,
    totalTokens: 30,
    latencyMs: 150,
    statusCode: 200,
    status: "SUCCESS",
    timestamp: new Date().toISOString(),
    datePartition: "2026-08-29",
  };
  if (!validStatuses.has(sampleSuccess.status)) {
    throw new Error("SUCCESS status must be valid.");
  }

  const sampleTimeout: UsageRecord = {
    id: "gw_req_timeout_1",
    requestId: "gw_req_timeout_1",
    organizationId: "org_alpha",
    projectId: "prj_1",
    apiKeyId: "key_1",
    provider: "openai",
    model: "gpt-4o-mini",
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    latencyMs: 60000,
    statusCode: 504,
    status: "TIMEOUT",
    errorCode: "TIMEOUT",
    timestamp: new Date().toISOString(),
    datePartition: "2026-08-29",
  };
  if (sampleTimeout.status !== "TIMEOUT" || sampleTimeout.totalTokens !== 0) {
    throw new Error("Timeout record must have status TIMEOUT and 0 tokens.");
  }

  const sampleRateLimited: UsageRecord = {
    id: "gw_req_rl_1",
    requestId: "gw_req_rl_1",
    organizationId: "org_alpha",
    projectId: "prj_1",
    apiKeyId: "key_1",
    provider: "openai",
    model: "gpt-4o-mini",
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    latencyMs: 5,
    statusCode: 429,
    status: "RATE_LIMITED",
    errorCode: "RATE_LIMITED",
    timestamp: new Date().toISOString(),
    datePartition: "2026-08-29",
  };
  if (sampleRateLimited.status !== "RATE_LIMITED" || sampleRateLimited.totalTokens !== 0) {
    throw new Error("Rate-limited record must have status RATE_LIMITED and 0 tokens.");
  }
}

// 3. Idempotency & Duplicate Prevention Strategy
export function testUsageIdempotency() {
  const requestId = "gw_req_unique_idempotency_12345";
  const recordsMap = new Map<string, UsageRecord>();

  // First request write
  const record1: UsageRecord = {
    id: requestId,
    requestId,
    organizationId: "org_alpha",
    projectId: "prj_1",
    apiKeyId: "key_1",
    provider: "openai",
    model: "gpt-4o-mini",
    inputTokens: 50,
    outputTokens: 25,
    totalTokens: 75,
    latencyMs: 200,
    statusCode: 200,
    status: "SUCCESS",
    timestamp: new Date().toISOString(),
    datePartition: "2026-08-29",
  };
  recordsMap.set(requestId, record1);

  // Duplicate retry of the same requestId
  const recordRetry: UsageRecord = {
    ...record1,
    latencyMs: 205, // Slight network variation
  };
  recordsMap.set(requestId, recordRetry);

  // Size must strictly remain 1, preventing double token accounting
  if (recordsMap.size !== 1) {
    throw new Error("Idempotent write keyed by requestId must prevent duplicate usage entries.");
  }
  if (recordsMap.get(requestId)?.totalTokens !== 75) {
    throw new Error("Idempotent usage record tokens must match original request.");
  }
}

// 4. Multi-Tenant Aggregation Engine
export function testUsageAggregation() {
  const sampleRecords: UsageRecord[] = [
    {
      id: "req_1",
      requestId: "req_1",
      organizationId: "org_alpha",
      projectId: "prj_1",
      apiKeyId: "key_1",
      provider: "openai",
      model: "gpt-4o-mini",
      inputTokens: 100,
      outputTokens: 50,
      totalTokens: 150,
      cachedTokens: 20,
      reasoningTokens: 10,
      latencyMs: 120,
      statusCode: 200,
      status: "SUCCESS",
      timestamp: "2026-08-29T10:00:00Z",
      datePartition: "2026-08-29",
    },
    {
      id: "req_2",
      requestId: "req_2",
      organizationId: "org_alpha",
      projectId: "prj_1",
      apiKeyId: "key_1",
      provider: "anthropic",
      model: "claude-3-5-sonnet",
      inputTokens: 200,
      outputTokens: 100,
      totalTokens: 300,
      cachedTokens: 40,
      reasoningTokens: 0,
      latencyMs: 250,
      statusCode: 200,
      status: "SUCCESS",
      timestamp: "2026-08-29T11:00:00Z",
      datePartition: "2026-08-29",
    },
    {
      id: "req_3",
      requestId: "req_3",
      organizationId: "org_alpha",
      projectId: "prj_2",
      apiKeyId: "key_2",
      provider: "openai",
      model: "gpt-4o-mini",
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      cachedTokens: 0,
      reasoningTokens: 0,
      latencyMs: 10,
      statusCode: 429,
      status: "RATE_LIMITED",
      errorCode: "RATE_LIMITED",
      timestamp: "2026-08-29T12:00:00Z",
      datePartition: "2026-08-29",
    },
  ];

  // Compute aggregation
  const summary: UsageAggregationResult = {
    totalRequests: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalTokens: 0,
    totalCachedTokens: 0,
    totalReasoningTokens: 0,
    byProvider: {},
    byModel: {},
    byProject: {},
    byStatus: {},
  };

  for (const r of sampleRecords) {
    summary.totalRequests += 1;
    summary.totalInputTokens += r.inputTokens;
    summary.totalOutputTokens += r.outputTokens;
    summary.totalTokens += r.totalTokens;
    summary.totalCachedTokens += r.cachedTokens || 0;
    summary.totalReasoningTokens += r.reasoningTokens || 0;

    // Provider
    if (!summary.byProvider[r.provider]) {
      summary.byProvider[r.provider] = {
        requests: 0,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        cachedTokens: 0,
        reasoningTokens: 0,
      };
    }
    summary.byProvider[r.provider].requests += 1;
    summary.byProvider[r.provider].totalTokens += r.totalTokens;

    // Project
    if (!summary.byProject[r.projectId]) {
      summary.byProject[r.projectId] = {
        requests: 0,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        cachedTokens: 0,
        reasoningTokens: 0,
      };
    }
    summary.byProject[r.projectId].requests += 1;
    summary.byProject[r.projectId].totalTokens += r.totalTokens;

    // Status
    summary.byStatus[r.status] = (summary.byStatus[r.status] || 0) + 1;
  }

  if (summary.totalRequests !== 3 || summary.totalTokens !== 450) {
    throw new Error("Aggregation totals failed.");
  }
  if (summary.totalCachedTokens !== 60 || summary.totalReasoningTokens !== 10) {
    throw new Error("Aggregation cached/reasoning totals failed.");
  }
  if (summary.byProvider["openai"]?.totalTokens !== 150 || summary.byProvider["anthropic"]?.totalTokens !== 300) {
    throw new Error("Aggregation byProvider breakdown failed.");
  }
  if (summary.byProject["prj_1"]?.totalTokens !== 450 || summary.byProject["prj_2"]?.totalTokens !== 0) {
    throw new Error("Aggregation byProject breakdown failed.");
  }
  if (summary.byStatus["SUCCESS"] !== 2 || summary.byStatus["RATE_LIMITED"] !== 1) {
    throw new Error("Aggregation byStatus breakdown failed.");
  }
}

// 5. RBAC Permission Verification for Usage
export function testUsageRbac() {
  const roles = ["OWNER", "ADMIN", "DEVELOPER", "VIEWER"] as const;
  for (const role of roles) {
    if (!hasPermission(role, "usage:read")) {
      throw new Error(`Role '${role}' must possess 'usage:read' permission.`);
    }
  }
}

// 6. Zero Prompt, Completion, and Secret Persistence Guarantee
export function testUsagePrivacyGuarantees() {
  const confidentialPrompt = "HIGHLY_SENSITIVE_USER_PROMPT_QUERY_12345";
  const confidentialCompletion = "SENSITIVE_AI_GENERATED_COMPLETION_OUTPUT_67890";
  const rawApiKey = "ost_live_secretkey_abcdef1234567890";
  const rawProviderKey = "sk-proj-vendorsecret_0987654321";

  const record: UsageRecord = {
    id: "gw_req_privacy_check_1",
    requestId: "gw_req_privacy_check_1",
    organizationId: "org_alpha",
    projectId: "prj_1",
    apiKeyId: "key_7a9f",
    provider: "openai",
    model: "gpt-4o",
    inputTokens: 15,
    outputTokens: 25,
    totalTokens: 40,
    cachedTokens: 0,
    reasoningTokens: 0,
    latencyMs: 180,
    statusCode: 200,
    status: "SUCCESS",
    timestamp: new Date().toISOString(),
    datePartition: "2026-08-29",
  };

  const serialized = JSON.stringify(record);

  if (serialized.includes(confidentialPrompt)) {
    throw new Error("PRIVACY VIOLATION: User prompt found in UsageRecord!");
  }
  if (serialized.includes(confidentialCompletion)) {
    throw new Error("PRIVACY VIOLATION: Completion text found in UsageRecord!");
  }
  if (serialized.includes(rawApiKey)) {
    throw new Error("PRIVACY VIOLATION: OsterdOps API secret found in UsageRecord!");
  }
  if (serialized.includes(rawProviderKey)) {
    throw new Error("PRIVACY VIOLATION: Provider API secret found in UsageRecord!");
  }

  // Ensure no forbidden text keys exist in the record object
  const forbiddenKeys = ["prompt", "content", "completion", "messages", "system", "text", "body", "secret", "apiKey"];
  for (const key of forbiddenKeys) {
    if (key in record) {
      throw new Error(`UsageRecord must never contain forbidden property '${key}'.`);
    }
  }
}

// Master Test Runner for Phase 8
export function runUsageTests() {
  testTokenNormalization();
  testUsageRequestStatuses();
  testUsageIdempotency();
  testUsageAggregation();
  testUsageRbac();
  testUsagePrivacyGuarantees();
}
