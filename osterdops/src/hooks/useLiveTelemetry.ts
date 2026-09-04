"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";
import type { AnalyticsOverviewResponse, UsageRecord } from "@/types";

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

export interface UseLiveTelemetryOptions {
  organizationId?: string;
  projectId?: string;
  timeRange?: "24h" | "7d" | "30d" | "90d" | "mtd" | "custom";
  pollIntervalMs?: number;
  enabled?: boolean;
}

export const EMPTY_TELEMETRY: LiveTelemetryData = {
  totalSpendUsd: 0,
  projectedSpendUsd: 0,
  totalTokens: 0,
  promptTokens: 0,
  completionTokens: 0,
  totalRequests: 0,
  cacheSavingsUsd: 0,
  cacheHitRatePercent: 0,
  averageLatencyMs: 0,
  errorRatePercent: 0,
  successRatePercent: 100,
  p50LatencyMs: 0,
  p90LatencyMs: 0,
  p95LatencyMs: 0,
  p99LatencyMs: 0,
  timeSeries: [],
  providerDistribution: [],
  modelDistribution: [],
  recentRequests: [],
  byStatusCode: {},
};

/**
 * Global Real-Time Telemetry Hook for OsterdOps.
 * Automatically polls the gateway telemetry and metrics pipeline every 3-5 seconds,
 * delivering reactive multi-tenant live updates across all dashboard views.
 */
export function useLiveTelemetry(options: UseLiveTelemetryOptions = {}) {
  const { currentOrg, organizations, getIdToken } = useAuth();
  const effectiveOrgId = options.organizationId || currentOrg?.id || organizations[0]?.organization?.id || "";
  const effectiveProjectId = options.projectId;
  const timeRange = options.timeRange || "30d";
  const pollIntervalMs = options.pollIntervalMs ?? 4000;
  const enabled = options.enabled ?? true;

  const [data, setData] = useState<LiveTelemetryData>(EMPTY_TELEMETRY);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const isMountedRef = useRef(true);

  const fetchTelemetry = useCallback(async (isInitial = false) => {
    if (!effectiveOrgId || !enabled) {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      return;
    }

    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsValidating(true);
    }

    try {
      const token = await getIdToken();
      const params: Record<string, string> = {
        organizationId: effectiveOrgId,
        timeRange,
      };
      if (effectiveProjectId) {
        params.projectId = effectiveProjectId;
      }

      const res = await apiRequest<AnalyticsOverviewResponse>("/api/v1/analytics/overview", {
        params,
        token,
      });

      if (!isMountedRef.current) return;

      if (res.data) {
        const raw = res.data;
        const kpis = raw.kpis || {};

        // Compute projected spend for month-end
        const now = new Date();
        const dayOfMonth = now.getDate();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const totalSpendUsd = Number(kpis.totalSpendUsd) || 0;
        const totalRequests = Number(kpis.totalRequests) || 0;

        const projectedSpendUsd = totalRequests > 0
          ? Math.round(((totalSpendUsd / Math.max(1, dayOfMonth)) * daysInMonth) * 100) / 100
          : 0;

        const p = kpis.latencyPercentiles || {
          p50: 0,
          p90: 0,
          p95: 0,
          p99: 0,
          min: 0,
          max: 0,
          avg: 0,
        };

        const aggregated: LiveTelemetryData = {
          totalSpendUsd,
          projectedSpendUsd,
          totalTokens: Number(kpis.totalTokens) || 0,
          promptTokens: Number(kpis.totalInputTokens) || 0,
          completionTokens: Number(kpis.totalOutputTokens) || 0,
          totalRequests,
          cacheSavingsUsd: Number(kpis.totalCacheSavingsUsd) || 0,
          cacheHitRatePercent: Number(kpis.cacheHitRatePercent) || 0,
          averageLatencyMs: Math.round(Number(kpis.averageLatencyMs) || Number(p.avg) || 0),
          errorRatePercent: Number(kpis.errorRatePercent) || 0,
          successRatePercent: Number(kpis.successRatePercent) ?? (totalRequests > 0 ? 100 : 100),
          p50LatencyMs: Math.round(Number(p.p50) || 0),
          p90LatencyMs: Math.round(Number(p.p90) || 0),
          p95LatencyMs: Math.round(Number(p.p95) || 0),
          p99LatencyMs: Math.round(Number(p.p99) || 0),
          timeSeries: Array.isArray(raw.timeSeries)
            ? raw.timeSeries.map((t) => ({
                date: t.date,
                spendUsd: Number(t.spendUsd) || 0,
                tokens: Number(t.tokens) || 0,
                requests: Number(t.requests) || 0,
                inputTokens: Number(t.inputTokens) || 0,
                outputTokens: Number(t.outputTokens) || 0,
                cachedTokens: Number(t.cachedTokens) || 0,
                averageLatencyMs: Number(t.averageLatencyMs) || 0,
              }))
            : [],
          providerDistribution: Array.isArray(raw.byProvider)
            ? raw.byProvider.map((prov) => ({
                provider: prov.provider,
                spendUsd: Number(prov.spendUsd) || 0,
                percentageOfSpend: Number(prov.percentageOfSpend) || 0,
                requests: Number(prov.requests) || 0,
                totalTokens: Number(prov.totalTokens) || 0,
              }))
            : [],
          modelDistribution: Array.isArray(raw.byModel)
            ? raw.byModel.map((m) => ({
                model: m.model,
                provider: m.provider,
                spendUsd: Number(m.spendUsd) || 0,
                percentageOfSpend: Number(m.percentageOfSpend) || 0,
                requests: Number(m.requests) || 0,
                totalTokens: Number(m.totalTokens) || 0,
                inputTokens: Number(m.inputTokens) || 0,
                outputTokens: Number(m.outputTokens) || 0,
              }))
            : [],
          recentRequests: Array.isArray(raw.recentRequests) ? raw.recentRequests : [],
          byStatusCode: raw.byStatusCode || {},
        };

        setData(aggregated);
        setError(null);
        setLastUpdated(new Date());
      }
    } catch (err: unknown) {
      if (!isMountedRef.current) return;
      console.warn("[OsterdOps useLiveTelemetry] Polling error:", err);
      setError(err instanceof Error ? err.message : "Failed to load telemetry");
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsValidating(false);
      }
    }
  }, [effectiveOrgId, effectiveProjectId, timeRange, enabled, getIdToken]);

  useEffect(() => {
    isMountedRef.current = true;
    const initialTimer = setTimeout(() => {
      fetchTelemetry(true);
    }, 0);

    if (!enabled || pollIntervalMs <= 0) {
      return () => {
        isMountedRef.current = false;
        clearTimeout(initialTimer);
      };
    }

    const intervalTimer = setInterval(() => {
      // Background poll without showing full loading skeleton
      fetchTelemetry(false);
    }, pollIntervalMs);

    return () => {
      isMountedRef.current = false;
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [enabled, pollIntervalMs, fetchTelemetry]);

  return {
    data,
    isLoading,
    isValidating,
    error,
    refetch: () => fetchTelemetry(false),
    lastUpdated,
  };
}
