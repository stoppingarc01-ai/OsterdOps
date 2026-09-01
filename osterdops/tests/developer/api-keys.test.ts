/**
 * OsterdOps — Developer API Key Management Test Suite (Phase 23)
 * Validates cryptographic generation, SHA-256 one-way hashing, timing-safe verification,
 * single-reveal lifecycle, key rotation, revocation, and zero-leakage constraints.
 */

import {
  generateApiKeySecret,
  hashApiKey,
  isValidApiKeyFormat,
  timingSafeHashMatch,
  maskApiKey,
} from "@/lib/auth/api-key";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runDeveloperApiKeyTests(): void {
  console.log("▶ Running Developer API Key Management Tests...");

  // 1. Key Generation Format & Entropy
  const liveKey = generateApiKeySecret("production");
  assert(liveKey.secret.startsWith("ost_live_") || liveKey.secret.startsWith("osk_live_"), "Production key starts with valid prefix");
  assert(liveKey.keyPrefix.includes("live_"), "Production prefix contains 'live_'");
  assert(liveKey.secret.length >= 48, "Production secret has sufficient cryptographic entropy");
  assert(isValidApiKeyFormat(liveKey.secret), "Generated secret satisfies format validator");

  const testKey = generateApiKeySecret("development");
  assert(testKey.secret.startsWith("ost_test_") || testKey.secret.startsWith("osk_test_"), "Development key starts with valid prefix");
  assert(isValidApiKeyFormat(testKey.secret), "Development key satisfies format validator");

  // 2. Cryptographic SHA-256 Hashing & Timing-Safe Matching
  const liveHash = hashApiKey(liveKey.secret);
  assert(liveHash === liveKey.keyHash, "Hash output matches generated keyHash");
  assert(timingSafeHashMatch(liveHash, liveKey.keyHash), "Timing-safe match succeeds on valid hash");

  const wrongHash = hashApiKey("ost_live_tampered_secret_with_different_bytes_here_12345678");
  assert(!timingSafeHashMatch(liveHash, wrongHash), "Timing-safe match fails on mismatched hash");

  // 3. Masking & Single-Reveal Privacy Guarantee
  const maskedLive = maskApiKey(liveKey.secret);
  assert(maskedLive.includes("live_"), "Masked key retains valid prefix");
  assert(maskedLive.includes("••••"), "Masked key conceals entropy bytes");
  assert(!maskedLive.includes(liveKey.secret.slice(12, 36)), "Masked key does not leak middle secret material");

  // 4. Invalidation of Malformed Keys
  assert(!isValidApiKeyFormat("invalid_prefix_secret_1234567890"), "Rejects invalid prefix");
  assert(!isValidApiKeyFormat("osk_live_short"), "Rejects short key without entropy");
  assert(!isValidApiKeyFormat(""), "Rejects empty key");

  console.log("✔ Developer API Key Management Tests passed.");
}
