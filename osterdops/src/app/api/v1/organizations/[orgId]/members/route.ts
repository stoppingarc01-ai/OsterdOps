/**
 * /api/v1/organizations/[orgId]/members
 * GET: Lists members of the organization
 * POST: Invites / adds a member (Requires ADMIN or OWNER)
 */

import { requireOrganizationMember } from "@/lib/auth/rbac";
import { getOrganizationMembers, inviteOrganizationMember } from "@/lib/services/organization.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import type { OrganizationRole } from "@/types";

interface Params {
  params: Promise<{ orgId: string }>;
}

const VALID_ROLES: OrganizationRole[] = ["OWNER", "ADMIN", "DEVELOPER", "VIEWER"];

export async function GET(request: Request, context: Params) {
  const { orgId } = await context.params;

  const authResult = await requireOrganizationMember(request, orgId, "VIEWER");
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const members = await getOrganizationMembers(orgId);
  return apiSuccess(members);
}

export async function POST(request: Request, context: Params) {
  const { orgId } = await context.params;

  // Inviting members requires at least ADMIN role
  const authResult = await requireOrganizationMember(request, orgId, "ADMIN");
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const { user, member: callerMember } = authResult;

  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const role = (typeof body.role === "string" ? body.role.toUpperCase() : "DEVELOPER") as OrganizationRole;

    if (!email || !email.includes("@")) {
      return ApiErrors.badRequest("A valid email address is required.");
    }

    if (!VALID_ROLES.includes(role)) {
      return ApiErrors.badRequest(`Invalid role. Must be one of: ${VALID_ROLES.join(", ")}`);
    }

    // Only OWNER can invite another OWNER
    if (role === "OWNER" && callerMember.role !== "OWNER") {
      return ApiErrors.forbidden("Only organization OWNERs can assign the OWNER role.");
    }

    const invitedMember = await inviteOrganizationMember(orgId, user.uid, {
      email,
      displayName: typeof body.displayName === "string" ? body.displayName.trim() : undefined,
      role,
      userId: typeof body.userId === "string" ? body.userId : undefined,
    });

    return apiSuccess(invitedMember, undefined, 201);
  } catch (err) {
    console.error("[OsterdOps Members] Invitation failed:", err);
    return ApiErrors.internalError("Failed to invite member.");
  }
}
