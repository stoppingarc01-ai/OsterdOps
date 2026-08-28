/**
 * OsterdOps — Immutable Audit Logging Service
 */

import "server-only";
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
  try {
    const db = getAdminFirestore();
    const auditRef = db
      .collection("organizations")
      .doc(params.organizationId)
      .collection("auditLogs")
      .doc();

    const now = FieldValue.serverTimestamp();

    const logData: Omit<AuditLog, "id"> = {
      organizationId: params.organizationId,
      actorId: params.actorId,
      actorEmail: params.actorEmail,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      metadata: params.details || {},
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      timestamp: now as unknown as string,
    };

    await auditRef.set(logData);
  } catch (err) {
    console.error("[OsterdOps Audit Log] Failed to write audit log:", err);
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
