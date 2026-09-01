/**
 * Integration Tests — Full Cross-Service Integration Verification Runner
 */

import { IntegrationRunner } from "@/lib/testing/integration/integration-runner";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export async function runIntegrationEngineTests() {
  const report = await IntegrationRunner.runAllDependencyChecks();
  assert(report.passed === 8, `All 8 dependency checks must pass. (Passed: ${report.passed}/8)`);
  assert(report.failed === 0, `Expected 0 failures, got ${report.failed}.`);
  assert(report.results.length === 8, "Expected 8 dependency check results.");
}
