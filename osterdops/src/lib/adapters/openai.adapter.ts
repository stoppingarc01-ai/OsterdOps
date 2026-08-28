/**
 * OsterdOps — OpenAI Provider Adapter
 */

import type {
  AIProviderAdapter,
  GatewayChatRequest,
  GatewayChatResponse,
  NormalizedProviderError,
  ProviderCredentials,
  TokenUsageBreakdown,
} from "./types";

interface OpenAIChoice {
  index?: number;
  message?: {
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

  formatRequest(
    request: GatewayChatRequest,
    credentials: ProviderCredentials
  ): { url: string; headers: Record<string, string>; body: string } {
    const baseUrl = credentials.baseUrl || "https://api.openai.com/v1";
    const url = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${credentials.apiKey}`,
    };

    const body = JSON.stringify({
      model: request.model,
      messages: request.messages,
      temperature: request.temperature,
      max_tokens: request.max_tokens,
      top_p: request.top_p,
      stream: false,
      frequency_penalty: request.frequency_penalty,
      presence_penalty: request.presence_penalty,
      stop: request.stop,
    });

    return { url, headers, body };
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

    const message = errObj?.message || "OpenAI upstream request failed.";
    const code = errObj?.code || `OPENAI_HTTP_${statusCode}`;

    return {
      code,
      message,
      statusCode,
      retryable: statusCode === 429 || statusCode >= 500,
      provider: this.provider,
    };
  }
}
