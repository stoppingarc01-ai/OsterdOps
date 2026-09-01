/**
 * OsterdOps — Webhook Platform Contracts & Event Types (Phase 18)
 * Strict zero-content persistence and privacy guarantees.
 */

export type WebhookEventType =
  // Budgets
  | "budget.threshold_reached"
  | "budget.exceeded"
  | "budget.paused"
  | "budget.resumed"
  // Alerts
  | "alert.created"
  | "alert.acknowledged"
  | "alert.resolved"
  // Billing & Subscriptions
  | "billing.subscription.updated"
  | "billing.invoice.created"
  | "billing.invoice.paid"
  | "billing.invoice.failed"
  // Security & Compliance
  | "security.event"
  | "security.alert"
  // Gateway Operations
  | "gateway.request.failed";

export interface WebhookEventEnvelope<T = Record<string, unknown>> {
  id: string;
  type: WebhookEventType;
  version: "1";
  createdAt: string;
  organizationId: string;
  data: T;
}

export type WebhookEvent = WebhookEventEnvelope<Record<string, unknown>>;

export interface WebhookDeliveryAttempt {
  deliveryId: string;
  eventId: string;
  endpointUrl: string;
  statusCode?: number;
  latencyMs?: number;
  success: boolean;
  error?: string;
  attemptNumber: number;
  timestamp: string;
}

export interface WebhookEndpointConfig {
  id: string;
  organizationId: string;
  url: string;
  secret: string; // HMAC secret
  enabledEvents: WebhookEventType[];
  status: "active" | "disabled";
  createdAt: string;
}
