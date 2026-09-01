/**
 * /api/v1/projects
 * POST: Creates a new project in caller's organization (Requires ADMIN or OWNER)
 * GET: Lists active projects in caller's organization (Requires VIEWER)
 */

import { requireAuth } from "@/lib/auth/server";
import { requireOrganizationMember } from "@/lib/auth/rbac";
import { createProject, listProjects } from "@/lib/services/project.service";
import { getUserOrganizations } from "@/lib/services/organization.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";

export async function POST(request: Request) {
  const authResult = await requireAuth(request);
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

    // Resolve target organization
    let orgId = typeof body.organizationId === "string" ? body.organizationId.trim() : "";

    if (!orgId) {
      const userOrgs = await getUserOrganizations(user.uid);
      if (userOrgs.length === 0) {
        return ApiErrors.badRequest("You must belong to an organization to create a project.");
      }
      orgId = userOrgs[0].organization.id;
    }

    // Enforce server-side authorization (Must be ADMIN or OWNER in target org)
    const orgAuth = await requireOrganizationMember(request, orgId, "ADMIN");
    if (orgAuth.errorResponse) {
      return orgAuth.errorResponse;
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

    console.error("[OsterdOps Projects API] Create failed:", err);
    return ApiErrors.internalError("Failed to create project.");
  }
}

export async function GET(request: Request) {
  const authResult = await requireAuth(request);
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const { user } = authResult;
  const { searchParams } = new URL(request.url);

  let orgId = searchParams.get("organizationId")?.trim() || "";
  const includeArchived = searchParams.get("includeArchived") === "true";

  if (!orgId) {
    const userOrgs = await getUserOrganizations(user.uid);
    if (userOrgs.length === 0) {
      return apiSuccess([]);
    }
    orgId = userOrgs[0].organization.id;
  }

  // Enforce server-side authorization (Must be member of target org)
  const orgAuth = await requireOrganizationMember(request, orgId, "VIEWER");
  if (orgAuth.errorResponse) {
    return orgAuth.errorResponse;
  }

  const projects = await listProjects(orgId, includeArchived);
  return apiSuccess(projects);
}
