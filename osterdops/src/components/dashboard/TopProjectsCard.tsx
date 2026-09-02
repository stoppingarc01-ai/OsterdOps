"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Headphones, Search, Code, Wrench, FolderKanban, Loader2, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { Project } from "@/types";

const ICONS = [Headphones, Search, Code, Wrench, FolderKanban];

export function TopProjectsCard() {
  const { currentOrg, getIdToken } = useAuth();
  const [projects, setProjects] = useState<Array<{
    id: string;
    name: string;
    spend: string;
    requests: string;
    costPerReq: string;
  }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchOrgProjects() {
      if (!currentOrg?.id) return;
      setLoading(true);

      try {
        const token = await getIdToken();
        if (!token) return;

        const res = await fetch(`/api/v1/projects?organizationId=${currentOrg.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const payload = await res.json();
          if (payload.success && Array.isArray(payload.data)) {
            const formatted = payload.data.map((p: Project) => {
              const spend = p.currentMonthSpend ?? 0;
              const reqs = p.totalRequests ?? 0;
              const costPer = reqs > 0 ? (spend / reqs).toFixed(4) : "0.0000";

              return {
                id: p.id,
                name: p.name,
                spend: `$${spend.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                requests: reqs.toLocaleString("en-US"),
                costPerReq: `$${costPer}`,
              };
            });

            if (isMounted) {
              setProjects(formatted);
            }
          }
        }
      } catch (err) {
        console.warn("[TopProjectsCard] Error fetching live projects:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchOrgProjects();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken]);

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#f4efe6]">Top Projects by Spend</h3>
        <Link
          href="/dashboard/projects"
          className="text-xs font-semibold text-[#8e93a6] hover:text-[#dfba82] transition-colors"
        >
          View all
        </Link>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-[#8e93a6] space-y-2">
          <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#dfba82]" />
          <div>Loading projects...</div>
        </div>
      ) : projects.length === 0 ? (
        <div className="p-6 rounded-xl bg-[#090b12] border border-[#171a27] text-center space-y-2.5">
          <div className="w-8 h-8 rounded-full bg-[#dfba82]/10 border border-[#dfba82]/20 text-[#dfba82] flex items-center justify-center mx-auto">
            <FolderKanban className="w-4 h-4" />
          </div>
          <div className="text-xs font-semibold text-white">No projects created yet</div>
          <p className="text-[11px] text-[#73788c] max-w-xs mx-auto">
            Create an application workspace to isolate API keys and track per-project spend attribution.
          </p>
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-bold transition-all mt-1 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Project</span>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#171a27] text-[#6e7387] font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-2.5 font-medium">Project</th>
                <th className="pb-2.5 font-medium text-right">Spend</th>
                <th className="pb-2.5 font-medium text-right">Requests</th>
                <th className="pb-2.5 font-medium text-right">Cost / Request</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#151826]">
              {projects.map((proj, idx) => {
                const Icon = ICONS[idx % ICONS.length];
                return (
                  <tr key={proj.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-[#141724] border border-[#232738] flex items-center justify-center text-[#dfba82]">
                          <Icon className="w-3 h-3" />
                        </div>
                        <span className="font-semibold text-white tracking-tight">
                          {proj.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 text-right font-bold text-white">
                      {proj.spend}
                    </td>
                    <td className="py-2.5 text-right text-[#8e93a6] font-mono">
                      {proj.requests}
                    </td>
                    <td className="py-2.5 text-right text-[#8e93a6] font-mono">
                      {proj.costPerReq}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
