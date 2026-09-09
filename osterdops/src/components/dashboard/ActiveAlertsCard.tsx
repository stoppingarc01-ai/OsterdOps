"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShieldAlert, Zap, Activity, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";

interface AlertItem {
  id: string;
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  type: string;
  resourceName?: string;
  message?: string;
  utilization?: number;
}

export function ActiveAlertsCard() {
  const { currentOrg, getIdToken } = useAuth();
  const searchParams = useSearchParams();
  const isDemo = searchParams?.get("demo") === "true";
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchAlerts() {
      if (!currentOrg?.id) return;
      setLoading(true);

      try {
        const token = await getIdToken();
        const res = await apiRequest<any[]>("/api/v1/alerts", {
          params: { organizationId: currentOrg.id, status: "ACTIVE", limit: 3 },
          token,
        });

        if (!isMounted) return;

        if (res.data && Array.isArray(res.data)) {
          setAlerts(res.data);
        } else {
          setAlerts([]);
        }
      } catch (err) {
        if (isMounted) setAlerts([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAlerts();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken]);

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#f4efe6]">Active Alerts</h3>
        <Link
          href="/dashboard/alerts"
          className="text-xs font-semibold text-[#8e93a6] hover:text-[#dfba82] transition-colors"
        >
          View all
        </Link>
      </div>

      {/* Alert Cards Stack */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#8e93a6] space-y-2">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#dfba82]" />
            <div>Checking governance alerts...</div>
          </div>
        ) : alerts.length === 0 ? (
          isDemo ? (
            <div className="space-y-2.5">
              <div className="p-3 bg-[#111320] border border-[#1b1e2e] rounded-xl flex items-center justify-between gap-3 hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-950/40 border border-emerald-800/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">Latency SLA Guard</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/30">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8e93a6]">268ms P95 latency (well below 800ms SLA)</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#111320] border border-[#1b1e2e] rounded-xl flex items-center justify-between gap-3 hover:border-[#dfba82]/30 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#dfba82]/10 border border-[#dfba82]/30 flex items-center justify-center text-[#dfba82] shrink-0">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">Spend Velocity Guard</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#dfba82]/10 text-[#dfba82] border border-[#dfba82]/30">
                        NORMAL
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8e93a6]">68% monthly budget consumed ($3,381 / $5,000)</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#111320] border border-[#1b1e2e] rounded-xl flex items-center justify-between gap-3 hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-950/40 border border-emerald-800/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">Circuit Breakers</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/30">
                        HEALTHY
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8e93a6]">All 4 multi-provider fallback cascades ready</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-[#080a12] border border-[#171a29] text-center space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold text-white">No active alerts or policy violations</div>
              <p className="text-[11px] text-[#73788c] max-w-xs mx-auto">
                Real-time spending spikes, rate limits, and budget threshold alerts will be reported here.
              </p>
            </div>
          )
        ) : (
          alerts.slice(0, 3).map((a) => (
            <div
              key={a.id}
              className="p-3.5 bg-[#14121a] border border-[#2e1a22] rounded-xl space-y-2 hover:border-[#ef4444]/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/30 flex items-center justify-center text-[#ef4444] shrink-0 mt-0.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#f87171]">{a.type}</h4>
                    <span className="text-[10px] font-bold text-[#ef4444]">{a.severity}</span>
                  </div>
                  <p className="text-[11.5px] text-[#9ca3af] mt-0.5 leading-snug">
                    {a.resourceName || a.message || "Threshold warning detected"}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
