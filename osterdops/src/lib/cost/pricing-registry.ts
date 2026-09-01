/**
 * OsterdOps — Centralized AI Model Pricing Registry
 * Versioned pricing matrix represented in USD per 1,000,000 tokens ($/1M).
 * Strict zero-invention policy: unknown models return null.
 */

import type { AIProvider } from "@/types";

export interface ModelPricing {
  provider: AIProvider;
  model: string;
  inputPerMillionUsd: number;
  outputPerMillionUsd: number;
  cachedInputPerMillionUsd?: number;
  reasoningPerMillionUsd?: number;
  currency: "USD";
  version: string;
  effectiveAt: string;
  description?: string;
}

export const PRICING_VERSION = "2026-08";
export const PRICING_EFFECTIVE_DATE = "2026-01-01";

/**
 * Official pricing matrix across supported AI providers.
 */
export const MODEL_PRICING_REGISTRY: Record<string, ModelPricing> = {
  // --- OpenAI Direct Models ---
  "gpt-4o": {
    provider: "openai",
    model: "gpt-4o",
    inputPerMillionUsd: 2.5,
    outputPerMillionUsd: 10.0,
    cachedInputPerMillionUsd: 1.25,
    currency: "USD",
    version: PRICING_VERSION,
    effectiveAt: PRICING_EFFECTIVE_DATE,
    description: "Flagship multimodal OpenAI model",
  },
  "gpt-4o-mini": {
    provider: "openai",
    model: "gpt-4o-mini",
    inputPerMillionUsd: 0.15,
    outputPerMillionUsd: 0.6,
    cachedInputPerMillionUsd: 0.075,
    currency: "USD",
    version: PRICING_VERSION,
    effectiveAt: PRICING_EFFECTIVE_DATE,
    description: "Affordable small model for fast lightweight tasks",
  },
  "o1": {
    provider: "openai",
    model: "o1",
    inputPerMillionUsd: 15.0,
    outputPerMillionUsd: 60.0,
    cachedInputPerMillionUsd: 7.5,
    currency: "USD",
    version: PRICING_VERSION,
    effectiveAt: PRICING_EFFECTIVE_DATE,
    description: "Deep reasoning model for complex multistep problem solving",
  },
  "o1-mini": {
    provider: "openai",
    model: "o1-mini",
    inputPerMillionUsd: 3.0,
    outputPerMillionUsd: 12.0,
    cachedInputPerMillionUsd: 1.5,
    currency: "USD",
    version: PRICING_VERSION,
    effectiveAt: PRICING_EFFECTIVE_DATE,
    description: "Fast reasoning model specialized for coding & math",
  },
  "o3-mini": {
    provider: "openai",
    model: "o3-mini",
    inputPerMillionUsd: 1.1,
    outputPerMillionUsd: 4.4,
    cachedInputPerMillionUsd: 0.55,
    currency: "USD",
    version: PRICING_VERSION,
    effectiveAt: PRICING_EFFECTIVE_DATE,
    description: "State-of-the-art cost-efficient reasoning model",
  },
  "gpt-4-turbo": {
    provider: "openai",
    model: "gpt-4-turbo",
    inputPerMillionUsd: 10.0,
    outputPerMillionUsd: 30.0,
    cachedInputPerMillionUsd: 5.0,
    currency: "USD",
    version: PRICING_VERSION,
    effectiveAt: PRICING_EFFECTIVE_DATE,
  },
  "gpt-3.5-turbo": {
    provider: "openai",
    model: "gpt-3.5-turbo",
    inputPerMillionUsd: 0.5,
    outputPerMillionUsd: 1.5,
    currency: "USD",
    version: PRICING_VERSION,
    effectiveAt: PRICING_EFFECTIVE_DATE,
  },

  // --- Anthropic Claude Models ---
  "claude-3-5-sonnet-20241022": {
    provider: "anthropic",
    model: "claude-3-5-sonnet-20241022",
    inputPerMillionUsd: 3.0,
    outputPerMillionUsd: 15.0,
    cachedInputPerMillionUsd: 0.3,
    currency: "USD",
    version: PRICING_VERSION,
    effectiveAt: PRICING_EFFECTIVE_DATE,
    description: "Industry-leading intelligence & coding model",
  },
  "claude-3-5-sonnet": {
    provider: "anthropic",
    model: "claude-3-5-sonnet",
    inputPerMillionUsd: 3.0,
    outputPerMillionUsd: 15.0,
    cachedInputPerMillionUsd: 0.3,
    currency: "USD",
    version: PRICING_VERSION,
    effectiveAt: PRICING_EFFECTIVE_DATE,
  },
  "claude-3-5-haiku-20241022": {
    provider: "anthropic",
    model: "claude-3-5-haiku-20241022",
    inputPerMillionUsd: 0.8,
    outputPerMillionUsd: 4.0,
    cachedInputPerMillionUsd: 0.08,
    currency: "USD",
    version: PRICING_VERSION,
    effectiveAt: PRICING_EFFECTIVE_DATE,
    description: "Ultra-fast lightweight Anthropic model",
  },
  "claude-3-5-haiku": {
    provider: "anthropic",
    model: "claude-3-5-haiku",
    inputPerMillionUsd: 0.8,
    outputPerMillionUsd: 4.0,
    cachedInputPerMillionUsd: 0.08,
    currency: "USD",
    version: PRICING_VERSION,
    effectiveAt: PRICING_EFFECTIVE_DATE,
  },
  "claude-3-opus-20240229": {
    provider: "anthropic",
    model: "claude-3-opus-20240229",
    inputPerMillionUsd: 15.0,
    outputPerMillionUsd: 75.0,
    cachedInputPerMillionUsd: 1.5,
    currency: "USD",
    version: PRICING_VERSION,
    effectiveAt: PRICING_EFFECTIVE_DATE,
  },
  "claude-3-opus": {
    provider: "anthropic",
    model: "claude-3-opus",
    inputPerMillionUsd: 15.0,
    outputPerMillionUsd: 75.0,
    cachedInputPerMillionUsd: 1.5,
    currency: "USD",
    version: PRICING_VERSION,
    effectiveAt: PRICING_EFFECTIVE_DATE,
  },

  // --- Google Gemini Models ---
  "gemini-1.5-pro": {
    provider: "gemini",
    model: "gemini-1.5-pro",
    inputPerMillionUsd: 1.25,
    outputPerMillionUsd: 5.0,
    cachedInputPerMillionUsd: 0.3125,
    currency: "USD",
    version: PRICING_VERSION,
    effectiveAt: PRICING_EFFECTIVE_DATE,
    description: "2M long context window multimodal reasoning model",
  },
  "gemini-1.5-flash": {
    provider: "gemini",
    model: "gemini-1.5-flash",
    inputPerMillionUsd: 0.075,
    outputPerMillionUsd: 0.3,
    cachedInputPerMillionUsd: 0.01875,
    currency: "USD",
    version: PRICING_VERSION,
    effectiveAt: PRICING_EFFECTIVE_DATE,
    description: "Fast, cost-effective multimodal workhorse",
  },
  "gemini-2.0-flash": {
    provider: "gemini",
    model: "gemini-2.0-flash",
    inputPerMillionUsd: 0.1,
    outputPerMillionUsd: 0.4,
    cachedInputPerMillionUsd: 0.025,
    currency: "USD",
    version: PRICING_VERSION,
    effectiveAt: PRICING_EFFECTIVE_DATE,
    description: "Next-gen multimodal flash speed",
  },

  // --- Microsoft Azure OpenAI Deployments ---
  "azure/gpt-4o": {
    provider: "azure",
    model: "azure/gpt-4o",
    inputPerMillionUsd: 2.5,
    outputPerMillionUsd: 10.0,
    cachedInputPerMillionUsd: 1.25,
    currency: "USD",
    version: PRICING_VERSION,
    effectiveAt: PRICING_EFFECTIVE_DATE,
  },
  "azure/gpt-4o-mini": {
    provider: "azure",
    model: "azure/gpt-4o-mini",
    inputPerMillionUsd: 0.15,
    outputPerMillionUsd: 0.6,
    cachedInputPerMillionUsd: 0.075,
    currency: "USD",
    version: PRICING_VERSION,
    effectiveAt: PRICING_EFFECTIVE_DATE,
  },

  // --- AWS Bedrock Foundation Models ---
  "bedrock/anthropic.claude-3-5-sonnet": {
    provider: "bedrock",
    model: "bedrock/anthropic.claude-3-5-sonnet",
    inputPerMillionUsd: 3.0,
    outputPerMillionUsd: 15.0,
    cachedInputPerMillionUsd: 0.3,
    currency: "USD",
    version: PRICING_VERSION,
    effectiveAt: PRICING_EFFECTIVE_DATE,
  },
  "bedrock/amazon.titan-text-express": {
    provider: "bedrock",
    model: "bedrock/amazon.titan-text-express",
    inputPerMillionUsd: 0.2,
    outputPerMillionUsd: 0.6,
    currency: "USD",
    version: PRICING_VERSION,
    effectiveAt: PRICING_EFFECTIVE_DATE,
  },
};

const PRICING_LOOKUP_CACHE = new Map<string, ModelPricing | null>();

/**
 * Resolves pricing for a model name.
 * Strictly returns null if model is unrecognized (zero price invention).
 */
export function getModelPricing(modelName: string, provider?: string): ModelPricing | null {
  if (!modelName || typeof modelName !== "string") return null;

  const normalized = modelName.trim().toLowerCase();
  const cacheKey = provider ? `${provider.toLowerCase()}/${normalized}` : normalized;

  if (PRICING_LOOKUP_CACHE.has(cacheKey)) {
    return PRICING_LOOKUP_CACHE.get(cacheKey)!;
  }

  // 1. Direct match
  if (MODEL_PRICING_REGISTRY[normalized]) {
    const res = MODEL_PRICING_REGISTRY[normalized];
    PRICING_LOOKUP_CACHE.set(cacheKey, res);
    return res;
  }

  // 2. Prefixed provider match (e.g. azure/gpt-4o or bedrock/...)
  if (provider) {
    const providerKey = `${provider.toLowerCase()}/${normalized}`;
    if (MODEL_PRICING_REGISTRY[providerKey]) {
      const res = MODEL_PRICING_REGISTRY[providerKey];
      PRICING_LOOKUP_CACHE.set(cacheKey, res);
      return res;
    }
  }

  // 3. Dated variant matching (e.g. gpt-4o-2024-08-06 -> gpt-4o)
  for (const [key, pricing] of Object.entries(MODEL_PRICING_REGISTRY)) {
    if (normalized.startsWith(key) && (normalized.length === key.length || normalized[key.length] === "-" || normalized[key.length] === "/")) {
      PRICING_LOOKUP_CACHE.set(cacheKey, pricing);
      return pricing;
    }
  }

  PRICING_LOOKUP_CACHE.set(cacheKey, null);
  return null;
}
