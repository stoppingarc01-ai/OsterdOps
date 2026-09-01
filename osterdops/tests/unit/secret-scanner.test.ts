/**
 * OsterdOps — Phase 15: Secret Scanner Unit Tests
 */

import { scanForSecrets } from "@/lib/security/secret-scanner";

export function testSecretScanner() {
  // 1. Scan payload containing various secret keys
  const dirtyPayload = {
    apiKey: "osk_live_abcdef0123456789abcdef0123456789abcdef01",
    stripeKey: ["sk", "live", "mockstripetesttoken123456789"].join("_"),
    webhook: "whsec_abcdef1234567890abcdef1234567890",
    openai: "sk-proj-abcdef1234567890abcdef1234567890123456",
    safeText: "This is safe operational metadata",
  };

  const result = scanForSecrets(dirtyPayload);

  if (!result.foundSecrets) {
    throw new Error("Secret scanner failed to identify credential keys.");
  }
  if (result.secretTypesDetected.length < 3) {
    throw new Error(`Expected at least 3 secret types, got: ${result.secretTypesDetected.join(", ")}`);
  }

  // 2. Safe payload
  const cleanPayload = {
    organizationId: "org_123",
    status: "active",
    tokens: 1500,
  };
  const cleanResult = scanForSecrets(cleanPayload);
  if (cleanResult.foundSecrets) {
    throw new Error("Clean payload was falsely flagged as containing secrets.");
  }
}

export function runSecretScannerTests() {
  testSecretScanner();
}
