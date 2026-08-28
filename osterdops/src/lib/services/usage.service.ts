/**
 * OsterdOps — Telemetry & Usage Tracking Service
 */

import "server-only";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { evaluateBudgetsAfterSpend } from "./budget.service";
import type { UsageRecord, Project, Organization } from "@/types";

export interface RecordUsageParams {
  requestId: string;
  organization: Organization;
  project: Project;
  apiKeyId: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
  costType: "calculated" | "provider-reported" | "estimated";
  latencyMs: number;
  statusCode: number;
  errorCode?: string;
}

/**
 * Persists gateway telemetry and atomically increments spend counters.
 * Runs asynchronously to prevent adding latency to the client response.
 */
export async function recordGatewayUsage(params: RecordUsageParams): Promise<void> {
  const db = getAdminFirestore();
  const orgId = params.organization.id;
  const projectId = params.project.id;

  const now = FieldValue.serverTimestamp();
  const datePartition = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  const usageData: UsageRecord = {
    id: params.requestId,
    organizationId: orgId,
    projectId,
    apiKeyId: params.apiKeyId,
    provider: params.provider,
    model: params.model,
    inputTokens: params.inputTokens,
    outputTokens: params.outputTokens,
    totalTokens: params.totalTokens,
    costUsd: params.costUsd,
    costType: params.costType,
    latencyMs: params.latencyMs,
    statusCode: params.statusCode,
    errorCode: params.errorCode,
    timestamp: now as unknown as string,
    datePartition,
  };

  const batch = db.batch();

  // 1. Write telemetry record
  const usageRef = db.collection("organizations").doc(orgId).collection("usage").doc(params.requestId);
  batch.set(usageRef, usageData);

  // 2. Increment project counters atomically
  const projectRef = db.collection("organizations").doc(orgId).collection("projects").doc(projectId);
  batch.update(projectRef, {
    currentMonthSpend: FieldValue.increment(params.costUsd),
    totalRequests: FieldValue.increment(1),
    totalTokens: FieldValue.increment(params.totalTokens),
    updatedAt: now,
  });

  // 3. Increment organization spend counter atomically
  const orgRef = db.collection("organizations").doc(orgId);
  batch.update(orgRef, {
    currentPeriodSpendUsd: FieldValue.increment(params.costUsd),
    updatedAt: now,
  });

  await batch.commit();

  // 4. Non-blocking Post-Flight Budget & Alert Evaluation
  const newProjectSpend = (params.project.currentMonthSpend || 0) + params.costUsd;
  const newOrgSpend = (params.organization.currentPeriodSpendUsd || 0) + params.costUsd;

  evaluateBudgetsAfterSpend(
    params.organization,
    params.project,
    newProjectSpend,
    newOrgSpend
  ).catch((err) => console.error("[OsterdOps Budget Evaluator] Evaluation error:", err));
}

/**
 * Lists telemetry usage records for an organization.
 */
export async function listOrganizationUsage(
  orgId: string,
  projectId?: string,
  limit = 50
): Promise<UsageRecord[]> {
  const db = getAdminFirestore();
  let query = db
    .collection("organizations")
    .doc(orgId)
    .collection("usage")
    .orderBy("timestamp", "desc");

  if (projectId) {
    query = query.where("projectId", "==", projectId) as typeof query;
  }

  const snap = await query.limit(limit).get();

  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      organizationId: data.organizationId,
      projectId: data.projectId,
      apiKeyId: data.apiKeyId,
      provider: data.provider,
      model: data.model,
      inputTokens: data.inputTokens,
      outputTokens: data.outputTokens,
      totalTokens: data.totalTokens,
      costUsd: data.costUsd,
      costType: data.costType,
      latencyMs: data.latencyMs,
      statusCode: data.statusCode,
      errorCode: data.errorCode,
      timestamp: data.timestamp?.toDate?.()?.toISOString() || data.timestamp,
      datePartition: data.datePartition,
    } as UsageRecord;
  });
}
