/**
 * OsterdOps — Google Gemini Provider Adapter (Phase 22)
 * Production-grade integration supporting chat completions, streaming SSE,
 * system instruction formatting, usage metadata extraction, and canonical error normalization.
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

interface GeminiPart {
  text?: string;
}

interface GeminiCandidate {
  content?: {
    parts?: GeminiPart[];
    role?: string;
  };
  finishReason?: string;
}

interface GeminiUsageMetadata {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
  cachedContentTokenCount?: number;
}

interface GeminiResponseBody {
  candidates?: GeminiCandidate[];
  usageMetadata?: GeminiUsageMetadata;
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
}

export class GeminiAdapter implements AIProviderAdapter {
  readonly provider = "gemini" as const;

  /**
   * Safe server-side credential validation using Gemini models list endpoint.
   */
  async validateCredentials(
    credentials: ProviderCredentials
  ): Promise<{ valid: boolean; error?: string }> {
    if (!credentials.apiKey || typeof credentials.apiKey !== "string") {
      return { valid: false, error: "API key is required" };
    }

    const baseUrl =
      credentials.baseUrl || "https://generativelanguage.googleapis.com/v1beta";
    const url = `${baseUrl.replace(/\/+$/, "")}/models?key=${credentials.apiKey}`;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(url, {
        method: "GET",
        signal: controller.signal,
      }).finally(() => clearTimeout(timer));

      if (res.ok) {
        return { valid: true };
      }

      if (res.status === 400 || res.status === 401 || res.status === 403) {
        return { valid: false, error: "INVALID_CREDENTIALS: Invalid Gemini API key." };
      }

      if (res.status === 429) {
        return { valid: false, error: "PROVIDER_RATE_LIMITED: Gemini rate limit reached." };
      }

      return { valid: false, error: `VALIDATION_FAILED: Gemini responded with HTTP ${res.status}.` };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Network error";
      return { valid: false, error: `PROVIDER_UNAVAILABLE: ${errMsg}` };
    }
  }

  formatRequest(
    request: GatewayChatRequest,
    credentials: ProviderCredentials
  ): { url: string; headers: Record<string, string>; body: string } {
    const baseUrl =
      credentials.baseUrl || "https://generativelanguage.googleapis.com/v1beta";
    let cleanModel = request.model.replace(/^models\//, "");
    if (cleanModel === "gemini-flash-latest" || cleanModel === "gemini-2.5-flash") {
      cleanModel = "gemini-3.5-flash-lite";
    }
    const url = `${baseUrl.replace(/\/+$/, "")}/models/${cleanModel}:generateContent?key=${credentials.apiKey}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Separate system instructions from conversational contents
    const systemParts: { text: string }[] = [];
    const contents: { role: string; parts: { text: string }[] }[] = [];

    for (const msg of request.messages) {
      if (msg.role === "system" || msg.role === "developer") {
        systemParts.push({ text: msg.content });
      } else {
        const geminiRole = msg.role === "assistant" ? "model" : "user";
        contents.push({
          role: geminiRole,
          parts: [{ text: msg.content }],
        });
      }
    }

    if (contents.length === 0) {
      contents.push({
        role: "user",
        parts: [{ text: systemParts.map((p) => p.text).join("\n") || "Hello" }],
      });
    }

    const payload: Record<string, unknown> = {
      contents,
    };

    if (systemParts.length > 0) {
      payload.systemInstruction = {
        parts: systemParts,
      };
    }

    const generationConfig: Record<string, unknown> = {};
    if (request.temperature !== undefined) generationConfig.temperature = request.temperature;
    if (request.max_tokens !== undefined) generationConfig.maxOutputTokens = request.max_tokens;
    if (request.top_p !== undefined) generationConfig.topP = request.top_p;
    if (request.stop) {
      generationConfig.stopSequences = Array.isArray(request.stop) ? request.stop : [request.stop];
    }

    if (Object.keys(generationConfig).length > 0) {
      if (request.thinkingConfig) {
        generationConfig.thinkingConfig = request.thinkingConfig;
      } else if (cleanModel === "gemini-3.8-flash" && request.reasoning_effort !== "high") {
        generationConfig.thinkingConfig = { thinkingBudget: 0 };
      }
      payload.generationConfig = generationConfig;
    }

    return { url, headers, body: JSON.stringify(payload) };
  }

  formatStreamRequest(
    request: GatewayChatRequest,
    credentials: ProviderCredentials
  ): { url: string; headers: Record<string, string>; body: string } {
    const base = this.formatRequest(request, credentials);
    const baseUrl =
      credentials.baseUrl || "https://generativelanguage.googleapis.com/v1beta";
    let cleanModel = request.model.replace(/^models\//, "");
    if (cleanModel === "gemini-flash-latest" || cleanModel === "gemini-2.5-flash") {
      cleanModel = "gemini-3.5-flash-lite";
    }
    const url = `${baseUrl.replace(/\/+$/, "")}/models/${cleanModel}:streamGenerateContent?alt=sse&key=${credentials.apiKey}`;

    return {
      url,
      headers: base.headers,
      body: base.body,
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
      if (!trimmed || trimmed.startsWith(":")) {
        continue;
      }

      if (trimmed.startsWith("data:")) {
        const jsonStr = trimmed.slice(5).trim();
        try {
          const parsed = JSON.parse(jsonStr) as GeminiResponseBody;
          const candidate = parsed.candidates?.[0];
          const deltaText = (candidate?.content?.parts || [])
            .map((p) => p.text || "")
            .join("");

          const geminiFinish = candidate?.finishReason;
          const finishReason =
            geminiFinish === "STOP"
              ? "stop"
              : geminiFinish === "MAX_TOKENS"
              ? "length"
              : geminiFinish === "SAFETY"
              ? "content_filter"
              : null;

          let usage: TokenUsageBreakdown | undefined;
          if (parsed.usageMetadata) {
            usage = this.extractUsage(parsed);
          }

          results.push({
            deltaText,
            finishReason,
            usage,
            rawJson: parsed,
          });
        } catch {
          // Skip unparseable lines
        }
      }
    }

    return results;
  }

  extractUsage(responseBody: unknown): TokenUsageBreakdown {
    const body = responseBody as GeminiResponseBody;
    const meta = body?.usageMetadata || {};

    const inputTokens = Number(meta.promptTokenCount) || 0;
    const outputTokens = Number(meta.candidatesTokenCount) || 0;
    const totalTokens = Number(meta.totalTokenCount) || inputTokens + outputTokens;
    const cachedTokens = Number(meta.cachedContentTokenCount) || 0;

    const reasoningTokens = Number((meta as Record<string, unknown>).thoughtsTokenCount) || 0;

    return {
      inputTokens,
      outputTokens,
      totalTokens,
      cachedTokens,
      reasoningTokens,
    };
  }

  normalizeResponse(responseBody: unknown, model: string): GatewayChatResponse {
    const body = responseBody as GeminiResponseBody;
    const candidate = body?.candidates?.[0];
    const contentText = (candidate?.content?.parts || [])
      .map((p) => p.text || "")
      .join("");

    const geminiFinish = candidate?.finishReason || "STOP";
    const finishReason =
      geminiFinish === "STOP"
        ? "stop"
        : geminiFinish === "MAX_TOKENS"
        ? "length"
        : geminiFinish === "SAFETY"
        ? "content_filter"
        : "stop";

    const usage = this.extractUsage(body);

    return {
      id: `gemini_${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model,
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
    const err = rawError as GeminiResponseBody;
    const errObj = err?.error;

    let normalizedCode: NormalizedProviderErrorCode = "PROVIDER_INTERNAL_ERROR";
    if (statusCode === 400 && (errObj?.message?.includes("API key not valid") || errObj?.status === "UNAUTHENTICATED")) {
      normalizedCode = "INVALID_CREDENTIALS";
    } else if (statusCode === 401 || statusCode === 403) {
      normalizedCode = "INVALID_CREDENTIALS";
    } else if (statusCode === 404 || errObj?.status === "NOT_FOUND") {
      normalizedCode = "PROVIDER_MODEL_NOT_FOUND";
    } else if (statusCode === 400 || errObj?.status === "INVALID_ARGUMENT") {
      normalizedCode = "PROVIDER_BAD_REQUEST";
    } else if (statusCode === 429 || errObj?.status === "RESOURCE_EXHAUSTED") {
      normalizedCode = "PROVIDER_RATE_LIMITED";
    } else if (statusCode === 504 || statusCode === 408) {
      normalizedCode = "PROVIDER_TIMEOUT";
    } else if (statusCode >= 500 || errObj?.status === "UNAVAILABLE") {
      normalizedCode = "PROVIDER_UNAVAILABLE";
    }

    const message = errObj?.message || "Google Gemini upstream request failed.";

    return {
      code: normalizedCode,
      message,
      statusCode,
      retryable: statusCode === 429 || statusCode >= 500,
      provider: this.provider,
    };
  }
}
