/**
 * E2E Tests — Security Posture, RBAC & Privacy Guarantees
 */

import { runSecurityScenario } from "@/lib/testing/scenarios/security-scenario";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export async function runSecurityE2ETests() {
  const result = await runSecurityScenario();
  assert(result.passed, `Security scenario failed: ${result.errors.join(", ")}`);
  assert(result.assertions.length >= 6, "Security scenario must execute all security assertions.");
}
