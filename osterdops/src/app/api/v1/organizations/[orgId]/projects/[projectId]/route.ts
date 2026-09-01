/**
 * /api/v1/organizations/[orgId]/projects/[projectId]
 * GET: Gets project details (Requires VIEWER)
 * PATCH: Updates project (Requires ADMIN or OWNER)
 * DELETE: Archives project (Requires ADMIN or OWNER)
 */

import { requireProjectAccess } from "@/lib/auth/rbac";
import { updateProject, archiveProject } from "@/lib/services/project.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import type { ProjectStatus } from "@/types";

interface Params {
  params: Promise<{ orgId: string; projectId: string }>;
}

const VALID_STATUSES: ProjectStatus[] = ["ACTIVE", "ARCHIVED", "active", "archived"];

export async function GET(request: Request, context: Params) {
  const { orgId, projectId } = await context.params;

  const authResult = await requireProjectAccess(request, orgId, projectId, "VIEWER");
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  return apiSuccess(authResult.project);
}

export async function PATCH(request: Request, context: Params) {
  const { orgId, projectId } = await context.params;

  // Updating requires ADMIN role
  const authResult = await requireProjectAccess(request, orgId, projectId, "ADMIN");
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const { user } = authResult;

  try {
    const body = await request.json();

    if (body.name !== undefined && (typeof body.name !== "string" || !body.name.trim())) {
      return ApiErrors.badRequest("Project name cannot be empty.");
    }

    if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
      return ApiErrors.badRequest("Invalid status. Must be one of: ACTIVE, ARCHIVED");
    }

    const updated = await updateProject(orgId, projectId, user.uid, {
      name: typeof body.name === "string" ? body.name.trim() : undefined,
      slug: typeof body.slug === "string" ? body.slug.trim() : undefined,
      description: typeof body.description === "string" ? body.description.trim() : undefined,
      spendLimitMonthly: typeof body.spendLimitMonthly === "number" ? body.spendLimitMonthly : undefined,
      status: body.status as ProjectStatus,
    });

    if (!updated) {
      return ApiErrors.notFound("Project not found.");
    }

    return apiSuccess(updated);
  } catch (err: unknown) {
    const customErr = err as { code?: string; message?: string };
    if (customErr.code === "DUPLICATE_SLUG") {
      return ApiErrors.conflict(customErr.message || "A project with this slug already exists.");
    }

    console.error("[OsterdOps Projects] Update failed:", err);
    return ApiErrors.internalError("Failed to update project.");
  }
}

export async function DELETE(request: Request, context: Params) {
  const { orgId, projectId } = await context.params;

  // Archiving requires ADMIN role
  const authResult = await requireProjectAccess(request, orgId, projectId, "ADMIN");
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const { user } = authResult;

  try {
    const success = await archiveProject(orgId, projectId, user.uid);
    if (!success) {
      return ApiErrors.notFound("Project not found.");
    }

    return apiSuccess({ projectId, archived: true });
  } catch (err) {
    console.error("[OsterdOps Projects] Archiving failed:", err);
    return ApiErrors.internalError("Failed to archive project.");
  }
}
