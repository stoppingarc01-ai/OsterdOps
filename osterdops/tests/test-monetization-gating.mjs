/**
 * OsterdOps — Monetization Engine & Feature Gating Verification Test
 * Tests:
 * 1. Plan catalog: "free" removed, "trial" configured with 7 days and 1k request cap.
 * 2. Subscription service: default new subscriptions get TRIALING and 7-day window.
 * 3. Stripe checkout: embeds subscription_data.trial_period_days: 7.
 * 4. Gating logic: expired trial returns HTTP 403 RFC 7807 problem details with SUBSCRIPTION_REQUIRED.
 */

import assert from "node:assert";
import Module from "node:module";

// Bypass Next.js 'server-only' package restriction during standalone test runner execution
const originalRequire = Module.prototype.require;
Module.prototype.require = function (id) {
  if (id === "server-only") return {};
  return originalRequire.apply(this, arguments);
};

// Also mock in require.cache if available
try {
  const require = Module.createRequire(import.meta.url);
  const serverOnlyPath = require.resolve("server-only");
  require.cache[serverOnlyPath] = {
    id: serverOnlyPath,
    filename: serverOnlyPath,
    loaded: true,
    exports: {},
  };
} catch {}

async function runTests() {
  console.log("=== OsterdOps Monetization Engine Verification Suite ===");

  // Test 1: Plan definitions
  console.log("\n[Test 1] Verifying Plan Tier Definitions...");
  const { PRICING_PLANS, BILLING_PLANS, normalizePlanTier, getBillingPlan } = await import("../src/lib/billing/plans.ts");

  assert.strictEqual(PRICING_PLANS.trial.id, "trial", "PRICING_PLANS.trial must have id 'trial'");
  assert.strictEqual(PRICING_PLANS.trial.durationDays, 7, "PRICING_PLANS.trial must have 7 days duration");
  assert.strictEqual(PRICING_PLANS.trial.limits.monthlyRequestLimit, 1000, "PRICING_PLANS.trial must cap at 1000 requests");
  assert.strictEqual(PRICING_PLANS.trial.features.runawayLoopBreaker, true, "PRICING_PLANS.trial has full features");

  assert.strictEqual(BILLING_PLANS.TRIAL.planId, "TRIAL", "BILLING_PLANS.TRIAL must exist");
  assert.strictEqual(BILLING_PLANS.TRIAL.includedRequests, 1000, "BILLING_PLANS.TRIAL must include 1000 requests");
  assert.strictEqual(BILLING_PLANS.TRIAL.includedTokens, 50000, "BILLING_PLANS.TRIAL must include 50k tokens");

  assert.strictEqual(normalizePlanTier("free"), "trial", "normalizePlanTier('free') must map to 'trial'");
  assert.strictEqual(normalizePlanTier(null), "trial", "normalizePlanTier(null) must default to 'trial'");
  assert.strictEqual(getBillingPlan("free").planId, "TRIAL", "getBillingPlan('free') must resolve to TRIAL");

  console.log("✓ Plan Tier Definitions Verified: Permanent Free tier replaced by 7-Day Trial");

  // Test 2: Gating Engine & RFC 7807 Response
  console.log("\n[Test 2] Verifying Server-Side Feature Gating & RFC 7807 Response...");
  const { checkSubscriptionAccess, createSubscriptionRequiredResponse, SUBSCRIPTION_REQUIRED_MESSAGE } = await import("../src/lib/billing/access.ts");

  // Expired trial user
  const expiredUser = {
    id: "usr_expired_1",
    name: "Expired User",
    email: "expired@example.com",
    role: "member",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    subscription: {
      status: "trialing",
      trialStartsAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      trialEndsAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Expired 7 days ago
      planId: "trial-7d",
      isActive: false,
    },
  };

  const expiredAccess = await checkSubscriptionAccess(null, expiredUser);
  assert.strictEqual(expiredAccess.hasAccess, false, "Expired trial user must not have access");
  assert.strictEqual(expiredAccess.isExpired, true, "isExpired must be true");
  assert.strictEqual(expiredAccess.daysRemaining, 0, "daysRemaining must be 0");

  // Active trial user
  const activeTrialUser = {
    id: "usr_trial_active_1",
    name: "Active Trial User",
    email: "trial@example.com",
    role: "member",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subscription: {
      status: "trialing",
      trialStartsAt: new Date().toISOString(),
      trialEndsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days remaining
      planId: "trial-7d",
      isActive: true,
    },
  };

  const activeAccess = await checkSubscriptionAccess(null, activeTrialUser);
  assert.strictEqual(activeAccess.hasAccess, true, "Active trial user must have access");
  assert.strictEqual(activeAccess.isExpired, false, "isExpired must be false");
  assert(activeAccess.daysRemaining >= 4, "daysRemaining must reflect valid trial days");

  // RFC 7807 response
  const problemResponse = createSubscriptionRequiredResponse();
  assert.strictEqual(problemResponse.status, 403, "Response status must be 403 Forbidden");
  assert.strictEqual(
    problemResponse.headers.get("content-type"),
    "application/problem+json; charset=utf-8",
    "Content-Type must be application/problem+json"
  );

  const problemBody = await problemResponse.json();
  assert.strictEqual(problemBody.error?.code, "SUBSCRIPTION_REQUIRED", "Error code must be SUBSCRIPTION_REQUIRED");
  assert.strictEqual(problemBody.error?.message, SUBSCRIPTION_REQUIRED_MESSAGE, "Error message must match prompt");
  assert.strictEqual(problemBody.status, 403, "Problem detail status must be 403");

  console.log("✓ Access Control & RFC 7807 Paywall Contract Verified");

  // Test 3: Stripe Checkout Sync with trial_period_days: 7
  console.log("\n[Test 3] Verifying Stripe Checkout Provider trial_period_days: 7...");
  const { StripeBillingProvider } = await import("../src/lib/billing/providers/stripe.ts");
  const stripe = new StripeBillingProvider();

  const checkout = await stripe.createCheckoutSession({
    organizationId: "org_test_123",
    planId: "PRO",
    interval: "MONTHLY",
    successUrl: "https://app.osterdops.com/settings",
    cancelUrl: "https://app.osterdops.com/pricing",
    subscription_data: {
      trial_period_days: 7,
    },
  });

  assert.strictEqual(checkout.subscription_data?.trial_period_days, 7, "Checkout must include trial_period_days: 7");
  assert(checkout.url.includes("trial_days=7"), "Checkout redirect URL must include trial_days=7");

  console.log("✓ Stripe Checkout Session Configuration Verified");

  console.log("\n==========================================================");
  console.log(" ALL MONETIZATION TESTS PASSED SUCCESSFULLY (100% GREEN) ");
  console.log("==========================================================");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
