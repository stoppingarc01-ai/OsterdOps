"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Search,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Clock,
  Lock,
} from "lucide-react";
import { CodeBlock } from "./CodeBlock";

interface ApiErrorDoc {
  code: string;
  httpStatus: number;
  retryable: boolean;
  summary: string;
  cause: string;
  resolution: string;
  exampleResponse: string;
}

const ERROR_CATALOG: ApiErrorDoc[] = [
  {
    code: "INVALID_API_KEY",
    httpStatus: 401,
    retryable: false,
    summary: "API Key Authentication Failed",
    cause: "The Bearer token or x-api-key header was omitted, malformed, or does not match any valid SHA-256 hash.",
    resolution: "Verify that your key starts with 'ost_live_' or 'ost_test_', check for accidental whitespace, or generate a fresh key in the Developer Portal.",
    exampleResponse: JSON.stringify(
      {
        success: false,
        error: {
          code: "INVALID_API_KEY",
          message: "The supplied API key is invalid or has expired.",
          status: 401,
          requestId: "req_1788191200_err1",
        },
      },
      null,
      2
    ),
  },
  {
    code: "RATE_LIMIT_EXCEEDED",
    httpStatus: 429,
    retryable: true,
    summary: "Sliding-Window Rate Limit Exceeded",
    cause: "Request velocity exceeded the configured requests per minute (RPM) threshold.",
    resolution: "Inspect the 'x-ratelimit-reset' response header to determine when the quota unlocks, and implement exponential backoff with jitter.",
    exampleResponse: JSON.stringify(
      {
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Rate limit exceeded. Please retry after window resets.",
          status: 429,
          requestId: "req_1788191200_err2",
        },
      },
      null,
      2
    ),
  },
  {
    code: "BUDGET_EXCEEDED",
    httpStatus: 429,
    retryable: false,
    summary: "Hard Spend Cap Reached",
    cause: "The organization or project has breached its monthly spend limit and hard budget enforcement is enabled.",
    resolution: "An organization OWNER or ADMIN must increase the project spend ceiling in the Budgets dashboard.",
    exampleResponse: JSON.stringify(
      {
        success: false,
        error: {
          code: "BUDGET_EXCEEDED",
          message: "Hard budget limit reached for project: Production Gateway ($1,500.00).",
          status: 429,
          requestId: "req_1788191200_err3",
        },
      },
      null,
      2
    ),
  },
  {
    code: "UPSTREAM_PROVIDER_ERROR",
    httpStatus: 502,
    retryable: true,
    summary: "Upstream Model Provider Error",
    cause: "The upstream AI provider (OpenAI, Anthropic, or Google) returned a 5xx error or connection reset.",
    resolution: "OsterdOps automatically attempts retries for transient errors. If failures persist, check the System Health page or configure fallback routing.",
    exampleResponse: JSON.stringify(
      {
        success: false,
        error: {
          code: "UPSTREAM_PROVIDER_ERROR",
          message: "Upstream provider 'anthropic' returned status 503 Overloaded.",
          status: 502,
          requestId: "req_1788191200_err4",
        },
      },
      null,
      2
    ),
  },
  {
    code: "PAYLOAD_TOO_LARGE",
    httpStatus: 413,
    retryable: false,
    summary: "Request Body Exceeds Limit",
    cause: "The incoming request payload exceeds the 4MB maximum payload size.",
    resolution: "Reduce the prompt length, truncate long conversational message histories, or chunk larger documents.",
    exampleResponse: JSON.stringify(
      {
        success: false,
        error: {
          code: "PAYLOAD_TOO_LARGE",
          message: "Request payload size exceeds maximum allowed 4MB.",
          status: 413,
          requestId: "req_1788191200_err5",
        },
      },
      null,
      2
    ),
  },
  {
    code: "FORBIDDEN",
    httpStatus: 403,
    retryable: false,
    summary: "Insufficient Permissions",
    cause: "The authenticated role lacks permissions for the requested resource (e.g. VIEWER attempting to create an API key).",
    resolution: "Request an upgraded role (DEVELOPER or ADMIN) from your organization OWNER.",
    exampleResponse: JSON.stringify(
      {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "User lacks required permission 'api_keys.write'.",
          status: 403,
          requestId: "req_1788191200_err6",
        },
      },
      null,
      2
    ),
  },
];

export function ErrorReferenceView() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredErrors = ERROR_CATALOG.filter((err) => {
    const matchesSearch =
      err.code.toLowerCase().includes(search.toLowerCase()) ||
      err.summary.toLowerCase().includes(search.toLowerCase()) ||
      err.cause.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || String(err.httpStatus) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 text-[#717688] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search error codes or causes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3.5 py-2 bg-[#0c0f16] border border-[#171b26] rounded-xl text-xs text-white placeholder:text-[#555a6d] focus:outline-none focus:border-[#dfba82] w-64"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0c0f16] border border-[#171b26] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#dfba82]"
          >
            <option value="ALL">All HTTP Statuses</option>
            <option value="401">401 Unauthorized</option>
            <option value="403">403 Forbidden</option>
            <option value="413">413 Payload Too Large</option>
            <option value="429">429 Rate Limit / Budget</option>
            <option value="502">502 Bad Gateway</option>
          </select>
        </div>
      </div>

      {/* Error Catalog Cards */}
      <div className="space-y-4">
        {filteredErrors.map((item) => (
          <div
            key={item.code}
            className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-6 hover:border-[#dfba82]/40 transition-all space-y-4"
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-950/40 border border-rose-800/40 flex items-center justify-center text-rose-400 font-mono font-bold text-xs">
                  {item.httpStatus}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono text-sm font-bold text-white">{item.code}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        item.retryable
                          ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/40"
                          : "bg-zinc-800 text-zinc-400 border-zinc-700"
                      }`}
                    >
                      {item.retryable ? "Retryable" : "Non-Retryable"}
                    </span>
                  </div>
                  <p className="text-xs text-[#8e93a6] mt-0.5">{item.summary}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#07080c] border border-[#171b26] space-y-1">
                <div className="font-semibold text-rose-400">Likely Cause:</div>
                <p className="text-[#8e93a6] leading-relaxed">{item.cause}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#07080c] border border-[#171b26] space-y-1">
                <div className="font-semibold text-emerald-400">Recommended Resolution:</div>
                <p className="text-[#8e93a6] leading-relaxed">{item.resolution}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#717688]">
                Canonical Error JSON Payload
              </div>
              <CodeBlock singleCode={item.exampleResponse} language="json" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
