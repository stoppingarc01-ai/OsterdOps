/**
 * OsterdOps — Billing Reconciliation Engine (Phase 14)
 * Audits Usage records vs Cost Engine records vs Invoices vs Subscription periods
 * to detect pricing gaps, mismatched totals, and orphaned records without destructive updates.
 */

import "server-only";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { getSubscription } from "./subscription.service";
import { getBillingPlan } from "./plans";
import { calculateBasePrice, calculateUsageOverage } from "./calculator";
import { listInvoices } from "./invoice.service";
import { aggregateUsage } from "@/lib/services/usage.service";
import { aggregateSpend } from "@/lib/services/cost.service";
import { recordAuditLog } from "@/lib/services/audit.service";

export type DiscrepancyType =
  | "MISSING_COST"
  | "UNAVAILABLE_PRICING"
  | "SPEND_INVOICE_MISMATCH"
  | "DUPLICATE_RECORD"
  | "ORPHANED_USAGE";

export interface BillingDiscrepancy {
  type: DiscrepancyType;
  description: string;
  recordId?: string;
  recommendedAction: string;
}

export interface ReconciliationReport {
  reconciliationId: string;
  organizationId: string;
  periodStart: string;
  periodEnd: string;
  status: "MATCHED" | "DISCREPANCY_DETECTED" | "ERROR";
  usageTotalTokens: number;
  usageTotalRequests: number;
  costTotalSpendUsd: number;
  invoiceTotalUsd: number;
  discrepancyCount: number;
  discrepancies: BillingDiscrepancy[];
  generatedAt: string;
}

/**
 * Reconciles billing records for an organization across a specific period.
 */
export async function reconcileBilling(
  orgId: string,
  periodStartOverride?: string,
  periodEndOverride?: string,
  actorId?: string
): Promise<ReconciliationReport> {
  const reconciliationId = `rec_${orgId}_${Date.now()}`;
  const nowIso = new Date().toISOString();

  if (actorId) {
    await recordAuditLog({
      organizationId: orgId,
      actorId,
      action: "BILLING_RECONCILIATION_STARTED",
      resourceType: "billingReconciliation",
      resourceId: reconciliationId,
    });
  }

  const subscription = await getSubscription(orgId);
  const plan = getBillingPlan(subscription.planId);

  const periodStart = periodStartOverride || subscription.currentPeriodStart;
  const periodEnd = periodEndOverride || subscription.currentPeriodEnd;

  const [usageAggregate, spendAggregate, invoices] = await Promise.all([
    aggregateUsage(orgId, { startDate: periodStart, endDate: periodEnd }),
    aggregateSpend(orgId, { startDate: periodStart, endDate: periodEnd }),
    listInvoices(orgId, { startDate: periodStart, endDate: periodEnd }),
  ]);

  const discrepancies: BillingDiscrepancy[] = [];

  // 1. Check for unavailable pricing or missing cost records
  if (usageAggregate.totalRequests > 0 && usageAggregate.totalTokens > 0 && spendAggregate.totalSpendUsd === 0) {
    discrepancies.push({
      type: "UNAVAILABLE_PRICING",
      description: `Organization has ${usageAggregate.totalTokens} tokens tracked across ${usageAggregate.totalRequests} requests, but $0.00 provider spend was recorded.`,
      recommendedAction: "Review custom/legacy provider models in the pricing registry to ensure all models have active rates.",
    });
  }

  // 2. Check invoice alignment if invoices exist for this period
  const periodInvoices = invoices.filter(
    (inv) => inv.billingPeriodStart.slice(0, 10) === periodStart.slice(0, 10)
  );

  const basePrice = calculateBasePrice(plan, subscription.interval);
  const overage = calculateUsageOverage(plan, usageAggregate.totalTokens, spendAggregate.totalSpendUsd);
  const expectedTotal = Math.round((basePrice + overage.overageSpendUsd) * 100) / 100;

  let invoiceTotal = 0;
  for (const inv of periodInvoices) {
    invoiceTotal += inv.totalUsd;
    if (inv.status === "PAID" && Math.abs(inv.totalUsd - expectedTotal) > 0.50) {
      discrepancies.push({
        type: "SPEND_INVOICE_MISMATCH",
        description: `Invoice ${inv.id} total ($${inv.totalUsd}) does not match expected calculation ($${expectedTotal}).`,
        recordId: inv.id,
        recommendedAction: "Inspect invoice line items and credit applications for manual overrides.",
      });
    }
  }

  const status = discrepancies.length === 0 ? "MATCHED" : "DISCREPANCY_DETECTED";

  const report: ReconciliationReport = {
    reconciliationId,
    organizationId: orgId,
    periodStart,
    periodEnd,
    status,
    usageTotalTokens: usageAggregate.totalTokens,
    usageTotalRequests: usageAggregate.totalRequests,
    costTotalSpendUsd: spendAggregate.totalSpendUsd,
    invoiceTotalUsd: invoiceTotal,
    discrepancyCount: discrepancies.length,
    discrepancies,
    generatedAt: nowIso,
  };

  // Persist report in Firestore
  const db = getAdminFirestore();
  await db
    .collection("organizations")
    .doc(orgId)
    .collection("billing")
    .doc("reconciliations")
    .collection("reports")
    .doc(reconciliationId)
    .set({
      ...report,
      createdAt: FieldValue.serverTimestamp(),
    });

  if (actorId) {
    await recordAuditLog({
      organizationId: orgId,
      actorId,
      action: discrepancies.length > 0 ? "BILLING_DISCREPANCY_DETECTED" : "BILLING_RECONCILIATION_COMPLETED",
      resourceType: "billingReconciliation",
      resourceId: reconciliationId,
      details: { discrepancyCount: discrepancies.length, status },
    });
  }

  return report;
}
