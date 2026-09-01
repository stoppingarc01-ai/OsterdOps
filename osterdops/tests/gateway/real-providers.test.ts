/**
 * OsterdOps — Real AI Provider Adapters Test Suite (Phase 22)
 */

import { OpenAIAdapter } from "@/lib/adapters/openai.adapter";
import { AnthropicAdapter } from "@/lib/adapters/anthropic.adapter";
import { GeminiAdapter } from "@/lib/adapters/gemini.adapter";
import { getProviderAdapter, resolveProviderFromModel } from "@/lib/adapters/registry";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export async function runRealProvidersTests(): Promise<void> {
  console.log("▶ Running Real AI Provider Adapter Tests...");

  // 1. Registry Resolution
  const openaiAdapter = getProviderAdapter("openai");
  const anthropicAdapter = getProviderAdapter("anthropic");
  const geminiAdapter = getProviderAdapter("gemini");

  assert(openaiAdapter instanceof OpenAIAdapter, "OpenAI adapter must be registered.");
  assert(anthropicAdapter instanceof AnthropicAdapter, "Anthropic adapter must be registered.");
  assert(geminiAdapter instanceof GeminiAdapter, "Gemini adapter must be registered.");

  assert(resolveProviderFromModel("gpt-4o") === "openai", "gpt-4o resolves to openai");
  assert(resolveProviderFromModel("o3-mini") === "openai", "o3-mini resolves to openai");
  assert(resolveProviderFromModel("claude-3-5-sonnet") === "anthropic", "claude resolves to anthropic");
  assert(resolveProviderFromModel("gemini-1.5-flash") === "gemini", "gemini resolves to gemini");

  // 2. OpenAI Request Formatting & Usage Extraction
  const openaiFormatted = openaiAdapter.formatRequest(
    {
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are helpful." },
        { role: "user", content: "Hi" },
      ],
      temperature: 0.7,
      max_tokens: 100,
    },
    { apiKey: "sk-test-key-123" }
  );

  assert(openaiFormatted.url === "https://api.openai.com/v1/chat/completions", "OpenAI URL is correct");
  assert(openaiFormatted.headers["Authorization"] === "Bearer sk-test-key-123", "Authorization header is set");
  const parsedOpenAIBody = JSON.parse(openaiFormatted.body);
  assert(parsedOpenAIBody.model === "gpt-4o", "Model is set in body");
  assert(parsedOpenAIBody.temperature === 0.7, "Temperature is formatted");

  // OpenAI reasoning model formatting (max_completion_tokens)
  const o1Formatted = openaiAdapter.formatRequest(
    {
      model: "o1-mini",
      messages: [{ role: "user", content: "Math problem" }],
      max_tokens: 200,
    },
    { apiKey: "sk-test-key-123" }
  );
  const parsedO1Body = JSON.parse(o1Formatted.body);
  assert(parsedO1Body.max_completion_tokens === 200, "o1 models format max_completion_tokens");
  assert(parsedO1Body.temperature === undefined, "o1 models omit unsupported temperature");

  // OpenAI Response Normalization & Usage
  const mockOpenAIResponse = {
    id: "chatcmpl-test-99",
    created: 1788188500,
    model: "gpt-4o",
    choices: [
      {
        index: 0,
        message: { role: "assistant", content: "Hello world!" },
        finish_reason: "stop",
      },
    ],
    usage: {
      prompt_tokens: 15,
      completion_tokens: 5,
      total_tokens: 20,
      prompt_tokens_details: { cached_tokens: 8 },
      completion_tokens_details: { reasoning_tokens: 0 },
    },
  };

  const normalizedOpenAI = openaiAdapter.normalizeResponse(mockOpenAIResponse, "gpt-4o");
  assert(normalizedOpenAI.id === "chatcmpl-test-99", "Normalized ID matches");
  assert(normalizedOpenAI.choices[0].message.content === "Hello world!", "Normalized content matches");
  const openaiUsage = openaiAdapter.extractUsage(mockOpenAIResponse);
  assert(openaiUsage.inputTokens === 15, "Input tokens extracted");
  assert(openaiUsage.outputTokens === 5, "Output tokens extracted");
  assert(openaiUsage.cachedTokens === 8, "Cached tokens extracted");

  // OpenAI Error Normalization
  const openaiAuthErr = openaiAdapter.handleProviderError(401, { error: { message: "Incorrect API key", code: "invalid_api_key" } });
  assert(openaiAuthErr.code === "INVALID_CREDENTIALS", "401 maps to INVALID_CREDENTIALS");
  assert(!openaiAuthErr.retryable, "Auth error is not retryable");

  const openai429Err = openaiAdapter.handleProviderError(429, { error: { message: "Rate limit reached", code: "rate_limit_exceeded" } });
  assert(openai429Err.code === "PROVIDER_RATE_LIMITED", "429 maps to PROVIDER_RATE_LIMITED");
  assert(openai429Err.retryable, "Rate limit error is retryable");

  // 3. Anthropic Request Formatting & System Prompt Separation
  const anthropicFormatted = anthropicAdapter.formatRequest(
    {
      model: "claude-3-5-sonnet",
      messages: [
        { role: "system", content: "System prompt instructions" },
        { role: "user", content: "User question" },
      ],
      temperature: 0.5,
      max_tokens: 500,
    },
    { apiKey: "sk-ant-test-key-123" }
  );

  assert(anthropicFormatted.url === "https://api.anthropic.com/v1/messages", "Anthropic messages URL");
  assert(anthropicFormatted.headers["x-api-key"] === "sk-ant-test-key-123", "x-api-key header set");
  const parsedAnthropicBody = JSON.parse(anthropicFormatted.body);
  assert(parsedAnthropicBody.system === "System prompt instructions", "System prompt extracted to top level");
  assert(parsedAnthropicBody.messages.length === 1, "System prompt removed from messages array");
  assert(parsedAnthropicBody.messages[0].role === "user", "User role preserved");

  // Anthropic Response & Usage
  const mockAnthropicResponse = {
    id: "msg_test_88",
    model: "claude-3-5-sonnet",
    content: [{ type: "text", text: "Claude response" }],
    stop_reason: "end_turn",
    usage: {
      input_tokens: 30,
      output_tokens: 12,
      cache_read_input_tokens: 10,
    },
  };

  const normalizedAnthropic = anthropicAdapter.normalizeResponse(mockAnthropicResponse, "claude-3-5-sonnet");
  assert(normalizedAnthropic.choices[0].message.content === "Claude response", "Anthropic content normalized");
  assert(normalizedAnthropic.choices[0].finish_reason === "stop", "end_turn mapped to stop");
  const anthropicUsage = anthropicAdapter.extractUsage(mockAnthropicResponse);
  assert(anthropicUsage.inputTokens === 30, "Anthropic input tokens extracted");
  assert(anthropicUsage.cachedTokens === 10, "Anthropic cache tokens extracted");

  // 4. Gemini Request Formatting & System Instruction
  const geminiFormatted = geminiAdapter.formatRequest(
    {
      model: "gemini-1.5-flash",
      messages: [
        { role: "system", content: "Gemini system directive" },
        { role: "user", content: "Gemini user query" },
      ],
      temperature: 0.2,
      max_tokens: 256,
    },
    { apiKey: "AIzaTestKey123" }
  );

  assert(geminiFormatted.url.includes("models/gemini-1.5-flash:generateContent"), "Gemini generateContent URL");
  const parsedGeminiBody = JSON.parse(geminiFormatted.body);
  assert(parsedGeminiBody.systemInstruction.parts[0].text === "Gemini system directive", "System instruction parsed");
  assert(parsedGeminiBody.contents[0].role === "user", "Contents role mapped");
  assert(parsedGeminiBody.generationConfig.temperature === 0.2, "Gemini generationConfig formatted");

  // Gemini Response & Usage
  const mockGeminiResponse = {
    candidates: [
      {
        content: {
          parts: [{ text: "Gemini answer" }],
          role: "model",
        },
        finishReason: "STOP",
      },
    ],
    usageMetadata: {
      promptTokenCount: 25,
      candidatesTokenCount: 8,
      totalTokenCount: 33,
      cachedContentTokenCount: 5,
    },
  };

  const normalizedGemini = geminiAdapter.normalizeResponse(mockGeminiResponse, "gemini-1.5-flash");
  assert(normalizedGemini.choices[0].message.content === "Gemini answer", "Gemini content normalized");
  const geminiUsage = geminiAdapter.extractUsage(mockGeminiResponse);
  assert(geminiUsage.inputTokens === 25, "Gemini input tokens extracted");
  assert(geminiUsage.outputTokens === 8, "Gemini output tokens extracted");
  assert(geminiUsage.cachedTokens === 5, "Gemini cached tokens extracted");

  console.log("✔ Real AI Provider Adapter Tests passed.");
}
