/**
 * POST /api/v1/user/onboarding
 * Completes the onboarding wizard, persists hasCompletedOnboarding: true,
 * and confirms the 7-day trial subscription is initialized.
 */

import { requireAuth } from "@/lib/auth/server";
import { markUserOnboarded } from "@/lib/services/user.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";

export async function POST(request: Request) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { user } = authResult;
    const updatedUser = await markUserOnboarded(user.uid);

    return apiSuccess(updatedUser);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to finalize user onboarding.";
    return ApiErrors.internalError(message);
  }
}
