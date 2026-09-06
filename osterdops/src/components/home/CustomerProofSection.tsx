"use client";

import React, { useState } from "react";
import {
  Quote,
  CheckCircle2,
  TrendingDown,
  ShieldCheck,
  Zap,
  Building2,
  Cpu,
  Lock,
} from "lucide-react";

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  metric: string;
  metricLabel: string;
  category: "FinOps" | "Reliability" | "Security";
  tag: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "synthetix",
    quote:
      "We had a runaway LangChain agent loop fire 40,000 recursive tool calls at 3 AM. OsterdOps pre-flight FinOps circuit breaker tripped at $200 and cut the loop immediately, preventing an unbudgeted spike on our credit card.",
    author: "Alex Vance",
    role: "Head of AI Platform",
    company: "Synthetix AI",
    metric: "Instant Trip",
    metricLabel: "Runaway Spend Prevented",
    category: "FinOps",
    tag: "Agentic Loop Breaker",
  },
  {
    id: "scalecloud",
    quote:
      "Our Claude 3.5 Sonnet and GPT-4o usage was skyrocketing across our customer support agent. Dropping the OsterdOps baseURL into our Node.js and Python microservices immediately unlocked 42% semantic caching on identical queries with zero refactoring.",
    author: "Elena Rostova",
    role: "VP of Engineering",
    company: "ScaleCloud Enterprise",
    metric: "42.4%",
    metricLabel: "LLM Bill Slashed via Caching",
    category: "FinOps",
    tag: "Semantic Cache Mesh",
  },
  {
    id: "healthmesh",
    quote:
      "In sensitive enterprise environments, Zero-Data Retention and real-time PII redaction are non-negotiable. OsterdOps sanitizes identifiers and sensitive keys pre-flight before prompts hit external LLMs with zero friction.",
    author: "Dr. Marcus Chen",
    role: "Chief Technology Officer",
    company: "HealthMesh Systems",
    metric: "100%",
    metricLabel: "Zero-Data Retention (ZDR)",
    category: "Security",
    tag: "Zero-Retention Sanitizer",
  },
];

const ECOSYSTEM_INTEGRATIONS = [
  { name: "Next.js / React", type: "Fullstack Framework" },
  { name: "Vercel AI SDK", type: "Streaming & Tools" },
  { name: "LangChain", type: "Agentic Orchestration" },
  { name: "LlamaIndex", type: "RAG & Knowledge" },
  { name: "LiteLLM", type: "Python Proxy" },
  { name: "CrewAI", type: "Autonomous Teams" },
  { name: "AutoGen", type: "Multi-Agent Framework" },
  { name: "OpenAI Official SDK", type: "Python & TypeScript" },
];

export function CustomerProofSection() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filteredTestimonials =
    activeCategory === "All"
      ? TESTIMONIALS
      : TESTIMONIALS.filter((t) => t.category === activeCategory);

  return (
    <section className="py-24 sm:py-32 bg-[#080808] border-t border-[#161720] relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#DFB277]/10 border border-[#DFB277]/25 text-[#DFB277] text-xs font-mono font-semibold tracking-wider uppercase shadow-[0_0_12px_rgba(223,178,119,0.15)]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#DFB277]" />
            <span>Zero Data Retention Gateway • Transparent Provider Proxies</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-sans">
            Active FinOps Firewall &amp; <span className="text-[#DFB277]">Zero-Downtime AI Gateway</span>
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base mt-2 font-sans leading-relaxed">
            Engineered to prevent runaway loops, mitigate upstream outages, and govern multi-provider token spend.
          </p>
        </div>

        {/* Verifiable Technical Metrics Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-2xl bg-[#0D0E14] border border-[#1A1C28] text-center space-y-1.5 shadow-lg">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#DFB277] tracking-tight">
              &lt; 10ms
            </div>
            <div className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
              P99 Gateway Overhead
            </div>
            <div className="text-[11px] font-mono text-neutral-500">In-memory Anycast proxy core</div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0D0E14] border border-[#1A1C28] text-center space-y-1.5 shadow-lg">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400 tracking-tight">
              100%
            </div>
            <div className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
              Zero Prompt Retention
            </div>
            <div className="text-[11px] font-mono text-neutral-500">Volatile RAM processing only</div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0D0E14] border border-[#1A1C28] text-center space-y-1.5 shadow-lg">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
              99.99%
            </div>
            <div className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
              Failover Availability
            </div>
            <div className="text-[11px] font-mono text-neutral-500">Multi-provider active-active routing</div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0D0E14] border border-[#1A1C28] text-center space-y-1.5 shadow-lg">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#DFB277] tracking-tight">
              AES-256
            </div>
            <div className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
              GCM Key Vault
            </div>
            <div className="text-[11px] font-mono text-neutral-500">Hashed proxy authentication</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center gap-2">
          {["All", "FinOps", "Reliability", "Security"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-[#DFB277]/20 border border-[#DFB277] text-white font-bold shadow-[0_0_12px_rgba(223,178,119,0.2)]"
                  : "bg-[#111219] border border-[#1E202B] text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {filteredTestimonials.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl bg-[#0D0E14] border border-[#1A1C28] hover:border-[#DFB277]/40 p-6 sm:p-8 flex flex-col justify-between space-y-6 transition-all shadow-xl group"
            >
              <div className="space-y-4">
                {/* Metric Callout */}
                <div className="flex items-center justify-between">
                  <div className="px-2.5 py-1 rounded-lg bg-[#DFB277]/10 border border-[#DFB277]/20 text-[11px] font-mono font-semibold text-[#DFB277]">
                    {t.tag}
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-base font-bold text-emerald-400">{t.metric}</span>
                    <span className="block text-[10px] text-neutral-500">{t.metricLabel}</span>
                  </div>
                </div>

                {/* Quote Text */}
                <p className="text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div className="pt-4 border-t border-[#181926] flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold font-mono text-white group-hover:text-[#DFB277] transition-colors">
                    {t.author}
                  </div>
                  <div className="text-xs font-mono text-neutral-400">
                    {t.role} • <span className="text-neutral-300">{t.company}</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#181A24] border border-[#262838] flex items-center justify-center text-[#DFB277]">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ecosystem Compatibility Strip */}
        <div className="rounded-2xl bg-[#0A0B10] border border-[#171824] p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-sm sm:text-base font-bold font-mono text-white uppercase tracking-wider">
              Native Compatibility With Your Entire AI Stack
            </h3>
            <p className="text-xs font-mono text-neutral-400">
              No custom SDK wrappers needed. Works out of the box with standard OpenAI, Anthropic, and LangChain clients.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {ECOSYSTEM_INTEGRATIONS.map((tool) => (
              <div
                key={tool.name}
                className="p-3 rounded-xl bg-[#0F1017] border border-[#1D1F2C] hover:border-[#DFB277]/30 text-center space-y-1 transition-all"
              >
                <div className="text-xs font-mono font-bold text-white truncate">{tool.name}</div>
                <div className="text-[10px] font-mono text-neutral-500 truncate">{tool.type}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
