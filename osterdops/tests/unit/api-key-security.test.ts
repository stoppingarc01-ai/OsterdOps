/**
 * OsterdOps — Phase 15: API Key Cryptographic Security Unit Tests
 */

import {
  generateApiKeySecret,
  hashApiKey,
  isValidApiKeyFormat,
  timingSafeHashMatch,
} from "@/lib/auth/api-key";

export function testApiKeySecurityHardening() {
  // 1. Generation & Entropy
  const { secret, keyPrefix, keyHash } = generateApiKeySecret("production");
  if (!secret.startsWith("ost_live_") || secret.length < 40) {
    throw new Error("Generated secret format or entropy insufficient.");
  }
  if (!keyPrefix.includes("••••••••••••")) {
    throw new Error("Masked keyPrefix format invalid.");
  }
  if (!keyHash || keyHash.length !== 64) {
    throw new Error("SHA-256 hash length mismatch.");
  }

  // 2. Hash consistency
  const recomputedHash = hashApiKey(secret);
  if (recomputedHash !== keyHash) {
    throw new Error("Recomputed API key hash does not match.");
  }

  // 3. Timing-safe comparison
  if (!timingSafeHashMatch(keyHash, recomputedHash)) {
    throw new Error("timingSafeHashMatch rejected identical hashes.");
  }
  const forgedHash = "0".repeat(64);
  if (timingSafeHashMatch(keyHash, forgedHash)) {
    throw new Error("timingSafeHashMatch accepted mismatched hash.");
  }

  // 4. Format validation
  if (!isValidApiKeyFormat(secret)) {
    throw new Error("Valid API key failed format validation.");
  }
  if (isValidApiKeyFormat("not_a_valid_key_123")) {
    throw new Error("Invalid API key passed format validation.");
  }
}

export function runApiKeySecurityTests() {
  testApiKeySecurityHardening();
}
