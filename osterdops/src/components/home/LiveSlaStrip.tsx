"use client";

import React from "react";
import { Zap, Cpu, ShieldCheck, Lock } from "lucide-react";

export function LiveSlaStrip() {
  const metrics = [
    {
      icon: Zap,
      value: "< 8.4ms",
      label: "Median Proxy Overhead",
      detail: "Sub-5ms in-memory cache pre-flight verification",
      accent: "text-[#DFB277]",
    },
    {
      icon: Cpu,
      value: "50+ Models",
      label: "Frontier & Open Source",
      detail: "Unified OpenAI-compatible gateway spec",
      accent: "text-[#10B981]",
    },
    {
      icon: ShieldCheck,
      value: "99.99%",
      label: "Enterprise Edge SLA",
      detail: "Zero single-point-of-failure multi-region routing",
      accent: "text-cyan-400",
    },
    {
      icon: Lock,
      value: "0.00%",
      label: "Zero-Egress Prompt Retention",
      detail: "Strict SHA-256 telemetry with automated PII scrubbing",
      accent: "text-amber-400",
    },
  ];

  return (
    <section className="border-y border-[#1A1A1A] bg-[#0A0A0A] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {metrics.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 rounded-xl bg-[#0E0E0E] border border-[#161616] hover:border-[#262626] transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#141414] border border-[#222222] flex items-center justify-center shrink-0 group-hover:border-[#DFB277]/40 transition-colors">
                  <Icon className={`w-5 h-5 ${item.accent}`} />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xl font-extrabold font-mono text-white tracking-tight">
                    {item.value}
                  </div>
                  <div className="text-xs font-semibold font-mono text-neutral-300">
                    {item.label}
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-snug">
                    {item.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
