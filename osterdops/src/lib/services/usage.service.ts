/**
 * OsterdOps — Telemetry & Usage Tracking Service Layer
 * Stores durable, structured token usage records in Firestore under multi-tenant paths:
 * organizations/{organizationId}/usage/{requestId}
 * Supports bounded querying, filtering by project/provider/model/date, and aggregation.
 */

import "server-only";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type {
  UsageRecord,
  UsageRequestStatus,
  UsageFilterOptions,
  UsageAggregationResult,
  UsageAggregationGroup,
} from "@/types";

export interface RecordUsageParams {
  requestId: string;
  organizationId: string;
  projectId: string;
  apiKeyId: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cachedTokens?: number;
  reasoningTokens?: number;
  latencyMs: number;
  statusCode: number;
  status: UsageRequestStatus;
  errorCode?: string;
  costUsd?: number;
  costType?: "calculated" | "provider-reported" | "estimated";
}

/**
 * Sanitizes and normalizes a Firestore document snapshot into a typed UsageRecord.
 */
function sanitizeUsageRecord(docId: string, data: Record<string, unknown>): UsageRecord {
  const toDateString = (val: unknown): string => {
    if (!val) return new Date().toISOString();
    if (typeof val === "string") return val;
    if (typeof val === "object" && val !== null && "toDate" in val && typeof (val as { toDate: () => Date }).toDate === "function") {
      return (val as { toDate: () => Date }).toDate().toISOString();
    }
    return new Date().toISOString();
  };

  const inputTokens = Number(data.inputTokens) || 0;
  const outputTokens = Number(data.outputTokens) || 0;
  const totalTokens = Number(data.totalTokens) || (inputTokens + outputTokens);

  return {
    id: docId,
    requestId: String(data.requestId || docId),
    organizationId: String(data.organizationId || ""),
    projectId: String(data.projectId || ""),
    apiKeyId: String(data.apiKeyId || ""),
    provider: String(data.provider || "openai"),
    model: String(data.model || "unknown"),
    inputTokens,
    outputTokens,
    totalTokens,
    cachedTokens: data.cachedTokens !== undefined ? Number(data.cachedTokens) : undefined,
    reasoningTokens: data.reasoningTokens !== undefined ? Number(data.reasoningTokens) : undefined,
    costUsd: data.costUsd !== undefined ? Number(data.costUsd) : undefined,
    costType: data.costType as UsageRecord["costType"],
    latencyMs: Number(data.latencyMs) || 0,
    statusCode: Number(data.statusCode) || 200,
    status: (data.status as UsageRequestStatus) || (Number(data.statusCode) < 400 ? "SUCCESS" : "ERROR"),
    errorCode: data.errorCode ? String(data.errorCode) : undefined,
    timestamp: toDateString(data.timestamp),
    datePartition: String(data.datePartition || new Date().toISOString().slice(0, 10)),
  };
}

/**
 * Persists a gateway usage record and atomically increments project counters.
 * Idempotent: keyed by requestId to guarantee that duplicate delivery/retries do not double-count tokens.
 */
export async function recordGatewayUsage(params: RecordUsageParams): Promise<UsageRecord> {
  const db = getAdminFirestore();
  const orgId = params.organizationId;
  const projectId = params.projectId;
  const requestId = params.requestId;

  const now = FieldValue.serverTimestamp();
  const datePartition = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  const inputTokens = Math.max(0, Number(params.inputTokens) || 0);
  const outputTokens = Math.max(0, Number(params.outputTokens) || 0);
  const totalTokens = Number(params.totalTokens) > 0 ? Number(params.totalTokens) : inputTokens + outputTokens;

  const usagePayload: Record<string, unknown> = {
    id: requestId,
    requestId,
    organizationId: orgId,
    projectId,
    apiKeyId: params.apiKeyId,
    provider: params.provider.toLowerCase(),
    model: params.model,
    inputTokens,
    outputTokens,
    totalTokens,
    cachedTokens: params.cachedTokens ?? 0,
    reasoningTokens: params.reasoningTokens ?? 0,
    latencyMs: Math.max(0, Number(params.latencyMs) || 0),
    statusCode: Number(params.statusCode) || 200,
    status: params.status || (params.statusCode < 400 ? "SUCCESS" : "ERROR"),
    errorCode: params.errorCode || null,
    timestamp: now,
    datePartition,
  };

  if (params.costUsd !== undefined) {
    usagePayload.costUsd = params.costUsd;
    usagePayload.costType = params.costType || "calculated";
  }

  const usageRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("usage")
    .doc(requestId);

  // Idempotency check: if record already exists for this requestId, avoid double-incrementing counters
  const existingDoc = await usageRef.get();
  if (existingDoc.exists) {
    return sanitizeUsageRecord(existingDoc.id, existingDoc.data() || {});
  }

  const batch = db.batch();

  // 1. Idempotent set on organizations/{orgId}/usage/{requestId}
  batch.set(usageRef, usagePayload, { merge: true });

  // 2. Increment project counters atomically if projectId exists
  if (projectId) {
    const projectRef = db
      .collection("organizations")
      .doc(orgId)
      .collection("projects")
      .doc(projectId);

    const projectUpdates: Record<string, unknown> = {
      totalRequests: FieldValue.increment(1),
      totalTokens: FieldValue.increment(totalTokens),
      updatedAt: now,
    };

    if (params.costUsd !== undefined && params.costUsd > 0) {
      projectUpdates.currentMonthSpend = FieldValue.increment(params.costUsd);
    }

    batch.update(projectRef, projectUpdates);
  }

  // 3. Atomically increment organization spend counter if cost supplied
  if (params.costUsd !== undefined && params.costUsd > 0) {
    const orgRef = db.collection("organizations").doc(orgId);
    batch.update(orgRef, {
      currentPeriodSpendUsd: FieldValue.increment(params.costUsd),
      updatedAt: now,
    });
  }

  await batch.commit();

  return sanitizeUsageRecord(requestId, {
    ...usagePayload,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Lists usage records for an organization with optional filtering.
 */
export async function listOrganizationUsage(
  orgId: string,
  options: UsageFilterOptions = {}
): Promise<UsageRecord[]> {
  const db = getAdminFirestore();
  const limit = Math.min(Math.max(1, options.limit || 50), 200);

  let query = db
    .collection("organizations")
    .doc(orgId)
    .collection("usage")
    .orderBy("timestamp", "desc");

  if (options.projectId) {
    query = query.where("projectId", "==", options.projectId) as typeof query;
  }

  if (options.provider) {
    query = query.where("provider", "==", options.provider.toLowerCase()) as typeof query;
  }

  if (options.apiKeyId) {
    query = query.where("apiKeyId", "==", options.apiKeyId) as typeof query;
  }

  if (options.status) {
    query = query.where("status", "==", options.status) as typeof query;
  }

  if (options.startDate) {
    const startTimestamp = Timestamp.fromDate(new Date(options.startDate));
    query = query.where("timestamp", ">=", startTimestamp) as typeof query;
  }

  if (options.endDate) {
    const endTimestamp = Timestamp.fromDate(new Date(options.endDate));
    query = query.where("timestamp", "<=", endTimestamp) as typeof query;
  }

  const snap = await query.limit(limit).get();
  let results = snap.docs.map((doc) => sanitizeUsageRecord(doc.id, doc.data()));

  // In-memory model filter if specified (avoids requiring a complex composite index for every model)
  if (options.model) {
    const targetModel = options.model.toLowerCase();
    results = results.filter((r) => r.model.toLowerCase() === targetModel);
  }

  return results;
}

/**
 * Lists usage records scoped to a specific project.
 */
export async function listProjectUsage(
  orgId: string,
  projectId: string,
  options: Omit<UsageFilterOptions, "projectId"> = {}
): Promise<UsageRecord[]> {
  return listOrganizationUsage(orgId, {
    ...options,
    projectId,
  });
}

/**
 * Calculates aggregated usage statistics across an organization or project.
 */
export async function aggregateUsage(
  orgId: string,
  options: UsageFilterOptions = {}
): Promise<UsageAggregationResult> {
  const records = await listOrganizationUsage(orgId, {
    ...options,
    limit: 200,
  });

  const emptyGroup = (): UsageAggregationGroup => ({
    requests: 0,
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    cachedTokens: 0,
    reasoningTokens: 0,
  });

  const result: UsageAggregationResult = {
    totalRequests: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalTokens: 0,
    totalCachedTokens: 0,
    totalReasoningTokens: 0,
    byProvider: {},
    byModel: {},
    byProject: {},
    byStatus: {},
  };

  for (const record of records) {
    const inTokens = record.inputTokens || 0;
    const outTokens = record.outputTokens || 0;
    const totTokens = record.totalTokens || (inTokens + outTokens);
    const cachedTokens = record.cachedTokens || 0;
    const reasoningTokens = record.reasoningTokens || 0;
    const provider = record.provider || "unknown";
    const model = record.model || "unknown";
    const proj = record.projectId || "unknown";
    const status = record.status || "SUCCESS";

    // Totals
    result.totalRequests += 1;
    result.totalInputTokens += inTokens;
    result.totalOutputTokens += outTokens;
    result.totalTokens += totTokens;
    result.totalCachedTokens += cachedTokens;
    result.totalReasoningTokens += reasoningTokens;

    // By Provider
    if (!result.byProvider[provider]) result.byProvider[provider] = emptyGroup();
    result.byProvider[provider].requests += 1;
    result.byProvider[provider].inputTokens += inTokens;
    result.byProvider[provider].outputTokens += outTokens;
    result.byProvider[provider].totalTokens += totTokens;
    result.byProvider[provider].cachedTokens += cachedTokens;
    result.byProvider[provider].reasoningTokens += reasoningTokens;

    // By Model
    if (!result.byModel[model]) result.byModel[model] = emptyGroup();
    result.byModel[model].requests += 1;
    result.byModel[model].inputTokens += inTokens;
    result.byModel[model].outputTokens += outTokens;
    result.byModel[model].totalTokens += totTokens;
    result.byModel[model].cachedTokens += cachedTokens;
    result.byModel[model].reasoningTokens += reasoningTokens;

    // By Project
    if (!result.byProject[proj]) result.byProject[proj] = emptyGroup();
    result.byProject[proj].requests += 1;
    result.byProject[proj].inputTokens += inTokens;
    result.byProject[proj].outputTokens += outTokens;
    result.byProject[proj].totalTokens += totTokens;
    result.byProject[proj].cachedTokens += cachedTokens;
    result.byProject[proj].reasoningTokens += reasoningTokens;

    // By Status
    result.byStatus[status] = (result.byStatus[status] || 0) + 1;
  }

  return result;
}
