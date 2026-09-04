"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, Zap, Lock, DollarSign, Activity, ArrowRight } from "lucide-react";

interface SubscriptionPaywallModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
}

export function SubscriptionPaywallModal({
  isOpen,
  title = "7-Day Free Trial Expired",
  description = "Your 7-day free trial has expired. Upgrade your plan to restore full access to the OsterdOps Sub-Microsecond AI Firewall, Nanodollar Ledger, and Multi-Provider Proxying.",
}: SubscriptionPaywallModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0d0e14] border border-[#dfba82]/30 p-6 sm:p-8 shadow-[0_0_50px_rgba(223,186,130,0.15)] text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Glow Header Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-[#dfba82]/10 border border-[#dfba82]/30 flex items-center justify-center text-[#dfba82] mb-5 shadow-[0_0_20px_rgba(223,186,130,0.2)]">
          <Lock className="w-7 h-7" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dfba82]/10 border border-[#dfba82]/30 text-[#dfba82] text-xs font-semibold uppercase tracking-wider mb-3">
          <ShieldAlert className="w-3.5 h-3.5" />
          Subscription Required
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
          {title}
        </h2>
        <p className="text-sm text-neutral-400 leading-relaxed mb-6">
          {description}
        </p>

        {/* Benefits Unlocked with Paid Plan */}
        <div className="text-left bg-[#13151f] border border-[#1d2133] rounded-xl p-4 mb-6 space-y-3">
          <div className="text-xs font-semibold text-[#dfba82] uppercase tracking-wider mb-2">
            Features Paused (Upgrade to Unlock):
          </div>
          <div className="flex items-start gap-2.5 text-xs text-neutral-300">
            <Zap className="w-4 h-4 text-[#dfba82] shrink-0 mt-0.5" />
            <span>
              <strong>Sub-microsecond Pre-Flight Guard Latency (&lt; 15µs)</strong> — zero proxy overhead edge inspection.
            </span>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-neutral-300">
            <DollarSign className="w-4 h-4 text-[#dfba82] shrink-0 mt-0.5" />
            <span>
              <strong>Live Nanodollar Cost Engine &amp; PII Scrubber</strong> — deterministic spend tracking and DLP redaction.
            </span>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-neutral-300">
            <Activity className="w-4 h-4 text-[#dfba82] shrink-0 mt-0.5" />
            <span>
              <strong>Automated Runaway Loop &amp; Rate Limit Breaker</strong> — immediate runaway AI execution halts.
            </span>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-neutral-300">
            <Lock className="w-4 h-4 text-[#dfba82] shrink-0 mt-0.5" />
            <span>
              <strong>Multi-Provider Pass-Through</strong> — high-throughput routing to OpenAI, DeepSeek, and Anthropic.
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/pricing"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-[#dfba82] to-[#b88c4c] text-black font-semibold text-sm hover:opacity-95 transition-all shadow-lg shadow-[#dfba82]/20 cursor-pointer"
          >
            <span>Upgrade to Pro / View Pricing</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/billing"
            className="block text-xs text-neutral-400 hover:text-neutral-200 transition-colors py-1"
          >
            Manage Billing &amp; Invoices
          </Link>
        </div>
      </div>
    </div>
  );
}
