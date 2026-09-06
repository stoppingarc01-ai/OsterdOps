/**
 * POST /api/v1/auth/rollback
 * Rollback endpoint to delete orphaned or failed-registration Firebase Auth users
 * so that users are never blocked with "Email already in use" on retry.
 */

import { getAdminAuth } from "@/lib/firebase/admin";
import { extractAuthToken, verifyUserToken } from "@/lib/auth/server";
import { apiSuccess, ApiErrors } from "@/lib/api/response";

export async function POST(request: Request) {
  let body: { uid?: string } = {};
  try {
    body = await request.json();
  } catch {}

  let targetUid = body.uid;

  // If token is provided, verify caller
  const token = extractAuthToken(request);
  if (token) {
    const decoded = await verifyUserToken(token);
    if (decoded) {
      targetUid = targetUid || decoded.uid;
    }
  }

  if (!targetUid) {
    return ApiErrors.badRequest("Target user UID is required for rollback.");
  }

  try {
    const adminAuth = getAdminAuth();
    await adminAuth.deleteUser(targetUid);
    console.log(`[OsterdOps Rollback] Successfully deleted orphaned user: ${targetUid}`);
    return apiSuccess({ rolledBack: true, uid: targetUid });
  } catch (err: any) {
    // If user was already deleted, treat as success
    if (err?.code === "auth/user-not-found") {
      return apiSuccess({ rolledBack: true, uid: targetUid, alreadyDeleted: true });
    }
    console.warn(`[OsterdOps Rollback] Failed to delete user ${targetUid}:`, err?.message);
    return ApiErrors.internalError("Failed to rollback orphaned auth user.");
  }
}
