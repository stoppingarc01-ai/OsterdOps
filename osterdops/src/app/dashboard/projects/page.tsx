"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { FolderKanban, Plus, ArrowUpRight, KeyRound, Activity, BadgeDollarSign } from "lucide-react";
import Link from "next/link";
import { RbacGuard } from "@/components/auth/RbacGuard";

interface ProjectItem {
  id: string;
  name: string;
  slug: string;
  environment: string;
  status: "ACTIVE" | "ARCHIVED";
  spend30d: string;
  requests30d: string;
  activeKeys: number;
}

const SAMPLE_PROJECTS: ProjectItem[] = [
  { id: "proj_01", name: "Customer Support Agent", slug: "customer-support-agent", environment: "production", status: "ACTIVE", spend30d: "$74.20", requests30d: "9,420", activeKeys: 2 },
  { id: "proj_02", name: "Code Intelligence Assistant", slug: "code-intelligence-assistant", environment: "production", status: "ACTIVE", spend30d: "$52.30", requests30d: "6,800", activeKeys: 1 },
  { id: "proj_03", name: "Internal Search Copilot", slug: "internal-search-copilot", environment: "staging", status: "ACTIVE", spend30d: "$16.35", requests30d: "2,200", activeKeys: 1 },
];

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#dfba82] tracking-wider uppercase mb-1">
                  <FolderKanban className="w-3.5 h-3.5" />
                  Workspaces & Isolation
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  Projects & Applications
                </h1>
              </div>

              <RbacGuard permission="projects:manage">
                <button
                  onClick={() => alert("Creating new project workspace...")}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#dfba82] text-black text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-[0_0_15px_rgba(223,186,130,0.2)]"
                >
                  <Plus className="w-4 h-4" />
                  Create Project
                </button>
              </RbacGuard>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {SAMPLE_PROJECTS.map((proj) => (
                <Link
                  key={proj.id}
                  href={`/dashboard/projects/${proj.id}`}
                  className="p-5 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] hover:border-[#dfba82]/40 transition-all space-y-4 group cursor-pointer block"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-sm text-white group-hover:text-[#dfba82] transition-colors">
                        {proj.name}
                      </div>
                      <div className="text-[11px] font-mono text-[#73788c] mt-0.5">{proj.slug}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#161928] text-[#c5c9d6]">
                      {proj.environment}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#161928] text-xs">
                    <div>
                      <div className="text-[10px] text-[#73788c]">Spend</div>
                      <div className="font-bold text-[#dfba82] mt-0.5">{proj.spend30d}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#73788c]">Requests</div>
                      <div className="font-semibold text-white mt-0.5">{proj.requests30d}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#73788c]">API Keys</div>
                      <div className="font-semibold text-white mt-0.5">{proj.activeKeys}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}
