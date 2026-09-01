/**
 * OsterdOps — Azure OpenAI Provider Adapter
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
import { OpenAIAdapter } from "./openai.adapter";

export class AzureAdapter implements AIProviderAdapter {
  readonly provider = "azure" as const;
  private readonly openAiDelegate = new OpenAIAdapter();

  async validateCredentials(
    credentials: ProviderCredentials
  ): Promise<{ valid: boolean; error?: string }> {
    if (!credentials.apiKey) {
      return { valid: false, error: "API key is required" };
    }
    if (!credentials.baseUrl) {
      return { valid: false, error: "Azure OpenAI endpoint URL is required" };
    }

    try {
      const url = `${credentials.baseUrl.replace(/\/+$/, "")}/openai/models?api-version=2024-02-01`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "api-key": credentials.apiKey,
        },
      });

      if (res.ok) {
        return { valid: true };
      }

      if (res.status === 401 || res.status === 403) {
        return { valid: false, error: "INVALID_CREDENTIALS: Invalid Azure OpenAI API key or unauthorized." };
      }

      return { valid: false, error: `VALIDATION_FAILED: Azure OpenAI responded with HTTP ${res.status}.` };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      return { valid: false, error: `PROVIDER_UNAVAILABLE: ${msg}` };
    }
  }

  formatRequest(
    request: GatewayChatRequest,
    credentials: ProviderCredentials
  ): { url: string; headers: Record<string, string>; body: string } {
    const baseUrl = credentials.baseUrl || "https://eastus.api.cognitive.microsoft.com";
    const deployment = request.model;
    const url = `${baseUrl.replace(/\/+$/, "")}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-01`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "api-key": credentials.apiKey,
    };

    const body = JSON.stringify({
      messages: request.messages,
      temperature: request.temperature,
      max_tokens: request.max_tokens,
      top_p: request.top_p,
    });

    return { url, headers, body };
  }

  async executeRequest(
    formatted: { url: string; headers: Record<string, string>; body: string },
    timeoutMs?: number
  ): Promise<{ rawResponse: Response; responseBody: unknown; latencyMs: number }> {
    return this.openAiDelegate.executeRequest(formatted, timeoutMs);
  }

  extractUsage(responseBody: unknown): TokenUsageBreakdown {
    return this.openAiDelegate.extractUsage(responseBody);
  }

  normalizeResponse(responseBody: unknown, model: string): GatewayChatResponse {
    return this.openAiDelegate.normalizeResponse(responseBody, model);
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
      message: "Azure OpenAI upstream request failed.",
      statusCode,
      retryable: statusCode === 429 || statusCode >= 500,
      provider: this.provider,
    };
  }
}
