"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  Lock,
  KeyRound,
  Server,
  ArrowRight,
  Cpu,
} from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: "Security" | "FinOps" | "Integration";
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-helicone-diff",
    category: "FinOps",
    question: "How does OsterdOps differ from passive logging tools like Helicone or Langfuse?",
    answer:
      "Helicone and Langfuse are asynchronous, read-only analytics loggers. If an autonomous agent enters a runaway recursive loop or consumes $5,000 in unexpected tokens, passive tools merely report the financial disaster after your credit card has been charged. OsterdOps is an active, pre-flight inline FinOps proxy. We calculate token costs and enforce budget limits *before* routing the request, intercepting unauthorized or runaway spend with an immediate HTTP 429 before upstream providers bill you.",
  },
  {
    id: "faq-latency",
    category: "Integration",
    question: "What is your latency overhead, and will it slow down user interactions?",
    answer:
      "OsterdOps introduces sub-10ms P99 overhead through our globally distributed Anycast edge network. For semantically cached requests, OsterdOps serves completions directly from edge memory in ~12ms — which is up to 100x faster than waiting 1,200ms+ for a remote LLM API roundtrip.",
  },
  {
    id: "faq-zdr",
    category: "Security",
    question: "Do you store, log, or train on our sensitive prompts and customer completions?",
    answer:
      "Never. OsterdOps enforces a strict Zero-Data Retention (ZDR) policy. Prompt payloads and LLM completions stream transiently through volatile RAM to compute token counts, enforce rate limits, and sanitize PII. They are never written to disk or database tables. Teams can also deploy our self-hosted Kubernetes Helm chart directly inside their private air-gapped VPC.",
  },
  {
    id: "faq-outage-failover",
    category: "Integration",
    question: "What happens if a major provider like OpenAI or Anthropic experiences an outage?",
    answer:
      "OsterdOps executes automated, zero-downtime provider failover. If your primary provider returns 500, 502, 503, or 429 rate limit exceptions, our gateway automatically retries and shifts the payload to your designated fallback model (e.g., from GPT-4o to Claude 3.5 Sonnet or Google Gemini 2.0 Flash) in under 150ms without dropping client connections.",
  },
  {
    id: "faq-vpc",
    category: "Security",
    question: "Can we deploy OsterdOps inside our private AWS, Azure, or GCP VPC?",
    answer:
      "Yes. Enterprise tiers include access to our self-hosted Docker containers and Kubernetes Helm charts. The data plane runs air-gapped within your own virtual private cloud, peering directly with your AWS Bedrock, Google Vertex AI, or Azure OpenAI instances for zero external data transit.",
  },
  {
    id: "faq-migration",
    category: "Integration",
    question: "How difficult is migration from existing OpenAI or Anthropic SDKs?",
    answer:
      "Migration takes less than 60 seconds. Because OsterdOps adheres strictly to the official OpenAI API wire format, you do not need to replace your SDKs or rewrite code. Simply update your client's baseURL parameter to `https://gateway.osterdops.com/v1` and supply your OsterdOps virtual key.",
  },
];

export function SecurityFaqSection() {
  const [openId, setOpenId] = useState<string | null>("faq-helicone-diff");

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="py-24 sm:py-32 bg-[#080808] border-t border-[#161720] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(223,178,119,0.04),transparent_70%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#DFB277]/10 border border-[#DFB277]/25 text-[#DFB277] text-xs font-mono font-semibold tracking-wider uppercase shadow-[0_0_12px_rgba(223,178,119,0.15)]">
            <HelpCircle className="w-3.5 h-3.5 text-[#DFB277]" />
            <span>Architecture &amp; Security FAQ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-sans">
            Frequently Asked Questions by <span className="text-[#DFB277]">Engineering Leaders</span>
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 font-sans leading-relaxed">
            Everything you need to know about our active pre-flight architecture, zero-retention data flow, and sub-second failover.
          </p>
        </div>

        {/* Verifiable Technical Security Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#0D0E14] border border-[#1A1C28] flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-white">AES-256 GCM</div>
              <div className="text-[11px] font-mono text-neutral-400">Key Encryption</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0D0E14] border border-[#1A1C28] flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#DFB277]/10 border border-[#DFB277]/25 flex items-center justify-center text-[#DFB277] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-white">Zero Prompt Retention</div>
              <div className="text-[11px] font-mono text-neutral-400">Volatile RAM Transit</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0D0E14] border border-[#1A1C28] flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#DFB277]/10 border border-[#DFB277]/25 flex items-center justify-center text-[#DFB277] shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-white">SHA-256 Hashed</div>
              <div className="text-[11px] font-mono text-neutral-400">Virtual Keys</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0D0E14] border border-[#1A1C28] flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-white">Air-Gapped VPC</div>
              <div className="text-[11px] font-mono text-neutral-400">K8s &amp; Docker Ready</div>
            </div>
          </div>
        </div>

        {/* Accordion FAQ List */}
        <div className="space-y-4">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className={`rounded-2xl transition-all border ${
                  isOpen
                    ? "bg-[#0E0F17] border-[#DFB277]/50 shadow-[0_4px_25px_rgba(223,178,119,0.08)]"
                    : "bg-[#0A0B10] border-[#181926] hover:border-[#26283A]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#DFB277] px-2 py-0.5 rounded bg-[#DFB277]/10 border border-[#DFB277]/20">
                      {item.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold font-mono text-white mt-1.5">
                      {item.question}
                    </h3>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full border border-[#2A2D3E] bg-[#141622] flex items-center justify-center text-[#DFB277] shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 bg-[#DFB277]/20 border-[#DFB277]" : ""
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 text-xs sm:text-sm font-sans text-neutral-300 leading-relaxed border-t border-[#1C1E2B] pt-4 space-y-3">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Card: Still Have Questions / View Demo */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#11121A] via-[#0E0F16] to-[#0A0B10] border border-[#222536] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-bold font-mono text-white">
              Have specific architecture or security requirements?
            </h3>
            <p className="text-xs font-mono text-neutral-400">
              Explore our live interactive sandbox or test your provider failover policies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/dashboard?demo=true"
              className="px-4 py-2.5 rounded-xl bg-[#181924] border border-[#2E3144] hover:border-[#DFB277]/40 text-neutral-200 font-mono text-xs font-semibold transition-all cursor-pointer"
            >
              Explore Live Demo
            </Link>
            <Link
              href="/sign-up"
              className="px-5 py-2.5 rounded-xl bg-[#DFB277] hover:bg-[#D4A362] text-[#080808] font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(223,178,119,0.25)] flex items-center gap-1.5 cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
