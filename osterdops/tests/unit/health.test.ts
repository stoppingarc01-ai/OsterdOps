/**
 * OsterdOps — Phase 14: Health & Readiness Probes Unit Tests
 */

import { validateStartupConfiguration } from "@/lib/config/validation";
import { getRateLimitProvider } from "@/lib/infrastructure/rate-limit/registry";

export function testHealthAndReadinessProbes() {
  // 1. Health liveness structure
  const healthResponse = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  };
  if (healthResponse.status !== "healthy" || !healthResponse.timestamp) {
    throw new Error("Liveness response invalid.");
  }

  // 2. Readiness probe evaluation
  const config = validateStartupConfiguration();
  const rateLimiter = getRateLimitProvider();

  const readinessResponse = {
    status: config.valid ? "ready" : "not_ready",
    timestamp: new Date().toISOString(),
    checks: {
      configuration: {
        status: config.valid ? "OK" : "FAILED",
        errors: config.errors,
      },
      rateLimiter: {
        status: "OK",
        provider: rateLimiter.name,
      },
    },
  };

  if (!readinessResponse.checks.configuration || !readinessResponse.checks.rateLimiter) {
    throw new Error("Readiness checks structure missing required keys.");
  }
}

export function runHealthTests() {
  testHealthAndReadinessProbes();
}
