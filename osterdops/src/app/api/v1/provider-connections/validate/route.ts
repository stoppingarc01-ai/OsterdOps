/**
 * POST /api/v1/provider-connections/validate
 * Validates raw AI provider credentials server-side before persistence.
 * Zero-leakage verification against upstream provider endpoints.
 */

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server";
import { getProviderAdapter, isSupportedProvider } from "@/lib/adapters/registry";
import { ApiErrors, apiSuccess } from "@/lib/api/response";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return ApiErrors.badRequest("Missing or invalid JSON request body.");
    }

    const provider = body.provider || body.credentials?.provider;
    const apiKey = body.apiKey || body.credentials?.apiKey;
    const customBaseUrl = body.customBaseUrl || body.credentials?.baseUrl || body.credentials?.customBaseUrl;

    if (!provider || typeof provider !== "string") {
      return ApiErrors.badRequest("Field 'provider' is required.");
    }

    if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
      return ApiErrors.badRequest("Field 'apiKey' is required.");
    }

    const normalizedProvider = provider.trim().toLowerCase();
    if (!isSupportedProvider(normalizedProvider) && normalizedProvider !== "custom" && normalizedProvider !== "mistral") {
      return ApiErrors.badRequest(`Unsupported AI provider: '${provider}'.`);
    }

    // For "custom", "groq", "mistral", or OpenAI-compatible endpoints, use OpenAIAdapter with customBaseUrl
    const adapter = getProviderAdapter(
      normalizedProvider === "custom" || normalizedProvider === "mistral" ? "openai" : normalizedProvider
    );

    const startTime = performance.now();
    const validationResult = await adapter.validateCredentials({
      provider: normalizedProvider,
      apiKey: apiKey.trim(),
      baseUrl: customBaseUrl ? String(customBaseUrl).trim() : undefined,
    });
    const latencyMs = Math.max(1, Math.round(performance.now() - startTime));

    if (!validationResult.valid) {
      const errorMessage = validationResult.error || "Upstream authentication failed: Invalid API key";
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: errorMessage,
          },
          data: {
            valid: false,
            error: validationResult.error || "INVALID_CREDENTIALS",
            message: errorMessage,
            provider: normalizedProvider,
            latencyMs,
          },
        },
        { status: 400 }
      );
    }

    return apiSuccess({
      valid: true,
      provider: normalizedProvider,
      latencyMs,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to validate provider credentials.";
    return ApiErrors.internalError(message);
  }
}
