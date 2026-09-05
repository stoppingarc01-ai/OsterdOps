/**
 * OsterdOps — AI Gateway Request Payload Validator
 * Enforces structural integrity, valid model/message arrays, and unsupported feature guards.
 */

import { isSupportedProvider, resolveProviderFromModel } from "@/lib/adapters/registry";
import type { GatewayRequestPayload, GatewayChatMessage } from "./types";
import type { AIProvider } from "@/types";

export interface ValidationResult {
  valid: boolean;
  error?: string;
  normalizedProvider?: AIProvider;
}

const VALID_ROLES = new Set(["system", "user", "assistant", "tool", "developer"]);

/**
 * Validates an incoming customer AI Gateway request payload.
 */
export function validateGatewayRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { valid: false, error: "Request body must be a valid JSON object." };
  }

  const payload = body as Partial<GatewayRequestPayload>;

  // 1. Validate Model
  if (!payload.model || typeof payload.model !== "string" || !payload.model.trim()) {
    return { valid: false, error: "Field 'model' is required and must be a non-empty string." };
  }

  // 2. Validate Messages
  if (!Array.isArray(payload.messages) || payload.messages.length === 0) {
    return { valid: false, error: "Field 'messages' must be a non-empty array of message objects." };
  }

  for (let i = 0; i < payload.messages.length; i++) {
    const msg = payload.messages[i] as Partial<GatewayChatMessage>;
    if (!msg || typeof msg !== "object") {
      return { valid: false, error: `Message at index ${i} is not a valid object.` };
    }

    if (!msg.role || typeof msg.role !== "string" || !VALID_ROLES.has(msg.role.toLowerCase())) {
      return {
        valid: false,
        error: `Message at index ${i} has invalid role '${msg.role}'. Valid roles: system, user, assistant, tool, developer.`,
      };
    }

    if (typeof msg.content !== "string") {
      return { valid: false, error: `Message at index ${i} must contain a string 'content' field.` };
    }
  }

  // 3. Streaming Validation
  if (payload.stream !== undefined && typeof payload.stream !== "boolean") {
    return { valid: false, error: "Field 'stream' must be a boolean." };
  }

  // 4. Validate Provider Resolution
  let provider: AIProvider;
  if (payload.provider && typeof payload.provider === "string" && payload.provider.trim()) {
    const raw = payload.provider.trim().toLowerCase();
    if (!isSupportedProvider(raw)) {
      return {
        valid: false,
        error: `Unsupported provider '${payload.provider}'. Supported providers: openai, anthropic, gemini, azure, bedrock.`,
      };
    }
    provider = raw as AIProvider;
  } else {
    // Inferred from model
    provider = resolveProviderFromModel(payload.model.trim());
  }

  return {
    valid: true,
    normalizedProvider: provider,
  };
}
