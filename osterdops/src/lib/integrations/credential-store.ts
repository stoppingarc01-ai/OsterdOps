/**
 * OsterdOps — Integration Encrypted Credential Vault (Phase 20)
 * Uses AES-256-GCM encryption with separate metadata tracking and secret non-disclosure guarantees.
 */

import crypto from "crypto";
import { encryptSecret, decryptSecret, EncryptedPayload } from "@/lib/crypto/encryption";
import type { IntegrationCredentialMeta } from "./types";

interface StoredCredentialRecord {
  meta: IntegrationCredentialMeta;
  encrypted: EncryptedPayload;
}

// In-memory tenant-isolated credential cache
const credentialStore = new Map<string, StoredCredentialRecord>();

function getStorageKey(organizationId: string, integrationId: string): string {
  return `${organizationId}:${integrationId}`;
}

/**
 * Creates a masked preview of a secret (e.g. "whsec_••••••••••••94f2").
 */
export function maskSecret(secret: string): string {
  if (!secret) return "••••••••••••••••";
  if (secret.length <= 8) return "••••••••";
  const prefix = secret.slice(0, 5);
  const suffix = secret.slice(-4);
  return `${prefix}••••••••••••${suffix}`;
}

/**
 * Encrypts and securely stores an integration secret.
 */
export async function storeIntegrationCredential(
  organizationId: string,
  integrationId: string,
  plaintextSecret: string,
  expiresAt?: string
): Promise<IntegrationCredentialMeta> {
  const encrypted = encryptSecret(plaintextSecret);
  const credId = `cred_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const meta: IntegrationCredentialMeta = {
    id: credId,
    integrationId,
    organizationId,
    keyMask: maskSecret(plaintextSecret),
    createdAt: new Date().toISOString(),
    expiresAt,
  };

  credentialStore.set(getStorageKey(organizationId, integrationId), { meta, encrypted });
  return meta;
}

/**
 * Retrieves and decrypts the plaintext secret for backend execution ONLY.
 * NEVER return this to client endpoints.
 */
export async function getDecryptedCredential(
  organizationId: string,
  integrationId: string
): Promise<string | null> {
  const record = credentialStore.get(getStorageKey(organizationId, integrationId));
  if (!record || record.meta.revokedAt) return null;

  // Check expiration if set
  if (record.meta.expiresAt && new Date(record.meta.expiresAt).getTime() < Date.now()) {
    return null;
  }

  record.meta.lastUsedAt = new Date().toISOString();
  return decryptSecret(record.encrypted);
}

/**
 * Retrieves the non-sensitive credential metadata for UI presentation.
 */
export async function getCredentialMetadata(
  organizationId: string,
  integrationId: string
): Promise<IntegrationCredentialMeta | null> {
  const record = credentialStore.get(getStorageKey(organizationId, integrationId));
  return record ? { ...record.meta } : null;
}

/**
 * Rotates an existing credential with a new secret.
 */
export async function rotateIntegrationCredential(
  organizationId: string,
  integrationId: string,
  newSecret: string
): Promise<IntegrationCredentialMeta> {
  return storeIntegrationCredential(organizationId, integrationId, newSecret);
}

/**
 * Revokes a credential immediately.
 */
export async function revokeIntegrationCredential(
  organizationId: string,
  integrationId: string
): Promise<boolean> {
  const record = credentialStore.get(getStorageKey(organizationId, integrationId));
  if (!record) return false;

  record.meta.revokedAt = new Date().toISOString();
  return true;
}

/**
 * Test helper to clear in-memory store.
 */
export function clearCredentialStoreForTesting(): void {
  credentialStore.clear();
}
