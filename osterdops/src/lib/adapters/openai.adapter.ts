/**
 * OsterdOps — OpenAI Provider Adapter (Phase 22)
 * Production-grade integration supporting chat completions, streaming SSE,
 * usage extraction, and canonical error normalization.
 */

import type {
  AIProviderAdapter,
  GatewayChatRequest,
  GatewayChatResponse,
  NormalizedProviderError,
  NormalizedProviderErrorCode,
  ParsedStreamChunk,
  ProviderCredentials,
  TokenUsageBreakdown,
} from "./types";

interface OpenAIChoice {
  index?: number;
  message?: {
    role?: string;
    content?: string;
  };
  delta?: {
    role?: string;
    content?: string;
  };
  finish_reason?: "stop" | "length" | "tool_calls" | "content_filter" | null;
}

interface OpenAIUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  prompt_tokens_details?: {
    cached_tokens?: number;
  };
  completion_tokens_details?: {
    reasoning_tokens?: number;
  };
}

interface OpenAIResponseBody {
  id?: string;
  created?: number;
  model?: string;
  choices?: OpenAIChoice[];
  usage?: OpenAIUsage;
  error?: {
    message?: string;
    code?: string;
    type?: string;
  };
}

export class OpenAIAdapter implements AIProviderAdapter {
  readonly provider = "openai" as const;

  private resolveBaseUrl(credentials: ProviderCredentials, model?: string): string {
    if (credentials.baseUrl) return credentials.baseUrl;
    const prov = (credentials.provider || "").toLowerCase();
    const mdl = (model || "").toLowerCase();
    if (prov === "moonshot" || prov === "kimi" || mdl.startsWith("moonshot") || mdl.startsWith("kimi")) {
      return "https://api.moonshot.cn/v1";
    }
    return "https://api.openai.com/v1";
  }

  /**
   * Safe server-side credential validation using OpenAI models endpoint.
   */
  async validateCredentials(
    credentials: ProviderCredentials
  ): Promise<{ valid: boolean; error?: string }> {
    if (!credentials.apiKey || typeof credentials.apiKey !== "string") {
      return { valid: false, error: "API key is required" };
    }

    const baseUrl = this.resolveBaseUrl(credentials);
    const url = `${baseUrl.replace(/\/+$/, "")}/models`;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${credentials.apiKey}`,
        },
        signal: controller.signal,
      }).finally(() => clearTimeout(timer));

      if (res.ok) {
        return { valid: true };
      }

      if (res.status === 401 || res.status === 403) {
        return { valid: false, error: "INVALID_CREDENTIALS: Invalid API key." };
      }

      if (res.status === 429) {
        return { valid: false, error: "PROVIDER_RATE_LIMITED: Upstream rate limit reached." };
      }

      return { valid: false, error: `VALIDATION_FAILED: Provider responded with HTTP ${res.status}.` };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Network error";
      return { valid: false, error: `PROVIDER_UNAVAILABLE: ${errMsg}` };
    }
  }

  formatRequest(
    request: GatewayChatRequest,
    credentials: ProviderCredentials
  ): { url: string; headers: Record<string, string>; body: string } {
    const baseUrl = this.resolveBaseUrl(credentials, request.model);
    const url = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${credentials.apiKey}`,
    };

    // Transform request parameters for OpenAI API
    const isReasoningModel = request.model.startsWith("o1") || request.model.startsWith("o3");
    const payload: Record<string, unknown> = {
      model: request.model,
      messages: request.messages,
      stream: false,
    };

    if (isReasoningModel) {
      if (request.max_tokens !== undefined) {
        payload.max_completion_tokens = request.max_tokens;
      }
    } else {
      if (request.temperature !== undefined) payload.temperature = request.temperature;
      if (request.max_tokens !== undefined) payload.max_tokens = request.max_tokens;
      if (request.top_p !== undefined) payload.top_p = request.top_p;
      if (request.frequency_penalty !== undefined) payload.frequency_penalty = request.frequency_penalty;
      if (request.presence_penalty !== undefined) payload.presence_penalty = request.presence_penalty;
    }

    if (request.stop !== undefined) payload.stop = request.stop;

    return { url, headers, body: JSON.stringify(payload) };
  }

  formatStreamRequest(
    request: GatewayChatRequest,
    credentials: ProviderCredentials
  ): { url: string; headers: Record<string, string>; body: string } {
    const base = this.formatRequest(request, credentials);
    const parsed = JSON.parse(base.body) as Record<string, unknown>;
    parsed.stream = true;
    parsed.stream_options = { include_usage: true };

    return {
      url: base.url,
      headers: base.headers,
      body: JSON.stringify(parsed),
    };
  }

  async executeRequest(
    formatted: { url: string; headers: Record<string, string>; body: string },
    timeoutMs = 60000
  ): Promise<{ rawResponse: Response; responseBody: unknown; latencyMs: number }> {
    const start = performance.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const rawResponse = await fetch(formatted.url, {
        method: "POST",
        headers: formatted.headers,
        body: formatted.body,
        signal: controller.signal,
      });

      const latencyMs = Math.round(performance.now() - start);
      const responseBody = await rawResponse.json().catch(() => ({}));

      return { rawResponse, responseBody, latencyMs };
    } finally {
      clearTimeout(timer);
    }
  }

  parseStreamChunk(chunk: string): ParsedStreamChunk[] {
    const lines = chunk.split("\n");
    const results: ParsedStreamChunk[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(":") || trimmed === "data: [DONE]") {
        continue;
      }

      if (trimmed.startsWith("data:")) {
        const jsonStr = trimmed.slice(5).trim();
        try {
          const parsed = JSON.parse(jsonStr) as OpenAIResponseBody;
          const choice = parsed.choices?.[0];
          const deltaText = choice?.delta?.content || "";
          const finishReason = choice?.finish_reason || null;

          let usage: TokenUsageBreakdown | undefined;
          if (parsed.usage) {
            usage = this.extractUsage(parsed);
          }

          results.push({
            deltaText,
            finishReason,
            usage,
            rawJson: parsed,
          });
        } catch {
          // Skip invalid chunk lines
        }
      }
    }

    return results;
  }

  extractUsage(responseBody: unknown): TokenUsageBreakdown {
    const body = responseBody as OpenAIResponseBody;
    const usage = body?.usage || {};

    const inputTokens = Number(usage.prompt_tokens) || 0;
    const outputTokens = Number(usage.completion_tokens) || 0;
    const totalTokens = Number(usage.total_tokens) || inputTokens + outputTokens;
    const cachedTokens = Number(usage.prompt_tokens_details?.cached_tokens) || 0;
    const reasoningTokens = Number(usage.completion_tokens_details?.reasoning_tokens) || 0;

    return {
      inputTokens,
      outputTokens,
      totalTokens,
      cachedTokens,
      reasoningTokens,
    };
  }

  normalizeResponse(responseBody: unknown, model: string): GatewayChatResponse {
    const body = responseBody as OpenAIResponseBody;

    return {
      id: body.id || `chatcmpl-${Date.now()}`,
      object: "chat.completion",
      created: body.created || Math.floor(Date.now() / 1000),
      model: body.model || model,
      choices: (body.choices || []).map((c: OpenAIChoice, index: number) => ({
        index: c.index ?? index,
        message: {
          role: "assistant" as const,
          content: c.message?.content || "",
        },
        finish_reason: c.finish_reason || "stop",
      })),
      usage: {
        prompt_tokens: body.usage?.prompt_tokens || 0,
        completion_tokens: body.usage?.completion_tokens || 0,
        total_tokens: body.usage?.total_tokens || 0,
        prompt_tokens_details: body.usage?.prompt_tokens_details,
        completion_tokens_details: body.usage?.completion_tokens_details,
      },
    };
  }

  handleProviderError(statusCode: number, rawError: unknown): NormalizedProviderError {
    const err = rawError as OpenAIResponseBody;
    const errObj = err?.error;

    let normalizedCode: NormalizedProviderErrorCode = "PROVIDER_INTERNAL_ERROR";
    if (statusCode === 401 || statusCode === 403 || errObj?.code === "invalid_api_key") {
      normalizedCode = "INVALID_CREDENTIALS";
    } else if (statusCode === 404 || errObj?.code === "model_not_found") {
      normalizedCode = "PROVIDER_MODEL_NOT_FOUND";
    } else if (statusCode === 400 || errObj?.type === "invalid_request_error") {
      normalizedCode = "PROVIDER_BAD_REQUEST";
    } else if (statusCode === 429 || errObj?.code === "rate_limit_exceeded") {
      normalizedCode = "PROVIDER_RATE_LIMITED";
    } else if (statusCode === 504 || statusCode === 408) {
      normalizedCode = "PROVIDER_TIMEOUT";
    } else if (statusCode >= 500) {
      normalizedCode = "PROVIDER_UNAVAILABLE";
    }

    const message = errObj?.message || "OpenAI upstream request failed.";

    return {
      code: normalizedCode,
      message,
      statusCode,
      retryable: statusCode === 429 || statusCode >= 500,
      provider: this.provider,
    };
  }
}
