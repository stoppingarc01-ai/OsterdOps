/**
 * OsterdOps — Circuit Breaker Unit Tests (Phase 28)
 * Validates state transitions (CLOSED -> OPEN -> HALF_OPEN -> CLOSED),
 * fast-failing behavior, recovery probe evaluation, and metrics tracking.
 */

import {
  CircuitBreaker,
  CircuitBreakerError,
  getProviderCircuitBreaker,
  resetAllCircuitBreakers,
} from "@/lib/gateway/circuit-breaker";

export function runCircuitBreakerTests(): void {
  console.log("▶ Running Circuit Breaker Tests (Phase 28)...");

  // Test 1: Initial state is CLOSED
  const cb = new CircuitBreaker("test-provider", {
    failureThreshold: 3,
    recoveryTimeMs: 50,
    halfOpenSuccessThreshold: 2,
  });

  if (cb.getState() !== "CLOSED") {
    throw new Error(`Expected initial state to be CLOSED, got ${cb.getState()}`);
  }
  if (!cb.canExecute()) {
    throw new Error("Expected canExecute to be true in CLOSED state");
  }

  // Test 2: Trips to OPEN after failure threshold
  cb.recordFailure();
  cb.recordFailure();
  if (cb.getState() !== "CLOSED") {
    throw new Error("Should remain CLOSED before reaching failure threshold");
  }
  cb.recordFailure(); // 3rd failure
  if (cb.getState() !== "OPEN") {
    throw new Error(`Expected state to be OPEN after 3 failures, got ${cb.getState()}`);
  }
  if (cb.canExecute()) {
    throw new Error("Expected canExecute to be false in OPEN state");
  }

  // Test 3: Fast-fails with CircuitBreakerError
  let thrown = false;
  try {
    cb.checkExecution();
  } catch (err) {
    if (err instanceof CircuitBreakerError) {
      thrown = true;
      if (err.code !== "CIRCUIT_BREAKER_OPEN") {
        throw new Error(`Expected error code CIRCUIT_BREAKER_OPEN, got ${err.code}`);
      }
      if (err.provider !== "test-provider") {
        throw new Error(`Expected provider 'test-provider', got ${err.provider}`);
      }
    }
  }
  if (!thrown) {
    throw new Error("Expected checkExecution to throw CircuitBreakerError in OPEN state");
  }

  // Test 4: Transitions to HALF_OPEN after recoveryTimeMs
  const start = Date.now();
  while (Date.now() - start < 60) {
    // wait for recovery window
  }

  if (cb.getState() !== "HALF_OPEN") {
    throw new Error(`Expected state to be HALF_OPEN after recovery window, got ${cb.getState()}`);
  }
  if (!cb.canExecute()) {
    throw new Error("Expected canExecute to be true in HALF_OPEN state");
  }

  // Test 5: Closes circuit after successful probes in HALF_OPEN
  cb.recordSuccess(); // 1st success
  if (cb.getState() !== "HALF_OPEN") {
    throw new Error("Expected state to stay HALF_OPEN before reaching success threshold");
  }
  cb.recordSuccess(); // 2nd success
  if (cb.getState() !== "CLOSED") {
    throw new Error(`Expected state to recover to CLOSED after 2 successes, got ${cb.getState()}`);
  }

  // Test 6: Trips back to OPEN immediately on failure during HALF_OPEN
  cb.forceState("OPEN");
  // Wait recovery
  const start2 = Date.now();
  while (Date.now() - start2 < 60) {
    // wait
  }
  if (cb.getState() !== "HALF_OPEN") {
    throw new Error("Expected HALF_OPEN state");
  }
  cb.recordFailure(); // Failure during probe
  if (cb.getState() !== "OPEN") {
    throw new Error(`Expected state to revert to OPEN on probe failure, got ${cb.getState()}`);
  }

  // Test 7: Global registry and reset
  const openaiCb = getProviderCircuitBreaker("openai");
  openaiCb.forceState("OPEN");
  if (openaiCb.getState() !== "OPEN") {
    throw new Error("Expected openai breaker to be OPEN");
  }
  resetAllCircuitBreakers();
  if (openaiCb.getState() !== "CLOSED") {
    throw new Error("Expected openai breaker to be reset to CLOSED");
  }

  console.log("✔ Circuit Breaker Tests passed.");
}
