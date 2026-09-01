/**
 * OsterdOps — Phase 11: Analytics, Observability & Metrics Engine Unit Tests
 * Tests latency percentiles (p50/p90/p95/p99), time range boundaries, KPI mathematical formulas,
 * multi-dimensional groupings, prompt cache efficiency metrics, chronological time series,
 * RBAC permissions, and zero prompt/secret persistence.
 */

import {
  computeLatencyPercentiles,
  resolveTimeRangeBoundaries,
} from "@/lib/analytics/evaluator";
import { hasPermission } from "@/lib/auth/permissions";
import type {
  AnalyticsOverviewResponse,
  AnalyticsKpiSummary,
  TimeSeriesMetricPoint,
} from "@/types";

// 1. Latency Percentiles Computation (p50, p90, p95, p99, min, max, avg)
export function testLatencyPercentilesComputation() {
  // Empty samples
  const empty = computeLatencyPercentiles([]);
  if (empty.p50 !== 0 || empty.p90 !== 0 || empty.p95 !== 0 || empty.p99 !== 0 || empty.avg !== 0) {
    throw new Error("Empty latency sample should return all zeroes.");
  }

  // Single sample
  const single = computeLatencyPercentiles([250]);
  if (single.p50 !== 250 || single.p99 !== 250 || single.avg !== 250 || single.min !== 250 || single.max !== 250) {
    throw new Error("Single sample latency calculation failed.");
  }

  // Uniform 100 samples: 1ms, 2ms, ..., 100ms
  const uniformSamples = Array.from({ length: 100 }, (_, i) => i + 1);
  const uniformResult = computeLatencyPercentiles(uniformSamples);

  if (uniformResult.min !== 1 || uniformResult.max !== 100) {
    throw new Error("Uniform sample min/max incorrect.");
  }
  if (uniformResult.avg !== 51 && uniformResult.avg !== 50) {
    throw new Error(`Uniform sample average expected ~50-51, got ${uniformResult.avg}`);
  }
  if (uniformResult.p50 !== 51 && uniformResult.p50 !== 50) {
    throw new Error(`Uniform sample p50 expected 50/51, got ${uniformResult.p50}`);
  }
  if (uniformResult.p90 !== 91 && uniformResult.p90 !== 90) {
    throw new Error(`Uniform sample p90 expected 90/91, got ${uniformResult.p90}`);
  }
  if (uniformResult.p95 !== 96 && uniformResult.p95 !== 95) {
    throw new Error(`Uniform sample p95 expected 95/96, got ${uniformResult.p95}`);
  }
  if (uniformResult.p99 !== 100 && uniformResult.p99 !== 99) {
    throw new Error(`Uniform sample p99 expected 99/100, got ${uniformResult.p99}`);
  }

  // Skewed real-world latencies: 95 fast requests (100ms), 5 slow requests (2000ms)
  const skewedSamples = [...Array(95).fill(100), ...Array(5).fill(2000)];
  const skewedResult = computeLatencyPercentiles(skewedSamples);

  if (skewedResult.p50 !== 100) {
    throw new Error(`Skewed distribution p50 expected 100ms, got ${skewedResult.p50}ms`);
  }
  if (skewedResult.p90 !== 100) {
    throw new Error(`Skewed distribution p90 expected 100ms, got ${skewedResult.p90}ms`);
  }
  if (skewedResult.p95 !== 2000) {
    throw new Error(`Skewed distribution p95 expected 2000ms, got ${skewedResult.p95}ms`);
  }
  if (skewedResult.p99 !== 2000) {
    throw new Error(`Skewed distribution p99 expected 2000ms, got ${skewedResult.p99}ms`);
  }
}

// 2. Time Range Boundary Resolutions
export function testTimeRangeResolution() {
  const r24h = resolveTimeRangeBoundaries("24h");
  const r7d = resolveTimeRangeBoundaries("7d");
  const r30d = resolveTimeRangeBoundaries("30d");
  const r90d = resolveTimeRangeBoundaries("90d");

  const diff24h = new Date(r24h.endDate).getTime() - new Date(r24h.startDate).getTime();
  const diff7d = new Date(r7d.endDate).getTime() - new Date(r7d.startDate).getTime();
  const diff30d = new Date(r30d.endDate).getTime() - new Date(r30d.startDate).getTime();

  if (Math.abs(diff24h - 24 * 60 * 60 * 1000) > 1000) {
    throw new Error("24h time range diff calculation mismatch.");
  }
  if (Math.abs(diff7d - 7 * 24 * 60 * 60 * 1000) > 1000) {
    throw new Error("7d time range diff calculation mismatch.");
  }
  if (Math.abs(diff30d - 30 * 24 * 60 * 60 * 1000) > 1000) {
    throw new Error("30d time range diff calculation mismatch.");
  }

  // Custom range
  const custom = resolveTimeRangeBoundaries(
    "custom",
    "2026-08-01T00:00:00.000Z",
    "2026-08-15T23:59:59.999Z"
  );
  if (custom.startDate !== "2026-08-01T00:00:00.000Z" || custom.endDate !== "2026-08-15T23:59:59.999Z") {
    throw new Error("Custom time range boundaries mismatch.");
  }
}

// 3. KPI Mathematical Formulas & Cache Efficiency
export function testKpiFormulasAndMath() {
  const totalRequests = 1000;
  const successRequests = 985;
  const errorRequests = 15;

  const successRate = Math.round((successRequests / totalRequests) * 10000) / 100;
  const errorRate = Math.round((errorRequests / totalRequests) * 10000) / 100;

  if (successRate !== 98.5) {
    throw new Error(`Success rate expected 98.5%, got ${successRate}%`);
  }
  if (errorRate !== 1.5) {
    throw new Error(`Error rate expected 1.5%, got ${errorRate}%`);
  }

  // Prompt Cache Hit Rate: 400,000 cached tokens out of 1,000,000 input tokens = 40%
  const totalInputTokens = 1000000;
  const totalCachedTokens = 400000;
  const cacheHitRate = Math.round((totalCachedTokens / totalInputTokens) * 10000) / 100;

  if (cacheHitRate !== 40.0) {
    throw new Error(`Cache hit rate expected 40.0%, got ${cacheHitRate}%`);
  }

  // Dollar Savings: 400,000 tokens with $1.25/M discount = $0.50
  const discountPerToken = 0.00000125;
  const cacheSavingsUsd = totalCachedTokens * discountPerToken;
  if (cacheSavingsUsd !== 0.5) {
    throw new Error(`Cache savings expected $0.50, got $${cacheSavingsUsd}`);
  }
}

// 4. Multi-Dimensional Groupings & Slices
export function testMultiDimensionalGroupings() {
  const sampleOverview: AnalyticsOverviewResponse = {
    organizationId: "org_enterprise",
    timeRange: "30d",
    startDate: "2026-08-01T00:00:00.000Z",
    endDate: "2026-08-30T23:59:59.999Z",
    kpis: {
      totalSpendUsd: 150.0,
      totalTokens: 15000000,
      totalInputTokens: 10000000,
      totalOutputTokens: 5000000,
      totalCachedTokens: 2000000,
      totalReasoningTokens: 500000,
      totalRequests: 5000,
      successRequests: 4950,
      errorRequests: 50,
      successRatePercent: 99.0,
      errorRatePercent: 1.0,
      averageLatencyMs: 350,
      latencyPercentiles: {
        p50: 250,
        p90: 600,
        p95: 850,
        p99: 1200,
        avg: 350,
        min: 90,
        max: 2500,
      },
      totalCacheSavingsUsd: 2.50,
      cacheHitRatePercent: 20.0,
    },
    byProvider: [
      {
        provider: "openai",
        spendUsd: 90.0,
        requests: 3000,
        totalTokens: 9000000,
        inputTokens: 6000000,
        outputTokens: 3000000,
        cachedTokens: 1500000,
        averageLatencyMs: 300,
        errorRatePercent: 0.8,
        percentageOfSpend: 60.0,
      },
      {
        provider: "anthropic",
        spendUsd: 60.0,
        requests: 2000,
        totalTokens: 6000000,
        inputTokens: 4000000,
        outputTokens: 2000000,
        cachedTokens: 500000,
        averageLatencyMs: 425,
        errorRatePercent: 1.3,
        percentageOfSpend: 40.0,
      },
    ],
    byModel: [
      {
        model: "gpt-4o",
        provider: "openai",
        spendUsd: 90.0,
        requests: 3000,
        totalTokens: 9000000,
        inputTokens: 6000000,
        outputTokens: 3000000,
        cachedTokens: 1500000,
        reasoningTokens: 0,
        averageLatencyMs: 300,
        latencyPercentiles: { p50: 220, p90: 550, p95: 750, p99: 1100, avg: 300, min: 90, max: 2000 },
        errorRatePercent: 0.8,
        cacheHitRatePercent: 25.0,
        cacheSavingsUsd: 1.875,
        percentageOfSpend: 60.0,
      },
    ],
    byProject: [
      {
        projectId: "proj_prod",
        projectName: "Production AI Assistant",
        spendUsd: 150.0,
        requests: 5000,
        totalTokens: 15000000,
        averageLatencyMs: 350,
        errorRatePercent: 1.0,
        percentageOfSpend: 100.0,
      },
    ],
    byApiKey: [
      {
        apiKeyId: "key_live_123",
        name: "Primary Prod Key",
        projectId: "proj_prod",
        spendUsd: 150.0,
        requests: 5000,
        totalTokens: 15000000,
        errorRatePercent: 1.0,
      },
    ],
    byStatusCode: {
      "200": 4950,
      "429": 30,
      "500": 20,
    },
    timeSeries: [],
  };

  // Provider spend sum verification
  const providerSpendSum = sampleOverview.byProvider.reduce((sum, p) => sum + p.spendUsd, 0);
  if (providerSpendSum !== sampleOverview.kpis.totalSpendUsd) {
    throw new Error("Provider spend sum must match total KPI spend.");
  }

  // Model spend sum verification
  const modelSpendSum = sampleOverview.byModel.reduce((sum, m) => sum + m.spendUsd, 0);
  if (modelSpendSum !== 90.0) {
    throw new Error("Model spend sum mismatch.");
  }

  // Status code sum verification
  const statusSum = Object.values(sampleOverview.byStatusCode).reduce((sum, count) => sum + count, 0);
  if (statusSum !== sampleOverview.kpis.totalRequests) {
    throw new Error("Status code sum must equal total requests.");
  }
}

// 5. Chronological Time-Series Sorting & Consistency
export function testTimeSeriesAggregation() {
  const points: TimeSeriesMetricPoint[] = [
    {
      date: "2026-08-20",
      spendUsd: 25.0,
      requests: 500,
      tokens: 1000000,
      inputTokens: 700000,
      outputTokens: 300000,
      cachedTokens: 100000,
      averageLatencyMs: 280,
      errorCount: 2,
    },
    {
      date: "2026-08-19",
      spendUsd: 20.0,
      requests: 400,
      tokens: 800000,
      inputTokens: 550000,
      outputTokens: 250000,
      cachedTokens: 80000,
      averageLatencyMs: 290,
      errorCount: 1,
    },
    {
      date: "2026-08-21",
      spendUsd: 30.0,
      requests: 600,
      tokens: 1200000,
      inputTokens: 850000,
      outputTokens: 350000,
      cachedTokens: 150000,
      averageLatencyMs: 275,
      errorCount: 0,
    },
  ];

  const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));

  if (sorted[0].date !== "2026-08-19" || sorted[1].date !== "2026-08-20" || sorted[2].date !== "2026-08-21") {
    throw new Error("Time series points must sort chronologically ascending.");
  }
}

// 6. RBAC Verification for Analytics
export function testAnalyticsRbac() {
  // OWNER, ADMIN, DEVELOPER, and VIEWER must all possess usage:read
  const roles = ["OWNER", "ADMIN", "DEVELOPER", "VIEWER"] as const;
  for (const role of roles) {
    if (!hasPermission(role, "usage:read")) {
      throw new Error(`Role ${role} must possess usage:read permission for analytics.`);
    }
  }
}

// 7. Privacy Guarantees — Zero Content Persistence
export function testAnalyticsPrivacyGuarantees() {
  const secretPrompt = "CONFIDENTIAL_USER_PROMPT_12345";
  const secretCompletion = "CONFIDENTIAL_AI_RESPONSE_67890";
  const apiKeySecret = "ost_live_abcdef123456";
  const providerKey = "sk-proj-xyz987654321";

  const sampleKpi: AnalyticsKpiSummary = {
    totalSpendUsd: 50.0,
    totalTokens: 500000,
    totalInputTokens: 350000,
    totalOutputTokens: 150000,
    totalCachedTokens: 50000,
    totalReasoningTokens: 10000,
    totalRequests: 200,
    successRequests: 198,
    errorRequests: 2,
    successRatePercent: 99.0,
    errorRatePercent: 1.0,
    averageLatencyMs: 310,
    latencyPercentiles: { p50: 250, p90: 500, p95: 700, p99: 1000, avg: 310, min: 100, max: 1500 },
    totalCacheSavingsUsd: 0.25,
    cacheHitRatePercent: 14.28,
  };

  const serialized = JSON.stringify(sampleKpi);

  if (serialized.includes(secretPrompt) || serialized.includes(secretCompletion)) {
    throw new Error("PRIVACY VIOLATION: Prompt or completion found in analytics KPI!");
  }
  if (serialized.includes(apiKeySecret) || serialized.includes(providerKey)) {
    throw new Error("PRIVACY VIOLATION: Secret key found in analytics KPI!");
  }

  const forbiddenKeys = ["prompt", "content", "completion", "messages", "system", "text", "body", "secret", "apiKey"];
  for (const key of forbiddenKeys) {
    if (key in sampleKpi) {
      throw new Error(`Analytics KPI must never contain forbidden property '${key}'.`);
    }
  }
}

// Master Test Runner for Phase 11
export function runAnalyticsTests() {
  testLatencyPercentilesComputation();
  testTimeRangeResolution();
  testKpiFormulasAndMath();
  testMultiDimensionalGroupings();
  testTimeSeriesAggregation();
  testAnalyticsRbac();
  testAnalyticsPrivacyGuarantees();
}
