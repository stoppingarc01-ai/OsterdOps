import "server-only";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { calculateRequestCost } from "@/lib/cost/calculator";
import {
  computeLatencyPercentiles,
  resolveTimeRangeBoundaries,
} from "@/lib/analytics/evaluator";
import type {
  UsageRecord,
  CostRecord,
  Project,
  ApiKey,
  LatencyPercentiles,
  AnalyticsKpiSummary,
  ProviderAnalyticsGroup,
  ModelAnalyticsGroup,
  ProjectAnalyticsGroup,
  ApiKeyAnalyticsGroup,
  TimeSeriesMetricPoint,
  AnalyticsOverviewResponse,
  AnalyticsFilterOptions,
  AnalyticsTimeRange,
} from "@/types";

export { computeLatencyPercentiles, resolveTimeRangeBoundaries };

/**
 * Generates comprehensive organization-wide analytics overview.
 */
export async function getOrganizationOverviewAnalytics(
  orgId: string,
  options: AnalyticsFilterOptions | number = {}
): Promise<AnalyticsOverviewResponse> {
  const db = getAdminFirestore();

  const filterOpts: AnalyticsFilterOptions = typeof options === "number"
    ? { limit: options }
    : options;

  const { startDate, endDate } = resolveTimeRangeBoundaries(
    filterOpts.timeRange,
    filterOpts.startDate,
    filterOpts.endDate
  );

  const limit = Math.min(Math.max(1, filterOpts.limit || 500), 1000);

  // 1. Fetch Project and API Key maps for metadata labels
  const [projectsSnap, apiKeysSnap] = await Promise.all([
    db.collection("organizations").doc(orgId).collection("projects").get(),
    db.collection("organizations").doc(orgId).collection("apiKeys").get(),
  ]);

  const projectMap = new Map<string, string>();
  projectsSnap.forEach((doc) => {
    const data = doc.data() as Project;
    projectMap.set(doc.id, data.name || doc.id);
  });

  const apiKeyMap = new Map<string, { name: string; projectId: string }>();
  apiKeysSnap.forEach((doc) => {
    const data = doc.data() as ApiKey;
    apiKeyMap.set(doc.id, { name: data.name || doc.id, projectId: data.projectId });
  });

  // 2. Query Usage & Cost Records within time window
  let usageQuery = db
    .collection("organizations")
    .doc(orgId)
    .collection("usage")
    .orderBy("timestamp", "desc");

  if (filterOpts.projectId) {
    usageQuery = usageQuery.where("projectId", "==", filterOpts.projectId) as typeof usageQuery;
  }
  if (filterOpts.provider) {
    usageQuery = usageQuery.where("provider", "==", filterOpts.provider.toLowerCase()) as typeof usageQuery;
  }
  if (filterOpts.apiKeyId) {
    usageQuery = usageQuery.where("apiKeyId", "==", filterOpts.apiKeyId) as typeof usageQuery;
  }

  const startTimestamp = Timestamp.fromDate(new Date(startDate));
  usageQuery = usageQuery.where("timestamp", ">=", startTimestamp) as typeof usageQuery;

  // Also query corresponding CostRecords
  let costQuery = db
    .collection("organizations")
    .doc(orgId)
    .collection("costs")
    .orderBy("timestamp", "desc");

  if (filterOpts.projectId) {
    costQuery = costQuery.where("projectId", "==", filterOpts.projectId) as typeof costQuery;
  }

  // Phase 27: Parallelize independent Firestore collection reads
  const [usageSnap, costSnap] = await Promise.all([
    usageQuery.limit(limit).get(),
    costQuery.where("timestamp", ">=", startTimestamp).limit(limit).get(),
  ]);

  const costMap = new Map<string, CostRecord>();
  costSnap.docs.forEach((doc) => {
    const data = doc.data() as CostRecord;
    costMap.set(doc.id, data);
  });

  // 3. Metric Aggregation Structures
  let totalSpendUsd = 0;
  let totalTokens = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalCachedTokens = 0;
  let totalReasoningTokens = 0;
  let totalRequests = 0;
  let successRequests = 0;
  let errorRequests = 0;
  let totalCacheSavingsUsd = 0;

  const latencySamples: number[] = [];

  const providerMap = new Map<string, {
    spendUsd: number;
    requests: number;
    tokens: number;
    inputTokens: number;
    outputTokens: number;
    cachedTokens: number;
    latencies: number[];
    errors: number;
  }>();

  const modelMap = new Map<string, {
    provider: string;
    spendUsd: number;
    requests: number;
    tokens: number;
    inputTokens: number;
    outputTokens: number;
    cachedTokens: number;
    reasoningTokens: number;
    latencies: number[];
    errors: number;
    cacheSavingsUsd: number;
  }>();

  const projectMapSummary = new Map<string, {
    spendUsd: number;
    requests: number;
    tokens: number;
    latencies: number[];
    errors: number;
  }>();

  const apiKeyMapSummary = new Map<string, {
    projectId: string;
    spendUsd: number;
    requests: number;
    tokens: number;
    errors: number;
  }>();

  const statusCodeDist: Record<string, number> = {};
  const timeSeriesMap = new Map<string, {
    spendUsd: number;
    requests: number;
    tokens: number;
    inputTokens: number;
    outputTokens: number;
    cachedTokens: number;
    latencies: number[];
    errors: number;
  }>();

  usageSnap.docs.forEach((doc) => {
    const record = doc.data() as UsageRecord;
    const reqId = record.requestId || doc.id;
    const costRecord = costMap.get(reqId);

    // Resolve exact spend from CostRecord or calculate on the fly
    let reqSpend = 0;
    let reqSavings = 0;
    if (costRecord && costRecord.totalCostUsd !== null) {
      reqSpend = costRecord.totalCostUsd;
    } else if (record.costUsd !== undefined && record.costUsd !== null) {
      reqSpend = Number(record.costUsd);
    } else {
      const calc = calculateRequestCost({
        provider: String(record.provider),
        model: record.model,
        inputTokens: record.inputTokens || 0,
        outputTokens: record.outputTokens || 0,
        cachedTokens: record.cachedTokens || 0,
        reasoningTokens: record.reasoningTokens || 0,
      });
      reqSpend = calc.totalCostUsd || 0;
      reqSavings = calc.cachedSavingsUsd || 0;
    }

    const inTokens = Number(record.inputTokens) || 0;
    const outTokens = Number(record.outputTokens) || 0;
    const totTokens = Number(record.totalTokens) || (inTokens + outTokens);
    const cachedTokens = Number(record.cachedTokens) || 0;
    const reasoningTokens = Number(record.reasoningTokens) || 0;
    const latency = Number(record.latencyMs) || 0;
    const status = String(record.status || "SUCCESS").toUpperCase();
    const isSuccess = status === "SUCCESS" && record.statusCode >= 200 && record.statusCode < 400;
    const codeKey = String(record.statusCode || (isSuccess ? 200 : 500));
    const provider = String(record.provider || "openai").toLowerCase();
    const model = record.model || "unknown";
    const projId = record.projectId || "default";
    const keyId = record.apiKeyId || "unknown";
    const date = record.datePartition || new Date().toISOString().slice(0, 10);

    // Filter model if specified
    if (filterOpts.model && model.toLowerCase() !== filterOpts.model.toLowerCase()) {
      return;
    }

    // Totals
    totalSpendUsd = Math.round((totalSpendUsd + reqSpend) * 100_000_000) / 100_000_000;
    totalTokens += totTokens;
    totalInputTokens += inTokens;
    totalOutputTokens += outTokens;
    totalCachedTokens += cachedTokens;
    totalReasoningTokens += reasoningTokens;
    totalRequests += 1;
    totalCacheSavingsUsd = Math.round((totalCacheSavingsUsd + reqSavings) * 100_000_000) / 100_000_000;

    if (isSuccess) {
      successRequests += 1;
    } else {
      errorRequests += 1;
    }

    if (latency > 0) {
      latencySamples.push(latency);
    }

    // Status code distribution
    statusCodeDist[codeKey] = (statusCodeDist[codeKey] || 0) + 1;

    // Provider group
    const pGroup = providerMap.get(provider) || {
      spendUsd: 0,
      requests: 0,
      tokens: 0,
      inputTokens: 0,
      outputTokens: 0,
      cachedTokens: 0,
      latencies: [],
      errors: 0,
    };
    pGroup.spendUsd = Math.round((pGroup.spendUsd + reqSpend) * 100_000_000) / 100_000_000;
    pGroup.requests += 1;
    pGroup.tokens += totTokens;
    pGroup.inputTokens += inTokens;
    pGroup.outputTokens += outTokens;
    pGroup.cachedTokens += cachedTokens;
    if (latency > 0) pGroup.latencies.push(latency);
    if (!isSuccess) pGroup.errors += 1;
    providerMap.set(provider, pGroup);

    // Model group
    const mGroup = modelMap.get(model) || {
      provider,
      spendUsd: 0,
      requests: 0,
      tokens: 0,
      inputTokens: 0,
      outputTokens: 0,
      cachedTokens: 0,
      reasoningTokens: 0,
      latencies: [],
      errors: 0,
      cacheSavingsUsd: 0,
    };
    mGroup.spendUsd = Math.round((mGroup.spendUsd + reqSpend) * 100_000_000) / 100_000_000;
    mGroup.requests += 1;
    mGroup.tokens += totTokens;
    mGroup.inputTokens += inTokens;
    mGroup.outputTokens += outTokens;
    mGroup.cachedTokens += cachedTokens;
    mGroup.reasoningTokens += reasoningTokens;
    mGroup.cacheSavingsUsd = Math.round((mGroup.cacheSavingsUsd + reqSavings) * 100_000_000) / 100_000_000;
    if (latency > 0) mGroup.latencies.push(latency);
    if (!isSuccess) mGroup.errors += 1;
    modelMap.set(model, mGroup);

    // Project group
    const projGroup = projectMapSummary.get(projId) || {
      spendUsd: 0,
      requests: 0,
      tokens: 0,
      latencies: [],
      errors: 0,
    };
    projGroup.spendUsd = Math.round((projGroup.spendUsd + reqSpend) * 100_000_000) / 100_000_000;
    projGroup.requests += 1;
    projGroup.tokens += totTokens;
    if (latency > 0) projGroup.latencies.push(latency);
    if (!isSuccess) projGroup.errors += 1;
    projectMapSummary.set(projId, projGroup);

    // API Key group
    const keyGroup = apiKeyMapSummary.get(keyId) || {
      projectId: projId,
      spendUsd: 0,
      requests: 0,
      tokens: 0,
      errors: 0,
    };
    keyGroup.spendUsd = Math.round((keyGroup.spendUsd + reqSpend) * 100_000_000) / 100_000_000;
    keyGroup.requests += 1;
    keyGroup.tokens += totTokens;
    if (!isSuccess) keyGroup.errors += 1;
    apiKeyMapSummary.set(keyId, keyGroup);

    // Time-series group
    const tsGroup = timeSeriesMap.get(date) || {
      spendUsd: 0,
      requests: 0,
      tokens: 0,
      inputTokens: 0,
      outputTokens: 0,
      cachedTokens: 0,
      latencies: [],
      errors: 0,
    };
    tsGroup.spendUsd = Math.round((tsGroup.spendUsd + reqSpend) * 100_000_000) / 100_000_000;
    tsGroup.requests += 1;
    tsGroup.tokens += totTokens;
    tsGroup.inputTokens += inTokens;
    tsGroup.outputTokens += outTokens;
    tsGroup.cachedTokens += cachedTokens;
    if (latency > 0) tsGroup.latencies.push(latency);
    if (!isSuccess) tsGroup.errors += 1;
    timeSeriesMap.set(date, tsGroup);
  });

  // 4. Compute Final High-Level KPIs
  const latencyPercentiles = computeLatencyPercentiles(latencySamples);
  const successRatePercent = totalRequests > 0
    ? Math.round((successRequests / totalRequests) * 10000) / 100
    : 100;
  const errorRatePercent = totalRequests > 0
    ? Math.round((errorRequests / totalRequests) * 10000) / 100
    : 0;
  const cacheHitRatePercent = totalInputTokens > 0
    ? Math.round((totalCachedTokens / totalInputTokens) * 10000) / 100
    : 0;

  const kpis: AnalyticsKpiSummary = {
    totalSpendUsd,
    totalTokens,
    totalInputTokens,
    totalOutputTokens,
    totalCachedTokens,
    totalReasoningTokens,
    totalRequests,
    successRequests,
    errorRequests,
    successRatePercent,
    errorRatePercent,
    averageLatencyMs: latencyPercentiles.avg,
    latencyPercentiles,
    totalCacheSavingsUsd,
    cacheHitRatePercent,
  };

  // 5. Format Grouped Slices
  const byProvider: ProviderAnalyticsGroup[] = Array.from(providerMap.entries()).map(([provider, data]) => {
    const avgLat = data.latencies.length > 0
      ? Math.round(data.latencies.reduce((a, b) => a + b, 0) / data.latencies.length)
      : 0;
    const errRate = data.requests > 0 ? Math.round((data.errors / data.requests) * 10000) / 100 : 0;
    const pctSpend = totalSpendUsd > 0 ? Math.round((data.spendUsd / totalSpendUsd) * 10000) / 100 : 0;

    return {
      provider,
      spendUsd: data.spendUsd,
      requests: data.requests,
      totalTokens: data.tokens,
      inputTokens: data.inputTokens,
      outputTokens: data.outputTokens,
      cachedTokens: data.cachedTokens,
      averageLatencyMs: avgLat,
      errorRatePercent: errRate,
      percentageOfSpend: pctSpend,
    };
  }).sort((a, b) => b.spendUsd - a.spendUsd);

  const byModel: ModelAnalyticsGroup[] = Array.from(modelMap.entries()).map(([model, data]) => {
    const p = computeLatencyPercentiles(data.latencies);
    const errRate = data.requests > 0 ? Math.round((data.errors / data.requests) * 10000) / 100 : 0;
    const cacheHit = data.inputTokens > 0 ? Math.round((data.cachedTokens / data.inputTokens) * 10000) / 100 : 0;
    const pctSpend = totalSpendUsd > 0 ? Math.round((data.spendUsd / totalSpendUsd) * 10000) / 100 : 0;

    return {
      model,
      provider: data.provider,
      spendUsd: data.spendUsd,
      requests: data.requests,
      totalTokens: data.tokens,
      inputTokens: data.inputTokens,
      outputTokens: data.outputTokens,
      cachedTokens: data.cachedTokens,
      reasoningTokens: data.reasoningTokens,
      averageLatencyMs: p.avg,
      latencyPercentiles: p,
      errorRatePercent: errRate,
      cacheHitRatePercent: cacheHit,
      cacheSavingsUsd: data.cacheSavingsUsd,
      percentageOfSpend: pctSpend,
    };
  }).sort((a, b) => b.spendUsd - a.spendUsd);

  const byProject: ProjectAnalyticsGroup[] = Array.from(projectMapSummary.entries()).map(([pId, data]) => {
    const avgLat = data.latencies.length > 0
      ? Math.round(data.latencies.reduce((a, b) => a + b, 0) / data.latencies.length)
      : 0;
    const errRate = data.requests > 0 ? Math.round((data.errors / data.requests) * 10000) / 100 : 0;
    const pctSpend = totalSpendUsd > 0 ? Math.round((data.spendUsd / totalSpendUsd) * 10000) / 100 : 0;

    return {
      projectId: pId,
      projectName: projectMap.get(pId) || pId,
      spendUsd: data.spendUsd,
      requests: data.requests,
      totalTokens: data.tokens,
      averageLatencyMs: avgLat,
      errorRatePercent: errRate,
      percentageOfSpend: pctSpend,
    };
  }).sort((a, b) => b.spendUsd - a.spendUsd);

  const byApiKey: ApiKeyAnalyticsGroup[] = Array.from(apiKeyMapSummary.entries()).map(([kId, data]) => {
    const errRate = data.requests > 0 ? Math.round((data.errors / data.requests) * 10000) / 100 : 0;
    const meta = apiKeyMap.get(kId);

    return {
      apiKeyId: kId,
      name: meta?.name || kId,
      projectId: data.projectId,
      spendUsd: data.spendUsd,
      requests: data.requests,
      totalTokens: data.tokens,
      errorRatePercent: errRate,
    };
  }).sort((a, b) => b.spendUsd - a.spendUsd);

  const timeSeries: TimeSeriesMetricPoint[] = Array.from(timeSeriesMap.entries()).map(([date, data]) => {
    const avgLat = data.latencies.length > 0
      ? Math.round(data.latencies.reduce((a, b) => a + b, 0) / data.latencies.length)
      : 0;

    return {
      date,
      spendUsd: data.spendUsd,
      requests: data.requests,
      tokens: data.tokens,
      inputTokens: data.inputTokens,
      outputTokens: data.outputTokens,
      cachedTokens: data.cachedTokens,
      averageLatencyMs: avgLat,
      errorCount: data.errors,
    };
  }).sort((a, b) => a.date.localeCompare(b.date));

  const recentRequests: UsageRecord[] = usageSnap.docs.slice(0, 25).map((doc) => {
    const d = doc.data() as Record<string, unknown>;
    const toDateStr = (val: unknown): string => {
      if (!val) return new Date().toISOString();
      if (typeof val === "string") return val;
      if (typeof val === "object" && val !== null && "toDate" in val && typeof (val as { toDate: () => Date }).toDate === "function") {
        return (val as { toDate: () => Date }).toDate().toISOString();
      }
      return new Date().toISOString();
    };
    const reqId = String(d.requestId || doc.id);
    const costRecord = costMap.get(reqId);
    let costUsd = d.costUsd !== undefined ? Number(d.costUsd) : undefined;
    if (costRecord && costRecord.totalCostUsd !== null) {
      costUsd = costRecord.totalCostUsd;
    }
    const inTokens = Number(d.inputTokens) || 0;
    const outTokens = Number(d.outputTokens) || 0;
    const totTokens = Number(d.totalTokens) || (inTokens + outTokens);

    return {
      id: doc.id,
      requestId: reqId,
      organizationId: String(d.organizationId || orgId),
      projectId: String(d.projectId || ""),
      apiKeyId: String(d.apiKeyId || ""),
      provider: String(d.provider || "openai"),
      model: String(d.model || "unknown"),
      inputTokens: inTokens,
      outputTokens: outTokens,
      totalTokens: totTokens,
      cachedTokens: d.cachedTokens !== undefined ? Number(d.cachedTokens) : undefined,
      reasoningTokens: d.reasoningTokens !== undefined ? Number(d.reasoningTokens) : undefined,
      costUsd,
      costType: d.costType as UsageRecord["costType"],
      latencyMs: Number(d.latencyMs) || 0,
      statusCode: Number(d.statusCode) || 200,
      status: (d.status as UsageRecord["status"]) || (Number(d.statusCode) < 400 ? "SUCCESS" : "ERROR"),
      errorCode: d.errorCode ? String(d.errorCode) : undefined,
      timestamp: toDateStr(d.timestamp),
      datePartition: String(d.datePartition || new Date().toISOString().slice(0, 10)),
    };
  });

  return {
    organizationId: orgId,
    projectId: filterOpts.projectId,
    timeRange: filterOpts.timeRange || "30d",
    startDate,
    endDate,
    kpis,
    byProvider,
    byModel,
    byProject,
    byApiKey,
    byStatusCode: statusCodeDist,
    timeSeries,
    recentRequests,
  };
}

/**
 * Retrieves analytics scoped to a specific project.
 */
export async function getProjectAnalytics(
  orgId: string,
  projectId: string,
  options: Omit<AnalyticsFilterOptions, "projectId"> = {}
): Promise<AnalyticsOverviewResponse> {
  return getOrganizationOverviewAnalytics(orgId, {
    ...options,
    projectId,
  });
}

/**
 * Retrieves latency percentiles and distribution breakdown across models and providers.
 */
export async function getLatencyObservability(
  orgId: string,
  options: AnalyticsFilterOptions = {}
): Promise<{
  overallPercentiles: LatencyPercentiles;
  byModel: Array<{ model: string; provider: string; latencyPercentiles: LatencyPercentiles; requests: number }>;
  byProvider: Array<{ provider: string; latencyPercentiles: LatencyPercentiles; requests: number }>;
}> {
  const overview = await getOrganizationOverviewAnalytics(orgId, options);

  const byModel = overview.byModel.map((m) => ({
    model: m.model,
    provider: m.provider,
    latencyPercentiles: m.latencyPercentiles,
    requests: m.requests,
  }));

  const byProvider = overview.byProvider.map((p) => ({
    provider: p.provider,
    latencyPercentiles: {
      p50: p.averageLatencyMs,
      p90: p.averageLatencyMs,
      p95: p.averageLatencyMs,
      p99: p.averageLatencyMs,
      avg: p.averageLatencyMs,
      min: p.averageLatencyMs,
      max: p.averageLatencyMs,
    },
    requests: p.requests,
  }));

  return {
    overallPercentiles: overview.kpis.latencyPercentiles,
    byModel,
    byProvider,
  };
}
