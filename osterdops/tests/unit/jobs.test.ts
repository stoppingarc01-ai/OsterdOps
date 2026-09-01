/**
 * OsterdOps — Phase 14: Job Queue & Background Processing Unit Tests
 */

import { MemoryJobQueue } from "@/lib/jobs/memory-queue";

export async function testJobQueueLifecycle() {
  const queue = new MemoryJobQueue();

  // 1. Register a test handler
  let processedCount = 0;
  queue.registerHandler("USAGE_RECORD", async (_job) => {
    processedCount += 1;
  });

  // 2. Enqueue job
  const job1 = await queue.enqueue("USAGE_RECORD", "org_123", { tokens: 500 });
  if (job1.status !== "PENDING" || !job1.id) {
    throw new Error("Initial job enqueued state mismatch.");
  }

  // 3. Process job
  const processed = await queue.processNext();
  if (!processed || processedCount !== 1) {
    throw new Error("Job processing failed.");
  }
  if ((job1.status as string) !== "COMPLETED") {
    throw new Error("Job status should be COMPLETED after successful execution.");
  }

  // 4. Idempotency deduplication
  const idempKey = "idemp_usage_abc_123";
  const firstJob = await queue.enqueue("USAGE_RECORD", "org_123", { val: 1 }, { idempotencyKey: idempKey });
  const duplicateJob = await queue.enqueue("USAGE_RECORD", "org_123", { val: 2 }, { idempotencyKey: idempKey });

  if (firstJob.id !== duplicateJob.id) {
    throw new Error("Duplicate idempotency key should return the existing job.");
  }
  // Process the idempotency test job
  await queue.processNext();

  // 5. Dead-letter queue for job without registered handler
  const unhandledJob = await queue.enqueue("NOTIFICATION_DISPATCH", "org_123", { msg: "hi" });
  await queue.processNext();

  if ((unhandledJob.status as string) !== "DEAD_LETTER") {
    throw new Error("Unhandled job type should move to DEAD_LETTER.");
  }

  const deadLetters = await queue.getDeadLetters();
  if (deadLetters.length === 0 || deadLetters[0].id !== unhandledJob.id) {
    throw new Error("Dead letter retrieval failed.");
  }

  // 6. Retry dead letter
  const retried = await queue.retryDeadLetter(unhandledJob.id);
  if (!retried || retried.status !== "PENDING") {
    throw new Error("Dead letter retry did not set status to PENDING.");
  }
}

export async function runJobQueueTests() {
  await testJobQueueLifecycle();
}
