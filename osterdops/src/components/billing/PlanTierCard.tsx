"use client";

import Link from "next/link";
import { Sparkles, Check, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSubscriptionAccess } from "@/hooks/useSubscriptionAccess";

export function PlanTierCard() {
  const { currentOrg } = useAuth();
  const { isTrial, daysRemaining, planId } = useSubscriptionAccess();
  const plan = isTrial
    ? `7-DAY TRIAL (${daysRemaining}D LEFT)`
    : `${(planId || currentOrg?.planTier || "PRO").toUpperCase()} TIER`;

  const features = [
    "High-throughput model gateway proxy",
    "Real-time spend and token tracking",
    "Automated budget guardrail enforcement",
    "Role-based tenant isolation & API keys",
    "Multi-provider analytics & reporting",
  ];

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[#73788c] font-medium">Subscription Tier</span>
        <span className="px-2 py-0.5 rounded-full bg-[#dfba82]/15 text-[#dfba82] border border-[#dfba82]/30 text-[10px] font-bold font-mono">
          {plan}
        </span>
      </div>

      <div>
        <div className="text-xl font-bold text-white tracking-tight">
          {currentOrg?.name || "Organization"} Plan
        </div>
        <p className="text-xs text-[#8e93a6] mt-0.5">
          Tenant status: <span className="text-emerald-400 font-medium">Active</span>
        </p>
      </div>

      <div className="space-y-2 pt-1 border-t border-[#171a27]">
        {features.map((f, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-[#c5c9d6]">
            <Check className="w-3.5 h-3.5 text-[#dfba82] shrink-0" />
            <span className="text-[11.5px]">{f}</span>
          </div>
        ))}
      </div>

      <Link
        href="/dashboard/subscription"
        className="w-full py-2.5 rounded-xl bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Manage Subscription &amp; Plans</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
