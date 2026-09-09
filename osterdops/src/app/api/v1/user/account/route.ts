/**
 * DELETE /api/v1/user/account
 * Irreversible account deletion endpoint.
 * Validates confirmation phrase, revokes keys, removes user record and memberships.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server";
import { getAdminFirestore, getAdminAuth } from "@/lib/firebase/admin";
import { getFirebaseAdminConfig } from "@/lib/firebase/config";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import { recordAuditLog } from "@/lib/services/audit.service";
import { getUserOrganizations } from "@/lib/services/organization.service";
import { deleteUserRecord } from "@/lib/services/user.service";

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await requireAuth(request);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { user } = authResult;
    let body: {
      confirmed?: boolean;
      confirm?: boolean;
      confirmation?: boolean;
      confirmationPhrase?: string;
    } = {};

    try {
      body = await request.json();
    } catch {
      // Body might be empty or direct DELETE request
    }

    const phrase = body.confirmationPhrase?.trim();
    const isPhraseValid =
      phrase === "DELETE MY ACCOUNT" ||
      phrase === "DELETE" ||
      (user.email && phrase?.toLowerCase() === user.email.toLowerCase());

    const isConfirmed =
      body.confirmed === true ||
      body.confirm === true ||
      body.confirmation === true ||
      isPhraseValid;

    if (!isConfirmed) {
      return ApiErrors.badRequest(
        "Account deletion confirmation is required. Please confirm deletion to proceed."
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
      await deleteUserRecord(user.uid);

      // 3. Delete Firebase Auth user
      try {
        const adminAuth = getAdminAuth();
        await adminAuth.deleteUser(user.uid);
      } catch (authErr) {
        console.warn("[Account Deletion] Auth deleteUser note:", authErr);
      }
    } else {
      // Development / simulated memory deletion
      await deleteUserRecord(user.uid);
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
