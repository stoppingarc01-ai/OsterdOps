"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Check,
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock,
  CreditCard,
  Layers,
  Receipt,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Key,
  Shield,
  Unlock,
  Download,
  FileText,
} from "lucide-react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { useSubscriptionAccess } from "@/hooks/useSubscriptionAccess";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { PLAN_LIMITS, type PlanEntitlements } from "@/types/subscription";
import { GenerateInvoiceModal } from "@/components/billing/GenerateInvoiceModal";

export default function DashboardSubscriptionPage() {
  const { currentOrg, userProfile, user } = useAuth();
  const { isTrial, daysRemaining, planId, status, isExpired } = useSubscriptionAccess();
  const { formatCurrency } = useCurrency();
  const [billingInterval, setBillingInterval] = useState<"monthly" | "annual">("monthly");
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const [entitlementsData, setEntitlementsData] = useState<{
    activeKeys: number;
    requestsThisMonth: number;
    maxGatewayKeys: number;
    monthlyRequestQuota: number;
    rateLimitPerMinute: number;
    logRetentionDays: number;
    canUseCircuitBreaker: boolean;
    canUseCustomFallbacks: boolean;
    canExportAuditLogs: boolean;
    allowedProviders: string[];
    tier: "free" | "pro" | "enterprise";
  }>({
    activeKeys: 1,
    requestsThisMonth: 0,
    maxGatewayKeys: isTrial ? 3 : (planId === "scale" || planId === "enterprise" ? 1000 : 25),
    monthlyRequestQuota: isTrial ? 10_000 : (planId === "scale" ? 5_000_000 : 500_000),
    rateLimitPerMinute: isTrial ? 60 : 600,
    logRetentionDays: isTrial ? 3 : 30,
    canUseCircuitBreaker: !isTrial,
    canUseCustomFallbacks: !isTrial,
    canExportAuditLogs: !isTrial,
    allowedProviders: isTrial ? ["openai", "gemini", "groq"] : ["*"],
    tier: isTrial ? "free" : "pro",
  });
  const [loadingEntitlements, setLoadingEntitlements] = useState(false);

  useEffect(() => {
    if (!currentOrg?.id) return;
    let isMounted = true;
    setLoadingEntitlements(true);
    fetch(`/api/v1/organizations/${currentOrg.id}/entitlements`)
      .then((res) => res.json())
      .then((resData) => {
        if (isMounted && resData.success && resData.data) {
          setEntitlementsData(resData.data);
        }
      })
      .catch((err) => console.warn("Failed to load live entitlements:", err))
      .finally(() => {
        if (isMounted) setLoadingEntitlements(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, planId, isTrial]);

  const trialDayProgress = Math.min(100, Math.max(0, Math.round(((7 - daysRemaining) / 7) * 100)));
  const keysPct = Math.min(100, Math.max(0, Math.round((entitlementsData.activeKeys / Math.max(1, entitlementsData.maxGatewayKeys)) * 100)));
  const requestsPct = Math.min(100, Math.max(0, Math.round((entitlementsData.requestsThisMonth / Math.max(1, entitlementsData.monthlyRequestQuota)) * 100)));

  const plans = [
    {
      id: "growth",
      name: "Growth",
      priceMonthly: 49,
      priceAnnual: 39,
      desc: "For growing AI engineering teams running production agent workloads.",
      popular: true,
      features: [
        "10 isolated projects & 10 team seats",
        "500,000 requests / month",
        "Sub-microsecond Pre-Flight Guard (< 15µs)",
        "Automated Runaway Loop & Budget Breakers",
        "Multi-provider live routing (Gemini, OpenAI, Anthropic, DeepSeek)",
        "90-day high-resolution telemetry retention",
      ],
      ctaHref: "/pricing?plan=growth",
    },
    {
      id: "scale",
      name: "Scale",
      priceMonthly: 159,
      priceAnnual: 129,
      desc: "For scale-stage production applications requiring high-concurrency SLAs.",
      popular: false,
      features: [
        "Unlimited projects & 50 team seats",
        "5,000,000 requests / month",
        "Intelligent auto-failover & latency-optimized routing",
        "Custom governance policies & compliance guardrails",
        "1-year high-resolution audit & telemetry retention",
        "Priority 24/7 dedicated engineering support",
      ],
      ctaHref: "/pricing?plan=scale",
    },
    {
      id: "enterprise",
      name: "Enterprise",
      priceMonthly: null,
      priceAnnual: null,
      desc: "Single-tenant private VPC deployments, custom security policies, and custom SLAs.",
      popular: false,
      features: [
        "Dedicated isolated C++ proxy instances",
        "Custom request volumes & token pools",
        "Self-hosted VPC and Zero Data Retention guarantees",
        "Custom model registry and on-prem vLLM support",
        "Dedicated Technical Account Manager",
      ],
      ctaHref: "/contact",
    },
  ];

  const entitlements = [
    {
      feature: "Pre-Flight Guard Latency",
      trial: "< 15µs",
      growth: "< 15µs",
      scale: "< 8µs (Ultra)",
    },
    {
      feature: "Live Nanodollar Cost Engine",
      trial: "Included",
      growth: "Included",
      scale: "Included",
    },
    {
      feature: "Runaway Loop & Rate Limit Breaker",
      trial: "Standard",
      growth: "Configurable Hard Stops",
      scale: "Intelligent Auto-Throttling",
    },
    {
      feature: "Multi-Provider Gateway Pass-Through",
      trial: "Gemini, OpenAI, Anthropic",
      growth: "All Providers + DeepSeek & Groq",
      scale: "All Providers + Custom Endpoints",
    },
    {
      feature: "Telemetry Data Retention",
      trial: "7 Days",
      growth: "90 Days",
      scale: "365 Days",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07080c] text-slate-900 dark:text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#161824]">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    Subscription &amp; Plans
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#dfba82]/15 text-[#dfba82] border border-[#dfba82]/30 text-[11px] font-mono font-bold">
                    {isTrial ? "TRIAL TIER" : (planId || "PRO").toUpperCase()}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#8e93a6] mt-1">
                  Manage organization entitlements, active billing tier, and gateway quota allocations.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <Link
                  href="/dashboard/billing"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] hover:border-[#dfba82]/40 text-xs font-semibold text-[#c5c9d6] hover:text-white transition-all cursor-pointer shadow-xs"
                >
                  <Receipt className="w-3.5 h-3.5 text-[#dfba82]" />
                  <span>Invoice History</span>
                </Link>

                <Link
                  href="/pricing"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-bold transition-all cursor-pointer shadow-[0_2px_12px_rgba(223,186,130,0.3)] hover:-translate-y-0.5"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  <span>View Public Pricing</span>
                </Link>
              </div>
            </div>

            {/* Active Tier Status Hero Card */}
            {isTrial ? (
              <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-[#121624] via-[#0d101a] to-[#14121d] border border-[#dfba82]/40 shadow-[0_0_35px_rgba(223,186,130,0.12)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#dfba82]/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-3 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                      </span>
                      <span>7-DAY FREE TRIAL ACTIVE</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      Full Enterprise Sandbox for {currentOrg?.name || "Your Workspace"}
                    </h2>

                    <p className="text-xs sm:text-sm text-[#a4a9bd] leading-relaxed">
                      You are enjoying unconstrained trial access to the sub-microsecond pre-flight firewall,
                      real-time nanodollar cost engine, runaway loop breaker, and multi-provider live routing.
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2 max-w-md">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[#8e93a6]">
                          Day {Math.max(1, 8 - daysRemaining)} of 7
                        </span>
                        <span className={daysRemaining <= 2 ? "text-amber-400 font-bold" : "text-[#dfba82]"}>
                          {daysRemaining} {daysRemaining === 1 ? "day" : "days"} remaining
                        </span>
                      </div>
                      <div className="h-2 w-full bg-[#1b1f30] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#dfba82] to-amber-300 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(223,186,130,0.5)]"
                          style={{ width: `${trialDayProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                    <Link
                      href="/pricing?plan=growth"
                      className="px-6 py-3 rounded-xl bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-extrabold transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 hover:-translate-y-0.5"
                    >
                      <Sparkles className="w-4 h-4 fill-current" />
                      <span>Upgrade to Growth ({formatCurrency(49)}/mo)</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Link
                      href="/pricing"
                      className="px-6 py-3 rounded-xl bg-[#151928] hover:bg-[#1f243a] text-white border border-[#272e48] text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Compare All Tiers</span>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 sm:p-7 rounded-2xl bg-[#0d101a] border border-[#1e2338] shadow-lg relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#dfba82]/15 border border-[#dfba82]/40 text-[#dfba82] text-xs font-mono font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ACTIVE PRODUCTION LICENSE</span>
                    </div>

                    <h2 className="text-2xl font-bold text-white tracking-tight">
                      {(planId || "Pro").toUpperCase()} Plan — {currentOrg?.name || "Workspace"}
                    </h2>

                    <p className="text-xs sm:text-sm text-[#8e93a6]">
                      Subscription status: <span className="text-emerald-400 font-semibold uppercase">{status || "Active"}</span> •
                      All gateway security guardrails &amp; multi-provider proxy endpoints active.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href="/dashboard/billing"
                      className="px-5 py-2.5 rounded-xl bg-[#171b2d] border border-[#262c45] hover:border-[#dfba82]/50 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                    >
                      <CreditCard className="w-4 h-4 text-[#dfba82]" />
                      <span>Manage Billing &amp; Cards</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Live Entitlement Progress Bars */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#dfba82]" />
                  <span>Live Database Entitlements &amp; Gateway Limits</span>
                </h3>
                <span className="text-[11px] font-mono text-[#8e93a6]">
                  Tier: <strong className="text-[#dfba82] uppercase">{entitlementsData.tier}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Meter 1: API Keys Quota */}
                <div className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-[#73788c]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Key className="w-3.5 h-3.5 text-[#dfba82]" />
                      <span>Gateway API Keys</span>
                    </span>
                    <span className="font-mono text-white text-xs font-bold">
                      {entitlementsData.activeKeys} / {entitlementsData.maxGatewayKeys}
                    </span>
                  </div>

                  <div className="h-2 w-full bg-[#161824] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        keysPct >= 100
                          ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                          : keysPct >= 80
                          ? "bg-amber-400"
                          : "bg-gradient-to-r from-[#dfba82] to-amber-300"
                      }`}
                      style={{ width: `${Math.max(8, keysPct)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#8e93a6]">{keysPct}% utilized</span>
                    <span className={entitlementsData.activeKeys >= entitlementsData.maxGatewayKeys ? "text-rose-400 font-bold" : "text-emerald-400"}>
                      {entitlementsData.activeKeys >= entitlementsData.maxGatewayKeys
                        ? "Key Limit Reached"
                        : `${entitlementsData.maxGatewayKeys - entitlementsData.activeKeys} slots free`}
                    </span>
                  </div>
                </div>

                {/* Meter 2: Monthly Request Quota */}
                <div className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-[#73788c]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Layers className="w-3.5 h-3.5 text-[#dfba82]" />
                      <span>Monthly Requests</span>
                    </span>
                    <span className="font-mono text-white text-xs font-bold">
                      {entitlementsData.requestsThisMonth.toLocaleString()} / {entitlementsData.monthlyRequestQuota.toLocaleString()}
                    </span>
                  </div>

                  <div className="h-2 w-full bg-[#161824] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        requestsPct >= 100
                          ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                          : requestsPct >= 80
                          ? "bg-amber-400"
                          : "bg-gradient-to-r from-[#dfba82] to-emerald-400"
                      }`}
                      style={{ width: `${Math.max(4, requestsPct)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#8e93a6]">{requestsPct}% utilized</span>
                    <span className="text-[#dfba82]">{entitlementsData.rateLimitPerMinute} RPM cap</span>
                  </div>
                </div>

                {/* Meter 3: Log Retention Window */}
                <div className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#73788c]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#dfba82]" />
                      <span>Audit &amp; Log Retention</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#dfba82]/10 text-[#dfba82] border border-[#dfba82]/30 font-mono text-[10px] font-bold">
                      {entitlementsData.logRetentionDays} DAYS
                    </span>
                  </div>
                  <div className="text-base font-bold text-white font-mono pt-0.5">
                    {entitlementsData.logRetentionDays} Days Active Window
                  </div>
                  <p className="text-[11px] text-[#8e93a6] leading-tight">
                    {entitlementsData.canExportAuditLogs ? "Full CSV/JSON exports unlocked" : "Exports locked on evaluation tier"}
                  </p>
                </div>

                {/* Meter 4: Allowed AI Providers */}
                <div className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#73788c]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Zap className="w-3.5 h-3.5 text-[#dfba82]" />
                      <span>Provider Gateways</span>
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      {entitlementsData.allowedProviders.includes("*") ? "ALL" : `${entitlementsData.allowedProviders.length}`}
                    </span>
                  </div>
                  <div className="text-base font-bold text-white font-mono truncate pt-0.5">
                    {entitlementsData.allowedProviders.includes("*")
                      ? "All AI Models & Endpoints"
                      : entitlementsData.allowedProviders.join(", ").toUpperCase()}
                  </div>
                  <p className="text-[11px] text-[#8e93a6] leading-tight">
                    {entitlementsData.canUseCircuitBreaker ? "Auto-downgrade & cascades active" : "Fail-fast on upstream failure"}
                  </p>
                </div>
              </div>
            </div>

            {/* Locked vs Unlocked Feature Governance Badges */}
            <div className="p-5 rounded-2xl bg-[#0c0e17] border border-[#1b1e2c] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#161824] pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#dfba82]" />
                    <span>Runtime Governance &amp; Feature Flags</span>
                  </h4>
                  <p className="text-xs text-[#8e93a6]">
                    Real-time enforcement status of advanced FinOps capabilities for {currentOrg?.name || "your organization"}.
                  </p>
                </div>
                {entitlementsData.tier === "free" && (
                  <Link
                    href="/pricing?plan=growth"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#dfba82] hover:bg-[#ebd5ab] text-black text-xs font-extrabold transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    <span>Upgrade to Pro</span>
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* Feature 1: Circuit Breaker */}
                <div className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                  entitlementsData.canUseCircuitBreaker
                    ? "bg-[#101424] border-emerald-500/30"
                    : "bg-[#0a0c13] border-[#1b1e2c]"
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Inline Circuit Breaker Cascades</span>
                    </div>
                    <p className="text-[11px] text-[#8e93a6] leading-relaxed">
                      Automated 3-tier upstream retry with CLOSED/HALF-OPEN state recovery.
                    </p>
                  </div>
                  <div className="shrink-0 pt-0.5">
                    {entitlementsData.canUseCircuitBreaker ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10.5px] font-mono font-bold">
                        <CheckCircle2 className="w-3 h-3" /> Unlocked
                      </span>
                    ) : (
                      <Link
                        href="/pricing?plan=growth"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10.5px] font-bold transition-all"
                      >
                        <Lock className="w-3 h-3 text-amber-400" /> Unlock with Pro
                      </Link>
                    )}
                  </div>
                </div>

                {/* Feature 2: Custom Fallbacks */}
                <div className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                  entitlementsData.canUseCustomFallbacks
                    ? "bg-[#101424] border-emerald-500/30"
                    : "bg-[#0a0c13] border-[#1b1e2c]"
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Custom Fallback Routing</span>
                    </div>
                    <p className="text-[11px] text-[#8e93a6] leading-relaxed">
                      Dynamic auto-downgrade routing at 80%–99% spend thresholds to prevent hard outages.
                    </p>
                  </div>
                  <div className="shrink-0 pt-0.5">
                    {entitlementsData.canUseCustomFallbacks ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10.5px] font-mono font-bold">
                        <CheckCircle2 className="w-3 h-3" /> Unlocked
                      </span>
                    ) : (
                      <Link
                        href="/pricing?plan=growth"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10.5px] font-bold transition-all"
                      >
                        <Lock className="w-3 h-3 text-amber-400" /> Unlock with Pro
                      </Link>
                    )}
                  </div>
                </div>

                {/* Feature 3: Audit Export */}
                <div className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                  entitlementsData.canExportAuditLogs
                    ? "bg-[#101424] border-emerald-500/30"
                    : "bg-[#0a0c13] border-[#1b1e2c]"
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Audit Log &amp; Telemetry Export</span>
                    </div>
                    <p className="text-[11px] text-[#8e93a6] leading-relaxed">
                      High-resolution CSV and JSON telemetry export for auditing &amp; cost analysis.
                    </p>
                  </div>
                  <div className="shrink-0 pt-0.5">
                    {entitlementsData.canExportAuditLogs ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10.5px] font-mono font-bold">
                        <CheckCircle2 className="w-3 h-3" /> Unlocked
                      </span>
                    ) : (
                      <Link
                        href="/pricing?plan=growth"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10.5px] font-bold transition-all"
                      >
                        <Lock className="w-3 h-3 text-amber-400" /> Unlock with Pro
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Available Upgrade Tiers */}
            <div className="space-y-6 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Available Production Plans
                  </h3>
                  <p className="text-xs text-[#8e93a6] mt-0.5">
                    Scale agent throughput, extend telemetry retention, and unlock intelligent auto-failovers.
                  </p>
                </div>

                {/* Interval Selector */}
                <div className="inline-flex p-1 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] gap-1 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setBillingInterval("monthly")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      billingInterval === "monthly"
                        ? "bg-[#dfba82]/15 text-[#dfba82] border border-[#dfba82]/40"
                        : "text-[#73788c] hover:text-white"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingInterval("annual")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      billingInterval === "annual"
                        ? "bg-[#dfba82]/15 text-[#dfba82] border border-[#dfba82]/40"
                        : "text-[#73788c] hover:text-white"
                    }`}
                  >
                    <span>Annual</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[9.5px] font-bold">
                      Save 20%
                    </span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((p) => {
                  const price =
                    p.priceMonthly !== null
                      ? billingInterval === "annual"
                        ? p.priceAnnual
                        : p.priceMonthly
                      : null;

                  return (
                    <div
                      key={p.id}
                      className={`p-6 rounded-2xl flex flex-col justify-between transition-all duration-200 relative ${
                        p.popular
                          ? "bg-[#0d101d] border-2 border-[#dfba82] shadow-[0_0_30px_rgba(223,186,130,0.15)]"
                          : "bg-[#0c0e17] border border-[#1b1e2c] hover:border-[#dfba82]/40"
                      }`}
                    >
                      {p.popular && (
                        <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-[#dfba82] text-black text-[10px] font-extrabold uppercase tracking-wider font-mono shadow-md">
                          Most Popular
                        </div>
                      )}

                      <div className="space-y-4">
                        <div>
                          <div className="text-xl font-bold text-white">{p.name}</div>
                          <p className="text-xs text-[#8e93a6] mt-1 min-h-[32px]">{p.desc}</p>
                        </div>

                        <div className="pt-2 pb-1 border-y border-[#171a27]">
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
                              {price !== null ? formatCurrency(price) : "Custom"}
                            </span>
                            {price !== null && (
                              <span className="text-xs text-[#73788c]">/ month</span>
                            )}
                          </div>
                          {billingInterval === "annual" && price !== null && (
                            <p className="text-[10.5px] text-emerald-400 mt-0.5">Billed annually</p>
                          )}
                        </div>

                        <div className="space-y-2.5 pt-2">
                          <div className="text-[11px] font-bold text-[#73788c] uppercase font-mono">
                            Included Entitlements:
                          </div>
                          {p.features.map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-[#c5c9d6]">
                              <Check className="w-3.5 h-3.5 text-[#dfba82] shrink-0 mt-0.5" />
                              <span className="leading-snug">{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6">
                        <Link
                          href={p.ctaHref}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm ${
                            p.popular
                              ? "bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] shadow-[0_2px_12px_rgba(223,186,130,0.3)]"
                              : "bg-[#141824] hover:bg-[#1d2233] text-white border border-[#232a3e]"
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{p.priceMonthly !== null ? `Upgrade to ${p.name}` : "Contact Sales"}</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feature Entitlements Comparison Table */}
            <div className="p-6 rounded-2xl bg-[#0c0e17] border border-[#1b1e2c] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white tracking-tight">
                    Feature &amp; Governance Entitlement Matrix
                  </h4>
                  <p className="text-xs text-[#8e93a6]">
                    Comparing architectural capabilities across evaluation and production tiers.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1b1e2c] text-[#73788c] font-mono text-[11px]">
                      <th className="py-3 px-4">Capability</th>
                      <th className="py-3 px-4">7-Day Free Trial</th>
                      <th className="py-3 px-4 text-[#dfba82]">Growth Plan</th>
                      <th className="py-3 px-4 text-white">Scale Plan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#161824]">
                    {entitlements.map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-semibold text-[#c5c9d6]">{row.feature}</td>
                        <td className="py-3 px-4 text-[#8e93a6] font-mono">{row.trial}</td>
                        <td className="py-3 px-4 text-[#dfba82] font-semibold font-mono">{row.growth}</td>
                        <td className="py-3 px-4 text-white font-bold font-mono">{row.scale}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Invoices History & PDF Downloads */}
            <div className="p-6 rounded-2xl bg-[#0c0e17] border border-[#1b1e2c] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#dfba82] uppercase tracking-wider mb-0.5">
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Billing History &amp; Receipts</span>
                  </div>
                  <h4 className="text-base font-bold text-white tracking-tight">
                    Invoices &amp; Tax Statements
                  </h4>
                  <p className="text-xs text-[#8e93a6]">
                    Download print-ready Swiss-minimalist PDF invoices for corporate expense &amp; tax compliance.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-[#73788c] font-mono hidden sm:block">
                    Billed to: <span className="text-white font-semibold">{currentOrg?.name || "Organization"}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsInvoiceModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-bold transition-all cursor-pointer shadow-[0_2px_12px_rgba(223,186,130,0.25)] hover:-translate-y-0.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Generate Invoice</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1b1e2c] text-[#73788c] font-mono text-[11px]">
                      <th className="py-3 px-4">Invoice ID</th>
                      <th className="py-3 px-4">Billing Period</th>
                      <th className="py-3 px-4">Date Issued</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Statement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#161824]">
                    {[
                      { id: "inv_2026_08", period: "Aug 1 - Aug 31, 2026", date: "Aug 29, 2026", total: "$49.00", status: "PAID" },
                      { id: "inv_2026_07", period: "Jul 1 - Jul 31, 2026", date: "Jul 31, 2026", total: "$56.40", status: "PAID" },
                      { id: "inv_2026_06", period: "Jun 1 - Jun 30, 2026", date: "Jun 30, 2026", total: "$49.00", status: "PAID" },
                    ].map((inv) => (
                      <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-mono font-semibold text-[#dfba82] flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-[#dfba82]" />
                          <span>{inv.id}</span>
                        </td>
                        <td className="py-3 px-4 text-[#c5c9d6] font-mono">{inv.period}</td>
                        <td className="py-3 px-4 text-[#8e93a6]">{inv.date}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-white">{inv.total}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10.5px] font-mono font-bold">
                            <CheckCircle2 className="w-3 h-3" /> {inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => window.open(`/api/v1/invoices/${inv.id}/download`, "_blank")}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#141824] hover:bg-[#1d2233] border border-[#232a3e] hover:border-[#dfba82]/50 text-xs font-semibold text-white transition-all cursor-pointer shadow-xs"
                            title={`Download PDF invoice for ${inv.id}`}
                          >
                            <Download className="w-3 h-3 text-[#dfba82]" />
                            <span>PDF</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </ContentTransition>

        <GenerateInvoiceModal
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
          defaultClientName={userProfile?.name || user?.displayName || user?.email || "Valued Client"}
          defaultCompanyName={currentOrg?.name || "Enterprise AI Workspace"}
          defaultAddress="100 Enterprise Way, Suite 400, San Francisco, CA"
          defaultTaxId=""
        />
      </main>
    </div>
  );
}
