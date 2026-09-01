/**
 * Unit Tests — API Key Management, Hashing & Secret Non-Disclosure
 */

import { generateApiKeySecret } from "@/lib/auth/api-key";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export function runApiKeysPlatformTests() {
  // 1. Production API key prefix & secret format
  const prodKey = generateApiKeySecret("production");
  assert(prodKey.secret.startsWith("ost_live_") || prodKey.secret.startsWith("osk_live_"), "Production secret must start with ost_live_ or osk_live_.");
  assert(prodKey.keyPrefix.includes("_live_••••"), "Key prefix must mask secret characters.");
  assert(typeof prodKey.keyHash === "string" && prodKey.keyHash.length === 64, "Key hash must be 64-char SHA-256 string.");

  // 2. Development/staging key format
  const devKey = generateApiKeySecret("development");
  assert(devKey.secret.startsWith("ost_test_") || devKey.secret.startsWith("osk_test_"), "Development secret must start with ost_test_ or osk_test_.");
  assert(devKey.keyPrefix.includes("_test_••••"), "Dev key prefix must mask test characters.");

  // 3. Hash uniqueness and entropy
  const key1 = generateApiKeySecret("production");
  const key2 = generateApiKeySecret("production");
  assert(key1.secret !== key2.secret, "Secrets must be uniquely generated.");
  assert(key1.keyHash !== key2.keyHash, "Hashes must be unique.");
}
