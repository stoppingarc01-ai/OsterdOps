/**
 * Unit Tests — Integration Security & Multi-Tenant Isolation
 */

import {
  createIntegrationConnection,
  getIntegrationConnection,
  clearIntegrationsStoreForTesting,
} from "@/lib/integrations/service";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export async function runIntegrationSecurityTests() {
  clearIntegrationsStoreForTesting();

  const orgA = "org_security_a";
  const orgB = "org_security_b";

  const { connection } = await createIntegrationConnection({
    organizationId: orgA,
    providerId: "generic_webhook",
    name: "Org A Webhook",
    destinationUrl: "https://api.acme.com/webhook",
  });

  // 1. Same tenant access succeeds
  const retrieved = await getIntegrationConnection(orgA, connection.id);
  assert(retrieved.id === connection.id, "Tenant A can access own connection.");

  // 2. Cross-tenant access is blocked
  let crossBlocked = false;
  try {
    await getIntegrationConnection(orgB, connection.id);
  } catch {
    crossBlocked = true;
  }
  assert(crossBlocked, "Cross-tenant access must be rejected.");
}
