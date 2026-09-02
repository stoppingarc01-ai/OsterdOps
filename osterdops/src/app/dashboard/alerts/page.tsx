"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import {
  Bell,
  AlertOctagon,
  CheckCircle2,
  Check,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Clock,
  RefreshCw,
  Search,
  Sparkles,
  Info,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";
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

export default function AlertsPage() {
  const { currentOrg, getIdToken } = useAuth();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"ACTIVE" | "ACKNOWLEDGED" | "RESOLVED">("ACTIVE");
  const [search, setSearch] = useState("");

  const fetchAlerts = useCallback(async () => {
    if (!currentOrg?.id) return;
    setLoading(true);

    try {
      const token = await getIdToken();
      const res = await apiRequest<any[]>("/api/v1/alerts", {
        params: { organizationId: currentOrg.id },
        token,
      });

      if (res.data && Array.isArray(res.data)) {
        const mapped: AlertItem[] = res.data.map((a: any) => ({
          id: a.id,
          severity: a.severity || "MEDIUM",
          type: a.type || "BUDGET_THRESHOLD_BREACHED",
          resourceName: a.resourceName || a.budgetName || "Workspace Resource",
          threshold: a.threshold ? `${a.threshold}%` : "Cap threshold",
          utilization: a.utilization ? `${a.utilization}%` : "Monitored rate",
          timestamp: a.createdAt ? new Date(a.createdAt).toUTCString() : "Recent",
          status: a.status || "ACTIVE",
        }));
        setAlerts(mapped);
      } else {
        setAlerts([]);
      }
    } catch (e) {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [currentOrg, getIdToken]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleAcknowledge = async (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "ACKNOWLEDGED" } : a))
    );

    try {
      const token = await getIdToken();
      await apiRequest(`/api/v1/alerts/${id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ status: "ACKNOWLEDGED" }),
      });
    } catch (e) {
      // handled
    }
  };

  const handleResolve = async (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "RESOLVED" } : a))
    );

    try {
      const token = await getIdToken();
      await apiRequest(`/api/v1/alerts/${id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ status: "RESOLVED" }),
      });
    } catch (e) {
      // handled
    }
  };

  const filtered = alerts.filter(
    (a) =>
      a.status === filterTab &&
      (a.resourceName.toLowerCase().includes(search.toLowerCase()) ||
        a.type.toLowerCase().includes(search.toLowerCase()) ||
        a.severity.toLowerCase().includes(search.toLowerCase()))
  );

  const activeCount = alerts.filter((a) => a.status === "ACTIVE").length;
  const criticalCount = alerts.filter((a) => a.severity === "CRITICAL" && a.status === "ACTIVE").length;
  const ackCount = alerts.filter((a) => a.status === "ACKNOWLEDGED").length;
  const resolvedCount = alerts.filter((a) => a.status === "RESOLVED").length;

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

      <main className="flex-1 p-4 sm:p-6 lg:p-7 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#dfba82] tracking-wider uppercase mb-1">
                  <Zap className="w-3 h-3 text-[#dfba82]" />
                  <span>GOVERNANCE</span>
                  <span className="text-[#555a6d]">/</span>
                  <span className="text-[#c5c9d6]">ALERTS</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <h1
                    className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f4efe6]"
                    style={{ fontFamily: "var(--font-serif-luxury), Georgia, serif" }}
                  >
                    Spending & Anomaly Alerts
                  </h1>
                  <div className="w-5 h-5 rounded-md border border-[#dfba82]/40 bg-[#dfba82]/10 flex items-center justify-center text-[#dfba82]">
                    <Bell className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                </div>
                <p className="text-xs text-[#8e93a6] mt-0.5">
                  Live real-time incident detection, rate-limit thresholds, and automated budget violation alerts.
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={fetchAlerts}
                  className="p-2 rounded-xl bg-[#0c0e16] border border-[#1b1e2c] text-[#8e93a6] hover:text-white hover:border-[#2a2f45] transition-all cursor-pointer"
                  title="Refresh alerts"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#dfba82]" : ""}`} />
                </button>

                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 absolute left-3 text-[#6b7082] pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search incident, resource..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-48 sm:w-60 pl-8 pr-3 py-1.5 rounded-xl bg-[#0c0e16] border border-[#1b1e2c] text-xs text-white placeholder-[#555a6d] focus:outline-none focus:border-[#dfba82]/50"
                  />
                </div>
              </div>
            </div>

            {/* 5 Top Stat KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Card 1: Active Alerts */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-[#dfba82]/10 border border-[#dfba82]/20 flex items-center justify-center text-[#dfba82]">
                      <Bell className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium flex items-center gap-1">
                      Active Alerts
                      <Info className="w-3 h-3 text-[#555a6d]" />
                    </span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">{activeCount}</div>
                  <div className="text-[10.5px] text-[#8e93a6]">Requiring team review</div>
                </div>
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 35 C 20 38, 45 28, 65 32 C 80 34, 88 12, 100 6"
                      fill="none"
                      stroke="#dfba82"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Card 2: Critical Breaches */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-rose-950/40 border border-rose-800/30 flex items-center justify-center text-rose-400">
                      <AlertOctagon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Critical Breaches</span>
                  </div>
                  <div className="text-xl font-bold text-rose-400 pt-0.5">{criticalCount}</div>
                  <div className="text-[10.5px] text-[#8e93a6]">Hard stop thresholds</div>
                </div>
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 32 C 25 30, 45 22, 65 24 C 80 26, 88 12, 100 6"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Card 3: Acknowledged */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-amber-950/40 border border-amber-800/30 flex items-center justify-center text-[#dfba82]">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Acknowledged</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">{ackCount}</div>
                  <div className="text-[10.5px] text-[#8e93a6]">In triage</div>
                </div>
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 34 C 20 30, 40 18, 60 26 C 75 30, 85 12, 100 6"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Card 4: Resolved Incidents */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-emerald-950/40 border border-emerald-800/30 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Resolved</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">{resolvedCount}</div>
                  <div className="text-[10.5px] text-emerald-400 font-medium">All clear</div>
                </div>
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 36 C 25 35, 50 38, 70 20 C 85 10, 92 16, 100 8"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Card 5: Protection Status */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-blue-950/40 border border-blue-800/30 flex items-center justify-center text-blue-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Monitoring</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">24/7</div>
                  <div className="text-[10.5px] text-emerald-400 font-medium">Real-time gateway eval</div>
                </div>
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 34 C 20 30, 40 18, 60 26 C 75 30, 85 12, 100 6"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-6 border-b border-[#1c1f2e] pb-1 px-1">
              {(["ACTIVE", "ACKNOWLEDGED", "RESOLVED"] as const).map((tab) => {
                const count = alerts.filter((a) => a.status === tab).length;
                const isActive = filterTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setFilterTab(tab)}
                    className={`pb-2.5 text-xs font-semibold tracking-wide relative transition-colors cursor-pointer flex items-center gap-2 ${
                      isActive ? "text-[#dfba82]" : "text-[#707587] hover:text-white"
                    }`}
                  >
                    <span>{tab.charAt(0) + tab.slice(1).toLowerCase()}</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-[#181b28] text-[10px] font-mono">
                      {count}
                    </span>
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#dfba82] rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Alerts List */}
            <div className="space-y-3">
              {loading ? (
                <div className="p-12 text-center text-xs text-[#6b7082] space-y-2 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b]">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#dfba82]" />
                  <div>Loading live alerts...</div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-12 text-center space-y-3 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b]">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-800/30 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-bold text-white">No {filterTab.toLowerCase()} alerts</div>
                  <p className="text-xs text-[#8e93a6] max-w-sm mx-auto">
                    All systems and budgets within your organization are operating under safe thresholds.
                  </p>
                </div>
              ) : (
                filtered.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] hover:border-[#2a2f45] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="p-2.5 rounded-xl bg-[#141624] text-[#dfba82] border border-[#23273a] shrink-0 mt-0.5">
                        <AlertOctagon className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getSeverityBadge(
                              item.severity
                            )}`}
                          >
                            {item.severity}
                          </span>
                          <span className="font-bold text-xs text-[#f4efe6]">{item.resourceName}</span>
                          <span className="text-[10px] text-[#6b7082] font-mono">({item.type})</span>
                        </div>
                        <div className="text-xs text-[#8e93a6]">
                          Breach Threshold: <span className="text-[#c5c9d6]">{item.threshold}</span> · Utilization:{" "}
                          <span className="text-[#dfba82] font-semibold">{item.utilization}</span>
                        </div>
                        <div className="text-[10.5px] text-[#555a6d] font-mono">{item.timestamp}</div>
                      </div>
                    </div>

                    <RbacGuard permission="alerts:manage">
                      <div className="flex items-center gap-2 shrink-0">
                        {item.status === "ACTIVE" && (
                          <button
                            onClick={() => handleAcknowledge(item.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#141624] hover:bg-[#202538] border border-[#23273a] text-xs font-semibold text-white transition-colors cursor-pointer"
                          >
                            Acknowledge
                          </button>
                        )}
                        {item.status !== "RESOLVED" && (
                          <button
                            onClick={() => handleResolve(item.id)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 hover:bg-emerald-900/60 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Resolve</span>
                          </button>
                        )}
                      </div>
                    </RbacGuard>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Insight Banner */}
            <div className="rounded-2xl border border-[#1a1d2b] bg-[#0c0e16] p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#dfba82]/10 border border-[#dfba82]/25 flex items-center justify-center text-[#dfba82] shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Automated Alert Dispatch</div>
                  <div className="text-[11.5px] text-[#8e93a6]">
                    Webhook endpoints and Slack integrations receive instant notification payloads when critical alerts trigger.
                  </div>
                </div>
              </div>

              <button
                onClick={fetchAlerts}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#dfba82] hover:text-[#ebd4aa] transition-colors shrink-0 cursor-pointer"
              >
                <span>Check Status</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}
