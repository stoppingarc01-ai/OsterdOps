"use client";

import React, { useEffect, useState } from "react";
import {
  CreditCard,
  DollarSign,
  MessageSquare,
  TrendingUp,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";

export function AdminKpiCards() {
  const { currentOrg, getIdToken } = useAuth();
  const [spend, setSpend] = useState("$0.00");
  const [requests, setRequests] = useState("0");
  const [membersCount, setMembersCount] = useState(1);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!currentOrg?.id) return;
      try {
        const token = await getIdToken();
        const [overviewRes, membersRes] = await Promise.all([
          apiRequest<any>("/api/v1/analytics/overview", {
            params: { organizationId: currentOrg.id, timeRange: "30d" },
            token,
          }),
          apiRequest<any[]>(`/api/v1/organizations/${currentOrg.id}/members`, { token }),
        ]);

        if (!isMounted) return;

        if (overviewRes.data?.kpis) {
          setSpend(`$${(overviewRes.data.kpis.totalSpendUsd || 0).toFixed(2)}`);
          setRequests((overviewRes.data.kpis.totalRequests || 0).toLocaleString());
        }
        if (Array.isArray(membersRes.data)) {
          setMembersCount(membersRes.data.length);
        }
      } catch (err) {
        // preserve defaults
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken]);

  const kpiData = [
    {
      id: "customers",
      title: "ORGANIZATION SEATS",
      value: membersCount.toString(),
      trendLabel: "Active users",
      icon: Users,
    },
    {
      id: "subscriptions",
      title: "TIER STATUS",
      value: currentOrg?.planTier ? currentOrg.planTier.toUpperCase() : "FREE",
      trendLabel: "Workspace plan",
      icon: CreditCard,
    },
    {
      id: "mrr",
      title: "TOTAL 30D SPEND",
      value: spend,
      trendLabel: "FinOps metered",
      icon: DollarSign,
    },
    {
      id: "requests",
      title: "TOTAL 30D INGESTION",
      value: requests,
      trendLabel: "API proxy calls",
      icon: MessageSquare,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
      {kpiData.map((kpi) => {
        const IconComponent = kpi.icon;
        return (
          <div
            key={kpi.id}
            className="p-5 bg-[#0c0f16] border border-[#1b202e] rounded-2xl flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[#8e94a8]">
              <span className="text-[11px] font-bold uppercase tracking-wider">{kpi.title}</span>
              <IconComponent className="h-4 w-4 text-[#dfba82]" />
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-3">{kpi.value}</div>
            <div className="text-[11px] text-[#717688] mt-1">{kpi.trendLabel}</div>
          </div>
        );
      })}
    </div>
  );
}
