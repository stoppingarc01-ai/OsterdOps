/**
 * OsterdOps — Phase 16: Frontend API Key One-Time Presentation Unit Tests
 */

import { generateApiKeySecret } from "@/lib/auth/api-key";

export function testFrontendKeyPresentation() {
  const { secret, keyPrefix, keyHash } = generateApiKeySecret("production");

  // 1. Prefix format contains mask and last 4 characters
  if (!keyPrefix.startsWith("ost_live_••••••••••••")) {
    throw new Error("Key prefix does not match masked format.");
  }
  const suffix = secret.slice(-4);
  if (!keyPrefix.endsWith(suffix)) {
    throw new Error("Key prefix does not expose the correct 4-char suffix.");
  }

  // 2. Secret entropy length
  if (secret.length < 40) {
    throw new Error("Generated secret length is insufficient.");
  }

  // 3. Mask does not leak the full key
  if (keyPrefix.includes(secret.slice(10, 20))) {
    throw new Error("Masked key prefix leaks middle secret bytes.");
  }
}

export function runFrontendKeyPresentationTests() {
  testFrontendKeyPresentation();
}
