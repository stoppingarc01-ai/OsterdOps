"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PRICING_PLANS } from "@/lib/billing/plans";

interface MousePosition {
  x: number;
  y: number;
}

export function HomePricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [showMatrix, setShowMatrix] = useState(false);
  const [mousePositions, setMousePositions] = useState<{ [key: string]: MousePosition }>({});

  const handleMouseMove = (cardId: string, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePositions((prev) => ({
      ...prev,
      [cardId]: {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      },
    }));
  };

  const isAnnual = billingCycle === "annual";

  // Bind 4 tiers with PRICING_PLANS
  const tiers = [
    {
      id: PRICING_PLANS.trial.id,
      name: PRICING_PLANS.trial.name,
      priceMonthly: "$0",
      priceAnnual: "$0",
      period: "for 7 days",
      desc: PRICING_PLANS.trial.description,
      highlighted: false,
      tag: "7 DAYS FREE",
      quotaBadge: `${PRICING_PLANS.trial.limits.monthlyRequestLimit.toLocaleString()} reqs / 50k tokens`,
      features: [
        "Sub-microsecond Pre-Flight Guard Latency (< 15µs)",
        "Live Nanodollar Cost Engine & PII Scrubber",
        "Automated Runaway Loop & Rate Limit Breaker",
        "Multi-Provider Pass-Through (OpenAI, DeepSeek, Anthropic)",
        `${PRICING_PLANS.trial.limits.monthlyRequestLimit.toLocaleString()} requests / 50k tokens included`,
        `${PRICING_PLANS.trial.limits.maxProjects} Projects & ${PRICING_PLANS.trial.limits.maxProviderConnections} Provider Connections`,
      ],
      cta: "Start 7-Day Free Trial",
      href: "/sign-up",
    },
    {
      id: PRICING_PLANS.growth.id,
      name: PRICING_PLANS.growth.name,
      priceMonthly: `$${PRICING_PLANS.growth.priceMonthly}`,
      priceAnnual: `$${Math.round(Number(PRICING_PLANS.growth.priceMonthly) * 0.8)}`,
      period: isAnnual ? "per month, billed annually" : "per month",
      desc: PRICING_PLANS.growth.description,
      highlighted: true,
      tag: "MOST POPULAR",
      quotaBadge: `${(PRICING_PLANS.growth.limits.monthlyRequestLimit / 1000).toFixed(0)}k requests / mo`,
      features: [
        `${PRICING_PLANS.growth.limits.monthlyRequestLimit.toLocaleString()} requests / month included`,
        `${PRICING_PLANS.growth.limits.maxProjects} Projects & ${PRICING_PLANS.growth.limits.maxProviderConnections} Provider Connections`,
        "Automated Model Downgrade Routing",
        "30-Second Runaway Loop Circuit Breaker",
        "Semantic Vector Caching",
        "Slack & Webhook Threshold Alerts",
        "90-day real-time telemetry retention",
        "Priority Support (99.9% SLA)",
      ],
      cta: "Deploy Growth Perimeter",
      href: "/sign-up?plan=growth",
    },
    {
      id: PRICING_PLANS.scale.id,
      name: PRICING_PLANS.scale.name,
      priceMonthly: `$${PRICING_PLANS.scale.priceMonthly}`,
      priceAnnual: `$${Math.round(Number(PRICING_PLANS.scale.priceMonthly) * 0.8)}`,
      period: isAnnual ? "per month, billed annually" : "per month",
      desc: PRICING_PLANS.scale.description,
      highlighted: false,
      tag: null,
      quotaBadge: `${(PRICING_PLANS.scale.limits.monthlyRequestLimit / 1_000_000).toFixed(1)}M requests / mo`,
      features: [
        `${(PRICING_PLANS.scale.limits.monthlyRequestLimit / 1_000_000).toFixed(1)}M requests / month included`,
        `${PRICING_PLANS.scale.limits.maxProjects} Projects & ${PRICING_PLANS.scale.limits.maxProviderConnections} Provider Connections`,
        "Zero-Data Retention (ZDR) Toggle",
        "Multi-Region Anycast Edge (<15µs SLA)",
        "Pre-Flight Semantic Caching (50%+ faster)",
        "Automated Cross-Provider Failover Matrix",
        "1-Year telemetry retention & raw export",
        "Dedicated Private Slack Channel (99.95% SLA)",
      ],
      cta: "Deploy Scale Perimeter",
      href: "/sign-up?plan=scale",
    },
    {
      id: PRICING_PLANS.enterprise.id,
      name: PRICING_PLANS.enterprise.name,
      priceMonthly: "Custom",
      priceAnnual: "Custom",
      period: "annual contract",
      desc: PRICING_PLANS.enterprise.description,
      highlighted: false,
      tag: "AIR-GAPPED",
      quotaBadge: "Unlimited requests",
      features: [
        "Unlimited requests & custom volume pooling",
        "Self-Hosted VPC Data Plane (Helm / Docker)",
        "Dedicated Egress Static IPs & AWS Direct Connect",
        "Custom Regex, NER & FinOps Rule Engines",
        "Custom Model Connectors & On-Premises LLMs",
        "Full Audit Log Export & SOC2 / HIPAA BAA",
        "99.99% Financially Backed Enterprise SLA",
        "24/7 Phone, Slack & Dedicated Solutions Architect",
      ],
      cta: "Talk to Solutions Architect",
      href: "/contact",
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-[#080808] border-t border-[#161720] relative">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-sans">
            Predictable, Transparent <span className="text-[#DFB277]">Pricing</span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-400 font-sans leading-relaxed">
            Protect your AI budget with deterministic pre-flight enforcement. Zero hidden proxy taxes, zero volume penalties.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <span
              onClick={() => setBillingCycle("monthly")}
              className={`text-xs font-mono cursor-pointer transition-colors ${
                !isAnnual ? "text-white font-bold" : "text-neutral-400 hover:text-white"
              }`}
            >
              Monthly Billing
            </span>

            <button
              type="button"
              onClick={() => setBillingCycle(isAnnual ? "monthly" : "annual")}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                isAnnual ? "bg-[#DFB277]" : "bg-neutral-800"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-[#080808] transition-transform ${
                  isAnnual ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>

            <span
              onClick={() => setBillingCycle("annual")}
              className={`text-xs font-mono cursor-pointer flex items-center gap-1.5 transition-colors ${
                isAnnual ? "text-[#DFB277] font-bold" : "text-neutral-400 hover:text-white"
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded bg-[#DFB277]/15 text-[#DFB277] border border-[#DFB277]/30 text-[10px] font-bold">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* 4 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-[1440px] mx-auto">
          {tiers.map((tier) => {
            const isScale = tier.highlighted;
            const mouse = mousePositions[tier.id] || { x: -200, y: -200 };

            return (
              <div
                key={tier.id}
                onMouseMove={(e) => handleMouseMove(tier.id, e)}
                className={`relative rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 overflow-hidden ${
                  isScale
                    ? "bg-[#0E0F16] border-2 border-[#DFB277] shadow-[0_0_40px_rgba(223,178,119,0.22)] -translate-y-1.5 z-10"
                    : "bg-[#0C0D12] border border-[#1A1C28] hover:border-[#2C3044] hover:-translate-y-0.5"
                }`}
              >
                {/* Cursor Spotlight Effect */}
                <div
                  className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100 hover:opacity-100"
                  style={{
                    background: `radial-gradient(400px circle at ${mouse.x}px ${mouse.y}px, rgba(223,178,119,0.08), transparent 40%)`,
                  }}
                />

                {/* Top Card Info */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-bold font-sans text-white">
                      {tier.name}
                    </h3>
                    {tier.tag && (
                      <span className="px-2 py-0.5 rounded-full bg-[#DFB277] text-[#080808] text-[10px] font-mono font-bold tracking-wider uppercase">
                        {tier.tag}
                      </span>
                    )}
                  </div>

                  {/* Quota Badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#131520] border border-[#1D2030] text-[11px] font-mono text-neutral-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    <span>{tier.quotaBadge}</span>
                  </div>

                  <p className="text-xs text-neutral-400 font-sans leading-relaxed min-h-[36px]">
                    {tier.desc}
                  </p>

                  {/* Price */}
                  <div className="pt-2 pb-1 border-y border-[#181A26]">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
                        {isAnnual ? tier.priceAnnual : tier.priceMonthly}
                      </span>
                      <span className="text-xs text-neutral-400 font-mono">
                        {tier.priceMonthly === "Custom" ? "" : isAnnual ? "/ mo (billed annually)" : "/ mo"}
                      </span>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-2.5 pt-2">
                    <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
                      Included Capabilities:
                    </div>
                    {tier.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-neutral-300 leading-relaxed font-sans">
                        <Check className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA Button */}
                <div className="pt-6">
                  <Link
                    href={tier.href}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-mono font-bold text-xs transition-all duration-200 cursor-pointer ${
                      isScale
                        ? "bg-[#DFB277] hover:bg-[#D4A362] text-[#080808] shadow-[0_4px_16px_rgba(223,178,119,0.3)] hover:shadow-[0_6px_24px_rgba(223,178,119,0.45)]"
                        : "bg-[#141622] hover:bg-[#1E2130] text-white border border-[#242738] hover:border-[#383C54]"
                    }`}
                  >
                    <span>{tier.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Collapsible Technical Specifications Matrix Toggle */}
        <div className="pt-6 text-center">
          <button
            onClick={() => setShowMatrix(!showMatrix)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D0E14] hover:bg-[#141620] border border-[#1A1C28] hover:border-[#2D3145] text-xs font-mono text-neutral-300 hover:text-white transition-all cursor-pointer"
          >
            <span>{showMatrix ? "Hide Detailed Feature Comparison" : "Compare All 20+ Technical Specifications"}</span>
            {showMatrix ? <ChevronUp className="w-4 h-4 text-[#DFB277]" /> : <ChevronDown className="w-4 h-4 text-[#DFB277]" />}
          </button>
        </div>

        {/* Full Specifications Matrix */}
        {showMatrix && (
          <div className="max-w-5xl mx-auto rounded-2xl bg-[#0C0D12] border border-[#1A1C28] overflow-hidden shadow-2xl animate-in fade-in-50 duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-[#08080B] border-b border-[#181A26] text-neutral-400">
                    <th className="p-4 uppercase tracking-wider font-semibold">Technical Feature</th>
                    <th className="p-4">Developer</th>
                    <th className="p-4 text-[#DFB277]">Growth</th>
                    <th className="p-4">Scale</th>
                    <th className="p-4">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161722] text-neutral-300">
                  <tr>
                    <td className="p-4 font-semibold text-white">Monthly Request Quota</td>
                    <td className="p-4">50,000</td>
                    <td className="p-4 text-[#DFB277] font-bold">500,000</td>
                    <td className="p-4">2,500,000</td>
                    <td className="p-4 font-bold text-[#10B981]">Custom / Unlimited</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-white">Max Provider Connections</td>
                    <td className="p-4">3 Connections</td>
                    <td className="p-4 text-[#DFB277]">10 Connections</td>
                    <td className="p-4">50 Connections</td>
                    <td className="p-4">Unlimited BYOM</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-white">Automated Model Downgrade</td>
                    <td className="p-4 text-neutral-500">—</td>
                    <td className="p-4 text-[#10B981] font-bold">Included</td>
                    <td className="p-4 text-[#10B981] font-bold">Included</td>
                    <td className="p-4 text-[#10B981] font-bold">Custom Fallback Logic</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-white">Runaway Loop Circuit Breaker</td>
                    <td className="p-4 text-[#10B981]">30s Window</td>
                    <td className="p-4 text-[#10B981]">30s Window</td>
                    <td className="p-4 text-[#10B981]">Customizable Window</td>
                    <td className="p-4 text-[#10B981]">Customizable / Regex Rules</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-white">Pre-Flight Semantic Caching</td>
                    <td className="p-4 text-neutral-500">—</td>
                    <td className="p-4 text-[#10B981]">Included (100k items)</td>
                    <td className="p-4 text-[#10B981]">Included (1M items)</td>
                    <td className="p-4 text-[#10B981]">Dedicated Vector Cache</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-white">Zero-Data Retention (ZDR)</td>
                    <td className="p-4 text-neutral-500">—</td>
                    <td className="p-4 text-neutral-500">—</td>
                    <td className="p-4 text-[#10B981] font-bold">Included Toggle</td>
                    <td className="p-4 text-[#10B981] font-bold">Full Air-Gapped VPC</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-white">Self-Hosted Kubernetes Helm</td>
                    <td className="p-4 text-neutral-500">—</td>
                    <td className="p-4 text-neutral-500">—</td>
                    <td className="p-4 text-neutral-500">—</td>
                    <td className="p-4 text-[#10B981] font-bold">Included</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-white">Financially Backed SLA</td>
                    <td className="p-4 text-neutral-400">Best Effort</td>
                    <td className="p-4 text-[#DFB277]">99.9% Uptime</td>
                    <td className="p-4">99.95% Uptime</td>
                    <td className="p-4 text-[#10B981] font-bold">99.99% Financial SLA</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
