/**
 * OsterdOps — Graceful Shutdown Coordinator Unit Tests (Phase 28)
 * Validates handler registration, graceful shutdown execution, error isolation,
 * and status reporting.
 */

import {
  shutdownManager,
  registerShutdownHandler,
  performGracefulShutdown,
} from "@/lib/infrastructure/shutdown";

export async function runShutdownTests(): Promise<void> {
  console.log("▶ Running Graceful Shutdown Tests (Phase 28)...");

  // Test 1: Manager status and default handlers
  const initialStatus = shutdownManager.getStatus();
  if (initialStatus.isShuttingDown) {
    throw new Error("Shutdown manager should not be in shutting down state initially");
  }
  if (!initialStatus.registeredHandlers.includes("JobQueueDrain")) {
    throw new Error("JobQueueDrain handler should be registered by default");
  }
  if (!initialStatus.registeredHandlers.includes("CachePruning")) {
    throw new Error("CachePruning handler should be registered by default");
  }

  // Test 2: Register custom shutdown handler
  let customHandlerRan = false;
  registerShutdownHandler("TestCustomHandler", () => {
    customHandlerRan = true;
  });

  const updatedStatus = shutdownManager.getStatus();
  if (!updatedStatus.registeredHandlers.includes("TestCustomHandler")) {
    throw new Error("TestCustomHandler should appear in registered handlers");
  }

  // Test 3: Register failing handler to test error isolation
  registerShutdownHandler("FailingHandler", () => {
    throw new Error("Simulated handler crash");
  });

  // Test 4: Execute shutdown without exitOnComplete
  const result = await performGracefulShutdown({ timeoutMs: 3000, exitOnComplete: false });
  if (!customHandlerRan) {
    throw new Error("Expected custom handler to run during shutdown");
  }
  if (!result.completed.includes("TestCustomHandler")) {
    throw new Error("Expected TestCustomHandler to be in completed list");
  }
  if (!result.failed.includes("FailingHandler")) {
    throw new Error("Expected FailingHandler to be in failed list");
  }
  // Other handlers must still complete despite FailingHandler error
  if (!result.completed.includes("JobQueueDrain")) {
    throw new Error("JobQueueDrain should still complete despite other failures");
  }

  console.log("✔ Graceful Shutdown Tests passed.");
}
