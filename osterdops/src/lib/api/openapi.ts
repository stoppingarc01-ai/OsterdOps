/**
 * OsterdOps — OpenAPI 3.1.0 Specification Definition (Phase 25)
 * Generated from authoritative route contracts, request validators, and error definitions.
 */

let cachedSpec: Record<string, unknown> | null = null;

export function generateOpenApiSpec(): Record<string, unknown> {
  if (cachedSpec) {
    return cachedSpec;
  }

  cachedSpec = {
    openapi: "3.1.0",
    info: {
      title: "OsterdOps AI Gateway & LLM Cost-Governance Platform API",
      version: "1.0.0",
      description:
        "Production-grade AI gateway proxy, deterministic multi-provider cost tracking, budget enforcement, rate limiting, and observability.",
      contact: {
        name: "OsterdOps Developer Platform",
        url: "https://osterdops.com/developers",
      },
    },
    servers: [
      {
        url: "https://api.osterdops.com/api/v1",
        description: "Production API Server",
      },
      {
        url: "http://localhost:3000/api/v1",
        description: "Local Development Server",
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
          description: "OsterdOps Project API Key (e.g. ost_live_... or ost_test_...)",
        },
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT / Token",
          description: "Bearer authentication token (e.g. Bearer ost_live_...)",
        },
      },
      schemas: {
        StandardSuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { type: "object" },
            meta: {
              type: "object",
              properties: {
                requestId: { type: "string", example: "req_1788191200_abc" },
                version: { type: "string", example: "v1" },
              },
            },
          },
          required: ["success", "data"],
        },
        StandardErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                code: { type: "string", example: "INVALID_API_KEY" },
                message: { type: "string", example: "The supplied API key is invalid or has expired." },
                status: { type: "integer", example: 401 },
                requestId: { type: "string", example: "req_1788191200_abc" },
                documentationUrl: { type: "string", example: "https://docs.osterdops.com/errors/INVALID_API_KEY" },
              },
              required: ["code", "message", "status"],
            },
          },
          required: ["success", "error"],
        },
        ChatCompletionRequest: {
          type: "object",
          properties: {
            model: {
              type: "string",
              example: "gpt-4o-mini",
              description: "Target model identifier (e.g. gpt-4o-mini, claude-3-5-sonnet-20241022, gemini-1.5-pro)",
            },
            messages: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  role: { type: "string", enum: ["system", "user", "assistant"], example: "user" },
                  content: { type: "string", example: "Hello! Explain OsterdOps AI cost governance in one sentence." },
                },
                required: ["role", "content"],
              },
            },
            temperature: { type: "number", minimum: 0, maximum: 2, example: 0.7 },
            max_tokens: { type: "integer", minimum: 1, maximum: 8192, example: 1024 },
            stream: { type: "boolean", example: false },
          },
          required: ["model", "messages"],
        },
        ChatCompletionResponse: {
          type: "object",
          properties: {
            id: { type: "string", example: "gw_req_1788191200_abc" },
            object: { type: "string", example: "chat.completion" },
            created: { type: "integer", example: 1788191200 },
            model: { type: "string", example: "gpt-4o-mini" },
            choices: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  index: { type: "integer", example: 0 },
                  message: {
                    type: "object",
                    properties: {
                      role: { type: "string", example: "assistant" },
                      content: { type: "string", example: "OsterdOps delivers real-time AI proxy routing, deterministic cost tracking, and proactive budget enforcement." },
                    },
                  },
                  finish_reason: { type: "string", example: "stop" },
                },
              },
            },
            usage: {
              type: "object",
              properties: {
                prompt_tokens: { type: "integer", example: 24 },
                completion_tokens: { type: "integer", example: 18 },
                total_tokens: { type: "integer", example: 42 },
                estimated_cost_usd: { type: "number", example: 0.0000144 },
              },
            },
          },
        },
        ApiKeyMetadata: {
          type: "object",
          properties: {
            id: { type: "string", example: "key_live_94f2910a" },
            name: { type: "string", example: "Production Gateway Main" },
            maskedKey: { type: "string", example: "ost_live_••••••••••••••••••••••••••••••••" },
            projectId: { type: "string", example: "proj_prod_gw" },
            environment: { type: "string", enum: ["production", "staging", "development"], example: "production" },
            scopes: { type: "array", items: { type: "string" }, example: ["chat.completions", "models.read"] },
            status: { type: "string", enum: ["ACTIVE", "REVOKED", "EXPIRED"], example: "ACTIVE" },
            createdAt: { type: "string", format: "date-time" },
            lastUsedAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
    paths: {
      "/chat/completions": {
        post: {
          summary: "Create AI Chat Completion",
          description: "Proxies request through OsterdOps gateway with budget preflight, token tracking, and deterministic cost calculation.",
          security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ChatCompletionRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Successful chat completion response or SSE stream",
              headers: {
                "x-osterdops-request-id": { schema: { type: "string" }, description: "Correlation Request ID" },
                "x-osterdops-latency-ms": { schema: { type: "string" }, description: "Upstream + Gateway Latency in ms" },
                "x-osterdops-cost-usd": { schema: { type: "string" }, description: "Deterministic Cost in USD" },
                "x-osterdops-total-tokens": { schema: { type: "string" }, description: "Total Token Count" },
              },
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ChatCompletionResponse" },
                },
                "text/event-stream": {
                  schema: { type: "string", description: "SSE Stream of token chunks" },
                },
              },
            },
            "400": { description: "Invalid Request Payload", content: { "application/json": { schema: { $ref: "#/components/schemas/StandardErrorResponse" } } } },
            "401": { description: "Invalid or Missing API Key", content: { "application/json": { schema: { $ref: "#/components/schemas/StandardErrorResponse" } } } },
            "429": { description: "Rate Limit or Hard Budget Cap Breached", content: { "application/json": { schema: { $ref: "#/components/schemas/StandardErrorResponse" } } } },
            "502": { description: "Upstream AI Provider Error", content: { "application/json": { schema: { $ref: "#/components/schemas/StandardErrorResponse" } } } },
          },
        },
      },
      "/api-keys": {
        get: {
          summary: "List Organization API Keys",
          description: "Returns masked API key metadata. Plaintext secrets are never returned.",
          security: [{ BearerAuth: [] }],
          responses: {
            "200": {
              description: "List of API key metadata",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { type: "array", items: { $ref: "#/components/schemas/ApiKeyMetadata" } },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: "Create New API Key",
          description: "Generates a new API key. The raw secret is returned STRICTLY ONCE.",
          security: [{ BearerAuth: [] }],
          responses: {
            "201": {
              description: "API Key created with single-reveal secret",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          key: { $ref: "#/components/schemas/ApiKeyMetadata" },
                          secret: { type: "string", example: "ost_live_948f2a1b7e3c90d5e1f2a3b4c5d6e7f8" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/usage": {
        get: {
          summary: "Get Aggregate Usage & Cost Telemetry",
          description: "Returns aggregated request counts, token breakdown, and cost without exposing prompt or completion text.",
          security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
          responses: {
            "200": {
              description: "Aggregated usage metrics",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/StandardSuccessResponse" },
                },
              },
            },
          },
        },
      },
      "/system/api": {
        get: {
          summary: "API Capability Discovery",
          description: "Returns supported versions, endpoints, capabilities, and OpenAPI metadata.",
          responses: {
            "200": {
              description: "API capabilities discovery object",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/StandardSuccessResponse" },
                },
              },
            },
          },
        },
      },
    },
  };

  return cachedSpec;
}
