/**
 * /api/v1/organizations
 * GET: Lists caller's organizations
 * POST: Creates a new organization with caller as OWNER
 */

import { requireAuth } from "@/lib/auth/server";
import { getUserOrganizations, createOrganization } from "@/lib/services/organization.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";

export async function GET(request: Request) {
  const authResult = await requireAuth(request);
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const organizations = await getUserOrganizations(authResult.user.uid);
  return apiSuccess(organizations);
}

export async function POST(request: Request) {
  const authResult = await requireAuth(request);
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const { user } = authResult;

  try {
    const body = await request.json();
    if (!body || typeof body.name !== "string" || !body.name.trim()) {
      return ApiErrors.badRequest("Organization name is required.");
    }

    const { organization, member } = await createOrganization(
      user.uid,
      user.email,
      user.displayName,
      {
        name: body.name.trim(),
        slug: body.slug ? String(body.slug).trim() : undefined,
      }
    );

    return apiSuccess({ organization, member }, undefined, 201);
  } catch (err) {
    console.error("[OsterdOps Organizations] Creation failed:", err);
    return ApiErrors.internalError("Failed to create organization.");
  }
}
