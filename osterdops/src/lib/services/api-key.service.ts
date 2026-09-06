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
import { getOrganizationById } from "./organization.service";
import type {
  ApiKey,
  ApiKeyEnvironment,
  GeneratedApiKeyResponse,
  Project,
  Organization,
} from "@/types";

export { rateLimit };

export interface CreateApiKeyParams {
  name?: string;
  environment?: ApiKeyEnvironment;
  expiresAt?: string;
  scopes?: string[];
  permissions?: string[];
  rateLimit?: number;
}

export interface AuthenticatedApiKeyContext {
  authenticated: boolean;
  key?: ApiKey;
  project?: Project;
  organization?: Organization;
  errorResponse?: Response;
}

// In-memory key registry for simulation, local dev, and testing
export const simulatedApiKeys = new Map<string, ApiKey & { keyHash: string }>();

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

  // Collision Guard: Query by keyHash before writing to DB
  // Guaranteed 256-bit entropy space, plus collision loop verification
  let secret = "";
  let rawKey = "";
  let keyHash = "";
  let keyPrefix = "";
  let displayPrefix = "";

  const MAX_COLLISION_RETRIES = 5;
  for (let attempt = 0; attempt < MAX_COLLISION_RETRIES; attempt++) {
    const gen = generateApiKeySecret(environment);

    // 1. Collision check: in-memory store
    let inMemoryCollision = false;
    for (const stored of simulatedApiKeys.values()) {
      if (stored.keyHash === gen.keyHash) {
        inMemoryCollision = true;
        break;
      }
    }
    if (inMemoryCollision) {
      console.warn(`[OsterdOps Keys] In-memory collision detected on attempt ${attempt + 1}. Regenerating.`);
      continue;
    }

    // 2. Collision check: Firestore collectionGroup
    try {
      const collisionSnap = await db
        .collectionGroup("apiKeys")
        .where("keyHash", "==", gen.keyHash)
        .limit(1)
        .get();

      if (!collisionSnap.empty) {
        console.warn(`[OsterdOps Keys] Database keyHash collision detected on attempt ${attempt + 1}. Regenerating.`);
        continue;
      }
    } catch {
      // In dev or offline mode, candidate with 256-bit entropy accepted
    }

    secret = gen.secret;
    rawKey = gen.rawKey;
    keyHash = gen.keyHash;
    keyPrefix = gen.keyPrefix;
    displayPrefix = gen.displayPrefix;
    break;
  }

  if (!rawKey) {
    throw new Error("Failed to generate unique cryptographic API key after maximum collision attempts.");
  }

  const keyRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("projects")
    .doc(projectId)
    .collection("apiKeys")
    .doc();

  const keyId = keyRef.id;
  const now = FieldValue.serverTimestamp();
  const finalName = params.name && params.name.trim()
    ? params.name.trim()
    : `Default Production Key - ${Date.now()}`;

  const resolvedScopes = params.scopes && params.scopes.length > 0
    ? params.scopes
    : (params.permissions && params.permissions.length > 0 ? params.permissions : ["usage:ingest", "models:read"]);

  const keyData: Omit<ApiKey, "id"> = {
    organizationId: orgId,
    orgId,
    projectId,
    name: finalName,
    keyPrefix,
    prefix: displayPrefix,
    keyHash,
    environment,
    status: "active",
    scopes: resolvedScopes,
    permissions: params.permissions || resolvedScopes,
    rateLimit: params.rateLimit,
    createdBy: userId,
    createdAt: now as unknown as string,
    expiresAt: params.expiresAt,
  };

  try {
    await keyRef.set(keyData);
  } catch (err) {
    console.warn("[OsterdOps Keys] Firestore write error, saving to memory fallback:", err);
  }

  const cleanKey: ApiKey = {
    id: keyId,
    ...keyData,
    createdAt: new Date().toISOString(),
  };

  // Register in memory store for simulation and collision checking
  simulatedApiKeys.set(keyId, { ...cleanKey, keyHash });

  // Record audit log event (NEVER log raw secrets)
  try {
    await recordAuditLog({
      organizationId: orgId,
      actorId: userId,
      action: "API_KEY_CREATED",
      resourceType: "api_key",
      resourceId: keyId,
      details: {
        projectId,
        name: finalName,
        environment,
        prefix: displayPrefix,
        keyPrefix,
        expiresAt: params.expiresAt,
      },
    });
  } catch {}

  return {
    key: cleanKey,
    secret: rawKey, // Returned ONLY ONCE
    rawKey,
    prefix: displayPrefix,
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
  const keys: ApiKey[] = [];

  try {
    const snap = await db
      .collection("organizations")
      .doc(orgId)
      .collection("projects")
      .doc(projectId)
      .collection("apiKeys")
      .orderBy("createdAt", "desc")
      .get();

    for (const doc of snap.docs) {
      const data = doc.data();
      const displayPrefix = data.prefix || data.keyPrefix || "ost_live_••••";
      keys.push({
        id: doc.id,
        organizationId: data.organizationId || orgId,
        orgId: data.orgId || data.organizationId || orgId,
        projectId: data.projectId || projectId,
        name: data.name,
        keyPrefix: data.keyPrefix || displayPrefix,
        prefix: displayPrefix,
        keyHash: "", // Redacted from listing
        environment: data.environment,
        status: data.status,
        scopes: data.scopes,
        permissions: data.permissions || data.scopes,
        rateLimit: data.rateLimit,
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        lastUsedAt: data.lastUsedAt?.toDate?.()?.toISOString() || data.lastUsedAt,
        expiresAt: data.expiresAt,
      } as ApiKey);
    }
  } catch (err) {
    console.warn("[OsterdOps Keys] Firestore list error, using simulated registry:", err);
  }

  // Merge in-memory simulated keys for project
  for (const memKey of simulatedApiKeys.values()) {
    if (
      (memKey.organizationId === orgId || memKey.orgId === orgId) &&
      memKey.projectId === projectId &&
      !keys.some((k) => k.id === memKey.id)
    ) {
      keys.push({
        ...memKey,
        keyHash: "", // Redacted
        prefix: memKey.prefix || memKey.keyPrefix,
      });
    }
  }

  return keys.sort((a, b) => {
    const timeA = new Date(a.createdAt as string).getTime() || 0;
    const timeB = new Date(b.createdAt as string).getTime() || 0;
    return timeB - timeA;
  });
}

/**
 * Lists all API keys across all projects within an organization. Plaintext secrets are NEVER returned.
 */
export async function listOrganizationApiKeys(orgId: string): Promise<ApiKey[]> {
  const db = getAdminFirestore();
  const allKeys: ApiKey[] = [];

  try {
    const projectsSnap = await db
      .collection("organizations")
      .doc(orgId)
      .collection("projects")
      .get();

    for (const projectDoc of projectsSnap.docs) {
      const keysSnap = await projectDoc.ref
        .collection("apiKeys")
        .orderBy("createdAt", "desc")
        .get();

      for (const doc of keysSnap.docs) {
        const data = doc.data();
        const displayPrefix = data.prefix || data.keyPrefix || "ost_live_••••";
        allKeys.push({
          id: doc.id,
          organizationId: data.organizationId || orgId,
          orgId: data.orgId || data.organizationId || orgId,
          projectId: projectDoc.id,
          name: data.name,
          keyPrefix: data.keyPrefix || displayPrefix,
          prefix: displayPrefix,
          keyHash: "", // Redacted
          environment: data.environment,
          status: data.status,
          scopes: data.scopes,
          permissions: data.permissions || data.scopes,
          rateLimit: data.rateLimit,
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          lastUsedAt: data.lastUsedAt?.toDate?.()?.toISOString() || data.lastUsedAt,
          expiresAt: data.expiresAt,
        } as ApiKey);
      }
    }
  } catch (err) {
    console.warn("[OsterdOps Keys] Firestore org list error, using simulated registry:", err);
  }

  // Merge in-memory simulated keys for organization
  for (const memKey of simulatedApiKeys.values()) {
    if (
      (memKey.organizationId === orgId || memKey.orgId === orgId) &&
      !allKeys.some((k) => k.id === memKey.id)
    ) {
      allKeys.push({
        ...memKey,
        keyHash: "", // Redacted
        prefix: memKey.prefix || memKey.keyPrefix,
      });
    }
  }

  return allKeys.sort((a, b) => {
    const timeA = new Date(a.createdAt as string).getTime() || 0;
    const timeB = new Date(b.createdAt as string).getTime() || 0;
    return timeB - timeA;
  });
}

export interface CreateKeyOptions {
  orgId?: string;
  projectId?: string;
  userId?: string;
  name?: string;
  permissions?: string[];
  scopes?: string[];
  rateLimit?: number;
  environment?: ApiKeyEnvironment;
  expiresAt?: string;
}

export interface CreateKeyResult {
  id: string;
  name: string;
  key: string;
  secret: string;
  prefix: string;
  displayPrefix: string;
  createdAt: string;
  keyRecord: ApiKey;
}

/**
 * Unified API key creation method conforming to Principal Security & Backend specifications.
 * Cryptographically secure, collision-proof, with plaintext key returned ONLY ONCE.
 */
export async function createKey(params: CreateKeyOptions): Promise<CreateKeyResult> {
  const orgId = params.orgId || "org_default";
  const projectId = params.projectId || "prj_default";
  const userId = params.userId || "usr_system";

  const defaultName = params.name && params.name.trim()
    ? params.name.trim()
    : `Default Production Key - ${Date.now()}`;

  const res = await createProjectApiKey(orgId, projectId, userId, {
    name: defaultName,
    environment: params.environment || "production",
    permissions: params.permissions,
    scopes: params.scopes || params.permissions,
    rateLimit: params.rateLimit,
    expiresAt: params.expiresAt,
  });

  const displayPrefix = res.key.prefix || res.prefix || res.key.keyPrefix;
  const createdAtStr = typeof res.key.createdAt === "string"
    ? res.key.createdAt
    : new Date().toISOString();

  return {
    id: res.key.id,
    name: res.key.name,
    key: res.secret,
    secret: res.secret,
    prefix: displayPrefix,
    displayPrefix,
    createdAt: createdAtStr,
    keyRecord: res.key,
  };
}

export const createApiKey = createKey;

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
    // Check in-memory simulated keys
    for (const memKey of simulatedApiKeys.values()) {
      if (timingSafeHashMatch(memKey.keyHash, computedHash)) {
        if (memKey.status === "revoked") {
          return {
            authenticated: false,
            errorResponse: ApiErrors.forbidden("API key has been revoked."),
          };
        }
        const nowIso = new Date().toISOString();
        const targetOrgId = memKey.organizationId || memKey.orgId || "org_simulator";
        const realOrg = (await getOrganizationById(targetOrgId)) || {
          id: targetOrgId,
          name: "Organization",
          slug: "org",
          status: "active" as const,
          ownerId: memKey.createdBy || "system",
          plan: "trial" as const,
          planTier: "free",
          currentPeriodSpendUsd: 0,
          currentPeriodStart: nowIso,
          settings: { mfaEnforced: false, ipWhitelist: [], allowedModels: [] },
          createdAt: nowIso,
          updatedAt: nowIso,
        };
        const memContext: AuthenticatedApiKeyContext = {
          authenticated: true,
          key: { ...memKey, keyHash: "" },
          project: {
            id: memKey.projectId,
            organizationId: targetOrgId,
            name: "Project",
            slug: "project",
            status: "active" as const,
            createdAt: nowIso,
            updatedAt: nowIso,
          } as unknown as Project,
          organization: realOrg as Organization,
        };
        cacheRegistry.apiKeyAuth.set(computedHash, memContext, 60 * 1000);
        return memContext;
      }
    }

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

  // Resolve parent Project safely
  const targetOrgId = keyData.organizationId || keyData.orgId || keyDoc.ref.parent?.parent?.parent?.parent?.id || "org_default";
  const targetProjectId = keyData.projectId || keyDoc.ref.parent?.parent?.id || "prj_default";

  let project: Project | null = null;
  const projectRef = keyDoc.ref.parent?.parent;
  if (projectRef) {
    try {
      const projectSnap = await projectRef.get();
      if (projectSnap.exists) {
        project = { id: projectSnap.id, ...projectSnap.data() } as Project;
      }
    } catch {}
  }
  if (!project) {
    project = {
      id: targetProjectId,
      organizationId: targetOrgId,
      name: "Default Project",
      slug: "default",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Project;
  }

  const projStatus = String(project.status).toUpperCase();
  if (projStatus === "ARCHIVED" || projStatus === "SUSPENDED") {
    return {
      authenticated: false,
      errorResponse: ApiErrors.forbidden("Project is archived or suspended."),
    };
  }

  // Resolve parent Organization safely
  let organization: Organization | null = null;
  const orgRef = keyDoc.ref.parent?.parent?.parent?.parent;
  if (orgRef) {
    try {
      const orgSnap = await orgRef.get();
      if (orgSnap.exists) {
        organization = { id: orgSnap.id, ...orgSnap.data() } as Organization;
      }
    } catch {}
  }
  if (!organization) {
    organization = await getOrganizationById(targetOrgId);
  }
  if (!organization) {
    organization = {
      id: targetOrgId,
      name: "Organization",
      slug: "org",
      status: "active" as const,
      ownerId: "system",
      plan: "trial" as const,
      planTier: "free",
      currentPeriodSpendUsd: 0,
      currentPeriodStart: new Date().toISOString(),
      settings: { mfaEnforced: false, ipWhitelist: [], allowedModels: [] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  if (organization.status === "suspended") {
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
