/**
 * POST /api/v1/chat/completions
 * OsterdOps Core AI Gateway Endpoint
 * Routes requests to upstream providers, calculates real-time cost, enforces governance, and writes telemetry.
 */

import { NextResponse } from "next/server";
import { verifyGatewayApiKey } from "@/lib/services/api-key.service";
import { checkBudgetPreflight } from "@/lib/services/budget.service";
import { resolveProviderCredentials } from "@/lib/services/provider-connection.service";
import { recordGatewayUsage } from "@/lib/services/usage.service";
import { resolveProviderFromModel, getProviderAdapter } from "@/lib/adapters/registry";
import { calculateRequestCost } from "@/lib/cost/calculator";
import { ApiErrors } from "@/lib/api/response";
import type { GatewayChatRequest } from "@/lib/adapters/types";

export async function POST(request: Request) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  // 1. Authenticate OsterdOps Project API Key
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  const apiKeyHeader = request.headers.get("x-api-key");
  const rawKey = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : apiKeyHeader?.trim() || "";

  if (!rawKey) {
    return ApiErrors.unauthorized(
      "Missing OsterdOps API key. Provide via 'Authorization: Bearer osk_live_...' or 'x-api-key'."
    );
  }

  const verified = await verifyGatewayApiKey(rawKey);
  if (!verified) {
    return ApiErrors.unauthorized("Invalid, revoked, or expired OsterdOps API key.");
  }

  const { key, project, organization } = verified;

  // 2. Pre-Flight Governance & Budget Hard Limit Check
  const budgetCheck = await checkBudgetPreflight(
    organization.id,
    project.id,
    project.currentMonthSpend || 0,
    organization.currentPeriodSpendUsd || 0
  );

  if (!budgetCheck.allowed) {
    return ApiErrors.rateLimited(
      budgetCheck.reason || "Monthly budget spending limit reached. Contact your organization administrator.",
      {
        budgetId: budgetCheck.budget?.id,
        budgetName: budgetCheck.budget?.name,
        limitUsd: budgetCheck.budget?.amountUsd,
      }
    );
  }

  // 3. Parse & Validate Chat Request Body
  let body: GatewayChatRequest;
  try {
    body = (await request.json()) as GatewayChatRequest;
  } catch {
    return ApiErrors.badRequest("Invalid JSON request body.");
  }

  if (!body.model || typeof body.model !== "string") {
    return ApiErrors.badRequest("The 'model' field is required.");
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return ApiErrors.badRequest("The 'messages' array must contain at least one message.");
  }

  // 4. Resolve AI Provider Adapter & Credentials
  const provider = resolveProviderFromModel(body.model);
  const credentials = await resolveProviderCredentials(organization.id, provider);

  if (!credentials || !credentials.apiKey) {
    return ApiErrors.badRequest(
      `No active provider connection or API key configured for '${provider}'. Please add a connection in OsterdOps Settings -> Integrations.`
    );
  }

  const adapter = getProviderAdapter(provider);

  // 5. Execute Upstream AI Request
  const formatted = adapter.formatRequest(body, credentials);
  const { rawResponse, responseBody, latencyMs } = await adapter.executeRequest(formatted);

  // Handle upstream error response
  if (!rawResponse.ok) {
    const errorInfo = adapter.handleProviderError(rawResponse.status, responseBody);

    // Record error telemetry asynchronously
    recordGatewayUsage({
      requestId,
      organization,
      project,
      apiKeyId: key.id,
      provider,
      model: body.model,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      costUsd: 0,
      costType: "calculated",
      latencyMs,
      statusCode: rawResponse.status,
      errorCode: errorInfo.code,
    }).catch((err) => console.error("[OsterdOps Gateway] Failed to write error telemetry:", err));

    return NextResponse.json(
      {
        error: {
          message: errorInfo.message,
          type: "provider_error",
          code: errorInfo.code,
          provider: errorInfo.provider,
        },
      },
      { status: rawResponse.status }
    );
  }

  // 6. Extract Usage & Calculate Cost
  const usage = adapter.extractUsage(responseBody);
  const cost = calculateRequestCost({
    provider,
    model: body.model,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    cachedTokens: usage.cachedTokens,
  });

  // 7. Non-blocking Async Telemetry Write
  recordGatewayUsage({
    requestId,
    organization,
    project,
    apiKeyId: key.id,
    provider,
    model: body.model,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    totalTokens: usage.totalTokens,
    costUsd: cost.totalCostUsd,
    costType: cost.costType,
    latencyMs,
    statusCode: 200,
  }).catch((err) => console.error("[OsterdOps Gateway] Telemetry write failed:", err));

  // 8. Normalize Response
  const normalizedResponse = adapter.normalizeResponse(responseBody, body.model);

  // 9. Return Response with Telemetry Headers
  const responseHeaders = new Headers();
  responseHeaders.set("Content-Type", "application/json");
  responseHeaders.set("x-osterdops-request-id", requestId);
  responseHeaders.set("x-osterdops-latency-ms", String(latencyMs));
  responseHeaders.set("x-osterdops-cost-usd", cost.totalCostUsd.toFixed(8));
  responseHeaders.set("x-osterdops-input-tokens", String(usage.inputTokens));
  responseHeaders.set("x-osterdops-output-tokens", String(usage.outputTokens));
  responseHeaders.set("x-osterdops-total-tokens", String(usage.totalTokens));
  if (cost.cachedSavingsUsd > 0) {
    responseHeaders.set("x-osterdops-cache-savings-usd", cost.cachedSavingsUsd.toFixed(8));
  }

  return NextResponse.json(normalizedResponse, {
    status: 200,
    headers: responseHeaders,
  });
}
