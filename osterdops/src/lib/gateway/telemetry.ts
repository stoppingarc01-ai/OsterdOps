/**
 * OsterdOps — AI Gateway Lightweight Telemetry & Structured Logging
 * Logs safe execution metadata without persisting sensitive prompts, user content, or credentials.
 */

import type { GatewayTokenUsage } from "./types";
import type { AIProvider } from "@/types";
import { incrementMetric, recordLatencyMetric, gatewaySloTracker } from "@/lib/observability/metrics";

export interface GatewayLogEntry {
  requestId: string;
  organizationId: string;
  projectId: string;
  keyId: string;
  provider: AIProvider;
  model: string;
  status: "success" | "error" | "rate_limited" | "timeout";
  httpStatus: number;
  durationMs: number;
  usage?: GatewayTokenUsage | null;
  errorCode?: string;
  timestamp: string;
}

/**
 * Emits a structured telemetry log entry and operational metrics for the gateway execution.
 * Guaranteed zero prompt / secret persistence.
 */
export function recordGatewayTelemetry(entry: GatewayLogEntry): void {
  try {
    // Update rolling gateway SLO tracker
    gatewaySloTracker.record(entry.status === "success");

    // Operational metrics recording
    incrementMetric("gateway_requests_total", 1, {
      provider: entry.provider,
      model: entry.model,
      status: entry.status,
    });

    recordLatencyMetric("gateway_latency", entry.durationMs, {
      provider: entry.provider,
      model: entry.model,
    });

    if (entry.status !== "success") {
      incrementMetric("gateway_errors_total", 1, {
        provider: entry.provider,
        status: entry.status,
      });
    }

    if (entry.usage && entry.usage.totalTokens > 0) {
      incrementMetric("gateway_tokens_total", entry.usage.totalTokens, {
        provider: entry.provider,
        model: entry.model,
      });
    }

    // Safe structured console output
    if (entry.status === "success") {
      console.info(`[Gateway OK] ${entry.requestId} | ${entry.provider}:${entry.model} | ${entry.durationMs}ms | ${entry.usage?.totalTokens || 0} tokens`);
    } else {
      console.warn(`[Gateway ${entry.status.toUpperCase()}] ${entry.requestId} | ${entry.provider}:${entry.model} | HTTP ${entry.httpStatus} | ${entry.errorCode || "ERROR"}`);
    }
  } catch (err: unknown) {
    // Failure containment: non-critical metrics/telemetry errors must never crash the gateway
    console.error("[OsterdOps Gateway Telemetry] Non-critical telemetry emission failure:", err);
  }
}
