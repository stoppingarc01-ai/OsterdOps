/**
 * E2E Tests — Gateway End-to-End Request Lifecycle & Scenario
 */

import { validateCompleteRequestLifecycle } from "@/lib/testing/e2e/request-lifecycle";
import { runGatewayScenario } from "@/lib/testing/scenarios/gateway-scenario";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export async function runGatewayE2ETests() {
  // 1. Validate complete 14-stage request lifecycle
  const lifecycleResult = await validateCompleteRequestLifecycle({
    organizationId: "org_e2e_gw",
    projectId: "prj_e2e_gw",
    role: "DEVELOPER",
    provider: "openai",
    model: "gpt-4o-mini",
    inputTokens: 120,
    outputTokens: 60,
    cachedTokens: 20,
    monthlyBudgetUsd: 100,
    currentSpendUsd: 15,
  });

  assert(lifecycleResult.passed, `Lifecycle validation failed: ${lifecycleResult.errors.join(", ")}`);
  assert(lifecycleResult.stages.length === 14, "All 14 lifecycle stages must be executed.");

  // 2. Validate Gateway scenario execution
  const gatewayScenarioResult = await runGatewayScenario();
  assert(gatewayScenarioResult.passed, `Gateway scenario failed: ${gatewayScenarioResult.errors.join(", ")}`);
  assert(gatewayScenarioResult.assertions.every((a) => a.passed), "All gateway scenario assertions must pass.");
}
