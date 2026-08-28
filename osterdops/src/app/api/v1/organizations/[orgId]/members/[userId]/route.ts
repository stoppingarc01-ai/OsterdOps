/**
 * /api/v1/organizations/[orgId]/members/[userId]
 * PATCH: Updates a member's role (Requires ADMIN or OWNER)
 * DELETE: Removes a member from the organization (Requires ADMIN or OWNER)
 */

import { requireOrganizationMember } from "@/lib/auth/rbac";
import { updateOrganizationMemberRole, removeOrganizationMember } from "@/lib/services/organization.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import type { OrganizationRole } from "@/types";

interface Params {
  params: Promise<{ orgId: string; userId: string }>;
}

const VALID_ROLES: OrganizationRole[] = ["OWNER", "ADMIN", "DEVELOPER", "VIEWER"];

export async function PATCH(request: Request, context: Params) {
  const { orgId, userId: targetUserId } = await context.params;

  const authResult = await requireOrganizationMember(request, orgId, "ADMIN");
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const { member: callerMember } = authResult;

  try {
    const body = await request.json();
    const newRole = (typeof body.role === "string" ? body.role.toUpperCase() : "") as OrganizationRole;

    if (!VALID_ROLES.includes(newRole)) {
      return ApiErrors.badRequest(`Invalid role. Must be one of: ${VALID_ROLES.join(", ")}`);
    }

    // Only OWNER can promote someone to OWNER or demote an OWNER
    if (newRole === "OWNER" && callerMember.role !== "OWNER") {
      return ApiErrors.forbidden("Only an OWNER can assign the OWNER role.");
    }

    await updateOrganizationMemberRole(orgId, targetUserId, newRole);

    return apiSuccess({
      userId: targetUserId,
      role: newRole,
      updated: true,
    });
  } catch (err) {
    console.error("[OsterdOps Members] Role update failed:", err);
    return ApiErrors.internalError("Failed to update member role.");
  }
}

export async function DELETE(request: Request, context: Params) {
  const { orgId, userId: targetUserId } = await context.params;

  const authResult = await requireOrganizationMember(request, orgId, "ADMIN");
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const { member: callerMember, user } = authResult;

  // Non-owners cannot remove other members unless removing themselves
  if (callerMember.role !== "OWNER" && user.uid !== targetUserId) {
    return ApiErrors.forbidden("Only organization OWNERs can remove other members.");
  }

  try {
    const result = await removeOrganizationMember(orgId, targetUserId);
    if (!result.success) {
      return ApiErrors.badRequest(result.error || "Could not remove member.");
    }

    return apiSuccess({
      userId: targetUserId,
      removed: true,
    });
  } catch (err) {
    console.error("[OsterdOps Members] Removal failed:", err);
    return ApiErrors.internalError("Failed to remove member.");
  }
}
