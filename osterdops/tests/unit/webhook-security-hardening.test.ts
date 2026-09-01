/**
 * OsterdOps — Phase 15: Webhook Security Hardening Unit Tests
 */

import { StripeBillingProvider } from "@/lib/billing/providers/stripe";
import { generateTestStripeSignature } from "@/lib/billing/providers/registry";

export function testWebhookSecurityHardening() {
  const provider = new StripeBillingProvider();
  const secret = "whsec_hardening_test_secret_12345";
  const rawBody = JSON.stringify({
    id: "evt_sec_123",
    type: "invoice.paid",
    data: { object: { id: "in_123", amount_paid: 4900 } },
  });

  // 1. Valid signature
  const validHeader = generateTestStripeSignature(rawBody, secret);
  if (!provider.verifyWebhookSignature(rawBody, validHeader, secret)) {
    throw new Error("Valid webhook signature was rejected.");
  }

  // 2. Tampered body rejection
  const tamperedBody = rawBody.replace("4900", "9900");
  if (provider.verifyWebhookSignature(tamperedBody, validHeader, secret)) {
    throw new Error("Tampered body with valid signature must be rejected.");
  }

  // 3. Forged signature rejection
  const forgedHeader = "t=1234567890,v1=0000000000000000000000000000000000000000000000000000000000000000";
  if (provider.verifyWebhookSignature(rawBody, forgedHeader, secret)) {
    throw new Error("Forged signature must be rejected.");
  }

  // 4. Mismatched secret rejection
  if (provider.verifyWebhookSignature(rawBody, validHeader, "whsec_wrong_secret")) {
    throw new Error("Mismatched secret must fail verification.");
  }
}

export function runWebhookSecurityHardeningTests() {
  testWebhookSecurityHardening();
}
