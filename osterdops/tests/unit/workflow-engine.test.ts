/**
 * Unit Tests — Workflow Engine & Multi-Step Execution
 */

import {
  createWorkflow,
  getWorkflow,
  triggerWorkflowExecution,
  clearWorkflowsStoreForTesting,
} from "@/lib/workflows/engine";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export async function runWorkflowEngineTests() {
  clearWorkflowsStoreForTesting();
  const orgId = "org_wf_test";

  // 1. Create multi-step workflow
  const wf = await createWorkflow({
    organizationId: orgId,
    name: "Incident Response Flow",
    triggerEvent: "alert.created",
    steps: [
      {
        id: "step_1",
        name: "Check Severity",
        action: { type: "LOG_EVENT" },
        conditions: [{ field: "data.severity", operator: "equals", value: "HIGH" }],
      },
      {
        id: "step_2",
        name: "Dispatch Alert Notice",
        action: { type: "SEND_NOTIFICATION", targetId: "slack_sec" },
      },
    ],
  });

  assert(wf.steps.length === 2, "Workflow has 2 steps.");

  // 2. Execute workflow when pre-conditions match
  const execution = await triggerWorkflowExecution(orgId, wf.id, { severity: "HIGH" });
  assert(execution.status === "SUCCEEDED", "Workflow execution succeeded.");
  assert(execution.stepResults.length === 2, "2 steps executed.");
  assert(execution.stepResults[0].status === "SUCCEEDED", "Step 1 succeeded.");
  assert(execution.stepResults[1].status === "SUCCEEDED", "Step 2 succeeded.");

  // 3. Step skipping when condition does not match
  const skipExecution = await triggerWorkflowExecution(orgId, wf.id, { severity: "LOW" });
  assert(skipExecution.status === "SUCCEEDED", "Workflow overall succeeded.");
  assert(skipExecution.stepResults[0].status === "SKIPPED", "Step 1 was skipped.");
  assert(skipExecution.stepResults[1].status === "SUCCEEDED", "Step 2 was executed.");
}
