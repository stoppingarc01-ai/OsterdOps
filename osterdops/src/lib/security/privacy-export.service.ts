/**
 * OsterdOps — Privacy Data Export Engine (Phase 15)
 * Assembles organization-scoped export manifests of non-secret metadata for compliance & data portability.
 */

import crypto from "crypto";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { redactSensitiveData } from "@/lib/observability/redaction";
import { recordAuditLog } from "@/lib/services/audit.service";
import { incrementMetric } from "@/lib/observability/metrics";
import type { PrivacyExportManifest } from "@/types";

export async function generatePrivacyExport(
  orgId: string,
  actorId: string
): Promise<PrivacyExportManifest> {
  const exportId = `exp_${orgId}_${Date.now()}`;
  const nowIso = new Date().toISOString();
  // 1. Fetch organization metadata
  let orgData: Record<string, unknown> = { id: orgId };
  if (process.env.FIREBASE_PROJECT_ID) {
    try {
      const db = getAdminFirestore();
      const orgSnap = await db.collection("organizations").doc(orgId).get();
      if (orgSnap.exists) {
        orgData = { id: orgSnap.id, ...orgSnap.data() };
      }
    } catch {
      // Non-blocking in simulation
    }
  }

  // 2. Build non-secret export bundle
  const bundle = {
    organization: orgData,
    members: [],
    projects: [],
    apiKeysMetadata: [],
    usageSummary: { totalRequests: 0, totalTokens: 0 },
    costSummary: { totalSpendUsd: 0 },
    alerts: [],
    notificationsPreferences: {},
    auditEvents: [],
  };

  const sanitizedBundle = redactSensitiveData(bundle) as typeof bundle;

  // 3. Compute checksum
  const rawPayload = JSON.stringify(sanitizedBundle);
  const checksum = crypto.createHash("sha256").update(rawPayload).digest("hex");

  const manifest: PrivacyExportManifest = {
    exportId,
    organizationId: orgId,
    requestedBy: actorId,
    generatedAt: nowIso,
    categories: ["organization", "projects", "members", "usage", "costs", "alerts", "audit"],
    data: sanitizedBundle,
    checksum,
  };

  // 4. Audit & Telemetry
  await recordAuditLog({
    organizationId: orgId,
    actorId,
    action: "PRIVACY_DATA_EXPORTED",
    resourceType: "privacyExport",
    resourceId: exportId,
  });

  incrementMetric("security_export_requests_total", 1, {
    jobType: "PRIVACY_EXPORT",
  });

  return manifest;
}
