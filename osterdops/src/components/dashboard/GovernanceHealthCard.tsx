"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";
import { ShieldCheck, Loader2 } from "lucide-react";

export function GovernanceHealthCard() {
  const { currentOrg, getIdToken } = useAuth();
  const [budgetsCount, setBudgetsCount] = useState(0);
  const [avgUtilization, setAvgUtilization] = useState(0);
  const [violationsCount, setViolationsCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchGovernanceData() {
      if (!currentOrg?.id) return;
      setLoading(true);

      try {
        const token = await getIdToken();
        const [budgetsRes, alertsRes] = await Promise.all([
          apiRequest<any[]>("/api/v1/budgets", {
            params: { organizationId: currentOrg.id },
            token,
          }),
          apiRequest<any[]>("/api/v1/alerts", {
            params: { organizationId: currentOrg.id, status: "ACTIVE" },
            token,
          }),
        ]);

        if (!isMounted) return;

        if (budgetsRes.data && Array.isArray(budgetsRes.data)) {
          const bList = budgetsRes.data;
          setBudgetsCount(bList.length);
          if (bList.length > 0) {
            const totalUtil = bList.reduce((acc, b) => {
              const cap = b.monthlyCap ?? b.limitAmount ?? 1;
              const spend = b.currentSpend ?? 0;
              return acc + (spend / Math.max(1, cap)) * 100;
            }, 0);
            setAvgUtilization(Math.round(totalUtil / bList.length));
          } else {
            setAvgUtilization(0);
          }
        }

        if (alertsRes.data && Array.isArray(alertsRes.data)) {
          setViolationsCount(alertsRes.data.length);
        }
      } catch (err) {
        if (isMounted) {
          setBudgetsCount(0);
          setAvgUtilization(0);
          setViolationsCount(0);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchGovernanceData();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken]);

  const score = Math.max(0, 100 - violationsCount * 15);

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#f4efe6]">Governance Health</h3>
        {loading && <Loader2 className="w-3.5 h-3.5 text-[#dfba82] animate-spin" />}
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-1">
        {/* Budgets */}
        <div className="space-y-0.5">
          <div className="text-[10.5px] text-[#73788c] font-medium uppercase tracking-wider">
            Budgets
          </div>
          <div className="text-xl font-bold text-white">{budgetsCount}</div>
          <div className="text-[10.5px] text-[#8e93a6]">Configured</div>
        </div>

        {/* Budget Utilization */}
        <div className="space-y-0.5">
          <div className="text-[10.5px] text-[#73788c] font-medium uppercase tracking-wider">
            Utilization
          </div>
          <div className="text-xl font-bold text-white">{budgetsCount > 0 ? `${avgUtilization}%` : "—"}</div>
          <div className="text-[10.5px] text-[#8e93a6]">Average</div>
        </div>

        {/* Policy Violations */}
        <div className="space-y-0.5">
          <div className="text-[10.5px] text-[#73788c] font-medium uppercase tracking-wider">
            Active Alerts
          </div>
          <div className={`text-xl font-bold ${violationsCount > 0 ? "text-[#ef4444]" : "text-[#4ade80]"}`}>
            {violationsCount}
          </div>
          <div className="text-[10.5px] text-[#8e93a6]">Pending</div>
        </div>

        {/* Active Policies */}
        <div className="space-y-0.5">
          <div className="text-[10.5px] text-[#73788c] font-medium uppercase tracking-wider">
            Postures
          </div>
          <div className="text-xl font-bold text-white">{budgetsCount > 0 ? "Enforced" : "Standby"}</div>
          <div className="text-[10.5px] text-[#8e93a6]">Policy state</div>
        </div>
      </div>

      {/* Governance Score Bar */}
      <div className="pt-2 border-t border-[#171a27] space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#8e93a6] font-medium">Overall Governance Score</span>
          <span className="text-white font-bold font-mono">
            {budgetsCount === 0 && violationsCount === 0 ? "100/100" : `${score}/100`}
          </span>
        </div>
        <div className="w-full h-2 bg-[#141724] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#dfba82] to-[#b8860b] rounded-full transition-all duration-500"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  );
}
