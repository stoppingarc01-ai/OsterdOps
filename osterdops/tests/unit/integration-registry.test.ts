/**
 * Unit Tests — Integration Providers Registry & Adapters
 */

import { listIntegrationProviders, getIntegrationProvider } from "@/lib/integrations/registry";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export function runIntegrationRegistryTests() {
  const providers = listIntegrationProviders();
  assert(providers.length >= 4, "Registry must contain at least 4 providers.");

  const webhook = getIntegrationProvider("generic_webhook");
  assert(webhook !== null, "Generic webhook provider must exist.");
  assert(webhook?.metadata.category === "WEBHOOK", "Webhook category must match.");

  const slack = getIntegrationProvider("slack");
  assert(slack !== null, "Slack provider must exist.");
  assert(slack?.metadata.category === "SLACK", "Slack category must match.");

  const discord = getIntegrationProvider("discord");
  assert(discord !== null, "Discord provider must exist.");

  const email = getIntegrationProvider("email");
  assert(email !== null, "Email provider must exist.");

  const unknown = getIntegrationProvider("nonexistent_provider");
  assert(unknown === null, "Unknown provider ID must return null.");
}
