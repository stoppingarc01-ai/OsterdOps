/**
 * OsterdOps — Durable Job Queue Infrastructure Types (Phase 14)
 */

export type JobType =
  | "USAGE_RECORD"
  | "COST_RECORD"
  | "BUDGET_EVALUATION"
  | "ALERT_DISPATCH"
  | "NOTIFICATION_DISPATCH"
  | "BILLING_RECONCILIATION"
  | "INTEGRATION_DELIVERY"
  | "AUTOMATION_EXECUTION"
  | "WORKFLOW_EXECUTION";

export type JobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "DEAD_LETTER";

export interface Job<T = Record<string, unknown>> {
  id: string;
  type: JobType;
  organizationId: string;
  payload: T;
  attempt: number;
  maxAttempts: number;
  idempotencyKey?: string;
  createdAt: string;
  updatedAt: string;
  lastError?: string;
  backoffMs?: number;
  status: JobStatus;
}

export type JobHandler<T = Record<string, unknown>> = (job: Job<T>) => Promise<void>;

export interface EnqueueOptions {
  idempotencyKey?: string;
  maxAttempts?: number;
}

export interface JobQueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  deadLetters: number;
}

export interface JobQueue {
  enqueue<T = Record<string, unknown>>(
    type: JobType,
    organizationId: string,
    payload: T,
    options?: EnqueueOptions
  ): Promise<Job<T>>;
  processNext(): Promise<boolean>;
  getJob(jobId: string): Promise<Job<unknown> | null>;
  getDeadLetters(limit?: number): Promise<Job<unknown>[]>;
  retryDeadLetter(jobId: string): Promise<Job<unknown> | null>;
  requeueAllDeadLetters(): Promise<number>;
  recoverInterruptedJobs(): number;
  getQueueStats(): JobQueueStats;
}
