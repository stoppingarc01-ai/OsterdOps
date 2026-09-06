/**
 * OsterdOps — Unified AI Model Catalog Engine
 * Single Source of Truth: Dynamically derived from PRICING_REGISTRY and MODEL_CAPABILITIES_REGISTRY.
 * Zero hardcoded duplication: Any model added to the FinOps engine or capability matrix is automatically
 * projected into the model catalog UI with accurate pricing, context windows, and badges.
 */

import { PRICING_REGISTRY, getModelPricing, type ModelPricing } from "@/lib/cost/pricing-registry";
import { MODEL_CAPABILITIES_REGISTRY, getModelCapabilities, type ModelCapabilities } from "@/lib/adapters/models";

export interface CatalogModel {
  id: string;
  name: string;
  provider: string;
  providerDisplayName: string;
  providerName: string;
  category: "frontier" | "reasoning" | "open-weights" | "embeddings" | "multimodal";
  contextWindow: string;
  contextTokens: number;
  inputCostPer1M: string;
  inputCost: string;
  outputCostPer1M: string;
  outputCost: string;
  rawInputCostPer1M: number;
  rawOutputCostPer1M: number;
  description: string;
  capabilities: {
    vision: boolean;
    reasoning: boolean;
    streaming: boolean;
    functionCalling?: boolean;
    code?: boolean;
  };
  tags: string[];
  fallbackModel?: string;
  fallback?: string;
  popular?: boolean;
  isPopular?: boolean;
}

/**
 * Returns human-readable display names for AI providers.
 */
export function getProviderDisplayName(provider: string): string {
  switch (provider.toLowerCase()) {
    case "openai":
      return "OpenAI";
    case "anthropic":
      return "Anthropic";
    case "google":
    case "gemini":
      return "Google Gemini";
    case "deepseek":
      return "DeepSeek";
    case "xai":
      return "xAI (Grok)";
    case "perplexity":
      return "Perplexity AI";
    case "groq":
      return "Groq (LPU)";
    case "mistral":
      return "Mistral AI";
    case "cohere":
      return "Cohere";
    case "qwen":
    case "alibaba":
      return "Alibaba Qwen";
    case "moonshot":
    case "kimi":
      return "Moonshot / Kimi";
    case "meta":
      return "Meta LLaMA";
    case "azure":
      return "Azure OpenAI";
    case "bedrock":
      return "AWS Bedrock";
    default:
      return provider.toUpperCase();
  }
}

/**
 * Normalizes provider id for consistent filtering and badges.
 */
export function normalizeCatalogProvider(provider: string): string {
  const p = provider.toLowerCase();
  if (p === "google") return "gemini";
  if (p === "kimi") return "moonshot";
  if (p === "alibaba") return "qwen";
  return p;
}

/**
 * Formats token context window into a human-friendly string (e.g., "128k tokens", "1M tokens").
 */
export function formatContextWindow(tokens: number): string {
  if (!tokens || tokens <= 0) return "128k tokens";
  if (tokens >= 1_000_000) {
    const millions = tokens / 1_000_000;
    return `${Number.isInteger(millions) ? millions : millions.toFixed(1)}M tokens`;
  }
  if (tokens >= 1_000) {
    const k = Math.round(tokens / 1_000);
    return `${k}k tokens`;
  }
  return `${tokens.toLocaleString()} tokens`;
}

/**
 * Formats pricing into $/1M tokens currency strings.
 */
export function formatCostPerMillion(cost: number): string {
  if (cost === 0) return "$0.00";
  if (cost < 0.1) {
    return `$${cost.toFixed(3)}`;
  }
  return `$${cost.toFixed(2)}`;
}

/**
 * Human-friendly model descriptions if none provided in registry.
 */
const MODEL_DESCRIPTIONS: Record<string, string> = {
  // OpenAI
  "gpt-4o": "Omni multimodal flagship with state-of-the-art vision, reasoning, and speech.",
  "gpt-4o-mini": "Affordable, low-latency intelligent model for high-throughput enterprise workloads.",
  "o1": "Advanced reasoning model using chain-of-thought processing for math, science, and coding.",
  "o1-mini": "Cost-effective reasoning model tailored for complex math, science, and coding problems.",
  "o3-mini": "Next-generation high-efficiency reasoning model with deep chain-of-thought analysis.",
  "text-embedding-3-large": "High-dimensional vector embeddings for enterprise semantic search and RAG.",
  "text-embedding-3-small": "Cost-effective 1536-dimensional embeddings optimized for high-volume retrieval.",

  // Anthropic Claude Key Models
  "claude-5-opus": "Frontier autonomous intelligence and deep multi-step agent reasoning flagship with 500k context.",
  "claude-5-sonnet": "High-intelligence agent workhorse built for software engineering and complex reasoning.",
  "claude-5-fable": "Expressive narrative and creative intelligence engine with literary fluency and high velocity.",
  "claude-3-7-sonnet-20250219": "Anthropic's hybrid reasoning flagship combining instantaneous execution with extended thinking.",
  "claude-3-7-sonnet": "Anthropic Claude 3.7 Sonnet hybrid reasoning model with dynamic thinking budget.",
  "claude-3-5-sonnet-20241022": "Industry benchmark for intelligent coding, nuanced analysis, and computer use.",
  "claude-3-5-haiku-20241022": "Ultra-fast, near-instant intelligent model for high-velocity customer support.",
  "claude-3-opus-20240229": "Deep analytical intelligence and complex document synthesis for executive research.",

  // Google Gemini Core Intelligence
  "gemini-3.8-flash": "Frontier Google Gemini 3.8 Flash multimodal model with extreme velocity and reasoning capabilities.",
  "gemini-3.7-flash": "Google Gemini 3.7 Flash hybrid reasoning and multimodal flagship for advanced agent loops.",
  "gemini-3.6-flash": "Google Gemini 3.6 Flash high-efficiency reasoning model with native tool execution.",
  "gemini-3.5-flash": "Google Gemini 3.5 Flash core multimodal intelligence workhorse with 1M token context.",
  "gemini-3.5-flash-lite": "Google Gemini 3.5 Flash Lite sub-second ultra-high-throughput enterprise model ($0.075/1M).",
  "gemini-3.1-pro-preview": "Google Gemini 3.1 Pro Preview with deep reasoning and massive 2M token context window.",
  "gemini-3.1-flash-lite": "Google Gemini 3.1 Flash Lite lightweight high-concurrency utility model.",
  "gemini-3-flash-preview": "Google Gemini 3 Flash Preview core intelligence model for next-generation AI workflows.",
  "gemini-flash-latest": "Latest generation Google Gemini Flash production model automatically tracking cutting-edge improvements.",
  "gemini-flash-lite-latest": "Latest generation Google Gemini Flash Lite high-throughput model.",
  "gemini-pro-latest": "Latest generation Google Gemini Pro deep intelligence model with 2M context.",
  "gemini-2.0-flash-exp": "Next-gen multimodal workhorse with breakthrough latency and native tool use.",
  "gemini-2.0-flash-thinking-exp": "Chain-of-thought thinking model displaying internal reasoning before output.",
  "gemini-1.5-pro": "Massive 2M token context window for full-repository parsing and video analysis.",
  "gemini-1.5-flash": "High-velocity multimodal workhorse built for high-throughput enterprise pipelines.",
  "text-embedding-004": "Ultra-low-cost semantic embeddings with dynamic output dimensionality.",

  // DeepSeek
  "deepseek-chat": "DeepSeek-V3 671B MoE frontier model with top-tier coding and general reasoning.",
  "deepseek-reasoner": "DeepSeek-R1 reasoning model with verifiable math and logic performance.",
  "deepseek-coder": "Specialized code synthesis and repository architecture model.",

  // xAI
  "grok-2": "xAI flagship frontier model with real-time reasoning and unfiltered knowledge.",
  "grok-2-vision": "Multimodal visual reasoning model capable of analyzing diagrams, code, and documents.",
  "grok-2-mini": "Lightweight high-throughput model built for velocity and structured generation.",
  "grok-beta": "Enterprise beta preview of Grok conversational and tool-calling capabilities.",

  // Perplexity
  "sonar-pro": "Flagship online search model with multi-query synthesis, citations, and 200k context.",
  "sonar-reasoning": "Chain-of-thought web reasoning model with explicit verification and real-time citations.",
  "sonar": "Fast, cost-efficient real-time web search integration with live citation grounding.",
  "sonar-reasoning-pro": "Deep analytical web reasoning model with multi-source factual verification.",

  // Groq
  "llama-3.3-70b-versatile": "Groq LPU ultra-high-velocity inference (>300 tps) with full 70B parameter reasoning.",
  "llama-3.1-8b-instant": "Ultra-low latency instant edge inference model with Groq LPU acceleration.",

  // Mistral AI
  "mistral-large-2411": "Mistral flagship enterprise model with native multilingual reasoning and tool calling.",
  "codestral-2501": "State-of-the-art 256k context code generation engine for complex repositories.",
  "ministral-8b": "High-velocity lightweight European enterprise model for edge tasks and fast summarization.",

  // Cohere
  "command-r-plus-08-2024": "Enterprise RAG powerhouse with multi-hop retrieval, citation grounding, and tool use.",
  "command-r-08-2024": "Scalable RAG and tool-use workhorse model with high accuracy citation grounding.",
  "embed-multilingual-v3.0": "Enterprise multilingual semantic embeddings for cross-lingual enterprise search and RAG.",
  "embed-english-v3.0": "High-dimensional vector embeddings for English enterprise semantic search and RAG.",

  // Moonshot / Kimi
  "moonshot-v1-128k": "Long-context conversational model handling 128k tokens of financial documents.",
  "moonshot-v1-32k": "Balanced 32k context model optimized for Chinese and multilingual comprehension.",
  "moonshot-v1-8k": "High-velocity conversational model for customer interactions and live chatbots.",
  "kimi-k1.5": "Multimodal reasoning and long-context processing engine from Moonshot AI.",

  // Alibaba Qwen (Qwen 2.5 & Qwen 2 Series)
  "qwen-max": "Alibaba Qwen 2.5 Max frontier reasoning flagship for complex enterprise agent workflows.",
  "qwen-plus": "Alibaba Qwen 2.5 Plus balanced high-speed intelligence and agent execution with 131k context.",
  "qwen-turbo": "Alibaba Qwen 2.5 Turbo ultra-fast sub-second model with 1M token context window ($0.05/1M).",
  "qwen2.5-72b-instruct": "Qwen 2.5 72B Instruct state-of-the-art open weights flagship exceeding LLaMA 3.1 70B.",
  "qwen2.5-32b-instruct": "Qwen 2.5 32B Instruct dense model offering near-70B capabilities at half the latency.",
  "qwen2.5-14b-instruct": "Qwen 2.5 14B Instruct balanced model optimized for fast on-prem and cloud deployment.",
  "qwen2.5-7b-instruct": "Qwen 2.5 7B Instruct lightweight, low-latency utility model with 128k context support.",
  "qwen2.5-coder-32b-instruct": "Qwen 2.5 Coder 32B specialized coding model matching GPT-4o on code generation and repo reasoning.",
  "qwen2.5-coder-7b-instruct": "Qwen 2.5 Coder 7B high-velocity code autocomplete and syntax analyzer.",
  "qwen2.5-math-72b-instruct": "Qwen 2.5 Math 72B advanced mathematical chain-of-thought solver and scientific theorem prover.",
  "qwen2.5-math-7b-instruct": "Qwen 2.5 Math 7B rapid mathematical deduction model for equations and logic problems.",
  "qwen2.5-vl-72b-instruct": "Qwen 2.5 VL 72B flagship multimodal vision-language model for multi-image, video parsing, and document OCR.",
  "qwen2.5-vl-7b-instruct": "Qwen 2.5 VL 7B lightweight multimodal perception and image reasoning model.",
  "qwen2-72b-instruct": "Qwen 2 72B Instruct foundation open weights model.",
  "qwen2-57b-a14b-instruct": "Qwen 2 57B A14B MoE architecture activating 14B parameters for high compute efficiency.",
  "qwen2-7b-instruct": "Qwen 2 7B Instruct baseline model.",
  "qwen2-vl-72b-instruct": "Qwen 2 VL 72B multimodal vision model with high-resolution visual grounding.",
  "qwen2-vl-7b-instruct": "Qwen 2 VL 7B lightweight multimodal vision model.",
};

const POPULAR_MODEL_IDS = new Set([
  "gpt-4o",
  "gpt-4o-mini",
  "o1",
  "claude-5-opus",
  "claude-5-sonnet",
  "claude-5-fable",
  "claude-3-7-sonnet",
  "claude-3-5-sonnet-20241022",
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.1-pro-preview",
  "gemini-flash-latest",
  "deepseek-chat",
  "deepseek-reasoner",
  "grok-2",
  "sonar-pro",
  "llama-3.3-70b-versatile",
  "mistral-large-2411",
  "command-r-plus-08-2024",
  "moonshot-v1-128k",
  "qwen-max",
  "qwen-plus",
  "qwen-turbo",
  "qwen2.5-72b-instruct",
  "qwen2.5-coder-32b-instruct",
  "qwen2.5-vl-72b-instruct",
]);

/**
 * Builds the complete dynamic catalog by merging PRICING_REGISTRY and MODEL_CAPABILITIES_REGISTRY.
 */
export function getDynamicCatalogModels(): CatalogModel[] {
  // Collect all unique model IDs across both registries (ignoring cloud aliases like azure/ or bedrock/)
  const modelIds = new Set<string>();

  for (const id of Object.keys(PRICING_REGISTRY)) {
    if (!id.startsWith("azure/") && !id.startsWith("bedrock/")) {
      modelIds.add(id);
    }
  }

  for (const id of Object.keys(MODEL_CAPABILITIES_REGISTRY)) {
    if (!id.startsWith("azure/") && !id.startsWith("bedrock/")) {
      modelIds.add(id);
    }
  }

  const catalog: CatalogModel[] = [];

  for (const id of modelIds) {
    const pricing = getModelPricing(id);
    const caps = getModelCapabilities(id);

    const provider = normalizeCatalogProvider(pricing?.provider || caps?.provider || "openai");
    const providerDisplayName = getProviderDisplayName(provider);

    // Capabilities
    const vision = Boolean(caps?.supportsVision || pricing?.supportsVision);
    const reasoning = Boolean(
      caps?.supportsReasoning ||
      id.includes("reasoning") ||
      id.includes("o1") ||
      id.includes("o3") ||
      id.includes("thinking")
    );
    const streaming = Boolean(caps?.supportsStreaming ?? pricing?.supportsStreaming ?? true);
    const functionCalling = Boolean(pricing?.supportsFunctionCalling ?? (caps?.supportedParameters?.includes("tools") || caps?.supportedParameters?.includes("functions")));
    const code = id.includes("coder") || id.includes("codestral") || id.includes("deepseek");

    // Category
    let category: CatalogModel["category"] = "frontier";
    if (id.includes("embed") || (caps?.supportedParameters && caps.supportedParameters.length === 0)) {
      category = "embeddings";
    } else if (reasoning) {
      category = "reasoning";
    } else if (id.includes("llama") || provider === "meta") {
      category = "open-weights";
    } else if (vision) {
      category = "multimodal";
    }

    // Context tokens
    const contextTokens = pricing?.contextWindow || caps?.contextWindow || 128000;
    const contextWindow = formatContextWindow(contextTokens);

    // Costs
    const rawInput = pricing?.inputCostPer1M ?? 0;
    const rawOutput = pricing?.outputCostPer1M ?? 0;
    const inputCostFormatted = formatCostPerMillion(rawInput);
    const outputCostFormatted = formatCostPerMillion(rawOutput);

    // Tags
    const tags: string[] = [];
    if (id.startsWith("sonar")) {
      tags.push("Live Web Search", "Citations");
    }
    if (provider === "groq") {
      tags.push("Ultra-Low Latency (>300 tps)");
    }
    if (id.startsWith("codestral")) {
      tags.push("256k Code Window", "Code Optimized");
    }
    if (id.startsWith("command-r")) {
      tags.push("Enterprise RAG");
    }
    if (category === "embeddings") {
      tags.push("Embeddings", "Vector Search");
      if (id.includes("multilingual")) tags.push("Multilingual");
    }
    if (reasoning) {
      tags.push("Reasoning");
    }
    if (vision) {
      tags.push("Vision");
    }
    if (streaming && !tags.includes("Streaming") && category !== "embeddings") {
      tags.push("Streaming");
    }
    if (functionCalling && !tags.includes("Tool Calling") && tags.length < 3) {
      tags.push("Tool Calling");
    }

    // Fallback
    const fallbackModel = pricing?.fallbackModel || caps?.fallbackModel;

    // Name
    const name = caps?.displayName || pricing?.description || id;
    const description =
      MODEL_DESCRIPTIONS[id] ||
      caps?.description ||
      pricing?.description ||
      `${providerDisplayName} enterprise model for general-purpose inference.`;

    const isPop = POPULAR_MODEL_IDS.has(id);

    catalog.push({
      id,
      name,
      provider,
      providerName: providerDisplayName,
      providerDisplayName,
      category,
      contextTokens,
      contextWindow,
      rawInputCostPer1M: rawInput,
      rawOutputCostPer1M: rawOutput,
      inputCost: inputCostFormatted,
      inputCostPer1M: inputCostFormatted,
      outputCost: outputCostFormatted,
      outputCostPer1M: outputCostFormatted,
      description,
      capabilities: {
        vision,
        reasoning,
        streaming,
        functionCalling,
        code,
      },
      tags: Array.from(new Set(tags)),
      fallback: fallbackModel,
      fallbackModel,
      popular: isPop,
      isPopular: isPop,
    });
  }

  // Sort: Popular first, then by provider, then by name
  return catalog.sort((a, b) => {
    if (a.popular && !b.popular) return -1;
    if (!a.popular && b.popular) return 1;
    if (a.provider !== b.provider) return a.provider.localeCompare(b.provider);
    return a.name.localeCompare(b.name);
  });
}
