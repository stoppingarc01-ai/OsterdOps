"use client";

import React, { useState } from "react";
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  Copy,
  Check,
  Cpu,
} from "lucide-react";
import {
  OpenAILogo,
  AnthropicLogo,
  GoogleGeminiLogo,
  MetaLlamaLogo,
  GroqLogo,
  MistralLogo,
  CohereLogo,
} from "@/components/ui/ModelLogos";
import { PRICING_REGISTRY } from "@/lib/cost/pricing-registry";

export interface FloatingModelItem {
  id: string;
  name: string;
  provider: string;
  color: string;
  badge?: string;
  position: "center" | "left" | "right" | "bg";
  category: string;
  modelKey: string;
  inputPrice: string;
  outputPrice: string;
  latency: string;
  context: string;
  desktopCoords: { left: string; top: string };
  animClass: "animate-float-slow" | "animate-float-rev" | "animate-float-fast";
  animDelay: string;
  renderLogo: () => React.ReactNode;
}

export const FLOATING_MODELS: FloatingModelItem[] = [
  // =========================================================================
  // Center / Hero Cluster (Prominent Foreground z-20)
  // =========================================================================
  {
    id: "deepseek-r1",
    name: "DeepSeek-R1",
    provider: "DeepSeek",
    color: "#1E88E5",
    badge: "Reasoning",
    position: "center",
    category: "Frontier Reasoning",
    modelKey: "deepseek-reasoner",
    inputPrice: `$${PRICING_REGISTRY["deepseek-reasoner"]?.inputCostPer1M ?? 0.55} / 1M`,
    outputPrice: `$${PRICING_REGISTRY["deepseek-reasoner"]?.outputCostPer1M ?? 2.19} / 1M`,
    latency: "8.1ms P95",
    context: "64k Context",
    desktopCoords: { left: "34%", top: "28%" },
    animClass: "animate-float-slow",
    animDelay: "0.2s",
    renderLogo: () => (
      <svg viewBox="0 0 48 48" className="w-10 h-10 sm:w-11 sm:h-11" fill="none">
        <path
          d="M8 28C10 24 16 14 26 14C38 14 42 22 42 28C42 34 36 38 28 38C18 38 10 32 8 28Z"
          fill="#1E88E5"
        />
        <path d="M38 22C41 18 44 14 46 16C48 18 44 24 41 26L38 22Z" fill="#1565C0" />
        <circle cx="16" cy="24" r="2.5" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    id: "claude-3-7-sonnet",
    name: "Claude 3.7 Sonnet",
    provider: "Anthropic",
    color: "#D97706",
    badge: "Hybrid Reasoning",
    position: "center",
    category: "Hybrid Reasoning & Agents",
    modelKey: "claude-3-7-sonnet-20250219",
    inputPrice: `$${PRICING_REGISTRY["claude-3-7-sonnet-20250219"]?.inputCostPer1M ?? 3.00} / 1M`,
    outputPrice: `$${PRICING_REGISTRY["claude-3-7-sonnet-20250219"]?.outputCostPer1M ?? 15.00} / 1M`,
    latency: "9.2ms P95",
    context: "200k Context",
    desktopCoords: { left: "50%", top: "18%" },
    animClass: "animate-float-rev",
    animDelay: "1.4s",
    renderLogo: () => (
      <div className="flex items-center justify-center font-bold text-2xl sm:text-3xl text-[#080808] font-sans tracking-tight">
        A<span className="text-[#D97706]">\</span>
      </div>
    ),
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    color: "#10A37F",
    position: "center",
    category: "Multimodal Flagship",
    modelKey: "gpt-4o",
    inputPrice: `$${PRICING_REGISTRY["gpt-4o"]?.inputCostPer1M ?? 2.50} / 1M`,
    outputPrice: `$${PRICING_REGISTRY["gpt-4o"]?.outputCostPer1M ?? 10.00} / 1M`,
    latency: "9.4ms P95",
    context: "128k Context",
    desktopCoords: { left: "49%", top: "54%" },
    animClass: "animate-float-fast",
    animDelay: "0.8s",
    renderLogo: () => (
      <OpenAILogo className="w-10 h-10 sm:w-11 sm:h-11 text-[#10A37F]" size={44} />
    ),
  },
  {
    id: "gemini-2-flash",
    name: "Gemini 2.0 Flash",
    provider: "Google",
    color: "#3B82F6",
    badge: "Sub-Second",
    position: "center",
    category: "Low Latency Multimodal",
    modelKey: "gemini-2.0-flash",
    inputPrice: "$0.10 / 1M",
    outputPrice: "$0.40 / 1M",
    latency: "4.2ms P95",
    context: "1M Context",
    desktopCoords: { left: "34%", top: "66%" },
    animClass: "animate-float-slow",
    animDelay: "2.2s",
    renderLogo: () => (
      <svg viewBox="0 0 24 24" className="w-9 h-9 sm:w-10 sm:h-10">
        <defs>
          <linearGradient id="geminiFlashGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
        <path
          d="M12 24C12 17.3726 6.62742 12 0 12C6.62742 12 12 6.62742 12 0C12 6.62742 17.3726 12 24 12C17.3726 12 12 17.3726 12 24Z"
          fill="url(#geminiFlashGrad)"
        />
      </svg>
    ),
  },

  // =========================================================================
  // Left Flank (Floating outer-left & mid-left z-10)
  // =========================================================================
  {
    id: "gemini-1-5-pro",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    color: "#4285F4",
    position: "left",
    category: "Ultra-Long Context",
    modelKey: "gemini-1.5-pro",
    inputPrice: `$${PRICING_REGISTRY["gemini-1.5-pro"]?.inputCostPer1M ?? 1.25} / 1M`,
    outputPrice: `$${PRICING_REGISTRY["gemini-1.5-pro"]?.outputCostPer1M ?? 5.00} / 1M`,
    latency: "8.9ms P95",
    context: "2M Context",
    desktopCoords: { left: "8%", top: "40%" },
    animClass: "animate-float-rev",
    animDelay: "1.1s",
    renderLogo: () => (
      <GoogleGeminiLogo className="w-9 h-9 sm:w-10 sm:h-10 text-[#4285F4]" size={40} />
    ),
  },
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    color: "#D97706",
    position: "left",
    category: "Frontier Coding & Agents",
    modelKey: "claude-3-5-sonnet-20241022",
    inputPrice: `$${PRICING_REGISTRY["claude-3-5-sonnet-20241022"]?.inputCostPer1M ?? 3.00} / 1M`,
    outputPrice: `$${PRICING_REGISTRY["claude-3-5-sonnet-20241022"]?.outputCostPer1M ?? 15.00} / 1M`,
    latency: "10.2ms P95",
    context: "200k Context",
    desktopCoords: { left: "19%", top: "22%" },
    animClass: "animate-float-fast",
    animDelay: "2.6s",
    renderLogo: () => (
      <div className="flex items-center justify-center font-bold text-2xl sm:text-3xl text-[#080808] font-sans tracking-tight">
        A<span className="text-[#D97706]">\</span>
      </div>
    ),
  },
  {
    id: "grok-2",
    name: "Grok 2 / Beta",
    provider: "xAI",
    color: "#080808",
    position: "left",
    category: "Frontier Reasoning & Vision",
    modelKey: "grok-2",
    inputPrice: "$2.00 / 1M",
    outputPrice: "$10.00 / 1M",
    latency: "8.4ms P95",
    context: "128k Context",
    desktopCoords: { left: "6%", top: "68%" },
    animClass: "animate-float-slow",
    animDelay: "3.2s",
    renderLogo: () => (
      <div className="flex items-center justify-center font-extrabold text-2xl sm:text-3xl text-neutral-900 font-mono tracking-tighter">
        𝕏
      </div>
    ),
  },
  {
    id: "qwen-2-5-72b",
    name: "Qwen 2.5 72B",
    provider: "Alibaba Cloud",
    color: "#8B5CF6",
    badge: "Open Weights",
    position: "left",
    category: "High-Performance Open",
    modelKey: "qwen-2.5-72b-instruct",
    inputPrice: "$0.40 / 1M",
    outputPrice: "$1.20 / 1M",
    latency: "6.8ms P95",
    context: "128k Context",
    desktopCoords: { left: "18%", top: "52%" },
    animClass: "animate-float-rev",
    animDelay: "0.5s",
    renderLogo: () => (
      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#A78BFA] flex items-center justify-center text-white font-mono font-extrabold text-lg shadow-sm">
        Q
      </div>
    ),
  },
  {
    id: "mistral-codestral",
    name: "Codestral 2501",
    provider: "Mistral AI",
    color: "#F97316",
    badge: "Code Specialist",
    position: "left",
    category: "Fast Code Generation",
    modelKey: "codestral-latest",
    inputPrice: "$0.30 / 1M",
    outputPrice: "$0.90 / 1M",
    latency: "5.5ms P95",
    context: "256k Context",
    desktopCoords: { left: "19%", top: "78%" },
    animClass: "animate-float-fast",
    animDelay: "1.8s",
    renderLogo: () => (
      <MistralLogo className="w-9 h-9 sm:w-10 sm:h-10 text-[#F97316]" size={40} />
    ),
  },

  // =========================================================================
  // Right Flank (Floating outer-right & mid-right z-10)
  // =========================================================================
  {
    id: "o3-mini",
    name: "o3-mini",
    provider: "OpenAI",
    color: "#10A37F",
    badge: "Math & Code",
    position: "right",
    category: "STEM Reasoning & Math",
    modelKey: "o3-mini",
    inputPrice: "$1.10 / 1M",
    outputPrice: "$4.40 / 1M",
    latency: "7.2ms P95",
    context: "200k Context",
    desktopCoords: { left: "64%", top: "24%" },
    animClass: "animate-float-slow",
    animDelay: "2.9s",
    renderLogo: () => (
      <OpenAILogo className="w-9 h-9 sm:w-10 sm:h-10 text-[#10A37F]" size={40} />
    ),
  },
  {
    id: "groq-llama-3-3",
    name: "Llama 3.3 70B",
    provider: "Groq LPU",
    color: "#F43F5E",
    badge: "800 T/s",
    position: "right",
    category: "Ultra-Fast Inference",
    modelKey: "llama-3.3-70b-versatile",
    inputPrice: `$${PRICING_REGISTRY["llama-3.3-70b-versatile"]?.inputCostPer1M ?? 0.59} / 1M`,
    outputPrice: `$${PRICING_REGISTRY["llama-3.3-70b-versatile"]?.outputCostPer1M ?? 0.79} / 1M`,
    latency: "2.1ms P95",
    context: "128k Context",
    desktopCoords: { left: "64%", top: "54%" },
    animClass: "animate-float-fast",
    animDelay: "1.3s",
    renderLogo: () => (
      <div className="font-extrabold text-xl sm:text-2xl text-[#EA580C] tracking-tighter lowercase font-mono">
        groq
      </div>
    ),
  },
  {
    id: "command-r-plus",
    name: "Command R+",
    provider: "Cohere",
    color: "#3B82F6",
    position: "right",
    category: "Enterprise RAG & Search",
    modelKey: "command-r-plus",
    inputPrice: `$${PRICING_REGISTRY["command-r-plus"]?.inputCostPer1M ?? 2.50} / 1M`,
    outputPrice: `$${PRICING_REGISTRY["command-r-plus"]?.outputCostPer1M ?? 10.00} / 1M`,
    latency: "9.8ms P95",
    context: "128k Context",
    desktopCoords: { left: "65%", top: "78%" },
    animClass: "animate-float-rev",
    animDelay: "3.5s",
    renderLogo: () => (
      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3B82F6] to-[#93C5FD] flex items-center justify-center p-1.5 shadow-sm">
        <div className="w-3.5 h-3.5 rounded-full bg-white" />
      </div>
    ),
  },
  {
    id: "sonar-pro",
    name: "Sonar Pro",
    provider: "Perplexity",
    color: "#14B8A6",
    badge: "Live Web",
    position: "right",
    category: "Real-Time Citations",
    modelKey: "sonar-pro",
    inputPrice: "$3.00 / 1M",
    outputPrice: "$15.00 / 1M",
    latency: "10.1ms P95",
    context: "128k Context",
    desktopCoords: { left: "79%", top: "34%" },
    animClass: "animate-float-slow",
    animDelay: "0.9s",
    renderLogo: () => (
      <div className="flex items-center justify-center font-bold text-xl sm:text-2xl text-[#0D9488] font-mono">
        *P
      </div>
    ),
  },
  {
    id: "mistral-large-2",
    name: "Mistral Large 2",
    provider: "Mistral AI",
    color: "#EA580C",
    position: "right",
    category: "European Sovereign AI",
    modelKey: "mistral-large-latest",
    inputPrice: `$${PRICING_REGISTRY["mistral-large-latest"]?.inputCostPer1M ?? 2.00} / 1M`,
    outputPrice: `$${PRICING_REGISTRY["mistral-large-latest"]?.outputCostPer1M ?? 6.00} / 1M`,
    latency: "7.4ms P95",
    context: "128k Context",
    desktopCoords: { left: "79%", top: "64%" },
    animClass: "animate-float-rev",
    animDelay: "2.4s",
    renderLogo: () => (
      <MistralLogo className="w-8 h-8 sm:w-10 sm:h-10 text-[#EA580C]" size={40} />
    ),
  },

  // =========================================================================
  // Background Orbiters (Far Outer Margins, Scale 75%, Opacity 45% z-0)
  // =========================================================================
  {
    id: "deepseek-v3",
    name: "DeepSeek-V3",
    provider: "DeepSeek",
    color: "#0284C7",
    badge: "671B MoE",
    position: "bg",
    category: "Efficient MoE Architecture",
    modelKey: "deepseek-chat",
    inputPrice: "$0.27 / 1M",
    outputPrice: "$1.10 / 1M",
    latency: "7.8ms P95",
    context: "64k Context",
    desktopCoords: { left: "3%", top: "16%" },
    animClass: "animate-float-slow",
    animDelay: "4.0s",
    renderLogo: () => (
      <svg viewBox="0 0 48 48" className="w-8 h-8 sm:w-9 sm:h-9" fill="none">
        <path
          d="M8 28C10 24 16 14 26 14C38 14 42 22 42 28C42 34 36 38 28 38C18 38 10 32 8 28Z"
          fill="#0284C7"
        />
        <circle cx="16" cy="24" r="2.5" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    id: "llama-3-1-405b",
    name: "Llama 3.1 405B",
    provider: "Meta Open",
    color: "#3B82F6",
    badge: "405B Heavy",
    position: "bg",
    category: "Frontier Open Weights",
    modelKey: "llama-3.1-405b-instruct",
    inputPrice: "$2.00 / 1M",
    outputPrice: "$2.00 / 1M",
    latency: "14.5ms P95",
    context: "128k Context",
    desktopCoords: { left: "91%", top: "18%" },
    animClass: "animate-float-fast",
    animDelay: "1.7s",
    renderLogo: () => (
      <MetaLlamaLogo className="w-8 h-8 sm:w-9 sm:h-9 text-[#3B82F6]" size={36} />
    ),
  },
  {
    id: "flux-schnell",
    name: "Flux.1 Schnell",
    provider: "Black Forest Labs",
    color: "#A855F7",
    badge: "Diffusion",
    position: "bg",
    category: "Next-Gen Generative",
    modelKey: "flux-schnell",
    inputPrice: "$0.003 / Img",
    outputPrice: "$0.003 / Gen",
    latency: "850ms P95",
    context: "1024x1024",
    desktopCoords: { left: "91%", top: "76%" },
    animClass: "animate-float-rev",
    animDelay: "3.1s",
    renderLogo: () => (
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#9333EA] to-[#C084FC] flex items-center justify-center text-white font-bold font-sans text-xs shadow-xs">
        FX
      </div>
    ),
  },
];

export function FloatingModelsSection() {
  const [selectedModelId, setSelectedModelId] = useState("deepseek-r1");
  const [copied, setCopied] = useState(false);

  const selectedModel =
    FLOATING_MODELS.find((m) => m.id === selectedModelId) || FLOATING_MODELS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedModel.name);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-24 sm:py-32 bg-[#080808] border-t border-[#161720] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[650px] bg-[radial-gradient(ellipse_at_center,rgba(223,178,119,0.06),transparent_70%)] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-14 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#DFB277]/10 border border-[#DFB277]/25 text-[#DFB277] text-xs font-mono font-semibold tracking-wider uppercase shadow-[0_0_12px_rgba(223,178,119,0.15)]">
            <Layers className="w-3.5 h-3.5 text-[#DFB277]" />
            <span>Universal Model Mesh &amp; Proxies</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-sans">
            64+ Frontier &amp; Open <span className="text-[#DFB277]">Models Mesh</span>
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 font-sans leading-relaxed">
            All major frontier intelligence providers and open-weight models wired to a single high-availability endpoint. Hover or click any floating tile to inspect verified token pricing, context limits, and P95 latency.
          </p>
        </div>

        {/* Expansive Multi-Layered Floating Canvas (w-full max-w-7xl) */}
        <div className="relative min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] w-full max-w-7xl mx-auto flex items-center justify-center overflow-hidden rounded-3xl border border-[#171822] bg-[#07080D]">
          {/* Ambient perspective grid */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#DFB277 0.8px, transparent 0.8px)`,
              backgroundSize: "32px 32px",
            }}
          />

          {/* Desktop & Tablet Absolute Multi-Layered Floating Mesh */}
          <div className="hidden md:block relative w-full h-[580px] sm:h-[640px] lg:h-[700px]">
            {FLOATING_MODELS.map((item) => {
              const isSelected = item.id === selectedModelId;
              const isCenter = item.position === "center";
              const isBg = item.position === "bg";

              // Layering classes based on spatial tier
              let layerClasses = "z-10 scale-90 sm:scale-95 opacity-85";
              if (isCenter) {
                layerClasses = "z-20 scale-100 opacity-100";
              } else if (isBg) {
                layerClasses = "z-0 scale-75 opacity-40 blur-[0.5px] hover:blur-none hover:opacity-100 hover:z-30";
              }

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedModelId(item.id)}
                  onMouseEnter={() => setSelectedModelId(item.id)}
                  style={{
                    left: item.desktopCoords.left,
                    top: item.desktopCoords.top,
                    animationDelay: item.animDelay,
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${item.animClass} ${layerClasses}`}
                >
                  <div
                    className={`relative cursor-pointer rounded-2xl p-3.5 sm:p-4 bg-gradient-to-b from-[#FFFFFF] via-[#F8F9FD] to-[#E2E5EE] text-[#080808] shadow-[0_16px_36px_rgba(0,0,0,0.65)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.85)] transition-all duration-300 flex flex-col items-center justify-between border-2 select-none group ${
                      isSelected
                        ? "border-[#DFB277] ring-4 ring-[#DFB277]/35 shadow-[0_0_30px_rgba(223,178,119,0.45)] scale-110 z-40"
                        : "border-white/80 hover:border-[#DFB277]/80 hover:scale-105"
                    }`}
                    style={{
                      width: isCenter ? "126px" : isBg ? "106px" : "118px",
                      height: isCenter ? "126px" : isBg ? "106px" : "118px",
                    }}
                  >
                    {/* Badge */}
                    {item.badge && (
                      <div className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded-full bg-[#0A0B10] border border-[#2A2D3C] text-[#DFB277] text-[8.5px] font-mono font-bold tracking-tight shadow-md">
                        {item.badge}
                      </div>
                    )}

                    {/* Logo */}
                    <div className="flex-1 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {item.renderLogo()}
                    </div>

                    {/* Model Details */}
                    <div className="text-center w-full pt-1">
                      <div className="text-[10.5px] font-bold font-sans text-neutral-900 truncate leading-tight">
                        {item.name}
                      </div>
                      <div className="text-[8.5px] font-mono text-neutral-500 truncate mt-0.5">
                        {item.provider}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Fallback Grid for Compact Touch Screens (< 768px) */}
          <div className="md:hidden w-full p-4 grid grid-cols-3 gap-3">
            {FLOATING_MODELS.slice(0, 12).map((item) => {
              const isSelected = item.id === selectedModelId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedModelId(item.id)}
                  className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all bg-gradient-to-b from-[#FFFFFF] to-[#E5E8F0] text-[#080808] border-2 ${
                    isSelected
                      ? "border-[#DFB277] ring-2 ring-[#DFB277]/40 shadow-lg scale-105"
                      : "border-white/70"
                  }`}
                >
                  <div className="w-8 h-8 flex items-center justify-center mb-1">
                    {item.renderLogo()}
                  </div>
                  <div className="text-[9.5px] font-bold text-neutral-900 truncate w-full">
                    {item.name}
                  </div>
                  <div className="text-[8px] font-mono text-neutral-500 truncate w-full">
                    {item.provider}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Model Telemetry Inspector Panel */}
        <div className="max-w-4xl mx-auto rounded-2xl bg-[#0C0D12] border border-[#1A1C28] p-5 sm:p-6 space-y-4 shadow-[0_15px_45px_rgba(0,0,0,0.8)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#181924]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-md shrink-0">
                {selectedModel.renderLogo()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold font-sans text-white">
                    {selectedModel.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-[#DFB277]/15 text-[#DFB277] border border-[#DFB277]/30 text-[10px] font-mono font-semibold">
                    {selectedModel.category}
                  </span>
                </div>
                <div className="text-xs text-neutral-400 font-mono mt-0.5">
                  Provider: <span className="text-white font-medium">{selectedModel.provider}</span> • Zero Markup Wire Routing
                </div>
              </div>
            </div>

            {/* Copy Model Slug */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#141620] hover:bg-[#1E2130] border border-[#232637] text-xs font-mono text-neutral-300 hover:text-white transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#10B981]" />
                  <span className="text-[#10B981]">Slug Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Copy Model Identifier</span>
                </>
              )}
            </button>
          </div>

          {/* Telemetry Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[#08080B] border border-[#161722] space-y-1">
              <div className="text-[10px] font-mono text-neutral-500 uppercase">Input Token Rate</div>
              <div className="text-sm sm:text-base font-bold font-mono text-white">
                {selectedModel.inputPrice}
              </div>
              <div className="text-[10px] text-[#10B981] font-mono">Zero Markup</div>
            </div>

            <div className="p-3 rounded-xl bg-[#08080B] border border-[#161722] space-y-1">
              <div className="text-[10px] font-mono text-neutral-500 uppercase">Output Token Rate</div>
              <div className="text-sm sm:text-base font-bold font-mono text-white">
                {selectedModel.outputPrice}
              </div>
              <div className="text-[10px] text-[#10B981] font-mono">Direct Pass-Through</div>
            </div>

            <div className="p-3 rounded-xl bg-[#08080B] border border-[#161722] space-y-1">
              <div className="text-[10px] font-mono text-neutral-500 uppercase">Context Window</div>
              <div className="text-sm sm:text-base font-bold font-mono text-white">
                {selectedModel.context}
              </div>
              <div className="text-[10px] text-neutral-400 font-mono">Full Upstream SLA</div>
            </div>

            <div className="p-3 rounded-xl bg-[#08080B] border border-[#161722] space-y-1">
              <div className="text-[10px] font-mono text-neutral-500 uppercase">Gateway Wire Overhead</div>
              <div className="text-sm sm:text-base font-bold font-mono text-[#10B981]">
                &lt; 15µs
              </div>
              <div className="text-[10px] text-neutral-400 font-mono">Deterministic Routing</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Named alias export for compatibility
export const ModelsMesh = FloatingModelsSection;
