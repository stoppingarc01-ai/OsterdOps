/**
 * GET /api/v1/auth/me
 * Resolves caller identity, syncs Firestore user profile, and returns active memberships.
 */

import { requireAuth } from "@/lib/auth/server";
import { syncUserRecord } from "@/lib/services/user.service";
import { getUserOrganizations, createDefaultOrganizationForUser } from "@/lib/services/organization.service";
import { apiSuccess } from "@/lib/api/response";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const isDemo = cookieHeader.includes("osterdops_demo_mode=true");

  const authResult = await requireAuth(request);
  if (authResult.errorResponse) {
    if (isDemo) {
      return apiSuccess({
        user: {
          id: "usr_demo_lead",
          email: "demo@osterdops.internal",
          name: "Demo Explorer (Sandbox)",
          role: "OWNER",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        organizations: [
          {
            organization: {
              id: "org_osterdops_demo_mesh",
              name: "OsterdOps AI Production Mesh",
              planTier: "scale",
              status: "active",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            membership: {
              organizationId: "org_osterdops_demo_mesh",
              userId: "usr_demo_lead",
              role: "OWNER",
              createdAt: new Date().toISOString(),
            },
          },
        ],
      });
    }
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

  // Fetch active memberships (with automatic lazy healing if missing)
  let organizations = await getUserOrganizations(user.uid, {
    email: userEmail,
    displayName: user.displayName,
    autoHeal: true,
  });

  // Ensure user always has a valid workspace
  if (organizations.length === 0) {
    const defaultOrg = await createDefaultOrganizationForUser({
      userId: user.uid,
      name: `${profile.name || user.displayName || (userEmail ? userEmail.split("@")[0] : "My")}'s Org`,
      email: userEmail,
      displayName: profile.name || user.displayName,
      tier: "free",
    });
    organizations = [{ organization: defaultOrg.organization, membership: defaultOrg.member }];
  }

  return apiSuccess({
    user: profile,
    organizations,
  });
}
