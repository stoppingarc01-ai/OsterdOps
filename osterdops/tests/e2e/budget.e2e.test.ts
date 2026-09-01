/**
 * E2E Tests — Budget Thresholds, Alert Deduplication & Hard Enforcement
 */

import { runBudgetScenario } from "@/lib/testing/scenarios/budget-scenario";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export async function runBudgetE2ETests() {
  const result = await runBudgetScenario();
  assert(result.passed, `Budget scenario failed: ${result.errors.join(", ")}`);
  assert(result.assertions.length >= 5, "Budget scenario must execute at least 5 assertions.");
}
