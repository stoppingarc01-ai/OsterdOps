/**
 * OsterdOps — Centralized AI Model Pricing Registry
 * Versioned pricing matrix represented in USD per 1,000,000 tokens ($/1M).
 * Strict zero-invention policy: unknown models return null.
 */

import type { AIProvider } from "@/types";

export type ProviderId = AIProvider | "meta" | "groq" | "moonshot" | "kimi" | "deepseek";

export interface ModelPricing {
  provider: ProviderId;
  model: string;
  inputCostPer1M: number;
  outputCostPer1M: number;
  contextWindow: number;
  supportsStreaming: boolean;
  supportsVision: boolean;
  supportsFunctionCalling: boolean;
  fallbackModel?: string;

  // Compatibility aliases for FinOps engine and cost ledger
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
 * Helper to construct ModelPricing with unified legacy and modern schema properties.
 */
function createPricingEntry(entry: {
  provider: ProviderId;
  model: string;
  inputCostPer1M: number;
  outputCostPer1M: number;
  contextWindow: number;
  supportsStreaming: boolean;
  supportsVision: boolean;
  supportsFunctionCalling: boolean;
  fallbackModel?: string;
  cachedInputPerMillionUsd?: number;
  reasoningPerMillionUsd?: number;
  description?: string;
}): ModelPricing {
  return {
    ...entry,
    inputPerMillionUsd: entry.inputCostPer1M,
    outputPerMillionUsd: entry.outputCostPer1M,
    currency: "USD",
    version: PRICING_VERSION,
    effectiveAt: PRICING_EFFECTIVE_DATE,
  };
}

/**
 * Authoritative pricing registry mapping exact provider model IDs to their cost profile.
 */
export const PRICING_REGISTRY: Record<string, ModelPricing> = {
  // ==========================================
  // 1. Google Gemini
  // ==========================================
  "gemini-2.0-flash-exp": createPricingEntry({
    provider: "gemini",
    model: "gemini-2.0-flash-exp",
    inputCostPer1M: 0.10,
    outputCostPer1M: 0.40,
    contextWindow: 1048576,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    fallbackModel: "gemini-1.5-flash",
    cachedInputPerMillionUsd: 0.025,
    description: "Next-gen experimental multimodal model with high speed and 1M context",
  }),
  "gemini-2.0-flash-thinking-exp": createPricingEntry({
    provider: "gemini",
    model: "gemini-2.0-flash-thinking-exp",
    inputCostPer1M: 0.10,
    outputCostPer1M: 0.40,
    contextWindow: 1048576,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    fallbackModel: "gemini-2.0-flash-exp",
    description: "Experimental thinking model showing chain-of-thought reasoning before answering",
  }),
  "gemini-1.5-pro": createPricingEntry({
    provider: "gemini",
    model: "gemini-1.5-pro",
    inputCostPer1M: 1.25,
    outputCostPer1M: 5.00,
    contextWindow: 2097152,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    fallbackModel: "gemini-1.5-flash",
    cachedInputPerMillionUsd: 0.3125,
    description: "Frontier multimodal reasoning with industry-record 2M token context window",
  }),
  "gemini-1.5-flash": createPricingEntry({
    provider: "gemini",
    model: "gemini-1.5-flash",
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.30,
    contextWindow: 1048576,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    fallbackModel: "gemini-1.5-flash-8b",
    cachedInputPerMillionUsd: 0.01875,
    description: "Fast, cost-effective multimodal workhorse with 1M context",
  }),
  "gemini-1.5-flash-8b": createPricingEntry({
    provider: "gemini",
    model: "gemini-1.5-flash-8b",
    inputCostPer1M: 0.0375,
    outputCostPer1M: 0.15,
    contextWindow: 1048576,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    fallbackModel: "gemini-1.0-pro",
    cachedInputPerMillionUsd: 0.01,
    description: "Sub-10B parameter model engineered for high-frequency chat and filtering",
  }),
  "gemini-1.0-pro": createPricingEntry({
    provider: "gemini",
    model: "gemini-1.0-pro",
    inputCostPer1M: 0.50,
    outputCostPer1M: 1.50,
    contextWindow: 32768,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: true,
    fallbackModel: "gemini-1.5-flash-8b",
    description: "Legacy text generation model for general NLP tasks",
  }),
  "text-embedding-004": createPricingEntry({
    provider: "gemini",
    model: "text-embedding-004",
    inputCostPer1M: 0.025,
    outputCostPer1M: 0.00,
    contextWindow: 2048,
    supportsStreaming: false,
    supportsVision: false,
    supportsFunctionCalling: false,
    description: "State-of-the-art embedding model for semantic search and retrieval",
  }),
  // Alias for backward compatibility
  "gemini-2.0-flash": createPricingEntry({
    provider: "gemini",
    model: "gemini-2.0-flash",
    inputCostPer1M: 0.10,
    outputCostPer1M: 0.40,
    contextWindow: 1048576,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    fallbackModel: "gemini-1.5-flash",
    cachedInputPerMillionUsd: 0.025,
  }),

  // ==========================================
  // 2. OpenAI
  // ==========================================
  "gpt-4o": createPricingEntry({
    provider: "openai",
    model: "gpt-4o",
    inputCostPer1M: 2.50,
    outputCostPer1M: 10.00,
    contextWindow: 128000,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    fallbackModel: "gpt-4o-mini",
    cachedInputPerMillionUsd: 1.25,
    description: "High-intelligence flagship multimodal model for complex multimodal tasks",
  }),
  "gpt-4o-2024-08-06": createPricingEntry({
    provider: "openai",
    model: "gpt-4o-2024-08-06",
    inputCostPer1M: 2.50,
    outputCostPer1M: 10.00,
    contextWindow: 128000,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    fallbackModel: "gpt-4o-mini",
    cachedInputPerMillionUsd: 1.25,
    description: "Snapshot with Structured Outputs support and enhanced instruction following",
  }),
  "gpt-4o-mini": createPricingEntry({
    provider: "openai",
    model: "gpt-4o-mini",
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.60,
    contextWindow: 128000,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    fallbackModel: "gpt-3.5-turbo",
    cachedInputPerMillionUsd: 0.075,
    description: "Fast, cost-efficient small model for everyday text and vision tasks",
  }),
  "o1-preview": createPricingEntry({
    provider: "openai",
    model: "o1-preview",
    inputCostPer1M: 15.00,
    outputCostPer1M: 60.00,
    contextWindow: 128000,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: false,
    fallbackModel: "o1-mini",
    cachedInputPerMillionUsd: 7.50,
    description: "Advanced reasoning model designed to think before answering difficult questions",
  }),
  "o1-mini": createPricingEntry({
    provider: "openai",
    model: "o1-mini",
    inputCostPer1M: 3.00,
    outputCostPer1M: 12.00,
    contextWindow: 128000,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: false,
    fallbackModel: "o3-mini",
    cachedInputPerMillionUsd: 1.50,
    description: "Fast, lightweight reasoning model optimized for code and STEM problem-solving",
  }),
  "o3-mini": createPricingEntry({
    provider: "openai",
    model: "o3-mini",
    inputCostPer1M: 1.10,
    outputCostPer1M: 4.40,
    contextWindow: 200000,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: true,
    fallbackModel: "gpt-4o-mini",
    cachedInputPerMillionUsd: 0.55,
    description: "Cost-efficient high-speed reasoning model with developer-adjustable reasoning effort",
  }),
  "gpt-4-turbo": createPricingEntry({
    provider: "openai",
    model: "gpt-4-turbo",
    inputCostPer1M: 10.00,
    outputCostPer1M: 30.00,
    contextWindow: 128000,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    fallbackModel: "gpt-4o",
    cachedInputPerMillionUsd: 5.00,
  }),
  "gpt-4": createPricingEntry({
    provider: "openai",
    model: "gpt-4",
    inputCostPer1M: 30.00,
    outputCostPer1M: 60.00,
    contextWindow: 8192,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: true,
    fallbackModel: "gpt-4-turbo",
  }),
  "gpt-3.5-turbo": createPricingEntry({
    provider: "openai",
    model: "gpt-3.5-turbo",
    inputCostPer1M: 0.50,
    outputCostPer1M: 1.50,
    contextWindow: 16385,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: true,
    fallbackModel: "gpt-4o-mini",
  }),
  "text-embedding-3-small": createPricingEntry({
    provider: "openai",
    model: "text-embedding-3-small",
    inputCostPer1M: 0.02,
    outputCostPer1M: 0.00,
    contextWindow: 8191,
    supportsStreaming: false,
    supportsVision: false,
    supportsFunctionCalling: false,
    description: "Highly efficient embedding model for search and similarity matching",
  }),
  "text-embedding-3-large": createPricingEntry({
    provider: "openai",
    model: "text-embedding-3-large",
    inputCostPer1M: 0.13,
    outputCostPer1M: 0.00,
    contextWindow: 8191,
    supportsStreaming: false,
    supportsVision: false,
    supportsFunctionCalling: false,
    fallbackModel: "text-embedding-3-small",
    description: "Most capable embedding model with higher dimensionality for nuanced search",
  }),
  // Alias for backward compatibility
  "o1": createPricingEntry({
    provider: "openai",
    model: "o1",
    inputCostPer1M: 15.00,
    outputCostPer1M: 60.00,
    contextWindow: 200000,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    fallbackModel: "o1-mini",
    cachedInputPerMillionUsd: 7.50,
  }),

  // ==========================================
  // 3. Anthropic
  // ==========================================
  "claude-3-5-sonnet-20241022": createPricingEntry({
    provider: "anthropic",
    model: "claude-3-5-sonnet-20241022",
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00,
    contextWindow: 200000,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    fallbackModel: "claude-3-5-haiku-20241022",
    cachedInputPerMillionUsd: 0.30,
    description: "Frontier benchmark-leading model with computer use capability and expert coding",
  }),
  "claude-3-5-sonnet-20240620": createPricingEntry({
    provider: "anthropic",
    model: "claude-3-5-sonnet-20240620",
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00,
    contextWindow: 200000,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    fallbackModel: "claude-3-5-haiku-20241022",
    cachedInputPerMillionUsd: 0.30,
  }),
  "claude-3-5-haiku-20241022": createPricingEntry({
    provider: "anthropic",
    model: "claude-3-5-haiku-20241022",
    inputCostPer1M: 0.80,
    outputCostPer1M: 4.00,
    contextWindow: 200000,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: true,
    fallbackModel: "claude-3-haiku-20240307",
    cachedInputPerMillionUsd: 0.08,
    description: "Next-gen lightweight model rivaling previous-gen frontier performance",
  }),
  "claude-3-opus-20240229": createPricingEntry({
    provider: "anthropic",
    model: "claude-3-opus-20240229",
    inputCostPer1M: 15.00,
    outputCostPer1M: 75.00,
    contextWindow: 200000,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    fallbackModel: "claude-3-5-sonnet-20241022",
    cachedInputPerMillionUsd: 1.50,
    description: "Deep analytical intelligence for complex creative and scientific synthesis",
  }),
  "claude-3-sonnet-20240229": createPricingEntry({
    provider: "anthropic",
    model: "claude-3-sonnet-20240229",
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00,
    contextWindow: 200000,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    fallbackModel: "claude-3-5-haiku-20241022",
    cachedInputPerMillionUsd: 0.30,
  }),
  "claude-3-haiku-20240307": createPricingEntry({
    provider: "anthropic",
    model: "claude-3-haiku-20240307",
    inputCostPer1M: 0.25,
    outputCostPer1M: 1.25,
    contextWindow: 200000,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    fallbackModel: "claude-3-5-haiku-20241022",
    cachedInputPerMillionUsd: 0.025,
    description: "Original lightning-fast, compact model for high-throughput classification",
  }),
  // Aliases for backward compatibility
  "claude-3-5-sonnet": createPricingEntry({
    provider: "anthropic",
    model: "claude-3-5-sonnet",
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00,
    contextWindow: 200000,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    fallbackModel: "claude-3-5-haiku-20241022",
    cachedInputPerMillionUsd: 0.30,
  }),
  "claude-3-5-haiku": createPricingEntry({
    provider: "anthropic",
    model: "claude-3-5-haiku",
    inputCostPer1M: 0.80,
    outputCostPer1M: 4.00,
    contextWindow: 200000,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: true,
    fallbackModel: "claude-3-haiku-20240307",
    cachedInputPerMillionUsd: 0.08,
  }),
  "claude-3-opus": createPricingEntry({
    provider: "anthropic",
    model: "claude-3-opus",
    inputCostPer1M: 15.00,
    outputCostPer1M: 75.00,
    contextWindow: 200000,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    fallbackModel: "claude-3-5-sonnet-20241022",
    cachedInputPerMillionUsd: 1.50,
  }),

  // ==========================================
  // 4. Meta (LLaMA 3, 3.1, 3.2 & 3.3)
  // ==========================================
  "llama-3.3-70b-versatile": createPricingEntry({
    provider: "meta",
    model: "llama-3.3-70b-versatile",
    inputCostPer1M: 0.59,
    outputCostPer1M: 0.79,
    contextWindow: 128000,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: true,
    fallbackModel: "llama-3.1-8b-instant",
    description: "Industry-leading 70B open weights model rivaling previous-gen 405B capabilities",
  }),
  "llama-3.1-405b-instruct": createPricingEntry({
    provider: "meta",
    model: "llama-3.1-405b-instruct",
    inputCostPer1M: 2.00,
    outputCostPer1M: 2.00,
    contextWindow: 128000,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: true,
    fallbackModel: "llama-3.3-70b-versatile",
    description: "Frontier-class open weights flagship for complex domain reasoning and synthetic data",
  }),
  "llama-3.1-70b-versatile": createPricingEntry({
    provider: "meta",
    model: "llama-3.1-70b-versatile",
    inputCostPer1M: 0.59,
    outputCostPer1M: 0.79,
    contextWindow: 128000,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: true,
    fallbackModel: "llama-3.1-8b-instant",
    description: "High-accuracy multilingual instruction model with 128K context",
  }),
  "llama-3.1-8b-instant": createPricingEntry({
    provider: "meta",
    model: "llama-3.1-8b-instant",
    inputCostPer1M: 0.05,
    outputCostPer1M: 0.08,
    contextWindow: 128000,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: true,
    fallbackModel: "llama-3.2-3b",
    description: "Ultra-fast open weights 8B model with sub-second inference latency",
  }),
  "llama-3.2-90b-vision": createPricingEntry({
    provider: "meta",
    model: "llama-3.2-90b-vision",
    inputCostPer1M: 0.90,
    outputCostPer1M: 0.90,
    contextWindow: 128000,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    fallbackModel: "llama-3.2-11b-vision",
    description: "Multimodal flagship open model for complex visual analysis and document parsing",
  }),
  "llama-3.2-11b-vision": createPricingEntry({
    provider: "meta",
    model: "llama-3.2-11b-vision",
    inputCostPer1M: 0.18,
    outputCostPer1M: 0.18,
    contextWindow: 128000,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    fallbackModel: "llama-3.2-3b",
    description: "Efficient vision-language model for image captioning and visual query answering",
  }),
  "llama-3.2-3b": createPricingEntry({
    provider: "meta",
    model: "llama-3.2-3b",
    inputCostPer1M: 0.04,
    outputCostPer1M: 0.04,
    contextWindow: 128000,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: true,
    fallbackModel: "llama-3.2-1b",
    description: "Compact high-performance edge and CPU-friendly model for summarizing and rewriting",
  }),
  "llama-3.2-1b": createPricingEntry({
    provider: "meta",
    model: "llama-3.2-1b",
    inputCostPer1M: 0.02,
    outputCostPer1M: 0.02,
    contextWindow: 128000,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: true,
    description: "Lightweight 1B parameter model for on-device and ultra-low-cost utility tasks",
  }),
  "llama-3-70b-8192": createPricingEntry({
    provider: "meta",
    model: "llama-3-70b-8192",
    inputCostPer1M: 0.59,
    outputCostPer1M: 0.79,
    contextWindow: 8192,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: true,
    fallbackModel: "llama-3-8b-8192",
    description: "Original LLaMA 3 70B baseline instruction model",
  }),
  "llama-3-8b-8192": createPricingEntry({
    provider: "meta",
    model: "llama-3-8b-8192",
    inputCostPer1M: 0.05,
    outputCostPer1M: 0.08,
    contextWindow: 8192,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: true,
    fallbackModel: "llama-3.2-1b",
    description: "Original LLaMA 3 8B baseline instruction model",
  }),

  // ==========================================
  // 5. Cloud Enterprise Endpoints (Azure / Bedrock)
  // ==========================================
  "azure/gpt-4o": createPricingEntry({
    provider: "azure",
    model: "azure/gpt-4o",
    inputCostPer1M: 2.50,
    outputCostPer1M: 10.00,
    contextWindow: 128000,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    cachedInputPerMillionUsd: 1.25,
  }),
  "azure/gpt-4o-mini": createPricingEntry({
    provider: "azure",
    model: "azure/gpt-4o-mini",
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.60,
    contextWindow: 128000,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    cachedInputPerMillionUsd: 0.075,
  }),
  "bedrock/anthropic.claude-3-5-sonnet": createPricingEntry({
    provider: "bedrock",
    model: "bedrock/anthropic.claude-3-5-sonnet",
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00,
    contextWindow: 200000,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    cachedInputPerMillionUsd: 0.30,
  }),
  "bedrock/amazon.titan-text-express": createPricingEntry({
    provider: "bedrock",
    model: "bedrock/amazon.titan-text-express",
    inputCostPer1M: 0.20,
    outputCostPer1M: 0.60,
    contextWindow: 8192,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: false,
  }),

  // ==========================================
  // 6. Moonshot AI (Kimi) Models
  // ==========================================
  "moonshot-v1-8k": createPricingEntry({
    provider: "moonshot",
    model: "moonshot-v1-8k",
    inputCostPer1M: 1.70,
    outputCostPer1M: 1.70,
    contextWindow: 8192,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: true,
    description: "High-speed, cost-effective 8K context model for conversational chat and routing",
  }),
  "moonshot-v1-32k": createPricingEntry({
    provider: "moonshot",
    model: "moonshot-v1-32k",
    inputCostPer1M: 3.40,
    outputCostPer1M: 3.40,
    contextWindow: 32768,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: true,
    fallbackModel: "moonshot-v1-8k",
    description: "Balanced 32K context window for detailed coding assistance, document Q&A, and agents",
  }),
  "moonshot-v1-128k": createPricingEntry({
    provider: "moonshot",
    model: "moonshot-v1-128k",
    inputCostPer1M: 8.50,
    outputCostPer1M: 8.50,
    contextWindow: 131072,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: true,
    fallbackModel: "moonshot-v1-32k",
    description: "Massive 128K context window for multi-document synthesis and long-form financial analysis",
  }),
  "kimi-k1.5": createPricingEntry({
    provider: "moonshot",
    model: "kimi-k1.5",
    inputCostPer1M: 1.40,
    outputCostPer1M: 2.80,
    contextWindow: 131072,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    fallbackModel: "moonshot-v1-8k",
    description: "Next-gen multimodal reasoning model with long-context visual reasoning and math capabilities",
  }),
  "kimi-latest": createPricingEntry({
    provider: "moonshot",
    model: "kimi-latest",
    inputCostPer1M: 1.40,
    outputCostPer1M: 2.80,
    contextWindow: 131072,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    fallbackModel: "moonshot-v1-8k",
    description: "Points dynamically to Kimi's most capable frontier reasoning and multimodal release",
  }),

  // ==========================================
  // 6. DeepSeek AI Models (V3 & R1)
  // ==========================================
  "deepseek-chat": createPricingEntry({
    provider: "deepseek",
    model: "deepseek-chat",
    inputCostPer1M: 0.14,
    outputCostPer1M: 0.28,
    contextWindow: 65536,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: true,
    fallbackModel: "gpt-4o-mini",
    cachedInputPerMillionUsd: 0.014,
    description: "DeepSeek-V3 flagship MoE model with ultra-low token economics ($0.14 in / $0.28 out)",
  }),
  "deepseek-reasoner": createPricingEntry({
    provider: "deepseek",
    model: "deepseek-reasoner",
    inputCostPer1M: 0.55,
    outputCostPer1M: 2.19,
    contextWindow: 65536,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: false,
    fallbackModel: "deepseek-chat",
    cachedInputPerMillionUsd: 0.14,
    reasoningPerMillionUsd: 2.19,
    description: "DeepSeek-R1 frontier reasoning model with verifiable Chain-of-Thought ($0.55 in / $2.19 out)",
  }),
  "deepseek-coder": createPricingEntry({
    provider: "deepseek",
    model: "deepseek-coder",
    inputCostPer1M: 0.14,
    outputCostPer1M: 0.28,
    contextWindow: 16384,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: true,
    fallbackModel: "deepseek-chat",
    description: "DeepSeek Coder model optimized for code generation and refactoring ($0.14 in / $0.28 out)",
  }),

  // ==========================================
  // 7. xAI Grok Models
  // ==========================================
  "grok-2-1212": createPricingEntry({
    provider: "xai",
    model: "grok-2-1212",
    inputCostPer1M: 2.0,
    outputCostPer1M: 10.0,
    contextWindow: 131072,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: true,
    fallbackModel: "grok-beta",
    description: "xAI Grok 2 frontier general intelligence ($2.00 in / $10.00 out)",
  }),
  "grok-2-vision-1212": createPricingEntry({
    provider: "xai",
    model: "grok-2-vision-1212",
    inputCostPer1M: 2.0,
    outputCostPer1M: 10.0,
    contextWindow: 131072,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    fallbackModel: "grok-2-1212",
    description: "xAI Grok 2 Vision multimodal model ($2.00 in / $10.00 out)",
  }),
  "grok-beta": createPricingEntry({
    provider: "xai",
    model: "grok-beta",
    inputCostPer1M: 5.0,
    outputCostPer1M: 15.0,
    contextWindow: 131072,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: true,
    fallbackModel: "gpt-4o-mini",
    description: "xAI Grok Beta preview model ($5.00 in / $15.00 out)",
  }),

  // ==========================================
  // 8. Perplexity AI Models
  // ==========================================
  "sonar-pro": createPricingEntry({
    provider: "perplexity",
    model: "sonar-pro",
    inputCostPer1M: 3.0,
    outputCostPer1M: 15.0,
    contextWindow: 200000,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: false,
    fallbackModel: "sonar",
    description: "Perplexity Sonar Pro live internet reasoning ($3.00 in / $15.00 out)",
  }),
  "sonar": createPricingEntry({
    provider: "perplexity",
    model: "sonar",
    inputCostPer1M: 1.0,
    outputCostPer1M: 1.0,
    contextWindow: 131072,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: false,
    fallbackModel: "gpt-4o-mini",
    description: "Perplexity Sonar fast internet search model ($1.00 in / $1.00 out)",
  }),
  "sonar-reasoning-pro": createPricingEntry({
    provider: "perplexity",
    model: "sonar-reasoning-pro",
    inputCostPer1M: 2.0,
    outputCostPer1M: 8.0,
    contextWindow: 131072,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: false,
    fallbackModel: "sonar-pro",
    description: "Perplexity Sonar Reasoning Pro chain-of-thought web reasoning ($2.00 in / $8.00 out)",
  }),

  // ==========================================
  // 9. Cohere Models
  // ==========================================
  "command-r-plus-08-2024": createPricingEntry({
    provider: "cohere",
    model: "command-r-plus-08-2024",
    inputCostPer1M: 2.5,
    outputCostPer1M: 10.0,
    contextWindow: 131072,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: true,
    fallbackModel: "command-r-08-2024",
    description: "Cohere Command R+ enterprise RAG powerhouse ($2.50 in / $10.00 out)",
  }),
  "command-r-08-2024": createPricingEntry({
    provider: "cohere",
    model: "command-r-08-2024",
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.6,
    contextWindow: 131072,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: true,
    fallbackModel: "gpt-4o-mini",
    description: "Cohere Command R enterprise workhorse ($0.15 in / $0.60 out)",
  }),
  "embed-english-v3.0": createPricingEntry({
    provider: "cohere",
    model: "embed-english-v3.0",
    inputCostPer1M: 0.1,
    outputCostPer1M: 0.0,
    contextWindow: 512,
    supportsStreaming: false,
    supportsVision: false,
    supportsFunctionCalling: false,
    description: "Cohere Embed English v3.0 semantic embeddings ($0.10 in / $0.00 out)",
  }),
};

/**
 * Backward compatibility alias for MODEL_PRICING_REGISTRY.
 */
export const MODEL_PRICING_REGISTRY = PRICING_REGISTRY;

const PRICING_LOOKUP_CACHE = new Map<string, ModelPricing | null>();

/**
 * Resolves pricing for a model name using fast O(1) dictionary lookup.
 * Strictly returns null if model is unrecognized (zero price invention).
 */
export function getModelPricing(modelName: string, provider?: string): ModelPricing | null {
  if (!modelName || typeof modelName !== "string") return null;

  const normalized = modelName.trim().toLowerCase().replace(/^models\//, "");
  const cacheKey = provider ? `${provider.toLowerCase()}/${normalized}` : normalized;

  if (PRICING_LOOKUP_CACHE.has(cacheKey)) {
    return PRICING_LOOKUP_CACHE.get(cacheKey)!;
  }

  // 1. Direct match in dictionary
  if (PRICING_REGISTRY[normalized]) {
    const res = PRICING_REGISTRY[normalized];
    PRICING_LOOKUP_CACHE.set(cacheKey, res);
    return res;
  }

  // 2. Prefixed provider match (e.g. azure/gpt-4o or bedrock/...)
  if (provider) {
    const providerKey = `${provider.toLowerCase()}/${normalized}`;
    if (PRICING_REGISTRY[providerKey]) {
      const res = PRICING_REGISTRY[providerKey];
      PRICING_LOOKUP_CACHE.set(cacheKey, res);
      return res;
    }
  }

  // 3. Dated or versioned variant matching
  for (const [key, pricing] of Object.entries(PRICING_REGISTRY)) {
    if (normalized.startsWith(key) && (normalized.length === key.length || normalized[key.length] === "-" || normalized[key.length] === "/")) {
      PRICING_LOOKUP_CACHE.set(cacheKey, pricing);
      return pricing;
    }
  }

  PRICING_LOOKUP_CACHE.set(cacheKey, null);
  return null;
}
