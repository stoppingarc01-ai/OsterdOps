/**
 * OsterdOps — Real-Time Cost Calculation Engine
 * Calculates deterministic USD expenses and prompt cache savings with integer nanodollar precision.
 * Strict zero-invention policy: unknown models return pricingStatus: "UNAVAILABLE" and null costs.
 */

import { getModelPricing, type ModelPricing, PRICING_VERSION, PRICING_EFFECTIVE_DATE } from "./pricing-registry";
import type { PricingStatus } from "@/types";

export interface CostCalculationInput {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cachedTokens?: number;
  reasoningTokens?: number;
}

export interface CostCalculationResult {
  inputCostUsd: number | null;
  outputCostUsd: number | null;
  cachedInputCostUsd: number | null;
  reasoningCostUsd: number | null;
  cachedSavingsUsd: number;
  totalCostUsd: number | null;
  pricingVersion: string;
  pricingEffectiveAt: string;
  pricingStatus: PricingStatus;
  unavailableReason?: string;
  model: string;
  provider: string;
}

/**
 * 1 USD = 1,000,000,000 nanodollars.
 * Price per token in nanodollars = (pricePerMillionUsd * 1,000,000,000) / 1,000,000 = pricePerMillionUsd * 1,000.
 */
const NANODOLLARS_PER_USD = 1_000_000_000;

/**
 * Computes exact cost in USD from token counts and price per million using nanodollar arithmetic.
 */
function computeTokenCostUsd(tokens: number, pricePerMillionUsd: number): number {
  if (tokens <= 0 || pricePerMillionUsd <= 0) return 0;
  // Use integer arithmetic: (tokens * (pricePerMillion * 1000)) / 1e9
  const nanoRate = Math.round(pricePerMillionUsd * 1000);
  const totalNano = tokens * nanoRate;
  return totalNano / NANODOLLARS_PER_USD;
}

/**
 * Calculates the exact cost in USD for an AI gateway request.
 */
export function calculateRequestCost(
  input: CostCalculationInput,
  customPricing?: ModelPricing | null
): CostCalculationResult {
  const pricing = customPricing !== undefined ? customPricing : getModelPricing(input.model, input.provider);

  const inputTokens = Math.max(0, input.inputTokens || 0);
  const outputTokens = Math.max(0, input.outputTokens || 0);
  const cachedTokens = Math.min(inputTokens, Math.max(0, input.cachedTokens || 0));
  const regularInputTokens = Math.max(0, inputTokens - cachedTokens);
  const reasoningTokens = Math.max(0, input.reasoningTokens || 0);

  // If pricing is known:
  if (pricing) {
    // 1. Regular non-cached input cost
    const regularInputCostUsd = computeTokenCostUsd(regularInputTokens, pricing.inputPerMillionUsd);

    // 2. Cached input cost (uses cached rate if specified, otherwise normal input rate)
    const cachedRate = pricing.cachedInputPerMillionUsd !== undefined
      ? pricing.cachedInputPerMillionUsd
      : pricing.inputPerMillionUsd;
    const cachedInputCostUsd = computeTokenCostUsd(cachedTokens, cachedRate);

    // Total input cost
    const inputCostUsd = Math.round((regularInputCostUsd + cachedInputCostUsd) * 100_000_000) / 100_000_000;

    // 3. Output token cost
    const outputCostUsd = computeTokenCostUsd(outputTokens, pricing.outputPerMillionUsd);

    // 4. Reasoning token cost (if separately charged; otherwise included in output tokens)
    let reasoningCostUsd = 0;
    if (pricing.reasoningPerMillionUsd !== undefined && pricing.reasoningPerMillionUsd > 0) {
      reasoningCostUsd = computeTokenCostUsd(reasoningTokens, pricing.reasoningPerMillionUsd);
    }

    // 5. Total request cost
    const totalCostUsd = Math.round((inputCostUsd + outputCostUsd + reasoningCostUsd) * 100_000_000) / 100_000_000;

    // 6. Cache savings: (what full input would have cost without cache) - actual input cost
    const fullInputCostWithoutCache = computeTokenCostUsd(inputTokens, pricing.inputPerMillionUsd);
    const cachedSavingsUsd = Math.round(Math.max(0, fullInputCostWithoutCache - inputCostUsd) * 100_000_000) / 100_000_000;

    return {
      inputCostUsd,
      outputCostUsd,
      cachedInputCostUsd: cachedInputCostUsd > 0 ? cachedInputCostUsd : 0,
      reasoningCostUsd: reasoningCostUsd > 0 ? reasoningCostUsd : null,
      cachedSavingsUsd,
      totalCostUsd,
      pricingVersion: pricing.version || PRICING_VERSION,
      pricingEffectiveAt: pricing.effectiveAt || PRICING_EFFECTIVE_DATE,
      pricingStatus: "AVAILABLE",
      model: input.model,
      provider: pricing.provider || input.provider,
    };
  }

  // Zero-invention policy: unknown models return UNAVAILABLE and null costs
  return {
    inputCostUsd: null,
    outputCostUsd: null,
    cachedInputCostUsd: null,
    reasoningCostUsd: null,
    cachedSavingsUsd: 0,
    totalCostUsd: null,
    pricingVersion: PRICING_VERSION,
    pricingEffectiveAt: PRICING_EFFECTIVE_DATE,
    pricingStatus: "UNAVAILABLE",
    unavailableReason: `Model '${input.model}' from provider '${input.provider}' is not listed in the pricing registry.`,
    model: input.model,
    provider: input.provider,
  };
}
