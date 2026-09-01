/**
 * OsterdOps — Declarative Condition Evaluator (Phase 20)
 * Safely evaluates event fields against approved operators without arbitrary expression execution or prototype pollution.
 */

import type { RuleCondition } from "./types";

/**
 * Safely extracts a nested property path from an object without prototype pollution risk.
 */
export function getFieldValue(obj: Record<string, unknown>, path: string): unknown {
  if (!obj || typeof obj !== "object") return undefined;

  const parts = path.split(".");
  let current: unknown = obj;

  for (const part of parts) {
    if (part === "__proto__" || part === "constructor" || part === "prototype") {
      return undefined;
    }
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/**
 * Evaluates a single condition against an event object.
 */
export function evaluateCondition(
  condition: RuleCondition,
  event: Record<string, unknown>
): boolean {
  const actualValue = getFieldValue(event, condition.field);
  const targetValue = condition.value;

  switch (condition.operator) {
    case "equals":
      return actualValue === targetValue;

    case "not_equals":
      return actualValue !== targetValue;

    case "greater_than":
      if (typeof actualValue === "number" && typeof targetValue === "number") {
        return actualValue > targetValue;
      }
      return false;

    case "less_than":
      if (typeof actualValue === "number" && typeof targetValue === "number") {
        return actualValue < targetValue;
      }
      return false;

    case "greater_than_or_equal":
      if (typeof actualValue === "number" && typeof targetValue === "number") {
        return actualValue >= targetValue;
      }
      return false;

    case "less_than_or_equal":
      if (typeof actualValue === "number" && typeof targetValue === "number") {
        return actualValue <= targetValue;
      }
      return false;

    case "contains":
      if (typeof actualValue === "string" && typeof targetValue === "string") {
        return actualValue.toLowerCase().includes(targetValue.toLowerCase());
      }
      if (Array.isArray(actualValue)) {
        return actualValue.includes(targetValue);
      }
      return false;

    case "in":
      if (Array.isArray(targetValue)) {
        return targetValue.includes(actualValue as string | number);
      }
      return false;

    case "exists":
      const shouldExist = Boolean(targetValue);
      const exists = actualValue !== undefined && actualValue !== null;
      return shouldExist ? exists : !exists;

    default:
      return false;
  }
}

/**
 * Evaluates an array of conditions with AND semantics.
 */
export function evaluateAllConditions(
  conditions: RuleCondition[],
  event: Record<string, unknown>
): boolean {
  if (!conditions || conditions.length === 0) return true;
  return conditions.every((c) => evaluateCondition(c, event));
}
