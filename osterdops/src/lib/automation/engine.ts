/**
 * OsterdOps — Automation Rule Execution Engine (Phase 20)
 * Evaluates triggers, executes matched actions, and collects telemetry.
 */

import type { AutomationRule, RuleExecutionResult } from "./types";
import { evaluateAllConditions } from "./conditions";
import { executeAutomationAction, ActionExecutionOutcome } from "./actions";

/**
 * Evaluates an event against a specific automation rule.
 */
export async function evaluateAndExecuteRule(
  rule: AutomationRule,
  event: { type: string; organizationId: string; data?: Record<string, unknown> }
): Promise<RuleExecutionResult> {
  if (!rule.enabled) {
    return { ruleId: rule.id, matched: false, actionsDispatched: 0 };
  }

  if (rule.organizationId !== event.organizationId) {
    return { ruleId: rule.id, matched: false, actionsDispatched: 0 };
  }

  // Check event trigger match (exact or wildcard)
  const isTriggerMatched =
    rule.eventTrigger === "*" ||
    rule.eventTrigger === event.type ||
    (rule.eventTrigger.endsWith(".*") && event.type.startsWith(rule.eventTrigger.slice(0, -2)));

  if (!isTriggerMatched) {
    return { ruleId: rule.id, matched: false, actionsDispatched: 0 };
  }

  // Evaluate conditions against event payload
  const eventPayload = {
    type: event.type,
    organizationId: event.organizationId,
    data: event.data || {},
    ...(event.data || {}),
  };

  const conditionsMatched = evaluateAllConditions(rule.conditions, eventPayload);
  if (!conditionsMatched) {
    return { ruleId: rule.id, matched: false, actionsDispatched: 0 };
  }

  // Execute declared actions
  const actionOutcomes: ActionExecutionOutcome[] = [];
  const errors: string[] = [];

  for (const action of rule.actions) {
    const outcome = await executeAutomationAction(rule.organizationId, action, eventPayload);
    actionOutcomes.push(outcome);
    if (!outcome.success && outcome.error) {
      errors.push(outcome.error);
    }
  }

  rule.executionCount = (rule.executionCount || 0) + 1;
  rule.lastExecutedAt = new Date().toISOString();

  return {
    ruleId: rule.id,
    matched: true,
    actionsDispatched: actionOutcomes.filter((o) => o.success).length,
    errors: errors.length > 0 ? errors : undefined,
  };
}
