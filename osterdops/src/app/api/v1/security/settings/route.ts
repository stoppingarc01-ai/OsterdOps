/**
 * OsterdOps — Security Settings Route (Phase 15)
 * GET, PATCH /api/v1/security/settings
 */

import { requirePermission } from "@/lib/auth/rbac";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { recordAuditLog } from "@/lib/services/audit.service";
import type { OrganizationSecuritySettings } from "@/types";

const DEFAULT_SECURITY_SETTINGS = (orgId: string): OrganizationSecuritySettings => ({
  organizationId: orgId,
  sessionTimeoutMinutes: 1440, // 24h
  enforceApiKeyExpiration: false,
  defaultApiKeyExpiryDays: 90,
  allowedOrigins: ["*"],
  securityAlertThresholds: {
    authFailureCount: 5,
    apiKeyFailureCount: 10,
    rateLimitBlockCount: 20,
  },
  updatedAt: new Date().toISOString(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organizationId");

    if (!orgId) {
      return ApiErrors.badRequest("Query parameter 'organizationId' is required.");
    }

    const authResult = await requirePermission(request, orgId, "security:read");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const db = getAdminFirestore();
    const docRef = db.collection("organizations").doc(orgId).collection("settings").doc("security");
    const snap = await docRef.get();

    if (!snap.exists) {
      return apiSuccess(DEFAULT_SECURITY_SETTINGS(orgId));
    }

    return apiSuccess(snap.data() as OrganizationSecuritySettings);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve security settings.";
    return ApiErrors.internalError(message);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { organizationId, sessionTimeoutMinutes, enforceApiKeyExpiration, defaultApiKeyExpiryDays, allowedOrigins, securityAlertThresholds } = body;

    if (!organizationId) {
      return ApiErrors.badRequest("Field 'organizationId' is required.");
    }

    const authResult = await requirePermission(request, organizationId, "security:manage");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const db = getAdminFirestore();
    const docRef = db.collection("organizations").doc(organizationId).collection("settings").doc("security");
    const nowIso = new Date().toISOString();

    const updatedSettings: OrganizationSecuritySettings = {
      organizationId,
      sessionTimeoutMinutes: typeof sessionTimeoutMinutes === "number" ? sessionTimeoutMinutes : 1440,
      enforceApiKeyExpiration: Boolean(enforceApiKeyExpiration),
      defaultApiKeyExpiryDays: typeof defaultApiKeyExpiryDays === "number" ? defaultApiKeyExpiryDays : 90,
      allowedOrigins: Array.isArray(allowedOrigins) ? allowedOrigins : ["*"],
      securityAlertThresholds: securityAlertThresholds || {
        authFailureCount: 5,
        apiKeyFailureCount: 10,
        rateLimitBlockCount: 20,
      },
      updatedAt: nowIso,
      updatedBy: authResult.user.uid,
    };

    await docRef.set(
      {
        ...updatedSettings,
        updatedAtServer: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await recordAuditLog({
      organizationId,
      actorId: authResult.user.uid,
      action: "SECURITY_CONFIGURATION_CHANGED",
      resourceType: "securitySettings",
      resourceId: "security",
      details: { updatedFields: Object.keys(body) },
    });

    return apiSuccess(updatedSettings);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update security settings.";
    return ApiErrors.internalError(message);
  }
}
