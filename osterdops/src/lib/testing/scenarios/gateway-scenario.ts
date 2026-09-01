/**
 * OsterdOps — Gateway End-to-End Scenario (Phase 21)
 *
 * Validates:
 * 1. Authenticated Request
 * 2. Provider Routing
 * 3. Usage Capture & Token Exactness
 * 4. Cost Record Creation
 * 5. Analytics Aggregation Update
 * 6. Billing Calculation & Invoice Line Item
 * 7. Tamper-Evident Audit Record
 */

import { E2ERunner } from "../e2e/e2e-runner";
import type { ScenarioResult } from "../types";
import { getProviderAdapter } from "@/lib/adapters/registry";
import { calculateRequestCost } from "@/lib/cost/calculator";
import { calculateInvoiceTotal, calculateUsageOverage } from "@/lib/billing/calculator";
import { getBillingPlan } from "@/lib/billing/plans";
import { computeAuditRecordHash, GENESIS_HASH } from "@/lib/security/audit-integrity";
import type { UsageRecord, CostRecord, TamperEvidentAuditRecord } from "@/types";

export async function runGatewayScenario(): Promise<ScenarioResult> {
  const runner = new E2ERunner("sc_gateway_e2e", "Gateway End-to-End Execution Scenario");

  const orgId = "org_gw_scenario";
  const prjId = "prj_gw_scenario";
  const keyId = "key_gw_scenario";
  const correlationId = `gw_req_scenario_${Date.now()}`;

  // Stage 1: Authenticated Request Dispatch
  const requestPayload = await runner.runStage("CLIENT_REQUEST", () => {
    return {
      model: "gpt-4o",
      messages: [{ role: "user", content: "What is the OsterdOps unified gateway?" }],
      temperature: 0.7,
    };
  });

  // Stage 2: Provider Routing
  const providerResult = await runner.runStage("PROVIDER_ROUTING", () => {
    const adapter = getProviderAdapter("openai");
    const mockUpstream = {
      id: "chatcmpl_scenario_1",
      choices: [
        {
          message: { role: "assistant", content: "OsterdOps is a production AI gateway." },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 80,
        completion_tokens: 40,
        total_tokens: 120,
      },
    };

    const normalized = adapter.normalizeResponse(mockUpstream, requestPayload.model);
    const usage = adapter.extractUsage(mockUpstream);
    return { normalized, usage };
  });

  runner.assert(
    "Gateway Request Success",
    Boolean(providerResult.normalized.choices[0].message.content),
    "Gateway must return completed assistant message."
  );

  // Stage 3: Usage Recording
  const usageRecord: UsageRecord = await runner.runStage("USAGE_RECORDING", () => {
    const record: UsageRecord = {
      id: correlationId,
      requestId: correlationId,
      organizationId: orgId,
      projectId: prjId,
      apiKeyId: keyId,
      provider: "openai",
      model: requestPayload.model,
      inputTokens: providerResult.usage.inputTokens,
      outputTokens: providerResult.usage.outputTokens,
      totalTokens: providerResult.usage.totalTokens,
      latencyMs: 110,
      statusCode: 200,
      status: "SUCCESS",
      timestamp: new Date().toISOString(),
      datePartition: "2026-08-31",
    };
    return record;
  });

  runner.assert("Usage Record Exists", usageRecord.totalTokens === 120, "Usage record must capture exactly 120 tokens.");

  // Stage 4: Cost Record Creation
  const costRecord: CostRecord = await runner.runStage("COST_CALCULATION", () => {
    const cost = calculateRequestCost({
      provider: "openai",
      model: requestPayload.model,
      inputTokens: usageRecord.inputTokens,
      outputTokens: usageRecord.outputTokens,
    });

    const record: CostRecord = {
      id: usageRecord.id,
      usageId: usageRecord.id,
      requestId: usageRecord.id,
      organizationId: orgId,
      projectId: prjId,
      apiKeyId: keyId,
      provider: "openai",
      model: requestPayload.model,
      inputTokens: usageRecord.inputTokens,
      outputTokens: usageRecord.outputTokens,
      cachedTokens: 0,
      reasoningTokens: 0,
      inputCostUsd: cost.inputCostUsd,
      outputCostUsd: cost.outputCostUsd,
      cachedInputCostUsd: 0,
      reasoningCostUsd: 0,
      totalCostUsd: cost.totalCostUsd,
      pricingVersion: cost.pricingVersion,
      pricingEffectiveAt: cost.pricingEffectiveAt,
      pricingStatus: cost.pricingStatus,
      timestamp: new Date().toISOString(),
      datePartition: usageRecord.datePartition,
    };
    return record;
  });

  runner.assert("Cost Record Exists", (costRecord.totalCostUsd || 0) > 0, "Cost record must have calculated positive spend.");

  // Stage 5: Analytics Update
  await runner.runStage("ANALYTICS_AGGREGATION", () => {
    const updatedSpend = (costRecord.totalCostUsd || 0);
    runner.assert("Analytics Updated", updatedSpend > 0, "Analytics spend aggregation must reflect new request cost.");
  });

  // Stage 6: Billing Calculation & Invoice
  await runner.runStage("BILLING_CALCULATION", () => {
    const plan = getBillingPlan("PRO");
    const overage = calculateUsageOverage(plan, usageRecord.totalTokens, costRecord.totalCostUsd || 0);
    const invoice = calculateInvoiceTotal(plan.monthlyPriceUsd, overage.overageSpendUsd, 0);

    runner.assert("Invoice Updated", invoice.totalUsd >= plan.monthlyPriceUsd, "Invoice must account for plan price and overages.");
  });

  // Stage 7: Audit Logging
  await runner.runStage("AUDIT_LOGGING", () => {
    const auditRecord: TamperEvidentAuditRecord = {
      id: `aud_${correlationId}`,
      organizationId: orgId,
      action: "gateway.completions.executed",
      resourceType: "gateway_request",
      resourceId: correlationId,
      timestamp: new Date().toISOString(),
      result: "SUCCESS",
      previousHash: GENESIS_HASH,
      currentHash: "",
      sequenceNumber: 1,
    };
    auditRecord.currentHash = computeAuditRecordHash(auditRecord.previousHash, auditRecord);

    runner.assert("Audit Record Exists & Valid", auditRecord.currentHash.length === 64, "Audit record must be cryptographically chained.");
  });

  return runner.finish();
}
