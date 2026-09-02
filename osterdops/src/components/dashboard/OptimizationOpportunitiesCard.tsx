"use client";

import React, { useEffect, useState } from "react";
import { Zap, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";

interface OptimizationItem {
  id?: string;
  title: string;
  potentialMonthlySavingsUsd?: number;
  savingsDescription?: string;
  impact?: "High" | "Medium" | "Low";
}

export function OptimizationOpportunitiesCard() {
  const { currentOrg, getIdToken } = useAuth();
  const [items, setItems] = useState<OptimizationItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchRecs() {
      if (!currentOrg?.id) return;
      setLoading(true);

      try {
        const token = await getIdToken();
        const res = await apiRequest<any>(`/api/v1/organizations/${currentOrg.id}/recommendations`, {
          token,
        });

        if (!isMounted) return;

        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setItems(res.data);
        } else {
          setItems([]);
        }
      } catch (err) {
        if (isMounted) setItems([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchRecs();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken]);

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#f4efe6]">
          Optimization Opportunities
        </h3>
        <Link
          href="/dashboard/analytics"
          className="text-xs font-semibold text-[#8e93a6] hover:text-[#dfba82] transition-colors"
        >
          View all
        </Link>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-[#8e93a6] space-y-2">
          <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#dfba82]" />
          <div>Scanning inference traces...</div>
        </div>
      ) : items.length === 0 ? (
        <div className="p-6 rounded-xl bg-[#090b12] border border-[#171a27] text-center space-y-2">
          <div className="w-8 h-8 rounded-full bg-[#dfba82]/10 border border-[#dfba82]/20 text-[#dfba82] flex items-center justify-center mx-auto">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xs font-semibold text-white">No optimization recommendations</div>
          <p className="text-[11px] text-[#73788c]">
            As traffic patterns develop, algorithmic routing and prompt compression opportunities will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="p-3 bg-[#111320] border border-[#1b1e2e] rounded-xl flex items-center justify-between gap-3 hover:border-[#dfba82]/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#181b2a] border border-[#262a3f] flex items-center justify-center text-[#dfba82] shrink-0">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">{item.title}</div>
                  <div className="text-[11px] text-[#8e93a6]">
                    {item.savingsDescription || `Save $${(item.potentialMonthlySavingsUsd ?? 0).toFixed(0)}/mo`}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
