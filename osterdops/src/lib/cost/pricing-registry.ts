/**
 * OsterdOps — Centralized AI Model Pricing Registry
 * Rates are represented in USD per 1,000,000 tokens ($/1M).
 */

export interface ModelPricing {
  provider: "openai" | "anthropic" | "gemini" | "azure" | "bedrock";
  model: string;
  inputPerMillionUsd: number;
  outputPerMillionUsd: number;
  cachedInputPerMillionUsd?: number;
  description?: string;
}

/**
 * Standard pricing matrix across major AI providers.
 * Updated to latest official pricing (2025/2026).
 */
export const MODEL_PRICING_REGISTRY: Record<string, ModelPricing> = {
  // --- OpenAI Models ---
  "gpt-4o": {
    provider: "openai",
    model: "gpt-4o",
    inputPerMillionUsd: 2.5,
    outputPerMillionUsd: 10.0,
    cachedInputPerMillionUsd: 1.25,
    description: "Flagship multimodal OpenAI model",
  },
  "gpt-4o-mini": {
    provider: "openai",
    model: "gpt-4o-mini",
    inputPerMillionUsd: 0.15,
    outputPerMillionUsd: 0.6,
    cachedInputPerMillionUsd: 0.075,
    description: "Affordable small model for fast tasks",
  },
  "o1": {
    provider: "openai",
    model: "o1",
    inputPerMillionUsd: 15.0,
    outputPerMillionUsd: 60.0,
    cachedInputPerMillionUsd: 7.5,
    description: "Deep reasoning model",
  },
  "o1-mini": {
    provider: "openai",
    model: "o1-mini",
    inputPerMillionUsd: 3.0,
    outputPerMillionUsd: 12.0,
    cachedInputPerMillionUsd: 1.5,
    description: "Fast reasoning model for coding & math",
  },
  "o3-mini": {
    provider: "openai",
    model: "o3-mini",
    inputPerMillionUsd: 1.1,
    outputPerMillionUsd: 4.4,
    cachedInputPerMillionUsd: 0.55,
    description: "State-of-the-art cost-efficient reasoning",
  },
  "gpt-4-turbo": {
    provider: "openai",
    model: "gpt-4-turbo",
    inputPerMillionUsd: 10.0,
    outputPerMillionUsd: 30.0,
    cachedInputPerMillionUsd: 5.0,
  },
  "gpt-3.5-turbo": {
    provider: "openai",
    model: "gpt-3.5-turbo",
    inputPerMillionUsd: 0.5,
    outputPerMillionUsd: 1.5,
  },

  // --- Anthropic Models ---
  "claude-3-5-sonnet-20241022": {
    provider: "anthropic",
    model: "claude-3-5-sonnet-20241022",
    inputPerMillionUsd: 3.0,
    outputPerMillionUsd: 15.0,
    cachedInputPerMillionUsd: 0.3,
    description: "Industry-leading intelligence & coding",
  },
  "claude-3-5-sonnet": {
    provider: "anthropic",
    model: "claude-3-5-sonnet",
    inputPerMillionUsd: 3.0,
    outputPerMillionUsd: 15.0,
    cachedInputPerMillionUsd: 0.3,
  },
  "claude-3-5-haiku-20241022": {
    provider: "anthropic",
    model: "claude-3-5-haiku-20241022",
    inputPerMillionUsd: 0.8,
    outputPerMillionUsd: 4.0,
    cachedInputPerMillionUsd: 0.08,
    description: "Ultra-fast lightweight Anthropic model",
  },
  "claude-3-5-haiku": {
    provider: "anthropic",
    model: "claude-3-5-haiku",
    inputPerMillionUsd: 0.8,
    outputPerMillionUsd: 4.0,
    cachedInputPerMillionUsd: 0.08,
  },
  "claude-3-opus-20240229": {
    provider: "anthropic",
    model: "claude-3-opus-20240229",
    inputPerMillionUsd: 15.0,
    outputPerMillionUsd: 75.0,
    cachedInputPerMillionUsd: 1.5,
    description: "Deep analytical intelligence",
  },
  "claude-3-opus": {
    provider: "anthropic",
    model: "claude-3-opus",
    inputPerMillionUsd: 15.0,
    outputPerMillionUsd: 75.0,
    cachedInputPerMillionUsd: 1.5,
  },

  // --- Google Gemini Models ---
  "gemini-1.5-pro": {
    provider: "gemini",
    model: "gemini-1.5-pro",
    inputPerMillionUsd: 1.25,
    outputPerMillionUsd: 5.0,
    cachedInputPerMillionUsd: 0.3125,
    description: "2M long context window model",
  },
  "gemini-1.5-flash": {
    provider: "gemini",
    model: "gemini-1.5-flash",
    inputPerMillionUsd: 0.075,
    outputPerMillionUsd: 0.3,
    cachedInputPerMillionUsd: 0.01875,
    description: "Fast, cost-effective multimodal workhorse",
  },
  "gemini-2.0-flash": {
    provider: "gemini",
    model: "gemini-2.0-flash",
    inputPerMillionUsd: 0.1,
    outputPerMillionUsd: 0.4,
    cachedInputPerMillionUsd: 0.025,
    description: "Next-gen multimodal flash speed",
  },
};

/**
 * Resolves pricing for a model name with alias fallback.
 */
export function getModelPricing(modelName: string): ModelPricing | null {
  const normalized = modelName.trim().toLowerCase();

  // Exact match
  if (MODEL_PRICING_REGISTRY[normalized]) {
    return MODEL_PRICING_REGISTRY[normalized];
  }

  // Prefix matching for dated versions (e.g. gpt-4o-2024-08-06 -> gpt-4o)
  for (const [key, pricing] of Object.entries(MODEL_PRICING_REGISTRY)) {
    if (normalized.startsWith(key)) {
      return pricing;
    }
  }

  return null;
}
