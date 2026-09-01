"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { Bell, AlertOctagon, CheckCircle2, Check, Filter } from "lucide-react";
import { RbacGuard } from "@/components/auth/RbacGuard";

interface AlertItem {
  id: string;
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  type: string;
  resourceName: string;
  threshold: string;
  utilization: string;
  timestamp: string;
  status: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
}

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: "alt_01",
    severity: "CRITICAL",
    type: "BUDGET_THRESHOLD_BREACHED",
    resourceName: "Staging Auto-Eval Quota",
    threshold: "90% Cap ($22.50)",
    utilization: "99.2% ($24.80)",
    timestamp: "2026-08-29 10:15:00 UTC",
    status: "ACTIVE",
  },
  {
    id: "alt_02",
    severity: "HIGH",
    type: "BUDGET_THRESHOLD_BREACHED",
    resourceName: "Customer Support Agent Cap",
    threshold: "75% Warning ($75.00)",
    utilization: "74.2% ($74.20)",
    timestamp: "2026-08-29 08:45:00 UTC",
    status: "ACTIVE",
  },
  {
    id: "alt_03",
    severity: "MEDIUM",
    type: "RATE_LIMIT_WARNING",
    resourceName: "OpenAI GPT-4o Gateway",
    threshold: "80% Burst TPM",
    utilization: "85% Capacity",
    timestamp: "2026-08-28 19:20:00 UTC",
    status: "ACKNOWLEDGED",
  },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [filterTab, setFilterTab] = useState<"ACTIVE" | "ACKNOWLEDGED" | "RESOLVED">("ACTIVE");

  const handleAcknowledge = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "ACKNOWLEDGED" } : a))
    );
  };

  const handleResolve = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "RESOLVED" } : a))
    );
  };

  const filtered = alerts.filter((a) => a.status === filterTab);

  const getSeverityBadge = (sev: AlertItem["severity"]) => {
    switch (sev) {
      case "CRITICAL":
        return "bg-rose-950/60 text-rose-400 border-rose-800/40";
      case "HIGH":
        return "bg-amber-950/60 text-amber-400 border-amber-800/40";
      case "MEDIUM":
        return "bg-yellow-950/60 text-yellow-400 border-yellow-800/40";
      case "LOW":
      case "INFO":
        return "bg-blue-950/60 text-blue-400 border-blue-800/40";
    }
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#dfba82] tracking-wider uppercase mb-1">
                  <Bell className="w-3.5 h-3.5" />
                  Alert Center
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  Spending & Anomaly Alerts
                </h1>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-[#0c0e17] border border-[#1b1e2c] p-1 rounded-xl text-xs">
                {(["ACTIVE", "ACKNOWLEDGED", "RESOLVED"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilterTab(tab)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                      filterTab === tab
                        ? "bg-[#dfba82] text-black font-bold shadow-[0_0_12px_rgba(223,186,130,0.3)]"
                        : "text-[#8e93a6] hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    {tab} ({alerts.filter((a) => a.status === tab).length})
                  </button>
                ))}
              </div>
            </div>

            {/* Alerts List */}
            <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="p-8 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] text-center text-xs text-[#73788c]">
                  No {filterTab.toLowerCase()} alerts found.
                </div>
              ) : (
                filtered.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-[#161928] text-[#dfba82] shrink-0 mt-0.5">
                        <AlertOctagon className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getSeverityBadge(item.severity)}`}>
                            {item.severity}
                          </span>
                          <span className="font-bold text-xs text-[#f4efe6]">{item.resourceName}</span>
                        </div>
                        <div className="text-xs text-[#8e93a6]">
                          Threshold: <span className="text-[#c5c9d6]">{item.threshold}</span> | Current:{" "}
                          <span className="text-[#dfba82] font-semibold">{item.utilization}</span>
                        </div>
                        <div className="text-[10px] text-[#555a6d]">{item.timestamp}</div>
                      </div>
                    </div>

                    <RbacGuard permission="alerts:manage">
                      <div className="flex items-center gap-2 shrink-0">
                        {item.status === "ACTIVE" && (
                          <button
                            onClick={() => handleAcknowledge(item.id)}
                            className="px-3 py-1.5 rounded-lg bg-[#161928] hover:bg-[#202538] text-xs font-semibold text-white transition-colors cursor-pointer"
                          >
                            Acknowledge
                          </button>
                        )}
                        {item.status !== "RESOLVED" && (
                          <button
                            onClick={() => handleResolve(item.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 hover:bg-emerald-900/60 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Resolve
                          </button>
                        )}
                      </div>
                    </RbacGuard>
                  </div>
                ))
              )}
            </div>
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}
