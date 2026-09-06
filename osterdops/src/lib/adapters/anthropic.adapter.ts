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
  thinking?: string;
}

/**
 * Normalizes Claude model identifiers, shorthands, and legacy versions to canonical Anthropic IDs.
 */
export function normalizeAnthropicModel(modelName: string): string {
  const raw = (modelName || "").trim().toLowerCase();
  const clean = raw.replace(/^anthropic\//, "");

  // Claude 5 Fable & creative aliases
  if (
    clean === "fable 5" ||
    clean === "fable-5" ||
    clean === "claude-fable-5" ||
    clean === "claude-fable" ||
    clean === "claude-5-fable"
  ) {
    return "claude-5-fable";
  }

  // Claude 5 Sonnet & shorthand aliases
  if (
    clean === "sonnet 5" ||
    clean === "sonnet-5" ||
    clean === "claude-sonnet-5" ||
    clean === "claude-5-sonnet"
  ) {
    return "claude-5-sonnet";
  }

  // Claude 5 Opus & shorthand aliases
  if (
    clean === "opus 5" ||
    clean === "opus-5" ||
    clean === "claude-opus-5" ||
    clean === "claude-5-opus"
  ) {
    return "claude-5-opus";
  }

  // Claude 3.7 Sonnet hybrid reasoning
  if (
    clean === "claude-3-7-sonnet" ||
    clean === "claude-3.7-sonnet" ||
    clean === "claude-3-7-sonnet-latest" ||
    clean === "claude-3-7-sonnet-20250219"
  ) {
    return "claude-3-7-sonnet-20250219";
  }

  // Claude 3.5 Sonnet
  if (
    clean === "claude-3-5-sonnet" ||
    clean === "claude-3.5-sonnet" ||
    clean === "claude-3-5-sonnet-latest" ||
    clean === "claude-3-5-sonnet-20241022"
  ) {
    return "claude-3-5-sonnet-20241022";
  }

  // Claude 3.5 Haiku
  if (
    clean === "claude-3-5-haiku" ||
    clean === "claude-3.5-haiku" ||
    clean === "claude-3-5-haiku-latest" ||
    clean === "claude-3-5-haiku-20241022"
  ) {
    return "claude-3-5-haiku-20241022";
  }

  // Claude 3 Opus
  if (
    clean === "claude-3-opus" ||
    clean === "claude-3-opus-latest" ||
    clean === "claude-3-opus-20240229"
  ) {
    return "claude-3-opus-20240229";
  }

  return clean;
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
    const url = `${baseUrl.replace(/\/+$/, "")}/messages`;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": credentials.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 1,
          messages: [{ role: "user", content: "ping" }],
        }),
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

      const body = await res.json().catch(() => null);
      if (body?.error?.type === "authentication_error") {
        return { valid: false, error: "INVALID_CREDENTIALS: Invalid Anthropic API key." };
      }

      if (res.status === 400 && body?.error?.type === "permission_error") {
        return { valid: false, error: `INVALID_CREDENTIALS: ${body?.error?.message || "Invalid Anthropic API key."}` };
      }

      // If credit limit or specific model parameter issue on 400, key is authentic
      if (res.status === 400 && !body?.error?.message?.toLowerCase().includes("key")) {
        return { valid: true };
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

    const canonicalModel = normalizeAnthropicModel(request.model);

    const payload: Record<string, unknown> = {
      model: canonicalModel,
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

    // Extended Thinking support (Claude 3.7 Sonnet & Claude 5)
    let thinkingPayload: { type: "enabled"; budget_tokens: number } | undefined;
    if (
      request.thinking &&
      typeof request.thinking === "object" &&
      "budget_tokens" in (request.thinking as Record<string, unknown>)
    ) {
      thinkingPayload = request.thinking as { type: "enabled"; budget_tokens: number };
    } else if (typeof request.thinking_budget === "number" && request.thinking_budget > 0) {
      thinkingPayload = { type: "enabled", budget_tokens: request.thinking_budget };
    } else if (typeof request.thinkingConfig === "object" && request.thinkingConfig !== null) {
      const tc = request.thinkingConfig as { thinkingBudget?: number };
      if (typeof tc.thinkingBudget === "number" && tc.thinkingBudget > 0) {
        thinkingPayload = { type: "enabled", budget_tokens: tc.thinkingBudget };
      }
    } else if (typeof request.reasoning_effort === "string") {
      const budgetMap: Record<string, number> = {
        low: 1024,
        medium: 2048,
        high: 4096,
      };
      const budget = budgetMap[request.reasoning_effort] || 2048;
      thinkingPayload = { type: "enabled", budget_tokens: budget };
    }

    if (thinkingPayload) {
      payload.thinking = thinkingPayload;
      if (
        typeof payload.max_tokens === "number" &&
        payload.max_tokens <= thinkingPayload.budget_tokens
      ) {
        payload.max_tokens = thinkingPayload.budget_tokens + 4096;
      }
      delete payload.temperature;
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
            const delta = parsed.delta as { type?: string; text?: string; thinking?: string };
            if (delta?.text) {
              results.push({
                deltaText: delta.text,
                finishReason: null,
                rawJson: parsed,
              });
            } else if (delta?.thinking) {
              results.push({
                deltaText: delta.thinking,
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
    const textBlocks = (body.content || []).filter((c) => c.type === "text" && Boolean(c.text));
    const thinkingBlocks = (body.content || []).filter(
      (c) => c.type === "thinking" && Boolean(c.thinking)
    );

    let contentText = textBlocks.map((c) => c.text).join("");
    if (!contentText && thinkingBlocks.length > 0) {
      contentText = thinkingBlocks.map((c) => c.thinking).join("");
    }

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
