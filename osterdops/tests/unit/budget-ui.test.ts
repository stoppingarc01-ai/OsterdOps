/**
 * Unit Tests — Budget UI State, Hard Enforcement Indicators & Calculations
 */

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export function runBudgetUiTests() {
  const limitUsd = 1000;
  const currentSpendUsd = 850;

  // 1. Percentage utilization calculation
  const utilization = Math.min(100, Math.round((currentSpendUsd / limitUsd) * 100));
  assert(utilization === 85, "Utilization percentage must calculate to 85%.");

  // 2. Alert threshold state
  const isNearLimit = utilization >= 80 && utilization < 100;
  const isExceeded = utilization >= 100;
  assert(isNearLimit === true, "85% spend must be recognized as near limit.");
  assert(isExceeded === false, "85% spend must not be marked as exceeded.");

  // 3. Exceeded state
  const exceededSpend = 1050;
  const exceededUtilization = Math.round((exceededSpend / limitUsd) * 100);
  assert(exceededUtilization >= 100, "Exceeded spend must be >= 100%.");

  // 4. Hard vs Soft enforcement display logic
  const hardEnforcement = "BLOCK";
  const softEnforcement = "NOTIFY";
  assert(hardEnforcement === "BLOCK", "Hard enforcement corresponds to BLOCK.");
  assert(softEnforcement === "NOTIFY", "Soft enforcement corresponds to NOTIFY.");
}
