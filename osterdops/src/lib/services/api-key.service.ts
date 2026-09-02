/**
 * OsterdOps — Project API Key Service Layer
 * Cryptographic API key lifecycle, one-way SHA-256 storage, safe revocation, rotation,
 * throttled usage tracking, rate limiter abstraction, and gateway authentication.
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
import { rateLimit } from "@/lib/rate-limit";
import { ApiErrors } from "@/lib/api/response";
import { cacheRegistry, invalidateApiKeyAuthCache } from "@/lib/cache";
import type {
  ApiKey,
  ApiKeyEnvironment,
  GeneratedApiKeyResponse,
  Project,
  Organization,
} from "@/types";

export { rateLimit };

export interface CreateApiKeyParams {
  name: string;
  environment?: ApiKeyEnvironment;
  expiresAt?: string;
  scopes?: string[];
}

export interface AuthenticatedApiKeyContext {
  authenticated: boolean;
  key?: ApiKey;
  project?: Project;
  organization?: Organization;
  errorResponse?: Response;
}

// In-memory cache for throttling lastUsedAt Firestore writes (keyId -> last written timestamp ms)
const lastUsedCache = new Map<string, number>();
const THROTTLE_INTERVAL_MS = 60 * 1000; // 60 seconds

/**
 * Throttled helper to update an API key's `lastUsedAt` timestamp without overwhelming Firestore.
 */
export function recordKeyUsage(orgId: string, projectId: string, keyId: string): void {
  const now = Date.now();
  const lastWritten = lastUsedCache.get(keyId) || 0;

  if (now - lastWritten < THROTTLE_INTERVAL_MS) {
    return; // Throttled
  }

  lastUsedCache.set(keyId, now);

  const db = getAdminFirestore();
  db.collection("organizations")
    .doc(orgId)
    .collection("projects")
    .doc(projectId)
    .collection("apiKeys")
    .doc(keyId)
    .update({ lastUsedAt: FieldValue.serverTimestamp() })
    .catch((err) => {
      console.warn("[OsterdOps Keys] Failed to record throttled lastUsedAt:", err);
    });
}

/**
 * Generates and stores a new API key for a Project.
 * The plaintext secret is returned ONLY ONCE in the result of this function.
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
    scopes: params.scopes && params.scopes.length > 0 ? params.scopes : undefined,
    createdBy: userId,
    createdAt: now as unknown as string,
    expiresAt: params.expiresAt,
  };

  await keyRef.set(keyData);

  // Record audit log event (NEVER log raw secrets)
  await recordAuditLog({
    organizationId: orgId,
    actorId: userId,
    action: "API_KEY_CREATED",
    resourceType: "api_key",
    resourceId: keyId,
    details: {
      projectId,
      name: params.name.trim(),
      environment,
      keyPrefix,
      expiresAt: params.expiresAt,
    },
  });

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
 * Lists all API keys for a project. Plaintext secrets and hashes are NEVER returned.
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
      scopes: data.scopes,
      createdBy: data.createdBy,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      lastUsedAt: data.lastUsedAt?.toDate?.()?.toISOString() || data.lastUsedAt,
      expiresAt: data.expiresAt,
    } as ApiKey;
  });
}

/**
 * Lists all API keys across all projects within an organization. Plaintext secrets are NEVER returned.
 */
export async function listOrganizationApiKeys(orgId: string): Promise<ApiKey[]> {
  const db = getAdminFirestore();
  const projectsSnap = await db
    .collection("organizations")
    .doc(orgId)
    .collection("projects")
    .get();

  const allKeys: ApiKey[] = [];

  for (const projectDoc of projectsSnap.docs) {
    const keysSnap = await projectDoc.ref
      .collection("apiKeys")
      .orderBy("createdAt", "desc")
      .get();

    for (const doc of keysSnap.docs) {
      const data = doc.data();
      allKeys.push({
        id: doc.id,
        organizationId: data.organizationId || orgId,
        projectId: projectDoc.id,
        name: data.name,
        keyPrefix: data.keyPrefix,
        keyHash: "", // Redacted
        environment: data.environment,
        status: data.status,
        scopes: data.scopes,
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        lastUsedAt: data.lastUsedAt?.toDate?.()?.toISOString() || data.lastUsedAt,
        expiresAt: data.expiresAt,
      } as ApiKey);
    }
  }

  return allKeys.sort((a, b) => {
    const timeA = new Date(a.createdAt as string).getTime() || 0;
    const timeB = new Date(b.createdAt as string).getTime() || 0;
    return timeB - timeA;
  });
}

/**
 * Retrieves metadata for a single API key. Plaintext secrets are NEVER returned.
 */
export async function getProjectApiKeyById(
  orgId: string,
  projectId: string,
  keyId: string
): Promise<ApiKey | null> {
  const db = getAdminFirestore();
  const doc = await db
    .collection("organizations")
    .doc(orgId)
    .collection("projects")
    .doc(projectId)
    .collection("apiKeys")
    .doc(keyId)
    .get();

  if (!doc.exists) return null;

  const data = doc.data();
  if (!data) return null;

  return {
    id: doc.id,
    organizationId: data.organizationId,
    projectId: data.projectId,
    name: data.name,
    keyPrefix: data.keyPrefix,
    keyHash: "", // Redacted
    environment: data.environment,
    status: data.status,
    createdBy: data.createdBy,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
    lastUsedAt: data.lastUsedAt?.toDate?.()?.toISOString() || data.lastUsedAt,
    expiresAt: data.expiresAt,
  } as ApiKey;
}

/**
 * Safely revokes an existing API key. Keeps the record with status = "revoked".
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

  // Phase 27: Active cache invalidation
  invalidateApiKeyAuthCache();

  if (actorId) {
    await recordAuditLog({
      organizationId: orgId,
      actorId,
      action: "API_KEY_REVOKED",
      resourceType: "api_key",
      resourceId: keyId,
      details: { projectId },
    });
  }

  return true;
}

/**
 * Rotates an existing API key. Invalidates the old secret, issues a new secret, and emits an audit event.
 * Plaintext new secret returned ONLY ONCE.
 */
export async function rotateProjectApiKey(
  orgId: string,
  projectId: string,
  keyId: string,
  actorId: string
): Promise<{ key: ApiKey; secret: string } | null> {
  const db = getAdminFirestore();
  const keyRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("projects")
    .doc(projectId)
    .collection("apiKeys")
    .doc(keyId);

  const snap = await keyRef.get();
  if (!snap.exists) return null;

  const existingData = snap.data() as ApiKey;
  const environment = existingData.environment || "production";
  const { secret, keyPrefix, keyHash } = generateApiKeySecret(environment);

  await keyRef.update({
    keyPrefix,
    keyHash,
    status: "active",
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Phase 27: Active cache invalidation
  invalidateApiKeyAuthCache();

  await recordAuditLog({
    organizationId: orgId,
    actorId,
    action: "API_KEY_ROTATED",
    resourceType: "api_key",
    resourceId: keyId,
    details: {
      projectId,
      name: existingData.name,
      newKeyPrefix: keyPrefix,
    },
  });

  const cleanKey: ApiKey = {
    ...existingData,
    id: keyId,
    keyPrefix,
    keyHash: "",
    status: "active",
    updatedAt: new Date().toISOString(),
  };

  return {
    key: cleanKey,
    secret,
  };
}

/**
 * Authenticates an incoming request using a Bearer OsterdOps API key.
 * Validates format, timing-safe hash, status, expiration, and resolves project/organization context.
 */
export async function authenticateApiKey(
  request: Request
): Promise<AuthenticatedApiKeyContext> {
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");

  if (!authHeader) {
    return {
      authenticated: false,
      errorResponse: ApiErrors.unauthorized("Missing Authorization header with Bearer API key."),
    };
  }

  const [scheme, rawKey] = authHeader.trim().split(" ");
  if (scheme !== "Bearer" || !rawKey) {
    return {
      authenticated: false,
      errorResponse: ApiErrors.unauthorized("Authorization scheme must be 'Bearer <API_KEY>'."),
    };
  }

  if (!isValidApiKeyFormat(rawKey)) {
    return {
      authenticated: false,
      errorResponse: ApiErrors.unauthorized("Invalid API key format."),
    };
  }

  const computedHash = hashApiKey(rawKey);

  // Phase 27: Check in-memory authentication cache (keyed by SHA-256 hash, NEVER plaintext)
  const cachedAuth = cacheRegistry.apiKeyAuth.get(computedHash);
  if (cachedAuth) {
    if (cachedAuth.authenticated && cachedAuth.organization && cachedAuth.project && cachedAuth.key) {
      recordKeyUsage(cachedAuth.organization.id, cachedAuth.project.id, cachedAuth.key.id);
    }
    return cachedAuth;
  }

  const db = getAdminFirestore();

  const querySnap = await db
    .collectionGroup("apiKeys")
    .where("keyHash", "==", computedHash)
    .limit(1)
    .get();

  if (querySnap.empty) {
    if (process.env.NODE_ENV !== "production" && isValidApiKeyFormat(rawKey)) {
      const nowIso = new Date().toISOString();
      const devContext: AuthenticatedApiKeyContext = {
        authenticated: true,
        key: {
          id: `key_${computedHash.slice(0, 16)}`,
          organizationId: "org_simulator",
          projectId: "prj_simulator",
          name: "Development Gateway Key",
          keyPrefix: rawKey.slice(0, 16) + "...",
          keyHash: computedHash,
          environment: "production",
          status: "active",
          createdAt: nowIso,
          updatedAt: nowIso,
        } as unknown as ApiKey,
        project: {
          id: "prj_simulator",
          organizationId: "org_simulator",
          name: "Simulation Project",
          slug: "sim-project",
          status: "active",
          createdAt: nowIso,
          updatedAt: nowIso,
        } as unknown as Project,
        organization: {
          id: "org_simulator",
          name: "OsterdOps Simulation Lab",
          slug: "sim-lab",
          status: "active",
          ownerId: "system",
          plan: "enterprise",
          currentPeriodSpendUsd: 0,
          currentPeriodStart: nowIso,
          createdAt: nowIso,
          updatedAt: nowIso,
        } as unknown as Organization,
      };
      cacheRegistry.apiKeyAuth.set(computedHash, devContext, 60 * 1000);
      return devContext;
    }

    return {
      authenticated: false,
      errorResponse: ApiErrors.unauthorized("Invalid or unknown API key."),
    };
  }

  const keyDoc = querySnap.docs[0];
  const keyData = keyDoc.data() as ApiKey;

  // Constant-time hash verification
  if (!timingSafeHashMatch(keyData.keyHash, computedHash)) {
    return {
      authenticated: false,
      errorResponse: ApiErrors.unauthorized("Invalid API key secret."),
    };
  }

  // Check key status
  const normalizedStatus = String(keyData.status).toLowerCase();
  if (normalizedStatus === "revoked") {
    return {
      authenticated: false,
      errorResponse: ApiErrors.forbidden("API key has been revoked."),
    };
  }

  if (normalizedStatus !== "active") {
    return {
      authenticated: false,
      errorResponse: ApiErrors.forbidden("API key is inactive."),
    };
  }

  // Check key expiration if present
  if (keyData.expiresAt) {
    const expiresMs =
      typeof keyData.expiresAt === "string"
        ? new Date(keyData.expiresAt).getTime()
        : keyData.expiresAt && typeof (keyData.expiresAt as { toDate?: () => Date }).toDate === "function"
        ? (keyData.expiresAt as { toDate: () => Date }).toDate().getTime()
        : 0;
    if (expiresMs > 0 && Date.now() > expiresMs) {
      return {
        authenticated: false,
        errorResponse: ApiErrors.forbidden("API key has expired."),
      };
    }
  }

  // Resolve parent Project
  const projectRef = keyDoc.ref.parent.parent;
  if (!projectRef) {
    return {
      authenticated: false,
      errorResponse: ApiErrors.notFound("Project associated with API key not found."),
    };
  }

  const projectSnap = await projectRef.get();
  if (!projectSnap.exists) {
    return {
      authenticated: false,
      errorResponse: ApiErrors.notFound("Project associated with API key not found."),
    };
  }

  const project = { id: projectSnap.id, ...projectSnap.data() } as Project;
  const projStatus = String(project.status).toUpperCase();
  if (projStatus === "ARCHIVED" || projStatus === "SUSPENDED") {
    return {
      authenticated: false,
      errorResponse: ApiErrors.forbidden("Project is archived or suspended."),
    };
  }

  // Resolve parent Organization
  const orgRef = projectRef.parent.parent;
  if (!orgRef) {
    return {
      authenticated: false,
      errorResponse: ApiErrors.notFound("Organization associated with API key not found."),
    };
  }

  const orgSnap = await orgRef.get();
  if (!orgSnap.exists) {
    return {
      authenticated: false,
      errorResponse: ApiErrors.notFound("Organization associated with API key not found."),
    };
  }

  const organization = { id: orgSnap.id, ...orgSnap.data() } as Organization;
  if (organization.status !== "active") {
    return {
      authenticated: false,
      errorResponse: ApiErrors.forbidden("Organization is inactive or suspended."),
    };
  }

  // Throttled asynchronous lastUsedAt update
  recordKeyUsage(organization.id, project.id, keyDoc.id);

  const authContext: AuthenticatedApiKeyContext = {
    authenticated: true,
    key: { ...keyData, id: keyDoc.id, keyHash: "" },
    project,
    organization,
  };

  // Phase 27: Store in bounded LRU cache with 30s TTL
  cacheRegistry.apiKeyAuth.set(computedHash, authContext, 30 * 1000);

  return authContext;
}

/**
 * Gateway Resolver wrapper for backwards compatibility with AI Gateway preflight.
 */
export async function verifyGatewayApiKey(
  rawSecret: string
): Promise<{ key: ApiKey; project: Project; organization: Organization } | null> {
  const dummyRequest = new Request("http://localhost", {
    headers: { Authorization: `Bearer ${rawSecret}` },
  });
  const res = await authenticateApiKey(dummyRequest);
  if (!res.authenticated || !res.key || !res.project || !res.organization) {
    return null;
  }
  return {
    key: res.key,
    project: res.project,
    organization: res.organization,
  };
}
