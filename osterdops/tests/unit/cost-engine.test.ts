/**
 * OsterdOps — Cost Engine & Pricing Registry Unit Tests
 */

import { calculateRequestCost } from "@/lib/cost/calculator";

export function testCostEngine() {
  // 1. OpenAI GPT-4o (Input $2.50/1M, Output $10.00/1M)
  // 1,000 input tokens = $0.0025, 500 output tokens = $0.005 -> Total = $0.0075
  const gpt4oResult = calculateRequestCost({
    provider: "openai",
    model: "gpt-4o",
    inputTokens: 1000,
    outputTokens: 500,
  });

  if (gpt4oResult.inputCostUsd !== 0.0025) {
    throw new Error(`GPT-4o input cost expected 0.0025, got ${gpt4oResult.inputCostUsd}`);
  }
  if (gpt4oResult.outputCostUsd !== 0.005) {
    throw new Error(`GPT-4o output cost expected 0.005, got ${gpt4oResult.outputCostUsd}`);
  }
  if (gpt4oResult.totalCostUsd !== 0.0075) {
    throw new Error(`GPT-4o total cost expected 0.0075, got ${gpt4oResult.totalCostUsd}`);
  }
  if (gpt4oResult.costType !== "calculated") {
    throw new Error(`Expected costType 'calculated', got ${gpt4oResult.costType}`);
  }

  // 2. Anthropic Claude 3.5 Sonnet with Prompt Caching
  // Input: $3.00/1M, Cached: $0.30/1M, Output: $15.00/1M
  // 10,000 input tokens total with 8,000 cached:
  // 2,000 regular input = 2,000 * 0.000003 = $0.006
  // 8,000 cached input = 8,000 * 0.0000003 = $0.0024 -> Input total = $0.0084
  // 1,000 output tokens = 1,000 * 0.000015 = $0.015 -> Total = $0.0234
  // Savings: without cache would be 10,000 * $0.000003 = $0.030, savings = $0.030 - $0.0084 = $0.0216
  const claudeResult = calculateRequestCost({
    provider: "anthropic",
    model: "claude-3-5-sonnet",
    inputTokens: 10000,
    outputTokens: 1000,
    cachedTokens: 8000,
  });

  if (claudeResult.inputCostUsd !== 0.0084) {
    throw new Error(`Claude cached input cost expected 0.0084, got ${claudeResult.inputCostUsd}`);
  }
  if (claudeResult.outputCostUsd !== 0.015) {
    throw new Error(`Claude output cost expected 0.015, got ${claudeResult.outputCostUsd}`);
  }
  if (claudeResult.totalCostUsd !== 0.0234) {
    throw new Error(`Claude total cost expected 0.0234, got ${claudeResult.totalCostUsd}`);
  }
  if (claudeResult.cachedSavingsUsd !== 0.0216) {
    throw new Error(`Claude cached savings expected 0.0216, got ${claudeResult.cachedSavingsUsd}`);
  }

  // 3. Gemini 1.5 Flash (Input $0.075/1M, Output $0.30/1M)
  // 10,000 input = $0.00075, 2,000 output = $0.0006 -> Total = $0.00135
  const geminiResult = calculateRequestCost({
    provider: "gemini",
    model: "gemini-1.5-flash",
    inputTokens: 10000,
    outputTokens: 2000,
  });

  if (geminiResult.totalCostUsd !== 0.00135) {
    throw new Error(`Gemini 1.5 Flash total cost expected 0.00135, got ${geminiResult.totalCostUsd}`);
  }

  // 4. Unknown Custom Model (Fallback Estimation)
  const unknownResult = calculateRequestCost({
    provider: "custom",
    model: "my-custom-finetune-v1",
    inputTokens: 1000,
    outputTokens: 500,
  });

  if (unknownResult.costType !== "estimated") {
    throw new Error(`Expected fallback costType to be 'estimated', got ${unknownResult.costType}`);
  }

  // 5. Zero tokens case
  const zeroResult = calculateRequestCost({
    provider: "openai",
    model: "gpt-4o",
    inputTokens: 0,
    outputTokens: 0,
  });

  if (zeroResult.totalCostUsd !== 0) {
    throw new Error(`Zero tokens should yield $0.00, got ${zeroResult.totalCostUsd}`);
  }

  return true;
}
