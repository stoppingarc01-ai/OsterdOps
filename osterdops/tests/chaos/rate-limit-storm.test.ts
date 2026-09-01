/**
 * Chaos Tests — Rate Limit Storm & Redis Failure Fallback
 */

import { simulateRateLimitStorm } from "@/lib/testing/chaos/rate-limit-storm";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export async function runRateLimitStormTests() {
  const sim = await simulateRateLimitStorm();
  assert(sim.passed, "Rate limit storm simulation must pass.");
  assert(sim.gracefulHandling, "Rate limit storm must be handled gracefully.");
  assert(!sim.dataCorruptionDetected, "No data corruption allowed.");
}
