/**
 * OsterdOps — Integration Health Monitor (Phase 20)
 * Evaluates connection availability, rolling 24-hour success rates, and latency.
 */

import type { IntegrationHealth, IntegrationStatus, DeliveryRecord } from "./types";

/**
 * Computes the health summary for an integration connection.
 */
export function calculateIntegrationHealth(
  integrationId: string,
  status: IntegrationStatus,
  deliveries: DeliveryRecord[],
  lastTestedAt?: string
): IntegrationHealth {
  if (status === "REVOKED") {
    return {
      integrationId,
      status: "REVOKED",
      healthy: false,
      successRate24h: 0,
      averageLatencyMs: 0,
      failureCount24h: 0,
      lastTestedAt,
    };
  }

  if (deliveries.length === 0) {
    return {
      integrationId,
      status,
      healthy: status === "ACTIVE",
      successRate24h: 100,
      averageLatencyMs: 0,
      failureCount24h: 0,
      lastTestedAt,
    };
  }

  const successCount = deliveries.filter((d) => d.status === "DELIVERED").length;
  const failureCount = deliveries.filter((d) => d.status === "FAILED" || d.status === "DEAD_LETTER").length;
  const total = successCount + failureCount;

  const successRate24h = total > 0 ? Math.round((successCount / total) * 100) : 100;
  const totalLatency = deliveries.reduce((sum, d) => sum + (d.latencyMs || 0), 0);
  const averageLatencyMs = deliveries.length > 0 ? Math.round(totalLatency / deliveries.length) : 0;

  const healthy = status === "ACTIVE" && successRate24h >= 80;

  return {
    integrationId,
    status: healthy ? "ACTIVE" : failureCount > 5 ? "ERROR" : status,
    healthy,
    successRate24h,
    averageLatencyMs,
    failureCount24h: failureCount,
    lastTestedAt,
    lastDeliveryAt: deliveries[0]?.completedAt || deliveries[0]?.createdAt,
  };
}
