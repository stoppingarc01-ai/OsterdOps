/**
 * OsterdOps — Workflow Engine & State Machine Types (Phase 20)
 * Multi-step sequential and branching workflows with retries, timeouts, and state tracking.
 */

import type { RuleCondition, AutomationAction } from "@/lib/automation/types";

export type WorkflowState =
  | "PENDING"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELED"
  | "TIMED_OUT"
  | "DEAD_LETTERED";

export interface WorkflowStep {
  id: string;
  name: string;
  action: AutomationAction;
  conditions?: RuleCondition[];
  continueOnError?: boolean;
  timeoutMs?: number;
  retryCount?: number;
}

export interface WorkflowDefinition {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  enabled: boolean;
  triggerEvent: string;
  steps: WorkflowStep[];
  maxExecutionTimeoutMs: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStepResult {
  stepId: string;
  name: string;
  status: "SUCCEEDED" | "FAILED" | "SKIPPED";
  durationMs: number;
  error?: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  organizationId: string;
  status: WorkflowState;
  triggerEvent: string;
  stepResults: WorkflowStepResult[];
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  errorMessage?: string;
}
