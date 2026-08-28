/**
 * OsterdOps — Real-Time Cost Calculation Engine
 * Computes exact monetary expense and prompt cache savings with micro-cent precision.
 */

import { getModelPricing } from "./pricing-registry";
import type { CostCalculationType } from "@/types";

export interface CostCalculationInput {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cachedTokens?: number;
}

export interface CostCalculationResult {
  inputCostUsd: number;
  outputCostUsd: number;
  cachedSavingsUsd: number;
  totalCostUsd: number;
  costType: CostCalculationType;
  model: string;
  provider: string;
}

/**
 * Rounds a number to 8 decimal places for micro-cent floating point precision.
 */
function roundPrecision(num: number): number {
  return Math.round(num * 100_000_000) / 100_000_000;
}

/**
 * Calculates the exact cost in USD for an AI gateway request.
 */
export function calculateRequestCost(input: CostCalculationInput): CostCalculationResult {
  const pricing = getModelPricing(input.model);

  const inputTokens = Math.max(0, input.inputTokens || 0);
  const outputTokens = Math.max(0, input.outputTokens || 0);
  const cachedTokens = Math.min(inputTokens, Math.max(0, input.cachedTokens || 0));
  const regularInputTokens = inputTokens - cachedTokens;

  if (pricing) {
    const inputRate = pricing.inputPerMillionUsd / 1_000_000;
    const cachedRate = (pricing.cachedInputPerMillionUsd ?? pricing.inputPerMillionUsd) / 1_000_000;
    const outputRate = pricing.outputPerMillionUsd / 1_000_000;

    const regularInputCost = regularInputTokens * inputRate;
    const cachedInputCost = cachedTokens * cachedRate;
    const inputCostUsd = roundPrecision(regularInputCost + cachedInputCost);
    const outputCostUsd = roundPrecision(outputTokens * outputRate);
    const totalCostUsd = roundPrecision(inputCostUsd + outputCostUsd);

    // Calculate how much was saved by cache hits
    const fullInputCostWithoutCache = inputTokens * inputRate;
    const cachedSavingsUsd = roundPrecision(Math.max(0, fullInputCostWithoutCache - inputCostUsd));

    return {
      inputCostUsd,
      outputCostUsd,
      cachedSavingsUsd,
      totalCostUsd,
      costType: "calculated",
      model: input.model,
      provider: pricing.provider,
    };
  }

  // Fallback heuristic estimation for unrecognized / custom models ($2.00 in / $8.00 out per 1M)
  const defaultInputRate = 2.0 / 1_000_000;
  const defaultOutputRate = 8.0 / 1_000_000;

  const inputCostUsd = roundPrecision(inputTokens * defaultInputRate);
  const outputCostUsd = roundPrecision(outputTokens * defaultOutputRate);
  const totalCostUsd = roundPrecision(inputCostUsd + outputCostUsd);

  return {
    inputCostUsd,
    outputCostUsd,
    cachedSavingsUsd: 0,
    totalCostUsd,
    costType: "estimated",
    model: input.model,
    provider: input.provider,
  };
}
