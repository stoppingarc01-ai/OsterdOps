/**
 * OsterdOps — AI Provider Adapter Registry & Dynamic Resolver
 */

import type { AIProvider } from "@/types";
import type { AIProviderAdapter } from "./types";
import { OpenAIAdapter } from "./openai.adapter";
import { AnthropicAdapter } from "./anthropic.adapter";
import { GeminiAdapter } from "./gemini.adapter";

const adapterInstances: Partial<Record<AIProvider, AIProviderAdapter>> = {
  openai: new OpenAIAdapter(),
  anthropic: new AnthropicAdapter(),
  gemini: new GeminiAdapter(),
};

/**
 * Returns the adapter singleton for a given AI provider.
 */
export function getProviderAdapter(provider: AIProvider): AIProviderAdapter {
  const adapter = adapterInstances[provider];
  if (!adapter) {
    throw new Error(`Unsupported AI provider: '${provider}'`);
  }
  return adapter;
}

/**
 * Automatically infers the AI provider based on model identifier prefix/pattern.
 */
export function resolveProviderFromModel(modelName: string): AIProvider {
  const normalized = modelName.trim().toLowerCase();

  if (normalized.startsWith("claude")) {
    return "anthropic";
  }

  if (normalized.startsWith("gemini") || normalized.startsWith("models/gemini")) {
    return "gemini";
  }

  if (
    normalized.startsWith("gpt") ||
    normalized.startsWith("o1") ||
    normalized.startsWith("o3") ||
    normalized.startsWith("text-embedding") ||
    normalized.startsWith("dall-e")
  ) {
    return "openai";
  }

  // Default to OpenAI protocol for unknown / custom fine-tuned models
  return "openai";
}
