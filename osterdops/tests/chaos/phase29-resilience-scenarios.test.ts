/**
 * OsterdOps — Phase 29: Production Reliability, Resilience & Disaster Recovery Tests
 * Validates provider failure containment, circuit breaker self-healing,
 * non-critical telemetry failure containment, duplicate ingestion idempotency,
 * job queue recovery, readiness degradation detection, and shutdown idempotency.
 */

import {
  CircuitBreaker,
  getProviderCircuitBreaker,
  resetAllCircuitBreakers,
} from "@/lib/gateway/circuit-breaker";
import { recordGatewayTelemetry } from "@/lib/gateway/telemetry";
import {
  extractIdempotencyKey,
  checkIdempotency,
  saveIdempotencyResult,
} from "@/lib/api/idempotency";
import { IdempotencyConflictError } from "@/lib/api/errors";
import { MemoryJobQueue } from "@/lib/jobs/memory-queue";
import { performGracefulShutdown } from "@/lib/infrastructure/shutdown";
import { getSystemDiagnostics } from "@/lib/services/diagnostics.service";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export async function runPhase29ResilienceTests(): Promise<void> {
  console.log("\n=== Phase 29 — Production Reliability, Resilience & Disaster Readiness ===");

  // ------------------------------------------------------------
  // Scenario 1: Multi-Provider Failure Isolation
  // ------------------------------------------------------------
  console.log("▶ Running Scenario 1: Provider Failure Isolation...");
  resetAllCircuitBreakers();

  const openaiCb = getProviderCircuitBreaker("openai");
  const anthropicCb = getProviderCircuitBreaker("anthropic");

  // Force OpenAI into failure
  openaiCb.forceState("OPEN");
  assert(openaiCb.getState() === "OPEN", "OpenAI circuit should be OPEN");
  assert(!openaiCb.canExecute(), "OpenAI should fast-fail");

  // Anthropic must remain fully operational and isolated
  assert(anthropicCb.getState() === "CLOSED", "Anthropic circuit must remain CLOSED");
  assert(anthropicCb.canExecute(), "Anthropic calls must continue to succeed");

  resetAllCircuitBreakers();
  console.log("✔ Scenario 1: Provider Failure Isolation passed.");

  // ------------------------------------------------------------
  // Scenario 2: Circuit Breaker Recovery Probing & Self-Healing
  // ------------------------------------------------------------
  console.log("▶ Running Scenario 2: Circuit Breaker Self-Healing...");
  const recoveryCb = new CircuitBreaker("mock-resilient-provider", {
    failureThreshold: 2,
    recoveryTimeMs: 40,
    halfOpenSuccessThreshold: 2,
  });

  recoveryCb.recordFailure();
  recoveryCb.recordFailure();
  assert(recoveryCb.getState() === "OPEN", "Circuit should trip to OPEN after 2 failures");

  // Wait for recovery probe window
  const waitStart = Date.now();
  while (Date.now() - waitStart < 50) {
    // wait for recovery window
  }

  assert(recoveryCb.getState() === "HALF_OPEN", "Circuit should transition to HALF_OPEN after recovery window");
  assert(recoveryCb.canExecute(), "HALF_OPEN circuit should permit test probes");

  // Record required successes to heal
  recoveryCb.recordSuccess();
  assert(recoveryCb.getState() === "HALF_OPEN", "Should stay HALF_OPEN until success threshold is met");
  recoveryCb.recordSuccess();
  assert(recoveryCb.getState() === "CLOSED", "Circuit must self-heal back to CLOSED after 2 successes");
  console.log("✔ Scenario 2: Circuit Breaker Self-Healing passed.");

  // ------------------------------------------------------------
  // Scenario 3: Non-Critical Telemetry Failure Containment
  // ------------------------------------------------------------
  console.log("▶ Running Scenario 3: Telemetry Failure Containment...");
  // Pass invalid/extreme parameters to recordGatewayTelemetry; it must catch and contain internally
  let threw = false;
  try {
    recordGatewayTelemetry({
      requestId: "gw_fault_injection_test",
      organizationId: "org_fault",
      projectId: "proj_fault",
      keyId: "key_fault",
      provider: "gemini",
      model: "gemini-2.5-flash",
      status: "success",
      httpStatus: 200,
      durationMs: 99,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      usage: { totalTokens: NaN } as any, // fault injection
      timestamp: new Date().toISOString(),
    });
  } catch {
    threw = true;
  }
  assert(!threw, "recordGatewayTelemetry must never throw or disrupt the gateway response path");
  console.log("✔ Scenario 3: Telemetry Failure Containment passed.");

  // ------------------------------------------------------------
  // Scenario 4: Enterprise Idempotency & Duplicate Request Protection
  // ------------------------------------------------------------
  console.log("▶ Running Scenario 4: Ingestion Idempotency & Duplicate Protection...");
  const testOrgId = "org_idempotency_test";
  const endpoint = "/api/v1/chat/completions";
  const idempotencyKey = `idem_key_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const requestBody = {
    model: "gpt-4o",
    messages: [{ role: "user", content: "Hello world" }],
  };

  // Header extraction test
  const headers = new Headers();
  headers.set("idempotency-key", idempotencyKey);
  const extractedKey = extractIdempotencyKey(headers);
  assert(extractedKey === idempotencyKey, "Header extraction must match idempotency key");

  // Initial request check
  const initialCheck = await checkIdempotency(testOrgId, endpoint, idempotencyKey, requestBody);
  assert(!initialCheck.replayed, "First request must not be marked replayed");

  // Save completed result
  const mockResponse = { id: "chat_123", output: "Hello back!" };
  await saveIdempotencyResult(testOrgId, endpoint, idempotencyKey, 200, mockResponse);

  // Replay check with identical payload
  const replayCheck = await checkIdempotency(testOrgId, endpoint, idempotencyKey, requestBody);
  assert(replayCheck.replayed, "Duplicate request with same key must be marked replayed");
  assert(replayCheck.record?.statusCode === 200, "Cached status code must match");

  // Collision detection: same key with different payload must throw IdempotencyConflictError
  const mutatedBody = {
    model: "gpt-4o",
    messages: [{ role: "user", content: "Different question entirely" }],
  };
  let conflictCaught = false;
  try {
    await checkIdempotency(testOrgId, endpoint, idempotencyKey, mutatedBody);
  } catch (err) {
    if (err instanceof IdempotencyConflictError) {
      conflictCaught = true;
    }
  }
  assert(conflictCaught, "Reusing idempotency key with different payload must throw IdempotencyConflictError");
  console.log("✔ Scenario 4: Ingestion Idempotency & Duplicate Protection passed.");

  // ------------------------------------------------------------
  // Scenario 5: Job Queue Recovery & Interrupted Worker Replay
  // ------------------------------------------------------------
  console.log("▶ Running Scenario 5: Job Queue Recovery & Interrupted Worker Replay...");
  const testQueue = new MemoryJobQueue();

  // Enqueue a job that will fail and become a dead letter
  testQueue.registerHandler("NOTIFICATION_DISPATCH", async () => {
    throw new Error("Downstream notification service unavailable (fatal)");
  });

  const job = await testQueue.enqueue("NOTIFICATION_DISPATCH", "org_test", { recipient: "ops@osterdops.io" }, { maxAttempts: 1 });
  await testQueue.processNext();

  const deadLetters = await testQueue.getDeadLetters();
  assert(deadLetters.length >= 1, "Failed job must be sent to dead letter queue");
  assert(deadLetters[0].id === job.id, "Dead letter ID must match failed job");

  // Requeue all dead letters
  const requeuedCount = await testQueue.requeueAllDeadLetters();
  assert(requeuedCount === 1, "Must requeue 1 dead letter");

  const statsAfterRequeue = testQueue.getQueueStats();
  assert(statsAfterRequeue.deadLetters === 0, "Dead letter count must be 0 after replay");
  assert(statsAfterRequeue.pending === 1, "Job must return to pending queue");

  // Simulate an interrupted worker where job was marked PROCESSING
  const interruptedJob = await testQueue.enqueue("USAGE_RECORD", "org_test", { tokens: 50 });
  interruptedJob.status = "PROCESSING" as const;

  const recoveredCount = testQueue.recoverInterruptedJobs();
  assert(recoveredCount >= 1, "Must recover interrupted processing job back to pending");
  const checkJob = await testQueue.getJob(interruptedJob.id);
  assert(checkJob?.status === "PENDING", "Interrupted job status must be reset to PENDING");
  console.log("✔ Scenario 5: Job Queue Recovery & Interrupted Worker Replay passed.");

  // ------------------------------------------------------------
  // Scenario 6: System Readiness Degradation Visibility
  // ------------------------------------------------------------
  console.log("▶ Running Scenario 6: Readiness Degradation Visibility...");
  resetAllCircuitBreakers();

  // Normal diagnostics
  const normalDiag = await getSystemDiagnostics("ADMIN");
  assert(normalDiag.checks.circuitBreakers?.status === "OK", "Circuit breakers should be OK initially");
  assert(normalDiag.checks.readiness?.status === "READY", "System should be READY initially");

  // Trip Azure circuit breaker
  const azureCb = getProviderCircuitBreaker("azure");
  azureCb.forceState("OPEN");

  const degradedDiag = await getSystemDiagnostics("ADMIN");
  assert(degradedDiag.checks.circuitBreakers?.status === "DEGRADED", "Circuit breakers must report DEGRADED when open");
  assert(Boolean(degradedDiag.checks.circuitBreakers?.openProviders?.includes("azure")), "Must list azure as open provider");
  assert(degradedDiag.checks.readiness?.status === "DEGRADED", "Readiness probe must report DEGRADED status");

  resetAllCircuitBreakers();
  console.log("✔ Scenario 6: Readiness Degradation Visibility passed.");

  // ------------------------------------------------------------
  // Scenario 7: Multi-Signal Shutdown Idempotency
  // ------------------------------------------------------------
  console.log("▶ Running Scenario 7: Multi-Signal Shutdown Idempotency...");
  // Calling performGracefulShutdown multiple times concurrently must return the same promise safely
  const [res1, res2] = await Promise.all([
    performGracefulShutdown({ timeoutMs: 3000, exitOnComplete: false }),
    performGracefulShutdown({ timeoutMs: 3000, exitOnComplete: false }),
  ]);

  assert(res1.durationMs >= 0, "First shutdown call must return valid duration");
  assert(res2.durationMs >= 0, "Concurrent shutdown call must succeed idempotently");
  console.log("✔ Scenario 7: Multi-Signal Shutdown Idempotency passed.");

  console.log("✔ All Phase 29 Resilience & Disaster Readiness Scenarios passed.");
}
