"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, FolderKanban } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";

export function SpendByTeamCard() {
  const { currentOrg, getIdToken } = useAuth();
  const [projects, setProjects] = useState<Array<{ name: string; spend: string }>>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadTeamSpend() {
      if (!currentOrg?.id) return;

      try {
        const token = await getIdToken();
        const res = await apiRequest<any[]>("/api/v1/projects", {
          params: { organizationId: currentOrg.id },
          token,
        });

        if (!isMounted) return;

        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setProjects(
            res.data.map((p) => ({
              name: p.name,
              spend: `$${(p.currentMonthSpend ?? 0).toFixed(2)}`,
            }))
          );
        } else {
          setProjects([]);
        }
      } catch (err) {
        if (isMounted) setProjects([]);
      }
    }

    loadTeamSpend();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken]);

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <h3 className="text-base font-semibold text-[#f4efe6]">Spend by Project &amp; Team</h3>

      {projects.length === 0 ? (
        <div className="p-6 text-center text-xs text-[#73788c] bg-[#090b12] rounded-xl border border-[#161824] space-y-2">
          <div className="w-8 h-8 rounded-full bg-[#dfba82]/10 text-[#dfba82] flex items-center justify-center mx-auto">
            <FolderKanban className="w-4 h-4" />
          </div>
          <div className="text-white font-medium">No project telemetry recorded</div>
          <p className="text-[11px] text-[#73788c]">Assign API keys to projects to track per-team consumption.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between p-3 rounded-xl bg-[#111320] border border-[#1b1e2e] text-xs"
            >
              <span className="font-semibold text-white">{item.name}</span>
              <span className="font-mono font-bold text-[#dfba82]">{item.spend}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
