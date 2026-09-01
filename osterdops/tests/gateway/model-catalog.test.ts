/**
 * OsterdOps — Model Capability Catalog & Parameter Validation Test Suite (Phase 22)
 */

import {
  getModelCapabilities,
  isModelSupported,
  validateModelRequest,
  getAllSupportedModels,
} from "@/lib/adapters/models";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export async function runModelCatalogTests(): Promise<void> {
  console.log("▶ Running Model Capabilities Catalog & Validation Tests...");

  // 1. Model Lookup & Capabilities
  const gpt4oCap = getModelCapabilities("gpt-4o");
  assert(gpt4oCap !== null, "gpt-4o capabilities found");
  assert(gpt4oCap?.provider === "openai", "gpt-4o provider is openai");
  assert(gpt4oCap?.contextWindow === 128000, "gpt-4o context window is 128k");
  assert(gpt4oCap?.supportsStreaming === true, "gpt-4o supports streaming");
  assert(gpt4oCap?.supportsVision === true, "gpt-4o supports vision");
  assert(gpt4oCap?.supportsPromptCaching === true, "gpt-4o supports prompt caching");

  const o1Cap = getModelCapabilities("o1");
  assert(o1Cap?.supportsReasoning === true, "o1 supports reasoning tokens");

  const claudeCap = getModelCapabilities("claude-3-5-sonnet-20241022");
  assert(claudeCap !== null, "claude-3-5-sonnet snapshot capabilities found");
  assert(claudeCap?.contextWindow === 200000, "Claude context window is 200k");

  const geminiCap = getModelCapabilities("gemini-1.5-pro");
  assert(geminiCap !== null, "gemini-1.5-pro capabilities found");
  assert(geminiCap?.contextWindow === 2000000, "Gemini 1.5 Pro context window is 2M tokens");

  assert(isModelSupported("gpt-4o-mini"), "isModelSupported returns true for gpt-4o-mini");
  assert(isModelSupported("claude-3-5-haiku"), "isModelSupported returns true for claude-3-5-haiku");
  assert(!isModelSupported("totally-fake-unsupported-model-xyz"), "isModelSupported returns false for unknown model");

  // 2. Request Parameter Validation
  const validReq = validateModelRequest("gpt-4o", { maxTokens: 4000, temperature: 0.7, stream: true });
  assert(validReq.valid, "Valid parameters pass validation");

  const invalidTokensReq = validateModelRequest("gpt-4o", { maxTokens: 50000 });
  assert(!invalidTokensReq.valid, "max_tokens exceeding limit fails validation");
  assert(invalidTokensReq.error?.includes("exceeds model limit"), "Error specifies token limit");

  const invalidTempReq = validateModelRequest("gpt-4o", { temperature: 3.5 });
  assert(!invalidTempReq.valid, "temperature > 2.0 fails validation");

  const negativeTempReq = validateModelRequest("gpt-4o", { temperature: -0.5 });
  assert(!negativeTempReq.valid, "negative temperature fails validation");

  // 3. Catalog Inventory
  const allModels = getAllSupportedModels();
  assert(allModels.length >= 10, "At least 10 official models registered in capabilities catalog");

  console.log("✔ Model Capabilities Catalog & Validation Tests passed.");
}
