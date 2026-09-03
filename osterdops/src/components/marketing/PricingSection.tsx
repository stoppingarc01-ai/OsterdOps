"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { Check, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

interface MousePosition {
  x: number;
  y: number;
}

function PricingCardSpotlight({
  plan,
  isAnnual,
}: {
  plan: {
    id: string;
    name: string;
    priceMonthly: string;
    priceAnnual: string;
    period: string;
    desc: string;
    badge: string | null;
    isPopular: boolean;
    ctaText: string;
    ctaHref: string;
    features: string[];
  };
  isAnnual: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<MousePosition>({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`rounded-[28px] p-8 sm:p-9 flex flex-col justify-between min-h-[620px] transition-all duration-300 ease-out relative group/card cursor-default ${
        plan.isPopular
          ? "bg-[#0d101d] border-2 border-[#dfba82] shadow-[0_0_35px_rgba(223,186,130,0.18)] lg:-translate-y-3 hover:-translate-y-5 hover:shadow-[0_35px_80px_rgba(0,0,0,0.85),0_0_55px_rgba(223,186,130,0.3)]"
          : "bg-[#090b12] border border-[#1e2235] hover:border-[#dfba82]/60 hover:-translate-y-3 hover:shadow-[0_30px_70px_rgba(0,0,0,0.8),0_0_35px_rgba(223,186,130,0.1)]"
      }`}
    >
      {/* Interactive Cursor Spotlight Glow */}
      <div
        className="pointer-events-none absolute -inset-px rounded-[28px] opacity-0 transition-opacity duration-300 group-hover/card:opacity-100 overflow-hidden"
        style={{
          background: `radial-gradient(450px circle at ${mousePos.x}px ${mousePos.y}px, rgba(223, 186, 130, 0.12), transparent 80%)`,
        }}
      />

      {/* Top Header & Price Block */}
      <div className="space-y-7 relative z-10">
        <div>
          {/* Top Title & Prominent Visible Badge */}
          <div className="flex items-center justify-between gap-2 min-h-[32px]">
            <h3 className="text-2xl font-bold tracking-tight text-white font-sans group-hover/card:text-[#dfba82] transition-colors">
              {plan.name}
            </h3>

            {plan.badge && (
              <span
                className={`px-3 py-1 rounded-full font-mono text-[10.5px] tracking-wider uppercase shadow-md flex items-center gap-1.5 shrink-0 ${
                  plan.isPopular
                    ? "bg-[#dfba82] text-[#07080c] shadow-[0_0_15px_rgba(223,186,130,0.5)] font-extrabold"
                    : "bg-[#181c2d] text-[#dfba82] border border-[#dfba82]/40 font-bold"
                }`}
              >
                {plan.isPopular && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#07080c] animate-ping" />
                )}
                <span>{plan.badge}</span>
              </span>
            )}
          </div>

          <p className="text-[13.5px] text-[#a6acbe] mt-2.5 min-h-[40px] leading-relaxed font-sans group-hover/card:text-[#d0d4e4] transition-colors">
            {plan.desc}
          </p>
        </div>

        {/* High-Contrast Price Display */}
        <div className="pt-4 border-t border-[#1b1f33]">
          <div className="flex items-baseline gap-1.5 font-sans">
            <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-sans">
              {price}
            </span>
            {plan.period && (
              <span className="text-sm font-medium text-[#8e93a6] font-sans">{plan.period}</span>
            )}
          </div>
          {isAnnual && plan.id !== "free" && plan.id !== "enterprise" && (
            <div className="text-xs text-[#4ade80] font-mono font-medium mt-1.5 flex items-center gap-1">
              <span>✦ Billed annually (Save 20%)</span>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <Link
          href={plan.ctaHref}
          className={`w-full py-3.5 rounded-xl font-bold text-xs tracking-wide transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md group/btn relative overflow-hidden font-sans ${
            plan.isPopular
              ? "bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] shadow-[0_0_20px_rgba(223,186,130,0.3)] hover:shadow-[0_0_30px_rgba(223,186,130,0.5)]"
              : "bg-[#141726] hover:bg-[#1d2238] text-white border border-[#262b42] hover:border-[#dfba82]/60"
          }`}
        >
          {/* Animated Light Sweep Effect on Hover */}
          <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

          <span className="relative z-10 font-semibold">{plan.ctaText}</span>
          <ArrowRight className="w-3.5 h-3.5 relative z-10 transition-transform duration-200 group-hover/btn:translate-x-1" />
        </Link>

        {/* Feature Checklist with Crisp Visibility */}
        <div className="space-y-3.5 pt-6 border-t border-[#1b1f33]">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#dfba82]">
            What&apos;s Included
          </span>
          <div className="space-y-3">
            {plan.features.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 text-[13.5px] text-[#d4d8e8] font-sans group-hover/card:text-white transition-colors"
              >
                <div className="w-4.5 h-4.5 rounded-full bg-[#dfba82]/15 border border-[#dfba82]/40 flex items-center justify-center shrink-0 mt-0.5 group-hover/card:bg-[#dfba82]/25 group-hover/card:border-[#dfba82]/70 transition-colors">
                  <Check className="w-3 h-3 text-[#dfba82]" />
                </div>
                <span className="leading-snug">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      id: "free",
      name: "FREE",
      priceMonthly: "$0",
      priceAnnual: "$0",
      period: "/ month",
      desc: "For developers exploring OsterdOps",
      badge: null,
      isPopular: false,
      ctaText: "Start Free",
      ctaHref: "/sign-up",
      features: [
        "1 project",
        "2 team members",
        "10K AI requests / month",
        "Basic spend tracking",
        "Basic dashboard",
        "7-day data retention",
        "Community support",
      ],
    },
    {
      id: "growth",
      name: "GROWTH",
      priceMonthly: "$49",
      priceAnnual: "$39",
      period: "/ month",
      desc: "For growing AI teams",
      badge: "⭐ POPULAR",
      isPopular: true,
      ctaText: "Start 14-Day Free Trial",
      ctaHref: "/sign-up",
      features: [
        "10 projects",
        "10 team members",
        "500K requests / month",
        "Multi-provider tracking",
        "Budgets & limits",
        "Alerts & notifications",
        "Optimization recommendations",
        "90-day retention",
        "Full API access",
      ],
    },
    {
      id: "scale",
      name: "SCALE",
      priceMonthly: "$159",
      priceAnnual: "$129",
      period: "/ month",
      desc: "For production AI teams",
      badge: null,
      isPopular: false,
      ctaText: "Upgrade to Scale",
      ctaHref: "/sign-up",
      features: [
        "Unlimited projects",
        "50 team members",
        "5M requests / month",
        "Advanced intelligent routing",
        "Automated optimization",
        "Anomaly detection",
        "Custom governance policies",
        "1-year data retention",
        "Audit logs & compliance",
        "Priority 24/7 support",
      ],
    },
    {
      id: "enterprise",
      name: "ENTERPRISE",
      priceMonthly: "Custom",
      priceAnnual: "Custom",
      period: "",
      desc: "For organizations operating AI at scale",
      badge: "BESPOKE",
      isPopular: false,
      ctaText: "Contact Enterprise Sales",
      ctaHref: "/sign-up",
      features: [
        "Unlimited usage & tokens",
        "SSO / SAML & SCIM",
        "Advanced granular RBAC",
        "Custom retention duration",
        "Dedicated cloud infrastructure",
        "99.99% Uptime SLA guarantee",
        "Security / compliance support (SOC2)",
        "Custom model & proxy integrations",
      ],
    },
  ];

  return (
    <section id="pricing" className="py-28 px-4 sm:px-6 lg:px-8 relative bg-[#07080c] overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[550px] bg-[#dfba82]/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto space-y-20 relative z-10">
        {/* Header Title with Editorial Luxury Serif Accent */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#dfba82]/10 border border-[#dfba82]/25 text-[#dfba82] text-xs font-mono font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#dfba82]" />
            <span>TRANSPARENT & PREDICTABLE PRICING</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#f4efe6] font-sans">
            Scale your AI operations{" "}
            <span
              className="font-serif italic font-normal tracking-tight bg-gradient-to-r from-[#dfba82] via-[#fcf6ec] to-[#dfba82] bg-clip-text text-transparent"
              style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
            >
              without blowing the budget
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[#8e93a6] leading-relaxed max-w-2xl mx-auto font-sans">
            Start for free and scale as your models handle millions of production requests with zero friction.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-6 flex items-center justify-center gap-3 text-xs font-sans">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`font-semibold cursor-pointer transition-colors ${
                !isAnnual ? "text-white" : "text-[#787d91] hover:text-[#c5c9d6]"
              }`}
            >
              Monthly
            </button>

            <button
              type="button"
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-13 h-7 bg-[#121422] border border-[#212538] hover:border-[#dfba82]/50 rounded-full p-1 transition-all cursor-pointer relative shadow-inner"
              aria-label="Toggle annual billing"
            >
              <div
                className={`w-5 h-5 bg-gradient-to-br from-[#dfba82] to-[#b8860b] rounded-full transition-transform shadow-[0_0_10px_rgba(223,186,130,0.4)] ${
                  isAnnual ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>

            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
                isAnnual ? "text-[#dfba82]" : "text-[#787d91] hover:text-[#c5c9d6]"
              }`}
            >
              <span>Annual</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#dfba82]/15 border border-[#dfba82]/30 text-[10.5px] text-[#dfba82] font-mono font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* 4 Spacious Minimalist Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7 items-stretch">
          {plans.map((plan) => (
            <PricingCardSpotlight key={plan.id} plan={plan} isAnnual={isAnnual} />
          ))}
        </div>

        {/* Minimalist Enterprise Bottom Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#090b12] border border-[#1e2235] hover:border-[#dfba82]/40 transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-6 group/banner">
          <div className="flex items-center gap-5">
            <div className="w-13 h-13 rounded-2xl bg-[#dfba82]/10 border border-[#dfba82]/30 flex items-center justify-center text-[#dfba82] shrink-0 group-hover/banner:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#f4efe6] font-sans group-hover/banner:text-[#dfba82] transition-colors">
                Need Custom Governance or Self-Hosted VPC?
              </h4>
              <p className="text-xs text-[#8e93a6] mt-1 leading-relaxed max-w-2xl font-sans">
                We offer custom enterprise SLAs, custom on-premise proxy instances, SOC2 Type II reports, and dedicated technical account managers.
              </p>
            </div>
          </div>

          <Link
            href="/sign-up"
            className="px-6 py-3 rounded-xl bg-[#141726] border border-[#262b42] hover:border-[#dfba82] text-white hover:text-[#dfba82] text-xs font-bold font-sans transition-all whitespace-nowrap cursor-pointer shadow-sm hover:shadow-[0_0_20px_rgba(223,186,130,0.2)] shrink-0"
          >
            Talk to AI Architect &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
