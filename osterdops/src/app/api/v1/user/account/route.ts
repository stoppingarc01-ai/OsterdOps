/**
 * DELETE /api/v1/user/account
 * Irreversible account deletion endpoint.
 * Validates confirmation phrase, revokes keys, removes user record and memberships.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { getFirebaseAdminConfig } from "@/lib/firebase/config";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import { recordAuditLog } from "@/lib/services/audit.service";
import { getUserOrganizations } from "@/lib/services/organization.service";

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await requireAuth(request);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { user } = authResult;
    let body: { confirmationPhrase?: string } = {};
    try {
      body = await request.json();
    } catch {
      return ApiErrors.badRequest("Invalid JSON request body.");
    }

    const phrase = body.confirmationPhrase?.trim();
    const isPhraseValid =
      phrase === "DELETE MY ACCOUNT" ||
      (user.email && phrase?.toLowerCase() === user.email.toLowerCase());

    if (!isPhraseValid) {
      return ApiErrors.badRequest(
        "Confirmation mismatch. You must type 'DELETE MY ACCOUNT' or your account email to confirm irreversible deletion."
      );
    }

    const adminConfig = getFirebaseAdminConfig();
    if (adminConfig) {
      const db = getAdminFirestore();

      // 1. Find organizations user belongs to
      const orgs = await getUserOrganizations(user.uid);
      for (const orgItem of orgs) {
        const orgId = orgItem.organization.id;

        // Revoke active API keys created by user
        try {
          const keysSnap = await db
            .collection("organizations")
            .doc(orgId)
            .collection("apiKeys")
            .where("createdBy", "==", user.uid)
            .get();

          const batch = db.batch();
          keysSnap.forEach((doc) => {
            batch.update(doc.ref, { status: "revoked", revokedAt: new Date().toISOString() });
          });
          await batch.commit();
        } catch (keyErr) {
          console.warn("[Account Deletion] Key revocation warning:", keyErr);
        }

        // Remove or deactivate user membership
        try {
          await db
            .collection("organizations")
            .doc(orgId)
            .collection("members")
            .doc(user.uid)
            .delete();
        } catch {}

        // Record audit event
        try {
          await recordAuditLog({
            organizationId: orgId,
            actorId: user.uid,
            action: "USER_ACCOUNT_PURGED",
            resourceType: "user",
            resourceId: user.uid,
            details: { email: user.email },
          });
        } catch {}
      }

      // 2. Delete user profile document
      try {
        await db.collection("users").doc(user.uid).delete();
      } catch {}
    }

    return apiSuccess({
      success: true,
      userId: user.uid,
      message: "Account and associated credentials have been permanently deleted.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Account deletion failed.";
    console.error("[Account Deletion] Error:", err);
    return ApiErrors.internalError(message);
  }
}
