/**
 * OsterdOps — Workflow Management Engine (Phase 20)
 * Handles workflow definitions CRUD, trigger associations, and execution tracking.
 */

import crypto from "crypto";
import type { WorkflowDefinition, WorkflowExecution, WorkflowStep } from "./types";
import { executeWorkflow } from "./executor";
import { NotFoundError, ValidationError } from "@/lib/api/errors";

const workflowsStore = new Map<string, WorkflowDefinition>();
const executionsStore = new Map<string, WorkflowExecution[]>();

export interface CreateWorkflowParams {
  organizationId: string;
  name: string;
  description?: string;
  triggerEvent: string;
  steps: WorkflowStep[];
  maxExecutionTimeoutMs?: number;
}

export interface UpdateWorkflowParams {
  name?: string;
  description?: string;
  triggerEvent?: string;
  steps?: WorkflowStep[];
  enabled?: boolean;
}

/**
 * Creates a new workflow definition.
 */
export async function createWorkflow(params: CreateWorkflowParams): Promise<WorkflowDefinition> {
  if (!params.name || !params.name.trim()) {
    throw new ValidationError("Workflow name is required.");
  }
  if (!params.triggerEvent || !params.triggerEvent.trim()) {
    throw new ValidationError("Trigger event is required.");
  }
  if (!params.steps || params.steps.length === 0) {
    throw new ValidationError("Workflow must contain at least one step.");
  }

  const id = `wf_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const now = new Date().toISOString();

  const workflow: WorkflowDefinition = {
    id,
    organizationId: params.organizationId,
    name: params.name.trim(),
    description: params.description?.trim(),
    enabled: true,
    triggerEvent: params.triggerEvent.trim(),
    steps: params.steps,
    maxExecutionTimeoutMs: params.maxExecutionTimeoutMs || 30000,
    createdAt: now,
    updatedAt: now,
  };

  workflowsStore.set(id, workflow);
  return { ...workflow };
}

/**
 * Lists all workflow definitions for an organization.
 */
export async function listOrganizationWorkflows(organizationId: string): Promise<WorkflowDefinition[]> {
  const list: WorkflowDefinition[] = [];
  for (const wf of workflowsStore.values()) {
    if (wf.organizationId === organizationId) {
      list.push({ ...wf });
    }
  }
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Retrieves a single workflow definition.
 */
export async function getWorkflow(organizationId: string, workflowId: string): Promise<WorkflowDefinition> {
  const wf = workflowsStore.get(workflowId);
  if (!wf || wf.organizationId !== organizationId) {
    throw new NotFoundError(`Workflow '${workflowId}' not found.`);
  }
  return { ...wf };
}

/**
 * Updates a workflow definition.
 */
export async function updateWorkflow(
  organizationId: string,
  workflowId: string,
  updates: UpdateWorkflowParams
): Promise<WorkflowDefinition> {
  const wf = await getWorkflow(organizationId, workflowId);

  if (updates.name) wf.name = updates.name.trim();
  if (updates.description !== undefined) wf.description = updates.description.trim();
  if (updates.triggerEvent) wf.triggerEvent = updates.triggerEvent.trim();
  if (updates.steps) wf.steps = [...updates.steps];
  if (updates.enabled !== undefined) wf.enabled = updates.enabled;

  wf.updatedAt = new Date().toISOString();
  workflowsStore.set(workflowId, wf);
  return { ...wf };
}

/**
 * Deletes a workflow definition.
 */
export async function deleteWorkflow(organizationId: string, workflowId: string): Promise<void> {
  await getWorkflow(organizationId, workflowId);
  workflowsStore.delete(workflowId);
  executionsStore.delete(workflowId);
}

/**
 * Triggers and executes a workflow definition.
 */
export async function triggerWorkflowExecution(
  organizationId: string,
  workflowId: string,
  mockEventData?: Record<string, unknown>
): Promise<WorkflowExecution> {
  const wf = await getWorkflow(organizationId, workflowId);
  const event = {
    type: wf.triggerEvent,
    organizationId,
    data: mockEventData || {},
  };

  const execution = await executeWorkflow(wf, event);

  const history = executionsStore.get(workflowId) || [];
  history.unshift(execution);
  executionsStore.set(workflowId, history.slice(0, 50));

  return execution;
}

/**
 * Lists execution history for a workflow.
 */
export async function listWorkflowExecutions(
  organizationId: string,
  workflowId: string
): Promise<WorkflowExecution[]> {
  await getWorkflow(organizationId, workflowId);
  return executionsStore.get(workflowId) || [];
}

/**
 * Test helper to clear in-memory workflows store.
 */
export function clearWorkflowsStoreForTesting(): void {
  workflowsStore.clear();
  executionsStore.clear();
}
