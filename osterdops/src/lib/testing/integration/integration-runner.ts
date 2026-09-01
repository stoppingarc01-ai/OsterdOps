/**
 * OsterdOps — Cross-Service Integration Runner (Phase 21)
 * Executes all 8 architectural dependency link checks and generates an IntegrationReport.
 */

import type { IntegrationReport, DependencyCheckResult } from "../types";
import {
  checkGatewayToUsage,
  checkUsageToCost,
  checkCostToAnalytics,
  checkCostToBilling,
  checkBillingToInvoices,
  checkBudgetsToAlerts,
  checkAlertsToNotifications,
  checkAuditToIntegrityChain,
} from "./dependency-checks";

export class IntegrationRunner {
  /**
   * Executes all dependency link verification checks.
   */
  static async runAllDependencyChecks(): Promise<IntegrationReport> {
    const startTime = Date.now();
    const results: DependencyCheckResult[] = [];

    // Run all 8 dependency link verifications
    results.push(checkGatewayToUsage());
    results.push(checkUsageToCost());
    results.push(checkCostToAnalytics());
    results.push(checkCostToBilling());
    results.push(checkBillingToInvoices());
    results.push(checkBudgetsToAlerts());
    results.push(checkAlertsToNotifications());
    results.push(checkAuditToIntegrityChain());

    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;
    const durationMs = Date.now() - startTime;

    const recommendations: string[] = [];
    if (failed > 0) {
      recommendations.push(
        `Investigate ${failed} broken integration link(s) to restore end-to-end pipeline integrity.`
      );
    } else {
      recommendations.push(
        "All cross-service dependency links validated with 100% architectural contract compliance."
      );
    }

    return {
      timestamp: new Date().toISOString(),
      totalChecks: results.length,
      passed,
      failed,
      durationMs,
      results,
      recommendations,
    };
  }
}
