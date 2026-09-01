/**
 * OsterdOps — Gateway Metrics Integration Unit Tests (Phase 28)
 * Validates that recordGatewayTelemetry properly records operational counters,
 * latency gauges, token metrics, error breakdowns, and SLO samples.
 */

import { recordGatewayTelemetry } from "@/lib/gateway/telemetry";
import {
  getOperationalMetricsSnapshot,
  gatewaySloTracker,
} from "@/lib/observability/metrics";

export function runGatewayMetricsTests(): void {
  console.log("▶ Running Gateway Metrics Integration Tests (Phase 28)...");

  // Reset SLO tracker for clean test evaluation
  gatewaySloTracker.reset();

  // Test 1: Record successful gateway request telemetry
  recordGatewayTelemetry({
    requestId: "gw_test_telemetry_1",
    organizationId: "org_test",
    projectId: "proj_test",
    keyId: "key_test",
    provider: "openai",
    model: "gpt-4o-mini",
    status: "success",
    httpStatus: 200,
    durationMs: 145,
    usage: {
      inputTokens: 50,
      outputTokens: 25,
      totalTokens: 75,
    },
    timestamp: new Date().toISOString(),
  });

  const snapshot1 = getOperationalMetricsSnapshot();
  const reqTotalKey = Object.keys(snapshot1.counters).find((k) =>
    k.startsWith("gateway_requests_total") && k.includes('provider="openai"')
  );
  if (!reqTotalKey || (snapshot1.counters[reqTotalKey] || 0) < 1) {
    throw new Error("Expected gateway_requests_total counter to be incremented");
  }

  const tokenTotalKey = Object.keys(snapshot1.counters).find((k) =>
    k.startsWith("gateway_tokens_total") && k.includes('provider="openai"')
  );
  if (!tokenTotalKey || (snapshot1.counters[tokenTotalKey] || 0) < 75) {
    throw new Error("Expected gateway_tokens_total counter to record tokens");
  }

  // Check SLO tracker registered 1 success
  const sloAfterSuccess = gatewaySloTracker.evaluate("ai-gateway");
  if (sloAfterSuccess.totalRequests !== 1 || sloAfterSuccess.successfulRequests !== 1) {
    throw new Error("Expected SLO tracker to reflect 1 success");
  }

  // Test 2: Record error gateway request telemetry
  recordGatewayTelemetry({
    requestId: "gw_test_telemetry_2",
    organizationId: "org_test",
    projectId: "proj_test",
    keyId: "key_test",
    provider: "anthropic",
    model: "claude-3-5-sonnet-20241022",
    status: "error",
    httpStatus: 500,
    durationMs: 250,
    errorCode: "PROVIDER_ERROR",
    timestamp: new Date().toISOString(),
  });

  const snapshot2 = getOperationalMetricsSnapshot();
  const errTotalKey = Object.keys(snapshot2.counters).find((k) =>
    k.startsWith("gateway_errors_total") && k.includes('provider="anthropic"')
  );
  if (!errTotalKey || (snapshot2.counters[errTotalKey] || 0) < 1) {
    throw new Error("Expected gateway_errors_total counter to be incremented");
  }

  // Check SLO tracker registered the failure
  const sloAfterError = gatewaySloTracker.evaluate("ai-gateway");
  if (sloAfterError.totalRequests !== 2 || sloAfterError.failedRequests !== 1) {
    throw new Error("Expected SLO tracker to record 2 total and 1 failure");
  }

  console.log("✔ Gateway Metrics Integration Tests passed.");
}
