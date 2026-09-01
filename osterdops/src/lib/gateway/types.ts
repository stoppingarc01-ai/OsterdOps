/**
 * OsterdOps — AI Gateway Interfaces & Data Models
 */

import type { AIProvider } from "@/types";

export interface GatewayChatMessage {
  role: "system" | "user" | "assistant" | "tool" | "developer";
  content: string;
  name?: string;
}

export interface GatewayRequestPayload {
  provider?: string;
  model: string;
  messages: GatewayChatMessage[];
  temperature?: number;
  maxTokens?: number;
  max_tokens?: number;
  topP?: number;
  top_p?: number;
  stream?: boolean;
  system?: string;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string | string[];
  [key: string]: unknown;
}

export interface GatewayTokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cachedTokens?: number;
  reasoningTokens?: number;
}

export interface GatewayResponsePayload {
  id: string;
  provider: AIProvider;
  model: string;
  output: {
    role: "assistant";
    content: string;
  };
  usage: GatewayTokenUsage | null;
  finishReason: string;
  latencyMs: number;
}

export interface GatewayRequestContext {
  requestId: string;
  organizationId: string;
  projectId: string;
  keyId: string;
  startTime: number;
}

export type GatewayErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "BAD_REQUEST"
  | "RATE_LIMITED"
  | "BUDGET_EXCEEDED"
  | "NOT_FOUND"
  | "INVALID_CREDENTIALS"
  | "PROVIDER_AUTHENTICATION_FAILED"
  | "PROVIDER_RATE_LIMITED"
  | "PROVIDER_TIMEOUT"
  | "PROVIDER_BAD_REQUEST"
  | "PROVIDER_MODEL_NOT_FOUND"
  | "PROVIDER_UNAVAILABLE"
  | "PROVIDER_INTERNAL_ERROR"
  | "PROVIDER_STREAM_ERROR"
  | "MODEL_NOT_FOUND"
  | "TIMEOUT"
  | "CIRCUIT_BREAKER_OPEN"
  | "UNSUPPORTED_PROVIDER"
  | "PROVIDER_ERROR";
