"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Headphones, Search, Code, Wrench, FolderKanban, Loader2, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import type { Project } from "@/types";

const ICONS = [Headphones, Search, Code, Wrench, FolderKanban];

interface ProjectRow {
  id: string;
  name: string;
  spendUsd: number;
  requests: number;
}

const BENCHMARK_PROJECTS: ProjectRow[] = [
  { id: "proj_bm_1", name: "ProductionGateway", spendUsd: 1842.10, requests: 78420 },
  { id: "proj_bm_2", name: "AgentWorkflows", spendUsd: 890.30, requests: 41200 },
  { id: "proj_bm_3", name: "InternalCopilot", spendUsd: 420.50, requests: 16800 },
  { id: "proj_bm_4", name: "DataExtractionPipeline", spendUsd: 228.70, requests: 6430 },
];

export function TopProjectsCard() {
  const { currentOrg, getIdToken } = useAuth();
  const { formatCurrency } = useCurrency();
  const isDemo = typeof window !== "undefined" && (
    new URLSearchParams(window.location.search).get("demo") === "true" ||
    sessionStorage.getItem("osterdops_demo_mode") === "true" ||
    document.cookie.includes("osterdops_demo_mode=true")
  );

  const [projects, setProjects] = useState<ProjectRow[]>(() => isDemo ? BENCHMARK_PROJECTS : []);
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
            const formatted: ProjectRow[] = payload.data.map((p: Project) => ({
              id: p.id,
              name: p.name,
              spendUsd: p.currentMonthSpend ?? 0,
              requests: p.totalRequests ?? 0,
            }));

            if (isMounted) {
              setProjects(formatted);
            }
          } else if (isMounted) {
            setProjects(isDemo ? BENCHMARK_PROJECTS : []);
          }
        }
      } catch (err) {
        console.warn("[TopProjectsCard] Error fetching live projects:", err);
        if (isMounted) setProjects(isDemo ? BENCHMARK_PROJECTS : []);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchOrgProjects();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken, isDemo]);

  const displayProjects = projects.length > 0 ? projects : (isDemo ? BENCHMARK_PROJECTS : []);

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
      ) : displayProjects.length === 0 ? (
        <div className="p-6 rounded-xl bg-[#080a12] border border-[#171a29] text-center space-y-2">
          <div className="w-8 h-8 rounded-lg bg-[#dfba82]/10 border border-[#dfba82]/20 flex items-center justify-center text-[#dfba82] mx-auto">
            <FolderKanban className="w-4 h-4" />
          </div>
          <div className="text-xs font-semibold text-white">No projects created yet</div>
          <p className="text-[11px] text-[#73788c] max-w-xs mx-auto">
            Organize cost attribution and proxy API keys by application or microservice.
          </p>
          <div className="pt-1">
            <Link
              href="/dashboard/projects"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141724] hover:bg-[#1d2134] text-[#dfba82] border border-[#dfba82]/30 text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Project</span>
            </Link>
          </div>
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
              {displayProjects.map((proj, idx) => {
                const Icon = ICONS[idx % ICONS.length];
                const costPer = proj.requests > 0 ? proj.spendUsd / proj.requests : 0;

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
                      {formatCurrency(proj.spendUsd)}
                    </td>
                    <td className="py-2.5 text-right text-[#8e93a6] font-mono">
                      {proj.requests.toLocaleString("en-US")}
                    </td>
                    <td className="py-2.5 text-right text-[#8e93a6] font-mono">
                      {formatCurrency(costPer, { decimals: 4 })}
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
