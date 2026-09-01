/**
 * OsterdOps — Phase 13: Payment Provider Unit Tests
 * Tests provider abstraction, server-side checkout session creation,
 * and authoritative price resolution.
 */

import { StripeBillingProvider } from "@/lib/billing/providers/stripe";
import { getBillingPlan } from "@/lib/billing/plans";

export async function testPaymentProviderAbstraction() {
  const provider = new StripeBillingProvider();

  // 1. Customer creation abstraction
  const customer = await provider.createCustomer("org_prov_test", "billing@example.com");
  if (!customer.customerId || !customer.customerId.startsWith("cus_")) {
    throw new Error("Customer creation result invalid.");
  }

  // 2. Server-side checkout session creation (PRO Monthly)
  const proPlan = getBillingPlan("PRO");
  const checkoutMonthly = await provider.createCheckoutSession({
    organizationId: "org_prov_test",
    planId: "PRO",
    interval: "MONTHLY",
    successUrl: "http://localhost:3000/settings?success=true",
    cancelUrl: "http://localhost:3000/settings?cancel=true",
  });

  if (!checkoutMonthly.sessionId || !checkoutMonthly.url) {
    throw new Error("Checkout session creation failed.");
  }
  if (!checkoutMonthly.url.includes(`amount=${proPlan.monthlyPriceUsd}`)) {
    throw new Error("Checkout session URL must contain authoritative monthly price.");
  }

  // 3. Checkout session creation (BUSINESS Annual)
  const busPlan = getBillingPlan("BUSINESS");
  const checkoutAnnual = await provider.createCheckoutSession({
    organizationId: "org_prov_test",
    planId: "BUSINESS",
    interval: "ANNUAL",
    successUrl: "http://localhost:3000/settings?success=true",
    cancelUrl: "http://localhost:3000/settings?cancel=true",
  });

  if (!checkoutAnnual.url.includes(`amount=${busPlan.annualPriceUsd}`)) {
    throw new Error("Checkout session URL must contain authoritative annual price.");
  }
}

export async function runBillingProviderTests() {
  await testPaymentProviderAbstraction();
}
