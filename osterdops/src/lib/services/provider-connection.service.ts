/**
 * OsterdOps — Provider Connection & Key Resolution Service
 */

import "server-only";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { decryptSecret, encryptSecret, maskProviderKey } from "@/lib/crypto/encryption";
import { FieldValue } from "firebase-admin/firestore";
import type { AIProvider, ProviderConnection, ProviderConnectionStatus } from "@/types";

export interface CreateProviderConnectionParams {
  provider: AIProvider;
  name: string;
  apiKey: string;
  customBaseUrl?: string;
}

/**
 * Creates or updates an encrypted AI Provider connection in Firestore.
 */
export async function createProviderConnection(
  orgId: string,
  params: CreateProviderConnectionParams
): Promise<ProviderConnection> {
  const db = getAdminFirestore();
  const encrypted = encryptSecret(params.apiKey.trim());
  const maskedKey = maskProviderKey(params.apiKey.trim());

  const connRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("providerConnections")
    .doc();

  const connId = connRef.id;
  const now = FieldValue.serverTimestamp();

  const connData: Omit<ProviderConnection, "id"> = {
    organizationId: orgId,
    provider: params.provider,
    name: params.name.trim(),
    status: "active",
    encryptedKey: encrypted.ciphertext,
    keyIv: encrypted.iv,
    keyTag: encrypted.tag,
    maskedKey,
    customBaseUrl: params.customBaseUrl?.trim(),
    createdAt: now as unknown as string,
    updatedAt: now as unknown as string,
  };

  await connRef.set(connData);

  return {
    id: connId,
    ...connData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Resolves active provider credentials for an organization.
 * Decrypts the stored key or falls back to server env vars if present.
 */
export async function resolveProviderCredentials(
  orgId: string,
  provider: AIProvider
): Promise<{ apiKey: string; baseUrl?: string } | null> {
  const db = getAdminFirestore();

  // 1. Check organization's configured provider connections in Firestore
  const snap = await db
    .collection("organizations")
    .doc(orgId)
    .collection("providerConnections")
    .where("provider", "==", provider)
    .where("status", "==", "active")
    .limit(1)
    .get();

  if (!snap.empty) {
    const conn = snap.docs[0].data() as ProviderConnection;
    try {
      const decryptedKey = decryptSecret({
        ciphertext: conn.encryptedKey,
        iv: conn.keyIv,
        tag: conn.keyTag,
      });
      return {
        apiKey: decryptedKey,
        baseUrl: conn.customBaseUrl,
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

/**
 * Lists all provider connections for an organization with masked keys.
 */
export async function listProviderConnections(
  orgId: string
): Promise<ProviderConnection[]> {
  const db = getAdminFirestore();
  const snap = await db
    .collection("organizations")
    .doc(orgId)
    .collection("providerConnections")
    .orderBy("createdAt", "desc")
    .get();

  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      organizationId: data.organizationId,
      provider: data.provider,
      name: data.name,
      status: data.status as ProviderConnectionStatus,
      encryptedKey: "", // Redacted
      keyIv: "",        // Redacted
      keyTag: "",       // Redacted
      maskedKey: data.maskedKey,
      customBaseUrl: data.customBaseUrl,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
    } as ProviderConnection;
  });
}
