/**
 * OsterdOps — Budget Service & Governance Engine (Phases 10 & 12)
 * Manages multi-tenant budget configurations under:
 * organizations/{organizationId}/budgets/{budgetId}
 * Enforces HARD vs SOFT spending caps, evaluates spend against Phase 9 Cost Engine,
 * and triggers deduplicated multi-channel threshold alerts.
 */

import "server-only";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import {
  getBudgetPeriodBoundaries,
  evaluateBudgetThresholds,
} from "@/lib/budget/evaluator";
import { createDeduplicatedAlert } from "./alert.service";
import { aggregateSpend } from "./cost.service";
import { recordAuditLog } from "./audit.service";
import { notifyBudgetThreshold, notifyBudgetExceeded } from "@/lib/notifications/notification.service";
import { cacheRegistry, invalidateBudgetPreflightCache } from "@/lib/cache";
import type {
  Budget,
  BudgetPeriod,
  BudgetStatus,
  EnforcementMode,
  EnforcementType,
  BudgetStatusResponse,
  BudgetEnforcementResult,
  Project,
  Organization,
} from "@/types";

export interface CreateBudgetParams {
  name: string;
  description?: string;
  amountUsd?: number;
  limitUsd?: number; // Phase 12 alias
  currency?: string;
  period: BudgetPeriod;
  projectId?: string;
  periodStart?: string;
  periodEnd?: string;
  thresholds?: number[];
  warningThresholds?: number[]; // Phase 12 alias
  alertThresholds?: number[];
  enabled?: boolean;
  enforcement?: EnforcementType; // "SOFT" | "HARD"
  enforcementMode?: EnforcementMode;
  enforceHardLimit?: boolean;
}

export interface UpdateBudgetParams {
  name?: string;
  description?: string;
  amountUsd?: number;
  limitUsd?: number;
  period?: BudgetPeriod;
  periodStart?: string;
  periodEnd?: string;
  thresholds?: number[];
  warningThresholds?: number[];
  alertThresholds?: number[];
  enabled?: boolean;
  enforcement?: EnforcementType;
  enforcementMode?: EnforcementMode;
  enforceHardLimit?: boolean;
  status?: BudgetStatus;
}

/**
 * Sanitizes a Firestore document into a typed Budget record.
 */
function sanitizeBudget(docId: string, data: Record<string, unknown>): Budget {
  const toDateString = (val: unknown): string => {
    if (!val) return new Date().toISOString();
    if (typeof val === "string") return val;
    if (typeof val === "object" && val !== null && "toDate" in val && typeof (val as { toDate: () => Date }).toDate === "function") {
      return (val as { toDate: () => Date }).toDate().toISOString();
    }
    return new Date().toISOString();
  };

  const rawStatus = String(data.status || "ACTIVE").toUpperCase();
  const normalizedStatus: BudgetStatus = (
    rawStatus === "PAUSED" ? "PAUSED" :
    rawStatus === "EXCEEDED" ? "EXCEEDED" :
    rawStatus === "ARCHIVED" ? "ARCHIVED" :
    rawStatus === "EXPIRED" ? "EXPIRED" : "ACTIVE"
  ) as BudgetStatus;

  const thresholds = Array.isArray(data.thresholds)
    ? data.thresholds.map(Number)
    : Array.isArray(data.warningThresholds)
      ? data.warningThresholds.map(Number)
      : Array.isArray(data.alertThresholds)
        ? data.alertThresholds.map(Number)
        : [50, 75, 90, 100];

  const triggeredThresholds = Array.isArray(data.triggeredThresholds)
    ? data.triggeredThresholds.map(Number)
    : [];

  const amount = Number(data.amountUsd ?? data.limitUsd) || 0;
  const currentSpend = Number(data.currentSpendUsd ?? data.spendUsd) || 0;
  const periodStart = data.periodStart || data.currentPeriodStart ? String(data.periodStart || data.currentPeriodStart) : undefined;
  const periodEnd = data.periodEnd || data.currentPeriodEnd ? String(data.periodEnd || data.currentPeriodEnd) : undefined;

  const enforcement: EnforcementType = (
    data.enforcement === "HARD" ||
    data.enforcementMode === "BLOCK" ||
    data.enforceHardLimit === true
  ) ? "HARD" : "SOFT";

  return {
    id: docId,
    organizationId: String(data.organizationId || ""),
    projectId: data.projectId ? String(data.projectId) : undefined,
    name: String(data.name || "Budget"),
    description: data.description ? String(data.description) : undefined,
    amountUsd: amount,
    limitUsd: amount,
    currentSpendUsd: currentSpend,
    currency: String(data.currency || "USD"),
    period: (data.period as BudgetPeriod) || "MONTHLY",
    periodStart,
    periodEnd,
    currentPeriodStart: periodStart,
    currentPeriodEnd: periodEnd,
    thresholds,
    warningThresholds: thresholds,
    alertThresholds: thresholds,
    triggeredThresholds,
    enabled: data.enabled !== undefined ? Boolean(data.enabled) : true,
    enforcement,
    enforcementMode: enforcement === "HARD" ? "BLOCK" : "MONITOR",
    enforceHardLimit: enforcement === "HARD",
    status: normalizedStatus,
    createdBy: data.createdBy ? String(data.createdBy) : undefined,
    createdAt: toDateString(data.createdAt),
    updatedAt: toDateString(data.updatedAt),
  };
}

/**
 * Creates a new budget configuration for an Organization or Project.
 */
export async function createBudget(
  orgId: string,
  params: CreateBudgetParams,
  actorId?: string
): Promise<Budget> {
  if (!params.name || !params.name.trim()) {
    throw new Error("Budget name is required.");
  }
  const amount = params.amountUsd ?? params.limitUsd;
  if (typeof amount !== "number" || amount <= 0) {
    throw new Error("Budget limit must be a positive number.");
  }

  const db = getAdminFirestore();

  // If projectId is provided, verify it belongs to this organization
  if (params.projectId) {
    const projectDoc = await db
      .collection("organizations")
      .doc(orgId)
      .collection("projects")
      .doc(params.projectId)
      .get();

    if (!projectDoc.exists) {
      throw new Error(`Project '${params.projectId}' not found in organization.`);
    }
  }

  const boundaries = getBudgetPeriodBoundaries(
    params.period || "MONTHLY",
    params.periodStart,
    params.periodEnd
  );

  const budgetRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("budgets")
    .doc();

  const budgetId = budgetRef.id;
  const now = FieldValue.serverTimestamp();

  const thresholds = params.thresholds || params.warningThresholds || params.alertThresholds || [50, 75, 90, 100];
  const distinctThresholds = Array.from(
    new Set(thresholds.filter((t) => typeof t === "number" && t > 0 && t <= 200))
  ).sort((a, b) => a - b);

  const enforcement: EnforcementType = (
    params.enforcement === "HARD" ||
    params.enforcementMode === "BLOCK" ||
    params.enforceHardLimit === true
  ) ? "HARD" : "SOFT";

  const budgetPayload: Record<string, unknown> = {
    id: budgetId,
    organizationId: orgId,
    projectId: params.projectId || null,
    name: params.name.trim(),
    description: params.description?.trim() || null,
    amountUsd: amount,
    limitUsd: amount,
    currentSpendUsd: 0,
    currency: params.currency || "USD",
    period: params.period || "MONTHLY",
    periodStart: boundaries.periodStart,
    periodEnd: boundaries.periodEnd,
    currentPeriodStart: boundaries.periodStart,
    currentPeriodEnd: boundaries.periodEnd,
    thresholds: distinctThresholds,
    warningThresholds: distinctThresholds,
    alertThresholds: distinctThresholds,
    triggeredThresholds: [],
    enabled: params.enabled !== undefined ? Boolean(params.enabled) : true,
    enforcement,
    enforcementMode: enforcement === "HARD" ? "BLOCK" : "MONITOR",
    enforceHardLimit: enforcement === "HARD",
    status: "ACTIVE",
    createdBy: actorId || null,
    createdAt: now,
    updatedAt: now,
  };

  await budgetRef.set(budgetPayload);

  // Phase 27: Active cache invalidation
  invalidateBudgetPreflightCache(orgId, params.projectId || undefined);

  if (actorId) {
    await recordAuditLog({
      organizationId: orgId,
      actorId,
      action: "BUDGET_CREATED",
      resourceType: "budget",
      resourceId: budgetId,
      details: { name: params.name, amountUsd: amount, enforcement, period: params.period },
    });
  }

  return sanitizeBudget(budgetId, {
    ...budgetPayload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Retrieves a single budget by ID.
 */
export async function getBudget(orgId: string, budgetId: string): Promise<Budget | null> {
  const db = getAdminFirestore();
  const doc = await db
    .collection("organizations")
    .doc(orgId)
    .collection("budgets")
    .doc(budgetId)
    .get();

  if (!doc.exists) return null;
  return sanitizeBudget(doc.id, doc.data() || {});
}

/**
 * Lists all budgets configured for an organization (with optional projectId filter).
 */
export async function listOrganizationBudgets(
  orgId: string,
  projectId?: string
): Promise<Budget[]> {
  const db = getAdminFirestore();
  let query = db
    .collection("organizations")
    .doc(orgId)
    .collection("budgets")
    .orderBy("createdAt", "desc");

  if (projectId) {
    query = query.where("projectId", "==", projectId) as typeof query;
  }

  const snap = await query.get();
  return snap.docs.map((doc) => sanitizeBudget(doc.id, doc.data()));
}

/**
 * Phase 12 alias for listOrganizationBudgets.
 */
export async function listBudgets(
  orgId: string,
  projectId?: string
): Promise<Budget[]> {
  return listOrganizationBudgets(orgId, projectId);
}

/**
 * Updates an existing budget configuration.
 */
export async function updateBudget(
  orgId: string,
  budgetId: string,
  updates: UpdateBudgetParams,
  actorId?: string
): Promise<Budget | null> {
  const db = getAdminFirestore();
  const budgetRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("budgets")
    .doc(budgetId);

  const doc = await budgetRef.get();
  if (!doc.exists) return null;

  const patch: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (updates.name !== undefined) {
    if (!updates.name.trim()) throw new Error("Budget name cannot be empty.");
    patch.name = updates.name.trim();
  }
  if (updates.description !== undefined) patch.description = updates.description.trim() || null;
  const newAmount = updates.amountUsd ?? updates.limitUsd;
  if (newAmount !== undefined) {
    if (newAmount <= 0) throw new Error("Budget limit must be positive.");
    patch.amountUsd = newAmount;
    patch.limitUsd = newAmount;
  }
  if (updates.period !== undefined) {
    patch.period = updates.period;
    const boundaries = getBudgetPeriodBoundaries(updates.period, updates.periodStart, updates.periodEnd);
    patch.periodStart = boundaries.periodStart;
    patch.periodEnd = boundaries.periodEnd;
    patch.currentPeriodStart = boundaries.periodStart;
    patch.currentPeriodEnd = boundaries.periodEnd;
  }
  if (updates.thresholds !== undefined || updates.warningThresholds !== undefined || updates.alertThresholds !== undefined) {
    const raw = updates.thresholds || updates.warningThresholds || updates.alertThresholds || [];
    const distinct = Array.from(new Set(raw.filter((t) => typeof t === "number" && t > 0 && t <= 200))).sort((a, b) => a - b);
    patch.thresholds = distinct;
    patch.warningThresholds = distinct;
    patch.alertThresholds = distinct;
  }
  if (updates.enabled !== undefined) patch.enabled = Boolean(updates.enabled);

  if (updates.enforcement !== undefined || updates.enforcementMode !== undefined || updates.enforceHardLimit !== undefined) {
    const enf: EnforcementType = (
      updates.enforcement === "HARD" ||
      updates.enforcementMode === "BLOCK" ||
      updates.enforceHardLimit === true
    ) ? "HARD" : "SOFT";
    patch.enforcement = enf;
    patch.enforcementMode = enf === "HARD" ? "BLOCK" : "MONITOR";
    patch.enforceHardLimit = enf === "HARD";

    if (actorId) {
      await recordAuditLog({
        organizationId: orgId,
        actorId,
        action: "BUDGET_ENFORCEMENT_CHANGED",
        resourceType: "budget",
        resourceId: budgetId,
        details: { enforcement: enf },
      });
    }
  }

  if (updates.status !== undefined) patch.status = String(updates.status).toUpperCase();

  await budgetRef.update(patch);

  // Phase 27: Active cache invalidation
  invalidateBudgetPreflightCache(orgId);

  if (actorId) {
    await recordAuditLog({
      organizationId: orgId,
      actorId,
      action: "BUDGET_UPDATED",
      resourceType: "budget",
      resourceId: budgetId,
      details: { updates: Object.keys(patch) },
    });
  }

  const updatedDoc = await budgetRef.get();
  return sanitizeBudget(updatedDoc.id, updatedDoc.data() || {});
}

/**
 * Pauses a budget so that alerts and hard blocking are temporarily disabled.
 */
export async function pauseBudget(
  orgId: string,
  budgetId: string,
  actorId?: string
): Promise<Budget | null> {
  const db = getAdminFirestore();
  const budgetRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("budgets")
    .doc(budgetId);

  const doc = await budgetRef.get();
  if (!doc.exists) return null;

  await budgetRef.update({
    status: "PAUSED",
    enabled: false,
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Phase 27: Active cache invalidation
  invalidateBudgetPreflightCache(orgId);

  if (actorId) {
    await recordAuditLog({
      organizationId: orgId,
      actorId,
      action: "BUDGET_PAUSED",
      resourceType: "budget",
      resourceId: budgetId,
    });
  }

  const updated = await budgetRef.get();
  return sanitizeBudget(updated.id, updated.data() || {});
}

/**
 * Resumes a paused budget.
 */
export async function resumeBudget(
  orgId: string,
  budgetId: string,
  actorId?: string
): Promise<Budget | null> {
  const db = getAdminFirestore();
  const budgetRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("budgets")
    .doc(budgetId);

  const doc = await budgetRef.get();
  if (!doc.exists) return null;

  await budgetRef.update({
    status: "ACTIVE",
    enabled: true,
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Phase 27: Active cache invalidation
  invalidateBudgetPreflightCache(orgId);

  if (actorId) {
    await recordAuditLog({
      organizationId: orgId,
      actorId,
      action: "BUDGET_RESUMED",
      resourceType: "budget",
      resourceId: budgetId,
    });
  }

  // Re-evaluate immediately upon resume
  await evaluateBudget(orgId, budgetId);

  const updated = await budgetRef.get();
  return sanitizeBudget(updated.id, updated.data() || {});
}

/**
 * Deletes a budget document.
 */
export async function deleteBudget(
  orgId: string,
  budgetId: string,
  actorId?: string
): Promise<boolean> {
  const db = getAdminFirestore();
  const budgetRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("budgets")
    .doc(budgetId);

  const doc = await budgetRef.get();
  if (!doc.exists) return false;

  await budgetRef.delete();

  // Phase 27: Active cache invalidation
  invalidateBudgetPreflightCache(orgId);

  if (actorId) {
    await recordAuditLog({
      organizationId: orgId,
      actorId,
      action: "BUDGET_DELETED",
      resourceType: "budget",
      resourceId: budgetId,
    });
  }

  return true;
}

/**
 * Evaluates a single budget against authoritative Phase 9 Cost Engine records,
 * generating deduplicated alerts and dispatching multi-channel notifications.
 */
export async function evaluateBudget(
  orgId: string,
  budgetId: string
): Promise<BudgetStatusResponse | null> {
  const budget = await getBudget(orgId, budgetId);
  if (!budget || budget.status === "ARCHIVED" || budget.status === "PAUSED") return null;

  const boundaries = getBudgetPeriodBoundaries(
    budget.period,
    budget.periodStart,
    budget.periodEnd
  );

  // Consume authoritative Cost Engine aggregations for this period
  const spendAggregate = await aggregateSpend(orgId, {
    projectId: budget.projectId,
    startDate: boundaries.periodStart,
    endDate: boundaries.periodEnd,
  });

  const evalResult = evaluateBudgetThresholds(budget, spendAggregate, boundaries);

  // Create deduplicated alerts and emit notifications for any crossed thresholds
  for (const alertCandidate of evalResult.candidateAlerts) {
    const alert = await createDeduplicatedAlert(orgId, {
      budgetId: budget.id,
      projectId: budget.projectId,
      type: alertCandidate.type,
      thresholdPercent: alertCandidate.thresholdPercent,
      budgetAmountUsd: alertCandidate.budgetAmountUsd,
      currentSpendUsd: alertCandidate.currentSpendUsd,
      remainingUsd: alertCandidate.remainingUsd,
      overspendUsd: alertCandidate.overspendUsd,
      periodStart: boundaries.periodStart,
      periodEnd: boundaries.periodEnd,
      severity: alertCandidate.severity,
      title: alertCandidate.title,
      message: alertCandidate.message,
      dedupKey: alertCandidate.dedupKey,
    });

    if (alert) {
      if (alert.type === "BUDGET_EXCEEDED") {
        notifyBudgetExceeded(orgId, budget, alert).catch((err) =>
          console.error("[OsterdOps Budget Evaluator] Exceeded notification failed:", err)
        );
      } else {
        notifyBudgetThreshold(orgId, budget, alert).catch((err) =>
          console.error("[OsterdOps Budget Evaluator] Threshold notification failed:", err)
        );
      }
    }
  }

  // Update budget document status, currentSpendUsd and triggeredThresholds
  const db = getAdminFirestore();
  const budgetRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("budgets")
    .doc(budgetId);

  await budgetRef.update({
    currentSpendUsd: spendAggregate.totalSpendUsd,
    triggeredThresholds: evalResult.newlyCrossedThresholds,
    status: evalResult.statusResponse.status === "EXCEEDED" ? "EXCEEDED" : "ACTIVE",
    periodStart: boundaries.periodStart,
    periodEnd: boundaries.periodEnd,
    currentPeriodStart: boundaries.periodStart,
    currentPeriodEnd: boundaries.periodEnd,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return evalResult.statusResponse;
}

/**
 * Evaluates all active budgets for an organization.
 */
export async function evaluateOrganizationBudgets(orgId: string): Promise<BudgetStatusResponse[]> {
  const budgets = await listOrganizationBudgets(orgId);
  const activeBudgets = budgets.filter((b) => b.enabled !== false && b.status !== "ARCHIVED" && b.status !== "PAUSED");

  const results: BudgetStatusResponse[] = [];
  for (const b of activeBudgets) {
    const res = await evaluateBudget(orgId, b.id);
    if (res) results.push(res);
  }
  return results;
}

/**
 * Evaluates all active budgets scoped to a specific project.
 */
export async function evaluateProjectBudgets(
  orgId: string,
  projectId: string
): Promise<BudgetStatusResponse[]> {
  const budgets = await listOrganizationBudgets(orgId, projectId);
  const activeBudgets = budgets.filter((b) => b.enabled !== false && b.status !== "ARCHIVED" && b.status !== "PAUSED");

  const results: BudgetStatusResponse[] = [];
  for (const b of activeBudgets) {
    const res = await evaluateBudget(orgId, b.id);
    if (res) results.push(res);
  }
  return results;
}

/**
 * Retrieves real-time budget status and threshold breakdown.
 */
export async function getBudgetStatus(
  orgId: string,
  budgetId: string
): Promise<BudgetStatusResponse | null> {
  return evaluateBudget(orgId, budgetId);
}

/**
 * Pre-Flight Gateway Check (Phase 12 HARD Enforcement):
 * Fast indexed evaluation of active HARD budgets for organization or project.
 * Blocks upstream request with 429 if limit is exceeded.
 */
export async function checkBudgetEnforcement(
  orgId: string,
  projectId?: string
): Promise<BudgetEnforcementResult> {
  const cacheKey = `${orgId}:${projectId || "org"}`;
  const cached = cacheRegistry.budgetPreflight.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const db = getAdminFirestore();

  // Query active budgets for this organization
  const snap = await db
    .collection("organizations")
    .doc(orgId)
    .collection("budgets")
    .where("status", "in", ["ACTIVE", "EXCEEDED"])
    .get();

  for (const doc of snap.docs) {
    const budget = sanitizeBudget(doc.id, doc.data());

    // Only apply if budget is enabled and is HARD enforcement
    if (!budget.enabled || budget.enforcement !== "HARD") {
      continue;
    }

    // Check project scope: matches project specifically or is org-wide (projectId undefined)
    const matchesScope = !budget.projectId || (projectId && budget.projectId === projectId);
    if (!matchesScope) {
      continue;
    }

    // If budget is already marked EXCEEDED or current spend >= limit
    if (budget.status === "EXCEEDED" || (budget.currentSpendUsd !== undefined && budget.currentSpendUsd >= budget.amountUsd)) {
      const blockedResult: BudgetEnforcementResult = {
        allowed: false,
        reason: `Monthly budget limit ($${budget.amountUsd.toFixed(2)}) for '${budget.name}' has been exceeded. Request blocked under HARD enforcement policy.`,
        budgetId: budget.id,
        limitUsd: budget.amountUsd,
        currentSpendUsd: budget.currentSpendUsd,
        enforcement: "HARD",
      };
      // Cache blocked state for 5s
      cacheRegistry.budgetPreflight.set(cacheKey, blockedResult, 5 * 1000);
      return blockedResult;
    }
  }

  const allowedResult: BudgetEnforcementResult = { allowed: true };
  // Cache allowed state for 10s
  cacheRegistry.budgetPreflight.set(cacheKey, allowedResult, 10 * 1000);
  return allowedResult;
}

/**
 * Legacy Pre-Flight Gateway Check.
 */
export async function checkBudgetPreflight(
  orgId: string,
  projectId: string,
  _projectSpend: number,
  _orgSpend: number
): Promise<{ allowed: boolean; reason?: string; budget?: Budget }> {
  const result = await checkBudgetEnforcement(orgId, projectId);
  if (!result.allowed) {
    return {
      allowed: false,
      reason: result.reason,
    };
  }
  return { allowed: true };
}

/**
 * Post-Flight Evaluator: Dispatches budget evaluation asynchronously.
 */
export async function evaluateBudgetsAfterSpend(
  organization: Organization,
  project?: Project,
  _newTotalProjectSpend?: number,
  _newTotalOrgSpend?: number
): Promise<void> {
  if (project?.id) {
    evaluateProjectBudgets(organization.id, project.id).catch((err) => {
      console.error("[OsterdOps Budget Evaluator] Post-spend project evaluation failed:", err);
    });
  } else {
    evaluateOrganizationBudgets(organization.id).catch((err) => {
      console.error("[OsterdOps Budget Evaluator] Post-spend organization evaluation failed:", err);
    });
  }
}
