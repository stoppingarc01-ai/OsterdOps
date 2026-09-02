/**
 * OsterdOps — First Login Password Reset Route
 * POST /api/v1/auth/reset-first-password
 */

import { requireAuth } from "@/lib/auth/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import { getFirebaseAdminConfig } from "@/lib/firebase/config";
import { FieldValue } from "firebase-admin/firestore";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import { recordAuditLog } from "@/lib/services/audit.service";
import { getUserOrganizations } from "@/lib/services/organization.service";

export async function POST(request: Request) {
  const authResult = await requireAuth(request);
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const { user } = authResult;

  try {
    const body = await request.json();
    const newPassword = typeof body.newPassword === "string" ? body.newPassword.trim() : "";

    if (!newPassword || newPassword.length < 8) {
      return ApiErrors.badRequest("New password must be at least 8 characters long.");
    }

    const adminConfig = getFirebaseAdminConfig();
    if (adminConfig) {
      const auth = getAdminAuth();
      // Update Firebase Auth password
      await auth.updateUser(user.uid, {
        password: newPassword,
      });

      // Clear custom claims
      await auth.setCustomUserClaims(user.uid, {
        mustResetPassword: false,
      });
    }

    // Update Firestore User doc
    const db = getAdminFirestore();
    const userRef = db.collection("users").doc(user.uid);
    await userRef.update({
      mustResetPassword: false,
      passwordLastChangedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }).catch(() => null);

    // Clear mustResetPassword across memberships
    const userOrgs = await getUserOrganizations(user.uid);
    for (const orgData of userOrgs) {
      const memberRef = db
        .collection("organizations")
        .doc(orgData.organization.id)
        .collection("members")
        .doc(user.uid);
      await memberRef.update({
        mustResetPassword: false,
        updatedAt: FieldValue.serverTimestamp(),
      }).catch(() => null);

      // Audit log
      await recordAuditLog({
        organizationId: orgData.organization.id,
        actorId: user.uid,
        action: "PASSWORD_RESET_COMPLETED",
        resourceType: "user",
        resourceId: user.uid,
        details: {
          event: "first_login_password_changed",
        },
      });
    }

    return apiSuccess({
      mustResetPassword: false,
      message: "Password established successfully. You now have full dashboard access.",
    });
  } catch (error) {
    console.error("[OsterdOps Password Reset] Failed:", error);
    return ApiErrors.internalError("Failed to update password: " + (error as Error).message);
  }
}
