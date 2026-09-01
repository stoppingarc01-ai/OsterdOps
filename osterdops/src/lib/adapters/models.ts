/**
 * OsterdOps — Centralized Provider & Model Capabilities Registry (Phase 22)
 * Authoritative capability matrix and parameter validation across AI providers.
 */

import type { AIProvider } from "@/types";

export interface ModelCapabilities {
  provider: AIProvider;
  model: string;
  displayName: string;
  contextWindow: number;
  maxOutputTokens: number;
  supportsStreaming: boolean;
  supportsVision: boolean;
  supportsReasoning: boolean;
  supportsPromptCaching: boolean;
  supportedParameters: string[];
  description?: string;
}

/**
 * Registry of known AI models and their technical capabilities.
 */
export const MODEL_CAPABILITIES_REGISTRY: Record<string, ModelCapabilities> = {
  // === OpenAI Models ===
  "gpt-4o": {
    provider: "openai",
    model: "gpt-4o",
    displayName: "OpenAI GPT-4o",
    contextWindow: 128000,
    maxOutputTokens: 16384,
    supportsStreaming: true,
    supportsVision: true,
    supportsReasoning: false,
    supportsPromptCaching: true,
    supportedParameters: ["temperature", "top_p", "max_tokens", "presence_penalty", "frequency_penalty", "stop", "stream"],
    description: "High-intelligence flagship multimodal model for complex tasks",
  },
  "gpt-4o-mini": {
    provider: "openai",
    model: "gpt-4o-mini",
    displayName: "OpenAI GPT-4o Mini",
    contextWindow: 128000,
    maxOutputTokens: 16384,
    supportsStreaming: true,
    supportsVision: true,
    supportsReasoning: false,
    supportsPromptCaching: true,
    supportedParameters: ["temperature", "top_p", "max_tokens", "presence_penalty", "frequency_penalty", "stop", "stream"],
    description: "Fast, cost-efficient small model for everyday text and vision tasks",
  },
  "o1": {
    provider: "openai",
    model: "o1",
    displayName: "OpenAI o1",
    contextWindow: 200000,
    maxOutputTokens: 100000,
    supportsStreaming: true,
    supportsVision: true,
    supportsReasoning: true,
    supportsPromptCaching: true,
    supportedParameters: ["max_completion_tokens", "stop", "stream"],
    description: "Deep reasoning model for math, science, and coding",
  },
  "o1-mini": {
    provider: "openai",
    model: "o1-mini",
    displayName: "OpenAI o1-mini",
    contextWindow: 128000,
    maxOutputTokens: 65536,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: true,
    supportsPromptCaching: true,
    supportedParameters: ["max_completion_tokens", "stop", "stream"],
    description: "Fast, lightweight reasoning model optimized for code and math",
  },
  "o3-mini": {
    provider: "openai",
    model: "o3-mini",
    displayName: "OpenAI o3-mini",
    contextWindow: 200000,
    maxOutputTokens: 100000,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: true,
    supportsPromptCaching: true,
    supportedParameters: ["max_completion_tokens", "stop", "stream"],
    description: "Cost-efficient high-speed reasoning model",
  },
  "gpt-4-turbo": {
    provider: "openai",
    model: "gpt-4-turbo",
    displayName: "OpenAI GPT-4 Turbo",
    contextWindow: 128000,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    supportsVision: true,
    supportsReasoning: false,
    supportsPromptCaching: false,
    supportedParameters: ["temperature", "top_p", "max_tokens", "presence_penalty", "frequency_penalty", "stop", "stream"],
  },
  "gpt-3.5-turbo": {
    provider: "openai",
    model: "gpt-3.5-turbo",
    displayName: "OpenAI GPT-3.5 Turbo",
    contextWindow: 16385,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: false,
    supportsPromptCaching: false,
    supportedParameters: ["temperature", "top_p", "max_tokens", "presence_penalty", "frequency_penalty", "stop", "stream"],
  },

  // === Anthropic Claude Models ===
  "claude-3-5-sonnet": {
    provider: "anthropic",
    model: "claude-3-5-sonnet",
    displayName: "Anthropic Claude 3.5 Sonnet",
    contextWindow: 200000,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: true,
    supportsReasoning: false,
    supportsPromptCaching: true,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    description: "Industry-leading frontier intelligence and coding capability",
  },
  "claude-3-5-sonnet-20241022": {
    provider: "anthropic",
    model: "claude-3-5-sonnet-20241022",
    displayName: "Anthropic Claude 3.5 Sonnet (Latest)",
    contextWindow: 200000,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: true,
    supportsReasoning: false,
    supportsPromptCaching: true,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
  },
  "claude-3-5-haiku": {
    provider: "anthropic",
    model: "claude-3-5-haiku",
    displayName: "Anthropic Claude 3.5 Haiku",
    contextWindow: 200000,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: false,
    supportsPromptCaching: true,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    description: "Ultra-fast lightweight model for real-time applications",
  },
  "claude-3-5-haiku-20241022": {
    provider: "anthropic",
    model: "claude-3-5-haiku-20241022",
    displayName: "Anthropic Claude 3.5 Haiku (Latest)",
    contextWindow: 200000,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: false,
    supportsPromptCaching: true,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
  },
  "claude-3-opus": {
    provider: "anthropic",
    model: "claude-3-opus",
    displayName: "Anthropic Claude 3 Opus",
    contextWindow: 200000,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    supportsVision: true,
    supportsReasoning: false,
    supportsPromptCaching: true,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
  },

  // === Google Gemini Models ===
  "gemini-1.5-pro": {
    provider: "gemini",
    model: "gemini-1.5-pro",
    displayName: "Google Gemini 1.5 Pro",
    contextWindow: 2000000,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: true,
    supportsReasoning: false,
    supportsPromptCaching: true,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    description: "Massive 2M token context window for large document and video reasoning",
  },
  "gemini-1.5-flash": {
    provider: "gemini",
    model: "gemini-1.5-flash",
    displayName: "Google Gemini 1.5 Flash",
    contextWindow: 1000000,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: true,
    supportsReasoning: false,
    supportsPromptCaching: true,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    description: "Fast, low-latency multimodal model with 1M context",
  },
  "gemini-2.0-flash": {
    provider: "gemini",
    model: "gemini-2.0-flash",
    displayName: "Google Gemini 2.0 Flash",
    contextWindow: 1000000,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: true,
    supportsReasoning: false,
    supportsPromptCaching: true,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    description: "Next-gen high speed multimodal Gemini model",
  },
  "gemini-2.0-flash-thinking-exp": {
    provider: "gemini",
    model: "gemini-2.0-flash-thinking-exp",
    displayName: "Google Gemini 2.0 Flash Thinking",
    contextWindow: 1000000,
    maxOutputTokens: 65536,
    supportsStreaming: true,
    supportsVision: true,
    supportsReasoning: true,
    supportsPromptCaching: false,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
  },
};

const MODEL_LOOKUP_CACHE = new Map<string, ModelCapabilities>();
const ALL_MODELS_STATIC: ModelCapabilities[] = Object.values(MODEL_CAPABILITIES_REGISTRY);

/**
 * Resolves model capabilities from model name.
 */
export function getModelCapabilities(modelName: string): ModelCapabilities | null {
  if (!modelName || typeof modelName !== "string") return null;

  const clean = modelName.trim().toLowerCase().replace(/^models\//, "");

  // Fast O(1) cache lookup
  if (MODEL_LOOKUP_CACHE.has(clean)) {
    return MODEL_LOOKUP_CACHE.get(clean)!;
  }

  if (MODEL_CAPABILITIES_REGISTRY[clean]) {
    const res = MODEL_CAPABILITIES_REGISTRY[clean];
    MODEL_LOOKUP_CACHE.set(clean, res);
    return res;
  }

  // Prefix matching for dated or versioned snapshots
  for (const [key, cap] of Object.entries(MODEL_CAPABILITIES_REGISTRY)) {
    if (clean.startsWith(key)) {
      MODEL_LOOKUP_CACHE.set(clean, cap);
      return cap;
    }
  }

  return null;
}

/**
 * Checks if a model is known in the capabilities registry.
 */
export function isModelSupported(modelName: string): boolean {
  return getModelCapabilities(modelName) !== null;
}

/**
 * Validates request parameters against model capabilities.
 */
export function validateModelRequest(
  modelName: string,
  params: { maxTokens?: number; temperature?: number; stream?: boolean }
): { valid: boolean; error?: string } {
  const cap = getModelCapabilities(modelName);
  if (!cap) {
    // Non-registry models pass through safely (e.g. fine-tuned or custom model IDs)
    return { valid: true };
  }

  if (params.maxTokens !== undefined && params.maxTokens > cap.maxOutputTokens) {
    return {
      valid: false,
      error: `Requested max_tokens (${params.maxTokens}) exceeds model limit of ${cap.maxOutputTokens} for '${cap.model}'.`,
    };
  }

  if (params.stream && !cap.supportsStreaming) {
    return {
      valid: false,
      error: `Model '${cap.model}' does not support streaming mode.`,
    };
  }

  if (params.temperature !== undefined && (params.temperature < 0 || params.temperature > 2)) {
    return {
      valid: false,
      error: `Temperature must be between 0.0 and 2.0. Received: ${params.temperature}`,
    };
  }

  return { valid: true };
}

export const validateModelParameters = validateModelRequest;

/**
 * Returns list of all registered models in O(1) time without allocations.
 */
export function getAllSupportedModels(): ModelCapabilities[] {
  return ALL_MODELS_STATIC;
}
