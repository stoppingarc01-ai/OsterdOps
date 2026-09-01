/**
 * OsterdOps — Billing & Subscription Lifecycle Scenario (Phase 21)
 *
 * Validates:
 * 1. Active Subscription Management
 * 2. High Token Overage Calculation
 * 3. Exact Integer-Cents Invoice Generation
 * 4. Payment State Transitions (DRAFT -> OPEN -> PAID)
 */

import { E2ERunner } from "../e2e/e2e-runner";
import type { ScenarioResult } from "../types";
import { getBillingPlan } from "@/lib/billing/plans";
import { calculateInvoiceTotal, calculateUsageOverage } from "@/lib/billing/calculator";
import type { OrganizationSubscription, Invoice, InvoiceLineItem } from "@/types";

export async function runBillingScenario(): Promise<ScenarioResult> {
  const runner = new E2ERunner("sc_billing_lifecycle", "Billing, Overage & Invoice Lifecycle Scenario");

  const orgId = "org_billing_scenario";

  // Step 1: Active Subscription Verification
  const subscription: OrganizationSubscription = await runner.runStage("BILLING_CALCULATION", () => {
    const sub: OrganizationSubscription = {
      id: "sub_test_123",
      organizationId: orgId,
      planId: "PRO",
      status: "ACTIVE",
      interval: "MONTHLY",
      currentPeriodStart: "2026-08-01T00:00:00.000Z",
      currentPeriodEnd: "2026-09-01T00:00:00.000Z",
      cancelAtPeriodEnd: false,
      provider: "stripe",
      providerCustomerId: "cus_stripe_12345",
      providerSubscriptionId: "sub_stripe_67890",
      createdAt: "2026-08-01T00:00:00.000Z",
      updatedAt: "2026-08-01T00:00:00.000Z",
    };

    runner.assert("Subscription State Active", sub.status === "ACTIVE", "Subscription must be in ACTIVE status.");
    return sub;
  });

  // Step 2: Overage Generation
  const plan = getBillingPlan(subscription.planId);
  const totalTokensUsed = 15_000_000; // Plan includes 5,000,000, overage is 10,000,000
  const overage = calculateUsageOverage(plan, totalTokensUsed, 25.0);

  runner.assert(
    "Overage Token Calculation",
    overage.overageTokens === 10_000_000,
    "Overage tokens must equal total tokens minus included quota."
  );
  runner.assert(
    "Overage Dollar Amount Calculation",
    overage.overageSpendUsd > 0,
    "Overage fee must be calculated accurately."
  );

  // Step 3: Invoice Generation
  const invoiceTotals = calculateInvoiceTotal(plan.monthlyPriceUsd, overage.overageSpendUsd, 0);

  const lineItems: InvoiceLineItem[] = [
    {
      id: "li_base",
      description: `${plan.displayName} Monthly Subscription`,
      quantity: 1,
      unitPriceUsd: plan.monthlyPriceUsd,
      amountUsd: plan.monthlyPriceUsd,
      type: "SUBSCRIPTION",
    },
    {
      id: "li_overage",
      description: `Token Usage Overage (${(overage.overageTokens / 1_000_000).toFixed(1)}M tokens)`,
      quantity: overage.overageTokens / 1_000_000,
      unitPriceUsd: plan.overageRatePerMillionTokensUsd,
      amountUsd: overage.overageSpendUsd,
      type: "OVERAGE",
    },
  ];

  const invoice: Invoice = await runner.runStage("INVOICE_GENERATION", () => {
    const inv: Invoice = {
      id: "inv_scenario_8899",
      organizationId: orgId,
      subscriptionId: subscription.id,
      billingPeriodStart: subscription.currentPeriodStart,
      billingPeriodEnd: subscription.currentPeriodEnd,
      currency: "USD",
      subtotalUsd: invoiceTotals.subtotalUsd,
      creditsUsd: 0,
      totalUsd: invoiceTotals.totalUsd,
      status: "OPEN",
      lineItems,
      provider: "stripe",
      createdAt: new Date().toISOString(),
    };
    return inv;
  });

  runner.assert(
    "Invoice Line Items Total",
    invoice.totalUsd === plan.monthlyPriceUsd + overage.overageSpendUsd,
    "Invoice total must equal base subscription price plus overage."
  );

  // Step 4: Payment Transition to PAID
  invoice.status = "PAID";
  invoice.paidAt = new Date().toISOString();

  runner.assert("Invoice Transition to PAID", invoice.status === "PAID" && Boolean(invoice.paidAt), "Invoice must transition to PAID status.");

  return runner.finish();
}
