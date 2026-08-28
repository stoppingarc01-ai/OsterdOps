/**
 * OsterdOps — Google Gemini Provider Adapter
 */

import type {
  AIProviderAdapter,
  GatewayChatRequest,
  GatewayChatResponse,
  NormalizedProviderError,
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

  formatRequest(
    request: GatewayChatRequest,
    credentials: ProviderCredentials
  ): { url: string; headers: Record<string, string>; body: string } {
    const baseUrl =
      credentials.baseUrl || "https://generativelanguage.googleapis.com/v1beta";
    const cleanModel = request.model.replace(/^models\//, "");
    const url = `${baseUrl.replace(/\/+$/, "")}/models/${cleanModel}:generateContent?key=${credentials.apiKey}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    let systemInstructionText: string | undefined;
    const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

    for (const msg of request.messages) {
      if (msg.role === "system" || msg.role === "developer") {
        systemInstructionText = systemInstructionText
          ? `${systemInstructionText}\n\n${msg.content}`
          : msg.content;
      } else {
        const role = msg.role === "assistant" ? "model" : "user";
        contents.push({
          role,
          parts: [{ text: msg.content }],
        });
      }
    }

    if (contents.length === 0) {
      contents.push({ role: "user", parts: [{ text: "Hello" }] });
    }

    const payload: {
      contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }>;
      generationConfig: {
        temperature?: number;
        maxOutputTokens?: number;
        topP?: number;
        stopSequences?: string | string[];
      };
      systemInstruction?: {
        parts: Array<{ text: string }>;
      };
    } = {
      contents,
      generationConfig: {
        temperature: request.temperature,
        maxOutputTokens: request.max_tokens,
        topP: request.top_p,
        stopSequences: typeof request.stop === "string" ? [request.stop] : request.stop,
      },
    };

    if (systemInstructionText) {
      payload.systemInstruction = {
        parts: [{ text: systemInstructionText }],
      };
    }

    return {
      url,
      headers,
      body: JSON.stringify(payload),
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

  extractUsage(responseBody: unknown): TokenUsageBreakdown {
    const body = responseBody as GeminiResponseBody;
    const metadata = body?.usageMetadata || {};

    const inputTokens = Number(metadata.promptTokenCount) || 0;
    const outputTokens = Number(metadata.candidatesTokenCount) || 0;
    const totalTokens = Number(metadata.totalTokenCount) || inputTokens + outputTokens;
    const cachedTokens = Number(metadata.cachedContentTokenCount) || 0;

    return {
      inputTokens,
      outputTokens,
      totalTokens,
      cachedTokens,
    };
  }

  normalizeResponse(responseBody: unknown, model: string): GatewayChatResponse {
    const body = responseBody as GeminiResponseBody;
    const candidate = body?.candidates?.[0];

    let content = "";
    if (candidate?.content?.parts && Array.isArray(candidate.content.parts)) {
      content = candidate.content.parts.map((p: GeminiPart) => p.text || "").join("");
    }

    const inputTokens = Number(body?.usageMetadata?.promptTokenCount) || 0;
    const outputTokens = Number(body?.usageMetadata?.candidatesTokenCount) || 0;
    const cachedTokens = Number(body?.usageMetadata?.cachedContentTokenCount) || 0;

    return {
      id: `gemini-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content,
          },
          finish_reason: candidate?.finishReason === "STOP" ? "stop" : "stop",
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
    const err = rawError as GeminiResponseBody;
    const errObj = err?.error;

    const message = errObj?.message || "Google Gemini upstream request failed.";
    const code = errObj?.status || `GEMINI_HTTP_${statusCode}`;

    return {
      code,
      message,
      statusCode,
      retryable: statusCode === 429 || statusCode >= 500,
      provider: this.provider,
    };
  }
}
