/**
 * OsterdOps — Phase 15: Security Posture Evaluation Unit Tests
 */

import { evaluateSecurityPosture } from "@/lib/services/security-posture.service";

export async function testSecurityPostureEvaluation() {
  const report = await evaluateSecurityPosture("org_posture_test");

  if (!report.overallStatus || !report.evaluatedAt) {
    throw new Error("Security posture report structure invalid.");
  }
  if (report.checks.length < 10) {
    throw new Error(`Expected at least 10 security checks, found ${report.checks.length}`);
  }

  // Ensure zero secrets in checks
  const serialized = JSON.stringify(report);
  const forbidden = ["sk-proj", "sk_live", "whsec_"];
  for (const f of forbidden) {
    if (serialized.includes(f)) {
      throw new Error(`Security posture report leaked secret pattern '${f}'.`);
    }
  }
}

export async function runSecurityPostureTests() {
  await testSecurityPostureEvaluation();
}
