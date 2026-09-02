/**
 * OsterdOps — Centralized Provider & Model Capabilities Registry
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
  fallbackModel?: string;
  description?: string;
}

/**
 * Registry of known AI models and their technical capabilities.
 */
export const MODEL_CAPABILITIES_REGISTRY: Record<string, ModelCapabilities> = {
  // ==========================================
  // 1. Google Gemini Models
  // ==========================================
  "gemini-2.0-flash-exp": {
    provider: "gemini",
    model: "gemini-2.0-flash-exp",
    displayName: "Google Gemini 2.0 Flash Experimental",
    contextWindow: 1048576,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: true,
    supportsReasoning: false,
    supportsPromptCaching: true,
    supportedParameters: ["temperature", "top_p", "top_k", "max_tokens", "stop", "stream"],
    fallbackModel: "gemini-1.5-flash",
    description: "Next-gen experimental multimodal model with high speed and 1M context",
  },
  "gemini-2.0-flash-thinking-exp": {
    provider: "gemini",
    model: "gemini-2.0-flash-thinking-exp",
    displayName: "Google Gemini 2.0 Flash Thinking Experimental",
    contextWindow: 1048576,
    maxOutputTokens: 65536,
    supportsStreaming: true,
    supportsVision: true,
    supportsReasoning: true,
    supportsPromptCaching: false,
    supportedParameters: ["temperature", "top_p", "top_k", "max_tokens", "stop", "stream"],
    fallbackModel: "gemini-2.0-flash-exp",
    description: "Experimental thinking model showing chain-of-thought reasoning before answering",
  },
  "gemini-1.5-pro": {
    provider: "gemini",
    model: "gemini-1.5-pro",
    displayName: "Google Gemini 1.5 Pro",
    contextWindow: 2097152,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: true,
    supportsReasoning: false,
    supportsPromptCaching: true,
    supportedParameters: ["temperature", "top_p", "top_k", "max_tokens", "stop", "stream"],
    fallbackModel: "gemini-1.5-flash",
    description: "Frontier multimodal reasoning with industry-record 2M token context window",
  },
  "gemini-1.5-flash": {
    provider: "gemini",
    model: "gemini-1.5-flash",
    displayName: "Google Gemini 1.5 Flash",
    contextWindow: 1048576,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: true,
    supportsReasoning: false,
    supportsPromptCaching: true,
    supportedParameters: ["temperature", "top_p", "top_k", "max_tokens", "stop", "stream"],
    fallbackModel: "gemini-1.5-flash-8b",
    description: "High-volume, low-latency multimodal workhorse with 1M context",
  },
  "gemini-1.5-flash-8b": {
    provider: "gemini",
    model: "gemini-1.5-flash-8b",
    displayName: "Google Gemini 1.5 Flash-8B",
    contextWindow: 1048576,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: true,
    supportsReasoning: false,
    supportsPromptCaching: true,
    supportedParameters: ["temperature", "top_p", "top_k", "max_tokens", "stop", "stream"],
    fallbackModel: "gemini-1.0-pro",
    description: "Sub-10B parameter model engineered for high-frequency chat and filtering",
  },
  "gemini-1.0-pro": {
    provider: "gemini",
    model: "gemini-1.0-pro",
    displayName: "Google Gemini 1.0 Pro",
    contextWindow: 32768,
    maxOutputTokens: 2048,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: false,
    supportsPromptCaching: false,
    supportedParameters: ["temperature", "top_p", "top_k", "max_tokens", "stop", "stream"],
    fallbackModel: "gemini-1.5-flash-8b",
    description: "Legacy text generation model for general NLP tasks",
  },
  "text-embedding-004": {
    provider: "gemini",
    model: "text-embedding-004",
    displayName: "Google Text Embedding 004",
    contextWindow: 2048,
    maxOutputTokens: 0,
    supportsStreaming: false,
    supportsVision: false,
    supportsReasoning: false,
    supportsPromptCaching: false,
    supportedParameters: ["output_dimensionality"],
    description: "State-of-the-art embedding model for semantic search and retrieval",
  },
  // Alias for backward compatibility
  "gemini-2.0-flash": {
    provider: "gemini",
    model: "gemini-2.0-flash",
    displayName: "Google Gemini 2.0 Flash",
    contextWindow: 1048576,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: true,
    supportsReasoning: false,
    supportsPromptCaching: true,
    supportedParameters: ["temperature", "top_p", "top_k", "max_tokens", "stop", "stream"],
    fallbackModel: "gemini-1.5-flash",
  },

  // ==========================================
  // 2. OpenAI Models
  // ==========================================
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
    fallbackModel: "gpt-4o-mini",
    description: "High-intelligence flagship multimodal model for complex multimodal tasks",
  },
  "gpt-4o-2024-08-06": {
    provider: "openai",
    model: "gpt-4o-2024-08-06",
    displayName: "OpenAI GPT-4o (2024-08-06 Snapshot)",
    contextWindow: 128000,
    maxOutputTokens: 16384,
    supportsStreaming: true,
    supportsVision: true,
    supportsReasoning: false,
    supportsPromptCaching: true,
    supportedParameters: ["temperature", "top_p", "max_tokens", "presence_penalty", "frequency_penalty", "stop", "stream"],
    fallbackModel: "gpt-4o-mini",
    description: "Snapshot with Structured Outputs support and enhanced instruction following",
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
    fallbackModel: "gpt-3.5-turbo",
    description: "Fast, cost-efficient small model for everyday text and vision tasks",
  },
  "o1-preview": {
    provider: "openai",
    model: "o1-preview",
    displayName: "OpenAI o1-preview",
    contextWindow: 128000,
    maxOutputTokens: 32768,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: true,
    supportsPromptCaching: true,
    supportedParameters: ["max_completion_tokens", "stop", "stream"],
    fallbackModel: "o1-mini",
    description: "Advanced reasoning model designed to think before answering difficult questions",
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
    fallbackModel: "o3-mini",
    description: "Fast, lightweight reasoning model optimized for code and STEM problem-solving",
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
    fallbackModel: "gpt-4o-mini",
    description: "Cost-efficient high-speed reasoning model with developer-adjustable reasoning effort",
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
    fallbackModel: "gpt-4o",
  },
  "gpt-4": {
    provider: "openai",
    model: "gpt-4",
    displayName: "OpenAI GPT-4",
    contextWindow: 8192,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: false,
    supportsPromptCaching: false,
    supportedParameters: ["temperature", "top_p", "max_tokens", "presence_penalty", "frequency_penalty", "stop", "stream"],
    fallbackModel: "gpt-4-turbo",
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
    fallbackModel: "gpt-4o-mini",
  },
  "text-embedding-3-small": {
    provider: "openai",
    model: "text-embedding-3-small",
    displayName: "OpenAI Text Embedding 3 Small",
    contextWindow: 8191,
    maxOutputTokens: 0,
    supportsStreaming: false,
    supportsVision: false,
    supportsReasoning: false,
    supportsPromptCaching: false,
    supportedParameters: ["dimensions"],
    description: "Highly efficient embedding model for search and similarity matching",
  },
  "text-embedding-3-large": {
    provider: "openai",
    model: "text-embedding-3-large",
    displayName: "OpenAI Text Embedding 3 Large",
    contextWindow: 8191,
    maxOutputTokens: 0,
    supportsStreaming: false,
    supportsVision: false,
    supportsReasoning: false,
    supportsPromptCaching: false,
    supportedParameters: ["dimensions"],
    fallbackModel: "text-embedding-3-small",
    description: "Most capable embedding model with higher dimensionality for nuanced search",
  },
  // Alias for backward compatibility
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
    fallbackModel: "o1-mini",
  },

  // ==========================================
  // 3. Anthropic Models
  // ==========================================
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
    fallbackModel: "claude-3-5-haiku-20241022",
    description: "Frontier benchmark-leading model with computer use capability and expert coding",
  },
  "claude-3-5-sonnet-20240620": {
    provider: "anthropic",
    model: "claude-3-5-sonnet-20240620",
    displayName: "Anthropic Claude 3.5 Sonnet (Original)",
    contextWindow: 200000,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: true,
    supportsReasoning: false,
    supportsPromptCaching: true,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    fallbackModel: "claude-3-5-haiku-20241022",
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
    fallbackModel: "claude-3-haiku-20240307",
    description: "Next-gen lightweight model rivaling previous-gen frontier performance",
  },
  "claude-3-opus-20240229": {
    provider: "anthropic",
    model: "claude-3-opus-20240229",
    displayName: "Anthropic Claude 3 Opus",
    contextWindow: 200000,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    supportsVision: true,
    supportsReasoning: false,
    supportsPromptCaching: true,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    fallbackModel: "claude-3-5-sonnet-20241022",
    description: "Deep analytical intelligence for complex creative and scientific synthesis",
  },
  "claude-3-sonnet-20240229": {
    provider: "anthropic",
    model: "claude-3-sonnet-20240229",
    displayName: "Anthropic Claude 3 Sonnet",
    contextWindow: 200000,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    supportsVision: true,
    supportsReasoning: false,
    supportsPromptCaching: true,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    fallbackModel: "claude-3-5-haiku-20241022",
  },
  "claude-3-haiku-20240307": {
    provider: "anthropic",
    model: "claude-3-haiku-20240307",
    displayName: "Anthropic Claude 3 Haiku",
    contextWindow: 200000,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    supportsVision: true,
    supportsReasoning: false,
    supportsPromptCaching: true,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    fallbackModel: "claude-3-5-haiku-20241022",
    description: "Original lightning-fast, compact model for high-throughput classification",
  },
  // Aliases for backward compatibility
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
    fallbackModel: "claude-3-5-haiku-20241022",
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
    fallbackModel: "claude-3-haiku-20240307",
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
    fallbackModel: "claude-3-5-sonnet-20241022",
  },

  // ==========================================
  // 4. Meta (LLaMA 3, 3.1, 3.2 & 3.3)
  // ==========================================
  "llama-3.3-70b-versatile": {
    provider: "groq",
    model: "llama-3.3-70b-versatile",
    displayName: "Groq LLaMA 3.3 70B Versatile",
    contextWindow: 128000,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: false,
    supportsPromptCaching: false,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    fallbackModel: "llama-3.1-8b-instant",
    description: "Ultra-fast LPU inference (>300 tps) with LLaMA 3.3 70B frontier intelligence",
  },
  "llama-3.1-405b-instruct": {
    provider: "meta",
    model: "llama-3.1-405b-instruct",
    displayName: "Meta LLaMA 3.1 405B Instruct",
    contextWindow: 128000,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: false,
    supportsPromptCaching: false,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    fallbackModel: "llama-3.3-70b-versatile",
    description: "Frontier-class open weights flagship for complex domain reasoning and synthetic data",
  },
  "llama-3.1-70b-versatile": {
    provider: "meta",
    model: "llama-3.1-70b-versatile",
    displayName: "Meta LLaMA 3.1 70B Versatile",
    contextWindow: 128000,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: false,
    supportsPromptCaching: false,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    fallbackModel: "llama-3.1-8b-instant",
    description: "High-accuracy multilingual instruction model with 128K context",
  },
  "llama-3.1-8b-instant": {
    provider: "groq",
    model: "llama-3.1-8b-instant",
    displayName: "Groq LLaMA 3.1 8B Instant",
    contextWindow: 128000,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: false,
    supportsPromptCaching: false,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    fallbackModel: "gpt-4o-mini",
    description: "Sub-100ms ultra-low latency LPU model for high-throughput classification and agentic tasks",
  },
  "llama-3.2-90b-vision": {
    provider: "meta",
    model: "llama-3.2-90b-vision",
    displayName: "Meta LLaMA 3.2 90B Vision",
    contextWindow: 128000,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: true,
    supportsReasoning: false,
    supportsPromptCaching: false,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    fallbackModel: "llama-3.2-11b-vision",
    description: "Multimodal flagship open model for complex visual analysis and document parsing",
  },
  "llama-3.2-11b-vision": {
    provider: "meta",
    model: "llama-3.2-11b-vision",
    displayName: "Meta LLaMA 3.2 11B Vision",
    contextWindow: 128000,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: true,
    supportsReasoning: false,
    supportsPromptCaching: false,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    fallbackModel: "llama-3.2-3b",
    description: "Efficient vision-language model for image captioning and visual query answering",
  },
  "llama-3.2-3b": {
    provider: "meta",
    model: "llama-3.2-3b",
    displayName: "Meta LLaMA 3.2 3B",
    contextWindow: 128000,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: false,
    supportsPromptCaching: false,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    fallbackModel: "llama-3.2-1b",
    description: "Compact high-performance edge and CPU-friendly model for summarizing and rewriting",
  },
  "llama-3.2-1b": {
    provider: "meta",
    model: "llama-3.2-1b",
    displayName: "Meta LLaMA 3.2 1B",
    contextWindow: 128000,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: false,
    supportsPromptCaching: false,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    description: "Lightweight 1B parameter model for on-device and ultra-low-cost utility tasks",
  },
  "llama-3-70b-8192": {
    provider: "meta",
    model: "llama-3-70b-8192",
    displayName: "Meta LLaMA 3 70B (8K)",
    contextWindow: 8192,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: false,
    supportsPromptCaching: false,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    fallbackModel: "llama-3-8b-8192",
    description: "Original LLaMA 3 70B baseline instruction model",
  },
  "llama-3-8b-8192": {
    provider: "meta",
    model: "llama-3-8b-8192",
    displayName: "Meta LLaMA 3 8B (8K)",
    contextWindow: 8192,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: false,
    supportsPromptCaching: false,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    fallbackModel: "llama-3.2-1b",
    description: "Original LLaMA 3 8B baseline instruction model",
  },

  // --------------------------------------------------------------------------
  // Moonshot AI (Kimi) Models
  // --------------------------------------------------------------------------
  "moonshot-v1-8k": {
    provider: "moonshot",
    model: "moonshot-v1-8k",
    displayName: "Moonshot v1 (8K)",
    contextWindow: 8192,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: false,
    supportsPromptCaching: true,
    supportedParameters: ["temperature", "top_p", "max_tokens", "presence_penalty", "frequency_penalty", "stop", "stream"],
    description: "High-speed, cost-effective 8K context model for conversational chat and routing",
  },
  "moonshot-v1-32k": {
    provider: "moonshot",
    model: "moonshot-v1-32k",
    displayName: "Moonshot v1 (32K)",
    contextWindow: 32768,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: false,
    supportsPromptCaching: true,
    supportedParameters: ["temperature", "top_p", "max_tokens", "presence_penalty", "frequency_penalty", "stop", "stream"],
    fallbackModel: "moonshot-v1-8k",
    description: "Balanced 32K context window for detailed coding assistance, document Q&A, and agents",
  },
  "moonshot-v1-128k": {
    provider: "moonshot",
    model: "moonshot-v1-128k",
    displayName: "Moonshot v1 (128K)",
    contextWindow: 131072,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: false,
    supportsPromptCaching: true,
    supportedParameters: ["temperature", "top_p", "max_tokens", "presence_penalty", "frequency_penalty", "stop", "stream"],
    fallbackModel: "moonshot-v1-32k",
    description: "Massive 128K context window for multi-document synthesis and long-form financial analysis",
  },
  "kimi-k1.5": {
    provider: "moonshot",
    model: "kimi-k1.5",
    displayName: "Moonshot Kimi k1.5 (Multimodal)",
    contextWindow: 131072,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: true,
    supportsReasoning: true,
    supportsPromptCaching: true,
    supportedParameters: ["temperature", "top_p", "max_tokens", "presence_penalty", "frequency_penalty", "stop", "stream"],
    fallbackModel: "moonshot-v1-8k",
    description: "Next-gen multimodal reasoning model with long-context visual reasoning and math capabilities",
  },
  "kimi-latest": {
    provider: "moonshot",
    model: "kimi-latest",
    displayName: "Moonshot Kimi (Latest)",
    contextWindow: 131072,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: true,
    supportsReasoning: true,
    supportsPromptCaching: true,
    supportedParameters: ["temperature", "top_p", "max_tokens", "presence_penalty", "frequency_penalty", "stop", "stream"],
    fallbackModel: "moonshot-v1-8k",
    description: "Points dynamically to Kimi's most capable frontier reasoning and multimodal release",
  },

  // ==========================================
  // 6. DeepSeek AI Models (V3 & R1)
  // ==========================================
  "deepseek-chat": {
    provider: "deepseek",
    model: "deepseek-chat",
    displayName: "DeepSeek Chat (V3)",
    contextWindow: 65536,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: false,
    supportsPromptCaching: true,
    supportedParameters: [
      "temperature",
      "top_p",
      "max_tokens",
      "presence_penalty",
      "frequency_penalty",
      "stop",
      "stream",
    ],
    fallbackModel: "gpt-4o-mini",
    description: "DeepSeek-V3 frontier MoE architecture with ultra-low token economics and high-throughput inference",
  },
  "deepseek-reasoner": {
    provider: "deepseek",
    model: "deepseek-reasoner",
    displayName: "DeepSeek Reasoner (R1)",
    contextWindow: 65536,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: true,
    supportsPromptCaching: true,
    supportedParameters: [
      "temperature",
      "top_p",
      "max_tokens",
      "stop",
      "stream",
    ],
    fallbackModel: "deepseek-chat",
    description: "DeepSeek-R1 frontier reasoning model with verifiable Chain-of-Thought (CoT) and code/math superiority",
  },
  "deepseek-coder": {
    provider: "deepseek",
    model: "deepseek-coder",
    displayName: "DeepSeek Coder",
    contextWindow: 16384,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: false,
    supportsPromptCaching: true,
    supportedParameters: [
      "temperature",
      "top_p",
      "max_tokens",
      "stop",
      "stream",
    ],
    fallbackModel: "deepseek-chat",
    description: "Dedicated code generation, refactoring, and fill-in-the-middle repository synthesis model",
  },

  // ==========================================
  // 7. xAI Grok Models
  // ==========================================
  "grok-2": {
    provider: "xai",
    model: "grok-2",
    displayName: "xAI Grok 2",
    contextWindow: 131072,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: false,
    supportsPromptCaching: false,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    fallbackModel: "grok-2-mini",
    description: "Frontier reasoning and general intelligence model by xAI with 128K context",
  },
  "grok-2-vision": {
    provider: "xai",
    model: "grok-2-vision",
    displayName: "xAI Grok 2 Vision",
    contextWindow: 32768,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: true,
    supportsReasoning: false,
    supportsPromptCaching: false,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    fallbackModel: "grok-2",
    description: "Frontier multimodal model by xAI for complex image understanding and spatial document QA",
  },
  "grok-2-mini": {
    provider: "xai",
    model: "grok-2-mini",
    displayName: "xAI Grok 2 Mini",
    contextWindow: 131072,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: false,
    supportsPromptCaching: false,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    fallbackModel: "gpt-4o-mini",
    description: "Cost-efficient compact frontier model for high-throughput reasoning and conversational flows",
  },
  "grok-2-1212": {
    provider: "xai",
    model: "grok-2-1212",
    displayName: "xAI Grok 2 (1212)",
    contextWindow: 131072,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: false,
    supportsPromptCaching: false,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    fallbackModel: "grok-beta",
    description: "Frontier reasoning and general intelligence model by xAI with 128K context",
  },
  "grok-2-vision-1212": {
    provider: "xai",
    model: "grok-2-vision-1212",
    displayName: "xAI Grok 2 Vision (1212)",
    contextWindow: 131072,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: true,
    supportsReasoning: false,
    supportsPromptCaching: false,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    fallbackModel: "grok-2-1212",
    description: "Frontier multimodal model by xAI for complex image understanding and document QA",
  },
  "grok-beta": {
    provider: "xai",
    model: "grok-beta",
    displayName: "xAI Grok Beta",
    contextWindow: 131072,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: false,
    supportsPromptCaching: false,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    fallbackModel: "gpt-4o-mini",
    description: "High-speed preview model with real-time knowledge synthesis and conversational intelligence",
  },

  // ==========================================
  // 8. Perplexity AI Models
  // ==========================================
  "sonar-pro": {
    provider: "perplexity",
    model: "sonar-pro",
    displayName: "Perplexity Sonar Pro",
    contextWindow: 200000,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: true,
    supportsPromptCaching: false,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    fallbackModel: "sonar",
    description: "Advanced internet-grounded search, synthesis, and deep analytical reasoning engine",
  },
  "sonar-reasoning": {
    provider: "perplexity",
    model: "sonar-reasoning",
    displayName: "Perplexity Sonar Reasoning",
    contextWindow: 128000,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: true,
    supportsPromptCaching: false,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    fallbackModel: "sonar",
    description: "Chain-of-thought web reasoning model with explicit verification and citations",
  },
  "sonar": {
    provider: "perplexity",
    model: "sonar",
    displayName: "Perplexity Sonar",
    contextWindow: 128000,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: false,
    supportsPromptCaching: false,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    fallbackModel: "gpt-4o-mini",
    description: "High-throughput, real-time web search integration with live citation grounding",
  },
  "sonar-reasoning-pro": {
    provider: "perplexity",
    model: "sonar-reasoning-pro",
    displayName: "Perplexity Sonar Reasoning Pro",
    contextWindow: 131072,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: true,
    supportsPromptCaching: false,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    fallbackModel: "sonar-pro",
    description: "Chain-of-thought web reasoning model that evaluates live sources before answering",
  },


  // ==========================================
  // 10. Mistral AI Models
  // ==========================================
  "mistral-large-2411": {
    provider: "mistral",
    model: "mistral-large-2411",
    displayName: "Mistral Large 2411",
    contextWindow: 128000,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: false,
    supportsPromptCaching: false,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    fallbackModel: "ministral-8b",
    description: "Flagship European enterprise frontier model with advanced reasoning, multilingual support, and native tool calling",
  },
  "codestral-2501": {
    provider: "mistral",
    model: "codestral-2501",
    displayName: "Mistral Codestral 2501",
    contextWindow: 256000,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: false,
    supportsPromptCaching: false,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    fallbackModel: "mistral-large-2411",
    description: "State-of-the-art coding engine with massive 256k context window and fill-in-the-middle synthesis",
  },
  "ministral-8b": {
    provider: "mistral",
    model: "ministral-8b",
    displayName: "Mistral Ministral 8B",
    contextWindow: 128000,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: false,
    supportsPromptCaching: false,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    fallbackModel: "gpt-4o-mini",
    description: "Fast, power-efficient enterprise edge model with 128k context and low latency",
  },

  // ==========================================
  // 11. Cohere Models
  // ==========================================
  "command-r-plus-08-2024": {
    provider: "cohere",
    model: "command-r-plus-08-2024",
    displayName: "Cohere Command R+",
    contextWindow: 128000,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: false,
    supportsPromptCaching: false,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    fallbackModel: "command-r-08-2024",
    description: "Enterprise-optimized RAG powerhouse with multi-hop retrieval and verifiable citations",
  },
  "command-r-08-2024": {
    provider: "cohere",
    model: "command-r-08-2024",
    displayName: "Cohere Command R",
    contextWindow: 128000,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    supportsVision: false,
    supportsReasoning: false,
    supportsPromptCaching: false,
    supportedParameters: ["temperature", "top_p", "max_tokens", "stop", "stream"],
    fallbackModel: "gpt-4o-mini",
    description: "Scalable RAG and tool-use workhorse model with high accuracy citation grounding",
  },
  "embed-multilingual-v3.0": {
    provider: "cohere",
    model: "embed-multilingual-v3.0",
    displayName: "Cohere Embed Multilingual v3.0",
    contextWindow: 512,
    maxOutputTokens: 0,
    supportsStreaming: false,
    supportsVision: false,
    supportsReasoning: false,
    supportsPromptCaching: false,
    supportedParameters: [],
    description: "Enterprise multilingual semantic embeddings for cross-lingual enterprise search and RAG",
  },
  "embed-english-v3.0": {
    provider: "cohere",
    model: "embed-english-v3.0",
    displayName: "Cohere Embed English v3.0",
    contextWindow: 512,
    maxOutputTokens: 0,
    supportsStreaming: false,
    supportsVision: false,
    supportsReasoning: false,
    supportsPromptCaching: false,
    supportedParameters: [],
    description: "State-of-the-art semantic text embeddings for enterprise information retrieval",
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

  if (params.maxTokens !== undefined && params.maxTokens > cap.maxOutputTokens && cap.maxOutputTokens > 0) {
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
