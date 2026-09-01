/**
 * OsterdOps — API Capability Discovery Endpoint (Phase 18)
 * GET /api/v1/system/api
 * Exposes supported API versions, capabilities, documentation endpoints, and OpenAPI spec metadata.
 */

import { NextRequest } from "next/server";
import { extractOrGenerateRequestId } from "@/lib/observability/request-context";
import { apiSuccess } from "@/lib/api/response";
import {
  CURRENT_API_VERSION,
  SUPPORTED_API_VERSIONS,
  DEPRECATED_API_VERSIONS,
  API_VERSION_REGISTRY,
} from "@/lib/api/versioning";

export async function GET(request: NextRequest) {
  const requestId = extractOrGenerateRequestId(request.headers);

  const discoveryData = {
    version: CURRENT_API_VERSION,
    supportedVersions: SUPPORTED_API_VERSIONS,
    deprecatedVersions: DEPRECATED_API_VERSIONS,
    versions: API_VERSION_REGISTRY,
    openapi: {
      version: "3.1.0",
      specUrl: "/docs/openapi.yaml",
      schemaUrl: "/api/v1/system/openapi.json",
    },
    documentation: {
      portalUrl: "/dashboard/developers",
      apiReferenceUrl: "/dashboard/developers/api",
      quickstartUrl: "/dashboard/developers/quickstart",
      guidesUrl: "https://docs.osterdops.com",
    },
    capabilities: {
      aiGateway: {
        chatCompletions: true,
        deterministicCostTracking: true,
        budgetPreflight: true,
        latencyTracking: true,
      },
      idempotency: {
        header: "Idempotency-Key",
        ttlSeconds: 86400,
      },
      pagination: {
        type: "cursor",
        defaultLimit: 20,
        maxLimit: 100,
      },
      webhooks: {
        signatureScheme: "HMAC-SHA256",
        toleranceSeconds: 300,
      },
      rateLimiting: {
        standardRpm: 120,
        burstAllowance: true,
      },
    },
    serverTime: new Date().toISOString(),
  };

  return apiSuccess(discoveryData, { requestId, version: CURRENT_API_VERSION });
}
