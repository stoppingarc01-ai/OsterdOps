/**
 * OsterdOps — Cryptographic API Key Security Tests
 */

import {
  generateApiKeySecret,
  hashApiKey,
  isValidApiKeyFormat,
  timingSafeHashMatch,
} from "@/lib/auth/api-key";

export function testApiKeySecurity() {
  // 1. Generation & Format
  const liveKey = generateApiKeySecret("production");
  if (!liveKey.secret.startsWith("osk_live_")) {
    throw new Error("Production API key must start with 'osk_live_'");
  }
  if (!isValidApiKeyFormat(liveKey.secret)) {
    throw new Error("Generated production API key failed format validation");
  }

  const testKey = generateApiKeySecret("development");
  if (!testKey.secret.startsWith("osk_test_")) {
    throw new Error("Development API key must start with 'osk_test_'");
  }
  if (!isValidApiKeyFormat(testKey.secret)) {
    throw new Error("Generated test API key failed format validation");
  }

  // 2. Suffix Masking
  const liveSuffix = liveKey.secret.slice(-4);
  if (!liveKey.keyPrefix.endsWith(liveSuffix)) {
    throw new Error("Key prefix mask must preserve the last 4 characters");
  }
  if (liveKey.keyPrefix.includes(liveKey.secret.slice(9, 20))) {
    throw new Error("Key prefix must never contain the middle plaintext entropy");
  }

  // 3. One-Way SHA-256 Hashing
  const hash1 = hashApiKey(liveKey.secret);
  const hash2 = hashApiKey(liveKey.secret);
  if (hash1 !== hash2) {
    throw new Error("SHA-256 hashing must be deterministic");
  }
  if (hash1 !== liveKey.keyHash) {
    throw new Error("Generated keyHash must match hashApiKey result");
  }

  // 4. Timing-safe match
  if (!timingSafeHashMatch(liveKey.keyHash, hash1)) {
    throw new Error("timingSafeHashMatch should return true for identical hashes");
  }

  const wrongSecret = generateApiKeySecret("production").secret;
  const wrongHash = hashApiKey(wrongSecret);
  if (timingSafeHashMatch(liveKey.keyHash, wrongHash)) {
    throw new Error("timingSafeHashMatch must return false for different hashes");
  }

  // 5. Invalid format checks
  if (isValidApiKeyFormat("invalid_prefix_12345")) {
    throw new Error("Should reject key with invalid prefix");
  }
  if (isValidApiKeyFormat("osk_live_tooshort")) {
    throw new Error("Should reject key that is too short");
  }
  if (isValidApiKeyFormat("")) {
    throw new Error("Should reject empty string");
  }

  return true;
}
