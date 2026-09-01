/**
 * /api/v1/projects/[projectId]/api-keys
 * POST: Issues a new API key for the project (Requires ADMIN or OWNER). Secret returned ONCE.
 * GET: Lists all API keys for the project (Requires VIEWER). Plaintext secrets are never returned.
 */

import { requireAuth } from "@/lib/auth/server";
import { requireOrganizationMember } from "@/lib/auth/rbac";
import { findProjectInAllowedOrgs } from "@/lib/services/project.service";
import {
  createProjectApiKey,
  listProjectApiKeys,
} from "@/lib/services/api-key.service";
import { getUserOrganizations } from "@/lib/services/organization.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import type { ApiKeyEnvironment } from "@/types";

interface Params {
  params: Promise<{ projectId: string }>;
}

const VALID_ENVIRONMENTS: ApiKeyEnvironment[] = ["production", "staging", "development"];

export async function POST(request: Request, context: Params) {
  const { projectId } = await context.params;

  const authResult = await requireAuth(request);
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const { user } = authResult;
  const userOrgs = await getUserOrganizations(user.uid);
  const allowedOrgIds = userOrgs.map((o) => o.organization.id);

  const found = await findProjectInAllowedOrgs(projectId, allowedOrgIds);
  if (!found) {
    return ApiErrors.notFound(`Project '${projectId}' not found.`);
  }

  // Enforce ADMIN or OWNER role in the project's parent organization
  const orgAuth = await requireOrganizationMember(request, found.orgId, "ADMIN");
  if (orgAuth.errorResponse) {
    return orgAuth.errorResponse;
  }

  try {
    const body = await request.json();

    if (!body || typeof body.name !== "string" || !body.name.trim()) {
      return ApiErrors.badRequest("API key name is required.");
    }

    if (body.name.trim().length > 100) {
      return ApiErrors.badRequest("API key name must not exceed 100 characters.");
    }

    const environment = (body.environment || "production") as ApiKeyEnvironment;
    if (!VALID_ENVIRONMENTS.includes(environment)) {
      return ApiErrors.badRequest(`Invalid environment. Must be one of: ${VALID_ENVIRONMENTS.join(", ")}`);
    }

    const result = await createProjectApiKey(found.orgId, projectId, user.uid, {
      name: body.name.trim(),
      environment,
      expiresAt: typeof body.expiresAt === "string" ? body.expiresAt : undefined,
    });

    // Response contains the plaintext secret EXACTLY ONCE
    return apiSuccess(
      {
        id: result.key.id,
        name: result.key.name,
        keyPrefix: result.key.keyPrefix,
        secret: result.secret,
        projectId,
        createdAt: result.key.createdAt,
      },
      undefined,
      201
    );
  } catch (err) {
    console.error("[OsterdOps Keys API] Failed to issue API key:", err);
    return ApiErrors.internalError("Failed to issue API key.");
  }
}

export async function GET(request: Request, context: Params) {
  const { projectId } = await context.params;

  const authResult = await requireAuth(request);
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const { user } = authResult;
  const userOrgs = await getUserOrganizations(user.uid);
  const allowedOrgIds = userOrgs.map((o) => o.organization.id);

  const found = await findProjectInAllowedOrgs(projectId, allowedOrgIds);
  if (!found) {
    return ApiErrors.notFound(`Project '${projectId}' not found.`);
  }

  // Enforce member access (VIEWER or higher)
  const orgAuth = await requireOrganizationMember(request, found.orgId, "VIEWER");
  if (orgAuth.errorResponse) {
    return orgAuth.errorResponse;
  }

  const keys = await listProjectApiKeys(found.orgId, projectId);
  return apiSuccess(keys);
}
