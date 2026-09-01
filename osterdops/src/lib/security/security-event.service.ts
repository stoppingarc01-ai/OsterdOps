/**
 * OsterdOps — Security Event Engine (Phase 15)
 * Normalizes, logs, persists, and triggers security alerts for high-severity threat events.
 */

import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { hashClientIp } from "./request-security";
import { redactSensitiveData } from "@/lib/observability/redaction";
import { logger } from "@/lib/observability/logger";
import { incrementMetric } from "@/lib/observability/metrics";
import type { SecurityEvent, SecurityEventType, SecurityEventSeverity } from "@/types";

export interface RecordSecurityEventParams {
  type: SecurityEventType;
  severity?: SecurityEventSeverity;
  organizationId: string;
  actorId?: string;
  targetResourceType?: string;
  targetResourceId?: string;
  rawIp?: string;
  userAgentSnippet?: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
}

const DEFAULT_SEVERITIES: Record<SecurityEventType, SecurityEventSeverity> = {
  AUTH_SUCCESS: "INFO",
  AUTH_FAILURE: "MEDIUM",
  SESSION_REVOKED: "LOW",
  API_KEY_CREATED: "INFO",
  API_KEY_ROTATED: "INFO",
  API_KEY_REVOKED: "LOW",
  API_KEY_EXPIRED: "LOW",
  API_KEY_AUTH_FAILED: "HIGH",
  PERMISSION_DENIED: "MEDIUM",
  CROSS_TENANT_ACCESS_BLOCKED: "CRITICAL",
  RATE_LIMIT_TRIGGERED: "MEDIUM",
  SUSPICIOUS_REQUEST: "HIGH",
  BUDGET_REQUEST_BLOCKED: "MEDIUM",
  BILLING_SECURITY_EVENT: "HIGH",
  WEBHOOK_SIGNATURE_FAILURE: "HIGH",
  SECURITY_CONFIGURATION_CHANGED: "HIGH",
};

export async function recordSecurityEvent(
  params: RecordSecurityEventParams
): Promise<SecurityEvent> {
  const eventId = `sec_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const nowIso = new Date().toISOString();
  const severity = params.severity || DEFAULT_SEVERITIES[params.type] || "MEDIUM";

  const ipHash = params.rawIp ? hashClientIp(params.rawIp) : undefined;
  const sanitizedMeta = (redactSensitiveData(params.metadata) as Record<string, unknown>) || {};

  const securityEvent: SecurityEvent = {
    id: eventId,
    type: params.type,
    severity,
    organizationId: params.organizationId,
    actorId: params.actorId,
    targetResourceType: params.targetResourceType,
    targetResourceId: params.targetResourceId,
    ipHash,
    userAgentSnippet: params.userAgentSnippet ? params.userAgentSnippet.slice(0, 100) : undefined,
    requestId: params.requestId,
    metadata: sanitizedMeta,
    timestamp: nowIso,
  };

  // 1. Metric counter increment
  incrementMetric(`security_${params.type.toLowerCase()}_total`, 1, {
    severity,
    jobType: "SECURITY_EVENT",
  });

  // 2. Structured log
  if (severity === "HIGH" || severity === "CRITICAL") {
    logger.warn(`[SECURITY ALERT] ${params.type}`, {
      eventId,
      organizationId: params.organizationId,
      severity,
      requestId: params.requestId,
      ...sanitizedMeta,
    });
  } else {
    logger.info(`[SECURITY EVENT] ${params.type}`, {
      eventId,
      organizationId: params.organizationId,
      severity,
      requestId: params.requestId,
    });
  }

  // 3. Persist in Firestore
  try {
    const db = getAdminFirestore();
    await db
      .collection("organizations")
      .doc(params.organizationId)
      .collection("securityEvents")
      .doc(eventId)
      .set({
        ...securityEvent,
        createdAt: FieldValue.serverTimestamp(),
      });
  } catch {
    // Non-blocking in simulation/test
  }

  return securityEvent;
}
