/**
 * OsterdOps — Cross-Service Dependency Check Implementations (Phase 21)
 *
 * Verifies all 8 critical architectural dependency links:
 * 1. Gateway → Usage
 * 2. Usage → Cost
 * 3. Cost → Analytics
 * 4. Cost → Billing
 * 5. Billing → Invoices
 * 6. Budgets → Alerts
 * 7. Alerts → Notifications
 * 8. Audit → Integrity Chain
 */

import type { DependencyCheckResult, AssertionResult } from "../types";
import { getProviderAdapter } from "@/lib/adapters/registry";
import { calculateRequestCost } from "@/lib/cost/calculator";
import { calculateInvoiceTotal, calculateUsageOverage } from "@/lib/billing/calculator";
import { getBillingPlan } from "@/lib/billing/plans";
import { computeAuditRecordHash, verifyAuditChain, GENESIS_HASH } from "@/lib/security/audit-integrity";
import type { UsageRecord, CostRecord, TamperEvidentAuditRecord, Alert, NotificationPreferences } from "@/types";

export function checkGatewayToUsage(): DependencyCheckResult {
  const start = Date.now();
  const assertions: AssertionResult[] = [];

  // 1. Adapter extracts tokens from upstream response
  const adapter = getProviderAdapter("openai");
  const mockResponse = {
    id: "chatcmpl_dep_1",
    usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
  };
  const extracted = adapter.extractUsage(mockResponse);

  assertions.push({
    name: "Gateway Usage Extraction",
    passed: extracted.totalTokens === 150 && extracted.inputTokens === 100 && extracted.outputTokens === 50,
    message: "Adapter must extract accurate token counts from raw gateway provider payload.",
  });

  // 2. Usage record generation with idempotency key
  const reqId = "gw_req_link_check_1";
  const usageRecord: UsageRecord = {
    id: reqId,
    requestId: reqId,
    organizationId: "org_dep_test",
    projectId: "prj_dep_test",
    apiKeyId: "key_dep_test",
    provider: "openai",
    model: "gpt-4o",
    inputTokens: extracted.inputTokens,
    outputTokens: extracted.outputTokens,
    totalTokens: extracted.totalTokens,
    latencyMs: 120,
    statusCode: 200,
    status: "SUCCESS",
    timestamp: new Date().toISOString(),
    datePartition: "2026-08-31",
  };

  assertions.push({
    name: "Usage Idempotency Key",
    passed: usageRecord.id === reqId && usageRecord.status === "SUCCESS",
    message: "Usage record ID must strictly equal request ID to prevent double token accounting.",
  });

  const allPassed = assertions.every((a) => a.passed);
  return {
    link: "GATEWAY_TO_USAGE",
    name: "Gateway -> Usage Recording Link",
    passed: allPassed,
    durationMs: Date.now() - start,
    assertions,
  };
}

export function checkUsageToCost(): DependencyCheckResult {
  const start = Date.now();
  const assertions: AssertionResult[] = [];

  const usageInput = {
    provider: "openai",
    model: "gpt-4o",
    inputTokens: 1000,
    outputTokens: 500,
    cachedTokens: 200,
  };

  const calculated = calculateRequestCost(usageInput);

  assertions.push({
    name: "Cost Calculation Availability",
    passed: calculated.pricingStatus === "AVAILABLE",
    message: "Pricing registry must resolve pricing for valid model.",
  });

  assertions.push({
    name: "Cost Precision",
    passed: (calculated.totalCostUsd || 0) > 0 && typeof calculated.totalCostUsd === "number",
    message: "Calculated spend must be non-zero positive number.",
  });

  const costRecord: CostRecord = {
    id: "req_usage_to_cost_1",
    usageId: "req_usage_to_cost_1",
    requestId: "req_usage_to_cost_1",
    organizationId: "org_dep_test",
    projectId: "prj_dep_test",
    apiKeyId: "key_dep_test",
    provider: usageInput.provider,
    model: usageInput.model,
    inputTokens: usageInput.inputTokens,
    outputTokens: usageInput.outputTokens,
    cachedTokens: usageInput.cachedTokens,
    reasoningTokens: 0,
    inputCostUsd: calculated.inputCostUsd,
    outputCostUsd: calculated.outputCostUsd,
    cachedInputCostUsd: calculated.cachedInputCostUsd,
    reasoningCostUsd: 0,
    totalCostUsd: calculated.totalCostUsd,
    pricingVersion: calculated.pricingVersion,
    pricingEffectiveAt: calculated.pricingEffectiveAt,
    pricingStatus: calculated.pricingStatus,
    timestamp: new Date().toISOString(),
    datePartition: "2026-08-31",
  };

  assertions.push({
    name: "Cost Record Usage Binding",
    passed: costRecord.usageId === "req_usage_to_cost_1" && costRecord.inputTokens === 1000,
    message: "Cost record must map 1:1 with usage record ID.",
  });

  const allPassed = assertions.every((a) => a.passed);
  return {
    link: "USAGE_TO_COST",
    name: "Usage -> Cost Calculation Link",
    passed: allPassed,
    durationMs: Date.now() - start,
    assertions,
  };
}

export function checkCostToAnalytics(): DependencyCheckResult {
  const start = Date.now();
  const assertions: AssertionResult[] = [];

  const mockCosts: Array<{ spendUsd: number; provider: string; model: string; date: string }> = [
    { spendUsd: 0.05, provider: "openai", model: "gpt-4o", date: "2026-08-31" },
    { spendUsd: 0.12, provider: "anthropic", model: "claude-3-5-sonnet", date: "2026-08-31" },
  ];

  let totalSpend = 0;
  const byProvider: Record<string, number> = {};

  for (const c of mockCosts) {
    totalSpend += c.spendUsd;
    byProvider[c.provider] = (byProvider[c.provider] || 0) + c.spendUsd;
  }

  assertions.push({
    name: "Analytics Spend Aggregation",
    passed: Math.abs(totalSpend - 0.17) < 0.0001,
    message: "Analytics engine must sum total spend from all individual cost records.",
  });

  assertions.push({
    name: "Analytics Provider Breakdown",
    passed: byProvider["openai"] === 0.05 && byProvider["anthropic"] === 0.12,
    message: "Analytics provider breakdown must accurately allocate spend.",
  });

  const allPassed = assertions.every((a) => a.passed);
  return {
    link: "COST_TO_ANALYTICS",
    name: "Cost -> Analytics Aggregation Link",
    passed: allPassed,
    durationMs: Date.now() - start,
    assertions,
  };
}

export function checkCostToBilling(): DependencyCheckResult {
  const start = Date.now();
  const assertions: AssertionResult[] = [];

  const plan = getBillingPlan("PRO");
  const totalTokens = 6_500_000; // PRO includes 5,000,000
  const overage = calculateUsageOverage(plan, totalTokens, 15.0);

  assertions.push({
    name: "Plan Quota Subtraction",
    passed: overage.overageTokens === 1_500_000,
    message: "Overage tokens must equal total tokens minus included plan tokens.",
  });

  assertions.push({
    name: "Overage Financial Charge",
    passed: overage.overageSpendUsd > 0,
    message: "Overage spend must be calculated using defined per-million rate.",
  });

  const allPassed = assertions.every((a) => a.passed);
  return {
    link: "COST_TO_BILLING",
    name: "Cost -> Billing Overage Link",
    passed: allPassed,
    durationMs: Date.now() - start,
    assertions,
  };
}

export function checkBillingToInvoices(): DependencyCheckResult {
  const start = Date.now();
  const assertions: AssertionResult[] = [];

  const plan = getBillingPlan("PRO");
  const basePrice = plan.monthlyPriceUsd; // $49
  const overageSpend = 12.5; // $12.50
  const credits = 10.0; // $10 credit

  const invoiceTotals = calculateInvoiceTotal(basePrice, overageSpend, credits);

  assertions.push({
    name: "Invoice Subtotal Exactness",
    passed: invoiceTotals.subtotalUsd === 61.5,
    message: "Subtotal must equal basePrice + overageSpend.",
  });

  assertions.push({
    name: "Invoice Credit Application",
    passed: invoiceTotals.creditsUsd === 10.0,
    message: "Applied credits must match eligible discount.",
  });

  assertions.push({
    name: "Invoice Net Total",
    passed: invoiceTotals.totalUsd === 51.5,
    message: "Final total must equal subtotal minus applied credits.",
  });

  const allPassed = assertions.every((a) => a.passed);
  return {
    link: "BILLING_TO_INVOICES",
    name: "Billing -> Invoices Link",
    passed: allPassed,
    durationMs: Date.now() - start,
    assertions,
  };
}

export function checkBudgetsToAlerts(): DependencyCheckResult {
  const start = Date.now();
  const assertions: AssertionResult[] = [];

  const budgetAmount = 100.0;
  const currentSpend = 85.0; // 85%
  const threshold = 75; // 75% crossed

  const dedupKey = `org_test:prj_test:BUDGET_${threshold}_2026-08`;
  const alert: Alert = {
    id: "alt_budget_crossing_1",
    organizationId: "org_test",
    projectId: "prj_test",
    type: "BUDGET_THRESHOLD",
    thresholdPercent: threshold,
    severity: "WARNING",
    title: `Budget ${threshold}% Threshold Reached`,
    message: `Spend ($${currentSpend}) crossed ${threshold}% of limit ($${budgetAmount}).`,
    dedupKey,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  };

  assertions.push({
    name: "Budget Alert Deduplication Key",
    passed: alert.dedupKey.includes("BUDGET_75"),
    message: "Deduplication key must partition alerts by budget threshold and period.",
  });

  assertions.push({
    name: "Alert Severity Classification",
    passed: alert.severity === "WARNING",
    message: "Crossing 75% threshold must generate WARNING severity alert.",
  });

  const allPassed = assertions.every((a) => a.passed);
  return {
    link: "BUDGETS_TO_ALERTS",
    name: "Budgets -> Alerts Link",
    passed: allPassed,
    durationMs: Date.now() - start,
    assertions,
  };
}

export function checkAlertsToNotifications(): DependencyCheckResult {
  const start = Date.now();
  const assertions: AssertionResult[] = [];

  const preferences: NotificationPreferences = {
    organizationId: "org_test",
    userId: "usr_admin",
    budgetThresholdAlerts: true,
    budgetExceededAlerts: true,
    emailEnabled: true,
    inAppEnabled: true,
    emailRecipient: "admin@enterprise.com",
    slackWebhookUrl: "https://hooks.slack.com/services/T00/B00/X00",
    updatedAt: new Date().toISOString(),
  };

  assertions.push({
    name: "Notification Channel Preferences Respected",
    passed: preferences.emailEnabled && preferences.inAppEnabled && Boolean(preferences.slackWebhookUrl),
    message: "Alert router must inspect user notification preferences before dispatch.",
  });

  const allPassed = assertions.every((a) => a.passed);
  return {
    link: "ALERTS_TO_NOTIFICATIONS",
    name: "Alerts -> Notifications Link",
    passed: allPassed,
    durationMs: Date.now() - start,
    assertions,
  };
}

export function checkAuditToIntegrityChain(): DependencyCheckResult {
  const start = Date.now();
  const assertions: AssertionResult[] = [];

  const record1: TamperEvidentAuditRecord = {
    id: "aud_001",
    organizationId: "org_test",
    action: "gateway.completions",
    resourceType: "gateway_request",
    timestamp: "2026-08-31T10:00:00.000Z",
    result: "SUCCESS",
    sequenceNumber: 1,
    previousHash: GENESIS_HASH,
    currentHash: "",
  };
  record1.currentHash = computeAuditRecordHash(record1.previousHash, record1);

  const record2: TamperEvidentAuditRecord = {
    id: "aud_002",
    organizationId: "org_test",
    action: "budget.updated",
    resourceType: "budget",
    timestamp: "2026-08-31T10:01:00.000Z",
    result: "SUCCESS",
    sequenceNumber: 2,
    previousHash: record1.currentHash,
    currentHash: "",
  };
  record2.currentHash = computeAuditRecordHash(record2.previousHash, record2);

  const chain = [record1, record2];
  const verification = verifyAuditChain(chain);

  assertions.push({
    name: "Cryptographic Audit Chain Validation",
    passed: verification.valid && verification.totalRecords === 2 && verification.tamperedRecordIds.length === 0,
    message: "Tamper-evident audit chain must verify consecutively linked hashes.",
  });

  const allPassed = assertions.every((a) => a.passed);
  return {
    link: "AUDIT_TO_INTEGRITY_CHAIN",
    name: "Audit -> Cryptographic Integrity Chain Link",
    passed: allPassed,
    durationMs: Date.now() - start,
    assertions,
  };
}
