/**
 * Unit Tests — Integration Entitlements & Plan Limits
 */

import { getPlanEntitlements } from "@/lib/billing/entitlements";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export function runIntegrationEntitlementsTests() {
  const freeEntitlements = getPlanEntitlements("FREE");
  assert(freeEntitlements !== undefined, "FREE plan entitlements exist.");

  const proEntitlements = getPlanEntitlements("PRO");
  assert(proEntitlements !== undefined, "PRO plan entitlements exist.");
  assert(proEntitlements.canUseBudgets === true, "PRO plan has budget access.");
}
