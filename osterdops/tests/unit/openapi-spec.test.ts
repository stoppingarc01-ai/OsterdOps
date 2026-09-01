/**
 * Unit Tests — OpenAPI 3.1.0 Specification Parity & Structural Completeness
 */

import fs from "fs";
import path from "path";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export async function runOpenApiSpecTests() {
  const openApiPath = path.resolve(process.cwd(), "docs/openapi.yaml");
  assert(fs.existsSync(openApiPath), "docs/openapi.yaml must exist.");

  const content = fs.readFileSync(openApiPath, "utf-8");

  // 1. Structural Checks
  assert(content.includes("openapi: 3.1.0"), "Spec must declare OpenAPI 3.1.0.");
  assert(content.includes("title: OsterdOps AI Governance & Gateway API"), "Spec title must be defined.");
  assert(content.includes("servers:"), "Servers list must be defined.");
  assert(content.includes("https://api.osterdops.com"), "Production server URL must be present.");
  assert(content.includes("BearerAuth:"), "BearerAuth security scheme must be defined.");
  assert(content.includes("ApiKeyAuth:"), "ApiKeyAuth security scheme must be defined.");

  // 2. Core Route Completeness
  const requiredRoutes = [
    "/api/health",
    "/api/ready",
    "/api/v1/system/health",
    "/api/v1/system/diagnostics",
    "/api/v1/chat/completions",
    "/api/v1/gateway/chat/completions",
    "/api/v1/projects",
    "/api/v1/projects/{projectId}",
    "/api/v1/projects/{projectId}/api-keys",
    "/api/v1/usage",
    "/api/v1/costs",
    "/api/v1/analytics/overview",
    "/api/v1/budgets",
    "/api/v1/alerts",
    "/api/v1/billing",
    "/api/v1/security/posture",
  ];

  for (const route of requiredRoutes) {
    assert(content.includes(route), `OpenAPI spec must document route: ${route}`);
  }

  // 3. Schema Completeness
  const requiredSchemas = [
    "GatewayChatRequest",
    "GatewayChatResponse",
    "GatewayTokenUsage",
    "Project",
    "ApiKey",
    "GeneratedApiKey",
    "UsageSummary",
    "CostSummary",
    "AnalyticsOverview",
    "Budget",
    "Alert",
    "BillingSummary",
    "SecurityPosture",
  ];

  for (const schema of requiredSchemas) {
    assert(content.includes(schema), `OpenAPI spec must define schema: ${schema}`);
  }
}
