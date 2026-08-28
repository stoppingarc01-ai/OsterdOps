/**
 * OsterdOps — Cost Optimization Recommendations Engine
 */

import "server-only";
import { getAdminFirestore } from "@/lib/firebase/admin";
import type { OptimizationRecommendation, UsageRecord } from "@/types";

/**
 * Evaluates organization usage patterns and generates actionable cost savings recommendations.
 */
export async function getOptimizationRecommendations(
  orgId: string
): Promise<OptimizationRecommendation[]> {
  const db = getAdminFirestore();

  // Fetch recent usage records
  const usageSnap = await db
    .collection("organizations")
    .doc(orgId)
    .collection("usage")
    .orderBy("timestamp", "desc")
    .limit(200)
    .get();

  const recommendations: OptimizationRecommendation[] = [];
  const now = new Date().toISOString();

  let gpt4oSpend = 0;
  let gpt4oRequests = 0;
  let claudeOpusSpend = 0;
  let totalInputTokens = 0;
  const totalCachedTokens = 0;
  let totalRequests = 0;

  usageSnap.forEach((doc) => {
    const r = doc.data() as UsageRecord;
    const spend = Number(r.costUsd) || 0;
    const model = (r.model || "").toLowerCase();
    const input = Number(r.inputTokens) || 0;

    totalRequests++;
    totalInputTokens += input;

    if (model.includes("gpt-4o") && !model.includes("mini")) {
      gpt4oSpend += spend;
      gpt4oRequests++;
    }
    if (model.includes("opus")) {
      claudeOpusSpend += spend;
    }
  });

  // 1. Model Downgrade Recommendation (GPT-4o -> GPT-4o-mini / Gemini Flash)
  if (gpt4oSpend > 0.05 || gpt4oRequests >= 5) {
    const estimatedSavings = Math.round(gpt4oSpend * 0.85 * 100) / 100;
    recommendations.push({
      id: `rec_downgrade_gpt4o_${orgId}`,
      organizationId: orgId,
      type: "MODEL_DOWNGRADE",
      title: "Switch High-Volume Requests from GPT-4o to GPT-4o-mini",
      description: `You have ${gpt4oRequests} requests using GPT-4o costing $${gpt4oSpend.toFixed(2)}. Routing simple queries, summaries, or structured extractions to GPT-4o-mini or Gemini 2.0 Flash could reduce your cost by ~85%.`,
      currentModel: "gpt-4o",
      recommendedModel: "gpt-4o-mini",
      estimatedMonthlySavingsUsd: Math.max(12.5, estimatedSavings * 30),
      confidenceScore: 0.92,
      status: "active",
      createdAt: now,
    });
  }

  // 2. Claude Opus Optimization
  if (claudeOpusSpend > 0.1) {
    recommendations.push({
      id: `rec_downgrade_opus_${orgId}`,
      organizationId: orgId,
      type: "MODEL_DOWNGRADE",
      title: "Evaluate Claude 3.5 Sonnet over Claude 3 Opus",
      description: "Claude 3.5 Sonnet matches or exceeds Claude 3 Opus in coding and reasoning benchmarks at 80% lower cost.",
      currentModel: "claude-3-opus",
      recommendedModel: "claude-3-5-sonnet",
      estimatedMonthlySavingsUsd: Math.max(45.0, claudeOpusSpend * 25),
      confidenceScore: 0.95,
      status: "active",
      createdAt: now,
    });
  }

  // 3. Prompt Caching Opportunity
  const avgInputTokens = totalRequests > 0 ? totalInputTokens / totalRequests : 0;
  if (avgInputTokens > 1500 && totalCachedTokens === 0) {
    recommendations.push({
      id: `rec_prompt_caching_${orgId}`,
      organizationId: orgId,
      type: "PROMPT_CACHING",
      title: "Enable Prompt Caching for Repetitive System Prompts",
      description: `Your average request contains ${Math.round(avgInputTokens)} input tokens. Enabling prompt caching on OpenAI or Anthropic models can reduce repetitive prompt input costs by up to 90%.`,
      estimatedMonthlySavingsUsd: 85.0,
      confidenceScore: 0.88,
      status: "active",
      createdAt: now,
    });
  }

  // 4. Default Governance Recommendation if low data
  if (recommendations.length === 0) {
    recommendations.push({
      id: `rec_governance_default_${orgId}`,
      organizationId: orgId,
      type: "MODEL_DOWNGRADE",
      title: "Configure Multi-Model Routing Strategy",
      description: "Set up tier-based model routing to send classification and extraction tasks to small models, reserving frontier reasoning models for complex requests.",
      estimatedMonthlySavingsUsd: 25.0,
      confidenceScore: 0.8,
      status: "active",
      createdAt: now,
    });
  }

  return recommendations;
}
