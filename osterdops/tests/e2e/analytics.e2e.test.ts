/**
 * E2E Tests — High-Volume Analytics & Percentile Validation
 */

import { runAnalyticsScenario } from "@/lib/testing/scenarios/analytics-scenario";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export async function runAnalyticsE2ETests() {
  const result = await runAnalyticsScenario();
  assert(result.passed, `Analytics scenario failed: ${result.errors.join(", ")}`);
  assert(result.assertions.length >= 7, "Analytics scenario must execute all breakdown assertions.");
}
