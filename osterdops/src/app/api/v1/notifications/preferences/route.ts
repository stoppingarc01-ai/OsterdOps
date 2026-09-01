/**
 * /api/v1/notifications/preferences
 * GET: Retrieves user notification preferences in an organization (Requires notifications:read / VIEWER)
 * PATCH: Updates notification preferences (Requires notifications:read / VIEWER for personal settings)
 */

import { requirePermission } from "@/lib/auth/rbac";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/lib/notifications/preferences.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organizationId");

    if (!orgId) {
      return ApiErrors.badRequest("Query parameter 'organizationId' is required.");
    }

    const authResult = await requirePermission(request, orgId, "notifications:read");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const userId = authResult.user?.uid || "anonymous";
    const prefs = await getNotificationPreferences(orgId, userId);
    return apiSuccess(prefs);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve notification preferences.";
    return ApiErrors.internalError(message);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const orgId = body?.organizationId;

    if (!orgId) {
      return ApiErrors.badRequest("Property 'organizationId' is required.");
    }

    const authResult = await requirePermission(request, orgId, "notifications:read");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const userId = authResult.user?.uid || "anonymous";
    const updated = await updateNotificationPreferences(orgId, userId, {
      budgetThresholdAlerts: body.budgetThresholdAlerts !== undefined ? Boolean(body.budgetThresholdAlerts) : undefined,
      budgetExceededAlerts: body.budgetExceededAlerts !== undefined ? Boolean(body.budgetExceededAlerts) : undefined,
      emailEnabled: body.emailEnabled !== undefined ? Boolean(body.emailEnabled) : undefined,
      inAppEnabled: body.inAppEnabled !== undefined ? Boolean(body.inAppEnabled) : undefined,
      emailRecipient: body.emailRecipient ? String(body.emailRecipient) : undefined,
      slackWebhookUrl: body.slackWebhookUrl ? String(body.slackWebhookUrl) : undefined,
      discordWebhookUrl: body.discordWebhookUrl ? String(body.discordWebhookUrl) : undefined,
    });

    return apiSuccess(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update notification preferences.";
    return ApiErrors.internalError(message);
  }
}
