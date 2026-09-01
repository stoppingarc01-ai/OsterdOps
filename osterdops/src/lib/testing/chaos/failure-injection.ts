/**
 * OsterdOps — Chaos Engineering Fault Injector Registry (Phase 21)
 *
 * Provides controlled failure simulation hooks across providers, storage,
 * caching, job queues, analytics, billing, and notification dispatchers.
 */

import type { ChaosFaultType, ChaosFaultConfig } from "../types";

class FaultInjectorRegistry {
  private activeFaults: Map<ChaosFaultType, ChaosFaultConfig> = new Map();

  /**
   * Registers and activates a failure injection.
   */
  injectFault(config: ChaosFaultConfig): void {
    this.activeFaults.set(config.type, { ...config, active: true });
  }

  /**
   * Disables a specific fault.
   */
  clearFault(type: ChaosFaultType): void {
    this.activeFaults.delete(type);
  }

  /**
   * Disables all active faults.
   */
  resetAll(): void {
    this.activeFaults.clear();
  }

  /**
   * Checks if a fault is active and should trigger.
   */
  shouldTrigger(type: ChaosFaultType, targetService?: string): boolean {
    const fault = this.activeFaults.get(type);
    if (!fault || !fault.active) return false;

    if (fault.targetService && targetService && fault.targetService !== targetService) {
      return false;
    }

    if (typeof fault.probability === "number") {
      return Math.random() < fault.probability;
    }

    return true;
  }

  /**
   * Gets the active fault configuration.
   */
  getFault(type: ChaosFaultType): ChaosFaultConfig | undefined {
    return this.activeFaults.get(type);
  }

  /**
   * Wraps an asynchronous operation with fault interception.
   */
  async intercept<T>(
    faultType: ChaosFaultType,
    operation: () => Promise<T>,
    targetService?: string
  ): Promise<T> {
    if (this.shouldTrigger(faultType, targetService)) {
      const fault = this.getFault(faultType);
      if (fault?.latencyDelayMs) {
        await new Promise((resolve) => setTimeout(resolve, fault.latencyDelayMs));
      }

      switch (faultType) {
        case "PROVIDER_TIMEOUT":
          throw new Error(fault?.customError || "Gateway timeout: Upstream AI provider failed to respond within 60000ms deadline (504).");
        case "PROVIDER_500":
          throw new Error(fault?.customError || "Upstream provider error (500 Internal Server Error).");
        case "PROVIDER_429":
          throw new Error(fault?.customError || "Upstream provider rate limit exceeded (429 Too Many Requests).");
        case "DATABASE_UNAVAILABLE":
          throw new Error(fault?.customError || "Firestore unavailable: Failed to connect to database replica.");
        case "FIRESTORE_TIMEOUT":
          throw new Error(fault?.customError || "Firestore transaction deadline exceeded.");
        case "REDIS_FAILURE":
          throw new Error(fault?.customError || "Redis connection refused: Falling back to local in-memory store.");
        case "QUEUE_FAILURE":
          throw new Error(fault?.customError || "Job queue worker failure: Task enqueued for delayed retry.");
        case "ANALYTICS_FAILURE":
          throw new Error(fault?.customError || "Analytics processing pipeline failure: Usage preserved safely.");
        case "BILLING_FAILURE":
          throw new Error(fault?.customError || "Billing reconciliation unavailable: Invoice creation queued.");
        case "NOTIFICATION_FAILURE":
          throw new Error(fault?.customError || "Notification webhook unreachable: Retrying via dead-letter queue.");
      }
    }

    return operation();
  }
}

export const ChaosFaultInjector = new FaultInjectorRegistry();
