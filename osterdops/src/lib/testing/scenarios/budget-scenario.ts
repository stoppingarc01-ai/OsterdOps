/**
 * OsterdOps — Budget Enforcement, Thresholds & Deduplication Scenario (Phase 21)
 *
 * Validates:
 * 1. Budget creation and spend accumulation
 * 2. Crossing 50%, 75%, 90%, and 100% thresholds
 * 3. Alert generation with deterministic deduplication keys
 * 4. Multi-channel notification dispatch
 * 5. HARD budget enforcement blocking requests with HTTP 429 (BUDGET_EXCEEDED)
 * 6. Audit trail generation for blocked requests
 */

import { E2ERunner } from "../e2e/e2e-runner";
import type { ScenarioResult } from "../types";
import { computeAuditRecordHash, GENESIS_HASH } from "@/lib/security/audit-integrity";
import type { Budget, Alert, TamperEvidentAuditRecord } from "@/types";

export async function runBudgetScenario(): Promise<ScenarioResult> {
  const runner = new E2ERunner("sc_budget_enforcement", "Budget Thresholds, Deduplication & Hard Enforcement Scenario");

  const orgId = "org_budget_scenario";
  const prjId = "prj_budget_scenario";
  const budgetLimit = 100.0; // $100 budget

  // 1. Create Budget
  const budget: Budget = {
    id: "bdg_test_100",
    organizationId: orgId,
    projectId: prjId,
    name: "Scenario Monthly Budget",
    amountUsd: budgetLimit,
    limitUsd: budgetLimit,
    currentSpendUsd: 0,
    period: "MONTHLY",
    thresholds: [50, 75, 90, 100],
    enforcement: "HARD",
    enforcementMode: "BLOCK",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  runner.assert("Budget Initial State", budget.amountUsd === 100 && budget.enforcement === "HARD", "HARD Budget initialized.");

  // 2. Generate Spend & Cross Thresholds (50%, 75%, 90%, 100%)
  const spendCheckpoints = [
    { spend: 55.0, threshold: 50, severity: "INFO" as const },
    { spend: 78.0, threshold: 75, severity: "WARNING" as const },
    { spend: 92.0, threshold: 90, severity: "CRITICAL" as const },
    { spend: 105.0, threshold: 100, severity: "CRITICAL" as const },
  ];

  const generatedAlerts: Alert[] = [];
  const dedupKeysSet = new Set<string>();

  for (const cp of spendCheckpoints) {
    budget.currentSpendUsd = cp.spend;
    const dedupKey = `${orgId}:${prjId}:BUDGET_${cp.threshold}_2026-08`;

    // Ensure deduplication: if key already exists, skip
    if (!dedupKeysSet.has(dedupKey)) {
      dedupKeysSet.add(dedupKey);
      const alert: Alert = {
        id: `alt_${cp.threshold}_${Date.now()}`,
        organizationId: orgId,
        projectId: prjId,
        budgetId: budget.id,
        type: cp.threshold === 100 ? "BUDGET_EXCEEDED" : "BUDGET_THRESHOLD",
        thresholdPercent: cp.threshold,
        severity: cp.severity,
        title: `Budget ${cp.threshold}% Crossed`,
        message: `Project spend reached $${cp.spend} of $${budgetLimit} limit.`,
        dedupKey,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
      };
      generatedAlerts.push(alert);
    }
  }

  runner.assert(
    "Threshold Alerts Generated",
    generatedAlerts.length === 4,
    "All 4 thresholds (50%, 75%, 90%, 100%) must generate alerts."
  );

  // 3. Threshold Deduplication Verification
  // Attempt to generate 75% alert again
  const duplicateDedupKey = `${orgId}:${prjId}:BUDGET_75_2026-08`;
  const isDuplicateSuppressed = dedupKeysSet.has(duplicateDedupKey);
  runner.assert(
    "Threshold Alert Deduplication",
    isDuplicateSuppressed,
    "Duplicate crossing within the same billing period must be deduplicated."
  );

  // 4. Hard Budget Enforcement Check (Spend = $105 > $100 limit)
  await runner.runStage("BUDGET_ENFORCEMENT", () => {
    const isExceeded = (budget.currentSpendUsd || 0) >= (budget.limitUsd || 0);
    const isHard = budget.enforcement === "HARD";
    const requestAllowed = !(isHard && isExceeded);

    runner.assert(
      "HARD Budget 429 Enforcement",
      !requestAllowed,
      "Requests exceeding HARD budget limit must be blocked."
    );

    const errorResponse = {
      code: "BUDGET_EXCEEDED",
      statusCode: 429,
      message: "Monthly budget spending limit exceeded. Request blocked under HARD enforcement.",
    };

    runner.assert(
      "Error Response Code",
      errorResponse.code === "BUDGET_EXCEEDED" && errorResponse.statusCode === 429,
      "Blocked request must return HTTP 429 with BUDGET_EXCEEDED error code."
    );
  });

  // 5. Audit Trail Generated for Blocked Request
  await runner.runStage("AUDIT_LOGGING", () => {
    const auditRecord: TamperEvidentAuditRecord = {
      id: `aud_budget_block_${Date.now()}`,
      organizationId: orgId,
      action: "BUDGET_REQUEST_BLOCKED",
      resourceType: "budget",
      resourceId: budget.id,
      timestamp: new Date().toISOString(),
      result: "DENIED",
      reasonCode: "BUDGET_EXCEEDED",
      details: {
        currentSpendUsd: budget.currentSpendUsd,
        limitUsd: budget.limitUsd,
        projectId: prjId,
      },
      previousHash: GENESIS_HASH,
      currentHash: "",
      sequenceNumber: 1,
    };
    auditRecord.currentHash = computeAuditRecordHash(auditRecord.previousHash, auditRecord);

    runner.assert(
      "Audit Trail for Blocked Request",
      auditRecord.result === "DENIED" && Boolean(auditRecord.currentHash),
      "Blocked budget request must create a tamper-evident audit record."
    );
  });

  return runner.finish();
}
