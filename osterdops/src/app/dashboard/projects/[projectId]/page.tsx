"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { FolderKanban, ArrowLeft, KeyRound, LineChart, Layers, Settings } from "lucide-react";
import Link from "next/link";
import { RbacGuard } from "@/components/auth/RbacGuard";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = (params?.projectId as string) || "proj_01";
  const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "keys" | "usage" | "settings">("overview");

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6">
            <Link
              href="/dashboard/projects"
              className="inline-flex items-center gap-1.5 text-xs text-[#8e93a6] hover:text-[#dfba82] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Projects
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#dfba82] tracking-wider uppercase mb-1">
                  {projectId}
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  Customer Support Agent
                </h1>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-[#1b1e2c] pb-2 text-xs">
              {[
                { id: "overview", label: "Overview", icon: FolderKanban },
                { id: "analytics", label: "Analytics", icon: LineChart },
                { id: "keys", label: "API Keys", icon: KeyRound },
                { id: "usage", label: "Usage", icon: Layers },
                { id: "settings", label: "Settings", icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-[#dfba82] text-black font-bold shadow-[0_0_12px_rgba(223,186,130,0.2)]"
                        : "text-[#8e93a6] hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c]">
                  <div className="text-xs text-[#8e93a6] mb-1">30d Project Spend</div>
                  <div className="text-2xl font-bold text-[#dfba82]">$74.20</div>
                  <div className="text-[11px] text-[#73788c] mt-2">Budget Cap: $100.00</div>
                </div>
                <div className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c]">
                  <div className="text-xs text-[#8e93a6] mb-1">30d Request Volume</div>
                  <div className="text-2xl font-bold text-[#f4efe6]">9,420</div>
                  <div className="text-[11px] text-emerald-400 mt-2">99.9% Success Rate</div>
                </div>
                <div className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c]">
                  <div className="text-xs text-[#8e93a6] mb-1">Active Credentials</div>
                  <div className="text-2xl font-bold text-[#f4efe6]">2 Keys</div>
                  <div className="text-[11px] text-[#73788c] mt-2">Environment: Production</div>
                </div>
              </div>
            )}

            {activeTab === "keys" && (
              <div className="p-6 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-[#f4efe6]">Project API Credentials</div>
                  <Link
                    href="/dashboard/api-keys"
                    className="px-3 py-1.5 rounded-lg bg-[#dfba82] text-black text-xs font-bold hover:opacity-90 transition-all"
                  >
                    Manage Keys
                  </Link>
                </div>
                <div className="text-xs text-[#8e93a6]">
                  Keys assigned to this project have strict tenancy isolation and scoped spending caps.
                </div>
              </div>
            )}
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}
