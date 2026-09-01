/**
 * OsterdOps — System Diagnostics & Health Evaluation Service (Phase 14)
 * Provides comprehensive system operational status, provider connectivity checks,
 * and dependency health without leaking secret keys or internal paths.
 */

import { getJobQueue } from "@/lib/jobs/registry";
import { getRateLimitProvider } from "@/lib/infrastructure/rate-limit/registry";
import { validateStartupConfiguration } from "@/lib/config/validation";
import { getOperationalMetricsSnapshot, gatewaySloTracker } from "@/lib/observability/metrics";
import type { SloStatus } from "@/lib/observability/metrics";
import { getAllCacheStats } from "@/lib/cache";
import type { CacheStats } from "@/lib/cache";
import { getCircuitBreakerSummary } from "@/lib/gateway/circuit-breaker";
import type { OrganizationRole } from "@/types";

export interface ProviderDiagnosticStatus {
  provider: string;
  configured: boolean;
  status: "READY" | "UNCONFIGURED";
}

export interface SystemDiagnosticsReport {
  status: "healthy" | "degraded" | "unhealthy";
  version: string;
  environment: string;
  timestamp: string;
  checks: {
    database: { status: "OK" | "DEGRADED"; mode: string };
    queue: { status: "OK" | "DEGRADED"; pending: number; deadLetters: number };
    rateLimiter: { status: "OK"; provider: string };
    configuration: { status: "OK" | "WARNING" | "ERROR"; errorsCount: number; warningsCount: number };
    cache?: { status: "OK" | "DEGRADED"; pools: Record<string, CacheStats> };
    circuitBreakers?: { status: "OK" | "DEGRADED"; openCount: number; openProviders: string[] };
    readiness?: { status: "READY" | "DEGRADED" | "UNAVAILABLE" };
  };
  providers?: ProviderDiagnosticStatus[];
  metrics?: Record<string, number>;
  slo?: SloStatus;
  detailed?: boolean;
}

/**
 * Generates a comprehensive system diagnostic report based on caller RBAC permissions.
 */
export async function getSystemDiagnostics(
  actorRole?: OrganizationRole
): Promise<SystemDiagnosticsReport> {
  const isPrivileged = actorRole === "OWNER" || actorRole === "ADMIN";
  const config = validateStartupConfiguration();
  const queueStats = getJobQueue().getQueueStats();
  const rateLimiter = getRateLimitProvider();
  const cbSummary = getCircuitBreakerSummary();

  // Evaluate overall health
  let overallStatus: "healthy" | "degraded" | "unhealthy" = "healthy";
  const isDegraded = config.warnings.length > 0 || queueStats.deadLetters > 0 || cbSummary.degraded;

  if (!config.valid) {
    overallStatus = "unhealthy";
  } else if (isDegraded) {
    overallStatus = "degraded";
  }

  const checks = {
    database: {
      status: "OK" as const,
      mode: process.env.FIREBASE_PROJECT_ID ? "firebase_admin" : "local_simulated",
    },
    queue: {
      status: queueStats.deadLetters > 0 ? ("DEGRADED" as const) : ("OK" as const),
      pending: queueStats.pending,
      deadLetters: queueStats.deadLetters,
    },
    rateLimiter: {
      status: "OK" as const,
      provider: rateLimiter.name,
    },
    configuration: {
      status: config.valid
        ? config.warnings.length > 0
          ? ("WARNING" as const)
          : ("OK" as const)
        : ("ERROR" as const),
      errorsCount: config.errors.length,
      warningsCount: config.warnings.length,
    },
    cache: {
      status: "OK" as const,
      pools: getAllCacheStats(),
    },
    circuitBreakers: {
      status: cbSummary.degraded ? ("DEGRADED" as const) : ("OK" as const),
      openCount: cbSummary.open + cbSummary.halfOpen,
      openProviders: cbSummary.openProviders,
    },
    readiness: {
      status: (!config.valid ? "UNAVAILABLE" : isDegraded ? "DEGRADED" : "READY") as "READY" | "DEGRADED" | "UNAVAILABLE",
    },
  };

  const report: SystemDiagnosticsReport = {
    status: overallStatus,
    version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    checks,
  };

  // Privileged details for OWNER & ADMIN
  if (isPrivileged) {
    const providers: ProviderDiagnosticStatus[] = [
      {
        provider: "openai",
        configured: Boolean(process.env.OPENAI_API_KEY),
        status: process.env.OPENAI_API_KEY ? "READY" : "UNCONFIGURED",
      },
      {
        provider: "anthropic",
        configured: Boolean(process.env.ANTHROPIC_API_KEY),
        status: process.env.ANTHROPIC_API_KEY ? "READY" : "UNCONFIGURED",
      },
      {
        provider: "gemini",
        configured: Boolean(process.env.GEMINI_API_KEY),
        status: process.env.GEMINI_API_KEY ? "READY" : "UNCONFIGURED",
      },
      {
        provider: "azure",
        configured: Boolean(process.env.AZURE_OPENAI_API_KEY),
        status: process.env.AZURE_OPENAI_API_KEY ? "READY" : "UNCONFIGURED",
      },
      {
        provider: "bedrock",
        configured: Boolean(process.env.AWS_ACCESS_KEY_ID),
        status: process.env.AWS_ACCESS_KEY_ID ? "READY" : "UNCONFIGURED",
      },
      {
        provider: "stripe",
        configured: Boolean(process.env.STRIPE_SECRET_KEY),
        status: process.env.STRIPE_SECRET_KEY ? "READY" : "UNCONFIGURED",
      },
    ];

    const metricSnapshot = getOperationalMetricsSnapshot();

    report.providers = providers;
    report.metrics = metricSnapshot.counters;
    report.slo = gatewaySloTracker.evaluate("ai-gateway");
    report.detailed = true;
  }

  return report;
}
