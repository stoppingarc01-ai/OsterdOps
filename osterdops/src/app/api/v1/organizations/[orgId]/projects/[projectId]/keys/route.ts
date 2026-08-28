/**
 * /api/v1/organizations/[orgId]/projects/[projectId]/keys
 * GET: Lists all API keys for a project with masked prefixes (Requires DEVELOPER)
 * POST: Issues a new API key and returns plaintext secret once (Requires DEVELOPER)
 */

import { requireProjectAccess } from "@/lib/auth/rbac";
import { listProjectApiKeys, createProjectApiKey } from "@/lib/services/api-key.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import type { ApiKeyEnvironment } from "@/types";

interface Params {
  params: Promise<{ orgId: string; projectId: string }>;
}

const VALID_ENVIRONMENTS: ApiKeyEnvironment[] = ["production", "staging", "development"];

export async function GET(request: Request, context: Params) {
  const { orgId, projectId } = await context.params;

  const authResult = await requireProjectAccess(request, orgId, projectId, "DEVELOPER");
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const keys = await listProjectApiKeys(orgId, projectId);
  return apiSuccess(keys);
}

export async function POST(request: Request, context: Params) {
  const { orgId, projectId } = await context.params;

  const authResult = await requireProjectAccess(request, orgId, projectId, "DEVELOPER");
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const { user } = authResult;

  try {
    const body = await request.json();
    if (!body || typeof body.name !== "string" || !body.name.trim()) {
      return ApiErrors.badRequest("API key name / description is required.");
    }

    const environment = (body.environment || "production") as ApiKeyEnvironment;
    if (!VALID_ENVIRONMENTS.includes(environment)) {
      return ApiErrors.badRequest(`Invalid environment. Must be one of: ${VALID_ENVIRONMENTS.join(", ")}`);
    }

    const result = await createProjectApiKey(orgId, projectId, user.uid, {
      name: body.name.trim(),
      environment,
      expiresAt: typeof body.expiresAt === "string" ? body.expiresAt : undefined,
    });

    return apiSuccess(result, undefined, 201);
  } catch (err) {
    console.error("[OsterdOps Keys] API key generation failed:", err);
    return ApiErrors.internalError("Failed to issue API key.");
  }
}
