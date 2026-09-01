/**
 * /api/v1/projects/[projectId]
 * GET: Retrieves project details (Requires VIEWER in parent organization)
 * PATCH: Updates project details (Requires ADMIN or OWNER)
 * DELETE: Safely archives project (Requires ADMIN or OWNER)
 */

import { requireAuth } from "@/lib/auth/server";
import { requireOrganizationMember } from "@/lib/auth/rbac";
import {
  findProjectInAllowedOrgs,
  updateProject,
  archiveProject,
} from "@/lib/services/project.service";
import { getUserOrganizations } from "@/lib/services/organization.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import type { ProjectStatus } from "@/types";

interface Params {
  params: Promise<{ projectId: string }>;
}

const VALID_STATUSES: ProjectStatus[] = ["ACTIVE", "ARCHIVED", "active", "archived"];

export async function GET(request: Request, context: Params) {
  const { projectId } = await context.params;

  const authResult = await requireAuth(request);
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const { user } = authResult;
  const userOrgs = await getUserOrganizations(user.uid);
  const allowedOrgIds = userOrgs.map((o) => o.organization.id);

  if (allowedOrgIds.length === 0) {
    return ApiErrors.notFound(`Project '${projectId}' not found.`);
  }

  const found = await findProjectInAllowedOrgs(projectId, allowedOrgIds);
  if (!found) {
    return ApiErrors.notFound(`Project '${projectId}' not found.`);
  }

  // Caller is already verified as member of found.orgId
  return apiSuccess(found.project);
}

export async function PATCH(request: Request, context: Params) {
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

  // Enforce ADMIN or OWNER role in project's parent organization
  const orgAuth = await requireOrganizationMember(request, found.orgId, "ADMIN");
  if (orgAuth.errorResponse) {
    return orgAuth.errorResponse;
  }

  try {
    const body = await request.json();

    if (body.name !== undefined && (typeof body.name !== "string" || !body.name.trim())) {
      return ApiErrors.badRequest("Project name cannot be empty.");
    }

    if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
      return ApiErrors.badRequest(`Invalid status. Must be one of: ACTIVE, ARCHIVED`);
    }

    const updated = await updateProject(found.orgId, projectId, user.uid, {
      name: typeof body.name === "string" ? body.name.trim() : undefined,
      slug: typeof body.slug === "string" ? body.slug.trim() : undefined,
      description: typeof body.description === "string" ? body.description.trim() : undefined,
      spendLimitMonthly: typeof body.spendLimitMonthly === "number" ? body.spendLimitMonthly : undefined,
      status: body.status as ProjectStatus,
    });

    if (!updated) {
      return ApiErrors.notFound(`Project '${projectId}' not found.`);
    }

    return apiSuccess(updated);
  } catch (err: unknown) {
    const customErr = err as { code?: string; message?: string };
    if (customErr.code === "DUPLICATE_SLUG") {
      return ApiErrors.conflict(customErr.message || "A project with this slug already exists.");
    }

    console.error("[OsterdOps Projects API] Update failed:", err);
    return ApiErrors.internalError("Failed to update project.");
  }
}

export async function DELETE(request: Request, context: Params) {
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

  // Enforce ADMIN or OWNER role in project's parent organization
  const orgAuth = await requireOrganizationMember(request, found.orgId, "ADMIN");
  if (orgAuth.errorResponse) {
    return orgAuth.errorResponse;
  }

  try {
    const success = await archiveProject(found.orgId, projectId, user.uid);
    if (!success) {
      return ApiErrors.notFound(`Project '${projectId}' not found.`);
    }

    return apiSuccess({ projectId, archived: true });
  } catch (err) {
    console.error("[OsterdOps Projects API] Archive failed:", err);
    return ApiErrors.internalError("Failed to archive project.");
  }
}
