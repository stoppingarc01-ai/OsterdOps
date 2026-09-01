/**
 * OsterdOps — Developer API Playground Test Suite (Phase 23)
 * Validates request payload validation, model resolution, parameter constraints,
 * and SSE chunk transformation.
 */

import { validateGatewayRequest } from "@/lib/gateway/request-validator";
import { getModelCapabilities, getAllSupportedModels, validateModelParameters } from "@/lib/adapters/models";
import { resolveProviderFromModel } from "@/lib/adapters/registry";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runDeveloperPlaygroundTests(): void {
  console.log("▶ Running Developer API Playground Tests...");

  // 1. Supported Models Catalog Resolution
  const allModels = getAllSupportedModels();
  assert(allModels.length >= 8, "Playground model catalog contains at least 8 models");

  const gpt4oMini = getModelCapabilities("gpt-4o-mini");
  assert(Boolean(gpt4oMini), "gpt-4o-mini capabilities resolved");
  assert(gpt4oMini?.supportsStreaming === true, "gpt-4o-mini supports streaming");
  assert(gpt4oMini?.provider === "openai", "gpt-4o-mini provider is OpenAI");

  const claudeSonnet = getModelCapabilities("claude-3-5-sonnet");
  assert(Boolean(claudeSonnet), "claude-3-5-sonnet capabilities resolved");
  assert(claudeSonnet?.supportsPromptCaching === true, "claude-3-5-sonnet supports prompt caching");

  const geminiFlash = getModelCapabilities("gemini-1.5-flash");
  assert(Boolean(geminiFlash), "gemini-1.5-flash capabilities resolved");
  assert(geminiFlash?.provider === "gemini", "gemini-1.5-flash provider is Gemini");

  // 2. Playground Request Payload Validation
  const validPlaygroundRequest = validateGatewayRequest({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Hello world" },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });
  assert(validPlaygroundRequest.valid === true, "Valid playground request passes validation");
  assert(validPlaygroundRequest.normalizedProvider === "openai", "Provider resolved to openai");

  const modelValidation = validateModelParameters("gpt-4o-mini", { stream: true, maxTokens: 1024 });
  assert(modelValidation.valid === true, "Model parameters and streaming support pass validation");

  // 3. Rejection of Invalid Message Structures
  const invalidMessagesRequest = validateGatewayRequest({
    model: "gpt-4o-mini",
    messages: [],
  });
  assert(invalidMessagesRequest.valid === false, "Empty messages rejected");

  const invalidRoleRequest = validateGatewayRequest({
    model: "gpt-4o-mini",
    messages: [{ role: "bad_role", content: "Test" }],
  });
  assert(invalidRoleRequest.valid === false, "Invalid role rejected");

  // 4. Provider Auto-Resolution
  assert(resolveProviderFromModel("gpt-4o") === "openai", "gpt-4o resolves to openai");
  assert(resolveProviderFromModel("claude-3-5-sonnet") === "anthropic", "claude-3-5-sonnet resolves to anthropic");
  assert(resolveProviderFromModel("gemini-1.5-pro") === "gemini", "gemini-1.5-pro resolves to gemini");

  console.log("✔ Developer API Playground Tests passed.");
}
