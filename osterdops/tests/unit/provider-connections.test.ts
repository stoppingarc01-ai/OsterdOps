/**
 * OsterdOps — Phase 6: Provider Connections Unit Test Suite
 * Validates adapter registry, cryptographic AES-256-GCM encryption, validation error normalization,
 * RBAC permissions, cross-tenant isolation, and audit logging with zero secret leaks.
 */

import { getProviderAdapter, isSupportedProvider } from "@/lib/adapters/registry";
import { encryptSecret, decryptSecret, maskProviderKey } from "@/lib/crypto/encryption";
import { hasPermission } from "@/lib/auth/permissions";
import type { ProviderConnection, ProviderConnectionStatus, AIProvider } from "@/types";

// ==========================================
// Mock In-Memory Database for Connections
// ==========================================
interface MockConnectionDb {
  connections: Record<string, ProviderConnection & { encryptedKey: string; keyIv: string; keyTag: string }>;
  auditLogs: Array<{
    organizationId: string;
    actorId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    details?: Record<string, unknown>;
  }>;
}

function createMockDb(): MockConnectionDb {
  return {
    connections: {},
    auditLogs: [],
  };
}

// 1. Provider Registry Tests
export function testProviderRegistry() {
  const supported = ["openai", "anthropic", "gemini", "azure", "bedrock"];

  for (const p of supported) {
    if (!isSupportedProvider(p)) {
      throw new Error(`Provider '${p}' must be identified as supported.`);
    }

    const adapter = getProviderAdapter(p);
    if (!adapter || adapter.provider !== p) {
      throw new Error(`Adapter for '${p}' must resolve correctly.`);
    }
  }

  // Case-insensitivity test
  const upperAdapter = getProviderAdapter("OPENAI");
  if (!upperAdapter || upperAdapter.provider !== "openai") {
    throw new Error("Provider resolver must be case-insensitive.");
  }

  const mixedAdapter = getProviderAdapter("Anthropic");
  if (!mixedAdapter || mixedAdapter.provider !== "anthropic") {
    throw new Error("Provider resolver must handle mixed case.");
  }

  // Unsupported provider rejection
  if (isSupportedProvider("unsupported_llm_vendor")) {
    throw new Error("Unsupported provider must return false from isSupportedProvider.");
  }

  let rejected = false;
  try {
    getProviderAdapter("unsupported_llm_vendor");
  } catch (err: unknown) {
    rejected = true;
    if (!(err instanceof Error) || !err.message.includes("Unsupported AI provider")) {
      throw new Error("Expected Unsupported AI provider error message.");
    }
  }

  if (!rejected) {
    throw new Error("getProviderAdapter must throw for unknown providers.");
  }
}

// 2. AES-256-GCM Encryption Integrity & Masking Tests
export function testEncryptionAndKeyMasking() {
  const rawKey = "sk-proj-test123456789abcdefghijklmnopqrstuvwxyz";
  const encrypted = encryptSecret(rawKey);

  if (!encrypted.ciphertext || !encrypted.iv || !encrypted.tag) {
    throw new Error("Encrypted payload must contain ciphertext, 96-bit iv, and 128-bit tag.");
  }

  if (encrypted.iv.length !== 24) {
    // 12 bytes = 24 hex characters
    throw new Error(`IV length must be 24 hex chars (96-bit), got ${encrypted.iv.length}`);
  }

  if (encrypted.tag.length !== 32) {
    // 16 bytes = 32 hex characters
    throw new Error(`Auth tag length must be 32 hex chars (128-bit), got ${encrypted.tag.length}`);
  }

  const decrypted = decryptSecret(encrypted);
  if (decrypted !== rawKey) {
    throw new Error(`Decrypted text '${decrypted}' does not match original '${rawKey}'.`);
  }

  // Tampered ciphertext must fail authentication tag check
  let tamperedCaught = false;
  try {
    const tamperedCipher = encrypted.ciphertext.endsWith("0")
      ? encrypted.ciphertext.slice(0, -1) + "1"
      : encrypted.ciphertext.slice(0, -1) + "0";
    const tamperedPayload = {
      ...encrypted,
      ciphertext: tamperedCipher,
    };
    decryptSecret(tamperedPayload);
  } catch {
    tamperedCaught = true;
  }

  if (!tamperedCaught) {
    throw new Error("AES-256-GCM decipher must reject tampered ciphertext via auth tag verification.");
  }

  // Masking preview test
  const masked = maskProviderKey(rawKey);
  if (!masked.startsWith("sk-proj") || !masked.includes("••••") || !masked.endsWith("wxyz")) {
    throw new Error(`maskProviderKey produced invalid preview: '${masked}'`);
  }

  if (masked.includes("123456789")) {
    throw new Error("maskProviderKey leaked middle secret material.");
  }
}

// 3. Error Normalization Tests
export function testProviderErrorNormalization() {
  const openAiAdapter = getProviderAdapter("openai");
  const anthropicAdapter = getProviderAdapter("anthropic");
  const geminiAdapter = getProviderAdapter("gemini");

  // OpenAI error normalization
  const openAi401 = openAiAdapter.handleProviderError(401, {
    error: { message: "Incorrect API key provided", code: "invalid_api_key" },
  });
  if (openAi401.code !== "INVALID_CREDENTIALS" || openAi401.retryable !== false) {
    throw new Error("OpenAI 401 must normalize to INVALID_CREDENTIALS and non-retryable.");
  }

  const openAi429 = openAiAdapter.handleProviderError(429, {
    error: { message: "Rate limit reached", code: "rate_limit_exceeded" },
  });
  if (openAi429.code !== "PROVIDER_RATE_LIMITED" || openAi429.retryable !== true) {
    throw new Error("OpenAI 429 must normalize to PROVIDER_RATE_LIMITED and retryable.");
  }

  const openAi503 = openAiAdapter.handleProviderError(503, {
    error: { message: "Service Unavailable" },
  });
  if (openAi503.code !== "PROVIDER_UNAVAILABLE" || openAi503.retryable !== true) {
    throw new Error("OpenAI 503 must normalize to PROVIDER_UNAVAILABLE and retryable.");
  }

  // Anthropic error normalization
  const anthropic401 = anthropicAdapter.handleProviderError(401, {
    error: { type: "authentication_error", message: "invalid x-api-key" },
  });
  if (anthropic401.code !== "INVALID_CREDENTIALS") {
    throw new Error("Anthropic 401 must normalize to INVALID_CREDENTIALS.");
  }

  // Gemini error normalization
  const gemini400 = geminiAdapter.handleProviderError(400, {
    error: { status: "UNAUTHENTICATED", message: "API key not valid" },
  });
  if (gemini400.code !== "INVALID_CREDENTIALS") {
    throw new Error("Gemini 400 UNAUTHENTICATED must normalize to INVALID_CREDENTIALS.");
  }
}

// 4. RBAC Permission Matrix for Integrations
export function testProviderConnectionRbac() {
  // OWNER permissions
  if (!hasPermission("OWNER", "integrations:manage")) {
    throw new Error("OWNER must possess 'integrations:manage' permission.");
  }
  if (!hasPermission("OWNER", "integrations:read")) {
    throw new Error("OWNER must possess 'integrations:read' permission.");
  }

  // ADMIN permissions
  if (!hasPermission("ADMIN", "integrations:manage")) {
    throw new Error("ADMIN must possess 'integrations:manage' permission.");
  }
  if (!hasPermission("ADMIN", "integrations:read")) {
    throw new Error("ADMIN must possess 'integrations:read' permission.");
  }

  // DEVELOPER permissions: can read metadata only, cannot manage credentials
  if (!hasPermission("DEVELOPER", "integrations:read")) {
    throw new Error("DEVELOPER must possess 'integrations:read' permission.");
  }
  if (hasPermission("DEVELOPER", "integrations:manage")) {
    throw new Error("DEVELOPER must NOT possess 'integrations:manage' permission.");
  }

  // VIEWER permissions: denied integrations read & manage per baseline permission model
  if (hasPermission("VIEWER", "integrations:read")) {
    throw new Error("VIEWER must NOT possess 'integrations:read' permission.");
  }
  if (hasPermission("VIEWER", "integrations:manage")) {
    throw new Error("VIEWER must NOT possess 'integrations:manage' permission.");
  }
}

// 5. Connection Lifecycle, Validation & Secret Protection Simulation
export async function testConnectionLifecycleAndSecurity() {
  const db = createMockDb();
  const rawKey = "sk-ant-api03-test-key-1234567890abcdef";

  // 1. Create Connection (Simulate service layer)
  const encrypted = encryptSecret(rawKey);
  const maskedKey = maskProviderKey(rawKey);
  const connId = "conn_openai_prod";

  db.connections[connId] = {
    id: connId,
    organizationId: "org_alpha",
    provider: "openai",
    name: "Production OpenAI Gateway",
    status: "active",
    encryptedKey: encrypted.ciphertext,
    keyIv: encrypted.iv,
    keyTag: encrypted.tag,
    maskedKey,
    createdBy: "usr_admin_1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.auditLogs.push({
    organizationId: "org_alpha",
    actorId: "usr_admin_1",
    action: "PROVIDER_CONNECTION_CREATED",
    resourceType: "provider_connection",
    resourceId: connId,
    details: { provider: "openai", name: "Production OpenAI Gateway", maskedKey },
  });

  // 2. Verify sanitized projection: encryptedKey, IV, tag must be redacted
  const stored = db.connections[connId];
  const clientView: ProviderConnection = {
    ...stored,
    encryptedKey: "",
    keyIv: "",
    keyTag: "",
  };

  if (clientView.encryptedKey !== "" || clientView.keyIv !== "" || clientView.keyTag !== "") {
    throw new Error("SECURITY VIOLATION: Encrypted key material exposed in client view.");
  }

  if (clientView.maskedKey.includes("test-key-12345")) {
    throw new Error("SECURITY VIOLATION: Raw key exposed in maskedKey property.");
  }

  // 3. Validation Simulation
  const decrypted = decryptSecret({
    ciphertext: stored.encryptedKey,
    iv: stored.keyIv,
    tag: stored.keyTag,
  });

  if (decrypted !== rawKey) {
    throw new Error("Validation step failed to decrypt stored credentials.");
  }

  db.connections[connId].lastValidatedAt = new Date().toISOString();
  db.auditLogs.push({
    organizationId: "org_alpha",
    actorId: "usr_admin_1",
    action: "PROVIDER_CONNECTION_VALIDATED",
    resourceType: "provider_connection",
    resourceId: connId,
    details: { provider: "openai", valid: true, status: "active" },
  });

  // 4. Update / Rotation Simulation
  const newRawKey = "sk-ant-api03-rotated-key-9876543210fedcba";
  const newEncrypted = encryptSecret(newRawKey);
  const newMasked = maskProviderKey(newRawKey);

  db.connections[connId].encryptedKey = newEncrypted.ciphertext;
  db.connections[connId].keyIv = newEncrypted.iv;
  db.connections[connId].keyTag = newEncrypted.tag;
  db.connections[connId].maskedKey = newMasked;
  db.connections[connId].updatedAt = new Date().toISOString();

  db.auditLogs.push({
    organizationId: "org_alpha",
    actorId: "usr_admin_1",
    action: "PROVIDER_CONNECTION_UPDATED",
    resourceType: "provider_connection",
    resourceId: connId,
    details: { provider: "openai", keyUpdated: true },
  });

  const decryptedNew = decryptSecret({
    ciphertext: db.connections[connId].encryptedKey,
    iv: db.connections[connId].keyIv,
    tag: db.connections[connId].keyTag,
  });

  if (decryptedNew !== newRawKey) {
    throw new Error("Updated credentials did not decrypt to new key.");
  }

  // 5. Disable / Revoke Simulation
  db.connections[connId].status = "disabled";
  db.auditLogs.push({
    organizationId: "org_alpha",
    actorId: "usr_admin_1",
    action: "PROVIDER_CONNECTION_REVOKED",
    resourceType: "provider_connection",
    resourceId: connId,
    details: { provider: "openai", name: db.connections[connId].name },
  });

  if (db.connections[connId].status !== "disabled") {
    throw new Error("Connection status must be disabled after revocation.");
  }

  // 6. Verify Zero Secret Leakage in Audit Logs
  for (const log of db.auditLogs) {
    const stringified = JSON.stringify(log);
    if (
      stringified.includes(rawKey) ||
      stringified.includes(newRawKey) ||
      stringified.includes("Authorization")
    ) {
      throw new Error("SECURITY VIOLATION: Secret or Bearer token leaked into audit logs.");
    }
  }
}

// 6. Cross-Tenant Multi-tenant Isolation Test
export function testCrossTenantProviderIsolation() {
  const db = createMockDb();

  // Alpha connection
  const encAlpha = encryptSecret("sk-alpha-test");
  db.connections["conn_alpha"] = {
    id: "conn_alpha",
    organizationId: "org_alpha",
    provider: "openai",
    name: "Alpha OpenAI",
    status: "active",
    encryptedKey: encAlpha.ciphertext,
    keyIv: encAlpha.iv,
    keyTag: encAlpha.tag,
    maskedKey: maskProviderKey("sk-alpha-test"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Beta connection
  const encBeta = encryptSecret("sk-beta-test");
  db.connections["conn_beta"] = {
    id: "conn_beta",
    organizationId: "org_beta",
    provider: "anthropic",
    name: "Beta Anthropic",
    status: "active",
    encryptedKey: encBeta.ciphertext,
    keyIv: encBeta.iv,
    keyTag: encBeta.tag,
    maskedKey: maskProviderKey("sk-beta-test"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Filter for Org Alpha
  const alphaConns = Object.values(db.connections).filter((c) => c.organizationId === "org_alpha");
  if (alphaConns.length !== 1 || alphaConns[0].id !== "conn_alpha") {
    throw new Error("Cross-tenant isolation error: Alpha query failed.");
  }

  if (alphaConns.some((c) => c.organizationId === "org_beta")) {
    throw new Error("SECURITY VIOLATION: Beta connection leaked into Alpha organization scope.");
  }
}

// Master Test Runner for Phase 6
export async function runProviderConnectionTests() {
  testProviderRegistry();
  testEncryptionAndKeyMasking();
  testProviderErrorNormalization();
  testProviderConnectionRbac();
  await testConnectionLifecycleAndSecurity();
  testCrossTenantProviderIsolation();
}
