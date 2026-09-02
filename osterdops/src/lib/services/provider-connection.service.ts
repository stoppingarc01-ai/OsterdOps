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
  models?: string[];
  defaultModel?: string;
  maxSpendCap?: number;
  fallbackModel?: string;
}

export interface UpdateProviderConnectionParams {
  name?: string;
  displayName?: string;
  apiKey?: string;
  customBaseUrl?: string;
  status?: ProviderConnectionStatus;
  projectId?: string;
  models?: string[];
  defaultModel?: string;
  maxSpendCap?: number;
  fallbackModel?: string;
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
    models: Array.isArray(data.models) ? (data.models as string[]) : undefined,
    defaultModel: data.defaultModel ? String(data.defaultModel) : undefined,
    maxSpendCap: typeof data.maxSpendCap === "number" ? data.maxSpendCap : undefined,
    fallbackModel: data.fallbackModel ? String(data.fallbackModel) : undefined,
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
    models: Array.isArray(params.models) ? params.models : (params.defaultModel ? [params.defaultModel.trim()] : []),
    defaultModel: params.defaultModel?.trim() || null,
    maxSpendCap: typeof params.maxSpendCap === "number" ? params.maxSpendCap : null,
    fallbackModel: params.fallbackModel?.trim() || null,
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
      defaultModel: params.defaultModel,
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
  if (updates.models !== undefined) {
    updatePayload.models = updates.models;
  }
  if (updates.defaultModel !== undefined) {
    updatePayload.defaultModel = updates.defaultModel.trim() || null;
  }
  if (updates.maxSpendCap !== undefined) {
    updatePayload.maxSpendCap = updates.maxSpendCap;
  }
  if (updates.fallbackModel !== undefined) {
    updatePayload.fallbackModel = updates.fallbackModel.trim() || null;
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
  provider: AIProvider | string,
  projectId?: string,
  modelName?: string
): Promise<{ apiKey: string; baseUrl?: string; connectionId?: string; provider?: string } | null> {
  const db = getAdminFirestore();
  const normalizedProvider = (provider || "openai").toLowerCase();
  const normalizedModel = (modelName || "").trim().toLowerCase();

  // 1. Primary path: Dynamically check tenant's configured provider connections in Firestore
  const connColl = db
    .collection("organizations")
    .doc(orgId)
    .collection("providerConnections");

  const snap = await connColl.where("status", "==", "active").get();

  if (!snap.empty) {
    const rawDocs = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Record<string, unknown>),
    })) as Array<{
      id: string;
      provider?: string;
      defaultModel?: string;
      models?: string[];
      projectId?: string;
      encryptedKey?: string;
      keyIv?: string;
      keyTag?: string;
      customBaseUrl?: string;
    }>;

    // Find the best match:
    // a. Explicit model match (in models array or defaultModel) and matching project
    // b. Explicit provider match and matching project
    // c. Organization-wide model match
    // d. Organization-wide provider match
    // e. Custom OpenAI-compatible connection
    let matched = rawDocs.find((d) => {
      const defaultModel = String(d.defaultModel || "").toLowerCase();
      const models = Array.isArray(d.models) ? d.models.map((m: unknown) => String(m).toLowerCase()) : [];
      const projectMatches = !projectId || !d.projectId || d.projectId === projectId;
      const modelMatches = Boolean(normalizedModel && (defaultModel === normalizedModel || models.includes(normalizedModel)));

      return projectMatches && modelMatches;
    });

    if (!matched) {
      matched = rawDocs.find((d) => {
        const p = String(d.provider || "").toLowerCase();
        const projectMatches = !projectId || !d.projectId || d.projectId === projectId;
        const providerMatches =
          p === normalizedProvider ||
          ((normalizedProvider === "moonshot" || normalizedProvider === "kimi") && (p === "moonshot" || p === "kimi")) ||
          (normalizedProvider === "meta" && (p === "groq" || p === "meta" || p === "openai"));

        return projectMatches && providerMatches;
      });
    }

    if (!matched && normalizedModel) {
      matched = rawDocs.find((d) => {
        const defaultModel = String(d.defaultModel || "").toLowerCase();
        const models = Array.isArray(d.models) ? d.models.map((m: unknown) => String(m).toLowerCase()) : [];
        return defaultModel === normalizedModel || models.includes(normalizedModel);
      });
    }

    if (!matched) {
      matched = rawDocs.find((d) => {
        const p = String(d.provider || "").toLowerCase();
        return (
          p === normalizedProvider ||
          ((normalizedProvider === "moonshot" || normalizedProvider === "kimi") && (p === "moonshot" || p === "kimi")) ||
          (normalizedProvider === "meta" && (p === "groq" || p === "meta" || p === "openai")) ||
          (p === "custom" && (normalizedProvider === "openai" || normalizedProvider === "custom" || normalizedProvider === "groq" || normalizedProvider === "mistral" || normalizedProvider === "moonshot" || normalizedProvider === "kimi"))
        );
      });
    }

    if (matched) {
      try {
        const decryptedKey = decryptSecret({
          ciphertext: String(matched.encryptedKey || ""),
          iv: String(matched.keyIv || ""),
          tag: String(matched.keyTag || ""),
        });

        if (decryptedKey) {
          // Touch lastUsedAt asynchronously without blocking
          connColl.doc(matched.id).update({ lastUsedAt: FieldValue.serverTimestamp() }).catch(() => {});

          return {
            apiKey: decryptedKey,
            baseUrl: matched.customBaseUrl ? String(matched.customBaseUrl) : undefined,
            connectionId: matched.id,
            provider: String(matched.provider || normalizedProvider),
          };
        }
      } catch (err) {
        console.error(`[OsterdOps Provider] Failed to decrypt ${provider} connection key:`, err);
      }
    }
  }

  // 2. Controlled developer/test environment fallback
  if (process.env.NODE_ENV !== "production" || process.env.ENABLE_ENV_KEY_FALLBACK === "true") {
    if (normalizedProvider === "openai" && process.env.OPENAI_API_KEY) {
      return { apiKey: process.env.OPENAI_API_KEY, baseUrl: process.env.OPENAI_BASE_URL, provider: "openai" };
    }
    if (normalizedProvider === "anthropic" && process.env.ANTHROPIC_API_KEY) {
      return { apiKey: process.env.ANTHROPIC_API_KEY, baseUrl: process.env.ANTHROPIC_BASE_URL, provider: "anthropic" };
    }
    if (normalizedProvider === "gemini" && process.env.GEMINI_API_KEY) {
      return { apiKey: process.env.GEMINI_API_KEY, baseUrl: process.env.GEMINI_BASE_URL, provider: "gemini" };
    }
    if (normalizedProvider === "groq" && process.env.GROQ_API_KEY) {
      return { apiKey: process.env.GROQ_API_KEY, baseUrl: "https://api.groq.com/openai/v1", provider: "groq" };
    }
    if ((normalizedProvider === "moonshot" || normalizedProvider === "kimi") && (process.env.MOONSHOT_API_KEY || process.env.KIMI_API_KEY)) {
      return {
        apiKey: process.env.MOONSHOT_API_KEY || process.env.KIMI_API_KEY || "",
        baseUrl: process.env.MOONSHOT_BASE_URL || process.env.KIMI_BASE_URL || "https://api.moonshot.cn/v1",
        provider: "moonshot",
      };
    }
  }

  return null;
}
