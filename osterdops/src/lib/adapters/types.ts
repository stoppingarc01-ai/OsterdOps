/**
 * OsterdOps — AI Provider Adapter System Interfaces
 */

import type { AIProvider } from "@/types";

export interface GatewayChatMessage {
  role: "system" | "user" | "assistant" | "tool" | "developer";
  content: string;
  name?: string;
}

export interface GatewayChatRequest {
  model: string;
  messages: GatewayChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
  [key: string]: unknown;
}

export interface TokenUsageBreakdown {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cachedTokens?: number;
  reasoningTokens?: number;
}

export interface GatewayChatChoice {
  index: number;
  message: {
    role: "assistant";
    content: string;
  };
  finish_reason: "stop" | "length" | "tool_calls" | "content_filter" | null;
}

export interface GatewayChatResponse {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  choices: GatewayChatChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    prompt_tokens_details?: {
      cached_tokens?: number;
    };
    completion_tokens_details?: {
      reasoning_tokens?: number;
    };
  };
}

export interface ProviderCredentials {
  apiKey: string;
  baseUrl?: string;
}

export type NormalizedProviderErrorCode =
  | "INVALID_CREDENTIALS"
  | "PROVIDER_AUTHENTICATION_FAILED"
  | "PROVIDER_RATE_LIMITED"
  | "PROVIDER_TIMEOUT"
  | "PROVIDER_BAD_REQUEST"
  | "PROVIDER_MODEL_NOT_FOUND"
  | "PROVIDER_UNAVAILABLE"
  | "PROVIDER_INTERNAL_ERROR"
  | "PROVIDER_STREAM_ERROR"
  | "UNSUPPORTED_PROVIDER"
  | "VALIDATION_FAILED";

export interface NormalizedProviderError {
  code: NormalizedProviderErrorCode | string;
  message: string;
  statusCode: number;
  retryable: boolean;
  provider: AIProvider;
}

export interface ParsedStreamChunk {
  deltaText?: string;
  finishReason?: "stop" | "length" | "tool_calls" | "content_filter" | null;
  usage?: TokenUsageBreakdown;
  rawJson?: unknown;
}

export interface AIProviderAdapter {
  readonly provider: AIProvider;

  /**
   * Validates the provided credentials against the upstream vendor API in a safe, non-destructive call.
   */
  validateCredentials(
    credentials: ProviderCredentials
  ): Promise<{ valid: boolean; error?: string }>;

  /**
   * Formats the incoming OpenAI-standardized chat request into the provider's specific API body and headers.
   */
  formatRequest(
    request: GatewayChatRequest,
    credentials: ProviderCredentials
  ): { url: string; headers: Record<string, string>; body: string };

  /**
   * Formats a streaming request for the provider API.
   */
  formatStreamRequest?(
    request: GatewayChatRequest,
    credentials: ProviderCredentials
  ): { url: string; headers: Record<string, string>; body: string };

  /**
   * Executes the upstream HTTP request against the provider endpoint.
   */
  executeRequest(
    formatted: { url: string; headers: Record<string, string>; body: string },
    timeoutMs?: number
  ): Promise<{ rawResponse: Response; responseBody: unknown; latencyMs: number }>;

  /**
   * Parses an SSE/chunk string from the provider's streaming response into normalized deltas.
   */
  parseStreamChunk?(chunk: string, model?: string): ParsedStreamChunk[];

  /**
   * Extracts detailed token usage metrics from the vendor response body.
   */
  extractUsage(responseBody: unknown): TokenUsageBreakdown;

  /**
   * Normalizes the provider's response format into a standard OpenAI-compatible response.
   */
  normalizeResponse(responseBody: unknown, model: string): GatewayChatResponse;

  /**
   * Translates provider error payloads into normalized OsterdOps error structures.
   */
  handleProviderError(statusCode: number, rawError: unknown): NormalizedProviderError;
}
