/**
 * OsterdOps — Workspace Member Direct Provisioning API
 * POST /api/v1/workspace/members
 * GET  /api/v1/workspace/members
 */

import { requireAuth } from "@/lib/auth/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import { getFirebaseAdminConfig } from "@/lib/firebase/config";
import { FieldValue } from "firebase-admin/firestore";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import { recordAuditLog } from "@/lib/services/audit.service";
import { getUserOrganizations } from "@/lib/services/organization.service";
import type { OrganizationRole, OrganizationMember } from "@/types";
import crypto from "crypto";

const VALID_ROLES: OrganizationRole[] = ["OWNER", "ADMIN", "DEVELOPER", "VIEWER"];

/**
 * Generates a cryptographically strong temporary password.
 */
function generateSecurePassword(length = 14): string {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset[bytes[i] % charset.length];
  }
  return result;
}

export async function GET(request: Request) {
  const authResult = await requireAuth(request);
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const { user } = authResult;
  const url = new URL(request.url);
  const orgId = url.searchParams.get("orgId") || request.headers.get("x-workspace-id");

  // Resolve target organization
  const userOrgs = await getUserOrganizations(user.uid);
  const targetOrg = orgId
    ? userOrgs.find((o) => o.organization.id === orgId)
    : userOrgs[0];

  if (!targetOrg) {
    return ApiErrors.notFound("Workspace not found or unauthorized.");
  }

  const db = getAdminFirestore();
  const membersSnap = await db
    .collection("organizations")
    .doc(targetOrg.organization.id)
    .collection("members")
    .get();

  const members = membersSnap.docs.map((doc) => ({
    id: doc.id,
    userId: doc.id,
    ...doc.data(),
  }));

  return apiSuccess(members);
}

export async function POST(request: Request) {
  const authResult = await requireAuth(request);
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const { user: callerUser } = authResult;

  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const rawRole = typeof body.role === "string" ? body.role.trim().toUpperCase() : "DEVELOPER";
    const role = (rawRole === "MEMBER" ? "DEVELOPER" : rawRole) as OrganizationRole;
    const providedPassword = typeof body.password === "string" ? body.password.trim() : "";
    const projectIdScope = Array.isArray(body.projectIdScope) ? body.projectIdScope : [];

    // 1. Validation
    if (!email || !email.includes("@")) {
      return ApiErrors.badRequest("A valid email address is required.");
    }

    if (!VALID_ROLES.includes(role)) {
      return ApiErrors.badRequest(`Invalid role. Must be one of: ${VALID_ROLES.join(", ")}`);
    }

    // Temporary password minimum length check or auto-generate
    let temporaryPassword = providedPassword;
    if (!temporaryPassword) {
      temporaryPassword = generateSecurePassword(14);
    } else if (temporaryPassword.length < 8) {
      return ApiErrors.badRequest("Temporary password must be at least 8 characters.");
    }

    // 2. Resolve target organization & verify caller authorization
    const requestedOrgId =
      body.orgId ||
      body.workspaceId ||
      request.headers.get("x-workspace-id") ||
      request.headers.get("x-organization-id");

    const userOrgs = await getUserOrganizations(callerUser.uid);
    const targetOrgData = requestedOrgId
      ? userOrgs.find((o) => o.organization.id === requestedOrgId)
      : userOrgs[0];

    if (!targetOrgData) {
      return ApiErrors.notFound("Target workspace not found or caller has no membership.");
    }

    const callerRole = targetOrgData.membership.role;
    if (callerRole !== "OWNER" && callerRole !== "ADMIN") {
      return ApiErrors.forbidden("Only workspace OWNERs and ADMINs can directly provision team members.");
    }

    if (role === "OWNER" && callerRole !== "OWNER") {
      return ApiErrors.forbidden("Only workspace OWNERs can provision another OWNER.");
    }

    const orgId = targetOrgData.organization.id;
    const adminConfig = getFirebaseAdminConfig();
    let provisionedUid = `usr_${crypto.randomBytes(8).toString("hex")}`;
    let isExistingAuthUser = false;

    // 3. Provision or Update User in Firebase Auth
    if (adminConfig) {
      const auth = getAdminAuth();
      try {
        const existingRecord = await auth.getUserByEmail(email);
        provisionedUid = existingRecord.uid;
        isExistingAuthUser = true;

        // Update password with temporary password
        await auth.updateUser(provisionedUid, {
          password: temporaryPassword,
        });
      } catch (err: unknown) {
        const fbErr = err as { code?: string };
        if (fbErr.code === "auth/user-not-found") {
          // Create new user in Firebase Auth
          const created = await auth.createUser({
            email,
            password: temporaryPassword,
            displayName: email.split("@")[0],
            emailVerified: true,
          });
          provisionedUid = created.uid;
        } else {
          throw err;
        }
      }

      // Set custom claims to flag mandatory first-login password reset
      await auth.setCustomUserClaims(provisionedUid, {
        mustResetPassword: true,
        workspaceId: orgId,
      });
    }

    // 4. Save Member in Firestore
    const db = getAdminFirestore();
    const memberRef = db.collection("organizations").doc(orgId).collection("members").doc(provisionedUid);
    const existingMemberDoc = await memberRef.get();

    if (existingMemberDoc.exists && existingMemberDoc.data()?.status === "active") {
      // If already an active member, update their role and credentials
      await memberRef.update({
        role,
        mustResetPassword: true,
        projectIdScope,
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else {
      // Provision fresh member record
      const memberDoc: Omit<OrganizationMember, "joinedAt" | "updatedAt"> & {
        joinedAt: unknown;
        updatedAt: unknown;
      } = {
        userId: provisionedUid,
        email,
        displayName: email.split("@")[0],
        role,
        status: "active",
        mustResetPassword: true,
        projectIdScope,
        invitedBy: callerUser.uid,
        joinedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      await memberRef.set(memberDoc);
    }

    // 5. Ensure root user document exists in Firestore
    const userDocRef = db.collection("users").doc(provisionedUid);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) {
      await userDocRef.set({
        id: provisionedUid,
        email,
        name: email.split("@")[0],
        mustResetPassword: true,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else {
      await userDocRef.update({
        mustResetPassword: true,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    // 6. Record immutable security audit log
    await recordAuditLog({
      organizationId: orgId,
      actorId: callerUser.uid,
      action: "MEMBER_PROVISIONED",
      resourceType: "member",
      resourceId: provisionedUid,
      details: {
        email,
        role,
        isExistingAuthUser,
        mustResetPassword: true,
        projectIdScope,
      },
    });

    return apiSuccess(
      {
        member: {
          id: provisionedUid,
          userId: provisionedUid,
          email,
          displayName: email.split("@")[0],
          name: email.split("@")[0],
          role,
          status: "ACTIVE",
          mustResetPassword: true,
          projectIdScope,
          joinedAt: new Date().toISOString(),
        },
        temporaryPassword,
        mustResetPassword: true,
        workspaceName: targetOrgData.organization.name,
        message: "Team member provisioned successfully.",
      },
      undefined,
      201
    );
  } catch (error) {
    console.error("[OsterdOps Workspace Members] Provisioning failed:", error);
    return ApiErrors.internalError("Failed to provision workspace member: " + (error as Error).message);
  }
}
