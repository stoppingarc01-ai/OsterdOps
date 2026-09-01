"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Ban,
  Lock,
} from "lucide-react";
import { DeveloperPortalLayout } from "@/components/developers/DeveloperPortalLayout";

interface ErrorDoc {
  code: string;
  httpStatus: number;
  meaning: string;
  commonCause: string;
  recommendedAction: string;
  retryable: boolean;
}

const ERROR_CATALOG: ErrorDoc[] = [
  {
    code: "BUDGET_EXCEEDED",
    httpStatus: 429,
    meaning: "Monthly spend cap reached under hard budget enforcement policy.",
    commonCause: "Inference requests consumed 100% of the active monthly budget limit.",
    recommendedAction: "Increase the budget ceiling in Budgets UI or wait for billing period reset.",
    retryable: false,
  },
  {
    code: "RATE_LIMITED",
    httpStatus: 429,
    meaning: "API key sliding window rate limit threshold exceeded.",
    commonCause: "More than 120 requests/minute dispatched from a single API key.",
    recommendedAction: "Honor the 'retry-after' response header and implement exponential backoff.",
    retryable: true,
  },
  {
    code: "AUTHENTICATION_FAILED",
    httpStatus: 401,
    meaning: "Missing, revoked, expired, or malformed OsterdOps API key.",
    commonCause: "Key string invalid or revoked by an administrator.",
    recommendedAction: "Generate a new API key in Developer Portal -> API Keys.",
    retryable: false,
  },
  {
    code: "AUTHORIZATION_FAILED",
    httpStatus: 403,
    meaning: "Caller lacks required RBAC permissions to execute action.",
    commonCause: "Attempting an ADMIN operation (e.g. creating budget/keys) with VIEWER role.",
    recommendedAction: "Ask an organization OWNER to upgrade your role to DEVELOPER or ADMIN.",
    retryable: false,
  },
  {
    code: "VALIDATION_ERROR",
    httpStatus: 400,
    meaning: "Request payload failed schema validation or missing required fields.",
    commonCause: "Missing 'model' string or empty 'messages' array in chat request.",
    recommendedAction: "Inspect the 'details' field in the error response envelope.",
    retryable: false,
  },
  {
    code: "NOT_FOUND",
    httpStatus: 404,
    meaning: "Target resource (project, budget, alert, key) does not exist.",
    commonCause: "Invalid ID in path parameter or resource was deleted.",
    recommendedAction: "Verify resource ID in list endpoints.",
    retryable: false,
  },
  {
    code: "CONFLICT",
    httpStatus: 409,
    meaning: "Resource identifier collision occurred.",
    commonCause: "Creating a project with a slug that already exists in the organization.",
    recommendedAction: "Choose a distinct project name or provide a unique slug.",
    retryable: false,
  },
  {
    code: "INVALID_CREDENTIALS",
    httpStatus: 401,
    meaning: "Upstream provider (OpenAI, Anthropic, Gemini) rejected the stored key.",
    commonCause: "Upstream provider key was deleted or revoked in provider console.",
    recommendedAction: "Update provider key in OsterdOps Settings -> Integrations.",
    retryable: false,
  },
  {
    code: "PROVIDER_RATE_LIMITED",
    httpStatus: 429,
    meaning: "Upstream provider TPM/RPM quota exceeded.",
    commonCause: "Direct provider account reached token per minute tier limit.",
    recommendedAction: "Retry with backoff or configure failover model routing.",
    retryable: true,
  },
  {
    code: "PROVIDER_UNAVAILABLE",
    httpStatus: 503,
    meaning: "Upstream AI provider is experiencing an outage or high capacity load.",
    commonCause: "OpenAI or Anthropic 503/529 Overloaded error.",
    recommendedAction: "Retry with jitter or route to an alternate model family.",
    retryable: true,
  },
  {
    code: "MODEL_NOT_FOUND",
    httpStatus: 404,
    meaning: "Requested model is not supported by the configured provider adapter.",
    commonCause: "Typo in model string or model not provisioned in provider account.",
    recommendedAction: "Consult the Provider Models catalog in Developer Portal -> Providers.",
    retryable: false,
  },
  {
    code: "TIMEOUT",
    httpStatus: 504,
    meaning: "AI provider request timed out before receiving completion response.",
    commonCause: "Massive prompt context or slow upstream generation beyond server deadline.",
    recommendedAction: "Reduce max_tokens or increase request deadline.",
    retryable: true,
  },
  {
    code: "PROVIDER_ERROR",
    httpStatus: 502,
    meaning: "General upstream provider failure.",
    commonCause: "Malformed upstream response or unexpected exception.",
    recommendedAction: "Check provider status dashboard and inspect request telemetry.",
    retryable: true,
  },
  {
    code: "INTERNAL_SERVER_ERROR",
    httpStatus: 500,
    meaning: "Uncaught server exception.",
    commonCause: "Internal service degradation.",
    recommendedAction: "Retry request. If error persists, check system diagnostics.",
    retryable: true,
  },
];

export default function ErrorCatalogPage() {
  const [search, setSearch] = useState("");
  const [retryFilter, setRetryFilter] = useState<string>("ALL");

  const filtered = ERROR_CATALOG.filter((err) => {
    const matchSearch =
      !search ||
      err.code.toLowerCase().includes(search.toLowerCase()) ||
      err.meaning.toLowerCase().includes(search.toLowerCase()) ||
      err.commonCause.toLowerCase().includes(search.toLowerCase());
    const matchRetry =
      retryFilter === "ALL" ||
      (retryFilter === "RETRYABLE" && err.retryable) ||
      (retryFilter === "NON_RETRYABLE" && !err.retryable);
    return matchSearch && matchRetry;
  });

  return (
    <DeveloperPortalLayout
      title="Error Code Reference"
      subtitle="Complete documentation of error codes, root causes, HTTP statuses, and recovery actions"
    >
      <div className="space-y-6 max-w-5xl">
        {/* Search & Filter Bar */}
        <div className="p-4 rounded-2xl bg-[#0c0e17] border border-[#1b1e2c] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#07080c] border border-[#161824] w-full sm:w-80">
            <Search className="w-4 h-4 text-[#73788c]" />
            <input
              type="text"
              placeholder="Search error codes, causes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-white placeholder-[#555a6d] w-full font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRetryFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                retryFilter === "ALL"
                  ? "bg-[#dfba82]/20 text-[#dfba82] border border-[#dfba82]/40"
                  : "bg-[#111422] text-[#8e93a6] hover:text-white"
              }`}
            >
              All ({ERROR_CATALOG.length})
            </button>
            <button
              type="button"
              onClick={() => setRetryFilter("RETRYABLE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                retryFilter === "RETRYABLE"
                  ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                  : "bg-[#111422] text-[#8e93a6] hover:text-white"
              }`}
            >
              Retryable
            </button>
            <button
              type="button"
              onClick={() => setRetryFilter("NON_RETRYABLE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                retryFilter === "NON_RETRYABLE"
                  ? "bg-red-950/60 text-red-400 border border-red-800/40"
                  : "bg-[#111422] text-[#8e93a6] hover:text-white"
              }`}
            >
              Non-Retryable
            </button>
          </div>
        </div>

        {/* Error Cards Grid */}
        <div className="space-y-3">
          {filtered.map((err) => (
            <div
              key={err.code}
              id={err.code.toLowerCase().replace(/_/g, "-")}
              className="p-5 rounded-2xl border border-[#1b1e2c] bg-[#0c0e17] space-y-3 shadow-lg hover:border-[#2a2f45] transition-all"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#161824]">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-800/40">
                    HTTP {err.httpStatus}
                  </span>
                  <span className="font-mono text-sm font-bold text-white">{err.code}</span>
                </div>

                <div className="flex items-center gap-2">
                  {err.retryable ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                      <RotateCcw className="w-3 h-3" />
                      Retryable
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-800/40">
                      <Ban className="w-3 h-3" />
                      Do Not Retry
                    </span>
                  )}
                </div>
              </div>

              {/* Description & Action */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-[10.5px] font-bold text-[#73788c] uppercase tracking-wider">
                    Meaning
                  </span>
                  <p className="text-white leading-relaxed">{err.meaning}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10.5px] font-bold text-[#73788c] uppercase tracking-wider">
                    Common Cause
                  </span>
                  <p className="text-[#a0a5b8] leading-relaxed">{err.commonCause}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10.5px] font-bold text-[#dfba82] uppercase tracking-wider">
                    Recommended Action
                  </span>
                  <p className="text-[#d1d5db] leading-relaxed">{err.recommendedAction}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DeveloperPortalLayout>
  );
}
