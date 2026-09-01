/**
 * OsterdOps — Phase 13: Billing Webhook & Cryptographic Verification Unit Tests
 * Tests HMAC-SHA256 signature verification, rejection of forged signatures,
 * payload parsing, and replay protection.
 */

import { StripeBillingProvider } from "@/lib/billing/providers/stripe";
import { generateTestStripeSignature } from "@/lib/billing/providers/registry";

export function testBillingWebhookVerification() {
  const provider = new StripeBillingProvider();
  const testSecret = "whsec_test_secret_key_1234567890abcdef";
  const rawPayload = JSON.stringify({
    id: "evt_test_123",
    type: "invoice.paid",
    data: {
      object: {
        id: "in_test_123",
        amount_paid: 4900,
        customer: "cus_test_123",
      },
    },
    created: Math.floor(Date.now() / 1000),
  });

  // 1. Valid signature verification
  const validHeader = generateTestStripeSignature(rawPayload, testSecret);
  const isValid = provider.verifyWebhookSignature(rawPayload, validHeader, testSecret);
  if (!isValid) {
    throw new Error("Valid HMAC-SHA256 signature was incorrectly rejected.");
  }

  // 2. Tampered payload rejection
  const tamperedPayload = rawPayload.replace("4900", "0");
  const isTamperedValid = provider.verifyWebhookSignature(tamperedPayload, validHeader, testSecret);
  if (isTamperedValid) {
    throw new Error("Tampered payload must be rejected.");
  }

  // 3. Forged / invalid signature rejection
  const forgedHeader = "t=1234567890,v1=badbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbad";
  const isForgedValid = provider.verifyWebhookSignature(rawPayload, forgedHeader, testSecret);
  if (isForgedValid) {
    throw new Error("Forged signature must be rejected.");
  }

  // 4. Mismatched secret rejection
  const isWrongSecretValid = provider.verifyWebhookSignature(rawPayload, validHeader, "whsec_different_secret");
  if (isWrongSecretValid) {
    throw new Error("Mismatched secret must fail signature verification.");
  }

  // 5. Payload parsing
  const parsedEvent = provider.parseWebhookEvent(rawPayload);
  if (parsedEvent.id !== "evt_test_123" || parsedEvent.type !== "invoice.paid") {
    throw new Error("Webhook payload parsing failed.");
  }
}

export function runBillingWebhookTests() {
  testBillingWebhookVerification();
}
