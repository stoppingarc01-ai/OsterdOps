"use client";

import React, { useState } from "react";
import {
  Code,
  Copy,
  Check,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  KeyRound,
  FileCode,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";
import { CodeBlock } from "./CodeBlock";

interface EndpointDoc {
  id: string;
  category: "AI Gateway" | "API Keys" | "Usage & Costs" | "Budgets" | "System Discovery";
  method: "GET" | "POST" | "DELETE" | "PATCH";
  path: string;
  summary: string;
  description: string;
  auth: "Bearer Token" | "API Key" | "Public";
  parameters?: Array<{ name: string; type: string; required: boolean; desc: string }>;
  requestBodyExample?: string;
  responseExample: string;
}

const ENDPOINTS: EndpointDoc[] = [
  {
    id: "ep_chat_completions",
    category: "AI Gateway",
    method: "POST",
    path: "/api/v1/chat/completions",
    summary: "Create AI Chat Completion",
    description:
      "Proxies AI chat completions through OsterdOps. Automatically performs preflight budget checks, token counting, deterministic cost calculation, and latency tracking.",
    auth: "Bearer Token",
    parameters: [
      { name: "model", type: "string", required: true, desc: "Target model ID (e.g. gpt-4o-mini, claude-3-5-sonnet-20241022, gemini-1.5-pro)" },
      { name: "messages", type: "array", required: true, desc: "Array of message objects with role ('system' | 'user' | 'assistant') and content." },
      { name: "temperature", type: "number", required: false, desc: "Sampling temperature (0.0 to 2.0). Defaults to 0.7." },
      { name: "max_tokens", type: "integer", required: false, desc: "Maximum tokens to generate in completion." },
      { name: "stream", type: "boolean", required: false, desc: "Enable Server-Sent Events (SSE) streaming mode." },
    ],
    requestBodyExample: JSON.stringify(
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a concise engineering assistant." },
          { role: "user", content: "Explain AI cost governance." },
        ],
        temperature: 0.7,
        max_tokens: 256,
      },
      null,
      2
    ),
    responseExample: JSON.stringify(
      {
        id: "gw_req_1788191200_abc",
        object: "chat.completion",
        created: 1788191200,
        model: "gpt-4o-mini",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: "AI cost governance provides real-time proxy routing, deterministic token tracking, and hard budget enforcement to prevent unexpected model spend.",
            },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: 24,
          completion_tokens: 28,
          total_tokens: 52,
          estimated_cost_usd: 0.0000204,
        },
      },
      null,
      2
    ),
  },
  {
    id: "ep_api_keys_list",
    category: "API Keys",
    method: "GET",
    path: "/api/v1/api-keys",
    summary: "List Organization API Keys",
    description: "Returns masked API key metadata. Stored plaintext secrets are never returned.",
    auth: "Bearer Token",
    responseExample: JSON.stringify(
      {
        success: true,
        data: [
          {
            id: "key_live_94f2910a",
            name: "Production Gateway Main",
            maskedKey: "ost_live_••••••••••••••••••••••••••••••••",
            projectId: "proj_prod_gw",
            environment: "production",
            status: "ACTIVE",
            createdAt: "2025-01-12T00:00:00Z",
          },
        ],
      },
      null,
      2
    ),
  },
  {
    id: "ep_api_keys_create",
    category: "API Keys",
    method: "POST",
    path: "/api/v1/api-keys",
    summary: "Create Project API Key",
    description: "Generates a new API key. The raw secret is returned STRICTLY ONCE in the response.",
    auth: "Bearer Token",
    requestBodyExample: JSON.stringify(
      {
        name: "Staging Pipeline Key",
        projectId: "proj_stg_llm",
        environment: "staging",
        scopes: ["chat.completions", "models.read"],
      },
      null,
      2
    ),
    responseExample: JSON.stringify(
      {
        success: true,
        data: {
          key: {
            id: "key_stg_88a1b2c3",
            name: "Staging Pipeline Key",
            maskedKey: "ost_stg_••••••••••••••••••••••••••••••••",
            environment: "staging",
            status: "ACTIVE",
          },
          secret: "ost_stg_948f2a1b7e3c90d5e1f2a3b4c5d6e7f8",
        },
      },
      null,
      2
    ),
  },
  {
    id: "ep_usage_aggregate",
    category: "Usage & Costs",
    method: "GET",
    path: "/api/v1/usage",
    summary: "Get Aggregate Telemetry",
    description: "Returns token counts and costs partitioned by model and provider without exposing prompt text.",
    auth: "Bearer Token",
    responseExample: JSON.stringify(
      {
        success: true,
        data: {
          totalRequests: 148290,
          totalPromptTokens: 42750000,
          totalCompletionTokens: 13810000,
          cachedTokensRead: 9440000,
          estimatedCostUsd: 1842.2,
        },
      },
      null,
      2
    ),
  },
  {
    id: "ep_system_api",
    category: "System Discovery",
    method: "GET",
    path: "/api/v1/system/api",
    summary: "API Capability Discovery",
    description: "Exposes supported API versions, capabilities, and OpenAPI 3.1.0 specification link.",
    auth: "Public",
    responseExample: JSON.stringify(
      {
        success: true,
        data: {
          version: "v1",
          supportedVersions: ["v1"],
          openapi: {
            version: "3.1.0",
            schemaUrl: "/api/v1/system/openapi.json",
          },
        },
      },
      null,
      2
    ),
  },
];

export function ApiReferenceView() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [activeEndpointId, setActiveEndpointId] = useState("ep_chat_completions");

  const categories = ["ALL", "AI Gateway", "API Keys", "Usage & Costs", "System Discovery"];

  const filteredEndpoints = ENDPOINTS.filter((ep) => {
    const matchesSearch =
      ep.path.toLowerCase().includes(search.toLowerCase()) ||
      ep.summary.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "ALL" || ep.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const activeEndpoint = ENDPOINTS.find((e) => e.id === activeEndpointId) || ENDPOINTS[0];

  return (
    <div className="space-y-6">
      {/* Top Search & OpenAPI Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 text-[#717688] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search endpoints or paths..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3.5 py-2 bg-[#0c0f16] border border-[#171b26] rounded-xl text-xs text-white placeholder:text-[#555a6d] focus:outline-none focus:border-[#dfba82] w-64"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#dfba82] text-black shadow-sm"
                    : "bg-[#0c0f16] text-[#8e93a6] hover:text-white hover:bg-white/[0.04] border border-[#171b26]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <a
          href="/api/openapi.json"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl bg-[#1b202e] hover:bg-[#252c3f] text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border border-[#2b3044]"
        >
          <FileCode className="w-4 h-4 text-[#dfba82]" />
          <span>OpenAPI 3.1.0 JSON</span>
          <ExternalLink className="w-3 h-3 text-[#717688]" />
        </a>
      </div>

      {/* Main 2-Column API Reference Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Navigation Sidebar */}
        <div className="lg:col-span-4 bg-[#0c0f16] border border-[#171b26] rounded-2xl p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#717688]">
            Endpoints ({filteredEndpoints.length})
          </div>

          {filteredEndpoints.map((ep) => {
            const isSelected = ep.id === activeEndpoint.id;

            return (
              <button
                key={ep.id}
                onClick={() => setActiveEndpointId(ep.id)}
                className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  isSelected
                    ? "bg-[#dfba82]/10 border border-[#dfba82]/40 text-white"
                    : "hover:bg-white/[0.02] text-[#8e93a6] hover:text-white border border-transparent"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                        ep.method === "POST"
                          ? "bg-blue-950/60 text-blue-400 border border-blue-800/40"
                          : "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="text-xs font-semibold text-white">{ep.summary}</span>
                  </div>
                  <div className="text-[11px] font-mono text-[#717688] mt-1">{ep.path}</div>
                </div>

                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    isSelected ? "text-[#dfba82] translate-x-0.5" : "text-[#555a6d]"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Right Detail Pane */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Card */}
          <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold ${
                  activeEndpoint.method === "POST"
                    ? "bg-blue-950/60 text-blue-400 border border-blue-800/40"
                    : "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                }`}
              >
                {activeEndpoint.method}
              </span>
              <span className="font-mono text-sm text-[#f4efe6] font-semibold">
                {activeEndpoint.path}
              </span>
              <span className="ml-auto px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#1b202e] text-[#8e93a6] border border-[#2b3044]">
                Auth: {activeEndpoint.auth}
              </span>
            </div>

            <h2 className="text-lg font-bold text-white font-serif">{activeEndpoint.summary}</h2>
            <p className="text-xs text-[#8e93a6] leading-relaxed">{activeEndpoint.description}</p>
          </div>

          {/* Parameters Table */}
          {activeEndpoint.parameters && (
            <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-[#171b26] pb-3">
                Request Parameters
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[#717688] font-semibold border-b border-[#171b26]">
                    <tr>
                      <th className="pb-2">Field</th>
                      <th className="pb-2">Type</th>
                      <th className="pb-2">Required</th>
                      <th className="pb-2">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#171b26] text-white">
                    {activeEndpoint.parameters.map((param) => (
                      <tr key={param.name}>
                        <td className="py-2.5 font-mono text-[#dfba82]">{param.name}</td>
                        <td className="py-2.5 font-mono text-[#8e93a6]">{param.type}</td>
                        <td className="py-2.5">
                          {param.required ? (
                            <span className="text-amber-400 font-semibold">required</span>
                          ) : (
                            <span className="text-[#717688]">optional</span>
                          )}
                        </td>
                        <td className="py-2.5 text-[#8e93a6]">{param.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Request Example */}
          {activeEndpoint.requestBodyExample && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                Example Request Body
              </div>
              <CodeBlock singleCode={activeEndpoint.requestBodyExample} language="json" />
            </div>
          )}

          {/* Response Example */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Example Response (HTTP 200 OK)
            </div>
            <CodeBlock singleCode={activeEndpoint.responseExample} language="json" />
          </div>
        </div>
      </div>
    </div>
  );
}
