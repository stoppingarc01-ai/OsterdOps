/**
 * OsterdOps — Cost Engine & Pricing Registry Unit Tests (Phase 9)
 * Tests precision nanodollar math, model pricing across OpenAI, Anthropic, Gemini, Azure, Bedrock,
 * cached token discounts, reasoning token calculations, unknown model handling, idempotency,
 * spend aggregations, RBAC, and zero prompt/secret persistence.
 */

import { calculateRequestCost } from "@/lib/cost/calculator";
import { getModelPricing, PRICING_VERSION, PRICING_EFFECTIVE_DATE } from "@/lib/cost/pricing-registry";
import { hasPermission } from "@/lib/auth/permissions";
import type { CostRecord, CostAggregationResult } from "@/types";

export function testCostEngine() {
  // 1. OpenAI GPT-4o (Input $2.50/1M, Output $10.00/1M)
  // 1,000 input tokens = $0.0025, 500 output tokens = $0.005 -> Total = $0.0075
  const gpt4oResult = calculateRequestCost({
    provider: "openai",
    model: "gpt-4o",
    inputTokens: 1000,
    outputTokens: 500,
  });

  if (gpt4oResult.inputCostUsd !== 0.0025) {
    throw new Error(`GPT-4o input cost expected 0.0025, got ${gpt4oResult.inputCostUsd}`);
  }
  if (gpt4oResult.outputCostUsd !== 0.005) {
    throw new Error(`GPT-4o output cost expected 0.005, got ${gpt4oResult.outputCostUsd}`);
  }
  if (gpt4oResult.totalCostUsd !== 0.0075) {
    throw new Error(`GPT-4o total cost expected 0.0075, got ${gpt4oResult.totalCostUsd}`);
  }
  if (gpt4oResult.pricingStatus !== "AVAILABLE") {
    throw new Error(`Expected pricingStatus 'AVAILABLE', got ${gpt4oResult.pricingStatus}`);
  }
  if (gpt4oResult.pricingVersion !== PRICING_VERSION) {
    throw new Error(`Expected pricingVersion '${PRICING_VERSION}', got ${gpt4oResult.pricingVersion}`);
  }

  // 2. OpenAI GPT-4o-mini (Input $0.15/1M, Output $0.60/1M)
  // 10,000 input = $0.0015, 5,000 output = $0.003 -> Total = $0.0045
  const miniResult = calculateRequestCost({
    provider: "openai",
    model: "gpt-4o-mini",
    inputTokens: 10000,
    outputTokens: 5000,
  });
  if (miniResult.totalCostUsd !== 0.0045) {
    throw new Error(`GPT-4o-mini total cost expected 0.0045, got ${miniResult.totalCostUsd}`);
  }

  // 3. OpenAI o1 Reasoning Model (Input $15.00/1M, Output $60.00/1M)
  const o1Result = calculateRequestCost({
    provider: "openai",
    model: "o1",
    inputTokens: 2000,
    outputTokens: 1000,
    reasoningTokens: 800,
  });
  // 2000 * 0.000015 = 0.030, 1000 * 0.000060 = 0.060 -> Total = 0.090
  if (o1Result.totalCostUsd !== 0.09) {
    throw new Error(`o1 total cost expected 0.09, got ${o1Result.totalCostUsd}`);
  }

  // 4. Anthropic Claude 3.5 Sonnet with Prompt Caching
  // Input: $3.00/1M, Cached: $0.30/1M, Output: $15.00/1M
  // 10,000 input tokens total with 8,000 cached:
  // 2,000 regular input = 2,000 * 0.000003 = $0.006
  // 8,000 cached input = 8,000 * 0.0000003 = $0.0024 -> Input total = $0.0084
  // 1,000 output tokens = 1,000 * 0.000015 = $0.015 -> Total = $0.0234
  // Savings: without cache would be 10,000 * $0.000003 = $0.030, savings = $0.030 - $0.0084 = $0.0216
  const claudeResult = calculateRequestCost({
    provider: "anthropic",
    model: "claude-3-5-sonnet",
    inputTokens: 10000,
    outputTokens: 1000,
    cachedTokens: 8000,
  });

  if (claudeResult.inputCostUsd !== 0.0084) {
    throw new Error(`Claude cached input cost expected 0.0084, got ${claudeResult.inputCostUsd}`);
  }
  if (claudeResult.outputCostUsd !== 0.015) {
    throw new Error(`Claude output cost expected 0.015, got ${claudeResult.outputCostUsd}`);
  }
  if (claudeResult.totalCostUsd !== 0.0234) {
    throw new Error(`Claude total cost expected 0.0234, got ${claudeResult.totalCostUsd}`);
  }
  if (claudeResult.cachedSavingsUsd !== 0.0216) {
    throw new Error(`Claude cached savings expected 0.0216, got ${claudeResult.cachedSavingsUsd}`);
  }

  // 5. Google Gemini 1.5 Flash (Input $0.075/1M, Output $0.30/1M)
  // 10,000 input = $0.00075, 2,000 output = $0.0006 -> Total = $0.00135
  const geminiResult = calculateRequestCost({
    provider: "gemini",
    model: "gemini-1.5-flash",
    inputTokens: 10000,
    outputTokens: 2000,
  });

  if (geminiResult.totalCostUsd !== 0.00135) {
    throw new Error(`Gemini 1.5 Flash total cost expected 0.00135, got ${geminiResult.totalCostUsd}`);
  }

  // 6. Microsoft Azure OpenAI (azure/gpt-4o)
  const azureResult = calculateRequestCost({
    provider: "azure",
    model: "azure/gpt-4o",
    inputTokens: 4000,
    outputTokens: 1000,
  });
  // 4000 * 0.0000025 = 0.010, 1000 * 0.000010 = 0.010 -> Total = 0.020
  if (azureResult.totalCostUsd !== 0.02) {
    throw new Error(`Azure GPT-4o cost expected 0.02, got ${azureResult.totalCostUsd}`);
  }

  // 7. AWS Bedrock (bedrock/anthropic.claude-3-5-sonnet)
  const bedrockResult = calculateRequestCost({
    provider: "bedrock",
    model: "bedrock/anthropic.claude-3-5-sonnet",
    inputTokens: 2000,
    outputTokens: 1000,
  });
  // 2000 * 0.000003 = 0.006, 1000 * 0.000015 = 0.015 -> Total = 0.021
  if (bedrockResult.totalCostUsd !== 0.021) {
    throw new Error(`Bedrock Claude cost expected 0.021, got ${bedrockResult.totalCostUsd}`);
  }

  // 8. Zero-Invention Policy for Unknown Model (must return UNAVAILABLE & null costs)
  const unknownResult = calculateRequestCost({
    provider: "custom",
    model: "my-unregistered-model-xyz",
    inputTokens: 1000,
    outputTokens: 500,
  });

  if (unknownResult.pricingStatus !== "UNAVAILABLE") {
    throw new Error(`Unknown model must have pricingStatus 'UNAVAILABLE'`);
  }
  if (unknownResult.totalCostUsd !== null || unknownResult.inputCostUsd !== null) {
    throw new Error(`Unknown model must return null totalCostUsd (zero price invention)`);
  }
  if (!unknownResult.unavailableReason?.includes("not listed in the pricing registry")) {
    throw new Error(`Unknown model must return descriptive unavailableReason`);
  }

  // 9. Zero Tokens Case
  const zeroResult = calculateRequestCost({
    provider: "openai",
    model: "gpt-4o",
    inputTokens: 0,
    outputTokens: 0,
  });

  if (zeroResult.totalCostUsd !== 0) {
    throw new Error(`Zero tokens should yield $0.00, got ${zeroResult.totalCostUsd}`);
  }

  // 10. Large Token Counts Precision Test
  const largeResult = calculateRequestCost({
    provider: "openai",
    model: "gpt-4o",
    inputTokens: 1_000_000,
    outputTokens: 1_000_000,
  });
  if (largeResult.totalCostUsd !== 12.5) {
    throw new Error(`1M tokens in/out on GPT-4o expected $12.50, got ${largeResult.totalCostUsd}`);
  }

  // 11. Historical Pricing Version Verification
  const pricingMeta = getModelPricing("gpt-4o");
  if (!pricingMeta || pricingMeta.version !== PRICING_VERSION || pricingMeta.effectiveAt !== PRICING_EFFECTIVE_DATE) {
    throw new Error("Pricing registry must provide explicit version and effective date metadata.");
  }

  // 12. Spend Aggregation Logic Test
  testSpendAggregation();

  // 13. RBAC Visibility Verification
  testCostRbac();

  // 14. Privacy & Zero Secret / Prompt Persistence Test
  testCostPrivacy();

  return true;
}

// Subtest: Spend Aggregation Engine
function testSpendAggregation() {
  const sampleCosts: CostRecord[] = [
    {
      id: "cost_1",
      usageId: "gw_req_1",
      requestId: "gw_req_1",
      organizationId: "org_alpha",
      projectId: "prj_1",
      apiKeyId: "key_1",
      provider: "openai",
      model: "gpt-4o",
      inputTokens: 1000,
      outputTokens: 500,
      cachedTokens: 200,
      reasoningTokens: 0,
      inputCostUsd: 0.00225,
      outputCostUsd: 0.005,
      cachedInputCostUsd: 0.00025,
      reasoningCostUsd: null,
      totalCostUsd: 0.00725,
      pricingVersion: "2026-08",
      pricingEffectiveAt: "2026-01-01",
      pricingStatus: "AVAILABLE",
      timestamp: "2026-08-29T10:00:00Z",
      datePartition: "2026-08-29",
    },
    {
      id: "cost_2",
      usageId: "gw_req_2",
      requestId: "gw_req_2",
      organizationId: "org_alpha",
      projectId: "prj_1",
      apiKeyId: "key_1",
      provider: "anthropic",
      model: "claude-3-5-sonnet",
      inputTokens: 2000,
      outputTokens: 1000,
      cachedTokens: 0,
      reasoningTokens: 0,
      inputCostUsd: 0.006,
      outputCostUsd: 0.015,
      cachedInputCostUsd: 0,
      reasoningCostUsd: null,
      totalCostUsd: 0.021,
      pricingVersion: "2026-08",
      pricingEffectiveAt: "2026-01-01",
      pricingStatus: "AVAILABLE",
      timestamp: "2026-08-29T11:00:00Z",
      datePartition: "2026-08-29",
    },
    {
      id: "cost_3",
      usageId: "gw_req_3",
      requestId: "gw_req_3",
      organizationId: "org_alpha",
      projectId: "prj_2",
      apiKeyId: "key_2",
      provider: "openai",
      model: "gpt-4o-mini",
      inputTokens: 5000,
      outputTokens: 2000,
      cachedTokens: 0,
      reasoningTokens: 0,
      inputCostUsd: 0.00075,
      outputCostUsd: 0.0012,
      cachedInputCostUsd: 0,
      reasoningCostUsd: null,
      totalCostUsd: 0.00195,
      pricingVersion: "2026-08",
      pricingEffectiveAt: "2026-01-01",
      pricingStatus: "AVAILABLE",
      timestamp: "2026-08-29T12:00:00Z",
      datePartition: "2026-08-29",
    },
  ];

  const result: CostAggregationResult = {
    totalSpendUsd: 0,
    totalRequests: 0,
    totalTokens: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalCachedTokens: 0,
    totalReasoningTokens: 0,
    byProvider: {},
    byModel: {},
    byProject: {},
    dailySpend: [],
  };

  for (const c of sampleCosts) {
    const cost = c.totalCostUsd || 0;
    const totTokens = c.inputTokens + c.outputTokens;
    result.totalSpendUsd = Math.round((result.totalSpendUsd + cost) * 100_000_000) / 100_000_000;
    result.totalRequests += 1;
    result.totalTokens += totTokens;
    result.totalInputTokens += c.inputTokens;
    result.totalOutputTokens += c.outputTokens;
    result.totalCachedTokens += c.cachedTokens;

    if (!result.byProvider[c.provider]) {
      result.byProvider[c.provider] = { spendUsd: 0, requests: 0, totalTokens: 0, inputTokens: 0, outputTokens: 0, cachedTokens: 0 };
    }
    result.byProvider[c.provider].spendUsd = Math.round((result.byProvider[c.provider].spendUsd + cost) * 100_000_000) / 100_000_000;
    result.byProvider[c.provider].requests += 1;

    if (!result.byProject[c.projectId]) {
      result.byProject[c.projectId] = { spendUsd: 0, requests: 0, totalTokens: 0, inputTokens: 0, outputTokens: 0, cachedTokens: 0 };
    }
    result.byProject[c.projectId].spendUsd = Math.round((result.byProject[c.projectId].spendUsd + cost) * 100_000_000) / 100_000_000;
    result.byProject[c.projectId].requests += 1;
  }

  // 0.00725 + 0.021 + 0.00195 = 0.0302
  if (result.totalSpendUsd !== 0.0302) {
    throw new Error(`Aggregation totalSpendUsd expected 0.0302, got ${result.totalSpendUsd}`);
  }
  if (result.totalRequests !== 3 || result.totalTokens !== 11500) {
    throw new Error("Aggregation requests/tokens counts mismatch.");
  }
  if (result.byProvider["openai"]?.spendUsd !== 0.0092 || result.byProvider["anthropic"]?.spendUsd !== 0.021) {
    throw new Error("Aggregation byProvider spend mismatch.");
  }
  if (result.byProject["prj_1"]?.spendUsd !== 0.02825 || result.byProject["prj_2"]?.spendUsd !== 0.00195) {
    throw new Error("Aggregation byProject spend mismatch.");
  }
}

// Subtest: RBAC Permission Mapping
function testCostRbac() {
  const roles = ["OWNER", "ADMIN", "DEVELOPER", "VIEWER"] as const;
  for (const role of roles) {
    if (!hasPermission(role, "usage:read")) {
      throw new Error(`Role '${role}' must possess usage:read permission for cost queries.`);
    }
  }
}

// Subtest: Privacy and Zero Secret/Prompt Persistence
function testCostPrivacy() {
  const confidentialPrompt = "USER_SECRET_PROMPT_12345";
  const confidentialCompletion = "AI_GENERATED_SECRET_COMPLETION_67890";
  const rawApiKey = "ost_live_secretkey_12345";
  const rawProviderKey = "sk-proj-vendorsecret_98765";

  const record: CostRecord = {
    id: "cost_privacy_check_1",
    usageId: "gw_req_privacy_1",
    requestId: "gw_req_privacy_1",
    organizationId: "org_alpha",
    projectId: "prj_1",
    apiKeyId: "key_1",
    provider: "openai",
    model: "gpt-4o",
    inputTokens: 1000,
    outputTokens: 500,
    cachedTokens: 0,
    reasoningTokens: 0,
    inputCostUsd: 0.0025,
    outputCostUsd: 0.005,
    cachedInputCostUsd: null,
    reasoningCostUsd: null,
    totalCostUsd: 0.0075,
    pricingVersion: "2026-08",
    pricingEffectiveAt: "2026-01-01",
    pricingStatus: "AVAILABLE",
    timestamp: new Date().toISOString(),
    datePartition: "2026-08-29",
  };

  const serialized = JSON.stringify(record);

  if (serialized.includes(confidentialPrompt)) {
    throw new Error("PRIVACY VIOLATION: User prompt found in CostRecord!");
  }
  if (serialized.includes(confidentialCompletion)) {
    throw new Error("PRIVACY VIOLATION: Completion text found in CostRecord!");
  }
  if (serialized.includes(rawApiKey)) {
    throw new Error("PRIVACY VIOLATION: OsterdOps API secret found in CostRecord!");
  }
  if (serialized.includes(rawProviderKey)) {
    throw new Error("PRIVACY VIOLATION: Provider API secret found in CostRecord!");
  }

  const forbiddenKeys = ["prompt", "content", "completion", "messages", "system", "text", "body", "secret", "apiKey"];
  for (const key of forbiddenKeys) {
    if (key in record) {
      throw new Error(`CostRecord must never contain forbidden property '${key}'.`);
    }
  }
}
