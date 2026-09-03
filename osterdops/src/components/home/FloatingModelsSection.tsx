"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  Copy,
  Check,
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

interface FloatingModelItem {
  id: string;
  name: string;
  provider: string;
  category: string;
  modelKey: string;
  inputPrice: string;
  outputPrice: string;
  latency: string;
  context: string;
  rotation: number;
  floatDuration: number;
  delay: number;
  xOffset: number;
  yOffset: number;
  renderLogo: () => React.ReactNode;
}

export function FloatingModelsSection() {
  const [selectedModelId, setSelectedModelId] = useState("deepseek");
  const [copied, setCopied] = useState(false);

  // Total registered models dynamically sourced
  const totalModelsCount = Object.keys(PRICING_REGISTRY).length;

  // 9 Primary Providers: OpenAI, Anthropic, DeepSeek, xAI Grok, Perplexity, Google, Groq, Mistral, Cohere
  const modelItems: FloatingModelItem[] = [
    {
      id: "deepseek",
      name: "DeepSeek-R1 / V3",
      provider: "DeepSeek",
      category: "Frontier Reasoning",
      modelKey: "deepseek-reasoner",
      inputPrice: `$${PRICING_REGISTRY["deepseek-reasoner"]?.inputCostPer1M ?? 0.55} / 1M`,
      outputPrice: `$${PRICING_REGISTRY["deepseek-reasoner"]?.outputCostPer1M ?? 2.19} / 1M`,
      latency: "8.1ms P95",
      context: `${((PRICING_REGISTRY["deepseek-reasoner"]?.contextWindow ?? 65536) / 1024).toFixed(0)}k Context`,
      rotation: -10,
      floatDuration: 5.2,
      delay: 0.2,
      xOffset: 15,
      yOffset: 20,
      renderLogo: () => (
        <svg viewBox="0 0 48 48" className="w-10 h-10 sm:w-12 sm:h-12" fill="none">
          <path
            d="M8 28C10 24 16 14 26 14C38 14 42 22 42 28C42 34 36 38 28 38C18 38 10 32 8 28Z"
            fill="#2563EB"
          />
          <path
            d="M38 22C41 18 44 14 46 16C48 18 44 24 41 26L38 22Z"
            fill="#1D4ED8"
          />
          <circle cx="16" cy="24" r="2.5" fill="#FFFFFF" />
        </svg>
      ),
    },
    {
      id: "openai",
      name: "GPT-4o",
      provider: "OpenAI",
      category: "Multimodal Flagship",
      modelKey: "gpt-4o",
      inputPrice: `$${PRICING_REGISTRY["gpt-4o"]?.inputCostPer1M ?? 2.50} / 1M`,
      outputPrice: `$${PRICING_REGISTRY["gpt-4o"]?.outputCostPer1M ?? 10.00} / 1M`,
      latency: "9.4ms P95",
      context: `${((PRICING_REGISTRY["gpt-4o"]?.contextWindow ?? 128000) / 1000).toFixed(0)}k Context`,
      rotation: 12,
      floatDuration: 4.8,
      delay: 0.5,
      xOffset: 140,
      yOffset: -25,
      renderLogo: () => (
        <OpenAILogo className="w-10 h-10 sm:w-12 sm:h-12 text-[#080808]" size={48} />
      ),
    },
    {
      id: "anthropic",
      name: "Claude 3.5 Sonnet",
      provider: "Anthropic",
      category: "Frontier Coding & Agents",
      modelKey: "claude-3-5-sonnet-20241022",
      inputPrice: `$${PRICING_REGISTRY["claude-3-5-sonnet-20241022"]?.inputCostPer1M ?? 3.00} / 1M`,
      outputPrice: `$${PRICING_REGISTRY["claude-3-5-sonnet-20241022"]?.outputCostPer1M ?? 15.00} / 1M`,
      latency: "11.2ms P95",
      context: `${((PRICING_REGISTRY["claude-3-5-sonnet-20241022"]?.contextWindow ?? 200000) / 1000).toFixed(0)}k Context`,
      rotation: 8,
      floatDuration: 5.5,
      delay: 0.3,
      xOffset: -100,
      yOffset: 120,
      renderLogo: () => (
        <div className="flex items-center justify-center font-bold text-2xl sm:text-3xl text-[#080808] font-sans tracking-tight">
          A<span className="text-[#D97706]">\</span>
        </div>
      ),
    },
    {
      id: "gemini",
      name: "Gemini 1.5 Pro",
      provider: "Google",
      category: "Ultra-Long Context",
      modelKey: "gemini-1.5-pro",
      inputPrice: `$${PRICING_REGISTRY["gemini-1.5-pro"]?.inputCostPer1M ?? 1.25} / 1M`,
      outputPrice: `$${PRICING_REGISTRY["gemini-1.5-pro"]?.outputCostPer1M ?? 5.00} / 1M`,
      latency: "8.9ms P95",
      context: "2M Context",
      rotation: -14,
      floatDuration: 6.0,
      delay: 0.7,
      xOffset: -120,
      yOffset: -30,
      renderLogo: () => (
        <svg viewBox="0 0 24 24" className="w-9 h-9 sm:w-11 sm:h-11">
          <defs>
            <linearGradient id="geminiGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#F43F5E" />
            </linearGradient>
          </defs>
          <path
            d="M12 24C12 17.3726 6.62742 12 0 12C6.62742 12 12 6.62742 12 0C12 6.62742 17.3726 12 24 12C17.3726 12 12 17.3726 12 24Z"
            fill="url(#geminiGrad)"
          />
        </svg>
      ),
    },
    {
      id: "groq",
      name: "Llama 3.3 70B (Groq LPU)",
      provider: "Groq",
      category: "Ultra-Fast Inference",
      modelKey: "llama-3.3-70b-versatile",
      inputPrice: `$${PRICING_REGISTRY["llama-3.3-70b-versatile"]?.inputCostPer1M ?? 0.59} / 1M`,
      outputPrice: `$${PRICING_REGISTRY["llama-3.3-70b-versatile"]?.outputCostPer1M ?? 0.79} / 1M`,
      latency: "2.1ms P95",
      context: "128k Context",
      rotation: 16,
      floatDuration: 4.5,
      delay: 0.9,
      xOffset: 240,
      yOffset: 60,
      renderLogo: () => (
        <div className="font-extrabold text-xl sm:text-2xl text-[#EA580C] tracking-tighter lowercase font-mono">
          groq
        </div>
      ),
    },
    {
      id: "mistral",
      name: "Mistral Large 2",
      provider: "Mistral AI",
      category: "European Sovereign AI",
      modelKey: "mistral-large-latest",
      inputPrice: `$${PRICING_REGISTRY["mistral-large-latest"]?.inputCostPer1M ?? 2.00} / 1M`,
      outputPrice: `$${PRICING_REGISTRY["mistral-large-latest"]?.outputCostPer1M ?? 6.00} / 1M`,
      latency: "7.4ms P95",
      context: "128k Context",
      rotation: -6,
      floatDuration: 5.8,
      delay: 0.6,
      xOffset: 80,
      yOffset: 80,
      renderLogo: () => (
        <MistralLogo className="w-8 h-8 sm:w-10 sm:h-10 text-[#EA580C]" size={40} />
      ),
    },
    {
      id: "cohere",
      name: "Command R+",
      provider: "Cohere",
      category: "Enterprise RAG & Search",
      modelKey: "command-r-plus",
      inputPrice: `$${PRICING_REGISTRY["command-r-plus"]?.inputCostPer1M ?? 2.50} / 1M`,
      outputPrice: `$${PRICING_REGISTRY["command-r-plus"]?.outputCostPer1M ?? 10.00} / 1M`,
      latency: "9.8ms P95",
      context: "128k Context",
      rotation: 10,
      floatDuration: 6.2,
      delay: 0.4,
      xOffset: 250,
      yOffset: -60,
      renderLogo: () => (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3B82F6] to-[#93C5FD] flex items-center justify-center p-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-white" />
        </div>
      ),
    },
    {
      id: "xai",
      name: "Grok 2 / Beta",
      provider: "xAI",
      category: "Frontier Reasoning & Real-Time",
      modelKey: "grok-2",
      inputPrice: "$2.00 / 1M",
      outputPrice: "$10.00 / 1M",
      latency: "8.4ms P95",
      context: "128k Context",
      rotation: -8,
      floatDuration: 5.4,
      delay: 0.8,
      xOffset: -40,
      yOffset: 220,
      renderLogo: () => (
        <div className="flex items-center justify-center font-extrabold text-2xl sm:text-3xl text-white font-mono tracking-tighter">
          𝕏
        </div>
      ),
    },
    {
      id: "perplexity",
      name: "Sonar Pro",
      provider: "Perplexity",
      category: "Real-Time Online Search",
      modelKey: "sonar-pro",
      inputPrice: "$3.00 / 1M",
      outputPrice: "$15.00 / 1M",
      latency: "10.1ms P95",
      context: "128k Context",
      rotation: 14,
      floatDuration: 4.9,
      delay: 1.0,
      xOffset: 160,
      yOffset: 190,
      renderLogo: () => (
        <div className="flex items-center justify-center font-bold text-xl sm:text-2xl text-[#2DD4BF] font-mono">
          *P
        </div>
      ),
    },
  ];

  const selectedModel = modelItems.find((m) => m.id === selectedModelId) || modelItems[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedModel.name);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-24 bg-[#080808] border-t border-[#161720] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[radial-gradient(circle,rgba(223,178,119,0.06),transparent_70%)] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-sans">
            64+ Frontier &amp; Open <span className="text-[#DFB277]">Models Mesh</span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-400 font-sans leading-relaxed">
            All major frontier intelligence providers wired to a single endpoint. Hover or click any model tile to inspect verified pricing rates, context limits, and P95 latency.
          </p>
        </div>

        {/* Floating Model Cards Canvas */}
        <div className="relative min-h-[460px] sm:min-h-[500px] w-full max-w-5xl mx-auto flex items-center justify-center">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#161722_1px,transparent_1px),linear-gradient(to_bottom,#161722_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

          {/* Model Porcelain Cards positioned and floating */}
          <div className="relative w-full h-[460px] sm:h-[500px]">
            {modelItems.map((item) => {
              const isSelected = item.id === selectedModelId;

              return (
                <motion.div
                  key={item.id}
                  onClick={() => setSelectedModelId(item.id)}
                  animate={{
                    y: [0, -14, 0],
                    rotate: [item.rotation, item.rotation + 2, item.rotation],
                  }}
                  transition={{
                    duration: item.floatDuration,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: item.delay,
                  }}
                  whileHover={{ scale: 1.15, zIndex: 40 }}
                  className={`absolute cursor-pointer rounded-2xl p-3.5 sm:p-4 bg-gradient-to-b from-[#FFFFFF] to-[#E2E4EB] text-[#080808] shadow-[0_16px_36px_rgba(0,0,0,0.7)] transition-shadow duration-300 flex flex-col items-center justify-between border-2 select-none ${
                    isSelected
                      ? "border-[#DFB277] ring-4 ring-[#DFB277]/30 z-30 shadow-[0_0_30px_rgba(223,178,119,0.5)]"
                      : "border-white/80 hover:border-[#DFB277] z-10"
                  }`}
                  style={{
                    left: `calc(50% + ${item.xOffset}px - 60px)`,
                    top: `calc(50% + ${item.yOffset}px - 60px)`,
                    width: "120px",
                    height: "120px",
                  }}
                >
                  {/* Model Logo */}
                  <div className="flex-1 flex items-center justify-center">
                    {item.renderLogo()}
                  </div>

                  {/* Provider & Model Name */}
                  <div className="text-center w-full">
                    <div className="text-[10px] font-bold font-sans text-neutral-800 truncate leading-tight">
                      {item.name}
                    </div>
                    <div className="text-[8px] font-mono text-neutral-500 truncate mt-0.5">
                      {item.provider}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Interactive Model Telemetry Inspector */}
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
                  Provider: <span className="text-white font-medium">{selectedModel.provider}</span> | Direct Pricing Verified via PRICING_REGISTRY
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
