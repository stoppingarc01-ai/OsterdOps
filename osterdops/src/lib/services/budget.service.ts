/**
 * OsterdOps — Budget & Governance Engine
 */

import "server-only";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { createDeduplicatedAlert } from "./alert.service";
import type {
  Budget,
  BudgetPeriod,
  BudgetStatus,
  BudgetThresholdLevel,
  Project,
  Organization,
} from "@/types";

export interface CreateBudgetParams {
  name: string;
  amountUsd: number;
  period: BudgetPeriod;
  projectId?: string;
  alertThresholds?: BudgetThresholdLevel[];
  enforceHardLimit?: boolean;
}

/**
 * Creates a new budget configuration for an Organization or specific Project.
 */
export async function createBudget(
  orgId: string,
  params: CreateBudgetParams
): Promise<Budget> {
  const db = getAdminFirestore();
  const budgetRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("budgets")
    .doc();

  const budgetId = budgetRef.id;
  const now = FieldValue.serverTimestamp();

  const budgetData: Omit<Budget, "id"> = {
    organizationId: orgId,
    projectId: params.projectId,
    name: params.name.trim(),
    amountUsd: Number(params.amountUsd),
    period: params.period || "monthly",
    alertThresholds: params.alertThresholds || [50, 75, 90, 100],
    triggeredThresholds: [],
    enforceHardLimit: Boolean(params.enforceHardLimit),
    status: "active",
    createdAt: now as unknown as string,
    updatedAt: now as unknown as string,
  };

  await budgetRef.set(budgetData);

  return {
    id: budgetId,
    ...budgetData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Lists all budgets configured for an organization.
 */
export async function listOrganizationBudgets(orgId: string): Promise<Budget[]> {
  const db = getAdminFirestore();
  const snap = await db
    .collection("organizations")
    .doc(orgId)
    .collection("budgets")
    .orderBy("createdAt", "desc")
    .get();

  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      organizationId: data.organizationId,
      projectId: data.projectId,
      name: data.name,
      amountUsd: data.amountUsd,
      period: data.period as BudgetPeriod,
      alertThresholds: data.alertThresholds as BudgetThresholdLevel[],
      triggeredThresholds: (data.triggeredThresholds || []) as BudgetThresholdLevel[],
      enforceHardLimit: data.enforceHardLimit,
      status: data.status as BudgetStatus,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
    } as Budget;
  });
}

export interface BudgetPreflightResult {
  allowed: boolean;
  reason?: string;
  budget?: Budget;
}

/**
 * Pre-Flight Gateway Check: Checks whether hard spending limits have been reached before calling LLMs.
 */
export async function checkBudgetPreflight(
  orgId: string,
  projectId: string,
  projectSpend: number,
  orgSpend: number
): Promise<BudgetPreflightResult> {
  const db = getAdminFirestore();

  // Query active budgets for this organization
  const snap = await db
    .collection("organizations")
    .doc(orgId)
    .collection("budgets")
    .where("status", "==", "active")
    .where("enforceHardLimit", "==", true)
    .get();

  for (const doc of snap.docs) {
    const budget = { id: doc.id, ...doc.data() } as Budget;

    // Check project-specific budget
    if (budget.projectId && budget.projectId === projectId) {
      if (projectSpend >= budget.amountUsd) {
        return {
          allowed: false,
          reason: `Project budget '${budget.name}' limit of $${budget.amountUsd.toFixed(2)} reached (Current: $${projectSpend.toFixed(2)}).`,
          budget,
        };
      }
    }

    // Check organization-wide budget
    if (!budget.projectId) {
      if (orgSpend >= budget.amountUsd) {
        return {
          allowed: false,
          reason: `Organization budget '${budget.name}' limit of $${budget.amountUsd.toFixed(2)} reached (Current: $${orgSpend.toFixed(2)}).`,
          budget,
        };
      }
    }
  }

  return { allowed: true };
}

/**
 * Post-Flight Evaluator: Checks all thresholds (50, 75, 80, 90, 100%) and generates deduplicated alerts.
 */
export async function evaluateBudgetsAfterSpend(
  organization: Organization,
  project: Project,
  newTotalProjectSpend: number,
  newTotalOrgSpend: number
): Promise<void> {
  const db = getAdminFirestore();
  const orgId = organization.id;

  const snap = await db
    .collection("organizations")
    .doc(orgId)
    .collection("budgets")
    .where("status", "==", "active")
    .get();

  const currentPeriodKey = new Date().toISOString().slice(0, 7); // "YYYY-MM"

  for (const doc of snap.docs) {
    const budget = { id: doc.id, ...doc.data() } as Budget;
    const currentSpend = budget.projectId ? newTotalProjectSpend : newTotalOrgSpend;
    const targetName = budget.projectId ? `Project '${project.name}'` : `Organization '${organization.name}'`;

    if (budget.amountUsd <= 0) continue;

    const percentage = (currentSpend / budget.amountUsd) * 100;
    const newlyTriggered: BudgetThresholdLevel[] = [];

    for (const threshold of budget.alertThresholds || [50, 75, 90, 100]) {
      if (percentage >= threshold && !(budget.triggeredThresholds || []).includes(threshold)) {
        newlyTriggered.push(threshold);

        const severity = threshold >= 100 ? "CRITICAL" : threshold >= 90 ? "WARNING" : "INFO";
        const dedupKey = `bud_${budget.id}_thresh_${threshold}_${currentPeriodKey}`;

        await createDeduplicatedAlert(orgId, {
          projectId: budget.projectId,
          type: threshold >= 100 ? "BUDGET_EXCEEDED" : "BUDGET_THRESHOLD",
          severity,
          title: `Budget Alert: ${threshold}% Reached for ${targetName}`,
          message: `${targetName} has reached ${percentage.toFixed(1)}% ($${currentSpend.toFixed(2)} of $${budget.amountUsd.toFixed(2)}) of its budget '${budget.name}'.`,
          dedupKey,
        });
      }
    }

    if (newlyTriggered.length > 0) {
      await doc.ref.update({
        triggeredThresholds: FieldValue.arrayUnion(...newlyTriggered),
        status: percentage >= 100 ? "exceeded" : "active",
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  }
}
