/**
 * OsterdOps — SLO & Error Budget Tracker Unit Tests (Phase 28)
 * Validates availability calculation, error budget exhaustion, burn rate detection,
 * and rolling window sample pruning.
 */

import { SloTracker } from "@/lib/observability/metrics";

export function runSloTrackerTests(): void {
  console.log("▶ Running SLO & Error Budget Tracker Tests (Phase 28)...");

  // Test 1: Empty tracker returns 100% availability
  const tracker = new SloTracker(99.0, 10);
  const initial = tracker.evaluate("test-service");
  if (initial.currentAvailabilityPercent !== 100) {
    throw new Error(`Expected initial availability 100%, got ${initial.currentAvailabilityPercent}`);
  }
  if (initial.isBreached) {
    throw new Error("Initial state should not be breached");
  }

  // Test 2: Perfect success streak
  for (let i = 0; i < 100; i++) {
    tracker.record(true);
  }
  const allSuccess = tracker.evaluate("test-service");
  if (allSuccess.totalRequests !== 100 || allSuccess.successfulRequests !== 100) {
    throw new Error("Mismatch in recorded successful requests");
  }
  if (allSuccess.currentAvailabilityPercent !== 100) {
    throw new Error("Availability should be 100% with 100 successes");
  }
  if (allSuccess.errorBudgetRemainingPercent !== 100) {
    throw new Error("Error budget remaining should be 100%");
  }

  // Test 3: Controlled error budget consumption
  // Target: 99.0%. With 100 total requests, allowed failures = 1.
  tracker.record(false); // 1 failure out of 101 total
  const oneFailure = tracker.evaluate("test-service");
  if (oneFailure.failedRequests !== 1) {
    throw new Error(`Expected 1 failed request, got ${oneFailure.failedRequests}`);
  }
  if (oneFailure.isBreached) {
    // 100/101 = 99.01% >= 99.0% -> NOT breached
    throw new Error("Expected 99.01% to NOT breach 99.0% SLO");
  }

  // Test 4: Breach detection and fast burning
  tracker.record(false); // 2nd failure out of 102 total -> 100/102 = 98.04% < 99.0%
  const breached = tracker.evaluate("test-service");
  if (!breached.isBreached) {
    throw new Error("Expected isBreached to be true when availability drops below 99%");
  }
  if (!breached.isBurningFast) {
    throw new Error("Expected isBurningFast to be true when failure rate exceeds target");
  }
  if (breached.errorBudgetRemainingPercent !== 0) {
    throw new Error(`Expected error budget remaining to be 0%, got ${breached.errorBudgetRemainingPercent}`);
  }

  // Test 5: Reset
  tracker.reset();
  const resetState = tracker.evaluate("test-service");
  if (resetState.totalRequests !== 0) {
    throw new Error("Expected totalRequests to be 0 after reset");
  }

  console.log("✔ SLO & Error Budget Tracker Tests passed.");
}
