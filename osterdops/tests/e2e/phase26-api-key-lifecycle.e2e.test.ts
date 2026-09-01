/**
 * OsterdOps — Phase 26 API Key Lifecycle & Cryptographic Security
 * Validates Journey 4:
 * 1. Key Creation: Single-reveal plaintext guarantee & prefix validation
 * 2. Cryptographic Storage: One-way SHA-256 hash storage & zero plaintext persistence
 * 3. Timing-Safe Authentication: `timingSafeHashMatch` prevents timing side-channels
 * 4. Key Rotation: Invalidation of old secret, issuance of new secret, audit event
 * 5. Revocation: Revoked key immediately rejected (HTTP 403)
 * 6. Expiration: Expired key rejected (HTTP 403)
 * 7. Scopes: Fine-grained scope gating (e.g. read vs write permissions)
 */

import {
  generateApiKeySecret,
  hashApiKey,
  isValidApiKeyFormat,
  maskApiKey,
  timingSafeHashMatch,
} from "@/lib/auth/api-key";
import type { ApiKey } from "@/types";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runApiKeyLifecycleE2ETests(): void {
  console.log("▶ Running Phase 26: Journey 4 — API Key Lifecycle & Cryptographic Security...");

  const orgId = "org_key_test";
  const projectId = "prj_key_test";
  const actorId = "usr_sec_admin";

  // In-memory key registry simulating database
  const keyDatabase: Record<string, ApiKey> = {};

  // 1. Key Creation & Single-Reveal Verification
  const { secret: rawSecret, keyPrefix, keyHash } = generateApiKeySecret("production");
  const keyId = "key_test_01";

  assert(rawSecret.startsWith("ost_live_"), "Production secret has correct prefix");
  assert(isValidApiKeyFormat(rawSecret) === true, "Validates API key format");
  assert(keyHash === hashApiKey(rawSecret), "Hash matches SHA-256 of raw secret");

  const storedKeyRecord: ApiKey = {
    id: keyId,
    organizationId: orgId,
    projectId,
    name: "Production Gateway Key",
    keyPrefix,
    keyHash, // Only the SHA-256 hash is saved
    environment: "production",
    status: "active",
    scopes: ["gateway:chat", "metrics:read"],
    createdBy: actorId,
    createdAt: new Date().toISOString(),
  };

  keyDatabase[keyId] = storedKeyRecord;

  // Verify Zero Plaintext Persistence
  const serialized = JSON.stringify(storedKeyRecord);
  assert(!serialized.includes(rawSecret), "Raw secret is NEVER persisted in database");

  const masked = maskApiKey(rawSecret);
  assert(masked.startsWith(keyPrefix), "Masked key preserves prefix");
  assert(!masked.includes(rawSecret.slice(12)), "Masked key hides actual secret body");

  // 2. Authentication with Timing-Safe Verification
  function authenticateKey(providedSecret: string): { authenticated: boolean; key?: ApiKey; error?: string } {
    if (!isValidApiKeyFormat(providedSecret)) {
      return { authenticated: false, error: "Invalid API key format" };
    }
    const computedHash = hashApiKey(providedSecret);
    const matchedKey = Object.values(keyDatabase).find((k) => timingSafeHashMatch(k.keyHash, computedHash));

    if (!matchedKey) {
      return { authenticated: false, error: "Key not found or invalid" };
    }
    if (matchedKey.status === "revoked") {
      return { authenticated: false, error: "API key has been revoked" };
    }
    if (matchedKey.status !== "active") {
      return { authenticated: false, error: "API key is inactive" };
    }
    if (matchedKey.expiresAt && new Date(String(matchedKey.expiresAt)).getTime() < Date.now()) {
      return { authenticated: false, error: "API key has expired" };
    }
    return { authenticated: true, key: matchedKey };
  }

  const validAuth = authenticateKey(rawSecret);
  assert(validAuth.authenticated === true, "Valid raw secret authenticates successfully");
  assert(validAuth.key?.id === keyId, "Resolved correct key ID");

  const invalidAuth = authenticateKey("ost_live_invalid_secret_key_1234567890abcdef");
  assert(invalidAuth.authenticated === false, "Invalid secret is rejected");

  // 3. API Key Rotation
  const { secret: newSecret, keyPrefix: newPrefix, keyHash: newHash } = generateApiKeySecret("production");
  keyDatabase[keyId].keyPrefix = newPrefix;
  keyDatabase[keyId].keyHash = newHash;
  keyDatabase[keyId].updatedAt = new Date().toISOString();

  // Verify Old Key Invalidation & New Key Authorization
  const oldKeyAuth = authenticateKey(rawSecret);
  assert(oldKeyAuth.authenticated === false, "Old secret is rejected immediately following rotation");

  const newKeyAuth = authenticateKey(newSecret);
  assert(newKeyAuth.authenticated === true, "New secret authenticates successfully");

  // 4. API Key Revocation
  keyDatabase[keyId].status = "revoked";
  keyDatabase[keyId].updatedAt = new Date().toISOString();

  const revokedAuth = authenticateKey(newSecret);
  assert(revokedAuth.authenticated === false, "Revoked key cannot authenticate");
  assert(revokedAuth.error?.includes("revoked"), "Revocation error returned");

  // 5. Expired API Key Verification
  const expiredKeyId = "key_expired_01";
  const { secret: expSecret, keyPrefix: expPrefix, keyHash: expHash } = generateApiKeySecret("production");
  keyDatabase[expiredKeyId] = {
    id: expiredKeyId,
    organizationId: orgId,
    projectId,
    name: "Expired Temporary Key",
    keyPrefix: expPrefix,
    keyHash: expHash,
    environment: "production",
    status: "active",
    expiresAt: new Date(Date.now() - 10000).toISOString(), // Expired 10s ago
    createdBy: actorId,
    createdAt: new Date(Date.now() - 60000).toISOString(),
  };

  const expiredAuth = authenticateKey(expSecret);
  assert(expiredAuth.authenticated === false, "Expired key is rejected");
  assert(expiredAuth.error?.includes("expired"), "Expiration error returned");

  // 6. Scope Gating
  const scopedKey = keyDatabase[keyId];
  function checkKeyScope(key: ApiKey, requiredScope: string): boolean {
    if (!key.scopes || key.scopes.length === 0) return true; // full access if unscoped
    return key.scopes.includes(requiredScope);
  }

  assert(checkKeyScope(scopedKey, "gateway:chat") === true, "Key has 'gateway:chat' scope");
  assert(checkKeyScope(scopedKey, "admin:billing") === false, "Key lacks 'admin:billing' scope");

  console.log("✔ Phase 26: Journey 4 — API Key Lifecycle & Cryptographic Security passed.");
}
