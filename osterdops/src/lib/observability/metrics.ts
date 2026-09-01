/**
 * OsterdOps — Operational Metrics Engine (Phase 14)
 * Tracks numerical performance counters and latencies using bounded label cardinality.
 */

export interface MetricSnapshot {
  counters: Record<string, number>;
  gauges: Record<string, number>;
  timestamp: string;
}

class OperationalMetricsRegistry {
  private readonly maxKeys = 2000;
  private counters = new Map<string, number>();
  private gauges = new Map<string, number>();

  /**
   * Sanitizes label values to prevent high cardinality explosions.
   */
  private formatMetricKey(name: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name;
    }

    const safeLabels = Object.entries(labels)
      .filter(([key]) =>
        [
          "provider",
          "model",
          "status",
          "endpoint",
          "jobType",
          "severity",
          "cache",
          "dependency",
          "state",
          "from",
          "to",
        ].includes(key)
      )
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${String(v).slice(0, 32)}"`)
      .join(",");

    return safeLabels ? `${name}{${safeLabels}}` : name;
  }

  increment(name: string, delta = 1, labels?: Record<string, string>): void {
    const key = this.formatMetricKey(name, labels);
    if (!this.counters.has(key) && this.counters.size >= this.maxKeys) {
      const oldest = this.counters.keys().next().value;
      if (oldest !== undefined) this.counters.delete(oldest);
    }
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + delta);
  }

  setGauge(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.formatMetricKey(name, labels);
    if (!this.gauges.has(key) && this.gauges.size >= this.maxKeys) {
      const oldest = this.gauges.keys().next().value;
      if (oldest !== undefined) this.gauges.delete(oldest);
    }
    this.gauges.set(key, value);
  }

  getSnapshot(): MetricSnapshot {
    const countersObj: Record<string, number> = {};
    for (const [k, v] of this.counters.entries()) {
      countersObj[k] = v;
    }

    const gaugesObj: Record<string, number> = {};
    for (const [k, v] of this.gauges.entries()) {
      gaugesObj[k] = v;
    }

    return {
      counters: countersObj,
      gauges: gaugesObj,
      timestamp: new Date().toISOString(),
    };
  }

  reset(): void {
    this.counters.clear();
    this.gauges.clear();
  }
}

export const operationalMetrics = new OperationalMetricsRegistry();

export function incrementMetric(name: string, delta = 1, labels?: Record<string, string>): void {
  operationalMetrics.increment(name, delta, labels);
}

export function setGaugeMetric(name: string, value: number, labels?: Record<string, string>): void {
  operationalMetrics.setGauge(name, value, labels);
}

export function recordLatencyMetric(name: string, durationMs: number, labels?: Record<string, string>): void {
  operationalMetrics.setGauge(`${name}_latest_ms`, durationMs, labels);
  operationalMetrics.increment(`${name}_count`, 1, labels);
}

export function recordCacheHit(cacheName: string): void {
  operationalMetrics.increment("cache_hits_total", 1, { cache: cacheName });
}

export function recordCacheMiss(cacheName: string): void {
  operationalMetrics.increment("cache_misses_total", 1, { cache: cacheName });
}

export function recordDependencyFailure(dependency: string, status = "error"): void {
  operationalMetrics.increment("dependency_failures_total", 1, {
    dependency,
    status,
  });
}

export function recordCircuitTransition(provider: string, from: string, to: string): void {
  operationalMetrics.increment("circuit_breaker_transitions_total", 1, {
    provider,
    from,
    to,
  });
}

export function getOperationalMetricsSnapshot(): MetricSnapshot {
  return operationalMetrics.getSnapshot();
}

/* ============================================================
   SLO & Error Budget Tracker (Phase 28)
   ============================================================ */

export interface SloStatus {
  service: string;
  targetPercent: number;
  windowMinutes: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  currentAvailabilityPercent: number;
  errorBudgetTotal: number;
  errorBudgetConsumed: number;
  errorBudgetRemainingPercent: number;
  isBreached: boolean;
  isBurningFast: boolean;
}

export class SloTracker {
  private windowMinutes: number;
  private targetPercent: number;
  private samples: { timestamp: number; success: boolean }[] = [];

  constructor(targetPercent = 99.9, windowMinutes = 15) {
    this.targetPercent = targetPercent;
    this.windowMinutes = windowMinutes;
  }

  record(success: boolean): void {
    const now = Date.now();
    this.samples.push({ timestamp: now, success });
    this.prune(now);
  }

  evaluate(serviceName = "ai-gateway"): SloStatus {
    const now = Date.now();
    this.prune(now);

    const total = this.samples.length;
    if (total === 0) {
      return {
        service: serviceName,
        targetPercent: this.targetPercent,
        windowMinutes: this.windowMinutes,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        currentAvailabilityPercent: 100,
        errorBudgetTotal: 0,
        errorBudgetConsumed: 0,
        errorBudgetRemainingPercent: 100,
        isBreached: false,
        isBurningFast: false,
      };
    }

    const successful = this.samples.filter((s) => s.success).length;
    const failed = total - successful;
    const availability = (successful / total) * 100;

    const allowedFailureRate = (100 - this.targetPercent) / 100;
    const errorBudgetTotal = Math.max(1, Math.floor(total * allowedFailureRate));
    const errorBudgetRemaining = Math.max(0, errorBudgetTotal - failed);
    const errorBudgetRemainingPercent = Math.min(100, Math.max(0, (errorBudgetRemaining / errorBudgetTotal) * 100));

    const isBreached = availability < this.targetPercent;
    const actualFailureRate = failed / total;
    const isBurningFast = actualFailureRate > allowedFailureRate;

    return {
      service: serviceName,
      targetPercent: this.targetPercent,
      windowMinutes: this.windowMinutes,
      totalRequests: total,
      successfulRequests: successful,
      failedRequests: failed,
      currentAvailabilityPercent: Number(availability.toFixed(3)),
      errorBudgetTotal,
      errorBudgetConsumed: failed,
      errorBudgetRemainingPercent: Number(errorBudgetRemainingPercent.toFixed(1)),
      isBreached,
      isBurningFast,
    };
  }

  reset(): void {
    this.samples = [];
  }

  private prune(now: number): void {
    const cutoff = now - this.windowMinutes * 60 * 1000;
    this.samples = this.samples.filter((s) => s.timestamp >= cutoff);
  }
}

export const gatewaySloTracker = new SloTracker(99.9, 15);

