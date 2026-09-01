/**
 * OsterdOps — Event Subscription Engine (Phase 20)
 * Evaluates incoming system events against active integration event subscriptions.
 */

import { WebhookEvent } from "@/lib/webhooks/types";
import { IntegrationConnection } from "./types";

export const ALLOWED_SUBSCRIPTION_EVENTS = [
  "gateway.request.failed",
  "gateway.request.completed",
  "budget.threshold_reached",
  "budget.exceeded",
  "budget.paused",
  "budget.resumed",
  "alert.created",
  "alert.acknowledged",
  "alert.resolved",
  "billing.subscription.updated",
  "billing.invoice.created",
  "billing.invoice.paid",
  "billing.invoice.failed",
  "security.event",
  "api.rate_limited",
  "api.request_rejected",
] as const;

export type SubscriptionEventType = (typeof ALLOWED_SUBSCRIPTION_EVENTS)[number];

/**
 * Validates whether an event type is permissible for external subscription.
 */
export function isAllowedSubscriptionEvent(eventType: string): boolean {
  return (ALLOWED_SUBSCRIPTION_EVENTS as readonly string[]).includes(eventType);
}

/**
 * Determines whether a connection is actively subscribed to a specific event.
 */
export function matchesSubscription(
  connection: IntegrationConnection,
  event: WebhookEvent
): boolean {
  if (connection.status !== "ACTIVE") return false;
  if (connection.organizationId !== event.organizationId) return false;

  // Wildcard match or exact event type
  return (
    connection.eventSubscriptions.includes("*") ||
    connection.eventSubscriptions.includes(event.type) ||
    connection.eventSubscriptions.some(
      (sub) => sub.endsWith(".*") && event.type.startsWith(sub.slice(0, -2))
    )
  );
}
