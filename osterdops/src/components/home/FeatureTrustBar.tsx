"use client";

import React from "react";
import {
  Lock,
  RefreshCw,
  GitBranch,
  ShieldCheck,
  Coins,
  Building2,
} from "lucide-react";

export function FeatureTrustBar() {
  const pillars = [
    {
      icon: Lock,
      value: "Zero-PII",
      label: "Egress Guaranteed",
      sub: "In-memory client sanitization",
    },
    {
      icon: RefreshCw,
      value: "Auto",
      label: "Failover Matrix",
      sub: "Sub-14ms upstream fallback",
    },
    {
      icon: GitBranch,
      value: "Smart",
      label: "Routing Engine",
      sub: "Cost & latency arbitrage",
    },
    {
      icon: ShieldCheck,
      value: "< 15µs",
      label: "Pre-Flight Firewall",
      sub: "Deterministic policy checks",
    },
    {
      icon: Coins,
      value: "Up to 70%",
      label: "Cost Savings",
      sub: "Model auto-downgrade",
    },
    {
      icon: Building2,
      value: "Enterprise",
      label: "Ready (BYOM)",
      sub: "VPC & multi-tenant air-gap",
    },
  ];

  return (
    <section className="py-6 sm:py-7 bg-[#07080B] border-y border-[#161720] relative z-10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 items-center">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#0F1017] border border-[#DFB277]/40 flex items-center justify-center text-[#DFB277] shrink-0 shadow-[0_0_10px_rgba(223,178,119,0.15)]">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm sm:text-base font-extrabold font-mono text-white tracking-tight leading-none truncate">
                    {item.value}
                  </div>
                  <div className="text-[11px] font-semibold text-neutral-300 font-sans mt-0.5 whitespace-nowrap truncate">
                    {item.label}
                  </div>
                  <div className="text-[9.5px] text-neutral-500 font-sans mt-0.5 truncate hidden sm:block">
                    {item.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
