/**
 * OsterdOps — AI Gateway Core Request Router (Phase 22)
 * Production-grade orchestration for real AI providers:
 * - API Key Authentication & RBAC validation
 * - Sliding-window rate limiting with multi-tenant quota isolation
 * - Hard budget pre-flight enforcement (HTTP 429)
 * - Model capability validation
 * - Server-side credential resolution & AES-256-GCM decryption
 * - Upstream HTTP execution with jittered exponential retries & deadline timeouts
 * - Server-Sent Events (SSE) streaming & non-streaming response normalization
 * - Real usage extraction & Cost Engine integration
 * - Non-blocking telemetry & durable usage persistence with zero prompt/completion storage
 */

import "server-only";
import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/services/api-key.service";
import { rateLimit } from "@/lib/rate-limit";
import { resolveProviderCredentials } from "@/lib/services/provider-connection.service";
import { getProviderAdapter, resolveProviderFromModel } from "@/lib/adapters/registry";
import { validateModelRequest } from "@/lib/adapters/models";
import { recordGatewayUsage } from "@/lib/services/usage.service";
import { checkBudgetEnforcement, evaluateBudgetsAfterSpend } from "@/lib/services/budget.service";
import { invalidateBudgetPreflightCache } from "@/lib/cache/registry";
import { recordAuditLog } from "@/lib/services/audit.service";
import { validateGatewayRequest } from "./request-validator";
import { createGatewayErrorResponse, normalizeGatewayError } from "./errors";
import { recordGatewayTelemetry } from "./telemetry";
import { createGatewayStreamResponse } from "./stream";
import { executeProviderHttpWithRetry } from "./retry-client";
import { getProviderCircuitBreaker, evaluateGovernanceRules } from "./circuit-breaker";
import { calculateRequestCost } from "@/lib/cost/calculator";
import type {
  GatewayRequestPayload,
  GatewayResponsePayload,
  GatewayTokenUsage,
} from "./types";
import type { AIProvider } from "@/types";

const DEFAULT_TIMEOUT_MS = 60000; // 60s timeout

/**
 * Main handler for the OsterdOps AI Gateway Chat Completions proxy.
 */
export async function routeGatewayChatRequest(request: Request): Promise<Response> {
  const startTime = Date.now();

  // 1. Correlation Request ID Resolution
  const customReqId =
    request.headers.get("x-osterdops-request-id") ||
    request.headers.get("x-request-id");
  const requestId =
    customReqId && /^[a-zA-Z0-9_-]{8,64}$/.test(customReqId)
      ? customReqId
      : `gw_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  const responseHeaders: Record<string, string> = {
    "x-osterdops-request-id": requestId,
    "x-request-id": requestId,
  };

  // 2. Authenticate OsterdOps Project API Key
  const authResult = await authenticateApiKey(request);
  if (!authResult.authenticated || !authResult.key || !authResult.project || !authResult.organization) {
    recordGatewayTelemetry({
      requestId,
      organizationId: "unknown",
      projectId: "unknown",
      keyId: "unknown",
      provider: "openai",
      model: "unknown",
      status: "error",
      httpStatus: 401,
      durationMs: Date.now() - startTime,
      errorCode: "UNAUTHORIZED",
      timestamp: new Date().toISOString(),
    });

    return createGatewayErrorResponse(
      {
        code: "UNAUTHORIZED",
        message: "Invalid, revoked, or expired OsterdOps API key.",
        statusCode: 401,
        retryable: false,
      },
      responseHeaders
    );
  }

  const { key, project, organization } = authResult;

  // 3. Sliding Window Rate Limiting
  const rateLimitResult = rateLimit(key.id, 120, 60000);
  responseHeaders["x-ratelimit-remaining"] = String(rateLimitResult.remaining);
  responseHeaders["x-ratelimit-reset"] = String(rateLimitResult.resetMs);

  if (!rateLimitResult.allowed) {
    const durationMs = Date.now() - startTime;
    recordGatewayTelemetry({
      requestId,
      organizationId: organization.id,
      projectId: project.id,
      keyId: key.id,
      provider: "openai",
      model: "unknown",
      status: "rate_limited",
      httpStatus: 429,
      durationMs,
      errorCode: "RATE_LIMITED",
      timestamp: new Date().toISOString(),
    });

    recordGatewayUsage({
      requestId,
      organizationId: organization.id,
      projectId: project.id,
      apiKeyId: key.id,
      provider: "openai",
      model: "unknown",
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      latencyMs: durationMs,
      statusCode: 429,
      status: "RATE_LIMITED",
      errorCode: "RATE_LIMITED",
    }).catch((err) => console.error("[OsterdOps UsageRecorder] Failed to persist rate-limit usage record:", err));

    return createGatewayErrorResponse(
      {
        code: "RATE_LIMITED",
        message: "OsterdOps API key request rate limit exceeded. Please retry after window resets.",
        statusCode: 429,
        retryable: true,
      },
      responseHeaders
    );
  }

  // 4. Hard Budget Enforcement Pre-Flight Check (Phase 12)
  const isBudgetBreachSimulated = request.headers.get("x-osterdops-simulate-budget-breach") === "true";
  const budgetEnforcement = isBudgetBreachSimulated
    ? {
        allowed: false,
        reason: "Monthly budget spending limit ($0.05) exceeded for project 'prj_simulator'. Request blocked under HARD enforcement policy.",
        budgetId: "budget_sim_cap",
        limitUsd: 0.05,
        currentSpendUsd: 0.06,
        enforcement: "HARD" as const,
      }
    : await checkBudgetEnforcement(organization.id, project.id);

  if (!budgetEnforcement.allowed) {
    const durationMs = Date.now() - startTime;
    recordGatewayTelemetry({
      requestId,
      organizationId: organization.id,
      projectId: project.id,
      keyId: key.id,
      provider: "openai",
      model: "unknown",
      status: "error",
      httpStatus: 429,
      durationMs,
      errorCode: "BUDGET_EXCEEDED",
      timestamp: new Date().toISOString(),
    });

    recordAuditLog({
      organizationId: organization.id,
      actorId: key.id,
      action: "BUDGET_REQUEST_BLOCKED",
      resourceType: "budget",
      resourceId: budgetEnforcement.budgetId || "unknown",
      details: {
        projectId: project.id,
        reason: budgetEnforcement.reason,
        limitUsd: budgetEnforcement.limitUsd,
        currentSpendUsd: budgetEnforcement.currentSpendUsd,
      },
    }).catch((err) => console.error("[OsterdOps Gateway] Failed to record budget blocked audit log:", err));

    return createGatewayErrorResponse(
      {
        code: "BUDGET_EXCEEDED",
        message: budgetEnforcement.reason || "Monthly budget spending limit exceeded. Request blocked under HARD enforcement.",
        statusCode: 429,
        retryable: false,
      },
      responseHeaders
    );
  }

  // 5. Parse & Validate JSON Payload
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return createGatewayErrorResponse(
      {
        code: "BAD_REQUEST",
        message: "Invalid JSON request body.",
        statusCode: 400,
        retryable: false,
      },
      responseHeaders
    );
  }

  const validation = validateGatewayRequest(rawBody);
  if (!validation.valid || !validation.normalizedProvider) {
    recordGatewayTelemetry({
      requestId,
      organizationId: organization.id,
      projectId: project.id,
      keyId: key.id,
      provider: "openai",
      model: "unknown",
      status: "error",
      httpStatus: 400,
      durationMs: Date.now() - startTime,
      errorCode: "BAD_REQUEST",
      timestamp: new Date().toISOString(),
    });

    return createGatewayErrorResponse(
      {
        code: "BAD_REQUEST",
        message: validation.error || "Invalid request payload.",
        statusCode: 400,
        retryable: false,
      },
      responseHeaders
    );
  }

  const payload = rawBody as GatewayRequestPayload;

  // 5b. Active FinOps Governance & Circuit Breaker Pre-Flight Check (< 5ms SLA)
  const governanceVerdict = await evaluateGovernanceRules({
    organizationId: organization.id,
    projectId: project.id,
    apiKeyId: key.id,
    model: payload.model,
    messages: payload.messages || [],
    project,
    organization,
    key,
  });

  if (governanceVerdict.action === "BLOCK") {
    const isLoop = governanceVerdict.code === "BLOCKED_RUNAWAY_LOOP";
    const httpStatus = isLoop ? 429 : 402;
    const durationMs = Date.now() - startTime;

    recordGatewayTelemetry({
      requestId,
      organizationId: organization.id,
      projectId: project.id,
      keyId: key.id,
      provider: "openai",
      model: payload.model,
      status: "error",
      httpStatus,
      durationMs,
      errorCode: governanceVerdict.code,
      timestamp: new Date().toISOString(),
    });

    if (isLoop && governanceVerdict.retryAfterSeconds) {
      responseHeaders["Retry-After"] = String(governanceVerdict.retryAfterSeconds);
    }

    const errorType = isLoop ? "runaway_loop_detected" : "budget_exceeded";
    const errorMessage = isLoop
      ? (governanceVerdict.reason || "Runaway agent loop detected by OsterdOps Circuit Breaker. Gateway execution frozen.")
      : (governanceVerdict.reason || "Monthly spend cap reached. Request blocked by OsterdOps.");

    return new NextResponse(
      JSON.stringify({
        error: {
          type: errorType,
          message: errorMessage,
          code: httpStatus,
          violationCode: governanceVerdict.code,
          currentSpend: governanceVerdict.currentSpend,
          cap: governanceVerdict.cap,
          ...(isLoop ? { retryAfter: governanceVerdict.retryAfterSeconds } : {}),
        },
        success: false,
      }),
      {
        status: httpStatus,
        headers: {
          ...responseHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }

  if (governanceVerdict.action === "DOWNGRADE" && governanceVerdict.fallbackModel) {
    const originalModel = payload.model;
    const fallbackModel = governanceVerdict.fallbackModel;
    payload.model = fallbackModel;

    const remainingBudget =
      governanceVerdict.cap && governanceVerdict.currentSpend !== undefined
        ? Math.max(0, governanceVerdict.cap - governanceVerdict.currentSpend)
        : undefined;

    responseHeaders["x-osterdops-governance"] = "auto-downgraded";
    responseHeaders["x-osterdops-original-model"] = originalModel;
    responseHeaders["x-osterdops-active-model"] = fallbackModel;
    if (remainingBudget !== undefined) {
      responseHeaders["x-osterdops-budget-remaining"] = remainingBudget.toFixed(2);
    }
  }

  const provider: AIProvider = validation.normalizedProvider || resolveProviderFromModel(payload.model);

  // 6. Validate Model Request Parameters against Registry Capabilities
  const modelValidation = validateModelRequest(payload.model, {
    maxTokens: payload.maxTokens || payload.max_tokens,
    temperature: payload.temperature,
    stream: payload.stream,
  });

  if (!modelValidation.valid) {
    return createGatewayErrorResponse(
      {
        code: "BAD_REQUEST",
        message: modelValidation.error || "Model parameter validation failed.",
        statusCode: 400,
        retryable: false,
      },
      responseHeaders
    );
  }

  // 7. Resolve Decrypted Upstream Provider Credentials (dynamic tenant/model lookup)
  let credentials = await resolveProviderCredentials(organization.id, provider, project.id, payload.model);
  const isSimulation =
    request.headers.get("x-osterdops-simulate") === "true" ||
    process.env.SIMULATE_GATEWAY_TRAFFIC === "true";

  if (!credentials || !credentials.apiKey) {
    if (isSimulation) {
      credentials = { apiKey: "sk-simulated-upstream-key", provider };
    } else {
      recordGatewayTelemetry({
        requestId,
        organizationId: organization.id,
        projectId: project.id,
        keyId: key.id,
        provider,
        model: payload.model,
        status: "error",
        httpStatus: 400,
        durationMs: Date.now() - startTime,
        errorCode: "INVALID_CREDENTIALS",
        timestamp: new Date().toISOString(),
      });

      return createGatewayErrorResponse(
        {
          code: "INVALID_CREDENTIALS",
          message: `No active provider connection or API key configured for '${provider}'. Please add a connection in OsterdOps Settings -> Integrations.`,
          provider,
          statusCode: 400,
          retryable: false,
        },
        responseHeaders
      );
    }
  }

  // 8. Resolve Provider Adapter (support custom OpenAI-compatible endpoints)
  const effectiveProvider = (credentials.provider || provider) as AIProvider;
  const adapter = getProviderAdapter(effectiveProvider);
  const timeoutMs = Number(process.env.GATEWAY_REQUEST_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;

  // ==========================================
  // 9. STREAMING REQUEST EXECUTION
  // ==========================================
  if (payload.stream) {
    const formatted = adapter.formatStreamRequest
      ? adapter.formatStreamRequest(
          {
            model: payload.model,
            messages: payload.messages,
            temperature: payload.temperature,
            max_tokens: payload.maxTokens || payload.max_tokens,
            top_p: payload.topP || payload.top_p,
            stream: true,
            frequency_penalty: payload.frequencyPenalty,
            presence_penalty: payload.presencePenalty,
            stop: payload.stop,
          },
          credentials
        )
      : adapter.formatRequest(
          {
            model: payload.model,
            messages: payload.messages,
            temperature: payload.temperature,
            max_tokens: payload.maxTokens || payload.max_tokens,
            top_p: payload.topP || payload.top_p,
            stream: true,
            frequency_penalty: payload.frequencyPenalty,
            presence_penalty: payload.presencePenalty,
            stop: payload.stop,
          },
          credentials
        );

    const circuitBreaker = getProviderCircuitBreaker(provider);

    try {
      circuitBreaker.checkExecution();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const upstreamResponse = await fetch(formatted.url, {
        method: "POST",
        headers: formatted.headers,
        body: formatted.body,
        signal: controller.signal,
      }).finally(() => clearTimeout(timer));

      if (!upstreamResponse.ok) {
        if (upstreamResponse.status >= 500) {
          circuitBreaker.recordFailure();
        }
        const errorBody = await upstreamResponse.json().catch(() => ({}));
        const providerErr = adapter.handleProviderError(upstreamResponse.status, errorBody);
        const errorPayload = normalizeGatewayError(
          new Error(providerErr.message),
          provider,
          upstreamResponse.status
        );

        return createGatewayErrorResponse(errorPayload, responseHeaders);
      }

      circuitBreaker.recordSuccess();

      return createGatewayStreamResponse(
        upstreamResponse,
        adapter,
        {
          requestId,
          organizationId: organization.id,
          projectId: project.id,
          keyId: key.id,
          provider,
          model: payload.model,
          startTime,
          inputCharacterCount: JSON.stringify(payload.messages).length,
          onStreamComplete: async (usage, durationMs, status, errorCode) => {
            recordGatewayUsage({
              requestId,
              organizationId: organization.id,
              projectId: project.id,
              apiKeyId: key.id,
              provider,
              model: payload.model,
              inputTokens: usage.inputTokens,
              outputTokens: usage.outputTokens,
              totalTokens: usage.totalTokens,
              cachedTokens: usage.cachedTokens,
              reasoningTokens: usage.reasoningTokens,
              latencyMs: durationMs,
              statusCode: status === "SUCCESS" ? 200 : 500,
              status,
              errorCode,
            })
              .then(() => {
                invalidateBudgetPreflightCache(organization.id, project.id);
                evaluateBudgetsAfterSpend(organization, project);
              })
              .catch((err) => console.error("[OsterdOps Stream] Failed to persist streaming usage record:", err));
          },
        },
        responseHeaders
      );
    } catch (err: unknown) {
      const errorPayload = normalizeGatewayError(err, provider, 504);
      return createGatewayErrorResponse(errorPayload, responseHeaders);
    }
  }

  // ==========================================
  // 10. NON-STREAMING REQUEST EXECUTION (With Retries)
  // ==========================================
  const formatted = adapter.formatRequest(
    {
      model: payload.model,
      messages: payload.messages,
      temperature: payload.temperature,
      max_tokens: payload.maxTokens || payload.max_tokens,
      top_p: payload.topP || payload.top_p,
      stream: false,
      frequency_penalty: payload.frequencyPenalty,
      presence_penalty: payload.presencePenalty,
      stop: payload.stop,
    },
    credentials
  );

  let rawResponse: Response;
  let responseBody: unknown;
  let latencyMs = 0;

  try {
    if (isSimulation || (credentials?.apiKey && credentials.apiKey.startsWith("sk-simulated"))) {
      const promptLength = payload.messages?.reduce((acc, m) => acc + (typeof m.content === "string" ? m.content.length : 0), 0) || 120;
      const estPromptTokens = Math.max(20, Math.round(promptLength / 4));
      const estCompletionTokens = Math.min(payload.maxTokens || 40, 30);
      const simDelay = Math.floor(Math.random() * 30) + 25;
      await new Promise((resolve) => setTimeout(resolve, simDelay));

      rawResponse = new Response("", { status: 200 });
      responseBody = {
        id: `chatcmpl-${requestId}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: payload.model,
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: "OsterdOps gateway proxy verified. Telemetry pipeline active.",
            },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: estPromptTokens,
          completion_tokens: estCompletionTokens,
          total_tokens: estPromptTokens + estCompletionTokens,
        },
      };
      latencyMs = simDelay;
    } else {
      const circuitBreaker = getProviderCircuitBreaker(provider);
      const execResult = await executeProviderHttpWithRetry(
        (signal) =>
          fetch(formatted.url, {
            method: "POST",
            headers: formatted.headers,
            body: formatted.body,
            signal,
          }),
        {
          timeoutMs,
          maxRetries: 2,
          circuitBreaker,
        }
      );

      rawResponse = execResult.rawResponse;
      responseBody = execResult.responseBody;
      latencyMs = execResult.latencyMs;
    }
  } catch (err: unknown) {
    const errorPayload = normalizeGatewayError(err, provider, 504);
    const durationMs = Date.now() - startTime;

    recordGatewayTelemetry({
      requestId,
      organizationId: organization.id,
      projectId: project.id,
      keyId: key.id,
      provider,
      model: payload.model,
      status: "timeout",
      httpStatus: errorPayload.statusCode,
      durationMs,
      errorCode: errorPayload.code,
      timestamp: new Date().toISOString(),
    });

    recordGatewayUsage({
      requestId,
      organizationId: organization.id,
      projectId: project.id,
      apiKeyId: key.id,
      provider,
      model: payload.model,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      latencyMs: durationMs,
      statusCode: 504,
      status: "TIMEOUT",
      errorCode: "TIMEOUT",
    }).catch((err) => console.error("[OsterdOps UsageRecorder] Failed to persist timeout usage record:", err));

    return createGatewayErrorResponse(errorPayload, responseHeaders);
  }

  // Handle Upstream Provider Error Statuses
  if (!rawResponse.ok) {
    const providerErr = adapter.handleProviderError(rawResponse.status, responseBody);
    const errorPayload = normalizeGatewayError(
      new Error(providerErr.message),
      provider,
      rawResponse.status
    );
    const durationMs = Date.now() - startTime;

    recordGatewayTelemetry({
      requestId,
      organizationId: organization.id,
      projectId: project.id,
      keyId: key.id,
      provider,
      model: payload.model,
      status: "error",
      httpStatus: errorPayload.statusCode,
      durationMs,
      errorCode: errorPayload.code,
      timestamp: new Date().toISOString(),
    });

    recordGatewayUsage({
      requestId,
      organizationId: organization.id,
      projectId: project.id,
      apiKeyId: key.id,
      provider,
      model: payload.model,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      latencyMs: durationMs,
      statusCode: rawResponse.status,
      status: "ERROR",
      errorCode: errorPayload.code,
    }).catch((err) => console.error("[OsterdOps UsageRecorder] Failed to persist error usage record:", err));

    return createGatewayErrorResponse(errorPayload, responseHeaders);
  }

  // 11. Normalize Upstream Response & Extract Tokens
  const normalized = adapter.normalizeResponse(responseBody, payload.model);
  const usageBreakdown = adapter.extractUsage(responseBody);

  const usage: GatewayTokenUsage | null =
    usageBreakdown.totalTokens > 0
      ? {
          inputTokens: usageBreakdown.inputTokens,
          outputTokens: usageBreakdown.outputTokens,
          totalTokens: usageBreakdown.totalTokens,
          cachedTokens: usageBreakdown.cachedTokens || 0,
          reasoningTokens: usageBreakdown.reasoningTokens || 0,
        }
      : null;

  // 12. Calculate Cost with Authoritative Cost Engine
  const cost = calculateRequestCost({
    provider,
    model: payload.model,
    inputTokens: usage?.inputTokens || 0,
    outputTokens: usage?.outputTokens || 0,
    cachedTokens: usage?.cachedTokens || 0,
  });

  const firstChoice = normalized.choices?.[0];
  const durationMs = latencyMs || (Date.now() - startTime);

  const responsePayload: GatewayResponsePayload = {
    id: normalized.id || requestId,
    provider,
    model: normalized.model || payload.model,
    output: {
      role: "assistant",
      content: firstChoice?.message?.content || "",
    },
    usage,
    finishReason: firstChoice?.finish_reason || "stop",
    latencyMs: durationMs,
  };

  // 13. Record Structured Telemetry & Durable Usage (Non-blocking)
  recordGatewayTelemetry({
    requestId,
    organizationId: organization.id,
    projectId: project.id,
    keyId: key.id,
    provider,
    model: payload.model,
    status: "success",
    httpStatus: 200,
    durationMs,
    usage,
    timestamp: new Date().toISOString(),
  });

  recordGatewayUsage({
    requestId,
    organizationId: organization.id,
    projectId: project.id,
    apiKeyId: key.id,
    provider,
    model: payload.model,
    inputTokens: usage?.inputTokens || 0,
    outputTokens: usage?.outputTokens || 0,
    totalTokens: usage?.totalTokens || 0,
    cachedTokens: usage?.cachedTokens || 0,
    reasoningTokens: usage?.reasoningTokens || 0,
    costUsd: cost.totalCostUsd ?? undefined,
    costType: "calculated",
    latencyMs: durationMs,
    statusCode: 200,
    status: "SUCCESS",
  })
    .then(() => {
      invalidateBudgetPreflightCache(organization.id, project.id);
      evaluateBudgetsAfterSpend(organization, project);
    })
    .catch((err) => console.error("[OsterdOps UsageRecorder] Failed to persist success usage record:", err));

  // 14. Return Standard JSON Response with Telemetry Headers
  const finalHeaders = new Headers(responseHeaders);
  finalHeaders.set("Content-Type", "application/json");
  finalHeaders.set("x-osterdops-latency-ms", String(durationMs));
  if (cost.totalCostUsd !== null) {
    finalHeaders.set("x-osterdops-cost-usd", cost.totalCostUsd.toFixed(8));
  }
  if (usage) {
    finalHeaders.set("x-osterdops-input-tokens", String(usage.inputTokens));
    finalHeaders.set("x-osterdops-output-tokens", String(usage.outputTokens));
    finalHeaders.set("x-osterdops-total-tokens", String(usage.totalTokens));
  }
  if (cost.cachedSavingsUsd > 0) {
    finalHeaders.set("x-osterdops-cache-savings-usd", cost.cachedSavingsUsd.toFixed(8));
  }

  return NextResponse.json(
    {
      success: true,
      data: responsePayload,
    },
    {
      status: 200,
      headers: finalHeaders,
    }
  );
}
