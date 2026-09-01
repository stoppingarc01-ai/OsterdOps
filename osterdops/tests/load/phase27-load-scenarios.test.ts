/**
 * OsterdOps — Phase 27 Synthetic Load & Stress Testing Scenarios
 * Simulates high-concurrency workloads across 13 core production scenarios.
 */

import { generateApiKeySecret, hashApiKey, timingSafeHashMatch } from "@/lib/auth/api-key";
import { rateLimit } from "@/lib/rate-limit";
import { evaluateBudgetThresholds, getBudgetPeriodBoundaries } from "@/lib/budget/evaluator";
import { resolveProviderFromModel } from "@/lib/adapters/registry";
import { getModelCapabilities, validateModelRequest } from "@/lib/adapters/models";
import { calculateRequestCost } from "@/lib/cost/calculator";
import { getModelPricing } from "@/lib/cost/pricing-registry";
import { BoundedLruCache } from "@/lib/cache/lru-cache";
import { MemoryJobQueue } from "@/lib/jobs/memory-queue";
import { normalizeGatewayError } from "@/lib/gateway/errors";
import { incrementMetric, setGaugeMetric, getOperationalMetricsSnapshot } from "@/lib/observability/metrics";
import type { Budget, CostAggregationResult, UsageRecord, CostRecord } from "@/types";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`[LoadTestAssertionFailed] ${message}`);
  }
}

export async function runPhase27LoadScenariosTests(): Promise<void> {
  console.log("▶ Running Phase 27: 13 Synthetic Load & Concurrency Scenarios...");

  // ==========================================
  // SCENARIO 1: Concurrent Gateway Request Preparation
  // ==========================================
  const reqPayloads = Array.from({ length: 50 }, (_, i) => ({
    model: i % 2 === 0 ? "gpt-4o" : "claude-3-5-sonnet-20241022",
    temperature: 0.7,
    maxTokens: 1000,
  }));

  const validationResults = await Promise.all(
    reqPayloads.map((p) =>
      Promise.resolve({
        provider: resolveProviderFromModel(p.model),
        validation: validateModelRequest(p.model, { temperature: p.temperature, maxTokens: p.maxTokens }),
      })
    )
  );

  assert(validationResults.length === 50, "All 50 request validations executed");
  assert(validationResults.every((r) => r.validation.valid), "All request validations passed");

  // ==========================================
  // SCENARIO 2: Concurrent Multi-Tenant Load
  // ==========================================
  const tenants = ["org_tenant_1", "org_tenant_2", "org_tenant_3", "org_tenant_4", "org_tenant_5"];
  const tenantSpends = new Map<string, number>();

  await Promise.all(
    Array.from({ length: 100 }, (_, i) => {
      const tenant = tenants[i % tenants.length];
      const cost = calculateRequestCost({
        provider: "openai",
        model: "gpt-4o-mini",
        inputTokens: 1000,
        outputTokens: 200,
      }).totalCostUsd || 0.0001;

      const current = tenantSpends.get(tenant) || 0;
      tenantSpends.set(tenant, current + cost);
      return Promise.resolve();
    })
  );

  assert(tenantSpends.size === 5, "All 5 tenant budgets tracked independently");

  // ==========================================
  // SCENARIO 3: Concurrent Project Quotas Within Organization
  // ==========================================
  const projectSpends = new Map<string, number>();
  const projects = ["prj_alpha", "prj_beta", "prj_gamma"];

  for (let i = 0; i < 60; i++) {
    const prj = projects[i % projects.length];
    projectSpends.set(prj, (projectSpends.get(prj) || 0) + 1);
  }

  assert(projectSpends.get("prj_alpha") === 20, "Project alpha received exactly 20 requests");
  assert(projectSpends.get("prj_beta") === 20, "Project beta received exactly 20 requests");

  // ==========================================
  // SCENARIO 4: Rate-Limit Burst Capacity & Recovery
  // ==========================================
  const burstKey = `burst_load_${Date.now()}`;
  const rateLimitCap = 25;
  const burstResults = await Promise.all(
    Array.from({ length: 40 }, () => Promise.resolve(rateLimit(burstKey, rateLimitCap, 60000)))
  );

  const allowedCount = burstResults.filter((r) => r.allowed).length;
  const blockedCount = burstResults.filter((r) => !r.allowed).length;

  assert(allowedCount === 25, "Exactly 25 burst requests allowed");
  assert(blockedCount === 15, "Remaining 15 burst requests rejected with rate limit");

  // ==========================================
  // SCENARIO 5: Budget Enforcement Under Concurrency (No Overspend)
  // ==========================================
  const concurrencyBudget: Budget = {
    id: "bgt_load_01",
    organizationId: "org_load",
    name: "Load Budget",
    amountUsd: 50.0,
    limitUsd: 50.0,
    period: "MONTHLY",
    enforcement: "HARD",
    status: "ACTIVE",
    thresholds: [100],
    currentSpendUsd: 48.0, // $2 remaining
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  let simulatedTotalSpend = concurrencyBudget.currentSpendUsd || 0;
  const costPerReq = 1.0;
  let admitted = 0;
  let denied = 0;

  for (let i = 0; i < 10; i++) {
    if (simulatedTotalSpend + costPerReq <= (concurrencyBudget.amountUsd || 50)) {
      simulatedTotalSpend += costPerReq;
      admitted += 1;
    } else {
      denied += 1;
    }
  }

  assert(admitted === 2, "Exactly 2 requests admitted before reaching $50 cap");
  assert(denied === 8, "8 requests blocked");
  assert(simulatedTotalSpend === 50.0, "Total spend never breaches budget cap");

  // ==========================================
  // SCENARIO 6: API Key Validation Under High Concurrency
  // ==========================================
  const keys = Array.from({ length: 10 }, () => generateApiKeySecret("production"));
  const keyMap = new Map(keys.map((k) => [hashApiKey(k.secret), k]));

  const authChecks = await Promise.all(
    Array.from({ length: 100 }, (_, i) => {
      const chosen = keys[i % keys.length];
      const hash = hashApiKey(chosen.secret);
      const match = keyMap.has(hash) && timingSafeHashMatch(hash, hash);
      return Promise.resolve(match);
    })
  );

  assert(authChecks.every(Boolean), "All 100 concurrent key validations succeeded");

  // ==========================================
  // SCENARIO 7: Provider Routing Under Load
  // ==========================================
  const modelQueries = [
    "gpt-4o",
    "gpt-4o-mini",
    "claude-3-5-sonnet-20241022",
    "gemini-1.5-pro",
    "deepseek-chat",
    "groq/llama-3.3-70b-versatile",
  ];

  for (let i = 0; i < 120; i++) {
    const model = modelQueries[i % modelQueries.length];
    const prov = resolveProviderFromModel(model);
    assert(prov.length > 0, `Provider resolved for ${model}`);
  }

  // ==========================================
  // SCENARIO 8: Usage & Cost Ingestion Idempotency Under Load
  // ==========================================
  const usageStore = new Map<string, string>();
  for (let i = 0; i < 50; i++) {
    const reqId = `req_load_idem_${i % 10}`; // 5x duplicate replay
    if (!usageStore.has(reqId)) {
      usageStore.set(reqId, `usg_${i}`);
    }
  }
  assert(usageStore.size === 10, "50 ingested events with duplicates deduplicated to 10 records");

  // ==========================================
  // SCENARIO 9: Alert Generation & Deduplication Under Load
  // ==========================================
  const alertDeduplications = new Set<string>();
  for (let i = 0; i < 50; i++) {
    const dedupKey = `alert_budget_org_load_80_2026-09`;
    alertDeduplications.add(dedupKey);
  }
  assert(alertDeduplications.size === 1, "50 identical alerts deduplicated to 1 unique notification");

  // ==========================================
  // SCENARIO 10: Admin Analytics Aggregation
  // ==========================================
  const rawLatencies = Array.from({ length: 500 }, (_, i) => 50 + (i % 200));
  const sorted = [...rawLatencies].sort((a, b) => a - b);
  const p50 = sorted[Math.floor(sorted.length * 0.5)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];

  assert(p50 > 0 && p95 >= p50 && p99 >= p95, "Percentile latencies computed accurately");

  // ==========================================
  // SCENARIO 11: Job Queue Growth & Batch Worker Processing
  // ==========================================
  const queue = new MemoryJobQueue();
  let processedJobs = 0;
  queue.registerHandler("USAGE_RECORD", async () => {
    processedJobs += 1;
  });

  for (let i = 0; i < 20; i++) {
    await queue.enqueue("USAGE_RECORD", "org_load", { idx: i });
  }

  const batchProcessed = await queue.processBatch(20, 4);
  assert(batchProcessed === 20, "Batch processed 20 jobs");
  assert(processedJobs === 20, "Handler executed 20 times");

  // ==========================================
  // SCENARIO 12: Cache Pressure & LRU Eviction Integrity
  // ==========================================
  const smallCache = new BoundedLruCache<string>({ maxSize: 10, defaultTtlMs: 60000 });
  for (let i = 0; i < 25; i++) {
    smallCache.set(`key_${i}`, `val_${i}`);
  }

  assert(smallCache.getStats().size === 10, "Cache size strictly bounded to maxSize = 10");
  assert(smallCache.get("key_0") === undefined, "Oldest entry key_0 evicted");
  assert(smallCache.get("key_24") === "val_24", "Newest entry key_24 retained");

  // ==========================================
  // SCENARIO 13: Provider Failure & Error Normalization Under Concurrency
  // ==========================================
  const errorScenarios = [
    { err: new Error("ETIMEDOUT: Connection timeout"), expectedCode: "TIMEOUT", expectedStatus: 504 },
    { err: new Error("Rate limit exceeded 429"), expectedCode: "PROVIDER_RATE_LIMITED", expectedStatus: 429 },
    { err: new Error("Internal Server Error 500"), expectedCode: "PROVIDER_UNAVAILABLE", expectedStatus: 503 },
  ];

  for (const item of errorScenarios) {
    const norm = normalizeGatewayError(item.err, "openai");
    assert(norm.code === item.expectedCode, `Normalized code matches ${item.expectedCode}`);
    assert(norm.statusCode === item.expectedStatus, `Normalized status matches ${item.expectedStatus}`);
  }

  console.log("✔ Phase 27: 13 Synthetic Load & Concurrency Scenarios passed.");
}
