"use client";

import React, { useEffect, useState } from "react";
import {
  BellRing,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  Search,
  Check,
  Eye,
  XCircle,
  Filter,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";
import type { Alert } from "@/types";

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

const SEVERITY_STYLES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  CRITICAL: { label: "CRITICAL", bg: "bg-rose-950/60", text: "text-rose-400", border: "border-rose-800/50" },
  HIGH: { label: "HIGH", bg: "bg-amber-950/60", text: "text-amber-400", border: "border-amber-800/50" },
  MEDIUM: { label: "MEDIUM", bg: "bg-blue-950/60", text: "text-blue-400", border: "border-blue-800/50" },
  LOW: { label: "LOW", bg: "bg-zinc-800", text: "text-zinc-300", border: "border-zinc-700" },
};

export function AdminAlertsView() {
  const { currentOrg, getIdToken } = useAuth();
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  useEffect(() => {
    let isMounted = true;

    async function loadAlerts() {
      if (!currentOrg?.id) return;
      setLoading(true);

      try {
        const token = await getIdToken();
        const res = await apiRequest<Alert[]>("/api/v1/alerts", {
          params: { organizationId: currentOrg.id },
          token,
        });

        if (!isMounted) return;

        if (res.data && Array.isArray(res.data)) {
          const mapped: AdminAlert[] = res.data.map((a: any) => ({
            id: a.id,
            title: a.title || "Threshold Alert",
            message: a.message || "Threshold condition triggered",
            severity: (a.severity || "MEDIUM") as any,
            status: (a.status || "ACTIVE") as any,
            project: a.projectName || currentOrg.name || "Workspace",
            triggeredAt: a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recent",
            dedupKey: a.id,
          }));
          setAlerts(mapped);
        } else {
          setAlerts([]);
        }
      } catch (err) {
        if (isMounted) setAlerts([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAlerts();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken]);

  const filteredAlerts = alerts.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.message.toLowerCase().includes(search.toLowerCase()) ||
      a.project.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
    const matchesSeverity = severityFilter === "ALL" || a.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const handleAcknowledge = (id: string) => {
    setAlerts(
      alerts.map((a) =>
        a.id === id ? { ...a, status: "ACKNOWLEDGED", acknowledgedBy: "You" } : a
      )
    );
  };

  const handleResolve = (id: string) => {
    setAlerts(
      alerts.map((a) => (a.id === id ? { ...a, status: "RESOLVED" } : a))
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#717688] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search alerts, messages, or projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0c0f16] border border-[#171b26] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#555a6d] focus:outline-none focus:border-[#dfba82]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
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
        {loading ? (
          <div className="p-12 text-center text-xs text-[#8e93a6] space-y-2">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#dfba82]" />
            <div>Loading active alerts...</div>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-8 text-center bg-[#0c0f16] border border-[#171b26] rounded-2xl text-xs text-[#8e93a6] space-y-1">
            <div className="w-8 h-8 rounded-full bg-emerald-950/40 text-emerald-400 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-white font-semibold">No alerts to display</div>
            <p className="text-[11px] text-[#73788c]">All system monitors, budget thresholds, and proxy routes are nominal.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const sev = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.MEDIUM;

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
                            ? "bg-rose-950/60 text-rose-300 border-rose-800/40"
                            : alert.status === "ACKNOWLEDGED"
                            ? "bg-amber-950/60 text-amber-300 border-amber-800/40"
                            : "bg-emerald-950/60 text-emerald-300 border-emerald-800/40"
                        }`}
                      >
                        {alert.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#8e93a6] mt-1">{alert.message}</p>

                    <div className="flex items-center gap-4 text-[11px] text-[#717688] mt-2">
                      <span>Project: <strong className="text-white">{alert.project}</strong></span>
                      <span>Triggered: {alert.triggeredAt}</span>
                      {alert.acknowledgedBy && (
                        <span>Ack: <strong className="text-white">{alert.acknowledgedBy}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  {alert.status === "ACTIVE" && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-3 py-1.5 rounded-lg border border-[#171b26] hover:border-[#dfba82]/40 bg-[#111422] text-[#c5c9d6] hover:text-white text-xs font-semibold transition-all cursor-pointer"
                    >
                      Acknowledge
                    </button>
                  )}
                  {alert.status !== "RESOLVED" && (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all cursor-pointer"
                    >
                      Resolve
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
