/**
 * Unit Tests — Integration Credential Vault, Encryption & Masking
 */

import {
  storeIntegrationCredential,
  getDecryptedCredential,
  getCredentialMetadata,
  rotateIntegrationCredential,
  revokeIntegrationCredential,
  maskSecret,
  clearCredentialStoreForTesting,
} from "@/lib/integrations/credential-store";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export async function runIntegrationCredentialsTests() {
  clearCredentialStoreForTesting();
  const orgId = "org_cred_test";
  const intId = "int_cred_test";
  const secret = "whsec_super_secret_signing_key_123456";

  // 1. Secret masking test
  const mask = maskSecret(secret);
  assert(mask.startsWith("whsec"), "Mask must preserve prefix.");
  assert(mask.includes("••••"), "Mask must obscure secret body.");
  assert(!mask.includes("super_secret"), "Mask must not leak secret content.");

  // 2. Store credential
  const meta = await storeIntegrationCredential(orgId, intId, secret);
  assert(meta.organizationId === orgId, "Organization ID must match.");
  assert(meta.keyMask === mask, "Stored keyMask must match mask.");

  // 3. Decrypt credential
  const decrypted = await getDecryptedCredential(orgId, intId);
  assert(decrypted === secret, "Decrypted secret must match original secret.");

  // 4. Metadata non-disclosure
  const readMeta = await getCredentialMetadata(orgId, intId);
  assert(readMeta !== null, "Metadata must be readable.");
  assert((readMeta as unknown as Record<string, unknown>).ciphertext === undefined, "Metadata must never expose ciphertext.");

  // 5. Rotate credential
  const newSecret = "whsec_rotated_secret_789012";
  await rotateIntegrationCredential(orgId, intId, newSecret);
  const rotatedDecrypted = await getDecryptedCredential(orgId, intId);
  assert(rotatedDecrypted === newSecret, "Decrypted secret after rotation must match new secret.");

  // 6. Revoke credential
  await revokeIntegrationCredential(orgId, intId);
  const revokedDecrypted = await getDecryptedCredential(orgId, intId);
  assert(revokedDecrypted === null, "Revoked credential must not decrypt.");
}
