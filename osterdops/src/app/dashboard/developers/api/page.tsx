"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Search,
  KeyRound,
  Shield,
  Layers,
  ChevronRight,
  ExternalLink,
  Code2,
  Lock,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { DeveloperPortalLayout } from "@/components/developers/DeveloperPortalLayout";
import { CodeBlock } from "@/components/developers/CodeBlock";

interface EndpointDoc {
  id: string;
  category: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  summary: string;
  description: string;
  auth: "OsterdOps API Key" | "User JWT Session" | "Public / None" | "OsterdOps API Key / User Session";
  permission?: string;
  parameters?: Array<{ name: string; in: "query" | "path" | "header"; required: boolean; type: string; description: string }>;
  requestBodySchema?: Record<string, unknown>;
  responseSchema?: Record<string, unknown>;
  errorResponses: Array<{ status: number; code: string; description: string }>;
  exampleRequest: {
    curl: string;
    typescript: string;
    python: string;
  };
  exampleResponse: Record<string, unknown>;
}

const ENDPOINTS: EndpointDoc[] = [
  // --- GATEWAY ---
  {
    id: "chat-completions",
    category: "Gateway",
    method: "POST",
    path: "/api/v1/chat/completions",
    summary: "AI Gateway Chat Completions",
    description:
      "Routes AI chat completions to upstream providers (OpenAI, Anthropic, Gemini, Azure, Bedrock), calculates real-time cost, enforces budget limits, and emits structured usage telemetry.",
    auth: "OsterdOps API Key",
    parameters: [
      { name: "x-osterdops-request-id", in: "header", required: false, type: "string", description: "Optional client request correlation ID." },
    ],
    requestBodySchema: {
      model: "string (required, e.g. 'gpt-4o', 'claude-3-5-sonnet')",
      messages: "Array<{ role: 'system'|'user'|'assistant', content: string }> (required)",
      temperature: "number (optional, default: 0.7)",
      max_tokens: "number (optional)",
      top_p: "number (optional)",
      provider: "string (optional: 'openai'|'anthropic'|'gemini'|'azure'|'bedrock')",
    },
    errorResponses: [
      { status: 400, code: "BAD_REQUEST", description: "Missing model or invalid message format." },
      { status: 401, code: "UNAUTHORIZED", description: "Missing or invalid OsterdOps API key." },
      { status: 429, code: "BUDGET_EXCEEDED", description: "Hard budget ceiling reached." },
      { status: 429, code: "RATE_LIMITED", description: "API key rate limit exceeded." },
      { status: 502, code: "PROVIDER_ERROR", description: "Upstream provider error." },
      { status: 504, code: "TIMEOUT", description: "Provider request timed out." },
    ],
    exampleRequest: {
      curl: `curl -X POST "https://api.osterdops.com/api/v1/chat/completions" \\
  -H "Authorization: Bearer OSTERDOPS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      { "role": "user", "content": "Explain AI cost observability." }
    ]
  }'`,
      typescript: `import { OsterdOpsClient } from "@osterdops/sdk";

const client = new OsterdOpsClient({ apiKey: process.env.OSTERDOPS_API_KEY });
const response = await client.gateway.chat.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Explain AI cost observability." }],
});`,
      python: `import requests

res = requests.post(
    "https://api.osterdops.com/api/v1/chat/completions",
    headers={"Authorization": "Bearer OSTERDOPS_API_KEY"},
    json={"model": "gpt-4o", "messages": [{"role": "user", "content": "Explain AI cost observability."}]}
)`,
    },
    exampleResponse: {
      success: true,
      data: {
        id: "req_01j9a8b1",
        provider: "openai",
        model: "gpt-4o",
        output: {
          role: "assistant",
          content: "AI cost observability provides real-time tracking...",
        },
        usage: {
          inputTokens: 18,
          outputTokens: 42,
          totalTokens: 60,
          cachedTokens: 0,
        },
        finishReason: "stop",
        latencyMs: 310,
      },
    },
  },

  // --- PROJECTS ---
  {
    id: "projects-list",
    category: "Projects",
    method: "GET",
    path: "/api/v1/projects",
    summary: "List Organization Projects",
    description: "Lists all active projects within the caller's organization namespace.",
    auth: "User JWT Session",
    permission: "projects:read",
    parameters: [
      { name: "organizationId", in: "query", required: false, type: "string", description: "Target organization ID." },
      { name: "includeArchived", in: "query", required: false, type: "boolean", description: "Whether to include archived projects." },
    ],
    errorResponses: [
      { status: 401, code: "UNAUTHORIZED", description: "Authentication required." },
      { status: 403, code: "FORBIDDEN", description: "Not a member of the organization." },
    ],
    exampleRequest: {
      curl: `curl -X GET "https://api.osterdops.com/api/v1/projects" \\
  -H "Authorization: Bearer USER_SESSION_TOKEN"`,
      typescript: `const projects = await client.projects.list();`,
      python: `res = requests.get("https://api.osterdops.com/api/v1/projects", headers={"Authorization": "Bearer TOKEN"})`,
    },
    exampleResponse: {
      success: true,
      data: [
        {
          id: "proj_01j9a8b",
          organizationId: "org_9481a",
          name: "Production AI Services",
          slug: "production-ai-services",
          status: "ACTIVE",
          spendLimitMonthly: 500,
          currentMonthSpend: 42.15,
          createdAt: "2026-08-20T10:00:00.000Z",
        },
      ],
    },
  },
  {
    id: "projects-create",
    category: "Projects",
    method: "POST",
    path: "/api/v1/projects",
    summary: "Create New Project",
    description: "Creates an isolated project for tracking usage, keys, and spend limits. Requires ADMIN or OWNER.",
    auth: "User JWT Session",
    permission: "projects:create (ADMIN / OWNER)",
    requestBodySchema: {
      name: "string (required, max 100 chars)",
      slug: "string (optional, auto-generated if omitted)",
      description: "string (optional)",
      spendLimitMonthly: "number (optional)",
    },
    errorResponses: [
      { status: 400, code: "BAD_REQUEST", description: "Name missing or too long." },
      { status: 403, code: "FORBIDDEN", description: "Caller lacks ADMIN role." },
      { status: 409, code: "CONFLICT", description: "Slug collision." },
    ],
    exampleRequest: {
      curl: `curl -X POST "https://api.osterdops.com/api/v1/projects" \\
  -H "Authorization: Bearer USER_SESSION_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Production AI Services", "spendLimitMonthly": 500}'`,
      typescript: `const project = await client.projects.create({ name: "Production AI Services", spendLimitMonthly: 500 });`,
      python: `res = requests.post("https://api.osterdops.com/api/v1/projects", headers={"Authorization": "Bearer TOKEN"}, json={"name": "Prod"})`,
    },
    exampleResponse: {
      success: true,
      data: {
        id: "proj_01j9a8b",
        name: "Production AI Services",
        slug: "production-ai-services",
        status: "ACTIVE",
        spendLimitMonthly: 500,
        createdAt: "2026-08-29T10:00:00.000Z",
      },
    },
  },

  // --- API KEYS ---
  {
    id: "api-keys-create",
    category: "API Keys",
    method: "POST",
    path: "/api/v1/projects/{projectId}/api-keys",
    summary: "Issue Project API Key",
    description: "Generates a cryptographically secure API key. The unmasked plaintext secret is returned EXACTLY ONCE.",
    auth: "User JWT Session",
    permission: "keys:write (ADMIN / OWNER)",
    parameters: [
      { name: "projectId", in: "path", required: true, type: "string", description: "Parent project ID." },
    ],
    requestBodySchema: {
      name: "string (required)",
      environment: "'production' | 'staging' | 'development' (default: 'production')",
      expiresAt: "string (optional ISO 8601 timestamp)",
    },
    errorResponses: [
      { status: 400, code: "BAD_REQUEST", description: "Name is required." },
      { status: 403, code: "FORBIDDEN", description: "Insufficient organization permissions." },
      { status: 404, code: "NOT_FOUND", description: "Project not found." },
    ],
    exampleRequest: {
      curl: `curl -X POST "https://api.osterdops.com/api/v1/projects/proj_01j9a8b/api-keys" \\
  -H "Authorization: Bearer USER_SESSION_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Prod Ingestion Key", "environment": "production"}'`,
      typescript: `const key = await client.apiKeys.create("proj_01j9a8b", { name: "Prod Ingestion Key" });
console.log("Plaintext secret (save now!):", key.secret);`,
      python: `res = requests.post("https://api.osterdops.com/api/v1/projects/proj_01j9a8b/api-keys", json={"name": "Prod Ingestion Key"})`,
    },
    exampleResponse: {
      success: true,
      data: {
        id: "key_8841a",
        name: "Prod Ingestion Key",
        keyPrefix: "osk_live_••••94f2",
        secret: "osk_live_94f2a188c9f4d1e204b78912",
        projectId: "proj_01j9a8b",
        createdAt: "2026-08-29T10:00:00.000Z",
      },
    },
  },

  // --- USAGE & COSTS ---
  {
    id: "usage-get",
    category: "Usage",
    method: "GET",
    path: "/api/v1/usage",
    summary: "Retrieve Aggregated Usage",
    description: "Returns token counts (input, output, cached) and request volumes across projects and time windows.",
    auth: "OsterdOps API Key / User Session",
    permission: "usage:read",
    parameters: [
      { name: "organizationId", in: "query", required: false, type: "string", description: "Organization ID." },
      { name: "projectId", in: "query", required: false, type: "string", description: "Filter by project." },
    ],
    errorResponses: [
      { status: 401, code: "UNAUTHORIZED", description: "Missing authentication." },
    ],
    exampleRequest: {
      curl: `curl -X GET "https://api.osterdops.com/api/v1/usage" \\
  -H "Authorization: Bearer OSTERDOPS_API_KEY"`,
      typescript: `const usage = await client.usage.get();`,
      python: `res = requests.get("https://api.osterdops.com/api/v1/usage", headers={"Authorization": "Bearer OSTERDOPS_API_KEY"})`,
    },
    exampleResponse: {
      success: true,
      data: {
        totalRequests: 45200,
        totalTokens: 3200000,
        inputTokens: 1200000,
        outputTokens: 2000000,
        cachedTokens: 340000,
        totalCostUsd: 14.85,
      },
    },
  },
  {
    id: "costs-get",
    category: "Costs",
    method: "GET",
    path: "/api/v1/costs",
    summary: "Retrieve Cost Summaries",
    description: "Returns model-level spend breakdowns calculated with deterministic precision.",
    auth: "OsterdOps API Key / User Session",
    permission: "usage:read",
    errorResponses: [
      { status: 401, code: "UNAUTHORIZED", description: "Missing authentication." },
    ],
    exampleRequest: {
      curl: `curl -X GET "https://api.osterdops.com/api/v1/costs" \\
  -H "Authorization: Bearer OSTERDOPS_API_KEY"`,
      typescript: `const costs = await client.costs.get();`,
      python: `res = requests.get("https://api.osterdops.com/api/v1/costs", headers={"Authorization": "Bearer OSTERDOPS_API_KEY"})`,
    },
    exampleResponse: {
      success: true,
      data: {
        totalCostUsd: 124.5,
        currency: "USD",
        breakdown: [
          { provider: "openai", model: "gpt-4o", costUsd: 84.2, requests: 1200 },
          { provider: "anthropic", model: "claude-3-5-sonnet", costUsd: 40.3, requests: 640 },
        ],
      },
    },
  },

  // --- BUDGETS ---
  {
    id: "budgets-create",
    category: "Budgets",
    method: "POST",
    path: "/api/v1/budgets",
    summary: "Create Budget & Spend Cap",
    description: "Creates a spending limit with threshold notifications and optional hard blocking enforcement.",
    auth: "User JWT Session",
    permission: "budgets:write (ADMIN / OWNER)",
    requestBodySchema: {
      name: "string (required)",
      amountUsd: "number (required)",
      period: "'daily' | 'weekly' | 'monthly' | 'quarterly' (required)",
      enforcementMode: "'MONITOR' (soft alerts) | 'BLOCK' (hard ceiling)",
      thresholds: "number[] (e.g. [50, 80, 100])",
    },
    errorResponses: [
      { status: 400, code: "BAD_REQUEST", description: "Missing amount or period." },
      { status: 403, code: "FORBIDDEN", description: "Requires ADMIN permission." },
    ],
    exampleRequest: {
      curl: `curl -X POST "https://api.osterdops.com/api/v1/budgets" \\
  -H "Authorization: Bearer USER_SESSION_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Production Monthly Cap",
    "amountUsd": 1000,
    "period": "monthly",
    "enforcementMode": "BLOCK",
    "thresholds": [50, 80, 100]
  }'`,
      typescript: `const budget = await client.budgets.create({
  name: "Production Monthly Cap",
  amountUsd: 1000,
  period: "monthly",
  enforcementMode: "BLOCK",
});`,
      python: `res = requests.post("https://api.osterdops.com/api/v1/budgets", json={"name": "Prod Cap", "amountUsd": 1000, "period": "monthly"})`,
    },
    exampleResponse: {
      success: true,
      data: {
        id: "bud_99a81",
        name: "Production Monthly Cap",
        amountUsd: 1000,
        currentSpendUsd: 0,
        period: "MONTHLY",
        enforcementMode: "BLOCK",
        status: "ACTIVE",
      },
    },
  },

  // --- SYSTEM ---
  {
    id: "system-health",
    category: "System",
    method: "GET",
    path: "/api/v1/system/health",
    summary: "System Health & Probes",
    description: "Evaluates overall platform health, latency, and service availability.",
    auth: "Public / None",
    errorResponses: [],
    exampleRequest: {
      curl: `curl -X GET "https://api.osterdops.com/api/v1/system/health"`,
      typescript: `const health = await client.system.health();`,
      python: `res = requests.get("https://api.osterdops.com/api/v1/system/health")`,
    },
    exampleResponse: {
      success: true,
      data: {
        status: "healthy",
        version: "1.0.0",
        environment: "production",
      },
    },
  },
];

const CATEGORIES = Array.from(new Set(ENDPOINTS.map((e) => e.category)));

export default function ApiReferencePage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDoc>(ENDPOINTS[0]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredEndpoints = ENDPOINTS.filter((e) => {
    const matchCategory = !selectedCategory || e.category === selectedCategory;
    const matchQuery =
      !search ||
      e.path.toLowerCase().includes(search.toLowerCase()) ||
      e.summary.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchQuery;
  });

  const getMethodBadge = (method: string) => {
    switch (method) {
      case "POST":
        return "bg-emerald-950/70 text-emerald-400 border-emerald-800/50";
      case "GET":
        return "bg-blue-950/70 text-blue-400 border-blue-800/50";
      case "PATCH":
        return "bg-amber-950/70 text-amber-400 border-amber-800/50";
      case "DELETE":
        return "bg-red-950/70 text-red-400 border-red-800/50";
      default:
        return "bg-gray-800 text-gray-300 border-gray-700";
    }
  };

  return (
    <DeveloperPortalLayout
      title="API Reference"
      subtitle="Complete documentation for all OsterdOps REST and Gateway endpoints"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          {/* Search bar */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0c0e17] border border-[#1b1e2c]">
            <Search className="w-4 h-4 text-[#73788c]" />
            <input
              type="text"
              placeholder="Filter endpoints..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-white placeholder-[#555a6d] w-full"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                selectedCategory === null
                  ? "bg-[#dfba82]/20 text-[#dfba82] border border-[#dfba82]/40"
                  : "bg-[#111422] text-[#8e93a6] hover:text-white"
              }`}
            >
              All ({ENDPOINTS.length})
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  selectedCategory === cat
                    ? "bg-[#dfba82]/20 text-[#dfba82] border border-[#dfba82]/40"
                    : "bg-[#111422] text-[#8e93a6] hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Endpoints List */}
          <div className="space-y-1.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 custom-scrollbar">
            {filteredEndpoints.map((ep) => {
              const active = selectedEndpoint.id === ep.id;
              return (
                <button
                  key={ep.id}
                  type="button"
                  onClick={() => setSelectedEndpoint(ep)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    active
                      ? "bg-[#dfba82]/10 border-[#dfba82]/40 shadow-sm"
                      : "bg-[#0c0e17] border-[#1b1e2c] hover:border-[#2a2f45]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono border ${getMethodBadge(
                        ep.method
                      )}`}
                    >
                      {ep.method}
                    </span>
                    <span className="text-xs font-mono font-semibold text-white truncate">
                      {ep.path}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8e93a6] mt-1 line-clamp-1">{ep.summary}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Detail Pane */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Banner */}
          <div className="p-6 rounded-2xl bg-[#0c0e17] border border-[#1b1e2c] space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono border ${getMethodBadge(
                  selectedEndpoint.method
                )}`}
              >
                {selectedEndpoint.method}
              </span>
              <span className="text-base font-mono font-bold text-white">{selectedEndpoint.path}</span>
            </div>

            <h2 className="text-xl font-bold text-white font-serif">{selectedEndpoint.summary}</h2>
            <p className="text-xs text-[#a0a5b8] leading-relaxed">{selectedEndpoint.description}</p>

            {/* Auth & Permissions Metadata */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#161824] text-xs">
              <div className="flex items-center gap-1.5 text-[#dfba82]">
                <KeyRound className="w-3.5 h-3.5" />
                <span className="font-semibold">{selectedEndpoint.auth}</span>
              </div>

              {selectedEndpoint.permission && (
                <div className="flex items-center gap-1.5 text-blue-400">
                  <Shield className="w-3.5 h-3.5" />
                  <span className="font-mono">{selectedEndpoint.permission}</span>
                </div>
              )}
            </div>
          </div>

          {/* Parameters Table */}
          {selectedEndpoint.parameters && selectedEndpoint.parameters.length > 0 && (
            <div className="rounded-2xl border border-[#1b1e2c] bg-[#0c0e17] overflow-hidden p-5 space-y-3">
              <h3 className="text-xs font-bold text-[#dfba82] uppercase tracking-wider">
                Request Parameters
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#1b1e2c] text-[#8e93a6] font-semibold">
                    <tr>
                      <th className="pb-2">Parameter</th>
                      <th className="pb-2">In</th>
                      <th className="pb-2">Type</th>
                      <th className="pb-2">Required</th>
                      <th className="pb-2">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#161928] font-mono text-[11px]">
                    {selectedEndpoint.parameters.map((p) => (
                      <tr key={p.name}>
                        <td className="py-2.5 text-white font-semibold">{p.name}</td>
                        <td className="py-2.5 text-[#73788c]">{p.in}</td>
                        <td className="py-2.5 text-blue-400">{p.type}</td>
                        <td className="py-2.5">
                          {p.required ? (
                            <span className="text-red-400 font-bold">Yes</span>
                          ) : (
                            <span className="text-[#555a6d]">No</span>
                          )}
                        </td>
                        <td className="py-2.5 font-sans text-[#a0a5b8]">{p.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Request Body Schema */}
          {selectedEndpoint.requestBodySchema && (
            <div className="rounded-2xl border border-[#1b1e2c] bg-[#0c0e17] p-5 space-y-3">
              <h3 className="text-xs font-bold text-[#dfba82] uppercase tracking-wider">
                Request Body (application/json)
              </h3>
              <CodeBlock
                title="JSON Schema"
                language="json"
                singleCode={JSON.stringify(selectedEndpoint.requestBodySchema, null, 2)}
              />
            </div>
          )}

          {/* Request Examples */}
          <div className="rounded-2xl border border-[#1b1e2c] bg-[#0c0e17] p-5 space-y-3">
            <h3 className="text-xs font-bold text-[#dfba82] uppercase tracking-wider">
              Example Request
            </h3>
            <CodeBlock
              tabs={[
                { label: "cURL", language: "curl", code: selectedEndpoint.exampleRequest.curl },
                { label: "TypeScript", language: "typescript", code: selectedEndpoint.exampleRequest.typescript },
                { label: "Python", language: "python", code: selectedEndpoint.exampleRequest.python },
              ]}
            />
          </div>

          {/* Response Example */}
          <div className="rounded-2xl border border-[#1b1e2c] bg-[#0c0e17] p-5 space-y-3">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Example Response (HTTP 200 OK)
            </h3>
            <CodeBlock
              title="Response Envelope"
              language="json"
              singleCode={JSON.stringify(selectedEndpoint.exampleResponse, null, 2)}
            />
          </div>

          {/* Possible Error Codes */}
          <div className="rounded-2xl border border-[#1b1e2c] bg-[#0c0e17] p-5 space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Error Responses
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {selectedEndpoint.errorResponses.map((err) => (
                <div
                  key={err.code}
                  className="p-3 rounded-xl bg-[#07080c] border border-[#161928] space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-800/40">
                      HTTP {err.status}
                    </span>
                    <span className="font-mono text-xs font-bold text-white">{err.code}</span>
                  </div>
                  <p className="text-[11px] text-[#8e93a6]">{err.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DeveloperPortalLayout>
  );
}
