/**
 * Unit Tests — Integration Delivery Logs & Health
 */

import {
  createIntegrationConnection,
  recordDelivery,
  getIntegrationHealth,
  clearIntegrationsStoreForTesting,
} from "@/lib/integrations/service";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export async function runIntegrationDeliveryTests() {
  clearIntegrationsStoreForTesting();
  const orgId = "org_deliv_test";

  const { connection } = await createIntegrationConnection({
    organizationId: orgId,
    providerId: "generic_webhook",
    name: "Delivery Health Webhook",
    destinationUrl: "https://api.acme.com/hook",
  });

  // 1. Initial health before deliveries
  const initialHealth = await getIntegrationHealth(orgId, connection.id);
  assert(initialHealth.healthy === true, "New connection is healthy.");
  assert(initialHealth.successRate24h === 100, "Initial success rate is 100%.");

  // 2. Record successful delivery
  await recordDelivery({
    id: "del_1",
    organizationId: orgId,
    integrationId: connection.id,
    eventId: "evt_1",
    eventType: "budget.threshold_reached",
    attemptCount: 1,
    maxAttempts: 3,
    status: "DELIVERED",
    responseStatus: 200,
    latencyMs: 38,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  });

  const updatedHealth = await getIntegrationHealth(orgId, connection.id);
  assert(updatedHealth.healthy === true, "Health remains true after successful delivery.");
  assert(updatedHealth.averageLatencyMs === 38, "Latency averaged correctly.");
}
