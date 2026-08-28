/**
 * OsterdOps — Dashboard Real Data Analytics Aggregator Service
 */

import "server-only";
import { getAdminFirestore } from "@/lib/firebase/admin";
import type { UsageRecord, Project } from "@/types";

export interface ModelSpendBreakdown {
  model: string;
  provider: string;
  spendUsd: number;
  tokens: number;
  requests: number;
  percentage: number;
}

export interface ProjectSpendBreakdown {
  projectId: string;
  projectName: string;
  spendUsd: number;
  percentage: number;
}

export interface TimeSeriesPoint {
  date: string;
  spendUsd: number;
  tokens: number;
  requests: number;
}

export interface OrganizationAnalyticsOverview {
  totalSpendUsd: number;
  totalTokens: number;
  totalRequests: number;
  averageLatencyMs: number;
  activeProjectsCount: number;
  spendByModel: ModelSpendBreakdown[];
  spendByProject: ProjectSpendBreakdown[];
  timeSeries: TimeSeriesPoint[];
}

/**
 * Aggregates organization telemetry usage into structured KPI metrics, breakdown slices, and time-series points.
 */
export async function getOrganizationOverviewAnalytics(
  orgId: string,
  limit = 500
): Promise<OrganizationAnalyticsOverview> {
  const db = getAdminFirestore();

  // 1. Fetch projects map for naming
  const projectsSnap = await db
    .collection("organizations")
    .doc(orgId)
    .collection("projects")
    .get();

  const projectMap = new Map<string, string>();
  let activeProjectsCount = 0;

  projectsSnap.forEach((doc) => {
    const data = doc.data() as Project;
    projectMap.set(doc.id, data.name || "Default Project");
    if (data.status === "active") {
      activeProjectsCount++;
    }
  });

  // 2. Fetch usage records
  const usageSnap = await db
    .collection("organizations")
    .doc(orgId)
    .collection("usage")
    .orderBy("timestamp", "desc")
    .limit(limit)
    .get();

  let totalSpendUsd = 0;
  let totalTokens = 0;
  let totalRequests = 0;
  let totalLatency = 0;

  const modelMap = new Map<string, { provider: string; spendUsd: number; tokens: number; requests: number }>();
  const projectSpendMap = new Map<string, number>();
  const timeSeriesMap = new Map<string, { spendUsd: number; tokens: number; requests: number }>();

  usageSnap.forEach((doc) => {
    const record = doc.data() as UsageRecord;
    const spend = Number(record.costUsd) || 0;
    const tokens = Number(record.totalTokens) || 0;
    const latency = Number(record.latencyMs) || 0;
    const model = record.model || "unknown";
    const provider = record.provider || "openai";
    const projectId = record.projectId || "default";
    const date = record.datePartition || new Date().toISOString().slice(0, 10);

    totalSpendUsd += spend;
    totalTokens += tokens;
    totalRequests += 1;
    totalLatency += latency;

    // Model slice
    const m = modelMap.get(model) || { provider, spendUsd: 0, tokens: 0, requests: 0 };
    m.spendUsd += spend;
    m.tokens += tokens;
    m.requests += 1;
    modelMap.set(model, m);

    // Project slice
    const currentProjSpend = projectSpendMap.get(projectId) || 0;
    projectSpendMap.set(projectId, currentProjSpend + spend);

    // Time-series slice
    const ts = timeSeriesMap.get(date) || { spendUsd: 0, tokens: 0, requests: 0 };
    ts.spendUsd += spend;
    ts.tokens += tokens;
    ts.requests += 1;
    timeSeriesMap.set(date, ts);
  });

  const averageLatencyMs = totalRequests > 0 ? Math.round(totalLatency / totalRequests) : 0;
  totalSpendUsd = Math.round(totalSpendUsd * 10000) / 10000;

  // Format model breakdowns with percentages
  const spendByModel: ModelSpendBreakdown[] = Array.from(modelMap.entries()).map(([model, data]) => ({
    model,
    provider: data.provider,
    spendUsd: Math.round(data.spendUsd * 10000) / 10000,
    tokens: data.tokens,
    requests: data.requests,
    percentage: totalSpendUsd > 0 ? Math.round((data.spendUsd / totalSpendUsd) * 100) : 0,
  })).sort((a, b) => b.spendUsd - a.spendUsd);

  // Format project breakdowns
  const spendByProject: ProjectSpendBreakdown[] = Array.from(projectSpendMap.entries()).map(([pId, spend]) => ({
    projectId: pId,
    projectName: projectMap.get(pId) || pId,
    spendUsd: Math.round(spend * 10000) / 10000,
    percentage: totalSpendUsd > 0 ? Math.round((spend / totalSpendUsd) * 100) : 0,
  })).sort((a, b) => b.spendUsd - a.spendUsd);

  // Format chronological time series
  const timeSeries: TimeSeriesPoint[] = Array.from(timeSeriesMap.entries())
    .map(([date, data]) => ({
      date,
      spendUsd: Math.round(data.spendUsd * 10000) / 10000,
      tokens: data.tokens,
      requests: data.requests,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalSpendUsd,
    totalTokens,
    totalRequests,
    averageLatencyMs,
    activeProjectsCount,
    spendByModel,
    spendByProject,
    timeSeries,
  };
}
