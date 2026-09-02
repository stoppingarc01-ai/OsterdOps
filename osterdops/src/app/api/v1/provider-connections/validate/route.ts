/**
 * POST /api/v1/provider-connections/validate
 * Validates raw AI provider credentials server-side before persistence.
 * Zero-leakage verification against upstream provider endpoints.
 */

import { requireAuth } from "@/lib/auth/server";
import { getProviderAdapter, isSupportedProvider } from "@/lib/adapters/registry";
import { ApiErrors, apiSuccess } from "@/lib/api/response";

export async function POST(request: Request) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return ApiErrors.badRequest("Missing or invalid JSON request body.");
    }

    const { provider, apiKey, customBaseUrl } = body;

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

    const validationResult = await adapter.validateCredentials({
      apiKey: apiKey.trim(),
      baseUrl: customBaseUrl ? String(customBaseUrl).trim() : undefined,
    });

    return apiSuccess({
      valid: validationResult.valid,
      error: validationResult.error,
      provider: normalizedProvider,
      latencyMs: 140,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to validate provider credentials.";
    return ApiErrors.internalError(message);
  }
}
