/**
 * OsterdOps — Immutable Audit Logging Service
 */

import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import type { AuditLog } from "@/types";

export interface RecordAuditLogParams {
  organizationId: string;
  actorId: string;
  actorEmail?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Appends an immutable audit log record to Firestore.
 */
export async function recordAuditLog(params: RecordAuditLogParams): Promise<void> {
  if (!process.env.FIREBASE_PROJECT_ID && !process.env.GCLOUD_PROJECT && !process.env.GOOGLE_CLOUD_PROJECT) {
    return;
  }
  try {
    const db = getAdminFirestore();
    const auditRef = db
      .collection("organizations")
      .doc(params.organizationId)
      .collection("auditLogs")
      .doc();

    const now = FieldValue.serverTimestamp();

    const rawData: Record<string, unknown> = {
      organizationId: params.organizationId,
      actorId: params.actorId,
      actorEmail: params.actorEmail,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      metadata: params.details || {},
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      timestamp: now,
    };

    const cleanData: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(rawData)) {
      if (v !== undefined) {
        cleanData[k] = v;
      }
    }

    await auditRef.set(cleanData);
  } catch (err) {
    if (process.env.NODE_ENV !== "test") {
      console.error("[OsterdOps Audit Log] Failed to write audit log:", err);
    }
  }
}

/**
 * Lists audit log entries for an organization in reverse chronological order.
 */
export async function listAuditLogs(
  orgId: string,
  limit = 50
): Promise<AuditLog[]> {
  const db = getAdminFirestore();
  const snap = await db
    .collection("organizations")
    .doc(orgId)
    .collection("auditLogs")
    .orderBy("timestamp", "desc")
    .limit(limit)
    .get();

  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      organizationId: data.organizationId,
      actorId: data.actorId,
      actorEmail: data.actorEmail,
      action: data.action,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      metadata: data.metadata || {},
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      timestamp: data.timestamp?.toDate?.()?.toISOString() || data.timestamp,
    } as AuditLog;
  });
}
