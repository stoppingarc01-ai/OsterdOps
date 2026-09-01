/**
 * OsterdOps — Per-Provider Circuit Breaker (Phase 28)
 * Implements a state machine (CLOSED -> OPEN -> HALF_OPEN) to prevent cascading
 * upstream failures and avoid latency amplification during AI provider outages.
 */

import { incrementMetric } from "@/lib/observability/metrics";
import type { AIProvider } from "@/types";

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerOptions {
  failureThreshold?: number; // Number of failures to trigger OPEN (default 5)
  recoveryTimeMs?: number;   // Duration in ms to stay OPEN before HALF_OPEN probe (default 30000ms)
  halfOpenSuccessThreshold?: number; // Successes in HALF_OPEN to transition to CLOSED (default 2)
  monitoringWindowMs?: number; // Rolling window for counting failures (default 60000ms)
}

export class CircuitBreakerError extends Error {
  public readonly code = "CIRCUIT_BREAKER_OPEN";
  public readonly provider: string;
  public readonly resetInMs: number;

  constructor(provider: string, resetInMs: number) {
    super(`Circuit breaker is OPEN for provider '${provider}'. Fast-failing upstream call. Retry in ${Math.ceil(resetInMs / 1000)}s.`);
    this.name = "CircuitBreakerError";
    this.provider = provider;
    this.resetInMs = resetInMs;
  }
}

export class CircuitBreaker {
  public readonly provider: string;
  private state: CircuitState = "CLOSED";
  private failureTimestamps: number[] = [];
  private halfOpenSuccesses = 0;
  private lastStateChange: number = Date.now();
  private readonly failureThreshold: number;
  private readonly recoveryTimeMs: number;
  private readonly halfOpenSuccessThreshold: number;
  private readonly monitoringWindowMs: number;

  constructor(provider: string, options: CircuitBreakerOptions = {}) {
    this.provider = provider;
    this.failureThreshold = options.failureThreshold ?? 5;
    this.recoveryTimeMs = options.recoveryTimeMs ?? 30000;
    this.halfOpenSuccessThreshold = options.halfOpenSuccessThreshold ?? 2;
    this.monitoringWindowMs = options.monitoringWindowMs ?? 60000;
  }

  public getState(): CircuitState {
    const now = Date.now();
    if (this.state === "OPEN") {
      if (now - this.lastStateChange >= this.recoveryTimeMs) {
        this.transitionTo("HALF_OPEN");
      }
    }
    return this.state;
  }

  public canExecute(): boolean {
    const currentState = this.getState();
    return currentState === "CLOSED" || currentState === "HALF_OPEN";
  }

  public checkExecution(): void {
    if (!this.canExecute()) {
      const remainingMs = Math.max(0, this.recoveryTimeMs - (Date.now() - this.lastStateChange));
      incrementMetric("circuit_breaker.rejections_total", 1, { provider: this.provider });
      throw new CircuitBreakerError(this.provider, remainingMs);
    }
  }

  public recordSuccess(): void {
    const currentState = this.getState();
    if (currentState === "HALF_OPEN") {
      this.halfOpenSuccesses++;
      if (this.halfOpenSuccesses >= this.halfOpenSuccessThreshold) {
        this.transitionTo("CLOSED");
        this.reset();
      }
    } else if (currentState === "CLOSED") {
      this.pruneOldFailures();
    }
  }

  public recordFailure(): void {
    const now = Date.now();
    const currentState = this.getState();

    if (currentState === "HALF_OPEN") {
      // In HALF_OPEN, a single failure trips it back to OPEN immediately
      this.transitionTo("OPEN");
    } else if (currentState === "CLOSED") {
      this.failureTimestamps.push(now);
      this.pruneOldFailures();

      if (this.failureTimestamps.length >= this.failureThreshold) {
        this.transitionTo("OPEN");
      }
    }
  }

  public reset(): void {
    this.failureTimestamps = [];
    this.halfOpenSuccesses = 0;
  }

  public forceState(state: CircuitState): void {
    this.transitionTo(state);
    this.reset();
  }

  private transitionTo(newState: CircuitState): void {
    if (this.state !== newState) {
      const oldState = this.state;
      this.state = newState;
      this.lastStateChange = Date.now();
      incrementMetric("circuit_breaker.state_transitions_total", 1, {
        provider: this.provider,
        from: oldState,
        to: newState,
      });
    }
  }

  private pruneOldFailures(): void {
    const thresholdTime = Date.now() - this.monitoringWindowMs;
    this.failureTimestamps = this.failureTimestamps.filter((ts) => ts >= thresholdTime);
  }

  public getStats(): {
    provider: string;
    state: CircuitState;
    recentFailures: number;
    failureThreshold: number;
    lastStateChange: number;
  } {
    return {
      provider: this.provider,
      state: this.getState(),
      recentFailures: this.failureTimestamps.length,
      failureThreshold: this.failureThreshold,
      lastStateChange: this.lastStateChange,
    };
  }
}

// Global provider-level circuit breakers registry
const registry = new Map<string, CircuitBreaker>();

export function getProviderCircuitBreaker(provider: AIProvider | string): CircuitBreaker {
  let cb = registry.get(provider);
  if (!cb) {
    cb = new CircuitBreaker(provider);
    registry.set(provider, cb);
  }
  return cb;
}

export function resetAllCircuitBreakers(): void {
  for (const cb of registry.values()) {
    cb.forceState("CLOSED");
  }
}

export function getAllCircuitBreakerStats(): Record<string, ReturnType<CircuitBreaker["getStats"]>> {
  const stats: Record<string, ReturnType<CircuitBreaker["getStats"]>> = {};
  for (const [provider, cb] of registry.entries()) {
    stats[provider] = cb.getStats();
  }
  return stats;
}

export interface CircuitBreakerSummary {
  total: number;
  open: number;
  closed: number;
  halfOpen: number;
  openProviders: string[];
  degraded: boolean;
}

export function getCircuitBreakerSummary(): CircuitBreakerSummary {
  let open = 0;
  let closed = 0;
  let halfOpen = 0;
  const openProviders: string[] = [];

  for (const [provider, cb] of registry.entries()) {
    const state = cb.getState();
    if (state === "OPEN") {
      open++;
      openProviders.push(provider);
    } else if (state === "HALF_OPEN") {
      halfOpen++;
      openProviders.push(provider);
    } else {
      closed++;
    }
  }

  return {
    total: registry.size,
    open,
    closed,
    halfOpen,
    openProviders,
    degraded: open > 0 || halfOpen > 0,
  };
}
