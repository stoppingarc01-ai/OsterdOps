"use client";

import React, { useEffect, useState } from "react";
import { Headphones, Search, Code, Wrench, FolderKanban, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { Project } from "@/types";

const ICONS = [Headphones, Search, Code, Wrench, FolderKanban];

const FALLBACK_PROJECTS = [
  {
    id: "fb-1",
    name: "Support Agent",
    spend: "$1,830.24",
    requests: "68,231",
    costPerReq: "$0.0268",
  },
  {
    id: "fb-2",
    name: "Research Agent",
    spend: "$1,210.43",
    requests: "32,112",
    costPerReq: "$0.0377",
  },
  {
    id: "fb-3",
    name: "Coding Agent",
    spend: "$890.12",
    requests: "21,432",
    costPerReq: "$0.0415",
  },
  {
    id: "fb-4",
    name: "Internal Tools",
    spend: "$412.32",
    requests: "11,231",
    costPerReq: "$0.0367",
  },
];

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
          if (payload.success && Array.isArray(payload.data) && payload.data.length > 0) {
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

  const displayProjects = projects.length > 0 ? projects : FALLBACK_PROJECTS;

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#f4efe6]">Top Projects by Spend</h3>
        {loading && <Loader2 className="w-3.5 h-3.5 text-[#dfba82] animate-spin" />}
      </div>

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
            {displayProjects.map((proj, idx) => {
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
    </div>
  );
}
