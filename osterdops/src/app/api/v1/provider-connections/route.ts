/**
 * POST & GET /api/v1/provider-connections
 * Securely manages organization AI provider connections with AES-256-GCM encryption and RBAC.
 */

import { requireOrganizationMember } from "@/lib/auth/rbac";
import {
  createProviderConnection,
  listProviderConnections,
} from "@/lib/services/provider-connection.service";
import { ApiErrors, apiSuccess } from "@/lib/api/response";
import { isSupportedProvider } from "@/lib/adapters/registry";

/**
 * POST /api/v1/provider-connections
 * Connects an AI provider with encrypted credential storage. Requires ADMIN or OWNER.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return ApiErrors.badRequest("Missing or invalid JSON request body.");
    }

    const { organizationId, provider, name, apiKey, customBaseUrl, projectId, displayName, models, defaultModel, maxSpendCap, fallbackModel } = body;

    if (!organizationId || typeof organizationId !== "string") {
      return ApiErrors.badRequest("Field 'organizationId' is required.");
    }

    if (!provider || typeof provider !== "string") {
      return ApiErrors.badRequest("Field 'provider' is required (e.g. 'openai', 'anthropic', 'gemini', 'groq', 'mistral', 'custom').");
    }

    const normProvider = provider.trim().toLowerCase();
    if (!isSupportedProvider(normProvider) && normProvider !== "custom" && normProvider !== "mistral") {
      return ApiErrors.badRequest(`Unsupported AI provider: '${provider}'. Supported providers: openai, anthropic, gemini, groq, meta, mistral, azure, bedrock, custom.`);
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      return ApiErrors.badRequest("Field 'name' is required.");
    }

    if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
      return ApiErrors.badRequest("Field 'apiKey' is required.");
    }

    // RBAC: Requires ADMIN or OWNER
    const orgAuth = await requireOrganizationMember(request, organizationId, "ADMIN");
    if (orgAuth.errorResponse) {
      return orgAuth.errorResponse;
    }

    const connection = await createProviderConnection(organizationId, orgAuth.user.uid, {
      provider: normProvider,
      name,
      displayName,
      apiKey,
      customBaseUrl,
      projectId,
      models: Array.isArray(models) ? models : undefined,
      defaultModel: typeof defaultModel === "string" ? defaultModel : undefined,
      maxSpendCap: typeof maxSpendCap === "number" ? maxSpendCap : undefined,
      fallbackModel: typeof fallbackModel === "string" ? fallbackModel : undefined,
    });

    return apiSuccess(connection, undefined, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create provider connection.";
    return ApiErrors.internalError(message);
  }
}

/**
 * GET /api/v1/provider-connections?organizationId=...[&projectId=...]
 * Lists all configured provider connections with masked credentials. Requires DEVELOPER or higher (integrations:read).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organizationId");
    const projectId = searchParams.get("projectId") || undefined;

    if (!orgId) {
      return ApiErrors.badRequest("Query parameter 'organizationId' is required.");
    }

    // RBAC: Requires DEVELOPER or higher (integrations:read)
    const orgAuth = await requireOrganizationMember(request, orgId, "DEVELOPER");
    if (orgAuth.errorResponse) {
      return orgAuth.errorResponse;
    }

    const connections = await listProviderConnections(orgId, projectId);
    return apiSuccess(connections);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to list provider connections.";
    return ApiErrors.internalError(message);
  }
}
