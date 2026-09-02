"use client";

import React, { useState } from "react";
import {
  OpenAILogo,
  AnthropicLogo,
  GoogleGeminiLogo,
  KimiLogo,
  MetaLlamaLogo,
  GroqLogo,
  MistralLogo,
  AWSBedrockLogo,
} from "@/components/ui/ModelLogos";
import { Cpu, ArrowRight, Layers, Sparkles } from "lucide-react";

interface ModelCardData {
  id: string;
  name: string;
  provider: "OpenAI" | "Anthropic" | "Google" | "Moonshot" | "Meta" | "Mistral";
  category: "frontier" | "fast" | "open";
  contextWindow: string;
  inputPrice: string;
  outputPrice: string;
  fallbackTarget: string;
}

export function ModelsMarquee() {
  const [activeFilter, setActiveFilter] = useState<"all" | "frontier" | "fast" | "open">("all");

  const models: ModelCardData[] = [
    {
      id: "gpt-4o",
      name: "GPT-4o",
      provider: "OpenAI",
      category: "frontier",
      contextWindow: "128k",
      inputPrice: "$2.50",
      outputPrice: "$10.00",
      fallbackTarget: "gpt-4o-mini",
    },
    {
      id: "gpt-4o-mini",
      name: "GPT-4o Mini",
      provider: "OpenAI",
      category: "fast",
      contextWindow: "128k",
      inputPrice: "$0.15",
      outputPrice: "$0.60",
      fallbackTarget: "Active Floor",
    },
    {
      id: "claude-3-5-sonnet-20241022",
      name: "Claude 3.5 Sonnet",
      provider: "Anthropic",
      category: "frontier",
      contextWindow: "200k",
      inputPrice: "$3.00",
      outputPrice: "$15.00",
      fallbackTarget: "claude-3-5-haiku",
    },
    {
      id: "claude-3-5-haiku-20241022",
      name: "Claude 3.5 Haiku",
      provider: "Anthropic",
      category: "fast",
      contextWindow: "200k",
      inputPrice: "$0.80",
      outputPrice: "$4.00",
      fallbackTarget: "Active Floor",
    },
    {
      id: "gemini-1.5-pro",
      name: "Gemini 1.5 Pro",
      provider: "Google",
      category: "frontier",
      contextWindow: "2M",
      inputPrice: "$1.25",
      outputPrice: "$5.00",
      fallbackTarget: "gemini-1.5-flash",
    },
    {
      id: "gemini-1.5-flash",
      name: "Gemini 1.5 Flash",
      provider: "Google",
      category: "fast",
      contextWindow: "1M",
      inputPrice: "$0.075",
      outputPrice: "$0.30",
      fallbackTarget: "Active Floor",
    },
    {
      id: "kimi-k1.5",
      name: "Kimi k1.5 Multimodal",
      provider: "Moonshot",
      category: "frontier",
      contextWindow: "128k",
      inputPrice: "$1.00",
      outputPrice: "$2.50",
      fallbackTarget: "moonshot-v1-8k",
    },
    {
      id: "moonshot-v1-8k",
      name: "Moonshot v1 8K",
      provider: "Moonshot",
      category: "fast",
      contextWindow: "8k",
      inputPrice: "$0.12",
      outputPrice: "$0.40",
      fallbackTarget: "Active Floor",
    },
    {
      id: "llama-3.3-70b",
      name: "Llama 3.3 70B Instruct",
      provider: "Meta",
      category: "open",
      contextWindow: "128k",
      inputPrice: "$0.55",
      outputPrice: "$0.75",
      fallbackTarget: "Active Floor",
    },
    {
      id: "mistral-large-2411",
      name: "Mistral Large 2",
      provider: "Mistral",
      category: "open",
      contextWindow: "128k",
      inputPrice: "$2.00",
      outputPrice: "$6.00",
      fallbackTarget: "mistral-small",
    },
  ];

  const filtered =
    activeFilter === "all" ? models : models.filter((m) => m.category === activeFilter);

  const getProviderLogo = (provider: ModelCardData["provider"]) => {
    switch (provider) {
      case "OpenAI":
        return <OpenAILogo className="w-4 h-4 text-white" />;
      case "Anthropic":
        return <AnthropicLogo className="w-4 h-4 text-[#DFB277]" />;
      case "Google":
        return <GoogleGeminiLogo className="w-4 h-4 text-white" />;
      case "Moonshot":
        return <KimiLogo className="w-4 h-4 text-white" />;
      case "Meta":
        return <MetaLlamaLogo className="w-4 h-4 text-blue-400" />;
      case "Mistral":
        return <MistralLogo className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <section id="models" className="py-20 bg-[#080808]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header & Filter Pills */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-[#1A1A1A]">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DFB277]/10 border border-[#DFB277]/30 text-xs font-mono text-[#DFB277]">
              <Cpu className="w-3.5 h-3.5" />
              <span>UNIFIED MODEL CATALOG</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              50+ Models. One Standard Perimeter.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Route between OpenAI, Anthropic, Gemini, Moonshot Kimi, and open-source models with zero adapter changes.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0E0E0E] border border-[#1A1A1A] shrink-0">
            {(
              [
                { id: "all", label: "All Models" },
                { id: "frontier", label: "Frontier Reasoning" },
                { id: "fast", label: "Ultra-Fast Flash" },
                { id: "open", label: "Open Weights" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  activeFilter === tab.id
                    ? "bg-[#DFB277] text-[#0E0E0E] font-bold shadow-xs"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Model Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {filtered.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-xl bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#DFB277]/40 transition-all space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-[#080808] border border-[#1A1A1A] flex items-center justify-center">
                  {getProviderLogo(m.provider)}
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141414] text-neutral-400 border border-[#222222]">
                  {m.contextWindow} ctx
                </span>
              </div>

              <div>
                <h3 className="text-xs font-bold font-mono text-white group-hover:text-[#DFB277] transition-colors truncate">
                  {m.name}
                </h3>
                <div className="text-[11px] font-mono text-neutral-500">{m.provider}</div>
              </div>

              <div className="pt-2 border-t border-[#161616] space-y-1 text-[11px] font-mono">
                <div className="flex justify-between text-neutral-400">
                  <span>Input / 1M:</span>
                  <span className="text-white font-medium">{m.inputPrice}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Output / 1M:</span>
                  <span className="text-white font-medium">{m.outputPrice}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#161616] flex items-center justify-between text-[10px] font-mono text-neutral-500">
                <span>Auto-Fallback:</span>
                <span className="text-[#10B981] font-semibold truncate max-w-[90px]">
                  {m.fallbackTarget}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
