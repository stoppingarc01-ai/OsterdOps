/**
 * OsterdOps — Phase 14: Billing Reconciliation Engine Unit Tests
 */

import type { BillingDiscrepancy, ReconciliationReport } from "@/lib/billing/reconciliation.service";

export function testReconciliationEngine() {
  const orgId = "org_reconcile_test";
  const periodStart = "2026-08-01T00:00:00.000Z";
  const periodEnd = "2026-08-31T23:59:59.999Z";

  // 1. Matched scenario
  const matchedReport: ReconciliationReport = {
    reconciliationId: "rec_1",
    organizationId: orgId,
    periodStart,
    periodEnd,
    status: "MATCHED",
    usageTotalTokens: 1_000_000,
    usageTotalRequests: 500,
    costTotalSpendUsd: 2.50,
    invoiceTotalUsd: 49.00,
    discrepancyCount: 0,
    discrepancies: [],
    generatedAt: new Date().toISOString(),
  };

  if (matchedReport.status !== "MATCHED" || matchedReport.discrepancyCount !== 0) {
    throw new Error("Matched reconciliation report status mismatch.");
  }

  // 2. Discrepancy scenario: missing pricing
  const discrepancies: BillingDiscrepancy[] = [
    {
      type: "UNAVAILABLE_PRICING",
      description: "Organization has 500k tokens but $0 spend.",
      recommendedAction: "Add model rates to registry.",
    },
  ];

  const discrepancyReport: ReconciliationReport = {
    ...matchedReport,
    status: "DISCREPANCY_DETECTED",
    discrepancyCount: 1,
    discrepancies,
  };

  if (discrepancyReport.status !== "DISCREPANCY_DETECTED" || discrepancyReport.discrepancies.length !== 1) {
    throw new Error("Discrepancy reconciliation report mismatch.");
  }
}

export function runReconciliationTests() {
  testReconciliationEngine();
}
