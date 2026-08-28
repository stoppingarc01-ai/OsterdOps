"use client";

import React, { useState } from "react";
import { Search, Settings, Check, Plus, ExternalLink, Activity, ShieldCheck } from "lucide-react";

interface IntegrationItem {
  id: string;
  name: string;
  category: "Model Providers" | "Observability & APM" | "Cloud Billing" | "Webhooks & CI/CD";
  desc: string;
  status: "Connected" | "Available";
  modelsOrTags: string[];
  metrics: string;
  enabled: boolean;
}

const INTEGRATIONS_CATALOG: IntegrationItem[] = [
  {
    id: "openai",
    name: "OpenAI",
    category: "Model Providers",
    desc: "GPT-4o, GPT-4o-mini, Embeddings & DALL·E direct API proxy and cost tracking.",
    status: "Connected",
    modelsOrTags: ["gpt-4o", "gpt-4o-mini", "embeddings"],
    metrics: "89.2M tokens today",
    enabled: true,
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    category: "Model Providers",
    desc: "Claude 3.5 Sonnet, Opus & Haiku prompt compression and spend guardrails.",
    status: "Connected",
    modelsOrTags: ["claude-3-5-sonnet", "claude-3-haiku"],
    metrics: "67.8M tokens today",
    enabled: true,
  },
  {
    id: "google-vertex",
    name: "Google Vertex & Gemini",
    category: "Model Providers",
    desc: "Gemini 1.5 Pro, Flash multimodal inference monitoring and rate-limiting.",
    status: "Connected",
    modelsOrTags: ["gemini-1.5-pro", "gemini-1.5-flash"],
    metrics: "42.3M tokens today",
    enabled: true,
  },
  {
    id: "aws-bedrock",
    name: "AWS Bedrock",
    category: "Model Providers",
    desc: "Llama 3.1 70B, Amazon Titan & Claude via AWS IAM cross-account authentication.",
    status: "Connected",
    modelsOrTags: ["llama-3-1-70b", "titan-text"],
    metrics: "8.4M tokens today",
    enabled: true,
  },
  {
    id: "datadog",
    name: "Datadog APM",
    category: "Observability & APM",
    desc: "Stream real-time LLM token spans, prompt latency distributions, and trace context.",
    status: "Connected",
    modelsOrTags: ["traces", "spans", "dashboards"],
    metrics: "12ms avg latency",
    enabled: true,
  },
  {
    id: "langfuse",
    name: "Langfuse",
    category: "Observability & APM",
    desc: "Open-source LLM engineering platform for prompt tracking and cost evaluations.",
    status: "Connected",
    modelsOrTags: ["evals", "prompts", "scores"],
    metrics: "128 sessions/hr",
    enabled: true,
  },
  {
    id: "slack",
    name: "Slack Alert Webhooks",
    category: "Webhooks & CI/CD",
    desc: "Dispatch instant budget breach notifications, rate limit spikes, and anomaly alerts.",
    status: "Connected",
    modelsOrTags: ["#ai-alerts", "instant-dispatch"],
    metrics: "Active in 3 channels",
    enabled: true,
  },
  {
    id: "azure-openai",
    name: "Microsoft Azure OpenAI",
    category: "Model Providers",
    desc: "Enterprise private Azure OpenAI deployments with Azure AD role-based access.",
    status: "Available",
    modelsOrTags: ["azure-eastus", "enterprise"],
    metrics: "Ready to connect",
    enabled: false,
  },
  {
    id: "opentelemetry",
    name: "OpenTelemetry (OTel)",
    category: "Observability & APM",
    desc: "Standardized OTel Collector exporter for vendor-neutral LLM telemetry pipelines.",
    status: "Connected",
    modelsOrTags: ["otel-collector", "grpc"],
    metrics: "4,850 req/min",
    enabled: true,
  },
  {
    id: "pagerduty",
    name: "PagerDuty",
    category: "Webhooks & CI/CD",
    desc: "Trigger high-severity on-call pages when cost anomaly spikes exceed $500/hour.",
    status: "Connected",
    modelsOrTags: ["on-call", "escalation"],
    metrics: "0 active incidents",
    enabled: true,
  },
  {
    id: "gcp-billing",
    name: "GCP Cloud Billing",
    category: "Cloud Billing",
    desc: "Automated BigQuery cost dataset reconciliation for Vertex AI spend audit.",
    status: "Connected",
    modelsOrTags: ["bigquery", "hourly-sync"],
    metrics: "Synced 14m ago",
    enabled: true,
  },
  {
    id: "mistral-ollama",
    name: "Mistral AI & Ollama",
    category: "Model Providers",
    desc: "On-premise GPU clusters and Mistral Large/Codestral self-hosted model gateways.",
    status: "Available",
    modelsOrTags: ["self-hosted", "local-gpu"],
    metrics: "Ready to connect",
    enabled: false,
  },
];

import { IntegrationLogoBadge } from "@/components/ui/IntegrationLogos";

interface IntegrationsGridCardProps {
  onOpenConnect: (item?: IntegrationItem) => void;
}

export function IntegrationsGridCard({ onOpenConnect }: IntegrationsGridCardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [items, setItems] = useState<IntegrationItem[]>(INTEGRATIONS_CATALOG);

  const toggleStatus = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.modelsOrTags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedFilter === "All") return matchesSearch;
    if (selectedFilter === "Connected") return matchesSearch && item.status === "Connected";
    return matchesSearch && item.category === selectedFilter;
  });

  return (
    <div className="space-y-4">
      {/* Search & Category Filter Buttons Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#787d91] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search integrations, tools, providers..."
            className="w-full bg-[#0d0f18] border border-[#1d202e] focus:border-[#dfba82] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#52576b] focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {["All", "Connected", "Model Providers", "Observability & APM", "Cloud Billing", "Webhooks & CI/CD"].map(
            (cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedFilter === cat
                    ? "bg-[#dfba82]/15 text-[#dfba82] border border-[#dfba82]/30 shadow-xs"
                    : "bg-[#0d0f18] border border-[#1d202e] text-[#8e93a6] hover:text-white"
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>
      </div>

      {/* 12 Integrations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`p-4 bg-[#0d0f18] border rounded-2xl flex flex-col justify-between space-y-3 transition-all hover:border-[#dfba82]/40 group ${
              item.status === "Connected" ? "border-[#1d202e]" : "border-[#161826] opacity-90"
            }`}
          >
            {/* Top Row: Icon + Name + Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <IntegrationLogoBadge id={item.id} />
                <div>
                  <h4 className="text-xs font-bold text-white tracking-tight">{item.name}</h4>
                  <span className="text-[10px] text-[#73788c] font-medium">{item.category}</span>
                </div>
              </div>

              {item.status === "Connected" ? (
                <button
                  type="button"
                  onClick={() => toggleStatus(item.id)}
                  className={`w-8 h-4.5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                    item.enabled ? "bg-[#dfba82]" : "bg-[#232738]"
                  }`}
                  title={item.enabled ? "Enabled" : "Disabled"}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full bg-[#07080c] transition-transform ${
                      item.enabled ? "translate-x-3.5" : "translate-x-0"
                    }`}
                  />
                </button>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-[#232738] text-[#8e93a6] text-[10px] font-semibold">
                  Available
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-[11.5px] text-[#8e93a6] leading-relaxed line-clamp-2">
              {item.desc}
            </p>

            {/* Tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {item.modelsOrTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-[#131625] border border-[#1f2338] text-[10px] font-mono text-[#c5c9d6]"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Bottom Row: Metrics + Action Button */}
            <div className="pt-3 border-t border-[#171a27] flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-[10.5px] text-[#73788c] font-mono">
                {item.status === "Connected" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] shrink-0" />
                )}
                <span>{item.metrics}</span>
              </div>

              {item.status === "Connected" ? (
                <button
                  type="button"
                  onClick={() => onOpenConnect(item)}
                  className="px-2.5 py-1 rounded-lg bg-[#141724] border border-[#232738] hover:border-[#dfba82]/40 text-[#c5c9d6] hover:text-white text-[11px] font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                >
                  <Settings className="w-3 h-3 text-[#dfba82]" />
                  <span>Configure</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenConnect(item)}
                  className="px-2.5 py-1 rounded-lg bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-[11px] font-bold transition-all inline-flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3 h-3 stroke-[3]" />
                  <span>Connect</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
