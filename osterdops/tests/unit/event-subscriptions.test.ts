/**
 * Unit Tests — Event Subscriptions Matching
 */

import { matchesSubscription, isAllowedSubscriptionEvent } from "@/lib/integrations/subscriptions";
import type { IntegrationConnection } from "@/lib/integrations/types";
import type { WebhookEvent } from "@/lib/webhooks/types";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export function runEventSubscriptionsTests() {
  // 1. Permitted events
  assert(isAllowedSubscriptionEvent("budget.threshold_reached"), "budget.threshold_reached is allowed.");
  assert(isAllowedSubscriptionEvent("alert.created"), "alert.created is allowed.");
  assert(!isAllowedSubscriptionEvent("unauthorized.internal.event"), "Arbitrary internal event is disallowed.");

  const conn: IntegrationConnection = {
    id: "int_sub_01",
    organizationId: "org_sub_test",
    providerId: "generic_webhook",
    name: "Sub Test",
    status: "ACTIVE",
    configurationMetadata: {},
    eventSubscriptions: ["budget.*", "alert.created"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 2. Matching event with wildcard
  const event1: WebhookEvent = {
    id: "evt_1",
    type: "budget.threshold_reached",
    version: "1",
    organizationId: "org_sub_test",
    createdAt: new Date().toISOString(),
    data: { thresholdPercent: 80 },
  };
  assert(matchesSubscription(conn, event1), "budget.* wildcard matches budget.threshold_reached.");

  // 3. Matching exact event
  const event2: WebhookEvent = {
    id: "evt_2",
    type: "alert.created",
    version: "1",
    organizationId: "org_sub_test",
    createdAt: new Date().toISOString(),
    data: { alertId: "alt_1" },
  };
  assert(matchesSubscription(conn, event2), "Exact match for alert.created passes.");

  // 4. Non-matching event
  const event3: WebhookEvent = {
    id: "evt_3",
    type: "billing.invoice.paid",
    version: "1",
    organizationId: "org_sub_test",
    createdAt: new Date().toISOString(),
    data: {},
  };
  assert(!matchesSubscription(conn, event3), "Unsubscribed event does not match.");

  // 5. Inactive connection does not match
  conn.status = "INACTIVE";
  assert(!matchesSubscription(conn, event1), "INACTIVE connection does not match any events.");
}
