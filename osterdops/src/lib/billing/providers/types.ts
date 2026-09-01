/**
 * OsterdOps — Payment Provider Abstraction Interfaces (Phase 13)
 */

import type { BillingCheckoutParams, BillingCheckoutResult } from "@/types";

export interface ProviderCustomerResult {
  customerId: string;
}

export interface WebhookParsedEvent {
  id: string;
  type: string;
  data: Record<string, unknown>;
  created: number;
}

export interface BillingProvider {
  name: "stripe" | "simulation";
  createCustomer(orgId: string, email: string): Promise<ProviderCustomerResult>;
  createCheckoutSession(params: BillingCheckoutParams): Promise<BillingCheckoutResult>;
  cancelSubscription(providerSubscriptionId: string): Promise<boolean>;
  verifyWebhookSignature(payload: string, signatureHeader: string, webhookSecret?: string): boolean;
  parseWebhookEvent(payload: string): WebhookParsedEvent;
}
