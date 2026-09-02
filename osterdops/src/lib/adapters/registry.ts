/**
 * OsterdOps — AI Provider Adapter Registry & Dynamic Resolver
 */

import type { AIProvider } from "@/types";
import type { AIProviderAdapter } from "./types";
import { OpenAIAdapter } from "./openai.adapter";
import { AnthropicAdapter } from "./anthropic.adapter";
import { GeminiAdapter } from "./gemini.adapter";
import { AzureAdapter } from "./azure.adapter";
import { BedrockAdapter } from "./bedrock.adapter";

const adapterInstances: Record<AIProvider, AIProviderAdapter> = {
  openai: new OpenAIAdapter(),
  anthropic: new AnthropicAdapter(),
  gemini: new GeminiAdapter(),
  azure: new AzureAdapter(),
  bedrock: new BedrockAdapter(),
  meta: new OpenAIAdapter(),
  groq: new OpenAIAdapter(),
  mistral: new OpenAIAdapter(),
  kimi: new OpenAIAdapter(),
  moonshot: new OpenAIAdapter(),
  deepseek: new OpenAIAdapter(),
  xai: new OpenAIAdapter(),
  perplexity: new OpenAIAdapter(),
  cohere: new OpenAIAdapter(),
  custom: new OpenAIAdapter(),
};

/**
 * Returns the adapter singleton for a given AI provider.
 */
export function getProviderAdapter(provider: string): AIProviderAdapter {
  const normalized = (provider || "").trim().toLowerCase() as AIProvider;
  const adapter = adapterInstances[normalized];
  if (!adapter) {
    throw new Error(`Unsupported AI provider: '${provider}'`);
  }
  return adapter;
}

/**
 * Checks if a provider identifier is supported by the registry.
 */
export function isSupportedProvider(provider: string): provider is AIProvider {
  const normalized = (provider || "").trim().toLowerCase() as AIProvider;
  return normalized in adapterInstances;
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

  if (normalized.startsWith("azure-") || normalized.startsWith("azure/")) {
    return "azure";
  }

  if (normalized.startsWith("bedrock-") || normalized.startsWith("amazon.") || normalized.startsWith("anthropic.claude")) {
    return "bedrock";
  }

  if (normalized.startsWith("llama") || normalized.startsWith("meta")) {
    return "meta";
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

  if (normalized.startsWith("moonshot") || normalized.startsWith("kimi")) {
    return "moonshot";
  }

  if (normalized.startsWith("deepseek")) {
    return "deepseek";
  }

  if (normalized.startsWith("grok") || normalized.startsWith("xai")) {
    return "xai";
  }

  if (normalized.startsWith("sonar") || normalized.startsWith("perplexity")) {
    return "perplexity";
  }

  if (normalized.startsWith("command") || normalized.startsWith("cohere") || normalized.startsWith("embed-english")) {
    return "cohere";
  }

  // Default to OpenAI protocol for unknown / custom fine-tuned models
  return "openai";
}
