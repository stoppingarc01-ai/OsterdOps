"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";

export function AIInsightsCard() {
  const { currentOrg, getIdToken } = useAuth();
  const [insight, setInsight] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchInsights() {
      if (!currentOrg?.id) return;

      try {
        const token = await getIdToken();
        const res = await apiRequest<any>(`/api/v1/organizations/${currentOrg.id}/recommendations`, {
          token,
        });

        if (!isMounted) return;

        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const top = res.data[0];
          setInsight(top.title || top.description);
        } else {
          setInsight(null);
        }
      } catch (err) {
        if (isMounted) setInsight(null);
      }
    }

    fetchInsights();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken]);

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex flex-col justify-between space-y-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#dfba82]/[0.08] rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#dfba82]" />
          <h3 className="text-base font-semibold text-[#f4efe6]">AI Insights</h3>
        </div>
        <Link
          href="/dashboard/analytics"
          className="text-xs font-semibold text-[#8e93a6] hover:text-[#dfba82] transition-colors"
        >
          View all
        </Link>
      </div>

      {/* Main recommendation text + 3D Orb visual */}
      <div className="grid grid-cols-12 gap-3 items-center z-10">
        <div className="col-span-7 space-y-3">
          <p className="text-xs text-[#c5c9d6] leading-relaxed">
            {insight ? (
              <span>{insight}</span>
            ) : (
              <span>
                Semantic caching and latency-optimized routing are actively monitoring proxy requests. Route application calls to discover savings opportunities.
              </span>
            )}
          </p>

          <Link
            href="/dashboard/projects"
            className="group inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#171a29] border border-[#dfba82]/30 hover:border-[#dfba82] text-[#dfba82] text-xs font-semibold rounded-xl transition-all cursor-pointer hover:bg-[#dfba82]/10"
          >
            <span>Explore Workspaces</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 3D Glowing Crystal Orb Artwork */}
        <div className="col-span-5 flex flex-col items-center justify-center relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#dfba82]/40 via-[#ffffff]/20 to-[#dfba82]/80 border border-[#dfba82] shadow-[0_0_25px_rgba(223,186,130,0.5)] flex items-center justify-center relative animate-pulse">
            <div className="w-8 h-8 rounded-full bg-[#07080c]/60 backdrop-blur-xs flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
          {/* Base pedestal */}
          <div className="w-16 h-3 bg-[#131625] border border-[#2b3047] rounded-[100%] -mt-1 shadow-md" />
        </div>
      </div>
    </div>
  );
}
