/**
 * OsterdOps — Operational Alert Service Layer (Phases 10 & 12)
 * Manages normalized alert records under:
 * organizations/{organizationId}/alerts/{alertId}
 * Provides deterministic deduplication, bounded querying, and alert lifecycle transitions (ACTIVE -> ACKNOWLEDGED -> RESOLVED).
 */

import "server-only";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { emitNotification } from "@/lib/notifications/emitter";
import { recordAuditLog } from "./audit.service";
import type {
  Alert,
  AlertSeverity,
  AlertStatus,
  AlertType,
  AlertFilterOptions,
} from "@/types";

export interface CreateDeduplicatedAlertParams {
  budgetId?: string;
  projectId?: string;
  type: AlertType;
  thresholdPercent?: number;
  budgetAmountUsd?: number;
  budgetLimitUsd?: number;
  currentSpendUsd?: number;
  spendUsd?: number;
  remainingUsd?: number;
  overspendUsd?: number;
  periodStart?: string;
  periodEnd?: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  dedupKey: string;
  deduplicationKey?: string;
}

/**
 * Sanitizes a Firestore document into a typed Alert record.
 */
function sanitizeAlert(docId: string, data: Record<string, unknown>): Alert {
  const toDateString = (val: unknown): string => {
    if (!val) return new Date().toISOString();
    if (typeof val === "string") return val;
    if (typeof val === "object" && val !== null && "toDate" in val && typeof (val as { toDate: () => Date }).toDate === "function") {
      return (val as { toDate: () => Date }).toDate().toISOString();
    }
    return new Date().toISOString();
  };

  const rawStatus = String(data.status || "ACTIVE").toUpperCase();
  const normalizedStatus: AlertStatus = (rawStatus === "ACKNOWLEDGED" ? "ACKNOWLEDGED" : rawStatus === "RESOLVED" ? "RESOLVED" : "ACTIVE") as AlertStatus;

  const budgetLimitUsd = data.budgetAmountUsd !== undefined ? Number(data.budgetAmountUsd) : data.budgetLimitUsd !== undefined ? Number(data.budgetLimitUsd) : undefined;
  const currentSpendUsd = data.currentSpendUsd !== undefined ? Number(data.currentSpendUsd) : data.spendUsd !== undefined ? Number(data.spendUsd) : undefined;
  const dedupKey = String(data.dedupKey || data.deduplicationKey || docId);

  return {
    id: docId,
    organizationId: String(data.organizationId || ""),
    projectId: data.projectId ? String(data.projectId) : undefined,
    budgetId: data.budgetId ? String(data.budgetId) : undefined,
    type: (data.type as AlertType) || "BUDGET_THRESHOLD",
    thresholdPercent: data.thresholdPercent !== undefined ? Number(data.thresholdPercent) : undefined,
    budgetAmountUsd: budgetLimitUsd,
    budgetLimitUsd,
    currentSpendUsd,
    spendUsd: currentSpendUsd,
    remainingUsd: data.remainingUsd !== undefined ? Number(data.remainingUsd) : undefined,
    overspendUsd: data.overspendUsd !== undefined ? Number(data.overspendUsd) : undefined,
    periodStart: data.periodStart ? String(data.periodStart) : undefined,
    periodEnd: data.periodEnd ? String(data.periodEnd) : undefined,
    severity: (data.severity as AlertSeverity) || "INFO",
    title: String(data.title || "Alert"),
    message: String(data.message || ""),
    dedupKey,
    deduplicationKey: dedupKey,
    status: normalizedStatus,
    createdAt: toDateString(data.createdAt),
    updatedAt: data.updatedAt ? toDateString(data.updatedAt) : undefined,
    acknowledgedAt: data.acknowledgedAt ? toDateString(data.acknowledgedAt) : undefined,
    resolvedAt: data.resolvedAt ? toDateString(data.resolvedAt) : undefined,
    acknowledgedBy: data.acknowledgedBy ? String(data.acknowledgedBy) : undefined,
    resolvedBy: data.resolvedBy ? String(data.resolvedBy) : undefined,
  };
}

/**
 * Creates an alert if an active or acknowledged alert with the same dedupKey does not already exist.
 * Uses deterministic document ID matching dedupKey for race-condition prevention.
 */
export async function createDeduplicatedAlert(
  orgId: string,
  params: CreateDeduplicatedAlertParams
): Promise<Alert | null> {
  const db = getAdminFirestore();
  const alertDocId = params.dedupKey || params.deduplicationKey || `alert_${Date.now()}`;
  const alertRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("alerts")
    .doc(alertDocId);

  const existingDoc = await alertRef.get();

  // If already exists, do not recreate/duplicate
  if (existingDoc.exists) {
    const existingData = existingDoc.data() || {};
    const existingStatus = String(existingData.status || "ACTIVE").toUpperCase();
    if (existingStatus === "ACTIVE" || existingStatus === "ACKNOWLEDGED") {
      return null; // Suppress duplicate alert for this period
    }
  }

  const now = FieldValue.serverTimestamp();
  const limitUsd = params.budgetAmountUsd ?? params.budgetLimitUsd ?? null;
  const spendUsd = params.currentSpendUsd ?? params.spendUsd ?? null;

  const alertPayload: Record<string, unknown> = {
    id: alertDocId,
    organizationId: orgId,
    projectId: params.projectId || null,
    budgetId: params.budgetId || null,
    type: params.type,
    thresholdPercent: params.thresholdPercent ?? null,
    budgetAmountUsd: limitUsd,
    budgetLimitUsd: limitUsd,
    currentSpendUsd: spendUsd,
    spendUsd,
    remainingUsd: params.remainingUsd ?? null,
    overspendUsd: params.overspendUsd ?? null,
    periodStart: params.periodStart || null,
    periodEnd: params.periodEnd || null,
    severity: params.severity,
    title: params.title,
    message: params.message,
    dedupKey: alertDocId,
    deduplicationKey: alertDocId,
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
  };

  await alertRef.set(alertPayload, { merge: true });

  await recordAuditLog({
    organizationId: orgId,
    actorId: "system",
    action: "ALERT_CREATED",
    resourceType: "alert",
    resourceId: alertDocId,
    details: {
      type: params.type,
      severity: params.severity,
      thresholdPercent: params.thresholdPercent,
      budgetId: params.budgetId,
    },
  });

  const createdAlert = sanitizeAlert(alertDocId, {
    ...alertPayload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Emit in-app notification event
  emitNotification({
    organizationId: orgId,
    projectId: params.projectId,
    budgetId: params.budgetId,
    alertId: alertDocId,
    type: params.type,
    severity: params.severity,
    title: params.title,
    message: params.message,
    timestamp: new Date().toISOString(),
  }).catch((err) => console.error("[OsterdOps Alert] Notification emit failed:", err));

  return createdAlert;
}

/**
 * Phase 12 alias for createDeduplicatedAlert.
 */
export async function createAlert(
  orgId: string,
  params: CreateDeduplicatedAlertParams
): Promise<Alert | null> {
  return createDeduplicatedAlert(orgId, params);
}

/**
 * Evaluates candidate alert list and creates deduplicated alerts.
 */
export async function evaluateAndCreateAlerts(
  orgId: string,
  candidates: CreateDeduplicatedAlertParams[]
): Promise<Alert[]> {
  const created: Alert[] = [];
  for (const candidate of candidates) {
    const alert = await createDeduplicatedAlert(orgId, candidate);
    if (alert) created.push(alert);
  }
  return created;
}

/**
 * Lists alerts for an organization with optional bounded filtering.
 */
export async function listOrganizationAlerts(
  orgId: string,
  options: AlertFilterOptions | number = {}
): Promise<Alert[]> {
  const db = getAdminFirestore();

  const filterOptions: AlertFilterOptions = typeof options === "number"
    ? { limit: options }
    : options;

  const limit = Math.min(Math.max(1, filterOptions.limit || 50), 100);

  let query = db
    .collection("organizations")
    .doc(orgId)
    .collection("alerts")
    .orderBy("createdAt", "desc");

  if (filterOptions.projectId) {
    query = query.where("projectId", "==", filterOptions.projectId) as typeof query;
  }

  if (filterOptions.budgetId) {
    query = query.where("budgetId", "==", filterOptions.budgetId) as typeof query;
  }

  if (filterOptions.status) {
    const normStatus = String(filterOptions.status).toUpperCase();
    query = query.where("status", "==", normStatus) as typeof query;
  }

  if (filterOptions.severity) {
    query = query.where("severity", "==", filterOptions.severity) as typeof query;
  }

  if (filterOptions.type) {
    query = query.where("type", "==", filterOptions.type) as typeof query;
  }

  if (filterOptions.startDate) {
    const startTimestamp = Timestamp.fromDate(new Date(filterOptions.startDate));
    query = query.where("createdAt", ">=", startTimestamp) as typeof query;
  }

  if (filterOptions.endDate) {
    const endTimestamp = Timestamp.fromDate(new Date(filterOptions.endDate));
    query = query.where("createdAt", "<=", endTimestamp) as typeof query;
  }

  const snap = await query.limit(limit).get();
  return snap.docs.map((doc) => sanitizeAlert(doc.id, doc.data()));
}

/**
 * Phase 12 alias for listOrganizationAlerts.
 */
export async function listAlerts(
  orgId: string,
  options: AlertFilterOptions | number = {}
): Promise<Alert[]> {
  return listOrganizationAlerts(orgId, options);
}

/**
 * Retrieves a single alert by ID.
 */
export async function getAlert(orgId: string, alertId: string): Promise<Alert | null> {
  const db = getAdminFirestore();
  const doc = await db
    .collection("organizations")
    .doc(orgId)
    .collection("alerts")
    .doc(alertId)
    .get();

  if (!doc.exists) return null;
  return sanitizeAlert(doc.id, doc.data() || {});
}

/**
 * Transitions an alert from ACTIVE to ACKNOWLEDGED.
 */
export async function acknowledgeAlert(
  orgId: string,
  alertId: string,
  actorId: string
): Promise<Alert | null> {
  const db = getAdminFirestore();
  const alertRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("alerts")
    .doc(alertId);

  const doc = await alertRef.get();
  if (!doc.exists) return null;

  const now = FieldValue.serverTimestamp();
  await alertRef.update({
    status: "ACKNOWLEDGED",
    acknowledgedAt: now,
    acknowledgedBy: actorId,
    updatedAt: now,
  });

  await recordAuditLog({
    organizationId: orgId,
    actorId,
    action: "ALERT_ACKNOWLEDGED",
    resourceType: "alert",
    resourceId: alertId,
  });

  const updatedDoc = await alertRef.get();
  return sanitizeAlert(updatedDoc.id, updatedDoc.data() || {});
}

/**
 * Transitions an alert to RESOLVED.
 */
export async function resolveAlert(
  orgId: string,
  alertId: string,
  actorId: string
): Promise<Alert | null> {
  const db = getAdminFirestore();
  const alertRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("alerts")
    .doc(alertId);

  const doc = await alertRef.get();
  if (!doc.exists) return null;

  const now = FieldValue.serverTimestamp();
  await alertRef.update({
    status: "RESOLVED",
    resolvedAt: now,
    resolvedBy: actorId,
    updatedAt: now,
  });

  await recordAuditLog({
    organizationId: orgId,
    actorId,
    action: "ALERT_RESOLVED",
    resourceType: "alert",
    resourceId: alertId,
  });

  const updatedDoc = await alertRef.get();
  return sanitizeAlert(updatedDoc.id, updatedDoc.data() || {});
}
