/**
 * E2E Tests — Billing, Overage & Invoice Lifecycle
 */

import { runBillingScenario } from "@/lib/testing/scenarios/billing-scenario";
import { getBillingPlan } from "@/lib/billing/plans";
import { calculateInvoiceTotal, calculateUsageOverage } from "@/lib/billing/calculator";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export async function runBillingE2ETests() {
  // 1. Run Billing Scenario
  const scenarioResult = await runBillingScenario();
  assert(scenarioResult.passed, `Billing scenario failed: ${scenarioResult.errors.join(", ")}`);

  // 2. Validate multi-plan overage calculations
  const plans = ["free", "pro", "business", "enterprise"] as const;
  for (const planId of plans) {
    const plan = getBillingPlan(planId);
    const overage = calculateUsageOverage(plan, plan.includedTokens + 1_000_000, 50.0);
    if (plan.overageEnabled) {
      assert(overage.overageTokens === 1_000_000, `Overage token subtraction failed for ${planId}.`);
      assert(overage.overageSpendUsd > 0, `Overage spend must be positive for ${planId}.`);
    } else {
      assert(overage.overageTokens === 0 && overage.overageSpendUsd === 0, `Disabled overage plan (${planId}) must return 0.`);
    }
  }

  // 3. Validate Invoice Integer Math
  const inv = calculateInvoiceTotal(49.0, 15.25, 10.0);
  assert(inv.subtotalUsd === 64.25, "Subtotal must equal 64.25.");
  assert(inv.creditsUsd === 10.0, "Credits must equal 10.0.");
  assert(inv.totalUsd === 54.25, "Total must equal 54.25.");
}
