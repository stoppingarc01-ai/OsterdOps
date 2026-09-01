/**
 * Unit Tests — Automation Actions Execution
 */

import { executeAutomationAction } from "@/lib/automation/actions";
import { evaluateAndExecuteRule } from "@/lib/automation/engine";
import type { AutomationRule } from "@/lib/automation/types";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export async function runAutomationActionsTests() {
  const orgId = "org_action_test";

  // 1. Direct notification action
  const notificationOutcome = await executeAutomationAction(
    orgId,
    { type: "SEND_NOTIFICATION", targetId: "slack_general" },
    { event: "test" }
  );
  assert(notificationOutcome.success === true, "SEND_NOTIFICATION succeeds.");

  // 2. Direct email action
  const emailOutcome = await executeAutomationAction(
    orgId,
    { type: "SEND_EMAIL", targetId: "alerts@acme.com" },
    { event: "test" }
  );
  assert(emailOutcome.success === true, "SEND_EMAIL succeeds.");

  // 3. Engine execution with rule
  const rule: AutomationRule = {
    id: "rule_test_exec",
    organizationId: orgId,
    name: "Test Exec Rule",
    enabled: true,
    eventTrigger: "budget.threshold_reached",
    conditions: [{ field: "data.percent", operator: "greater_than_or_equal", value: 80 }],
    actions: [{ type: "SEND_NOTIFICATION", targetId: "slack_alerts" }],
    executionCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const execRes = await evaluateAndExecuteRule(rule, {
    type: "budget.threshold_reached",
    organizationId: orgId,
    data: { percent: 85 },
  });

  assert(execRes.matched === true, "Rule matched when conditions pass.");
  assert(execRes.actionsDispatched === 1, "Action was dispatched.");
  assert(rule.executionCount === 1, "Execution count incremented.");
}
