/**
 * OsterdOps — Cost Engine & Spend Aggregation Service Layer
 * Stores durable, structured CostRecords under multi-tenant paths:
 * organizations/{organizationId}/costs/{usageId}
 * Provides bounded cost queries and multi-dimensional financial aggregations.
 */

import "server-only";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type {
  CostRecord,
  CostFilterOptions,
  CostAggregationResult,
  CostSpendGroup,
  PricingStatus,
} from "@/types";

export interface RecordCostParams {
  usageId: string;
  requestId: string;
  organizationId: string;
  projectId: string;
  apiKeyId: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cachedTokens?: number;
  reasoningTokens?: number;
  inputCostUsd: number | null;
  outputCostUsd: number | null;
  cachedInputCostUsd: number | null;
  reasoningCostUsd: number | null;
  totalCostUsd: number | null;
  pricingVersion: string;
  pricingEffectiveAt: string;
  pricingStatus: PricingStatus;
  unavailableReason?: string;
}

/**
 * Sanitizes a Firestore cost document into a typed CostRecord.
 */
function sanitizeCostRecord(docId: string, data: Record<string, unknown>): CostRecord {
  const toDateString = (val: unknown): string => {
    if (!val) return new Date().toISOString();
    if (typeof val === "string") return val;
    if (typeof val === "object" && val !== null && "toDate" in val && typeof (val as { toDate: () => Date }).toDate === "function") {
      return (val as { toDate: () => Date }).toDate().toISOString();
    }
    return new Date().toISOString();
  };

  return {
    id: docId,
    usageId: String(data.usageId || docId),
    requestId: String(data.requestId || docId),
    organizationId: String(data.organizationId || ""),
    projectId: String(data.projectId || ""),
    apiKeyId: String(data.apiKeyId || ""),
    provider: String(data.provider || "openai"),
    model: String(data.model || "unknown"),
    inputTokens: Number(data.inputTokens) || 0,
    outputTokens: Number(data.outputTokens) || 0,
    cachedTokens: Number(data.cachedTokens) || 0,
    reasoningTokens: Number(data.reasoningTokens) || 0,
    inputCostUsd: data.inputCostUsd !== null && data.inputCostUsd !== undefined ? Number(data.inputCostUsd) : null,
    outputCostUsd: data.outputCostUsd !== null && data.outputCostUsd !== undefined ? Number(data.outputCostUsd) : null,
    cachedInputCostUsd: data.cachedInputCostUsd !== null && data.cachedInputCostUsd !== undefined ? Number(data.cachedInputCostUsd) : null,
    reasoningCostUsd: data.reasoningCostUsd !== null && data.reasoningCostUsd !== undefined ? Number(data.reasoningCostUsd) : null,
    totalCostUsd: data.totalCostUsd !== null && data.totalCostUsd !== undefined ? Number(data.totalCostUsd) : null,
    pricingVersion: String(data.pricingVersion || "2026-08"),
    pricingEffectiveAt: String(data.pricingEffectiveAt || "2026-01-01"),
    pricingStatus: (data.pricingStatus as PricingStatus) || "AVAILABLE",
    unavailableReason: data.unavailableReason ? String(data.unavailableReason) : undefined,
    timestamp: toDateString(data.timestamp),
    datePartition: String(data.datePartition || new Date().toISOString().slice(0, 10)),
  };
}

/**
 * Persists a calculated CostRecord to Firestore idempotently.
 */
export async function recordCost(params: RecordCostParams): Promise<CostRecord> {
  const db = getAdminFirestore();
  const orgId = params.organizationId;
  const usageId = params.usageId || params.requestId;

  const now = FieldValue.serverTimestamp();
  const datePartition = new Date().toISOString().slice(0, 10);

  const costPayload: Record<string, unknown> = {
    id: usageId,
    usageId,
    requestId: params.requestId,
    organizationId: orgId,
    projectId: params.projectId,
    apiKeyId: params.apiKeyId,
    provider: params.provider.toLowerCase(),
    model: params.model,
    inputTokens: params.inputTokens,
    outputTokens: params.outputTokens,
    cachedTokens: params.cachedTokens || 0,
    reasoningTokens: params.reasoningTokens || 0,
    inputCostUsd: params.inputCostUsd,
    outputCostUsd: params.outputCostUsd,
    cachedInputCostUsd: params.cachedInputCostUsd,
    reasoningCostUsd: params.reasoningCostUsd,
    totalCostUsd: params.totalCostUsd,
    pricingVersion: params.pricingVersion,
    pricingEffectiveAt: params.pricingEffectiveAt,
    pricingStatus: params.pricingStatus,
    unavailableReason: params.unavailableReason || null,
    timestamp: now,
    datePartition,
  };

  const costRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("costs")
    .doc(usageId);

  // Idempotency check: if record already exists for this usageId, avoid double-incrementing spend
  const existingDoc = await costRef.get();
  if (existingDoc.exists) {
    return sanitizeCostRecord(existingDoc.id, existingDoc.data() || {});
  }

  const batch = db.batch();

  // 1. Idempotent set on organizations/{orgId}/costs/{usageId}
  batch.set(costRef, costPayload, { merge: true });

  // 2. Atomically increment spend counters if cost is valid
  if (params.totalCostUsd !== null && params.totalCostUsd > 0) {
    if (params.projectId) {
      const projectRef = db
        .collection("organizations")
        .doc(orgId)
        .collection("projects")
        .doc(params.projectId);

      batch.update(projectRef, {
        currentMonthSpend: FieldValue.increment(params.totalCostUsd),
        updatedAt: now,
      });
    }

    const orgRef = db.collection("organizations").doc(orgId);
    batch.update(orgRef, {
      currentPeriodSpendUsd: FieldValue.increment(params.totalCostUsd),
      updatedAt: now,
    });
  }

  await batch.commit();

  return sanitizeCostRecord(usageId, {
    ...costPayload,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Lists cost records for an organization with optional filtering.
 */
export async function listOrganizationCosts(
  orgId: string,
  options: CostFilterOptions = {}
): Promise<CostRecord[]> {
  const db = getAdminFirestore();
  const limit = Math.min(Math.max(1, options.limit || 50), 200);

  let query = db
    .collection("organizations")
    .doc(orgId)
    .collection("costs")
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

  if (options.pricingStatus) {
    query = query.where("pricingStatus", "==", options.pricingStatus) as typeof query;
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
  let results = snap.docs.map((doc) => sanitizeCostRecord(doc.id, doc.data()));

  if (options.model) {
    const targetModel = options.model.toLowerCase();
    results = results.filter((r) => r.model.toLowerCase() === targetModel);
  }

  return results;
}

/**
 * Lists cost records scoped to a specific project.
 */
export async function listProjectCosts(
  orgId: string,
  projectId: string,
  options: Omit<CostFilterOptions, "projectId"> = {}
): Promise<CostRecord[]> {
  return listOrganizationCosts(orgId, {
    ...options,
    projectId,
  });
}

/**
 * Aggregates spend and financial metrics across organization/project dimensions.
 */
export async function aggregateSpend(
  orgId: string,
  options: CostFilterOptions = {}
): Promise<CostAggregationResult> {
  const records = await listOrganizationCosts(orgId, {
    ...options,
    limit: 200,
  });

  const emptyGroup = (): CostSpendGroup => ({
    spendUsd: 0,
    requests: 0,
    totalTokens: 0,
    inputTokens: 0,
    outputTokens: 0,
    cachedTokens: 0,
  });

  const result: CostAggregationResult = {
    totalSpendUsd: 0,
    totalRequests: 0,
    totalTokens: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalCachedTokens: 0,
    totalReasoningTokens: 0,
    byProvider: {},
    byModel: {},
    byProject: {},
    dailySpend: [],
  };

  const dailyMap = new Map<string, { spendUsd: number; requests: number; tokens: number }>();

  for (const record of records) {
    const cost = record.totalCostUsd || 0;
    const inTokens = record.inputTokens || 0;
    const outTokens = record.outputTokens || 0;
    const totTokens = inTokens + outTokens;
    const cachedTokens = record.cachedTokens || 0;
    const reasoningTokens = record.reasoningTokens || 0;
    const provider = record.provider || "unknown";
    const model = record.model || "unknown";
    const proj = record.projectId || "unknown";
    const day = record.datePartition || "unknown";

    // Totals
    result.totalSpendUsd = Math.round((result.totalSpendUsd + cost) * 100_000_000) / 100_000_000;
    result.totalRequests += 1;
    result.totalTokens += totTokens;
    result.totalInputTokens += inTokens;
    result.totalOutputTokens += outTokens;
    result.totalCachedTokens += cachedTokens;
    result.totalReasoningTokens += reasoningTokens;

    // By Provider
    if (!result.byProvider[provider]) result.byProvider[provider] = emptyGroup();
    result.byProvider[provider].spendUsd = Math.round((result.byProvider[provider].spendUsd + cost) * 100_000_000) / 100_000_000;
    result.byProvider[provider].requests += 1;
    result.byProvider[provider].totalTokens += totTokens;
    result.byProvider[provider].inputTokens += inTokens;
    result.byProvider[provider].outputTokens += outTokens;
    result.byProvider[provider].cachedTokens += cachedTokens;

    // By Model
    if (!result.byModel[model]) result.byModel[model] = emptyGroup();
    result.byModel[model].spendUsd = Math.round((result.byModel[model].spendUsd + cost) * 100_000_000) / 100_000_000;
    result.byModel[model].requests += 1;
    result.byModel[model].totalTokens += totTokens;
    result.byModel[model].inputTokens += inTokens;
    result.byModel[model].outputTokens += outTokens;
    result.byModel[model].cachedTokens += cachedTokens;

    // By Project
    if (!result.byProject[proj]) result.byProject[proj] = emptyGroup();
    result.byProject[proj].spendUsd = Math.round((result.byProject[proj].spendUsd + cost) * 100_000_000) / 100_000_000;
    result.byProject[proj].requests += 1;
    result.byProject[proj].totalTokens += totTokens;
    result.byProject[proj].inputTokens += inTokens;
    result.byProject[proj].outputTokens += outTokens;
    result.byProject[proj].cachedTokens += cachedTokens;

    // Daily
    const dayEntry = dailyMap.get(day) || { spendUsd: 0, requests: 0, tokens: 0 };
    dayEntry.spendUsd = Math.round((dayEntry.spendUsd + cost) * 100_000_000) / 100_000_000;
    dayEntry.requests += 1;
    dayEntry.tokens += totTokens;
    dailyMap.set(day, dayEntry);
  }

  result.dailySpend = Array.from(dailyMap.entries()).map(([date, data]) => ({
    date,
    spendUsd: data.spendUsd,
    requests: data.requests,
    tokens: data.tokens,
  })).sort((a, b) => a.date.localeCompare(b.date));

  return result;
}
