/**
 * OsterdOps — Readiness Health Probe (Phase 14)
 * GET /api/ready
 * Verifies that required runtime dependencies & configurations are ready to serve traffic.
 */

import { NextResponse } from "next/server";
import { validateStartupConfiguration } from "@/lib/config/validation";
import { getRateLimitProvider } from "@/lib/infrastructure/rate-limit/registry";
import { getCircuitBreakerSummary } from "@/lib/gateway/circuit-breaker";
import { getJobQueue } from "@/lib/jobs/registry";

export async function GET() {
  const config = validateStartupConfiguration();
  const rateLimiter = getRateLimitProvider();
  const cbSummary = getCircuitBreakerSummary();
  const queueStats = getJobQueue().getQueueStats();

  const isDegraded = cbSummary.degraded || queueStats.deadLetters > 0 || config.warnings.length > 0;
  const isReady = config.valid;
  const readinessState = !isReady ? "UNAVAILABLE" : isDegraded ? "DEGRADED" : "READY";
  const statusCode = isReady ? 200 : 503;

  return NextResponse.json(
    {
      status: isReady ? (isDegraded ? "degraded" : "ready") : "not_ready",
      readinessState,
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
      checks: {
        configuration: {
          status: config.valid ? "OK" : "FAILED",
          errors: config.errors,
        },
        rateLimiter: {
          status: "OK",
          provider: rateLimiter.name,
        },
        circuitBreakers: {
          status: cbSummary.degraded ? "DEGRADED" : "OK",
          openCount: cbSummary.open + cbSummary.halfOpen,
        },
        queue: {
          status: queueStats.deadLetters > 0 ? "DEGRADED" : "OK",
          deadLetters: queueStats.deadLetters,
        },
      },
    },
    {
      status: statusCode,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
