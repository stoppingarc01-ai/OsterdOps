/**
 * OsterdOps — Role-Based Access Control (RBAC) & Server Authorization Guards
 */

import "server-only";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { requireAuth, type AuthenticatedUser } from "./server";
import { ApiErrors } from "@/lib/api/response";
import { hasMinimumRole, ROLE_HIERARCHY } from "./rbac-rules";
import { hasPermission, type Permission, ROLE_PERMISSIONS } from "./permissions";
import type { OrganizationRole, OrganizationMember, Organization, Project } from "@/types";
import type { NextResponse } from "next/server";

export { hasMinimumRole, ROLE_HIERARCHY, hasPermission, ROLE_PERMISSIONS, type Permission };

export type OrgAuthResult =
  | {
      user: AuthenticatedUser;
      member: OrganizationMember;
      org: Organization;
      errorResponse?: never;
    }
  | {
      user?: never;
      member?: never;
      org?: never;
      errorResponse: NextResponse;
    };

/**
 * Server-side guard: Ensures caller is authenticated, belongs to target organization,
 * and possesses at least the minimum required role.
 */
export async function requireOrganizationMember(
  request: Request,
  orgId: string,
  minimumRole: OrganizationRole = "VIEWER"
): Promise<OrgAuthResult> {
  const authResult = await requireAuth(request);
  if (authResult.errorResponse) {
    return { errorResponse: authResult.errorResponse };
  }

  const { user } = authResult;
  const db = getAdminFirestore();

  // 1. Fetch organization document
  const orgDocRef = db.collection("organizations").doc(orgId);
  const orgSnap = await orgDocRef.get();

  if (!orgSnap.exists) {
    return { errorResponse: ApiErrors.notFound(`Organization '${orgId}' does not exist.`) };
  }

  const org = { id: orgSnap.id, ...orgSnap.data() } as Organization;

  if (org.status === "suspended") {
    return { errorResponse: ApiErrors.forbidden("This organization has been suspended.") };
  }

  // 2. Fetch membership document directly from Firestore
  const memberDocRef = orgDocRef.collection("members").doc(user.uid);
  const memberSnap = await memberDocRef.get();

  if (!memberSnap.exists) {
    return {
      errorResponse: ApiErrors.forbidden("You are not a member of this organization."),
    };
  }

  const member = memberSnap.data() as OrganizationMember;

  if (member.status !== "active") {
    return {
      errorResponse: ApiErrors.forbidden(`Your membership status is '${member.status}'. Access denied.`),
    };
  }

  // 3. Verify minimum role requirement
  if (!hasMinimumRole(member.role, minimumRole)) {
    return {
      errorResponse: ApiErrors.forbidden(
        `Action requires '${minimumRole}' role. Your current role is '${member.role}'.`
      ),
    };
  }

  return { user, member, org };
}

/**
 * Server-side guard: Alias to requireOrganizationMember with explicit role requirement.
 */
export async function requireRole(
  request: Request,
  orgId: string,
  requiredRole: OrganizationRole
): Promise<OrgAuthResult> {
  return requireOrganizationMember(request, orgId, requiredRole);
}

/**
 * Server-side guard: Ensures caller has a specific granular permission within the organization.
 */
export async function requirePermission(
  request: Request,
  orgId: string,
  permission: Permission
): Promise<OrgAuthResult> {
  const authResult = await requireOrganizationMember(request, orgId, "VIEWER");
  if (authResult.errorResponse) {
    return authResult;
  }

  const { member } = authResult;
  if (!hasPermission(member.role, permission)) {
    return {
      errorResponse: ApiErrors.forbidden(
        `Action requires permission '${permission}'. Role '${member.role}' does not have this permission.`
      ),
    };
  }

  return authResult;
}

export type ProjectAuthResult =
  | {
      user: AuthenticatedUser;
      member: OrganizationMember;
      org: Organization;
      project: Project;
      errorResponse?: never;
    }
  | {
      user?: never;
      member?: never;
      org?: never;
      project?: never;
      errorResponse: NextResponse;
    };

/**
 * Server-side guard: Ensures caller is authorized for the organization and that
 * the target project exists and is active.
 */
export async function requireProjectAccess(
  request: Request,
  orgId: string,
  projectId: string,
  minimumRole: OrganizationRole = "VIEWER"
): Promise<ProjectAuthResult> {
  const orgAuthResult = await requireOrganizationMember(request, orgId, minimumRole);
  if (orgAuthResult.errorResponse) {
    return { errorResponse: orgAuthResult.errorResponse };
  }

  const { user, member, org } = orgAuthResult;
  const db = getAdminFirestore();

  const projectDocRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("projects")
    .doc(projectId);

  const projectSnap = await projectDocRef.get();

  if (!projectSnap.exists) {
    return { errorResponse: ApiErrors.notFound(`Project '${projectId}' does not exist in this organization.`) };
  }

  const project = { id: projectSnap.id, ...projectSnap.data() } as Project;

  if (project.status === "suspended") {
    return { errorResponse: ApiErrors.forbidden("This project is suspended.") };
  }

  return { user, member, org, project };
}
