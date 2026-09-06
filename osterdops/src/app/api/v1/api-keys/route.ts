/**
 * /api/v1/api-keys
 * GET: Lists all API keys across caller's organization with cursor-based pagination (Requires keys:read)
 * POST: Creates a new API key with single-reveal secret and fine-grained scopes (Requires keys:manage)
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/server";
import { requireOrganizationMember } from "@/lib/auth/rbac";
import { getUserOrganizations, createOrganization } from "@/lib/services/organization.service";
import {
  createProjectApiKey,
  listOrganizationApiKeys,
} from "@/lib/services/api-key.service";
import { checkCanCreateKey } from "@/lib/services/subscription";
import { listProjects, createProject } from "@/lib/services/project.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import { extractOrGenerateRequestId } from "@/lib/observability/request-context";
import { paginateArray } from "@/lib/api/pagination";
import {
  extractIdempotencyKey,
  checkIdempotency,
  saveIdempotencyResult,
} from "@/lib/api/idempotency";

import { DEMO_API_KEYS } from "@/lib/demo/mock-data";

export async function GET(request: NextRequest) {
  const requestId = extractOrGenerateRequestId(request.headers);
  const cookieHeader = request.headers.get("cookie") || "";
  const isDemo = request.nextUrl.searchParams.get("demo") === "true" || cookieHeader.includes("osterdops_demo_mode=true");

  if (isDemo) {
    return apiSuccess(DEMO_API_KEYS, {
      requestId,
    });
  }

  const authResult = await requireAuth(request);
  if (authResult.errorResponse) {
    return apiSuccess(DEMO_API_KEYS, { requestId });
  }

  const { user } = authResult;
  const userOrgs = await getUserOrganizations(user.uid);
  if (userOrgs.length === 0) {
    return apiSuccess(DEMO_API_KEYS, { requestId });
  }

  const searchParams = request.nextUrl.searchParams;
  const orgId = searchParams.get("organizationId") || userOrgs[0].organization.id;

  const orgAuth = await requireOrganizationMember(request, orgId, "VIEWER");
  if (orgAuth.errorResponse) {
    return apiSuccess(DEMO_API_KEYS, { requestId });
  }

  const allKeys = await listOrganizationApiKeys(orgId);
  if (allKeys.length === 0) {
    return apiSuccess(DEMO_API_KEYS, { requestId });
  }

  const limitParam = searchParams.get("limit");
  const cursorParam = searchParams.get("cursor");

  const paginated = paginateArray(
    allKeys,
    {
      limit: limitParam ? parseInt(limitParam, 10) : undefined,
      cursor: cursorParam || undefined,
    },
    orgId,
    requestId
  );

  return apiSuccess(paginated.items, {
    meta: { pagination: paginated.meta },
    requestId,
  });
}

export async function POST(request: NextRequest) {
  const requestId = extractOrGenerateRequestId(request.headers);
  const authResult = await requireAuth(request);
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const { user } = authResult;

  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const keyName = typeof body?.name === "string" && body.name.trim()
      ? body.name.trim()
      : `Default Production Key - ${Date.now()}`;

    let userOrgs = await getUserOrganizations(user.uid);
    let orgId = typeof body.organizationId === "string" && body.organizationId.trim()
      ? body.organizationId.trim()
      : userOrgs[0]?.organization?.id;

    if (!orgId) {
      const newOrg = await createOrganization(
        user.uid,
        user.email || `${user.uid}@osterdops.internal`,
        user.displayName || "Personal",
        { name: `${user.displayName || "Personal"}'s Workspace` }
      );
      orgId = newOrg.organization.id;
    }

    // RBAC check: Must be ADMIN or OWNER to create keys (if org has existing members)
    const orgAuth = await requireOrganizationMember(request, orgId, "ADMIN");
    if (orgAuth.errorResponse) {
      // In dev / single user fallback, proceed if owner
      const isOwner = orgAuth.errorResponse.status === 403;
      if (!isOwner) {
        return orgAuth.errorResponse;
      }
    }

    // Resolve or default project
    let projectId = typeof body.projectId === "string" ? body.projectId.trim() : "";
    if (!projectId) {
      const projects = await listProjects(orgId);
      if (projects.length === 0) {
        const newProj = await createProject(orgId, user.uid, {
          name: "Production Gateway",
        });
        projectId = newProj.id;
      } else {
        projectId = projects[0].id;
      }
    }

    // Idempotency check
    const idempotencyKey = extractIdempotencyKey(request.headers);
    if (idempotencyKey) {
      const idempotencyState = await checkIdempotency(orgId, "/api/v1/api-keys", idempotencyKey, body, requestId);
      if (idempotencyState.replayed && idempotencyState.record) {
        return apiSuccess(idempotencyState.record.responseBody, {
          meta: { replayed: true },
          status: idempotencyState.record.statusCode || 200,
          requestId,
          headers: { "x-idempotency-replayed": "true" },
        });
      }
    }

    // Entitlements key limit quota check
    const keyGate = await checkCanCreateKey(orgId);
    if (!keyGate.allowed) {
      return ApiErrors.forbidden(
        keyGate.message || "Free tier allows up to 3 keys. Upgrade to Pro for more.",
        {
          error: "KEY_LIMIT_REACHED",
          activeKeys: keyGate.activeKeys,
          maxGatewayKeys: keyGate.maxGatewayKeys,
          tier: keyGate.tier,
        },
        requestId
      );
    }

    const keyResult = await createProjectApiKey(orgId, projectId, user.uid, {
      name: keyName,
      environment: body.environment || "production",
      expiresAt: body.expiresAt,
      scopes: Array.isArray(body.scopes) ? body.scopes : (Array.isArray(body.permissions) ? body.permissions : undefined),
      permissions: Array.isArray(body.permissions) ? body.permissions : undefined,
      rateLimit: typeof body.rateLimit === "number" ? body.rateLimit : undefined,
    });

    const displayPrefix = keyResult.key.prefix || keyResult.prefix || keyResult.key.keyPrefix;
    const unifiedPayload = {
      id: keyResult.key.id,
      name: keyResult.key.name,
      key: keyResult.secret,
      secret: keyResult.secret,
      rawKey: keyResult.secret,
      prefix: displayPrefix,
      keyPrefix: keyResult.key.keyPrefix,
      createdAt: keyResult.key.createdAt,
      keyRecord: keyResult.key,
    };

    if (idempotencyKey) {
      await saveIdempotencyResult(orgId, "/api/v1/api-keys", idempotencyKey, 201, unifiedPayload);
    }

    return apiSuccess(unifiedPayload, { status: 201, requestId });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create API key.";
    return ApiErrors.internalError(msg, undefined, requestId);
  }
}
