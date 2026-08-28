/**
 * /api/v1/organizations/[orgId]/projects/[projectId]
 * GET: Gets project details (Requires VIEWER)
 * PATCH: Updates project (Requires DEVELOPER)
 * DELETE: Archives project (Requires ADMIN)
 */

import { requireProjectAccess } from "@/lib/auth/rbac";
import { updateProject, archiveProject } from "@/lib/services/project.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import type { ProjectStatus } from "@/types";

interface Params {
  params: Promise<{ orgId: string; projectId: string }>;
}

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

  const authResult = await requireProjectAccess(request, orgId, projectId, "DEVELOPER");
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  try {
    const body = await request.json();
    const updated = await updateProject(orgId, projectId, {
      name: typeof body.name === "string" ? body.name.trim() : undefined,
      description: typeof body.description === "string" ? body.description.trim() : undefined,
      spendLimitMonthly: typeof body.spendLimitMonthly === "number" ? body.spendLimitMonthly : undefined,
      status: body.status as ProjectStatus,
    });

    if (!updated) {
      return ApiErrors.notFound("Project not found.");
    }

    return apiSuccess(updated);
  } catch (err) {
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

  try {
    const success = await archiveProject(orgId, projectId);
    if (!success) {
      return ApiErrors.notFound("Project not found.");
    }

    return apiSuccess({ projectId, archived: true });
  } catch (err) {
    console.error("[OsterdOps Projects] Archiving failed:", err);
    return ApiErrors.internalError("Failed to archive project.");
  }
}
