/**
 * Unit Tests — Webhook Event Schemas & Sanitization
 */

import { WebhookEventBuilders, createWebhookEvent } from "@/lib/webhooks/events";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export function runWebhookEventsTests() {
  const orgId = "org_webhook_test_1";

  // 1. Budget threshold event
  const evt1 = WebhookEventBuilders.budgetThresholdReached(orgId, {
    budgetId: "bud_991",
    budgetName: "Monthly AI Cap",
    thresholdPercent: 80,
    currentSpendUsd: 800,
    limitUsd: 1000,
  });

  assert(evt1.type === "budget.threshold_reached", "Type must match.");
  assert(evt1.version === "1", "Version must be 1.");
  assert(evt1.organizationId === orgId, "Org ID must match.");
  assert(evt1.data.thresholdPercent === 80, "Data payload must include threshold.");

  // 2. Budget exceeded event
  const evt2 = WebhookEventBuilders.budgetExceeded(orgId, {
    budgetId: "bud_991",
    budgetName: "Monthly AI Cap",
    currentSpendUsd: 1005,
    limitUsd: 1000,
    enforcementMode: "BLOCK",
  });
  assert(evt2.type === "budget.exceeded", "Type must be budget.exceeded.");

  // 3. Security alert event
  const evt3 = WebhookEventBuilders.securityAlert(orgId, {
    eventId: "sec_123",
    eventType: "SUSPICIOUS_LOGIN",
    severity: "HIGH",
  });
  assert(evt3.type === "security.alert", "Type must be security.alert.");

  // 4. Zero-content sanitization: Prompts, API keys, passwords stripped from payload
  const rawWithSecrets = {
    budgetId: "bud_123",
    prompt: "Sensitive system instructions",
    completion: "Sensitive completion",
    apiKey: "osk_live_1234567890abcdef",
    spendUsd: 500,
  };

  const sanitizedEvent = createWebhookEvent("budget.threshold_reached", orgId, rawWithSecrets);
  assert(!("prompt" in sanitizedEvent.data), "Must strip prompt from webhook data.");
  assert(!("completion" in sanitizedEvent.data), "Must strip completion from webhook data.");
  assert(!("apiKey" in sanitizedEvent.data), "Must strip apiKey from webhook data.");
  assert(sanitizedEvent.data.spendUsd === 500, "Must preserve non-sensitive fields.");
}
