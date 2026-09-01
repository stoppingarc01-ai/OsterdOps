/**
 * OsterdOps — In-Memory Durable Job Queue (Phase 14)
 * Provides asynchronous background execution with retry policy, dead-letter storage,
 * and deterministic idempotency deduplication.
 */

import { calculateExponentialBackoff, isRetryableError } from "./retry";
import type {
  Job,
  JobQueue,
  JobType,
  JobHandler,
  EnqueueOptions,
  JobQueueStats,
} from "./types";

export class MemoryJobQueue implements JobQueue {
  private readonly maxRetainedJobs = 10000;
  private pending: Job<unknown>[] = [];
  private allJobs = new Map<string, Job<unknown>>();
  private deadLetters = new Map<string, Job<unknown>>();
  private idempotencyMap = new Map<string, string>();
  private handlers = new Map<JobType, JobHandler<unknown>>();

  private completedCount = 0;
  private failedCount = 0;

  private pruneOldCompletedJobs(): void {
    if (this.allJobs.size < this.maxRetainedJobs) return;
    let pruned = 0;
    for (const [id, job] of this.allJobs.entries()) {
      if (job.status === "COMPLETED") {
        this.allJobs.delete(id);
        if (job.idempotencyKey) {
          this.idempotencyMap.delete(job.idempotencyKey);
        }
        pruned += 1;
        if (pruned >= 500) break;
      }
    }
  }

  registerHandler<T = Record<string, unknown>>(type: JobType, handler: JobHandler<T>): void {
    this.handlers.set(type, handler as JobHandler<unknown>);
  }

  async enqueue<T = Record<string, unknown>>(
    type: JobType,
    organizationId: string,
    payload: T,
    options: EnqueueOptions = {}
  ): Promise<Job<T>> {
    // 1. Idempotency Check
    if (options.idempotencyKey && this.idempotencyMap.has(options.idempotencyKey)) {
      const existingId = this.idempotencyMap.get(options.idempotencyKey)!;
      const existing = this.allJobs.get(existingId) || this.deadLetters.get(existingId);
      if (existing) {
        return existing as Job<T>;
      }
    }

    this.pruneOldCompletedJobs();

    const now = new Date().toISOString();
    const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    const job: Job<T> = {
      id: jobId,
      type,
      organizationId,
      payload,
      attempt: 0,
      maxAttempts: options.maxAttempts || 3,
      idempotencyKey: options.idempotencyKey,
      createdAt: now,
      updatedAt: now,
      status: "PENDING",
    };

    if (options.idempotencyKey) {
      this.idempotencyMap.set(options.idempotencyKey, jobId);
    }

    this.allJobs.set(jobId, job as Job<unknown>);
    this.pending.push(job as Job<unknown>);

    return job;
  }

  async processNext(): Promise<boolean> {
    if (this.pending.length === 0) {
      return false;
    }

    const job = this.pending.shift()!;
    job.attempt += 1;
    job.status = "PROCESSING";
    job.updatedAt = new Date().toISOString();

    const handler = this.handlers.get(job.type);
    if (!handler) {
      job.status = "DEAD_LETTER";
      job.lastError = `No handler registered for job type '${job.type}'.`;
      this.deadLetters.set(job.id, job);
      this.failedCount += 1;
      return true;
    }

    try {
      await handler(job);
      job.status = "COMPLETED";
      job.updatedAt = new Date().toISOString();
      this.completedCount += 1;
      return true;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      job.lastError = errorMsg;
      job.updatedAt = new Date().toISOString();

      const retryable = isRetryableError(err);

      if (retryable && job.attempt < job.maxAttempts) {
        job.status = "PENDING";
        job.backoffMs = calculateExponentialBackoff(job.attempt);
        // Re-enqueue for retry
        this.pending.push(job);
      } else {
        job.status = "DEAD_LETTER";
        this.deadLetters.set(job.id, job);
        this.failedCount += 1;
      }

      return true;
    }
  }

  /**
   * Processes a batch of pending jobs with bounded concurrency.
   */
  async processBatch(batchSize = 10, concurrency = 5): Promise<number> {
    const toProcess = Math.min(batchSize, this.pending.length);
    if (toProcess === 0) return 0;

    let processedCount = 0;
    const workerPool: Promise<void>[] = [];

    const runWorker = async () => {
      while (processedCount < toProcess && this.pending.length > 0) {
        processedCount += 1;
        await this.processNext();
      }
    };

    const workerCount = Math.min(concurrency, toProcess);
    for (let i = 0; i < workerCount; i++) {
      workerPool.push(runWorker());
    }

    await Promise.all(workerPool);
    return processedCount;
  }

  async getJob(jobId: string): Promise<Job<unknown> | null> {
    return this.allJobs.get(jobId) || this.deadLetters.get(jobId) || null;
  }

  async getDeadLetters(limit = 50): Promise<Job<unknown>[]> {
    const list = Array.from(this.deadLetters.values());
    return list.slice(0, Math.min(limit, 100));
  }

  async retryDeadLetter(jobId: string): Promise<Job<unknown> | null> {
    const job = this.deadLetters.get(jobId);
    if (!job) return null;

    this.deadLetters.delete(jobId);
    job.status = "PENDING";
    job.attempt = 0;
    job.lastError = undefined;
    job.updatedAt = new Date().toISOString();

    this.pending.push(job);
    return job;
  }

  async requeueAllDeadLetters(): Promise<number> {
    const deadLetterIds = Array.from(this.deadLetters.keys());
    let requeued = 0;
    for (const id of deadLetterIds) {
      const res = await this.retryDeadLetter(id);
      if (res) requeued++;
    }
    return requeued;
  }

  recoverInterruptedJobs(): number {
    let recovered = 0;
    for (const job of this.allJobs.values()) {
      if (job.status === "PROCESSING") {
        job.status = "PENDING";
        job.updatedAt = new Date().toISOString();
        this.pending.unshift(job); // prioritize interrupted jobs
        recovered++;
      }
    }
    return recovered;
  }

  getQueueStats(): JobQueueStats {
    return {
      pending: this.pending.length,
      processing: Array.from(this.allJobs.values()).filter((j) => j.status === "PROCESSING").length,
      completed: this.completedCount,
      failed: this.failedCount,
      deadLetters: this.deadLetters.size,
    };
  }

  clear(): void {
    this.pending = [];
    this.allJobs.clear();
    this.deadLetters.clear();
    this.idempotencyMap.clear();
    this.completedCount = 0;
    this.failedCount = 0;
  }
}
