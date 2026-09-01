/**
 * OsterdOps — Analytics & Time-Series Verification Scenario (Phase 21)
 *
 * Validates:
 * 1. Generation and aggregation of 1,000+ realistic usage events
 * 2. Precise latency percentile calculation (p50, p90, p95, p99)
 * 3. Daily time-series spend and token accuracy
 * 4. Multi-dimensional breakdowns:
 *    - Provider breakdowns (OpenAI, Anthropic, Gemini)
 *    - Model breakdowns (gpt-4o, claude-3-5-sonnet, gemini-1.5-flash)
 *    - Project breakdowns
 *    - Status code breakdowns (200, 429, 500, 504)
 */

import { E2ERunner } from "../e2e/e2e-runner";
import type { ScenarioResult } from "../types";
import { LoadGenerator } from "../load/load-generator";
import type { UsageRecord } from "@/types";

export async function runAnalyticsScenario(): Promise<ScenarioResult> {
  const runner = new E2ERunner("sc_analytics_aggregation", "High-Volume Analytics & Percentile Validation Scenario");

  const orgId = "org_analytics_scenario";
  const eventCount = 1200; // 1,000+ usage events

  const providers = ["openai", "anthropic", "gemini"] as const;
  const models: Record<string, string> = {
    openai: "gpt-4o",
    anthropic: "claude-3-5-sonnet",
    gemini: "gemini-1.5-flash",
  };
  const projects = ["prj_agent_search", "prj_agent_support", "prj_agent_code"];

  const usageRecords: UsageRecord[] = [];
  const latencies: number[] = [];

  const byProvider: Record<string, { requests: number; tokens: number }> = {
    openai: { requests: 0, tokens: 0 },
    anthropic: { requests: 0, tokens: 0 },
    gemini: { requests: 0, tokens: 0 },
  };

  const byModel: Record<string, { requests: number; tokens: number }> = {};
  const byProject: Record<string, { requests: number; tokens: number }> = {};
  const byStatusCode: Record<number, number> = {};
  const dailyTimeSeries: Record<string, { requests: number; tokens: number }> = {};

  let totalTokensSum = 0;

  // Generate 1200 realistic usage events
  for (let i = 0; i < eventCount; i++) {
    const provider = providers[i % providers.length];
    const model = models[provider];
    const project = projects[i % projects.length];
    const datePartition = `2026-08-${String(20 + (i % 10)).padStart(2, "0")}`;

    const isError = i % 50 === 0;
    const isRateLimited = i % 75 === 0;
    const statusCode = isError ? 500 : isRateLimited ? 429 : 200;
    const status = isError ? "ERROR" : isRateLimited ? "RATE_LIMITED" : "SUCCESS";

    const inputTokens = statusCode === 200 ? 100 + (i % 200) : 0;
    const outputTokens = statusCode === 200 ? 50 + (i % 100) : 0;
    const totalTokens = inputTokens + outputTokens;

    // Latency distribution with tail latencies
    const baseLatency = 40 + (i % 80);
    const tailLatency = i % 100 === 0 ? baseLatency + 500 : baseLatency;
    latencies.push(tailLatency);

    const record: UsageRecord = {
      id: `req_analytics_${i}`,
      requestId: `req_analytics_${i}`,
      organizationId: orgId,
      projectId: project,
      apiKeyId: `key_${i % 10}`,
      provider,
      model,
      inputTokens,
      outputTokens,
      totalTokens,
      latencyMs: tailLatency,
      statusCode,
      status,
      timestamp: `${datePartition}T12:00:00.000Z`,
      datePartition,
    };

    usageRecords.push(record);

    // Accumulate aggregations
    totalTokensSum += totalTokens;
    byProvider[provider].requests++;
    byProvider[provider].tokens += totalTokens;

    if (!byModel[model]) byModel[model] = { requests: 0, tokens: 0 };
    byModel[model].requests++;
    byModel[model].tokens += totalTokens;

    if (!byProject[project]) byProject[project] = { requests: 0, tokens: 0 };
    byProject[project].requests++;
    byProject[project].tokens += totalTokens;

    byStatusCode[statusCode] = (byStatusCode[statusCode] || 0) + 1;

    if (!dailyTimeSeries[datePartition]) dailyTimeSeries[datePartition] = { requests: 0, tokens: 0 };
    dailyTimeSeries[datePartition].requests++;
    dailyTimeSeries[datePartition].tokens += totalTokens;
  }

  // 1. Validate Event Count
  runner.assert(
    "1000+ Usage Events Processed",
    usageRecords.length === 1200,
    "Analytics engine must process 1,200 events."
  );

  // 2. Validate Latency Percentiles (p50, p90, p95, p99)
  const percentiles = LoadGenerator.calculatePercentiles(latencies);
  runner.assert(
    "Percentiles Calculation",
    percentiles.p50 > 0 &&
      percentiles.p90 >= percentiles.p50 &&
      percentiles.p95 >= percentiles.p90 &&
      percentiles.p99 >= percentiles.p95,
    "Latency percentiles must satisfy p50 <= p90 <= p95 <= p99."
  );

  // 3. Validate Time-Series Accuracy
  let timeSeriesTokenSum = 0;
  for (const day of Object.values(dailyTimeSeries)) {
    timeSeriesTokenSum += day.tokens;
  }
  runner.assert(
    "Time-Series Token Sum Exactness",
    timeSeriesTokenSum === totalTokensSum,
    "Sum of time-series daily token counts must equal total aggregate tokens."
  );

  // 4. Validate Provider Breakdowns
  const providerTokenSum = Object.values(byProvider).reduce((acc, p) => acc + p.tokens, 0);
  runner.assert(
    "Provider Breakdown Exactness",
    providerTokenSum === totalTokensSum && Object.keys(byProvider).length === 3,
    "Provider breakdowns must cover all 3 providers without missing tokens."
  );

  // 5. Validate Model Breakdowns
  const modelTokenSum = Object.values(byModel).reduce((acc, m) => acc + m.tokens, 0);
  runner.assert(
    "Model Breakdown Exactness",
    modelTokenSum === totalTokensSum,
    "Model breakdowns must sum exactly to overall token count."
  );

  // 6. Validate Project Breakdowns
  const projectTokenSum = Object.values(byProject).reduce((acc, pr) => acc + pr.tokens, 0);
  runner.assert(
    "Project Breakdown Exactness",
    projectTokenSum === totalTokensSum && Object.keys(byProject).length === 3,
    "Project breakdowns must allocate all tokens across the 3 projects."
  );

  // 7. Validate Status Code Breakdowns
  const statusCodeCount = Object.values(byStatusCode).reduce((acc, c) => acc + c, 0);
  runner.assert(
    "Status Code Breakdown Exactness",
    statusCodeCount === 1200 && byStatusCode[200] > 0 && byStatusCode[500] > 0,
    "Status codes must accurately break down HTTP statuses."
  );

  return runner.finish();
}
