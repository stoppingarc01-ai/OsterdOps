/**
 * /api/v1/api-keys
 * GET: Lists all API keys across caller's organization with cursor-based pagination (Requires keys:read)
 * POST: Creates a new API key with single-reveal secret and fine-grained scopes (Requires keys:manage)
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/server";
import { requireOrganizationMember } from "@/lib/auth/rbac";
import { getUserOrganizations } from "@/lib/services/organization.service";
import {
  createProjectApiKey,
  listOrganizationApiKeys,
} from "@/lib/services/api-key.service";
import { listProjects } from "@/lib/services/project.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import { extractOrGenerateRequestId } from "@/lib/observability/request-context";
import { paginateArray } from "@/lib/api/pagination";
import {
  extractIdempotencyKey,
  checkIdempotency,
  saveIdempotencyResult,
} from "@/lib/api/idempotency";

export async function GET(request: NextRequest) {
  const requestId = extractOrGenerateRequestId(request.headers);
  const authResult = await requireAuth(request);
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const { user } = authResult;
  const userOrgs = await getUserOrganizations(user.uid);
  if (userOrgs.length === 0) {
    return ApiErrors.forbidden("User is not a member of any organization.", undefined, requestId);
  }

  const searchParams = request.nextUrl.searchParams;
  const orgId = searchParams.get("organizationId") || userOrgs[0].organization.id;

  const orgAuth = await requireOrganizationMember(request, orgId, "VIEWER");
  if (orgAuth.errorResponse) {
    return orgAuth.errorResponse;
  }

  const allKeys = await listOrganizationApiKeys(orgId);

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
    const body = await request.json();
    if (!body || typeof body.name !== "string" || !body.name.trim()) {
      return ApiErrors.badRequest("API key name is required.", undefined, requestId);
    }

    const userOrgs = await getUserOrganizations(user.uid);
    if (userOrgs.length === 0) {
      return ApiErrors.forbidden("User is not a member of any organization.", undefined, requestId);
    }

    const orgId = typeof body.organizationId === "string" && body.organizationId.trim()
      ? body.organizationId.trim()
      : userOrgs[0].organization.id;

    // RBAC check: Must be ADMIN or OWNER to create keys
    const orgAuth = await requireOrganizationMember(request, orgId, "ADMIN");
    if (orgAuth.errorResponse) {
      return orgAuth.errorResponse;
    }

    // Resolve or default project
    let projectId = typeof body.projectId === "string" ? body.projectId.trim() : "";
    if (!projectId) {
      const projects = await listProjects(orgId);
      if (projects.length === 0) {
        return ApiErrors.badRequest("No projects exist in organization. Create a project first.", undefined, requestId);
      }
      projectId = projects[0].id;
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

    const keyResult = await createProjectApiKey(orgId, projectId, user.uid, {
      name: body.name.trim(),
      environment: body.environment || "production",
      expiresAt: body.expiresAt,
      scopes: Array.isArray(body.scopes) ? body.scopes : undefined,
    });

    if (idempotencyKey) {
      await saveIdempotencyResult(orgId, "/api/v1/api-keys", idempotencyKey, 201, keyResult);
    }

    return apiSuccess(keyResult, { status: 201, requestId });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create API key.";
    return ApiErrors.internalError(msg, undefined, requestId);
  }
}
