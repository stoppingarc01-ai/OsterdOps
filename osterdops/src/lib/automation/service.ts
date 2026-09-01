/**
 * OsterdOps — Automation Rules Service (Phase 20)
 * Manages rule definitions, status transitions, and dry-run execution testing.
 */

import crypto from "crypto";
import type { AutomationRule, RuleCondition, AutomationAction, RuleExecutionResult } from "./types";
import { evaluateAndExecuteRule } from "./engine";
import { evaluateAllConditions } from "./conditions";
import { NotFoundError, ValidationError } from "@/lib/api/errors";

const rulesStore = new Map<string, AutomationRule>();

export interface CreateRuleParams {
  organizationId: string;
  name: string;
  description?: string;
  eventTrigger: string;
  conditions?: RuleCondition[];
  actions?: AutomationAction[];
}

export interface UpdateRuleParams {
  name?: string;
  description?: string;
  eventTrigger?: string;
  conditions?: RuleCondition[];
  actions?: AutomationAction[];
  enabled?: boolean;
}

/**
 * Creates a new declarative automation rule.
 */
export async function createAutomationRule(params: CreateRuleParams): Promise<AutomationRule> {
  if (!params.name || !params.name.trim()) {
    throw new ValidationError("Automation rule name is required.");
  }
  if (!params.eventTrigger || !params.eventTrigger.trim()) {
    throw new ValidationError("Event trigger is required.");
  }

  const id = `rule_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const now = new Date().toISOString();

  const rule: AutomationRule = {
    id,
    organizationId: params.organizationId,
    name: params.name.trim(),
    description: params.description?.trim(),
    enabled: true,
    eventTrigger: params.eventTrigger.trim(),
    conditions: params.conditions || [],
    actions: params.actions || [],
    executionCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  rulesStore.set(id, rule);
  return { ...rule };
}

/**
 * Lists all automation rules for an organization.
 */
export async function listOrganizationRules(organizationId: string): Promise<AutomationRule[]> {
  const list: AutomationRule[] = [];
  for (const rule of rulesStore.values()) {
    if (rule.organizationId === organizationId) {
      list.push({ ...rule });
    }
  }
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Retrieves a single automation rule.
 */
export async function getAutomationRule(
  organizationId: string,
  ruleId: string
): Promise<AutomationRule> {
  const rule = rulesStore.get(ruleId);
  if (!rule || rule.organizationId !== organizationId) {
    throw new NotFoundError(`Automation rule '${ruleId}' not found.`);
  }
  return { ...rule };
}

/**
 * Updates an automation rule.
 */
export async function updateAutomationRule(
  organizationId: string,
  ruleId: string,
  updates: UpdateRuleParams
): Promise<AutomationRule> {
  const rule = await getAutomationRule(organizationId, ruleId);

  if (updates.name) rule.name = updates.name.trim();
  if (updates.description !== undefined) rule.description = updates.description.trim();
  if (updates.eventTrigger) rule.eventTrigger = updates.eventTrigger.trim();
  if (updates.conditions) rule.conditions = [...updates.conditions];
  if (updates.actions) rule.actions = [...updates.actions];
  if (updates.enabled !== undefined) rule.enabled = updates.enabled;

  rule.updatedAt = new Date().toISOString();
  rulesStore.set(ruleId, rule);
  return { ...rule };
}

/**
 * Deletes an automation rule.
 */
export async function deleteAutomationRule(
  organizationId: string,
  ruleId: string
): Promise<void> {
  await getAutomationRule(organizationId, ruleId);
  rulesStore.delete(ruleId);
}

/**
 * Enables or disables an automation rule.
 */
export async function toggleAutomationRule(
  organizationId: string,
  ruleId: string,
  enabled: boolean
): Promise<AutomationRule> {
  return updateAutomationRule(organizationId, ruleId, { enabled });
}

/**
 * Performs a dry-run test of a rule against a mock event payload without executing side-effects.
 */
export async function testAutomationRuleDryRun(
  organizationId: string,
  ruleId: string,
  mockEventData: Record<string, unknown>
): Promise<{ matched: boolean; wouldExecuteActionsCount: number; matchedConditionsCount: number }> {
  const rule = await getAutomationRule(organizationId, ruleId);
  const matched = evaluateAllConditions(rule.conditions, mockEventData);

  return {
    matched,
    wouldExecuteActionsCount: matched ? rule.actions.length : 0,
    matchedConditionsCount: rule.conditions.length,
  };
}

/**
 * Test helper to clear in-memory rules store.
 */
export function clearAutomationRulesForTesting(): void {
  rulesStore.clear();
}
