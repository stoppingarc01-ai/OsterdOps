/**
 * OsterdOps — Project API Key Service Layer
 */

import "server-only";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import {
  generateApiKeySecret,
  hashApiKey,
  isValidApiKeyFormat,
  timingSafeHashMatch,
} from "@/lib/auth/api-key";
import { recordAuditLog } from "./audit.service";
import type {
  ApiKey,
  ApiKeyEnvironment,
  GeneratedApiKeyResponse,
  Project,
  Organization,
} from "@/types";

export interface CreateApiKeyParams {
  name: string;
  environment?: ApiKeyEnvironment;
  expiresAt?: string;
}

/**
 * Generates and stores a new API key for a Project.
 * The plaintext secret is returned ONLY in the result of this function.
 */
export async function createProjectApiKey(
  orgId: string,
  projectId: string,
  userId: string,
  params: CreateApiKeyParams
): Promise<GeneratedApiKeyResponse> {
  const db = getAdminFirestore();
  const environment = params.environment || "production";
  const { secret, keyPrefix, keyHash } = generateApiKeySecret(environment);

  const keyRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("projects")
    .doc(projectId)
    .collection("apiKeys")
    .doc();

  const keyId = keyRef.id;
  const now = FieldValue.serverTimestamp();

  const keyData: Omit<ApiKey, "id"> = {
    organizationId: orgId,
    projectId,
    name: params.name.trim(),
    keyPrefix,
    keyHash,
    environment,
    status: "active",
    createdBy: userId,
    createdAt: now as unknown as string,
    expiresAt: params.expiresAt,
  };

  await keyRef.set(keyData);

  // Record audit log event
  recordAuditLog({
    organizationId: orgId,
    actorId: userId,
    action: "api_key.create",
    resourceType: "api_key",
    resourceId: keyId,
    details: { projectId, name: params.name.trim(), environment, keyPrefix },
  }).catch((err) => console.error("[OsterdOps Audit Log] Error logging key creation:", err));

  const cleanKey: ApiKey = {
    id: keyId,
    ...keyData,
    createdAt: new Date().toISOString(),
  };

  return {
    key: cleanKey,
    secret, // Returned ONLY ONCE
  };
}

/**
 * Lists all API keys for a project. Plaintext secrets are NEVER returned.
 */
export async function listProjectApiKeys(
  orgId: string,
  projectId: string
): Promise<ApiKey[]> {
  const db = getAdminFirestore();
  const snap = await db
    .collection("organizations")
    .doc(orgId)
    .collection("projects")
    .doc(projectId)
    .collection("apiKeys")
    .orderBy("createdAt", "desc")
    .get();

  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      organizationId: data.organizationId,
      projectId: data.projectId,
      name: data.name,
      keyPrefix: data.keyPrefix,
      keyHash: "", // Redacted from listing
      environment: data.environment,
      status: data.status,
      createdBy: data.createdBy,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      lastUsedAt: data.lastUsedAt?.toDate?.()?.toISOString() || data.lastUsedAt,
      expiresAt: data.expiresAt,
    } as ApiKey;
  });
}

/**
 * Revokes an existing API key.
 */
export async function revokeProjectApiKey(
  orgId: string,
  projectId: string,
  keyId: string,
  actorId?: string
): Promise<boolean> {
  const db = getAdminFirestore();
  const keyRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("projects")
    .doc(projectId)
    .collection("apiKeys")
    .doc(keyId);

  const snap = await keyRef.get();
  if (!snap.exists) return false;

  await keyRef.update({
    status: "revoked",
    updatedAt: FieldValue.serverTimestamp(),
  });

  if (actorId) {
    recordAuditLog({
      organizationId: orgId,
      actorId,
      action: "api_key.revoke",
      resourceType: "api_key",
      resourceId: keyId,
      details: { projectId },
    }).catch((err) => console.error("[OsterdOps Audit Log] Error logging key revocation:", err));
  }

  return true;
}

export interface VerifiedGatewayKeyContext {
  key: ApiKey;
  project: Project;
  organization: Organization;
}

/**
 * Gateway Resolver: Authenticates a raw OsterdOps Bearer API key in constant time.
 * Resolves the parent Project and Organization documents.
 */
export async function verifyGatewayApiKey(
  rawSecret: string
): Promise<VerifiedGatewayKeyContext | null> {
  if (!isValidApiKeyFormat(rawSecret)) {
    return null;
  }

  const computedHash = hashApiKey(rawSecret);
  const db = getAdminFirestore();

  // Query across collectionGroup('apiKeys') by keyHash
  const querySnap = await db
    .collectionGroup("apiKeys")
    .where("keyHash", "==", computedHash)
    .where("status", "==", "active")
    .limit(1)
    .get();

  if (querySnap.empty) {
    return null;
  }

  const keyDoc = querySnap.docs[0];
  const keyData = keyDoc.data() as ApiKey;

  // Constant-time comparison check
  if (!timingSafeHashMatch(keyData.keyHash, computedHash)) {
    return null;
  }

  // Verify parent project
  const projectRef = keyDoc.ref.parent.parent;
  if (!projectRef) return null;

  const projectSnap = await projectRef.get();
  if (!projectSnap.exists) return null;

  const project = { id: projectSnap.id, ...projectSnap.data() } as Project;
  if (project.status !== "active") return null;

  // Verify parent organization
  const orgRef = projectRef.parent.parent;
  if (!orgRef) return null;

  const orgSnap = await orgRef.get();
  if (!orgSnap.exists) return null;

  const organization = { id: orgSnap.id, ...orgSnap.data() } as Organization;
  if (organization.status !== "active") return null;

  // Update lastUsedAt asynchronously without blocking
  keyDoc.ref
    .update({ lastUsedAt: FieldValue.serverTimestamp() })
    .catch((err) => console.error("[OsterdOps Gateway] Failed to update key lastUsedAt:", err));

  return {
    key: { ...keyData, id: keyDoc.id },
    project,
    organization,
  };
}
