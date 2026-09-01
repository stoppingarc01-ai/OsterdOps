/**
 * OsterdOps — Provider Connection & Secret Management Service Layer
 * AES-256-GCM encrypted credential storage, server-side validation, safe metadata projection,
 * and immutable audit logging without secret leakage.
 */

import "server-only";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { decryptSecret, encryptSecret, maskProviderKey } from "@/lib/crypto/encryption";
import { getProviderAdapter, isSupportedProvider } from "@/lib/adapters/registry";
import { recordAuditLog } from "./audit.service";
import type {
  AIProvider,
  ProviderConnection,
  ProviderConnectionStatus,
} from "@/types";

export interface CreateProviderConnectionParams {
  provider: string;
  name: string;
  apiKey: string;
  displayName?: string;
  projectId?: string;
  customBaseUrl?: string;
}

export interface UpdateProviderConnectionParams {
  name?: string;
  displayName?: string;
  apiKey?: string;
  customBaseUrl?: string;
  status?: ProviderConnectionStatus;
  projectId?: string;
}

/**
 * Sanitizes a ProviderConnection record by strictly redacting all encrypted secrets, IVs, and tags.
 */
function sanitizeConnection(docId: string, data: Record<string, unknown>): ProviderConnection {
  const toDateString = (val: unknown): string | undefined => {
    if (!val) return undefined;
    if (typeof val === "string") return val;
    if (typeof val === "object" && val !== null && "toDate" in val && typeof (val as { toDate: () => Date }).toDate === "function") {
      return (val as { toDate: () => Date }).toDate().toISOString();
    }
    return undefined;
  };

  return {
    id: docId,
    organizationId: String(data.organizationId || ""),
    projectId: data.projectId ? String(data.projectId) : undefined,
    provider: (data.provider as AIProvider) || "openai",
    name: String(data.name || ""),
    displayName: data.displayName ? String(data.displayName) : String(data.name || ""),
    status: (data.status as ProviderConnectionStatus) || "active",
    encryptedKey: "", // Strictly redacted
    keyIv: "",        // Strictly redacted
    keyTag: "",       // Strictly redacted
    maskedKey: String(data.maskedKey || "••••••••"),
    customBaseUrl: data.customBaseUrl ? String(data.customBaseUrl) : undefined,
    createdBy: data.createdBy ? String(data.createdBy) : undefined,
    createdAt: toDateString(data.createdAt) || new Date().toISOString(),
    updatedAt: toDateString(data.updatedAt) || new Date().toISOString(),
    lastValidatedAt: toDateString(data.lastValidatedAt),
    lastUsedAt: toDateString(data.lastUsedAt),
  };
}

/**
 * Creates and stores an AES-256-GCM encrypted AI Provider connection in Firestore.
 */
export async function createProviderConnection(
  orgId: string,
  userId: string,
  params: CreateProviderConnectionParams
): Promise<ProviderConnection> {
  const rawProvider = (params.provider || "").trim().toLowerCase();
  if (!isSupportedProvider(rawProvider)) {
    throw new Error(`Unsupported AI provider: '${params.provider}'`);
  }

  const cleanKey = (params.apiKey || "").trim();
  if (!cleanKey) {
    throw new Error("Provider API key is required.");
  }

  const db = getAdminFirestore();
  const encrypted = encryptSecret(cleanKey);
  const maskedKey = maskProviderKey(cleanKey);

  const connRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("providerConnections")
    .doc();

  const connId = connRef.id;
  const now = FieldValue.serverTimestamp();

  const connData = {
    organizationId: orgId,
    projectId: params.projectId || null,
    provider: rawProvider,
    name: params.name.trim(),
    displayName: params.displayName?.trim() || params.name.trim(),
    status: "active" as ProviderConnectionStatus,
    encryptedKey: encrypted.ciphertext,
    keyIv: encrypted.iv,
    keyTag: encrypted.tag,
    maskedKey,
    customBaseUrl: params.customBaseUrl?.trim() || null,
    createdBy: userId,
    createdAt: now,
    updatedAt: now,
  };

  await connRef.set(connData);

  // Record audit log event (NEVER log raw secrets, tokens, or encryption payloads)
  await recordAuditLog({
    organizationId: orgId,
    actorId: userId,
    action: "PROVIDER_CONNECTION_CREATED",
    resourceType: "provider_connection",
    resourceId: connId,
    details: {
      provider: rawProvider,
      name: params.name.trim(),
      projectId: params.projectId,
      maskedKey,
    },
  });

  return sanitizeConnection(connId, {
    ...connData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Lists all provider connections for an organization with redacted secrets.
 */
export async function listProviderConnections(
  orgId: string,
  projectId?: string
): Promise<ProviderConnection[]> {
  const db = getAdminFirestore();
  const query = db
    .collection("organizations")
    .doc(orgId)
    .collection("providerConnections")
    .orderBy("createdAt", "desc");

  const snap = await query.get();

  let results = snap.docs.map((doc) => sanitizeConnection(doc.id, doc.data()));

  if (projectId) {
    // Return organization-level connections (reusable) or project-specific connections
    results = results.filter(
      (c) => !c.projectId || c.projectId === projectId
    );
  }

  return results;
}

/**
 * Retrieves safe metadata for a single provider connection.
 */
export async function getProviderConnectionById(
  orgId: string,
  connId: string
): Promise<ProviderConnection | null> {
  const db = getAdminFirestore();
  const doc = await db
    .collection("organizations")
    .doc(orgId)
    .collection("providerConnections")
    .doc(connId)
    .get();

  if (!doc.exists) return null;

  return sanitizeConnection(doc.id, doc.data() || {});
}

/**
 * Updates connection metadata or replaces the encrypted secret.
 */
export async function updateProviderConnection(
  orgId: string,
  connId: string,
  userId: string,
  updates: UpdateProviderConnectionParams
): Promise<ProviderConnection | null> {
  const db = getAdminFirestore();
  const connRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("providerConnections")
    .doc(connId);

  const snap = await connRef.get();
  if (!snap.exists) return null;

  const existingData = snap.data() || {};
  const updatePayload: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (updates.name !== undefined) {
    updatePayload.name = updates.name.trim();
  }
  if (updates.displayName !== undefined) {
    updatePayload.displayName = updates.displayName.trim();
  }
  if (updates.customBaseUrl !== undefined) {
    updatePayload.customBaseUrl = updates.customBaseUrl.trim() || null;
  }
  if (updates.status !== undefined) {
    updatePayload.status = updates.status;
  }
  if (updates.projectId !== undefined) {
    updatePayload.projectId = updates.projectId || null;
  }

  // If replacing API key, re-encrypt with fresh random IV
  if (updates.apiKey && updates.apiKey.trim()) {
    const cleanKey = updates.apiKey.trim();
    const encrypted = encryptSecret(cleanKey);
    updatePayload.encryptedKey = encrypted.ciphertext;
    updatePayload.keyIv = encrypted.iv;
    updatePayload.keyTag = encrypted.tag;
    updatePayload.maskedKey = maskProviderKey(cleanKey);
    updatePayload.status = "active";
  }

  await connRef.update(updatePayload);

  await recordAuditLog({
    organizationId: orgId,
    actorId: userId,
    action: "PROVIDER_CONNECTION_UPDATED",
    resourceType: "provider_connection",
    resourceId: connId,
    details: {
      provider: existingData.provider,
      name: updatePayload.name || existingData.name,
      status: updatePayload.status || existingData.status,
      keyUpdated: Boolean(updates.apiKey),
    },
  });

  const updatedSnap = await connRef.get();
  return sanitizeConnection(connId, updatedSnap.data() || {});
}

/**
 * Validates provider credentials server-side without leaking secret material.
 */
export async function validateProviderConnection(
  orgId: string,
  connId: string,
  userId: string
): Promise<{
  valid: boolean;
  status: ProviderConnectionStatus;
  error?: string;
  connection: ProviderConnection | null;
}> {
  const db = getAdminFirestore();
  const connRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("providerConnections")
    .doc(connId);

  const snap = await connRef.get();
  if (!snap.exists) {
    return {
      valid: false,
      status: "invalid",
      error: "Provider connection not found.",
      connection: null,
    };
  }

  const data = snap.data() || {};
  let decryptedApiKey = "";

  try {
    decryptedApiKey = decryptSecret({
      ciphertext: String(data.encryptedKey || ""),
      iv: String(data.keyIv || ""),
      tag: String(data.keyTag || ""),
    });
  } catch {
    await connRef.update({
      status: "invalid",
      lastValidatedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      valid: false,
      status: "invalid",
      error: "Failed to decrypt provider credentials.",
      connection: sanitizeConnection(connId, { ...data, status: "invalid" }),
    };
  }

  const adapter = getProviderAdapter(String(data.provider || "openai"));
  const validationResult = await adapter.validateCredentials({
    apiKey: decryptedApiKey,
    baseUrl: data.customBaseUrl ? String(data.customBaseUrl) : undefined,
  });

  const newStatus: ProviderConnectionStatus = validationResult.valid
    ? "active"
    : "validation_failed";

  await connRef.update({
    status: newStatus,
    lastValidatedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await recordAuditLog({
    organizationId: orgId,
    actorId: userId,
    action: "PROVIDER_CONNECTION_VALIDATED",
    resourceType: "provider_connection",
    resourceId: connId,
    details: {
      provider: data.provider,
      valid: validationResult.valid,
      status: newStatus,
    },
  });

  const updatedSnap = await connRef.get();
  return {
    valid: validationResult.valid,
    status: newStatus,
    error: validationResult.error,
    connection: sanitizeConnection(connId, updatedSnap.data() || {}),
  };
}

/**
 * Soft-disables / revokes a provider connection for auditability.
 */
export async function disableProviderConnection(
  orgId: string,
  connId: string,
  userId: string
): Promise<boolean> {
  const db = getAdminFirestore();
  const connRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("providerConnections")
    .doc(connId);

  const snap = await connRef.get();
  if (!snap.exists) return false;

  const data = snap.data() || {};

  await connRef.update({
    status: "disabled",
    updatedAt: FieldValue.serverTimestamp(),
  });

  await recordAuditLog({
    organizationId: orgId,
    actorId: userId,
    action: "PROVIDER_CONNECTION_REVOKED",
    resourceType: "provider_connection",
    resourceId: connId,
    details: {
      provider: data.provider,
      name: data.name,
    },
  });

  return true;
}

/**
 * Resolves active provider credentials for server-side gateway usage.
 * Decrypts the stored key or falls back to environment variables.
 */
export async function resolveProviderCredentials(
  orgId: string,
  provider: AIProvider,
  projectId?: string
): Promise<{ apiKey: string; baseUrl?: string } | null> {
  const db = getAdminFirestore();

  // 1. Check organization's configured provider connections in Firestore
  const snap = await db
    .collection("organizations")
    .doc(orgId)
    .collection("providerConnections")
    .where("provider", "==", provider)
    .where("status", "==", "active")
    .get();

  if (!snap.empty) {
    // If projectId specified, prefer project-associated connection; otherwise use org-level connection
    const docs = snap.docs.map((d) => d.data() as ProviderConnection);
    const matched =
      (projectId && docs.find((d) => d.projectId === projectId)) ||
      docs.find((d) => !d.projectId) ||
      docs[0];

    try {
      const decryptedKey = decryptSecret({
        ciphertext: matched.encryptedKey,
        iv: matched.keyIv,
        tag: matched.keyTag,
      });
      return {
        apiKey: decryptedKey,
        baseUrl: matched.customBaseUrl,
      };
    } catch (err) {
      console.error(`[OsterdOps Provider] Failed to decrypt ${provider} connection key:`, err);
    }
  }

  // 2. Developer/Environment Fallback
  if (provider === "openai" && process.env.OPENAI_API_KEY) {
    return { apiKey: process.env.OPENAI_API_KEY, baseUrl: process.env.OPENAI_BASE_URL };
  }
  if (provider === "anthropic" && process.env.ANTHROPIC_API_KEY) {
    return { apiKey: process.env.ANTHROPIC_API_KEY, baseUrl: process.env.ANTHROPIC_BASE_URL };
  }
  if (provider === "gemini" && process.env.GEMINI_API_KEY) {
    return { apiKey: process.env.GEMINI_API_KEY, baseUrl: process.env.GEMINI_BASE_URL };
  }

  return null;
}
