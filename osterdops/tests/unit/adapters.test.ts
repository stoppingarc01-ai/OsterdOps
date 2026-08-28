/**
 * OsterdOps — AI Provider Adapters Unit Tests
 */

import { resolveProviderFromModel, getProviderAdapter } from "@/lib/adapters/registry";
import type { GatewayChatRequest } from "@/lib/adapters/types";

export function testProviderAdapters() {
  const sampleRequest: GatewayChatRequest = {
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are a helpful cost governance assistant." },
      { role: "user", content: "What is OsterdOps?" },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  };

  // 1. Provider Resolution from Model
  if (resolveProviderFromModel("gpt-4o") !== "openai") throw new Error("gpt-4o must resolve to openai");
  if (resolveProviderFromModel("o3-mini") !== "openai") throw new Error("o3-mini must resolve to openai");
  if (resolveProviderFromModel("claude-3-5-sonnet-20241022") !== "anthropic") {
    throw new Error("claude-3-5-sonnet must resolve to anthropic");
  }
  if (resolveProviderFromModel("gemini-1.5-pro") !== "gemini") {
    throw new Error("gemini-1.5-pro must resolve to gemini");
  }

  // 2. OpenAI Adapter
  const openaiAdapter = getProviderAdapter("openai");
  const openaiFormatted = openaiAdapter.formatRequest(sampleRequest, { apiKey: "sk-mock-key" });
  if (!openaiFormatted.url.endsWith("/chat/completions")) {
    throw new Error("OpenAI URL must target /chat/completions");
  }
  if (openaiFormatted.headers.Authorization !== "Bearer sk-mock-key") {
    throw new Error("OpenAI authorization header missing or malformed");
  }

  const mockOpenAIResponse = {
    id: "chatcmpl-123",
    object: "chat.completion",
    created: 1700000000,
    model: "gpt-4o",
    choices: [
      {
        index: 0,
        message: { role: "assistant", content: "OsterdOps is an AI governance platform." },
        finish_reason: "stop",
      },
    ],
    usage: {
      prompt_tokens: 25,
      completion_tokens: 15,
      total_tokens: 40,
    },
  };
  const openaiUsage = openaiAdapter.extractUsage(mockOpenAIResponse);
  if (openaiUsage.inputTokens !== 25 || openaiUsage.outputTokens !== 15 || openaiUsage.totalTokens !== 40) {
    throw new Error("OpenAI usage extraction mismatch");
  }

  // 3. Anthropic Adapter
  const anthropicAdapter = getProviderAdapter("anthropic");
  const anthropicFormatted = anthropicAdapter.formatRequest(
    { ...sampleRequest, model: "claude-3-5-sonnet-20241022" },
    { apiKey: "sk-ant-mock-key" }
  );
  if (!anthropicFormatted.url.endsWith("/messages")) {
    throw new Error("Anthropic URL must target /messages");
  }
  if (anthropicFormatted.headers["x-api-key"] !== "sk-ant-mock-key") {
    throw new Error("Anthropic x-api-key header missing");
  }
  const anthropicParsedBody = JSON.parse(anthropicFormatted.body);
  if (anthropicParsedBody.system !== "You are a helpful cost governance assistant.") {
    throw new Error("Anthropic adapter failed to extract system prompt");
  }
  if (anthropicParsedBody.messages.length !== 1 || anthropicParsedBody.messages[0].role !== "user") {
    throw new Error("Anthropic adapter conversational turns transformation failed");
  }

  const mockAnthropicResponse = {
    id: "msg_123",
    type: "message",
    role: "assistant",
    model: "claude-3-5-sonnet-20241022",
    content: [{ type: "text", text: "OsterdOps provides AI cost governance." }],
    stop_reason: "end_turn",
    usage: {
      input_tokens: 30,
      output_tokens: 20,
      cache_read_input_tokens: 10,
    },
  };
  const anthropicUsage = anthropicAdapter.extractUsage(mockAnthropicResponse);
  if (anthropicUsage.inputTokens !== 30 || anthropicUsage.cachedTokens !== 10) {
    throw new Error("Anthropic usage extraction mismatch");
  }
  const normalizedAnthropic = anthropicAdapter.normalizeResponse(mockAnthropicResponse, "claude-3-5-sonnet");
  if (normalizedAnthropic.choices[0].message.content !== "OsterdOps provides AI cost governance.") {
    throw new Error("Anthropic normalized response content mismatch");
  }

  // 4. Gemini Adapter
  const geminiAdapter = getProviderAdapter("gemini");
  const geminiFormatted = geminiAdapter.formatRequest(
    { ...sampleRequest, model: "gemini-1.5-flash" },
    { apiKey: "gemini-mock-key" }
  );
  if (!geminiFormatted.url.includes(":generateContent?key=gemini-mock-key")) {
    throw new Error("Gemini URL query key parameter missing");
  }
  const geminiParsedBody = JSON.parse(geminiFormatted.body);
  if (!geminiParsedBody.systemInstruction) {
    throw new Error("Gemini systemInstruction missing");
  }

  const mockGeminiResponse = {
    candidates: [
      {
        content: {
          parts: [{ text: "OsterdOps optimizes AI spend." }],
          role: "model",
        },
        finishReason: "STOP",
      },
    ],
    usageMetadata: {
      promptTokenCount: 18,
      candidatesTokenCount: 12,
      totalTokenCount: 30,
    },
  };
  const geminiUsage = geminiAdapter.extractUsage(mockGeminiResponse);
  if (geminiUsage.inputTokens !== 18 || geminiUsage.outputTokens !== 12) {
    throw new Error("Gemini usage extraction mismatch");
  }
  const normalizedGemini = geminiAdapter.normalizeResponse(mockGeminiResponse, "gemini-1.5-flash");
  if (normalizedGemini.choices[0].message.content !== "OsterdOps optimizes AI spend.") {
    throw new Error("Gemini normalized response content mismatch");
  }

  return true;
}
