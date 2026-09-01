/**
 * OsterdOps — Automation & Rules Engine Types (Phase 20)
 * Declarative rule triggers, condition operators, and action definitions.
 */

export type ConditionOperator =
  | "equals"
  | "not_equals"
  | "greater_than"
  | "less_than"
  | "greater_than_or_equal"
  | "less_than_or_equal"
  | "contains"
  | "in"
  | "exists";

export interface RuleCondition {
  field: string;
  operator: ConditionOperator;
  value: string | number | boolean | Array<string | number>;
}

export type ActionType =
  | "SEND_WEBHOOK"
  | "SEND_NOTIFICATION"
  | "SEND_EMAIL"
  | "TRIGGER_INTEGRATION"
  | "CREATE_ALERT"
  | "LOG_EVENT";

export interface AutomationAction {
  type: ActionType;
  targetId?: string; // e.g. integrationId, channel, or alert severity
  parameters?: Record<string, unknown>;
}

export interface AutomationRule {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  enabled: boolean;
  eventTrigger: string; // e.g. "budget.exceeded", "alert.created", "gateway.request.failed"
  conditions: RuleCondition[];
  actions: AutomationAction[];
  executionCount: number;
  lastExecutedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RuleExecutionResult {
  ruleId: string;
  matched: boolean;
  actionsDispatched: number;
  errors?: string[];
}
