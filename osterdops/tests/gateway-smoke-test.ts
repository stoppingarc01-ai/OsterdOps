/**
 * OsterdOps Gateway Proxy End-to-End Smoke Test
 * Tests pre-flight firewall, payload validation, dynamic model routing, and FinOps pricing.
 */

import { validateGatewayRequest } from "@/lib/gateway/request-validator";
import { validateModelRequest } from "@/lib/adapters/models";
import { resolveProviderFromModel, getProviderAdapter } from "@/lib/adapters/registry";
import { calculateRequestCost } from "@/lib/cost/calculator";
import { getModelPricing } from "@/lib/cost/pricing-registry";

async function main() {
  console.log("=================================================");
  console.log("   OsterdOps Gateway Proxy Pipeline Smoke Test   ");
  console.log("=================================================\n");

  // 1. Pre-flight Payload Validation Firewall
  console.log("[1/4] Testing Pre-flight Validation & Schema Firewall...");
  const invalidReq = validateGatewayRequest({
    model: "", // Empty model
    messages: [], // Empty messages
  });
  if (invalidReq.valid) {
    throw new Error("Validation firewall failed to reject invalid empty payload!");
  }
  console.log(`  ✔ Schema Firewall successfully caught: "${invalidReq.error}"`);

  const validReq = validateGatewayRequest({
    model: "sonar-pro",
    messages: [{ role: "user", content: "What is the latest FinOps AI standard?" }],
    temperature: 0.2,
    maxTokens: 1000,
  });
  if (!validReq.valid) {
    throw new Error(`Valid payload unexpectedly failed validation: ${validReq.error}`);
  }
  console.log("  ✔ Pre-flight schema validation passed for clean proxy request.\n");

  // 2. Dynamic Provider Inference for Flagship Models
  console.log("[2/4] Verifying Dynamic Provider Routing Resolution...");
  const modelsToTest = [
    { model: "sonar-pro", expected: "perplexity" },
    { model: "llama-3.3-70b-versatile", expected: "groq" },
    { model: "mistral-large-2411", expected: "mistral" },
    { model: "command-r-plus-08-2024", expected: "cohere" },
    { model: "deepseek-chat", expected: "deepseek" },
    { model: "grok-2", expected: "xai" },
  ];

  for (const item of modelsToTest) {
    const resolved = resolveProviderFromModel(item.model);
    if (resolved !== item.expected) {
      throw new Error(`Model ${item.model} resolved to ${resolved}, expected ${item.expected}`);
    }
    console.log(`  ✔ ${item.model.padEnd(26)} ───► Provider: ${resolved}`);
  }
  console.log();

  // 3. Adapter Request Formatting
  console.log("[3/4] Testing Upstream Adapter Request Formatting...");
  for (const item of modelsToTest) {
    const adapter = getProviderAdapter(item.expected as any);
    if (!adapter) {
      throw new Error(`Adapter for ${item.expected} not registered!`);
    }
    const formatted = adapter.formatRequest(
      {
        model: item.model,
        messages: [{ role: "user", content: "Test ping" }],
        max_tokens: 50,
      },
      { apiKey: "test-credential", baseUrl: undefined }
    );
    console.log(`  ✔ ${item.expected.padEnd(12)} adapter target endpoint: ${formatted.url}`);
  }
  console.log();

  // 4. FinOps Authoritative Pricing & Fallback Registry
  console.log("[4/4] Checking Authoritative FinOps Pricing Registry & Math...");
  for (const item of modelsToTest) {
    const pricing = getModelPricing(item.model);
    if (!pricing) {
      throw new Error(`Model ${item.model} not found in FinOps PRICING_REGISTRY`);
    }
    const cost = calculateRequestCost({
      provider: pricing.provider,
      model: item.model,
      inputTokens: 1000,
      outputTokens: 500,
    });
    console.log(
      `  ✔ ${item.model.padEnd(26)}: $${pricing.inputCostPer1M.toFixed(2)} in / $${pricing.outputCostPer1M.toFixed(2)} out (1M) | 1.5k tok cost: $${cost.totalCostUsd.toFixed(6)} | Fallback: ${pricing.fallbackModel || "none"}`
    );
  }

  console.log("\n=================================================");
  console.log("  ✔ ALL GATEWAY PROXY PIPELINE SMOKE TESTS PASSED");
  console.log("=================================================");
}

main().catch((err) => {
  console.error("Smoke test failed:", err);
  process.exit(1);
});
