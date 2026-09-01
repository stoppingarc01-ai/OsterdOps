/**
 * OsterdOps — Pure Analytics & Observability Metric Calculators (Phase 11)
 * Independent of Next.js server runtime for pure unit testing and fast evaluation.
 */

import type { LatencyPercentiles, AnalyticsTimeRange } from "@/types";

/**
 * Computes exact nearest-rank percentiles from latency samples.
 */
export function computeLatencyPercentiles(samples: number[]): LatencyPercentiles {
  if (!samples || samples.length === 0) {
    return { p50: 0, p90: 0, p95: 0, p99: 0, avg: 0, min: 0, max: 0 };
  }

  const sorted = [...samples].sort((a, b) => a - b);
  const n = sorted.length;
  const sum = sorted.reduce((acc, val) => acc + val, 0);

  const getPercentile = (p: number): number => {
    if (n === 1) return sorted[0];
    const index = Math.min(Math.floor(p * n), n - 1);
    return sorted[index];
  };

  return {
    p50: getPercentile(0.50),
    p90: getPercentile(0.90),
    p95: getPercentile(0.95),
    p99: getPercentile(0.99),
    avg: Math.round(sum / n),
    min: sorted[0],
    max: sorted[n - 1],
  };
}

/**
 * Resolves UTC date boundaries from a relative time range string.
 */
export function resolveTimeRangeBoundaries(
  timeRange: AnalyticsTimeRange = "30d",
  customStart?: string,
  customEnd?: string,
  nowDate: Date = new Date()
): { startDate: string; endDate: string } {
  if (timeRange === "custom" && customStart && customEnd) {
    return { startDate: customStart, endDate: customEnd };
  }

  const end = nowDate.toISOString();
  let startMs = nowDate.getTime();

  switch (timeRange) {
    case "24h":
      startMs -= 24 * 60 * 60 * 1000;
      break;
    case "7d":
      startMs -= 7 * 24 * 60 * 60 * 1000;
      break;
    case "90d":
      startMs -= 90 * 24 * 60 * 60 * 1000;
      break;
    case "30d":
    default:
      startMs -= 30 * 24 * 60 * 60 * 1000;
      break;
  }

  return {
    startDate: new Date(startMs).toISOString(),
    endDate: end,
  };
}
