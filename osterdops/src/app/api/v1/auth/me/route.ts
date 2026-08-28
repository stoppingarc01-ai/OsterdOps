/**
 * GET /api/v1/auth/me
 * Resolves caller identity, syncs Firestore user profile, and returns active memberships.
 */

import { requireAuth } from "@/lib/auth/server";
import { syncUserRecord } from "@/lib/services/user.service";
import { getUserOrganizations } from "@/lib/services/organization.service";
import { apiSuccess } from "@/lib/api/response";

export async function GET(request: Request) {
  const authResult = await requireAuth(request);
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const { user } = authResult;

  // Sync / ensure user document exists
  const profile = await syncUserRecord(user.uid, {
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  });

  // Fetch active memberships
  const organizations = await getUserOrganizations(user.uid);

  return apiSuccess({
    user: profile,
    organizations,
  });
}
