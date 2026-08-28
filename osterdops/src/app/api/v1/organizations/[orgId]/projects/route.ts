/**
 * /api/v1/organizations/[orgId]/projects
 * GET: Lists all projects under the organization (Requires VIEWER)
 * POST: Creates a new project (Requires DEVELOPER)
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

  const authResult = await requireOrganizationMember(request, orgId, "DEVELOPER");
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  try {
    const body = await request.json();
    if (!body || typeof body.name !== "string" || !body.name.trim()) {
      return ApiErrors.badRequest("Project name is required.");
    }

    const project = await createProject(orgId, {
      name: body.name.trim(),
      description: typeof body.description === "string" ? body.description.trim() : undefined,
      spendLimitMonthly: typeof body.spendLimitMonthly === "number" ? body.spendLimitMonthly : undefined,
    });

    return apiSuccess(project, undefined, 201);
  } catch (err) {
    console.error("[OsterdOps Projects] Creation failed:", err);
    return ApiErrors.internalError("Failed to create project.");
  }
}
