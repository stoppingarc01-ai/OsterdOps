"use client";

import React from "react";
import Link from "next/link";
import { Clock, Sparkles } from "lucide-react";
import { useSubscriptionAccess } from "@/hooks/useSubscriptionAccess";

export function TrialBadge() {
  const { isTrial, daysRemaining, isExpired } = useSubscriptionAccess();

  if (!isTrial && !isExpired) {
    return null;
  }

  if (isExpired) {
    return (
      <Link
        href="/pricing"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors"
      >
        <span>Trial Expired • Upgrade</span>
      </Link>
    );
  }

  return (
    <Link
      href="/pricing"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#dfba82]/10 border border-[#dfba82]/30 text-[#dfba82] text-xs font-semibold hover:bg-[#dfba82]/20 transition-all group"
      title="Click to upgrade subscription"
    >
      <Clock className="w-3.5 h-3.5 text-[#dfba82] animate-pulse" />
      <span>Trial: {daysRemaining}d remaining</span>
      <Sparkles className="w-3 h-3 text-[#dfba82] opacity-70 group-hover:opacity-100" />
    </Link>
  );
}
