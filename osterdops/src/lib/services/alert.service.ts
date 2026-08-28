/**
 * OsterdOps — Operational Alert Service Layer
 */

import "server-only";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import type { Alert, AlertSeverity, AlertStatus, AlertType } from "@/types";

export interface CreateAlertParams {
  projectId?: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  dedupKey: string;
}

/**
 * Creates an alert if an active alert with the same dedupKey does not already exist.
 */
export async function createDeduplicatedAlert(
  orgId: string,
  params: CreateAlertParams
): Promise<Alert | null> {
  const db = getAdminFirestore();
  const alertsRef = db.collection("organizations").doc(orgId).collection("alerts");

  // Check if an alert with this dedupKey already exists
  const existingSnap = await alertsRef
    .where("dedupKey", "==", params.dedupKey)
    .where("status", "==", "active")
    .limit(1)
    .get();

  if (!existingSnap.empty) {
    return null; // Suppress duplicate alert
  }

  const alertRef = alertsRef.doc();
  const alertId = alertRef.id;
  const now = FieldValue.serverTimestamp();

  const alertData: Omit<Alert, "id"> = {
    organizationId: orgId,
    projectId: params.projectId,
    type: params.type,
    severity: params.severity,
    title: params.title,
    message: params.message,
    dedupKey: params.dedupKey,
    status: "active",
    createdAt: now as unknown as string,
  };

  await alertRef.set(alertData);

  return {
    id: alertId,
    ...alertData,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Lists active and acknowledged alerts for an organization.
 */
export async function listOrganizationAlerts(
  orgId: string,
  limit = 50
): Promise<Alert[]> {
  const db = getAdminFirestore();
  const snap = await db
    .collection("organizations")
    .doc(orgId)
    .collection("alerts")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      organizationId: data.organizationId,
      projectId: data.projectId,
      type: data.type as AlertType,
      severity: data.severity as AlertSeverity,
      title: data.title,
      message: data.message,
      dedupKey: data.dedupKey,
      status: data.status as AlertStatus,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
    } as Alert;
  });
}
