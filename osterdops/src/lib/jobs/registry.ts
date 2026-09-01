/**
 * OsterdOps — Job Queue Registry & Handlers Setup (Phase 14)
 */

import { MemoryJobQueue } from "./memory-queue";
import type { JobType, JobHandler, JobQueue } from "./types";

const globalQueue = new MemoryJobQueue();

/**
 * Returns the singleton JobQueue instance.
 */
export function getJobQueue(): MemoryJobQueue {
  return globalQueue;
}

/**
 * Registers a handler for a specific job type.
 */
export function registerJobHandler<T = Record<string, unknown>>(
  type: JobType,
  handler: JobHandler<T>
): void {
  globalQueue.registerHandler(type, handler);
}
