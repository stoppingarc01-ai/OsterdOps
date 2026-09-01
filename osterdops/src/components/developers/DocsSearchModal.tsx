"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, X, BookOpen, Terminal, ShieldAlert, Cpu, Webhook, ArrowRight } from "lucide-react";

export interface SearchDocItem {
  id: string;
  title: string;
  description: string;
  category: "API Reference" | "SDK & CLI" | "Quick Start" | "Errors" | "Providers" | "Webhooks" | "Security";
  href: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
}

const DOCS_INDEX: SearchDocItem[] = [
  {
    id: "quickstart",
    title: "Quick Start Guide",
    description: "8-step guide to sending your first AI request and configuring budgets",
    category: "Quick Start",
    href: "/dashboard/developers/quickstart",
  },
  {
    id: "api-chat-completions",
    title: "POST /api/v1/chat/completions",
    description: "AI Gateway chat completions proxy with cost tracking & budget governance",
    category: "API Reference",
    method: "POST",
    href: "/dashboard/developers/api#chat-completions",
  },
  {
    id: "api-projects",
    title: "GET & POST /api/v1/projects",
    description: "List and create isolated multi-tenant organization projects",
    category: "API Reference",
    method: "POST",
    href: "/dashboard/developers/api#projects",
  },
  {
    id: "api-keys",
    title: "POST /api/v1/projects/:id/api-keys",
    description: "Issue new cryptographically hashed project API keys with single-reveal secret",
    category: "API Reference",
    method: "POST",
    href: "/dashboard/developers/api#api-keys",
  },
  {
    id: "api-usage",
    title: "GET /api/v1/usage",
    description: "Retrieve aggregated token usage, input/output/cached breakdowns",
    category: "API Reference",
    method: "GET",
    href: "/dashboard/developers/api#usage",
  },
  {
    id: "api-costs",
    title: "GET /api/v1/costs",
    description: "Query real-time AI inference cost summaries and provider breakdowns",
    category: "API Reference",
    method: "GET",
    href: "/dashboard/developers/api#costs",
  },
  {
    id: "api-budgets",
    title: "POST /api/v1/budgets",
    description: "Configure spend caps, threshold alerts, and hard/soft enforcement policies",
    category: "API Reference",
    method: "POST",
    href: "/dashboard/developers/api#budgets",
  },
  {
    id: "sdk-overview",
    title: "@osterdops/sdk TypeScript Client",
    description: "Official typed client library with automatic retries, correlation IDs & doctor diagnostics",
    category: "SDK & CLI",
    href: "/dashboard/developers#sdk",
  },
  {
    id: "sdk-doctor",
    title: "OsterdOps Doctor & Diagnostics",
    description: "Diagnostic tools to verify API keys, gateway connectivity & budget status",
    category: "SDK & CLI",
    href: "/dashboard/developers#doctor",
  },
  {
    id: "err-budget-exceeded",
    title: "BUDGET_EXCEEDED (HTTP 429)",
    description: "Inference blocked when project spend reaches hard budget limit",
    category: "Errors",
    href: "/dashboard/developers/errors#budget-exceeded",
  },
  {
    id: "err-rate-limited",
    title: "RATE_LIMITED (HTTP 429)",
    description: "API key sliding window rate limit threshold exceeded",
    category: "Errors",
    href: "/dashboard/developers/errors#rate-limited",
  },
  {
    id: "err-auth",
    title: "AUTHENTICATION_FAILED (HTTP 401)",
    description: "Invalid, expired, or missing OsterdOps API key header",
    category: "Errors",
    href: "/dashboard/developers/errors#auth-failed",
  },
  {
    id: "prov-openai",
    title: "OpenAI Direct Integration",
    description: "Configuration guide for GPT-4o, GPT-4o-mini, o1, o3-mini models",
    category: "Providers",
    href: "/dashboard/developers/providers#openai",
  },
  {
    id: "prov-anthropic",
    title: "Anthropic Integration",
    description: "Configuration guide for Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus",
    category: "Providers",
    href: "/dashboard/developers/providers#anthropic",
  },
  {
    id: "prov-gemini",
    title: "Google Gemini Integration",
    description: "Configuration guide for Gemini 1.5 Pro and Gemini 1.5 Flash models",
    category: "Providers",
    href: "/dashboard/developers/providers#gemini",
  },
  {
    id: "prov-azure",
    title: "Azure OpenAI Integration",
    description: "Connecting Azure deployments with custom endpoint URLs and API keys",
    category: "Providers",
    href: "/dashboard/developers/providers#azure",
  },
  {
    id: "prov-bedrock",
    title: "AWS Bedrock Integration",
    description: "Connecting AWS Bedrock foundation models with IAM credentials",
    category: "Providers",
    href: "/dashboard/developers/providers#bedrock",
  },
  {
    id: "webhooks-stripe",
    title: "Stripe & Event Webhooks",
    description: "HMAC-SHA256 signature verification, replay protection & retry schedule",
    category: "Webhooks",
    href: "/dashboard/developers/webhooks",
  },
  {
    id: "req-inspector",
    title: "Request Inspector & Telemetry",
    description: "Filter and audit live gateway requests with strict zero-prompt privacy guarantees",
    category: "Security",
    href: "/dashboard/developers/requests",
  },
];

export function DocsSearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery("");
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = DOCS_INDEX.filter((doc) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      doc.title.toLowerCase().includes(q) ||
      doc.description.toLowerCase().includes(q) ||
      doc.category.toLowerCase().includes(q)
    );
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "API Reference":
        return <BookOpen className="w-3.5 h-3.5 text-[#dfba82]" />;
      case "SDK & CLI":
        return <Terminal className="w-3.5 h-3.5 text-blue-400" />;
      case "Errors":
        return <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />;
      case "Providers":
        return <Cpu className="w-3.5 h-3.5 text-emerald-400" />;
      case "Webhooks":
        return <Webhook className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <BookOpen className="w-3.5 h-3.5 text-[#73788c]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#0c0e17] border border-[#232738] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1b1e2c] bg-[#111422]">
          <Search className="w-4 h-4 text-[#dfba82] shrink-0" />
          <input
            type="text"
            placeholder="Search API reference, SDKs, error codes, providers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm text-white placeholder-[#6b7280] outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/[0.05] text-[#73788c] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-[#161928] custom-scrollbar">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] transition-all group cursor-pointer"
              >
                <div className="space-y-1 pr-3">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(item.category)}
                    <span className="text-xs font-semibold text-white group-hover:text-[#dfba82] transition-colors">
                      {item.title}
                    </span>
                    {item.method && (
                      <span
                        className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded font-mono ${
                          item.method === "POST"
                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                            : item.method === "GET"
                            ? "bg-blue-950/60 text-blue-400 border border-blue-800/40"
                            : item.method === "PATCH"
                            ? "bg-amber-950/60 text-amber-400 border border-amber-800/40"
                            : "bg-red-950/60 text-red-400 border border-red-800/40"
                        }`}
                      >
                        {item.method}
                      </span>
                    )}
                    <span className="text-[10px] text-[#555a6d] font-medium uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[#8e93a6] line-clamp-1">{item.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#474c60] group-hover:text-[#dfba82] group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-[#73788c] text-xs">
              No developer documentation matching &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2 bg-[#08090e] border-t border-[#1b1e2c] flex items-center justify-between text-[11px] text-[#555a6d]">
          <span>Navigate with ↵ or click</span>
          <span className="font-mono bg-[#161928] px-1.5 py-0.5 rounded text-[10px] text-[#8e93a6]">
            ESC to close
          </span>
        </div>
      </div>
    </div>
  );
}
