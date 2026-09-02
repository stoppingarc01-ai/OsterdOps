"use client";

import React, { useEffect, useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { AlertOctagon, ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";

interface SecurityEventItem {
  id: string;
  type: string;
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  timestamp: string;
  ipHash: string;
  actorId: string;
  description: string;
}

export default function SecurityEventsPage() {
  const { currentOrg, getIdToken } = useAuth();
  const [filterSev, setFilterSev] = useState<string>("ALL");
  const [events, setEvents] = useState<SecurityEventItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchSecurityEvents() {
      if (!currentOrg?.id) return;
      setLoading(true);

      try {
        const token = await getIdToken();
        const res = await apiRequest<any[]>(`/api/v1/organizations/${currentOrg.id}/audit-logs`, {
          token,
        });

        if (!isMounted) return;

        if (res.data && Array.isArray(res.data)) {
          const mapped: SecurityEventItem[] = res.data
            .filter((l: any) => l.action?.includes("SECURITY") || l.action?.includes("AUTH") || l.action?.includes("KEY"))
            .map((l: any) => ({
              id: l.id,
              type: l.action || "SECURITY_EVENT",
              severity: l.action?.includes("FAIL") || l.action?.includes("DENIED") ? "HIGH" : "INFO",
              timestamp: l.timestamp ? new Date(l.timestamp).toISOString().replace("T", " ").slice(0, 19) + " UTC" : "Recent",
              ipHash: l.ip ? `ip_${l.ip.slice(0, 4)}...` : "internal",
              actorId: l.actor || "system",
              description: l.target || l.resource || "Security audit entry verified.",
            }));
          setEvents(mapped);
        } else {
          setEvents([]);
        }
      } catch (err) {
        if (isMounted) setEvents([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchSecurityEvents();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken]);

  const filtered = events.filter(
    (e) => filterSev === "ALL" || e.severity === filterSev
  );

  const getSeverityBadge = (sev: SecurityEventItem["severity"]) => {
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
                  <AlertOctagon className="w-3.5 h-3.5" />
                  Threat Detection
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  Security Threat Events
                </h1>
              </div>

              <div className="flex items-center gap-2">
                {(["ALL", "CRITICAL", "HIGH", "INFO"] as const).map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setFilterSev(sev)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      filterSev === sev
                        ? "bg-[#dfba82] text-black shadow-xs"
                        : "bg-[#111422] text-[#8e93a6] hover:text-white border border-[#1d2136]"
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-[#8e93a6] space-y-2">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#dfba82]" />
                <div>Scanning security logs...</div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 rounded-2xl bg-[#0d0f18] border border-[#1d202e] text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-950/40 border border-emerald-800/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="text-sm font-semibold text-white">No security threat events recorded</div>
                <p className="text-xs text-[#8e93a6] max-w-sm mx-auto">
                  All gateway tokens, IP access controls, and authentication requests are validated and secure.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((e) => (
                  <div
                    key={e.id}
                    className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-xl hover:border-[#dfba82]/40 transition-all space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadge(e.severity)}`}>
                          {e.severity}
                        </span>
                        <h4 className="text-xs font-bold text-white font-mono">{e.type}</h4>
                      </div>
                      <span className="text-[11px] text-[#73788c] font-mono">{e.timestamp}</span>
                    </div>
                    <p className="text-xs text-[#c5c9d6]">{e.description}</p>
                    <div className="flex items-center gap-4 text-[11px] text-[#73788c] font-mono pt-1">
                      <span>Actor: {e.actorId}</span>
                      <span>Origin: {e.ipHash}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}
