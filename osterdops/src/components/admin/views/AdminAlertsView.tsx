"use client";

import React, { useState } from "react";
import {
  BellRing,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Check,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

interface AdminAlert {
  id: string;
  title: string;
  message: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
  project: string;
  triggeredAt: string;
  acknowledgedBy?: string;
  dedupKey: string;
}

const INITIAL_ALERTS: AdminAlert[] = [
  {
    id: "alt_01",
    title: "80% Budget Threshold Reached",
    message: "Production Gateway has consumed $1,140.50 of its $1,500 monthly limit (76.0%).",
    severity: "HIGH",
    status: "ACTIVE",
    project: "Production Gateway",
    triggeredAt: "18 mins ago",
    dedupKey: "alert_budget_proj_prod_80",
  },
  {
    id: "alt_02",
    title: "Upstream Provider Latency Spike",
    message: "Anthropic Claude 3.5 Sonnet p99 latency elevated to 810ms (normal: ~350ms).",
    severity: "MEDIUM",
    status: "ACKNOWLEDGED",
    project: "Staging LLM Pipeline",
    triggeredAt: "1 hour ago",
    acknowledgedBy: "Alex Rivera",
    dedupKey: "alert_provider_anthropic_latency",
  },
  {
    id: "alt_03",
    title: "Rate Limit Window Exceeded",
    message: "Client IP burst exceeded 500 RPM limit. 12 requests temporarily rejected with 429.",
    severity: "LOW",
    status: "RESOLVED",
    project: "Production Gateway",
    triggeredAt: "Yesterday",
    acknowledgedBy: "Sarah Jenkins",
    dedupKey: "alert_ratelimit_burst_429",
  },
];

const SEVERITY_STYLES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  CRITICAL: { label: "CRITICAL", bg: "bg-rose-950/60", text: "text-rose-400", border: "border-rose-800/50" },
  HIGH: { label: "HIGH", bg: "bg-amber-950/60", text: "text-amber-400", border: "border-amber-800/50" },
  MEDIUM: { label: "MEDIUM", bg: "bg-blue-950/60", text: "text-blue-400", border: "border-blue-800/50" },
  LOW: { label: "LOW", bg: "bg-zinc-800", text: "text-zinc-300", border: "border-zinc-700" },
};

export function AdminAlertsView() {
  const [alerts, setAlerts] = useState<AdminAlert[]>(INITIAL_ALERTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  const filteredAlerts = alerts.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.message.toLowerCase().includes(search.toLowerCase()) ||
      a.project.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
    const matchesSeverity = severityFilter === "ALL" || a.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const handleAcknowledge = (alertId: string) => {
    setAlerts(
      alerts.map((a) =>
        a.id === alertId
          ? { ...a, status: "ACKNOWLEDGED", acknowledgedBy: "Admin User" }
          : a
      )
    );
  };

  const handleResolve = (alertId: string) => {
    setAlerts(
      alerts.map((a) =>
        a.id === alertId ? { ...a, status: "RESOLVED" } : a
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 text-[#717688] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3.5 py-2 bg-[#0c0f16] border border-[#171b26] rounded-xl text-xs text-white placeholder:text-[#555a6d] focus:outline-none focus:border-[#dfba82] w-64"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0c0f16] border border-[#171b26] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#dfba82]"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Alerts</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#0c0f16] border border-[#171b26] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#dfba82]"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center bg-[#0c0f16] border border-[#171b26] rounded-2xl text-xs text-[#8e93a6]">
            No alerts match your filter criteria.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const sev = SEVERITY_STYLES[alert.severity];

            return (
              <div
                key={alert.id}
                className={`bg-[#0c0f16] border rounded-2xl p-5 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  alert.status === "ACTIVE"
                    ? "border-[#171b26] hover:border-[#dfba82]/40"
                    : "border-[#171b26]/50 opacity-70"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${sev.bg} ${sev.text} ${sev.border}`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-white font-serif">{alert.title}</h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${sev.bg} ${sev.text} ${sev.border}`}
                      >
                        {sev.label}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          alert.status === "ACTIVE"
                            ? "bg-rose-950/60 text-rose-400 border-rose-800/40"
                            : alert.status === "ACKNOWLEDGED"
                            ? "bg-amber-950/60 text-amber-400 border-amber-800/40"
                            : "bg-emerald-950/60 text-emerald-400 border-emerald-800/40"
                        }`}
                      >
                        {alert.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#8e93a6] mt-1">{alert.message}</p>

                    <div className="flex items-center gap-4 text-[11px] text-[#717688] mt-2 font-mono">
                      <span>Project: {alert.project}</span>
                      <span>Triggered: {alert.triggeredAt}</span>
                      {alert.acknowledgedBy && (
                        <span>Ack by: {alert.acknowledgedBy}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {alert.status === "ACTIVE" && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-3 py-1.5 rounded-xl bg-[#1b202e] hover:bg-[#252c3f] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Acknowledge</span>
                    </button>
                  )}

                  {alert.status !== "RESOLVED" && (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/40 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Resolve</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
