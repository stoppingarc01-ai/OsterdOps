/**
 * OsterdOps — Phase 14: Operational Metrics Unit Tests
 */

import {
  incrementMetric,
  setGaugeMetric,
  getOperationalMetricsSnapshot,
  operationalMetrics,
} from "@/lib/observability/metrics";

export function testOperationalMetrics() {
  operationalMetrics.reset();

  // 1. Increment metric with bounded labels
  incrementMetric("gateway_requests_total", 1, { provider: "openai", model: "gpt-4o" });
  incrementMetric("gateway_requests_total", 1, { provider: "openai", model: "gpt-4o" });
  incrementMetric("gateway_requests_total", 1, { provider: "anthropic", model: "claude-3-5-sonnet" });

  // 2. Set gauge
  setGaugeMetric("queue_pending_jobs", 4);

  const snapshot = getOperationalMetricsSnapshot();

  if (snapshot.counters['gateway_requests_total{model="gpt-4o",provider="openai"}'] !== 2) {
    throw new Error("Metric counter increment mismatch.");
  }
  if (snapshot.counters['gateway_requests_total{model="claude-3-5-sonnet",provider="anthropic"}'] !== 1) {
    throw new Error("Metric counter increment for anthropic mismatch.");
  }
  if (snapshot.gauges["queue_pending_jobs"] !== 4) {
    throw new Error("Metric gauge mismatch.");
  }

  // 3. High cardinality label stripping (e.g. userId or prompt should be ignored)
  incrementMetric("test_metric", 1, { provider: "openai", prompt: "secret user text", userId: "user_123" });
  const snapshot2 = getOperationalMetricsSnapshot();
  const keys = Object.keys(snapshot2.counters);
  const foundKey = keys.find((k) => k.startsWith("test_metric"));

  if (!foundKey || foundKey.includes("secret user text") || foundKey.includes("user_123")) {
    throw new Error("High-cardinality or sensitive labels must be stripped from metric keys.");
  }
}

export function runMetricsTests() {
  testOperationalMetrics();
}
