/**
 * Unit Tests — Workflow Step Retries & Error Handling
 */

import { executeWorkflow } from "@/lib/workflows/executor";
import type { WorkflowDefinition } from "@/lib/workflows/types";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export async function runWorkflowRetryTests() {
  const orgId = "org_wf_retry_test";

  // 1. Workflow with continueOnError=true
  const wf: WorkflowDefinition = {
    id: "wf_error_resilience",
    organizationId: orgId,
    name: "Resilient Flow",
    enabled: true,
    triggerEvent: "gateway.request.failed",
    maxExecutionTimeoutMs: 10000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    steps: [
      {
        id: "step_fail",
        name: "Failing Action",
        action: { type: "TRIGGER_INTEGRATION", targetId: "nonexistent_target" },
        continueOnError: true,
        retryCount: 2,
      },
      {
        id: "step_succeed",
        name: "Fallback Notification",
        action: { type: "SEND_NOTIFICATION" },
      },
    ],
  };

  const execution = await executeWorkflow(wf, {
    type: "gateway.request.failed",
    organizationId: orgId,
  });

  assert(execution.status === "SUCCEEDED", "Workflow continued despite Step 1 error due to continueOnError.");
  assert(execution.stepResults[0].status === "FAILED", "Step 1 failed.");
  assert(execution.stepResults[1].status === "SUCCEEDED", "Step 2 executed successfully.");
}
