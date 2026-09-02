"use client";

import React from "react";
import Link from "next/link";
import { Check, Zap, ArrowRight, ShieldCheck } from "lucide-react";

export function HomePricing() {
  const tiers = [
    {
      name: "Developer",
      price: "$0",
      period: "forever free",
      desc: "For individual builders and early-stage prototypes testing the active perimeter.",
      features: [
        "100,000 requests / month included",
        "1 Workspace & 3 API Keys",
        "Basic Daily & Monthly Hard Caps",
        "Zero-Egress PII Redaction",
        "7-day telemetry & spend logs",
        "Community Discord Support",
      ],
      cta: "Start Free Perimeter",
      href: "/auth/register",
      highlighted: false,
    },
    {
      name: "Team",
      price: "$49",
      period: "per month",
      desc: "For production AI teams requiring active FinOps, loop breakers, and auto-downgrade.",
      features: [
        "1,000,000 requests / month included ($0.40 / 100k overage)",
        "Unlimited Projects & Scoped API Keys",
        "Automated Model Downgrade Routing",
        "30-Second Runaway Loop Circuit Breaker",
        "Slack, Discord & Webhook Threshold Alerts",
        "90-day real-time telemetry retention",
        "Multi-Provider BYOK Key Vault",
        "Priority Email & Slack Support",
      ],
      cta: "Deploy Team Perimeter",
      href: "/auth/register?plan=team",
      highlighted: true,
      tag: "MOST POPULAR",
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "annual contract",
      desc: "For scale-ups and regulated enterprises needing VPC deployment and custom SLAs.",
      features: [
        "Unlimited requests & custom volume pricing",
        "VPC Self-Hosted Data Plane (Zero Data Egress)",
        "Sub-3ms custom latency SLA",
        "Dedicated Account Solutions Engineer",
        "Custom RBAC & Okta / SAML SSO",
        "SOC2 Type II & HIPAA BAA Legal Guarantee",
        "Audit Log Cryptographic Chaining",
        "24/7/365 Dedicated PagerDuty Escalation",
      ],
      cta: "Contact Enterprise Sales",
      href: "/contact",
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-[#080808]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
            Pricing
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Predictable Pricing
          </h2>

          <p className="text-sm text-neutral-400">
            Simple tiers for active governance and hard limits. Zero token markups or hidden arbitrage fees.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {tiers.map((t, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-6 lg:p-8 flex flex-col justify-between space-y-6 transition-all ${
                t.highlighted
                  ? "bg-[#0E0E0E] border-2 border-[#DFB277] shadow-[0_0_40px_rgba(223,178,119,0.12)] relative"
                  : "bg-[#0A0A0A] border border-[#1A1A1A] hover:border-[#262626]"
              }`}
            >
              {/* Highlight Tag */}
              {t.tag && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#DFB277] text-[#0E0E0E] text-[10px] font-mono font-bold uppercase tracking-wider">
                  {t.tag}
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold font-mono text-white">{t.name}</h3>
                  <p className="text-xs text-neutral-400 mt-1 min-h-[32px]">{t.desc}</p>
                </div>

                <div className="pt-2 border-t border-[#161616] flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                    {t.price}
                  </span>
                  <span className="text-xs font-mono text-neutral-500">/ {t.period}</span>
                </div>

                {/* Features List */}
                <div className="pt-4 border-t border-[#161616] space-y-2.5">
                  <div className="text-[11px] font-mono uppercase text-neutral-500 font-semibold tracking-wider">
                    Included Features:
                  </div>
                  {t.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-neutral-300">
                      <div className="w-4 h-4 rounded bg-[#10B981]/15 text-[#10B981] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card CTA */}
              <Link
                href={t.href}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                  t.highlighted
                    ? "bg-[#DFB277] hover:bg-[#E5C38E] text-[#0E0E0E] shadow-[0_0_20px_rgba(223,178,119,0.25)]"
                    : "bg-[#141414] hover:bg-[#1E1E1E] text-white border border-[#222222]"
                }`}
              >
                <span>{t.cta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
