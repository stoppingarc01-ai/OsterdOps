/**
 * OsterdOps — Phase 27 Synthetic Performance Benchmark Suite
 * Measures latency and throughput across core platform operations.
 *
 * NOTE: These benchmarks run in a simulated Node.js environment and represent
 * local micro-benchmarks. Real production timings depend on cloud network latency.
 */

import { generateApiKeySecret, hashApiKey, timingSafeHashMatch } from "@/lib/auth/api-key";
import { rateLimit } from "@/lib/rate-limit";
import { evaluateBudgetThresholds, getBudgetPeriodBoundaries } from "@/lib/budget/evaluator";
import { resolveProviderFromModel } from "@/lib/adapters/registry";
import { getModelCapabilities, validateModelRequest } from "@/lib/adapters/models";
import { calculateRequestCost } from "@/lib/cost/calculator";
import { getModelPricing } from "@/lib/cost/pricing-registry";
import { computeAuditRecordHash, GENESIS_HASH } from "@/lib/security/audit-integrity";
import { generateOpenApiSpec } from "@/lib/api/openapi";
import type { Budget, CostAggregationResult } from "@/types";

export interface BenchmarkResult {
  operation: string;
  iterations: number;
  totalDurationMs: number;
  avgDurationUs: number;
  opsPerSec: number;
}

function runBenchmark(name: string, fn: () => void, iterations = 1000): BenchmarkResult {
  // Warmup
  for (let i = 0; i < Math.min(50, iterations); i++) {
    fn();
  }

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();

  const totalDurationMs = end - start;
  const avgDurationUs = (totalDurationMs / iterations) * 1000;
  const opsPerSec = Math.round((iterations / totalDurationMs) * 1000);

  return {
    operation: name,
    iterations,
    totalDurationMs: Number(totalDurationMs.toFixed(3)),
    avgDurationUs: Number(avgDurationUs.toFixed(3)),
    opsPerSec,
  };
}

export function runPerformanceBenchmarks(): BenchmarkResult[] {
  console.log("▶ Running Phase 27: Synthetic Performance Micro-Benchmarks...");

  const results: BenchmarkResult[] = [];

  // 1. API Key Hash Calculation & Timing-Safe Verification
  const sampleKey = generateApiKeySecret("production");
  const sampleHash = hashApiKey(sampleKey.secret);
  results.push(
    runBenchmark("API Key SHA-256 Hashing", () => {
      hashApiKey(sampleKey.secret);
    }, 2000)
  );

  results.push(
    runBenchmark("Timing-Safe Hash Comparison", () => {
      timingSafeHashMatch(sampleHash, sampleHash);
    }, 2000)
  );

  // 2. Provider & Model Resolution
  results.push(
    runBenchmark("Provider Model Resolution (O(1))", () => {
      resolveProviderFromModel("gpt-4o-mini");
      resolveProviderFromModel("claude-3-5-sonnet-20241022");
      resolveProviderFromModel("gemini-1.5-flash");
    }, 2000)
  );

  // 3. Model Capabilities & Parameter Validation
  results.push(
    runBenchmark("Model Capability Lookup & Validation", () => {
      getModelCapabilities("gpt-4o");
      validateModelRequest("gpt-4o", { maxTokens: 4096, temperature: 0.7, stream: true });
    }, 2000)
  );

  // 4. Cost Engine Exact Pricing Calculation
  results.push(
    runBenchmark("Exact Token Cost Calculation", () => {
      getModelPricing("gpt-4o", "openai");
      calculateRequestCost({
        provider: "openai",
        model: "gpt-4o",
        inputTokens: 1500,
        outputTokens: 750,
        cachedTokens: 250,
      });
    }, 2000)
  );

  // 5. Sliding-Window Rate Limit Evaluation
  const rateLimitKey = `bench_rate_${Date.now()}`;
  results.push(
    runBenchmark("Sliding-Window Rate Limit Check", () => {
      rateLimit(rateLimitKey, 1000000, 60000);
    }, 2000)
  );

  // 6. Budget Threshold & Spend Evaluation
  const mockBudget: Budget = {
    id: "bgt_bench_01",
    organizationId: "org_bench",
    name: "Engineering Test Budget",
    amountUsd: 1000.0,
    limitUsd: 1000.0,
    period: "MONTHLY",
    enforcement: "HARD",
    status: "ACTIVE",
    thresholds: [50, 75, 90, 100],
    currentSpendUsd: 760.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockSpendAggregate: CostAggregationResult = {
    totalSpendUsd: 760.0,
    totalRequests: 450,
    totalTokens: 1200000,
    totalInputTokens: 800000,
    totalOutputTokens: 400000,
    totalCachedTokens: 50000,
    totalReasoningTokens: 0,
    byProvider: {},
    byModel: {},
    byProject: {},
    dailySpend: [],
  };

  const periodBoundaries = getBudgetPeriodBoundaries("MONTHLY");

  results.push(
    runBenchmark("Budget Threshold & Hard Limit Evaluation", () => {
      evaluateBudgetThresholds(mockBudget, mockSpendAggregate, periodBoundaries);
    }, 2000)
  );

  // 7. Audit Log HMAC-SHA256 Hash Chaining
  const auditRecord = {
    id: "aud_bench_01",
    organizationId: "org_bench",
    actorId: "usr_bench_01",
    action: "API_KEY_CREATED",
    resourceType: "api_key",
    resourceId: "key_bench_01",
    timestamp: "2026-09-01T00:00:00.000Z",
    details: { name: "Bench Key" },
  };

  results.push(
    runBenchmark("Audit Record Cryptographic Hash Chaining", () => {
      computeAuditRecordHash(GENESIS_HASH, auditRecord, "bench_salt_123");
    }, 2000)
  );

  // 8. OpenAPI Specification Generation
  results.push(
    runBenchmark("OpenAPI 3.1.0 Specification Generation", () => {
      generateOpenApiSpec();
    }, 100)
  );

  // Console output
  console.log("┌──────────────────────────────────────────────┬────────────┬─────────────┬──────────────┐");
  console.log("│ Operation                                    │ Iterations │ Avg Latency │ Throughput   │");
  console.log("├──────────────────────────────────────────────┼────────────┼─────────────┼──────────────┤");
  for (const res of results) {
    const namePadded = res.operation.padEnd(44);
    const iterPadded = String(res.iterations).padStart(10);
    const latPadded = `${res.avgDurationUs.toFixed(2)} µs`.padStart(11);
    const opsPadded = `${res.opsPerSec.toLocaleString()} ops/s`.padStart(12);
    console.log(`│ ${namePadded} │ ${iterPadded} │ ${latPadded} │ ${opsPadded} │`);
  }
  console.log("└──────────────────────────────────────────────┴────────────┴─────────────┴──────────────┘");

  console.log("✔ Phase 27: Performance Micro-Benchmarks completed successfully.");
  return results;
}
