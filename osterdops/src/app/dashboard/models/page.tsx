"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { AddModelModal } from "@/components/models/AddModelModal";
import { ModelProviderLogo } from "@/components/ui/ModelLogos";
import { useAuth } from "@/context/AuthContext";
import type { ProviderConnection } from "@/types";
import {
  Workflow,
  CheckCircle2,
  Lock,
  RefreshCw,
  Search,
  Zap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Activity,
  Plus,
  Server,
  KeyRound,
  Check,
} from "lucide-react";

interface CatalogModel {
  id: string;
  name: string;
  provider: string;
  providerDisplayName: string;
  category: "frontier" | "reasoning" | "open-weights" | "embeddings" | "multimodal";
  contextWindow: string;
  inputCostPer1M: string;
  outputCostPer1M: string;
  description: string;
  capabilities: {
    vision: boolean;
    reasoning: boolean;
    streaming: boolean;
  };
  fallbackModel?: string;
  popular?: boolean;
}

const CURATED_MODELS: CatalogModel[] = [
  // Google Gemini
  {
    id: "gemini-2.0-flash-exp",
    name: "Gemini 2.0 Flash Experimental",
    provider: "gemini",
    providerDisplayName: "Google Gemini",
    category: "frontier",
    contextWindow: "1M tokens",
    inputCostPer1M: "$0.10",
    outputCostPer1M: "$0.40",
    description: "Next-gen multimodal workhorse with breakthrough latency and native tool use.",
    capabilities: { vision: true, reasoning: false, streaming: true },
    fallbackModel: "gemini-1.5-flash",
    popular: true,
  },
  {
    id: "gemini-2.0-flash-thinking-exp",
    name: "Gemini 2.0 Flash Thinking",
    provider: "gemini",
    providerDisplayName: "Google Gemini",
    category: "reasoning",
    contextWindow: "1M tokens",
    inputCostPer1M: "$0.10",
    outputCostPer1M: "$0.40",
    description: "Chain-of-thought thinking model displaying internal reasoning before output.",
    capabilities: { vision: true, reasoning: true, streaming: true },
    fallbackModel: "gemini-2.0-flash-exp",
    popular: true,
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "gemini",
    providerDisplayName: "Google Gemini",
    category: "frontier",
    contextWindow: "2M tokens",
    inputCostPer1M: "$1.25",
    outputCostPer1M: "$5.00",
    description: "Massive 2M token context window for full-repository parsing and video analysis.",
    capabilities: { vision: true, reasoning: false, streaming: true },
    fallbackModel: "gemini-1.5-flash",
    popular: true,
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "gemini",
    providerDisplayName: "Google Gemini",
    category: "frontier",
    contextWindow: "1M tokens",
    inputCostPer1M: "$0.075",
    outputCostPer1M: "$0.30",
    description: "Cost-optimized high-frequency multimodal chat and high-volume summarization.",
    capabilities: { vision: true, reasoning: false, streaming: true },
    fallbackModel: "gemini-1.5-flash-8b",
  },

  // OpenAI
  {
    id: "gpt-4o",
    name: "GPT-4o (Omni)",
    provider: "openai",
    providerDisplayName: "OpenAI",
    category: "frontier",
    contextWindow: "128k tokens",
    inputCostPer1M: "$2.50",
    outputCostPer1M: "$10.00",
    description: "Industry flagship multimodal model with precise instruction following and structured outputs.",
    capabilities: { vision: true, reasoning: false, streaming: true },
    fallbackModel: "gpt-4o-mini",
    popular: true,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    providerDisplayName: "OpenAI",
    category: "frontier",
    contextWindow: "128k tokens",
    inputCostPer1M: "$0.15",
    outputCostPer1M: "$0.60",
    description: "Affordable small model for high-throughput daily text and computer vision pipelines.",
    capabilities: { vision: true, reasoning: false, streaming: true },
    fallbackModel: "gpt-3.5-turbo",
    popular: true,
  },
  {
    id: "o3-mini",
    name: "o3-mini",
    provider: "openai",
    providerDisplayName: "OpenAI",
    category: "reasoning",
    contextWindow: "200k tokens",
    inputCostPer1M: "$1.10",
    outputCostPer1M: "$4.40",
    description: "Frontier STEM and code reasoning with developer-configurable reasoning effort levels.",
    capabilities: { vision: false, reasoning: true, streaming: true },
    fallbackModel: "gpt-4o-mini",
    popular: true,
  },
  {
    id: "o1-preview",
    name: "o1-preview",
    provider: "openai",
    providerDisplayName: "OpenAI",
    category: "reasoning",
    contextWindow: "128k tokens",
    inputCostPer1M: "$15.00",
    outputCostPer1M: "$60.00",
    description: "Deep mathematical reasoning and complex multi-step algorithmic problem solving.",
    capabilities: { vision: false, reasoning: true, streaming: true },
    fallbackModel: "o1-mini",
  },

  // Anthropic Claude
  {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet (Latest)",
    provider: "anthropic",
    providerDisplayName: "Anthropic",
    category: "frontier",
    contextWindow: "200k tokens",
    inputCostPer1M: "$3.00",
    outputCostPer1M: "$15.00",
    description: "Benchmark-leading coding intelligence, agentic workflow execution, and computer use.",
    capabilities: { vision: true, reasoning: false, streaming: true },
    fallbackModel: "claude-3-5-haiku-20241022",
    popular: true,
  },
  {
    id: "claude-3-5-haiku-20241022",
    name: "Claude 3.5 Haiku",
    provider: "anthropic",
    providerDisplayName: "Anthropic",
    category: "frontier",
    contextWindow: "200k tokens",
    inputCostPer1M: "$0.80",
    outputCostPer1M: "$4.00",
    description: "Ultra-fast lightweight intelligence rivaling previous-generation frontier models.",
    capabilities: { vision: false, reasoning: false, streaming: true },
    fallbackModel: "claude-3-haiku-20240307",
  },
  {
    id: "claude-3-opus-20240229",
    name: "Claude 3 Opus",
    provider: "anthropic",
    providerDisplayName: "Anthropic",
    category: "frontier",
    contextWindow: "200k tokens",
    inputCostPer1M: "$15.00",
    outputCostPer1M: "$75.00",
    description: "Deep analytical and literary synthesis for nuanced research and strategic analysis.",
    capabilities: { vision: true, reasoning: false, streaming: true },
    fallbackModel: "claude-3-5-sonnet-20241022",
  },

  // Meta (LLaMA) & Groq
  {
    id: "llama-3.3-70b-versatile",
    name: "LLaMA 3.3 70B Versatile",
    provider: "groq",
    providerDisplayName: "Meta / Groq",
    category: "open-weights",
    contextWindow: "128k tokens",
    inputCostPer1M: "$0.59",
    outputCostPer1M: "$0.79",
    description: "Industry-leading 70B open model matching previous-gen 405B benchmark performance.",
    capabilities: { vision: false, reasoning: false, streaming: true },
    fallbackModel: "llama-3.1-8b-instant",
    popular: true,
  },
  {
    id: "llama-3.1-405b-instruct",
    name: "LLaMA 3.1 405B Instruct",
    provider: "groq",
    providerDisplayName: "Meta / Groq",
    category: "open-weights",
    contextWindow: "128k tokens",
    inputCostPer1M: "$2.00",
    outputCostPer1M: "$2.00",
    description: "Flagship 405B open-weights model for synthetic data generation and complex logic.",
    capabilities: { vision: false, reasoning: false, streaming: true },
    fallbackModel: "llama-3.3-70b-versatile",
  },
  {
    id: "llama-3.1-8b-instant",
    name: "LLaMA 3.1 8B Instant",
    provider: "groq",
    providerDisplayName: "Meta / Groq",
    category: "open-weights",
    contextWindow: "128k tokens",
    inputCostPer1M: "$0.05",
    outputCostPer1M: "$0.08",
    description: "Sub-second inference at negligible cost for classification and routing agents.",
    capabilities: { vision: false, reasoning: false, streaming: true },
    fallbackModel: "llama-3.2-3b",
  },
  {
    id: "llama-3.2-90b-vision",
    name: "LLaMA 3.2 90B Vision",
    provider: "groq",
    providerDisplayName: "Meta / Groq",
    category: "multimodal",
    contextWindow: "128k tokens",
    inputCostPer1M: "$0.90",
    outputCostPer1M: "$0.90",
    description: "Multimodal visual reasoning for document parsing, charting, and image QA.",
    capabilities: { vision: true, reasoning: false, streaming: true },
  },

  // Mistral AI
  {
    id: "mistral-large-latest",
    name: "Mistral Large (2411)",
    provider: "mistral",
    providerDisplayName: "Mistral AI",
    category: "frontier",
    contextWindow: "128k tokens",
    inputCostPer1M: "$2.00",
    outputCostPer1M: "$6.00",
    description: "Top-tier multilingual reasoning, function calling, and structured JSON output.",
    capabilities: { vision: false, reasoning: false, streaming: true },
  },

  // Embeddings
  {
    id: "text-embedding-3-large",
    name: "Text Embedding 3 Large",
    provider: "openai",
    providerDisplayName: "OpenAI",
    category: "embeddings",
    contextWindow: "8,191 tokens",
    inputCostPer1M: "$0.13",
    outputCostPer1M: "$0.00",
    description: "High-dimensional vector embeddings for enterprise semantic search and RAG.",
    capabilities: { vision: false, reasoning: false, streaming: false },
  },
  {
    id: "text-embedding-004",
    name: "Text Embedding 004",
    provider: "gemini",
    providerDisplayName: "Google Gemini",
    category: "embeddings",
    contextWindow: "2,048 tokens",
    inputCostPer1M: "$0.025",
    outputCostPer1M: "$0.00",
    description: "Ultra-low-cost semantic embeddings with dynamic output dimensionality.",
    capabilities: { vision: false, reasoning: false, streaming: false },
  },
];

export default function DashboardModelsPage() {
  const { currentOrg, organizations } = useAuth();
  const effectiveOrgId = currentOrg?.id || organizations[0]?.organization?.id || "";

  // Active Connections State
  const [connections, setConnections] = useState<ProviderConnection[]>([]);
  const [isLoadingConnections, setIsLoadingConnections] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // Direct Integration Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preSelectedProvider, setPreSelectedProvider] = useState<string | undefined>(undefined);
  const [preSelectedModel, setPreSelectedModel] = useState<string | undefined>(undefined);

  // Fetch real active connections
  const fetchConnections = async () => {
    if (!effectiveOrgId) {
      setIsLoadingConnections(false);
      return;
    }

    try {
      setIsLoadingConnections(true);
      const res = await fetch(`/api/v1/provider-connections?organizationId=${effectiveOrgId}`);
      if (res.ok) {
        const data = await res.json();
        setConnections(Array.isArray(data?.data) ? data.data : []);
      }
    } catch (err) {
      console.error("Failed to load integrations:", err);
    } finally {
      setIsLoadingConnections(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [effectiveOrgId]);

  // Handle direct model integration click
  const handleDirectIntegrate = (model: CatalogModel) => {
    setPreSelectedProvider(model.provider);
    setPreSelectedModel(model.id);
    setIsModalOpen(true);
  };

  // Filtered models
  const filteredModels = useMemo(() => {
    return CURATED_MODELS.filter((m) => {
      // Filter tab
      if (activeFilter === "gemini" && m.provider !== "gemini") return false;
      if (activeFilter === "openai" && m.provider !== "openai") return false;
      if (activeFilter === "anthropic" && m.provider !== "anthropic") return false;
      if (activeFilter === "groq" && m.provider !== "groq" && !m.id.startsWith("llama")) return false;
      if (activeFilter === "reasoning" && !m.capabilities.reasoning) return false;
      if (activeFilter === "embeddings" && m.category !== "embeddings") return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesId = m.id.toLowerCase().includes(q);
        const matchesProvider = m.providerDisplayName.toLowerCase().includes(q);
        const matchesDesc = m.description.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesProvider && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  }, [activeFilter, searchQuery]);

  // Model filter counts
  const filterCounts = useMemo(() => {
    return {
      all: CURATED_MODELS.length,
      gemini: CURATED_MODELS.filter((m) => m.provider === "gemini").length,
      openai: CURATED_MODELS.filter((m) => m.provider === "openai").length,
      anthropic: CURATED_MODELS.filter((m) => m.provider === "anthropic").length,
      groq: CURATED_MODELS.filter((m) => m.provider === "groq" || m.id.startsWith("llama")).length,
      reasoning: CURATED_MODELS.filter((m) => m.capabilities.reasoning).length,
      embeddings: CURATED_MODELS.filter((m) => m.category === "embeddings").length,
    };
  }, []);

  const filterTabs = [
    { id: "all", label: `All Models (${filterCounts.all})` },
    { id: "gemini", label: `Google Gemini (${filterCounts.gemini})` },
    { id: "openai", label: `OpenAI (${filterCounts.openai})` },
    { id: "anthropic", label: `Anthropic (${filterCounts.anthropic})` },
    { id: "groq", label: `Meta / Groq (${filterCounts.groq})` },
    { id: "reasoning", label: `Reasoning (${filterCounts.reasoning})` },
    { id: "embeddings", label: `Embeddings (${filterCounts.embeddings})` },
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-neutral-200 flex flex-col lg:flex-row selection:bg-[#DFB277] selection:text-[#0E0E0E] font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full space-y-8">
        <ContentTransition>
          {/* Top Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#1A1A1A]">
            <div>
              <div className="flex items-center gap-2 text-[#D4A362] text-xs font-mono tracking-wider uppercase mb-1">
                <Workflow className="w-3.5 h-3.5" />
                <span>Enterprise Model Gateway</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                AI Provider Integrations & Model Catalog
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                Browse every major frontier and open model with logos, connect upstream credentials, and generate drop-in proxy snippets.
              </p>
            </div>

            <button
              onClick={() => {
                setPreSelectedProvider(undefined);
                setPreSelectedModel(undefined);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#DFB277] text-[#0E0E0E] hover:bg-[#E5C38E] text-xs font-semibold transition-all shadow-sm shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              + Connect Custom / BYO Model
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-xl bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] transition-all space-y-1">
              <div className="text-[11px] font-mono uppercase text-neutral-400 flex items-center justify-between">
                <span>Available Catalog Models</span>
                <Layers className="w-3.5 h-3.5 text-[#D4A362]" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">{CURATED_MODELS.length}</div>
              <div className="text-[11px] text-neutral-500 font-mono">Frontier, Reasoning & Open Weights</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] transition-all space-y-1">
              <div className="text-[11px] font-mono uppercase text-neutral-400 flex items-center justify-between">
                <span>Active Workspace Keys</span>
                <KeyRound className="w-3.5 h-3.5 text-[#D4A362]" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">
                {connections.filter((c) => c.status === "active").length}
              </div>
              <div className="text-[11px] text-neutral-500 font-mono">Connected & authorized for proxy</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] transition-all space-y-1">
              <div className="text-[11px] font-mono uppercase text-neutral-400 flex items-center justify-between">
                <span>Credential Security</span>
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              </div>
              <div className="text-sm font-semibold text-[#10B981] font-mono mt-1 flex items-center gap-1.5">
                <Check className="w-4 h-4" /> AES-256-GCM Vault
              </div>
              <div className="text-[11px] text-neutral-500 font-mono">Zero plaintext key storage</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] transition-all space-y-1">
              <div className="text-[11px] font-mono uppercase text-neutral-400 flex items-center justify-between">
                <span>Gateway Status</span>
                <Zap className="w-3.5 h-3.5 text-[#D4A362]" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">100% Operational</div>
              <div className="text-[11px] text-neutral-500 font-mono">Dynamic routing & FinOps fallback</div>
            </div>
          </div>

          {/* ========================================================
              DIRECT MODEL INTEGRATION SECTION
             ======================================================== */}
          <section className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase bg-[#D4A362]/5 text-[#D4A362] border border-[#D4A362]/40 mb-2">
                  <Sparkles className="w-3 h-3 text-[#D4A362]" />
                  Direct Model Catalog & 1-Click Integration
                </div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Choose a Model to Integrate
                </h2>
                <p className="text-xs text-neutral-400">
                  Select any model below to connect credentials, test upstream connectivity, and receive your 1-line gateway proxy snippet.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search gpt-4o, claude, gemini, llama..."
                  className="w-full bg-[#0E0E0E] border border-[#1A1A1A] rounded-lg pl-9 pr-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#D4A362]/60 font-mono"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all border cursor-pointer ${
                    activeFilter === tab.id
                      ? "bg-[#D4A362]/10 border-[#D4A362]/60 text-[#E5C38E] font-semibold"
                      : "bg-[#0E0E0E] border-[#1A1A1A] text-neutral-400 hover:text-neutral-200 hover:border-[#262626]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Model Cards Grid with Provider Logos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              {filteredModels.map((model) => {
                // Check if organization already has an active connection configured for this model/provider
                const isProviderConnected = connections.some((c) => {
                  if (c.status !== "active") return false;
                  const cp = c.provider.toLowerCase();
                  const mp = model.provider.toLowerCase();
                  if (cp === mp) return true;
                  if (mp === "groq" && cp === "meta") return true;
                  if (model.id && (c.defaultModel === model.id || (c.models && c.models.includes(model.id)))) return true;
                  return false;
                });

                return (
                  <div
                    key={model.id}
                    className="p-5 rounded-xl bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      {/* Top Header: Authentic Brand Logo + Provider & Badges */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <ModelProviderLogo provider={model.provider} modelId={model.id} size="md" />
                          <div>
                            <div className="text-[11px] font-mono uppercase text-[#D4A362] tracking-wider">
                              {model.providerDisplayName}
                            </div>
                            <h3 className="text-sm font-bold text-white group-hover:text-[#E5C38E] transition-colors">
                              {model.name}
                            </h3>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          {isProviderConnected ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 shrink-0">
                              <CheckCircle2 className="w-3 h-3" />
                              Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#161616] text-neutral-400 border border-[#222222] shrink-0">
                              Connect Key
                            </span>
                          )}

                          {model.popular && (
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-mono uppercase font-bold bg-[#D4A362]/5 text-[#D4A362] border border-[#D4A362]/40">
                              POPULAR
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-[11px] font-mono text-neutral-500 bg-[#0A0A0A] px-2.5 py-1 rounded border border-[#161616] truncate">
                        ID: <span className="text-neutral-300">{model.id}</span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                        {model.description}
                      </p>

                      {/* Context Window & Pricing Chips */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#161616] text-[11px] font-mono">
                        <div className="p-2 rounded bg-[#0A0A0A] border border-[#161616]">
                          <div className="text-neutral-500 text-[10px]">Context Window</div>
                          <div className="text-neutral-200 font-semibold mt-0.5">{model.contextWindow}</div>
                        </div>

                        <div className="p-2 rounded bg-[#0A0A0A] border border-[#161616]">
                          <div className="text-neutral-500 text-[10px]">Token Cost ($/1M)</div>
                          <div className="text-neutral-200 font-semibold mt-0.5">
                            {model.inputCostPer1M} / {model.outputCostPer1M}
                          </div>
                        </div>
                      </div>

                      {/* Capability Tags */}
                      <div className="flex flex-wrap gap-1">
                        {model.capabilities.vision && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0A0A0A] text-neutral-300 border border-[#161616]">
                            Vision
                          </span>
                        )}
                        {model.capabilities.reasoning && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#D4A362]/10 text-[#D4A362] border border-[#D4A362]/40 font-semibold">
                            Reasoning
                          </span>
                        )}
                        {model.capabilities.streaming && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0A0A0A] text-neutral-400 border border-[#161616]">
                            Streaming
                          </span>
                        )}
                        {model.fallbackModel && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0A0A0A] text-neutral-500 border border-[#161616]">
                            Fallback: {model.fallbackModel}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Ghost Action Button (Card Bottom CTA) */}
                    <div className="pt-3 border-t border-[#161616]">
                      <button
                        onClick={() => handleDirectIntegrate(model)}
                        className="w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all bg-[#0E0E0E] hover:bg-[#141414] border border-[#222222] hover:border-[#D4A362]/50 text-[#D1D1D1] hover:text-white cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 text-[#D4A362]" />
                        <span>{isProviderConnected ? "Configure & Route Model" : "Integrate Model Directly"}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#D4A362]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredModels.length === 0 && (
              <div className="p-8 rounded-xl bg-[#0E0E0E] border border-[#1A1A1A] text-center space-y-2">
                <Search className="w-6 h-6 text-neutral-600 mx-auto" />
                <div className="text-sm font-semibold text-white">No models match your search</div>
                <div className="text-xs text-neutral-400">
                  Try searching for another keyword or click below to connect a custom endpoint.
                </div>
                <button
                  onClick={() => {
                    setPreSelectedProvider("custom");
                    setPreSelectedModel(searchQuery.trim() || undefined);
                    setIsModalOpen(true);
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141414] border border-[#222222] hover:border-[#D4A362]/50 text-neutral-200 text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#D4A362]" />
                  Connect &quot;{searchQuery || "Custom"}&quot; via Custom OpenAI-Compatible
                </button>
              </div>
            )}
          </section>

          {/* ========================================================
              ACTIVE WORKSPACE CREDENTIALS & CONNECTIONS SECTION
             ======================================================== */}
          <section className="space-y-4 pt-4 border-t border-[#1A1A1A]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#10B981]" />
                  Configured Provider Credentials
                </h2>
                <p className="text-xs text-neutral-400">
                  Encrypted AES-256-GCM credentials authorized for multi-tenant gateway proxy routing.
                </p>
              </div>

              <button
                onClick={fetchConnections}
                disabled={isLoadingConnections}
                className="p-2 rounded-lg bg-[#0E0E0E] border border-[#1A1A1A] text-neutral-400 hover:text-white hover:border-[#262626] transition-colors cursor-pointer"
                title="Refresh Credentials"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingConnections ? "animate-spin text-[#D4A362]" : ""}`} />
              </button>
            </div>

            {connections.length === 0 && !isLoadingConnections && (
              <div className="p-6 rounded-xl bg-[#0E0E0E] border border-[#1A1A1A] text-center space-y-2">
                <Server className="w-8 h-8 text-neutral-600 mx-auto" />
                <div className="text-sm font-semibold text-white">No Credentials Configured Yet</div>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  Select any model above to connect your upstream key, or configure a custom endpoint.
                </p>
              </div>
            )}

            {connections.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connections.map((conn) => (
                  <div
                    key={conn.id}
                    className="p-5 rounded-xl bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <ModelProviderLogo provider={conn.provider} size="md" />
                          <div>
                            <div className="text-[11px] font-mono uppercase text-[#D4A362]">{conn.provider}</div>
                            <div className="font-bold text-sm text-white mt-0.5">{conn.name}</div>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30">
                          <CheckCircle2 className="w-3 h-3" />
                          {conn.status === "active" ? "Operational" : conn.status}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-[#0A0A0A] border border-[#161616] text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-500">Encryption Standard:</span>
                          <span className="inline-flex items-center gap-1 text-[#10B981] font-mono text-[11px]">
                            <Lock className="w-3 h-3" />
                            AES-256-GCM
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-500">Masked Key Hint:</span>
                          <span className="font-mono text-[#D4A362] text-[11px]">{conn.maskedKey}</span>
                        </div>
                        {conn.customBaseUrl && (
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-500">Custom URL:</span>
                            <span className="font-mono text-neutral-300 text-[11px] truncate max-w-[200px]">
                              {conn.customBaseUrl}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setPreSelectedProvider(conn.provider);
                        setPreSelectedModel(conn.defaultModel || undefined);
                        setIsModalOpen(true);
                      }}
                      className="w-full py-2 rounded-lg bg-[#0E0E0E] hover:bg-[#141414] text-xs font-semibold text-[#D1D1D1] hover:text-white transition-colors border border-[#222222] hover:border-[#D4A362]/50 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Update Credential / Models
                      <ArrowRight className="w-3.5 h-3.5 text-[#D4A362]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </ContentTransition>
      </main>

      {/* 3-Step Bring Your Own Model & Key Wizard Modal */}
      <AddModelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchConnections();
        }}
        initialOrgId={effectiveOrgId}
        initialProvider={preSelectedProvider}
        initialModel={preSelectedModel}
      />
    </div>
  );
}
