/**
 * OsterdOps — Testing Framework Types & Interfaces (Phase 21)
 * Definitions for E2E validation, dependency integration, chaos simulation,
 * load testing, reporting, and system reliability scorecards.
 */

import type { AIProvider } from "@/types";

/* ============================================================
   1. End-to-End Testing & Lifecycle
   ============================================================ */

export type LifecycleStageName =
  | "CLIENT_REQUEST"
  | "AUTHENTICATION"
  | "RBAC_AUTHORIZATION"
  | "RATE_LIMITING"
  | "BUDGET_ENFORCEMENT"
  | "PROVIDER_ROUTING"
  | "USAGE_RECORDING"
  | "COST_CALCULATION"
  | "ANALYTICS_AGGREGATION"
  | "BILLING_CALCULATION"
  | "INVOICE_GENERATION"
  | "NOTIFICATIONS_DISPATCH"
  | "AUDIT_LOGGING"
  | "RESPONSE_RETURNED";

export interface LifecycleStageResult {
  stage: LifecycleStageName;
  passed: boolean;
  durationMs: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface AssertionResult {
  name: string;
  passed: boolean;
  message: string;
  expected?: unknown;
  actual?: unknown;
  durationMs?: number;
}

export interface ScenarioResult {
  id: string;
  name: string;
  passed: boolean;
  durationMs: number;
  stages: LifecycleStageResult[];
  assertions: AssertionResult[];
  errors: string[];
  warnings: string[];
  metadata?: Record<string, unknown>;
}

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  category: "E2E" | "INTEGRATION" | "CHAOS" | "LOAD" | "SECURITY";
  execute: () => Promise<ScenarioResult>;
}

/* ============================================================
   2. Cross-Service Integration Verification
   ============================================================ */

export type DependencyLink =
  | "GATEWAY_TO_USAGE"
  | "USAGE_TO_COST"
  | "COST_TO_ANALYTICS"
  | "COST_TO_BILLING"
  | "BILLING_TO_INVOICES"
  | "BUDGETS_TO_ALERTS"
  | "ALERTS_TO_NOTIFICATIONS"
  | "AUDIT_TO_INTEGRITY_CHAIN";

export interface DependencyCheckResult {
  link: DependencyLink;
  name: string;
  passed: boolean;
  durationMs: number;
  assertions: AssertionResult[];
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface IntegrationReport {
  timestamp: string;
  totalChecks: number;
  passed: number;
  failed: number;
  durationMs: number;
  results: DependencyCheckResult[];
  recommendations: string[];
}

/* ============================================================
   3. Chaos Engineering & Failure Injection
   ============================================================ */

export type ChaosFaultType =
  | "PROVIDER_TIMEOUT"
  | "PROVIDER_500"
  | "PROVIDER_429"
  | "DATABASE_UNAVAILABLE"
  | "FIRESTORE_TIMEOUT"
  | "REDIS_FAILURE"
  | "QUEUE_FAILURE"
  | "ANALYTICS_FAILURE"
  | "BILLING_FAILURE"
  | "NOTIFICATION_FAILURE";

export interface ChaosFaultConfig {
  type: ChaosFaultType;
  targetService?: string;
  probability?: number; // 0.0 to 1.0 (default 1.0)
  latencyDelayMs?: number;
  customError?: string;
  active: boolean;
}

export interface ChaosSimulationResult {
  faultType: ChaosFaultType;
  passed: boolean;
  gracefulHandling: boolean;
  auditTrailPersisted: boolean;
  metricsIncremented: boolean;
  dataCorruptionDetected: boolean;
  durationMs: number;
  observations: string[];
  assertions: AssertionResult[];
}

export interface ChaosReport {
  timestamp: string;
  simulationsRun: number;
  passed: number;
  failed: number;
  durationMs: number;
  results: ChaosSimulationResult[];
  resilienceRating: "HIGH" | "MODERATE" | "LOW";
  recommendations: string[];
}

/* ============================================================
   4. Synthetic Load Testing
   ============================================================ */

export interface LoadTestProfile {
  name: string;
  rps: number;
  concurrency: number;
  durationMs: number;
  providers: AIProvider[];
  orgCount: number;
  projectCount: number;
  keyCount: number;
}

export interface LatencyDistribution {
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  avg: number;
  min: number;
  max: number;
}

export interface LoadTestMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  actualRps: number;
  throughputRequestsPerSec: number;
  errorRatePercent: number;
  latencies: LatencyDistribution;
  queueBacklog: number;
  memoryGrowthMb: number;
  retryCount: number;
  byStatusCode: Record<number, number>;
  byProvider: Record<string, { requests: number; errors: number; avgLatencyMs: number }>;
}

export interface LoadTestReport {
  timestamp: string;
  profile: LoadTestProfile;
  metrics: LoadTestMetrics;
  passed: boolean;
  bottlenecks: string[];
  recommendations: string[];
}

/* ============================================================
   5. Reliability Scorecard & Health
   ============================================================ */

export type ScorecardCategory =
  | "Authentication"
  | "Authorization"
  | "Gateway"
  | "Usage"
  | "Costs"
  | "Budgets"
  | "Billing"
  | "Analytics"
  | "Notifications"
  | "Security"
  | "Observability";

export interface CategoryScore {
  category: ScorecardCategory;
  score: number; // 0 to 100
  weight: number; // 0.0 to 1.0
  status: "EXCELLENT" | "GOOD" | "DEGRADED" | "CRITICAL";
  passedChecks: number;
  totalChecks: number;
  observations: string[];
}

export interface SystemHealthScore {
  overallScore: number; // 0 to 100
  grade: "A+" | "A" | "B" | "C" | "F";
  status: "HEALTHY" | "DEGRADED" | "CRITICAL";
  categories: Record<ScorecardCategory, CategoryScore>;
  timestamp: string;
  recommendations: string[];
}

/* ============================================================
   6. Comprehensive Testing Report
   ============================================================ */

export interface TestingReport {
  timestamp: string;
  totalScenarios: number;
  passed: number;
  failed: number;
  warnings: number;
  durationMs: number;
  scenarios: ScenarioResult[];
  scorecard: SystemHealthScore;
  recommendations: string[];
}
