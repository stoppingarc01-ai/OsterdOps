/**
 * Unit Tests — Declarative Condition Operators & Security
 */

import { evaluateCondition, evaluateAllConditions, getFieldValue } from "@/lib/automation/conditions";
import type { RuleCondition } from "@/lib/automation/types";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export function runAutomationConditionsTests() {
  const event = {
    type: "budget.threshold_reached",
    severity: "CRITICAL",
    spend: 850,
    tags: ["prod", "us-east"],
    metadata: {
      team: "platform",
      score: 95,
    },
  };

  // 1. Operator: equals
  assert(evaluateCondition({ field: "severity", operator: "equals", value: "CRITICAL" }, event), "equals matches string.");
  assert(!evaluateCondition({ field: "severity", operator: "equals", value: "INFO" }, event), "equals fails on mismatch.");

  // 2. Operator: greater_than & less_than
  assert(evaluateCondition({ field: "spend", operator: "greater_than", value: 800 }, event), "greater_than passes.");
  assert(!evaluateCondition({ field: "spend", operator: "greater_than", value: 900 }, event), "greater_than fails.");
  assert(evaluateCondition({ field: "spend", operator: "less_than", value: 1000 }, event), "less_than passes.");

  // 3. Operator: contains
  assert(evaluateCondition({ field: "severity", operator: "contains", value: "CRIT" }, event), "contains matches substring.");
  assert(evaluateCondition({ field: "tags", operator: "contains", value: "prod" }, event), "contains matches array item.");

  // 4. Operator: in
  assert(evaluateCondition({ field: "severity", operator: "in", value: ["HIGH", "CRITICAL"] }, event), "in operator passes.");

  // 5. Nested path navigation
  assert(evaluateCondition({ field: "metadata.score", operator: "greater_than_or_equal", value: 90 }, event), "nested property path passes.");

  // 6. Prototype pollution protection
  const polluted = getFieldValue(event, "__proto__.polluted");
  assert(polluted === undefined, "__proto__ path access must be sanitized to undefined.");
}
