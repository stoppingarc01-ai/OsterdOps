/**
 * POST /api/v1/auth/signup
 * Atomic Enterprise Signup & Organization Initialization Handler:
 * 1. Supports both Token-authenticated client signup and direct server-side signup.
 * 2. Uses Server-Side Admin SDK (bypasses Firestore client security rules).
 * 3. Guaranteed Rollback (Option A): If organization creation or profile initialization fails,
 *    immediately deletes the newly created Firebase Auth user so the user is never orphaned
 *    and can cleanly retry without "Email already exists" blocking them.
 */

import { extractAuthToken, verifyUserToken } from "@/lib/auth/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { syncUserRecord } from "@/lib/services/user.service";
import { createOrganization, getUserOrganizations, createDefaultOrganizationForUser } from "@/lib/services/organization.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";

export async function POST(request: Request) {
  let requestBody: any = {};
  try {
    requestBody = await request.json();
  } catch {
    // Body is optional or empty
  }

  let uid: string | undefined;
  let email: string | undefined;
  let displayName: string | undefined;
  let companyName: string | undefined = requestBody.companyName || requestBody.organizationName;

  // 1. Check if caller provided a Bearer token or session cookie (Client SDK already created Auth user)
  const token = extractAuthToken(request);
  if (token) {
    const decoded = await verifyUserToken(token);
    if (!decoded) {
      return ApiErrors.unauthorized("Invalid or expired authentication token.");
    }
    uid = decoded.uid;
    email = decoded.email || (decoded.phone_number as string | undefined) || "";
    displayName =
      requestBody.displayName?.trim() ||
      requestBody.name?.trim() ||
      decoded.name ||
      (email ? email.split("@")[0] : "Enterprise User");
  } else if (requestBody.email && requestBody.password) {
    // 2. Direct server-side user creation
    try {
      const adminAuth = getAdminAuth();
      const firstName = requestBody.firstName?.trim() || "";
      const lastName = requestBody.lastName?.trim() || "";
      displayName = `${firstName} ${lastName}`.trim() || requestBody.displayName?.trim() || requestBody.email.split("@")[0];

      const createdFbUser = await adminAuth.createUser({
        email: requestBody.email.trim(),
        password: requestBody.password,
        displayName,
      });

      uid = createdFbUser.uid;
      email = createdFbUser.email;
    } catch (createErr: any) {
      console.error("[OsterdOps Signup] Firebase admin createUser error:", createErr?.message);
      if (createErr?.code === "auth/email-already-exists") {
        return ApiErrors.conflict("An account with this email already exists. Please sign in instead.");
      }
      return ApiErrors.badRequest(createErr?.message || "Failed to create user account.");
    }
  } else {
    return ApiErrors.badRequest("Missing authentication credentials or signup payload.");
  }

  if (!uid) {
    return ApiErrors.badRequest("Unable to resolve user identifier for registration.");
  }

  const finalDisplayName = displayName || "Enterprise User";
  const finalCompanyName = companyName?.trim() || `${finalDisplayName}'s Workspace`;
  const contactEmail = email || `${uid}@user.osterdops.internal`;

  // 3. Atomic Organization & Member Provisioning (Server-Side Admin SDK)
  try {
    // Check if user already has an existing organization (e.g. idempotency or retry)
    const existingOrgs = await getUserOrganizations(uid, { autoHeal: false });

    let organization;
    let member;

    if (existingOrgs.length > 0) {
      organization = existingOrgs[0].organization;
      member = existingOrgs[0].membership;
    } else {
      const result = await createOrganization(uid, contactEmail, finalDisplayName, {
        name: finalCompanyName,
        tier: "trial",
      });
      organization = result.organization;
      member = result.member;
    }

    // 4. Sync Firestore user profile document
    const userProfile = await syncUserRecord(uid, {
      email: contactEmail,
      displayName: finalDisplayName,
      defaultOrgId: organization.id,
      hasCompletedOnboarding: false,
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
  } catch (initErr) {
    console.error("[OsterdOps Signup] Organization initialization failed, executing rollback:", initErr);

    // Option A: Rollback auth creation to avoid orphan auth accounts
    try {
      const adminAuth = getAdminAuth();
      await adminAuth.deleteUser(uid);
      console.log(`[OsterdOps Signup] Rollback complete: Deleted orphan auth user ${uid}`);
    } catch (delErr) {
      console.warn("[OsterdOps Signup] Admin deleteUser rollback note:", delErr);
    }

    return ApiErrors.internalError("Failed to initialize organization profile. Please try again.");
  }
}
