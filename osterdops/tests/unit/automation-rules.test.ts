/**
 * Unit Tests — Automation Rules CRUD & Lifecycle
 */

import {
  createAutomationRule,
  getAutomationRule,
  updateAutomationRule,
  deleteAutomationRule,
  toggleAutomationRule,
  clearAutomationRulesForTesting,
} from "@/lib/automation/service";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export async function runAutomationRulesTests() {
  clearAutomationRulesForTesting();
  const orgId = "org_auto_test";

  // 1. Create rule
  const rule = await createAutomationRule({
    organizationId: orgId,
    name: "Budget Alert",
    eventTrigger: "budget.exceeded",
    conditions: [{ field: "data.spend", operator: "greater_than", value: 500 }],
    actions: [{ type: "SEND_NOTIFICATION", targetId: "slack_prod" }],
  });

  assert(rule.organizationId === orgId, "Rule organization matches.");
  assert(rule.enabled === true, "New rule is enabled by default.");

  // 2. Retrieve rule
  const retrieved = await getAutomationRule(orgId, rule.id);
  assert(retrieved.name === "Budget Alert", "Retrieved rule name matches.");

  // 3. Update rule
  const updated = await updateAutomationRule(orgId, rule.id, { name: "High Budget Exceeded" });
  assert(updated.name === "High Budget Exceeded", "Updated name matches.");

  // 4. Toggle rule
  const disabled = await toggleAutomationRule(orgId, rule.id, false);
  assert(disabled.enabled === false, "Rule disabled successfully.");

  // 5. Delete rule
  await deleteAutomationRule(orgId, rule.id);
  let deleted = false;
  try {
    await getAutomationRule(orgId, rule.id);
  } catch {
    deleted = true;
  }
  assert(deleted, "Deleted rule is no longer accessible.");
}
