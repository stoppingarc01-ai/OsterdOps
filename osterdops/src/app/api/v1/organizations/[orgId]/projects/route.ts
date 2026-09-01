/**
 * /api/v1/organizations/[orgId]/projects
 * GET: Lists all projects under the organization (Requires VIEWER)
 * POST: Creates a new project (Requires ADMIN or OWNER)
 */

import { requireOrganizationMember } from "@/lib/auth/rbac";
import { listProjects, createProject } from "@/lib/services/project.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";

interface Params {
  params: Promise<{ orgId: string }>;
}

export async function GET(request: Request, context: Params) {
  const { orgId } = await context.params;

  const authResult = await requireOrganizationMember(request, orgId, "VIEWER");
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const { searchParams } = new URL(request.url);
  const includeArchived = searchParams.get("includeArchived") === "true";

  const projects = await listProjects(orgId, includeArchived);
  return apiSuccess(projects);
}

export async function POST(request: Request, context: Params) {
  const { orgId } = await context.params;

  const authResult = await requireOrganizationMember(request, orgId, "ADMIN");
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const { user } = authResult;

  try {
    const body = await request.json();
    if (!body || typeof body.name !== "string" || !body.name.trim()) {
      return ApiErrors.badRequest("Project name is required.");
    }

    if (body.name.trim().length > 100) {
      return ApiErrors.badRequest("Project name must not exceed 100 characters.");
    }

    const project = await createProject(orgId, user.uid, {
      name: body.name.trim(),
      slug: typeof body.slug === "string" ? body.slug.trim() : undefined,
      description: typeof body.description === "string" ? body.description.trim() : undefined,
      spendLimitMonthly: typeof body.spendLimitMonthly === "number" ? body.spendLimitMonthly : undefined,
    });

    return apiSuccess(project, undefined, 201);
  } catch (err: unknown) {
    const customErr = err as { code?: string; message?: string };
    if (customErr.code === "DUPLICATE_SLUG") {
      return ApiErrors.conflict(customErr.message || "A project with this slug already exists.");
    }

    console.error("[OsterdOps Org Projects] Creation failed:", err);
    return ApiErrors.internalError("Failed to create project.");
  }
}
