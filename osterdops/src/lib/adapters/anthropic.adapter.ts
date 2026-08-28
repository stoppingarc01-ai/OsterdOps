/**
 * OsterdOps — Anthropic Claude Provider Adapter
 */

import type {
  AIProviderAdapter,
  GatewayChatRequest,
  GatewayChatResponse,
  NormalizedProviderError,
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
    let systemPrompt: string | undefined;
    const conversationMessages: Array<{ role: "user" | "assistant"; content: string }> = [];

    for (const msg of request.messages) {
      if (msg.role === "system" || msg.role === "developer") {
        systemPrompt = systemPrompt ? `${systemPrompt}\n\n${msg.content}` : msg.content;
      } else {
        const role = msg.role === "assistant" ? "assistant" : "user";
        conversationMessages.push({
          role,
          content: msg.content,
        });
      }
    }

    if (conversationMessages.length > 0 && conversationMessages[0].role === "assistant") {
      conversationMessages.unshift({ role: "user", content: "..." });
    }

    if (conversationMessages.length === 0) {
      conversationMessages.push({ role: "user", content: "Hello" });
    }

    const body = JSON.stringify({
      model: request.model,
      messages: conversationMessages,
      max_tokens: request.max_tokens || 4096,
      temperature: request.temperature,
      top_p: request.top_p,
      system: systemPrompt,
      stop_sequences: typeof request.stop === "string" ? [request.stop] : request.stop,
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

    let content = "";
    if (Array.isArray(body.content)) {
      content = body.content
        .filter((block: AnthropicContentBlock) => block.type === "text")
        .map((block: AnthropicContentBlock) => block.text || "")
        .join("\n");
    }

    const inputTokens = Number(body.usage?.input_tokens) || 0;
    const outputTokens = Number(body.usage?.output_tokens) || 0;
    const cachedTokens = Number(body.usage?.cache_read_input_tokens) || 0;

    return {
      id: body.id || `msg-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: body.model || model,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content,
          },
          finish_reason: body.stop_reason === "max_tokens" ? "length" : "stop",
        },
      ],
      usage: {
        prompt_tokens: inputTokens,
        completion_tokens: outputTokens,
        total_tokens: inputTokens + outputTokens,
        prompt_tokens_details: {
          cached_tokens: cachedTokens,
        },
      },
    };
  }

  handleProviderError(statusCode: number, rawError: unknown): NormalizedProviderError {
    const err = rawError as AnthropicResponseBody;
    const errObj = err?.error;

    const message = errObj?.message || "Anthropic upstream request failed.";
    const code = errObj?.type || `ANTHROPIC_HTTP_${statusCode}`;

    return {
      code,
      message,
      statusCode,
      retryable: statusCode === 429 || statusCode >= 500,
      provider: this.provider,
    };
  }
}
