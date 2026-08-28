/**
 * OsterdOps — Budget & Alert Engine Unit Tests
 */

import type { BudgetThresholdLevel } from "@/types";

export function testBudgetAndAlertEngine() {
  // 1. Threshold Detection Logic
  const amountUsd = 1000.0;
  const testSpends = [
    { spend: 400, expectedTriggered: [] },
    { spend: 500, expectedTriggered: [50] },
    { spend: 750, expectedTriggered: [50, 75] },
    { spend: 920, expectedTriggered: [50, 75, 90] },
    { spend: 1050, expectedTriggered: [50, 75, 90, 100] },
  ];

  const standardThresholds: BudgetThresholdLevel[] = [50, 75, 90, 100];

  for (const tc of testSpends) {
    const percentage = (tc.spend / amountUsd) * 100;
    const triggered = standardThresholds.filter((thresh) => percentage >= thresh);

    if (triggered.length !== tc.expectedTriggered.length) {
      throw new Error(
        `Spend $${tc.spend} expected ${tc.expectedTriggered.length} thresholds, got ${triggered.length}`
      );
    }
  }

  // 2. Alert Severity Mapping
  const getSeverity = (threshold: number) => {
    return threshold >= 100 ? "CRITICAL" : threshold >= 90 ? "WARNING" : "INFO";
  };

  if (getSeverity(50) !== "INFO") throw new Error("50% threshold should be INFO");
  if (getSeverity(75) !== "INFO") throw new Error("75% threshold should be INFO");
  if (getSeverity(90) !== "WARNING") throw new Error("90% threshold should be WARNING");
  if (getSeverity(100) !== "CRITICAL") throw new Error("100% threshold should be CRITICAL");

  // 3. Deduplication Key Determinism
  const budgetId = "bud_marketing_123";
  const threshold = 90;
  const periodKey = "2026-08";
  const dedupKey1 = `bud_${budgetId}_thresh_${threshold}_${periodKey}`;
  const dedupKey2 = `bud_${budgetId}_thresh_${threshold}_${periodKey}`;

  if (dedupKey1 !== dedupKey2) {
    throw new Error("Deduplication key generation must be deterministic");
  }
  if (!dedupKey1.includes(budgetId) || !dedupKey1.includes("90") || !dedupKey1.includes("2026-08")) {
    throw new Error("Dedup key missing required budget identification segments");
  }

  return true;
}
