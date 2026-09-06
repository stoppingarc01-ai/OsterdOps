import type { UsageRecord } from "@/types";

export interface LiveTelemetryData {
  totalSpendUsd: number;
  projectedSpendUsd: number;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  totalRequests: number;
  cacheSavingsUsd: number;
  cacheHitRatePercent: number;
  averageLatencyMs: number;
  errorRatePercent: number;
  successRatePercent: number;
  p50LatencyMs: number;
  p90LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  timeSeries: Array<{
    date: string;
    spendUsd: number;
    tokens: number;
    requests: number;
    inputTokens: number;
    outputTokens: number;
    cachedTokens: number;
    averageLatencyMs: number;
  }>;
  providerDistribution: Array<{
    provider: string;
    spendUsd: number;
    percentageOfSpend: number;
    requests: number;
    totalTokens: number;
  }>;
  modelDistribution: Array<{
    model: string;
    provider: string;
    spendUsd: number;
    percentageOfSpend: number;
    requests: number;
    totalTokens: number;
    inputTokens: number;
    outputTokens: number;
  }>;
  recentRequests: UsageRecord[];
  byStatusCode: Record<string, number>;
}

export function generateBenchmarkTelemetry(): LiveTelemetryData {
  const timeSeries = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayFactor = (30 - i) / 30;
    const variance = 0.85 + Math.sin(i * 0.7) * 0.25;
    const baseSpend = (45 + dayFactor * 85) * variance;
    const baseTokens = Math.round(baseSpend * 14500);
    const baseRequests = Math.round(baseSpend * 42);

    timeSeries.push({
      date: dateStr,
      spendUsd: Math.round(baseSpend * 100) / 100,
      tokens: baseTokens,
      requests: baseRequests,
      inputTokens: Math.round(baseTokens * 0.68),
      outputTokens: Math.round(baseTokens * 0.32),
      cachedTokens: Math.round(baseTokens * 0.18),
      averageLatencyMs: Math.round(220 + Math.sin(i) * 60),
    });
  }

  const totalSpend = Math.round(timeSeries.reduce((acc, t) => acc + t.spendUsd, 0) * 100) / 100;
  const totalTokens = timeSeries.reduce((acc, t) => acc + t.tokens, 0);
  const totalRequests = timeSeries.reduce((acc, t) => acc + t.requests, 0);
  const promptTokens = Math.round(totalTokens * 0.68);
  const completionTokens = Math.round(totalTokens * 0.32);

  const recentRequests: UsageRecord[] = [
    {
      id: "req_bm_01",
      requestId: "req_bm_01",
      organizationId: "org_default",
      projectId: "proj_prod",
      apiKeyId: "key_live_01",
      provider: "openai",
      model: "gpt-4o",
      inputTokens: 1240,
      outputTokens: 410,
      totalTokens: 1650,
      costUsd: 0.0078,
      latencyMs: 340,
      statusCode: 200,
      status: "SUCCESS",
      timestamp: new Date().toISOString(),
      datePartition: new Date().toISOString().split("T")[0],
    },
    {
      id: "req_bm_02",
      requestId: "req_bm_02",
      organizationId: "org_default",
      projectId: "proj_prod",
      apiKeyId: "key_live_02",
      provider: "anthropic",
      model: "claude-3-5-sonnet",
      inputTokens: 3200,
      outputTokens: 850,
      totalTokens: 4050,
      costUsd: 0.0223,
      latencyMs: 420,
      statusCode: 200,
      status: "SUCCESS",
      timestamp: new Date(Date.now() - 12000).toISOString(),
      datePartition: new Date().toISOString().split("T")[0],
    },
    {
      id: "req_bm_03",
      requestId: "req_bm_03",
      organizationId: "org_default",
      projectId: "proj_prod",
      apiKeyId: "key_live_03",
      provider: "gemini",
      model: "gemini-2.0-flash",
      inputTokens: 850,
      outputTokens: 210,
      totalTokens: 1060,
      costUsd: 0.00042,
      latencyMs: 145,
      statusCode: 200,
      status: "SUCCESS",
      timestamp: new Date(Date.now() - 28000).toISOString(),
      datePartition: new Date().toISOString().split("T")[0],
    },
    {
      id: "req_bm_04",
      requestId: "req_bm_04",
      organizationId: "org_default",
      projectId: "proj_prod",
      apiKeyId: "key_live_04",
      provider: "deepseek",
      model: "deepseek-chat",
      inputTokens: 2100,
      outputTokens: 620,
      totalTokens: 2720,
      costUsd: 0.00085,
      latencyMs: 290,
      statusCode: 200,
      status: "SUCCESS",
      timestamp: new Date(Date.now() - 55000).toISOString(),
      datePartition: new Date().toISOString().split("T")[0],
    },
    {
      id: "req_bm_05",
      requestId: "req_bm_05",
      organizationId: "org_default",
      projectId: "proj_prod",
      apiKeyId: "key_live_05",
      provider: "anthropic",
      model: "claude-3-5-haiku",
      inputTokens: 980,
      outputTokens: 190,
      totalTokens: 1170,
      costUsd: 0.00112,
      latencyMs: 180,
      statusCode: 200,
      status: "SUCCESS",
      timestamp: new Date(Date.now() - 95000).toISOString(),
      datePartition: new Date().toISOString().split("T")[0],
    },
    {
      id: "req_bm_06",
      requestId: "req_bm_06",
      organizationId: "org_default",
      projectId: "proj_prod",
      apiKeyId: "key_live_06",
      provider: "gemini",
      model: "gemini-2.5-pro",
      inputTokens: 4500,
      outputTokens: 1200,
      totalTokens: 5700,
      costUsd: 0.0152,
      latencyMs: 610,
      statusCode: 200,
      status: "SUCCESS",
      timestamp: new Date(Date.now() - 145000).toISOString(),
      datePartition: new Date().toISOString().split("T")[0],
    },
  ];

  return {
    totalSpendUsd: totalSpend,
    projectedSpendUsd: Math.round(totalSpend * 1.22 * 100) / 100,
    totalTokens,
    promptTokens,
    completionTokens,
    totalRequests,
    cacheSavingsUsd: Math.round(totalSpend * 0.184 * 100) / 100,
    cacheHitRatePercent: 18.4,
    averageLatencyMs: 268,
    errorRatePercent: 0.42,
    successRatePercent: 99.58,
    p50LatencyMs: 185,
    p90LatencyMs: 410,
    p95LatencyMs: 560,
    p99LatencyMs: 820,
    timeSeries,
    providerDistribution: [
      { provider: "openai", spendUsd: Math.round(totalSpend * 0.42 * 100) / 100, percentageOfSpend: 42, requests: Math.round(totalRequests * 0.38), totalTokens: Math.round(totalTokens * 0.39) },
      { provider: "anthropic", spendUsd: Math.round(totalSpend * 0.31 * 100) / 100, percentageOfSpend: 31, requests: Math.round(totalRequests * 0.28), totalTokens: Math.round(totalTokens * 0.32) },
      { provider: "gemini", spendUsd: Math.round(totalSpend * 0.19 * 100) / 100, percentageOfSpend: 19, requests: Math.round(totalRequests * 0.24), totalTokens: Math.round(totalTokens * 0.22) },
      { provider: "groq", spendUsd: Math.round(totalSpend * 0.08 * 100) / 100, percentageOfSpend: 8, requests: Math.round(totalRequests * 0.10), totalTokens: Math.round(totalTokens * 0.07) },
    ],
    modelDistribution: [
      { model: "claude-3-5-sonnet", provider: "anthropic", spendUsd: Math.round(totalSpend * 0.28 * 100) / 100, percentageOfSpend: 28, requests: Math.round(totalRequests * 0.22), totalTokens: Math.round(totalTokens * 0.25), inputTokens: Math.round(totalTokens * 0.18), outputTokens: Math.round(totalTokens * 0.07) },
      { model: "gpt-4o", provider: "openai", spendUsd: Math.round(totalSpend * 0.26 * 100) / 100, percentageOfSpend: 26, requests: Math.round(totalRequests * 0.20), totalTokens: Math.round(totalTokens * 0.22), inputTokens: Math.round(totalTokens * 0.15), outputTokens: Math.round(totalTokens * 0.07) },
      { model: "gemini-2.0-flash", provider: "gemini", spendUsd: Math.round(totalSpend * 0.19 * 100) / 100, percentageOfSpend: 19, requests: Math.round(totalRequests * 0.24), totalTokens: Math.round(totalTokens * 0.22), inputTokens: Math.round(totalTokens * 0.16), outputTokens: Math.round(totalTokens * 0.06) },
      { model: "gpt-4o-mini", provider: "openai", spendUsd: Math.round(totalSpend * 0.16 * 100) / 100, percentageOfSpend: 16, requests: Math.round(totalRequests * 0.18), totalTokens: Math.round(totalTokens * 0.17), inputTokens: Math.round(totalTokens * 0.12), outputTokens: Math.round(totalTokens * 0.05) },
      { model: "deepseek-chat", provider: "deepseek", spendUsd: Math.round(totalSpend * 0.08 * 100) / 100, percentageOfSpend: 8, requests: Math.round(totalRequests * 0.10), totalTokens: Math.round(totalTokens * 0.07), inputTokens: Math.round(totalTokens * 0.05), outputTokens: Math.round(totalTokens * 0.02) },
      { model: "claude-3-5-haiku", provider: "anthropic", spendUsd: Math.round(totalSpend * 0.03 * 100) / 100, percentageOfSpend: 3, requests: Math.round(totalRequests * 0.06), totalTokens: Math.round(totalTokens * 0.07), inputTokens: Math.round(totalTokens * 0.05), outputTokens: Math.round(totalTokens * 0.02) },
    ],
    recentRequests,
    byStatusCode: { "200": totalRequests, "429": Math.round(totalRequests * 0.003), "500": Math.round(totalRequests * 0.001) },
  };
}
