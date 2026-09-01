/**
 * OsterdOps — OpenAPI 3.1.0 Specification Test Suite (Phase 25)
 * Validates OpenAPI schema structure, endpoints, parameters, and security definitions.
 */

import { generateOpenApiSpec } from "@/lib/api/openapi";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runDeveloperOpenApiSpecTests(): void {
  console.log("▶ Running Developer OpenAPI 3.1.0 Specification Tests...");

  const spec = generateOpenApiSpec() as {
    openapi: string;
    info: { title: string; version: string };
    servers: unknown[];
    components: {
      securitySchemes: Record<string, { type: string; name?: string; scheme?: string }>;
      schemas: Record<string, unknown>;
    };
    paths: Record<string, unknown>;
  };

  // 1. Core Specification Metadata
  assert(spec.openapi === "3.1.0", "OpenAPI version is 3.1.0");
  assert(spec.info.title.includes("OsterdOps"), "Specification title is populated");
  assert(spec.info.version === "1.0.0", "API version is 1.0.0");
  assert(Array.isArray(spec.servers) && spec.servers.length >= 1, "Server endpoints configured");

  // 2. Security Schemes
  const securitySchemes = spec.components.securitySchemes;
  assert(securitySchemes.ApiKeyAuth.type === "apiKey", "ApiKeyAuth defined");
  assert(securitySchemes.ApiKeyAuth.name === "x-api-key", "ApiKeyAuth header is x-api-key");
  assert(securitySchemes.BearerAuth.type === "http", "BearerAuth defined");
  assert(securitySchemes.BearerAuth.scheme === "bearer", "BearerAuth scheme is bearer");

  // 3. Schema Definitions
  const schemas = spec.components.schemas;
  assert(Boolean(schemas.StandardSuccessResponse), "StandardSuccessResponse schema exists");
  assert(Boolean(schemas.StandardErrorResponse), "StandardErrorResponse schema exists");
  assert(Boolean(schemas.ChatCompletionRequest), "ChatCompletionRequest schema exists");
  assert(Boolean(schemas.ChatCompletionResponse), "ChatCompletionResponse schema exists");
  assert(Boolean(schemas.ApiKeyMetadata), "ApiKeyMetadata schema exists");

  // 4. Endpoints Coverage
  const paths = spec.paths;
  assert(Boolean(paths["/chat/completions"]), "POST /chat/completions documented");
  assert(Boolean(paths["/api-keys"]), "GET and POST /api-keys documented");
  assert(Boolean(paths["/usage"]), "GET /usage documented");
  assert(Boolean(paths["/system/api"]), "GET /system/api documented");

  console.log("✔ OpenAPI 3.1.0 Specification Tests passed.");
}
