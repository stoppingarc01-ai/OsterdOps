/**
 * GET /api/v1/auth/me
 * Resolves caller identity, syncs Firestore user profile, and returns active memberships.
 */

import { requireAuth } from "@/lib/auth/server";
import { syncUserRecord } from "@/lib/services/user.service";
import { getUserOrganizations, createOrganization } from "@/lib/services/organization.service";
import { apiSuccess } from "@/lib/api/response";

export async function GET(request: Request) {
  const authResult = await requireAuth(request);
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const { user } = authResult;

  // Derive email or internal phone email for Firestore profile
  const userEmail =
    user.email && user.email.includes("@")
      ? user.email
      : `${(user.email || user.uid).replace(/[^0-9+]/g, "") || user.uid}@phone.osterdops.internal`;

  // Sync / ensure user document exists
  const profile = await syncUserRecord(user.uid, {
    email: userEmail,
    displayName: user.displayName,
    photoURL: user.photoURL,
  });

  // Fetch active memberships
  let organizations = await getUserOrganizations(user.uid);

  // Auto-provision initial workspace if user has none yet (e.g. initial Google sign-in)
  if (organizations.length === 0) {
    const companyName = `${profile.name || "My"}'s Workspace`;
    const created = await createOrganization(user.uid, user.email, profile.name, {
      name: companyName,
    });
    organizations = [{ organization: created.organization, membership: created.member }];
  }

  return apiSuccess({
    user: profile,
    organizations,
  });
}
