/**
 * OsterdOps — Billing Summary Service (Phase 13)
 * Consolidates customer, subscription, plan entitlements, Phase 8/9 usage metrics,
 * overage calculations, and invoice balances into a unified dashboard summary.
 */

import "server-only";
import { getBillingCustomer } from "./customer.service";
import { getSubscription } from "./subscription.service";
import { getBillingPlan } from "./plans";
import { getPlanEntitlements } from "./entitlements";
import { buildBillingUsageSummary, calculateBasePrice } from "./calculator";
import { listInvoices } from "./invoice.service";
import { aggregateUsage } from "@/lib/services/usage.service";
import { aggregateSpend } from "@/lib/services/cost.service";
import type { BillingSummaryResponse, BillingInterval } from "@/types";

/**
 * Derives comprehensive real-time billing summary for an organization.
 */
export async function getBillingSummary(orgId: string): Promise<BillingSummaryResponse> {
  const [customer, subscription] = await Promise.all([
    getBillingCustomer(orgId),
    getSubscription(orgId),
  ]);

  const plan = getBillingPlan(subscription.planId);
  const entitlements = getPlanEntitlements(subscription.planId);

  const periodStart = subscription.currentPeriodStart;
  const periodEnd = subscription.currentPeriodEnd;
  const interval: BillingInterval = subscription.interval;

  // Authoritative aggregations from Phase 8 (Usage) and Phase 9 (Cost)
  const [usageAggregate, spendAggregate, invoices] = await Promise.all([
    aggregateUsage(orgId, { startDate: periodStart, endDate: periodEnd }),
    aggregateSpend(orgId, { startDate: periodStart, endDate: periodEnd }),
    listInvoices(orgId, { limit: 10 }),
  ]);

  const usageSummary = buildBillingUsageSummary(plan.planId, usageAggregate, spendAggregate);
  const basePriceUsd = calculateBasePrice(plan, interval);
  const estimatedTotalUsd = Math.round((basePriceUsd + usageSummary.overageSpendUsd) * 100) / 100;

  const lastInvoice = invoices.length > 0 ? invoices[0] : null;
  const outstandingBalanceUsd = invoices
    .filter((inv) => inv.status === "OPEN" || inv.status === "FAILED")
    .reduce((sum, inv) => sum + inv.totalUsd, 0);

  return {
    organizationId: orgId,
    customer,
    subscription,
    plan,
    entitlements,
    billingPeriod: {
      periodStart,
      periodEnd,
      interval,
    },
    basePriceUsd,
    usageSummary,
    estimatedTotalUsd,
    lastInvoice,
    outstandingBalanceUsd: Math.round(outstandingBalanceUsd * 100) / 100,
    nextBillingDate: periodEnd,
  };
}
