/**
 * OsterdOps — Payment Provider Registry & Test Helpers (Phase 13)
 */

import { StripeBillingProvider } from "./stripe";
import type { BillingProvider } from "./types";
import crypto from "crypto";

const defaultStripeProvider = new StripeBillingProvider();

/**
 * Resolves active billing provider based on environment configuration.
 */
export function getBillingProvider(): BillingProvider {
  return defaultStripeProvider;
}

/**
 * Pure cryptographic helper to construct a valid Stripe signature header for testing.
 */
export function generateTestStripeSignature(
  payload: string,
  secret: string,
  timestamp: number = Math.floor(Date.now() / 1000)
): string {
  const signedPayload = `${timestamp}.${payload}`;
  const sig = crypto
    .createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");

  return `t=${timestamp},v1=${sig}`;
}
