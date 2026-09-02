"use client";

import React from "react";
import { Check, X, ShieldAlert, Sparkles, ShieldCheck, Flame, Zap } from "lucide-react";

export function HeliconeComparison() {
  const comparisonRows = [
    {
      feature: "Budget Enforcement",
      passive: "Passive alert email sent after money is already spent",
      active: "Inline Pre-Flight Hard Block (halts call before provider hits credit card)",
      category: "FinOps",
    },
    {
      feature: "Dynamic Model Downgrade",
      passive: "No automatic downgrade (requires manual developer code deployment)",
      active: "Automatic real-time rewrite (e.g. gpt-4o → gpt-4o-mini at 80% ceiling)",
      category: "Routing",
    },
    {
      feature: "Runaway Agent Loop Breaker",
      passive: "None. Rogue agents can drain entire monthly budgets in minutes",
      active: "30s Velocity Breaker freezes key after 15 identical requests for 5 minutes",
      category: "Reliability",
    },
    {
      feature: "Data Privacy & Prompt Egress",
      passive: "Raw user prompts & completions stored on third-party cloud servers",
      active: "Zero-egress telemetry with automated regex/NER PII scrubbing",
      category: "Security",
    },
    {
      feature: "Proxy Overhead SLA",
      passive: "Variable (15ms - 50ms typical proxy latency)",
      active: "< 5ms guaranteed via O(1) in-memory LRU cache checks",
      category: "Performance",
    },
    {
      feature: "Self-Hosted / VPC Deployment",
      passive: "SaaS-only or complex enterprise bespoke setup",
      active: "1-Click Docker/Kubernetes container in your private VPC",
      category: "Architecture",
    },
  ];

  return (
    <section className="py-20 bg-[#080808]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
            Comparison
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Active Enforcement vs Passive Logging
          </h2>

          <p className="text-sm text-neutral-400">
            Passive tools record metrics after money is already spent. OsterdOps enforces hard limits inline before requests reach the provider.
          </p>
        </div>

        {/* Comparison Table / Cards */}
        <div className="max-w-5xl mx-auto rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          {/* Table Header */}
          <div className="grid grid-cols-1 md:grid-cols-12 bg-[#0A0A0A] border-b border-[#1A1A1A] p-4 text-xs font-mono">
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
          <div className="divide-y divide-[#161616]">
            {comparisonRows.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-12 p-4 sm:p-5 gap-3 md:gap-4 hover:bg-[#121212]/60 transition-colors"
              >
                {/* Feature Name */}
                <div className="md:col-span-4 space-y-1">
                  <div className="text-sm font-bold font-mono text-white flex items-center gap-2">
                    <span>{row.feature}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161616] text-neutral-400">
                    {row.category}
                  </span>
                </div>

                {/* Passive Logger (Helicone) Column */}
                <div className="md:col-span-4 flex items-start gap-2.5 text-xs text-neutral-400 leading-relaxed">
                  <div className="w-5 h-5 rounded-md bg-red-950/30 border border-red-800/30 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
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
          <div className="p-4 bg-[#0A0A0A] border-t border-[#161616] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
            <span className="text-neutral-400">
              Stop paying for post-mortems. Guard your LLM infrastructure in real-time.
            </span>
            <div className="flex items-center gap-2 text-[#DFB277] font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span>Full Active Governance Included on All Tiers</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
