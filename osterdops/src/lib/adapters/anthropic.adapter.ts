/**
 * OsterdOps — Anthropic Claude Provider Adapter (Phase 22)
 * Production-grade integration supporting chat completions, streaming SSE,
 * system prompt extraction, cache token accounting, and canonical error normalization.
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

interface AnthropicContentBlock {
  type: string;
  text?: string;
}

interface AnthropicUsage {
  input_tokens?: number;
  output_tokens?: number;
  cache_read_input_tokens?: number;
  cache_creation_input_tokens?: number;
}

interface AnthropicResponseBody {
  id?: string;
  type?: string;
  model?: string;
  content?: AnthropicContentBlock[];
  stop_reason?: string;
  usage?: AnthropicUsage;
  error?: {
    type?: string;
    message?: string;
  };
}

export class AnthropicAdapter implements AIProviderAdapter {
  readonly provider = "anthropic" as const;

  /**
   * Safe server-side credential validation using Anthropic models/messages endpoint.
   */
  async validateCredentials(
    credentials: ProviderCredentials
  ): Promise<{ valid: boolean; error?: string }> {
    if (!credentials.apiKey || typeof credentials.apiKey !== "string") {
      return { valid: false, error: "API key is required" };
    }

    const baseUrl = credentials.baseUrl || "https://api.anthropic.com/v1";
    const url = `${baseUrl.replace(/\/+$/, "")}/models`;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "x-api-key": credentials.apiKey,
          "anthropic-version": "2023-06-01",
        },
        signal: controller.signal,
      }).finally(() => clearTimeout(timer));

      if (res.ok) {
        return { valid: true };
      }

      if (res.status === 401 || res.status === 403) {
        return { valid: false, error: "INVALID_CREDENTIALS: Invalid Anthropic API key." };
      }

      if (res.status === 429) {
        return { valid: false, error: "PROVIDER_RATE_LIMITED: Anthropic rate limit reached." };
      }

      return { valid: false, error: `VALIDATION_FAILED: Anthropic responded with HTTP ${res.status}.` };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Network error";
      return { valid: false, error: `PROVIDER_UNAVAILABLE: ${errMsg}` };
    }
  }

  formatRequest(
    request: GatewayChatRequest,
    credentials: ProviderCredentials
  ): { url: string; headers: Record<string, string>; body: string } {
    const baseUrl = credentials.baseUrl || "https://api.anthropic.com/v1";
    const url = `${baseUrl.replace(/\/+$/, "")}/messages`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-api-key": credentials.apiKey,
      "anthropic-version": "2023-06-01",
    };

    // 1. Separate system messages from conversational turns
    const systemParts: string[] = [];
    const anthropicMessages: { role: "user" | "assistant"; content: string }[] = [];

    for (const msg of request.messages) {
      if (msg.role === "system" || msg.role === "developer") {
        systemParts.push(msg.content);
      } else if (msg.role === "user" || msg.role === "assistant") {
        anthropicMessages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    if (anthropicMessages.length === 0) {
      anthropicMessages.push({ role: "user", content: systemParts.join("\n") || "Hello" });
    }

    const payload: Record<string, unknown> = {
      model: request.model,
      messages: anthropicMessages,
      max_tokens: request.max_tokens || 4096,
      stream: false,
    };

    if (systemParts.length > 0) {
      payload.system = systemParts.join("\n\n");
    }

    if (request.temperature !== undefined) payload.temperature = request.temperature;
    if (request.top_p !== undefined) payload.top_p = request.top_p;
    if (request.stop) {
      payload.stop_sequences = Array.isArray(request.stop) ? request.stop : [request.stop];
    }

    return { url, headers, body: JSON.stringify(payload) };
  }

  formatStreamRequest(
    request: GatewayChatRequest,
    credentials: ProviderCredentials
  ): { url: string; headers: Record<string, string>; body: string } {
    const base = this.formatRequest(request, credentials);
    const parsed = JSON.parse(base.body) as Record<string, unknown>;
    parsed.stream = true;

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
      if (!trimmed || trimmed.startsWith(":") || trimmed.startsWith("event:")) {
        continue;
      }

      if (trimmed.startsWith("data:")) {
        const jsonStr = trimmed.slice(5).trim();
        try {
          const parsed = JSON.parse(jsonStr) as Record<string, unknown>;
          const type = String(parsed.type || "");

          if (type === "content_block_delta") {
            const delta = parsed.delta as { type?: string; text?: string };
            if (delta?.text) {
              results.push({
                deltaText: delta.text,
                finishReason: null,
                rawJson: parsed,
              });
            }
          } else if (type === "message_delta") {
            const delta = parsed.delta as { stop_reason?: string };
            const usageObj = parsed.usage as { output_tokens?: number };
            const stopReason = delta?.stop_reason;
            const finishReason =
              stopReason === "end_turn" || stopReason === "stop_sequence"
                ? "stop"
                : stopReason === "max_tokens"
                ? "length"
                : null;

            results.push({
              finishReason,
              usage: usageObj?.output_tokens
                ? {
                    inputTokens: 0,
                    outputTokens: usageObj.output_tokens,
                    totalTokens: usageObj.output_tokens,
                  }
                : undefined,
              rawJson: parsed,
            });
          } else if (type === "message_start") {
            const msg = parsed.message as { usage?: AnthropicUsage };
            if (msg?.usage?.input_tokens) {
              results.push({
                usage: {
                  inputTokens: msg.usage.input_tokens,
                  outputTokens: 0,
                  totalTokens: msg.usage.input_tokens,
                  cachedTokens: msg.usage.cache_read_input_tokens || 0,
                },
                rawJson: parsed,
              });
            }
          }
        } catch {
          // Ignore non-JSON lines
        }
      }
    }

    return results;
  }

  extractUsage(responseBody: unknown): TokenUsageBreakdown {
    const body = responseBody as AnthropicResponseBody;
    const usage = body?.usage || {};

    const inputTokens = Number(usage.input_tokens) || 0;
    const outputTokens = Number(usage.output_tokens) || 0;
    const cachedTokens = Number(usage.cache_read_input_tokens) || 0;
    const totalTokens = inputTokens + outputTokens;

    return {
      inputTokens,
      outputTokens,
      totalTokens,
      cachedTokens,
    };
  }

  normalizeResponse(responseBody: unknown, model: string): GatewayChatResponse {
    const body = responseBody as AnthropicResponseBody;
    const contentText = (body.content || [])
      .filter((c) => c.type === "text" && Boolean(c.text))
      .map((c) => c.text)
      .join("");

    const finishReason =
      body.stop_reason === "end_turn" || body.stop_reason === "stop_sequence"
        ? "stop"
        : body.stop_reason === "max_tokens"
        ? "length"
        : "stop";

    const usage = this.extractUsage(body);

    return {
      id: body.id || `msg_${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: body.model || model,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: contentText,
          },
          finish_reason: finishReason,
        },
      ],
      usage: {
        prompt_tokens: usage.inputTokens,
        completion_tokens: usage.outputTokens,
        total_tokens: usage.totalTokens,
        prompt_tokens_details: {
          cached_tokens: usage.cachedTokens,
        },
      },
    };
  }

  handleProviderError(statusCode: number, rawError: unknown): NormalizedProviderError {
    const err = rawError as AnthropicResponseBody;
    const errObj = err?.error;

    let normalizedCode: NormalizedProviderErrorCode = "PROVIDER_INTERNAL_ERROR";
    if (statusCode === 401 || statusCode === 403 || errObj?.type === "authentication_error") {
      normalizedCode = "INVALID_CREDENTIALS";
    } else if (statusCode === 404 || errObj?.type === "not_found_error") {
      normalizedCode = "PROVIDER_MODEL_NOT_FOUND";
    } else if (statusCode === 400 || errObj?.type === "invalid_request_error") {
      normalizedCode = "PROVIDER_BAD_REQUEST";
    } else if (statusCode === 429 || errObj?.type === "rate_limit_error") {
      normalizedCode = "PROVIDER_RATE_LIMITED";
    } else if (statusCode === 504 || statusCode === 408) {
      normalizedCode = "PROVIDER_TIMEOUT";
    } else if (statusCode >= 500 || errObj?.type === "api_error") {
      normalizedCode = "PROVIDER_UNAVAILABLE";
    }

    const message = errObj?.message || "Anthropic upstream request failed.";

    return {
      code: normalizedCode,
      message,
      statusCode,
      retryable: statusCode === 429 || statusCode >= 500,
      provider: this.provider,
    };
  }
}
