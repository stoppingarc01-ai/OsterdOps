/**
 * POST /api/v1/auth/register
 * Atomic registration handler:
 * 1. Verifies Firebase ID Token
 * 2. Creates/updates Firestore user profile document
 * 3. Creates organization with creator as OWNER
 * 4. Creates OWNER membership record
 */

import { requireAuth } from "@/lib/auth/server";
import { syncUserRecord } from "@/lib/services/user.service";
import { createOrganization, getUserOrganizations } from "@/lib/services/organization.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";

export async function POST(request: Request) {
  const authResult = await requireAuth(request);
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const { user } = authResult;

  try {
    let body: {
      uid?: string;
      name?: string;
      displayName?: string;
      organizationName?: string;
      companyName?: string;
      phone?: string;
    } = {};
    try {
      body = await request.json();
    } catch {
      // Body may be empty, defaults applied below
    }

    const displayName =
      body.name?.trim() ||
      body.displayName?.trim() ||
      user.displayName ||
      (user.email ? user.email.split("@")[0] : "") ||
      body.phone ||
      "Enterprise User";

    const companyName =
      body.organizationName?.trim() ||
      body.companyName?.trim() ||
      `${displayName}'s Workspace`;

    const contactEmail =
      user.email ||
      (body.phone ? `${body.phone.replace(/[^0-9+]/g, "")}@phone.osterdops.internal` : `${user.uid}@user.osterdops.internal`);

    // 1. Check if user already has an organization
    const existingOrgs = await getUserOrganizations(user.uid);

    let organization;
    let member;

    if (existingOrgs.length > 0) {
      organization = existingOrgs[0].organization;
      member = existingOrgs[0].membership;
    } else {
      // 2. Create organization and OWNER membership atomically
      const result = await createOrganization(user.uid, contactEmail, displayName, {
        name: companyName,
      });
      organization = result.organization;
      member = result.member;
    }

    // 3. Create/update Firestore user profile document
    const userProfile = await syncUserRecord(user.uid, {
      email: contactEmail,
      displayName,
      photoURL: user.photoURL,
      defaultOrgId: organization.id,
    });

    return apiSuccess(
      {
        user: userProfile,
        organization,
        member,
      },
      undefined,
      201
    );
  } catch (err) {
    console.error("[OsterdOps Register API] Registration failed:", err);
    return ApiErrors.internalError("Failed to initialize user organization account.");
  }
}
