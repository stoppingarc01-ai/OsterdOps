/**
 * OsterdOps — Webhook Event Factories (Phase 18)
 * Sanitized, privacy-preserving event builders for the OsterdOps Webhook Engine.
 */

import { WebhookEventType, WebhookEventEnvelope } from "./types";

/**
 * Creates a standard webhook event envelope.
 */
export function createWebhookEvent<T extends Record<string, unknown>>(
  type: WebhookEventType,
  organizationId: string,
  data: T
): WebhookEventEnvelope<T> {
  const eventId = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  // Sanitization check: Ensure no sensitive keys exist in payload
  const forbiddenKeys = ["prompt", "completion", "messages", "apiKey", "secret", "authorization", "password", "privateKey"];
  const sanitizedData = { ...data };

  for (const key of Object.keys(sanitizedData)) {
    if (forbiddenKeys.some((f) => key.toLowerCase().includes(f.toLowerCase()))) {
      delete sanitizedData[key];
    }
  }

  return {
    id: eventId,
    type,
    version: "1",
    createdAt: new Date().toISOString(),
    organizationId,
    data: sanitizedData,
  };
}

export const WebhookEventBuilders = {
  budgetThresholdReached: (orgId: string, details: { budgetId: string; budgetName: string; thresholdPercent: number; currentSpendUsd: number; limitUsd: number }) =>
    createWebhookEvent("budget.threshold_reached", orgId, details),

  budgetExceeded: (orgId: string, details: { budgetId: string; budgetName: string; currentSpendUsd: number; limitUsd: number; enforcementMode: string }) =>
    createWebhookEvent("budget.exceeded", orgId, details),

  alertCreated: (orgId: string, details: { alertId: string; title: string; severity: string; type: string }) =>
    createWebhookEvent("alert.created", orgId, details),

  alertResolved: (orgId: string, details: { alertId: string; resolvedBy?: string }) =>
    createWebhookEvent("alert.resolved", orgId, details),

  subscriptionUpdated: (orgId: string, details: { subscriptionId: string; planId: string; status: string }) =>
    createWebhookEvent("billing.subscription.updated", orgId, details),

  invoiceCreated: (orgId: string, details: { invoiceId: string; totalAmountUsd: number; dueDate: string }) =>
    createWebhookEvent("billing.invoice.created", orgId, details),

  invoicePaid: (orgId: string, details: { invoiceId: string; amountPaidUsd: number; paidAt: string }) =>
    createWebhookEvent("billing.invoice.paid", orgId, details),

  securityAlert: (orgId: string, details: { eventId: string; eventType: string; severity: string }) =>
    createWebhookEvent("security.alert", orgId, details),

  gatewayRequestFailed: (orgId: string, details: { requestId: string; provider: string; model: string; errorCode: string; statusCode: number }) =>
    createWebhookEvent("gateway.request.failed", orgId, details),
};
