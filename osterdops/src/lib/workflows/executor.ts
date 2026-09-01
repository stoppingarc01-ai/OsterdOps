/**
 * OsterdOps — Workflow Step Executor & State Transition Engine (Phase 20)
 * Coordinates step-by-step action dispatch, evaluation of step pre-conditions, and retry handling.
 */

import type { WorkflowDefinition, WorkflowExecution, WorkflowStepResult } from "./types";
import { evaluateAllConditions } from "@/lib/automation/conditions";
import { executeAutomationAction } from "@/lib/automation/actions";

/**
 * Executes a workflow definition against an event payload.
 */
export async function executeWorkflow(
  workflow: WorkflowDefinition,
  event: { type: string; organizationId: string; data?: Record<string, unknown> }
): Promise<WorkflowExecution> {
  const executionId = `wfexec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const startedAt = new Date().toISOString();
  const startTime = Date.now();

  const execution: WorkflowExecution = {
    id: executionId,
    workflowId: workflow.id,
    organizationId: workflow.organizationId,
    status: "RUNNING",
    triggerEvent: event.type,
    stepResults: [],
    startedAt,
  };

  const eventPayload = {
    type: event.type,
    organizationId: event.organizationId,
    data: event.data || {},
    ...(event.data || {}),
  };

  let hasFailed = false;

  for (const step of workflow.steps) {
    const stepStartTime = Date.now();

    // Check step pre-conditions if specified
    if (step.conditions && step.conditions.length > 0) {
      const conditionPassed = evaluateAllConditions(step.conditions, eventPayload);
      if (!conditionPassed) {
        execution.stepResults.push({
          stepId: step.id,
          name: step.name,
          status: "SKIPPED",
          durationMs: Date.now() - stepStartTime,
        });
        continue;
      }
    }

    // Execute step action with retry capability
    let attempts = 0;
    const maxAttempts = (step.retryCount || 0) + 1;
    let stepSuccess = false;
    let stepError: string | undefined;

    while (attempts < maxAttempts && !stepSuccess) {
      attempts++;
      const outcome = await executeAutomationAction(workflow.organizationId, step.action, eventPayload);
      if (outcome.success) {
        stepSuccess = true;
      } else {
        stepError = outcome.error;
      }
    }

    const stepResult: WorkflowStepResult = {
      stepId: step.id,
      name: step.name,
      status: stepSuccess ? "SUCCEEDED" : "FAILED",
      durationMs: Date.now() - stepStartTime,
      error: stepError,
    };

    execution.stepResults.push(stepResult);

    if (!stepSuccess && !step.continueOnError) {
      hasFailed = true;
      execution.status = "FAILED";
      execution.errorMessage = stepError || `Step '${step.name}' failed.`;
      break;
    }
  }

  execution.completedAt = new Date().toISOString();
  execution.durationMs = Date.now() - startTime;
  if (!hasFailed) {
    execution.status = "SUCCEEDED";
  }

  return execution;
}
