/**
 * OsterdOps — Graceful Shutdown & Drain Coordinator (Phase 28)
 * Ensures active background tasks, queue jobs, and in-memory caches
 * are safely drained and pruned prior to process termination.
 */

import { getJobQueue } from "@/lib/jobs/registry";
import { pruneAllExpiredEntries } from "@/lib/cache";
import { logger } from "@/lib/observability/logger";
import { getOperationalMetricsSnapshot, recordLatencyMetric } from "@/lib/observability/metrics";

export type ShutdownHandler = () => Promise<void> | void;

export interface ShutdownOptions {
  timeoutMs?: number;
  exitOnComplete?: boolean;
}

class GracefulShutdownManager {
  private isShuttingDown = false;
  private activeShutdownPromise: Promise<{
    success: boolean;
    completed: string[];
    failed: string[];
    durationMs: number;
  }> | null = null;
  private handlers: { name: string; fn: ShutdownHandler }[] = [];
  private signalListenersAttached = false;

  constructor() {
    this.registerDefaultHandlers();
  }

  private registerDefaultHandlers(): void {
    // 1. Drain pending background job queue & recover interrupted jobs
    this.registerHandler("JobQueueDrain", async () => {
      try {
        const queue = getJobQueue();
        const processed = await queue.processBatch(25, 5);
        const recovered = queue.recoverInterruptedJobs();
        logger.info("Graceful shutdown: drained job queue batch", { processed, recovered });
      } catch (err) {
        logger.warn("Graceful shutdown: job queue drain encountered non-fatal error", { error: String(err) });
      }
    });

    // 2. Prune expired cache entries across all registries
    this.registerHandler("CachePruning", () => {
      try {
        const pruned = pruneAllExpiredEntries();
        logger.info("Graceful shutdown: pruned expired cache entries", { pruned });
      } catch (err) {
        logger.warn("Graceful shutdown: cache prune error", { error: String(err) });
      }
    });

    // 3. Final metrics telemetry snapshot
    this.registerHandler("TelemetrySnapshot", () => {
      try {
        const snapshot = getOperationalMetricsSnapshot();
        logger.info("Graceful shutdown: final metrics snapshot recorded", {
          totalCounters: Object.keys(snapshot.counters).length,
        });
      } catch {
        // Suppress errors during telemetry snapshot on shutdown
      }
    });
  }

  public registerHandler(name: string, fn: ShutdownHandler): void {
    this.handlers.push({ name, fn });
  }

  public attachSignalListeners(): void {
    if (this.signalListenersAttached || typeof process === "undefined" || !process.on) {
      return;
    }

    const onSignal = (signal: string) => {
      logger.info(`Received signal ${signal}. Initiating graceful shutdown...`);
      this.shutdown({ timeoutMs: 10000, exitOnComplete: true }).catch((err) => {
        logger.error("Graceful shutdown encountered fatal error", err);
        process.exit(1);
      });
    };

    process.once("SIGTERM", () => onSignal("SIGTERM"));
    process.once("SIGINT", () => onSignal("SIGINT"));
    this.signalListenersAttached = true;
  }

  public async shutdown(options: ShutdownOptions = {}): Promise<{
    success: boolean;
    completed: string[];
    failed: string[];
    durationMs: number;
  }> {
    if (this.activeShutdownPromise) {
      return this.activeShutdownPromise;
    }
    this.isShuttingDown = true;

    this.activeShutdownPromise = (async () => {
      const timeoutMs = options.timeoutMs ?? 10000;
      const startTime = Date.now();
      const completed: string[] = [];
      const failed: string[] = [];

      const shutdownPromise = (async () => {
        for (const handler of this.handlers) {
          try {
            await handler.fn();
            completed.push(handler.name);
          } catch (err) {
            failed.push(handler.name);
            logger.warn(`Shutdown handler '${handler.name}' failed`, { error: String(err) });
          }
        }
      })();

      const timeoutPromise = new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error(`Shutdown deadline exceeded (${timeoutMs}ms)`)), timeoutMs)
      );

      try {
        await Promise.race([shutdownPromise, timeoutPromise]);
      } catch (err) {
        logger.error("Graceful shutdown timed out", err);
      }

      const durationMs = Date.now() - startTime;
      recordLatencyMetric("shutdown_duration", durationMs);

      logger.info("Graceful shutdown sequence finished", {
        completedCount: completed.length,
        failedCount: failed.length,
        durationMs,
      });

      if (options.exitOnComplete && typeof process !== "undefined" && process.exit) {
        process.exit(failed.length > 0 ? 1 : 0);
      }

      this.isShuttingDown = false;
      this.activeShutdownPromise = null;
      return {
        success: failed.length === 0,
        completed,
        failed,
        durationMs,
      };
    })();

    return this.activeShutdownPromise;
  }

  public getStatus(): { isShuttingDown: boolean; registeredHandlers: string[] } {
    return {
      isShuttingDown: this.isShuttingDown,
      registeredHandlers: this.handlers.map((h) => h.name),
    };
  }
}

export const shutdownManager = new GracefulShutdownManager();

export function registerShutdownHandler(name: string, fn: ShutdownHandler): void {
  shutdownManager.registerHandler(name, fn);
}

export async function performGracefulShutdown(options?: ShutdownOptions) {
  return shutdownManager.shutdown(options);
}
