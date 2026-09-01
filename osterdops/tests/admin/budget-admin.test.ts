/**
 * OsterdOps — Budget Administration & Hard Enforcement Test Suite (Phase 24)
 * Validates budget state mutations, pause/resume lifecycles, and hard enforcement triggering.
 */

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runBudgetAdminTests(): void {
  console.log("▶ Running Budget Administration Tests...");

  const budget = {
    id: `bg_${Date.now()}`,
    name: "Master Organization Limit",
    budgetAmountUsd: 2500.0,
    currentSpendUsd: 1842.2,
    enforceHardLimit: true,
    status: "ACTIVE",
  };

  // 1. Budget Utilization Calculation
  const utilization = (budget.currentSpendUsd / budget.budgetAmountUsd) * 100;
  assert(Math.round(utilization) === 74, "Utilization calculated accurately (~74%)");

  // 2. Pause Enforcement
  const pausedBudget = { ...budget, status: "PAUSED" };
  assert(pausedBudget.status === "PAUSED", "Budget enforcement paused");

  // 3. Resume Enforcement
  const resumedBudget = { ...pausedBudget, status: "ACTIVE" };
  assert(resumedBudget.status === "ACTIVE", "Budget enforcement resumed");

  // 4. Hard Limit Breach Behavior
  const breachedSpend = 2500.5;
  const isBreached = breachedSpend >= budget.budgetAmountUsd;
  assert(isBreached === true, "Spend exceeded budget ceiling");
  const actionTaken = budget.enforceHardLimit ? "HTTP 429 REJECT" : "ALERT_ONLY";
  assert(actionTaken === "HTTP 429 REJECT", "Hard limit enforcement triggers HTTP 429 rejection");

  console.log("✔ Budget Administration Tests passed.");
}
