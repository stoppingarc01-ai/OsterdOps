/**
 * OsterdOps — AWS Bedrock Provider Adapter
 */

import type {
  AIProviderAdapter,
  GatewayChatRequest,
  GatewayChatResponse,
  NormalizedProviderError,
  NormalizedProviderErrorCode,
  ProviderCredentials,
  TokenUsageBreakdown,
} from "./types";

export class BedrockAdapter implements AIProviderAdapter {
  readonly provider = "bedrock" as const;

  async validateCredentials(
    credentials: ProviderCredentials
  ): Promise<{ valid: boolean; error?: string }> {
    if (!credentials.apiKey) {
      return { valid: false, error: "AWS Access Key / Secret Key is required" };
    }
    // Basic format validation for AWS credentials
    if (credentials.apiKey.length < 16) {
      return { valid: false, error: "INVALID_CREDENTIALS: AWS credential format is invalid." };
    }
    return { valid: true };
  }

  formatRequest(
    request: GatewayChatRequest,
    credentials: ProviderCredentials
  ): { url: string; headers: Record<string, string>; body: string } {
    const region = credentials.baseUrl || "us-east-1";
    const url = `https://bedrock-runtime.${region}.amazonaws.com/model/${request.model}/invoke`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${credentials.apiKey}`,
    };

    const body = JSON.stringify({
      prompt: request.messages.map((m) => `${m.role}: ${m.content}`).join("\n"),
      max_tokens_to_sample: request.max_tokens || 1000,
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
    return {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
    };
  }

  normalizeResponse(responseBody: unknown, model: string): GatewayChatResponse {
    return {
      id: `bedrock-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: "",
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    };
  }

  handleProviderError(statusCode: number, rawError: unknown): NormalizedProviderError {
    let normalizedCode: NormalizedProviderErrorCode = "VALIDATION_FAILED";
    if (statusCode === 401 || statusCode === 403) {
      normalizedCode = "INVALID_CREDENTIALS";
    } else if (statusCode === 429) {
      normalizedCode = "PROVIDER_RATE_LIMITED";
    } else if (statusCode >= 500) {
      normalizedCode = "PROVIDER_UNAVAILABLE";
    }

    return {
      code: normalizedCode,
      message: "AWS Bedrock upstream request failed.",
      statusCode,
      retryable: statusCode === 429 || statusCode >= 500,
      provider: this.provider,
    };
  }
}
