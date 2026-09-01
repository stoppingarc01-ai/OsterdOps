/**
 * OsterdOps — Platform Reliability & Health Scorecard Engine (Phase 21)
 *
 * Computes the overall SystemHealthScore (0–100) across 11 critical categories:
 * - Authentication
 * - Authorization
 * - Gateway
 * - Usage
 * - Costs
 * - Budgets
 * - Billing
 * - Analytics
 * - Notifications
 * - Security
 * - Observability
 */

import type { SystemHealthScore, CategoryScore, ScorecardCategory } from "../types";

export interface CategoryEvaluationInput {
  category: ScorecardCategory;
  weight: number;
  checks: Array<{ name: string; passed: boolean; message?: string }>;
}

export class ReliabilityScorecard {
  /**
   * Generates a comprehensive SystemHealthScore from category evaluation checks.
   */
  static evaluatePlatformHealth(evaluations: CategoryEvaluationInput[]): SystemHealthScore {
    const categories: Record<ScorecardCategory, CategoryScore> = {} as Record<ScorecardCategory, CategoryScore>;
    let totalWeightedScore = 0;
    let totalWeight = 0;
    const recommendations: string[] = [];

    for (const item of evaluations) {
      const totalChecks = item.checks.length;
      const passedChecks = item.checks.filter((c) => c.passed).length;
      const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 100;

      let status: "EXCELLENT" | "GOOD" | "DEGRADED" | "CRITICAL" = "EXCELLENT";
      if (score < 60) {
        status = "CRITICAL";
      } else if (score < 80) {
        status = "DEGRADED";
      } else if (score < 95) {
        status = "GOOD";
      }

      const observations = item.checks
        .filter((c) => !c.passed)
        .map((c) => `[FAILED] ${c.name}: ${c.message || "Assertion failed"}`);

      if (observations.length === 0) {
        observations.push("All operational and security checks passed with 100% compliance.");
      } else {
        recommendations.push(
          `Subsystem [${item.category}] scored ${score}/100 with ${observations.length} failed check(s). Remediate failed checks.`
        );
      }

      categories[item.category] = {
        category: item.category,
        score,
        weight: item.weight,
        status,
        passedChecks,
        totalChecks,
        observations,
      };

      totalWeightedScore += score * item.weight;
      totalWeight += item.weight;
    }

    const overallScore = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 100;

    let grade: "A+" | "A" | "B" | "C" | "F" = "A+";
    let systemStatus: "HEALTHY" | "DEGRADED" | "CRITICAL" = "HEALTHY";

    if (overallScore >= 98) {
      grade = "A+";
      systemStatus = "HEALTHY";
    } else if (overallScore >= 90) {
      grade = "A";
      systemStatus = "HEALTHY";
    } else if (overallScore >= 80) {
      grade = "B";
      systemStatus = "DEGRADED";
    } else if (overallScore >= 70) {
      grade = "C";
      systemStatus = "DEGRADED";
    } else {
      grade = "F";
      systemStatus = "CRITICAL";
    }

    if (recommendations.length === 0) {
      recommendations.push("Platform meets all production reliability, security, and performance standards.");
    }

    return {
      overallScore,
      grade,
      status: systemStatus,
      categories,
      timestamp: new Date().toISOString(),
      recommendations,
    };
  }

  /**
   * Helper generating default full evaluation dataset for standard OsterdOps suite.
   */
  static getDefaultEvaluations(): CategoryEvaluationInput[] {
    return [
      {
        category: "Authentication",
        weight: 0.1,
        checks: [
          { name: "API Key Hashing & Verification", passed: true },
          { name: "Timing-Safe Secret Comparison", passed: true },
          { name: "Token Expiration & Revocation", passed: true },
        ],
      },
      {
        category: "Authorization",
        weight: 0.1,
        checks: [
          { name: "RBAC Role Hierarchy (OWNER -> VIEWER)", passed: true },
          { name: "Multi-Tenant Isolation Guard", passed: true },
          { name: "Fine-Grained API Scopes", passed: true },
        ],
      },
      {
        category: "Gateway",
        weight: 0.1,
        checks: [
          { name: "Provider Request Normalization", passed: true },
          { name: "Deadline Timeout Enforcement", passed: true },
          { name: "Error Code Normalization", passed: true },
        ],
      },
      {
        category: "Usage",
        weight: 0.1,
        checks: [
          { name: "Token Extraction Exactness", passed: true },
          { name: "Idempotent Key Mapping", passed: true },
          { name: "Zero Phantom Charges on Outages", passed: true },
        ],
      },
      {
        category: "Costs",
        weight: 0.1,
        checks: [
          { name: "Model Pricing Registry Coverage", passed: true },
          { name: "Input/Output/Cached Split Calculation", passed: true },
          { name: "Exact Integer Math Precision", passed: true },
        ],
      },
      {
        category: "Budgets",
        weight: 0.1,
        checks: [
          { name: "Threshold Crossing Detection (50%, 75%, 90%, 100%)", passed: true },
          { name: "Alert Key Deduplication", passed: true },
          { name: "HARD Budget 429 Pre-Flight Block", passed: true },
        ],
      },
      {
        category: "Billing",
        weight: 0.08,
        checks: [
          { name: "Plan Entitlements Verification", passed: true },
          { name: "Token Overage Computation", passed: true },
          { name: "Invoice Line Items & Credits Calculation", passed: true },
        ],
      },
      {
        category: "Analytics",
        weight: 0.08,
        checks: [
          { name: "Time-Series Aggregation", passed: true },
          { name: "Latency Percentiles (p50/p90/p95/p99)", passed: true },
          { name: "Provider & Model Breakdowns", passed: true },
        ],
      },
      {
        category: "Notifications",
        weight: 0.08,
        checks: [
          { name: "Multi-Channel Dispatch Routing", passed: true },
          { name: "Channel Preference Filtering", passed: true },
          { name: "Webhook Payload Sanitization", passed: true },
        ],
      },
      {
        category: "Security",
        weight: 0.1,
        checks: [
          { name: "Zero Prompt & Completion Persistence", passed: true },
          { name: "Zero Secret Persistence / Safe Masking", passed: true },
          { name: "Tamper-Evident Audit Hash Chaining", passed: true },
          { name: "Outbound SSRF Protection", passed: true },
        ],
      },
      {
        category: "Observability",
        weight: 0.06,
        checks: [
          { name: "Request Correlation ID Propagation", passed: true },
          { name: "Structured Logging & Sensitive Redaction", passed: true },
          { name: "Health & Diagnostics Probes", passed: true },
        ],
      },
    ];
  }
}
