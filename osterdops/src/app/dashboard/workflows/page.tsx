"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { GitMerge, Plus, Play, CheckCircle2, AlertTriangle, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { RbacGuard } from "@/components/auth/RbacGuard";

const SAMPLE_WORKFLOWS = [
  {
    id: "wf_01",
    name: "Critical Incident Escalation Flow",
    trigger: "alert.created",
    stepsCount: 3,
    status: "ACTIVE",
    lastRunStatus: "SUCCEEDED",
    lastRunDuration: "142ms",
    lastRunAt: "10 mins ago",
  },
  {
    id: "wf_02",
    name: "Hard Budget Lock & Key Rotation",
    trigger: "budget.exceeded",
    stepsCount: 2,
    status: "ACTIVE",
    lastRunStatus: "SUCCEEDED",
    lastRunDuration: "85ms",
    lastRunAt: "2 days ago",
  },
];

export default function WorkflowsPage() {
  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#dfba82] tracking-wider uppercase mb-1">
                  <GitMerge className="w-3.5 h-3.5" />
                  Multi-Step Workflow Engine
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  Workflows
                </h1>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-1">
                <div className="text-[11px] text-[#73788c] uppercase font-semibold">Total Workflows</div>
                <div className="text-xl font-bold text-white">{SAMPLE_WORKFLOWS.length}</div>
              </div>

              <div className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-1">
                <div className="text-[11px] text-[#73788c] uppercase font-semibold">Success Rate</div>
                <div className="text-xl font-bold text-emerald-400">100%</div>
              </div>

              <div className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-1">
                <div className="text-[11px] text-[#73788c] uppercase font-semibold">Avg Step Duration</div>
                <div className="text-xl font-bold text-white">45ms</div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-4">
              <h2 className="text-sm font-bold text-white">Configured Workflows</h2>

              <div className="space-y-3">
                {SAMPLE_WORKFLOWS.map((wf) => (
                  <div
                    key={wf.id}
                    className="p-4 rounded-lg bg-[#111422] border border-[#1d2136] flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/workflows/${wf.id}`}
                          className="font-bold text-sm text-white hover:text-[#dfba82] transition-colors"
                        >
                          {wf.name}
                        </Link>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#161a29] border border-[#232942] text-[#dfba82]">
                          TRIGGER: {wf.trigger}
                        </span>
                      </div>
                      <div className="text-xs text-[#73788c] flex items-center gap-2">
                        <span>{wf.stepsCount} sequential steps</span>
                        <span>•</span>
                        <span>Last run: <strong className="text-emerald-400 font-mono">{wf.lastRunStatus}</strong> ({wf.lastRunDuration})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/dashboard/workflows/${wf.id}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#161a29] border border-[#232942] hover:border-[#dfba82]/40 text-white flex items-center gap-1.5 transition-colors"
                      >
                        Inspect Flow
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}
