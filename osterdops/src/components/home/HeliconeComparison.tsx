"use client";

import React from "react";
import { Check, X, ShieldCheck } from "lucide-react";

export function HeliconeComparison() {
  const comparisonRows = [
    {
      feature: "Budget Enforcement",
      passive: "Passive alert email sent hours after budget limit is already breached",
      active: "Active Pre-Flight Block (<15µs): Halts call before provider bills credit card",
      category: "FinOps",
    },
    {
      feature: "Dynamic Model Downgrade",
      passive: "No automated downgrade (requires developer code push & redeploy)",
      active: "Real-time payload mutation (e.g. gpt-4o → gpt-4o-mini at 80% ceiling)",
      category: "Routing",
    },
    {
      feature: "Runaway Loop Breaker",
      passive: "None. Rogue autonomous agents can drain entire monthly quotas in minutes",
      active: "30s Velocity Circuit Breaker: Freezes key after 15 identical calls for 300s",
      category: "Reliability",
    },
    {
      feature: "Data Privacy & Prompt Egress",
      passive: "Raw customer prompts & completions stored on third-party cloud disks",
      active: "Zero-Data Retention (ZDR): In-memory regex & NER sanitization, zero disk write",
      category: "Security",
    },
    {
      feature: "Proxy Overhead SLA",
      passive: "Variable (15ms – 65ms typical proxy latency)",
      active: "< 15µs deterministic memory evaluation via compiled Rust/Go data plane",
      category: "Performance",
    },
    {
      feature: "Deployment Topology",
      passive: "SaaS-only or bespoke complex enterprise contracts",
      active: "Managed Global Anycast Edge or 1-Click Self-Hosted VPC Helm Chart",
      category: "Architecture",
    },
  ];

  return (
    <section className="py-24 bg-[#080808] border-t border-[#161720] relative">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-sans">
            Active Pre-Flight Firewall vs. <span className="text-[#DFB277]">Passive Logging</span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-400 font-sans leading-relaxed">
            Passive tools record metrics after money is already spent. OsterdOps enforces deterministic policies inline before requests ever reach upstream providers.
          </p>
        </div>

        {/* Comparison Table / Cards */}
        <div className="max-w-5xl mx-auto rounded-2xl bg-[#0D0E14] border border-[#1A1C28] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          {/* Table Header */}
          <div className="grid grid-cols-1 md:grid-cols-12 bg-[#08080B] border-b border-[#181A26] p-4 text-xs font-mono">
            <div className="md:col-span-4 text-neutral-400 uppercase tracking-wider font-semibold">
              Capability
            </div>
            <div className="md:col-span-4 text-neutral-500 uppercase tracking-wider font-semibold hidden md:block">
              Helicone &amp; Passive Loggers
            </div>
            <div className="md:col-span-4 text-[#DFB277] uppercase tracking-wider font-bold hidden md:block">
              OsterdOps Active Perimeter
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[#151722]">
            {comparisonRows.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-12 p-4 sm:p-5 gap-3 md:gap-4 hover:bg-[#11131C]/60 transition-colors"
              >
                {/* Feature Name */}
                <div className="md:col-span-4 space-y-1">
                  <div className="text-sm font-bold font-mono text-white flex items-center gap-2">
                    <span>{row.feature}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#131520] text-neutral-400 border border-[#1D2030]">
                    {row.category}
                  </span>
                </div>

                {/* Passive Logger (Helicone) Column */}
                <div className="md:col-span-4 flex items-start gap-2.5 text-xs text-neutral-400 leading-relaxed">
                  <div className="w-5 h-5 rounded-md bg-rose-950/30 border border-rose-800/30 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <span>{row.passive}</span>
                </div>

                {/* OsterdOps Active Perimeter Column */}
                <div className="md:col-span-4 flex items-start gap-2.5 text-xs text-neutral-200 leading-relaxed">
                  <div className="w-5 h-5 rounded-md bg-[#10B981]/15 border border-[#10B981]/40 flex items-center justify-center text-[#10B981] shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span className="font-medium text-white">{row.active}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Summary Bar */}
          <div className="p-4 bg-[#08080B] border-t border-[#161722] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
            <span className="text-neutral-400">
              Stop paying for incident post-mortems. Guard your LLM infrastructure in real-time.
            </span>
            <div className="flex items-center gap-2 text-[#DFB277] font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span>Full Active Pre-Flight Governance On All Tiers</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
