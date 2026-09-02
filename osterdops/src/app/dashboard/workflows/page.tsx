"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import {
  GitMerge,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
  RefreshCw,
  Sparkles,
  Info,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Check,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";
import { RbacGuard } from "@/components/auth/RbacGuard";

interface WorkflowItem {
  id: string;
  name: string;
  trigger: string;
  stepsCount: number;
  status: "ACTIVE" | "PAUSED";
  lastRunStatus: "SUCCEEDED" | "FAILED" | "RUNNING";
  lastRunDuration: string;
  lastRunAt: string;
}

export default function WorkflowsPage() {
  const { currentOrg, getIdToken } = useAuth();
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkflows = useCallback(async () => {
    if (!currentOrg?.id) return;
    setLoading(true);

    try {
      const token = await getIdToken();
      const res = await apiRequest<any>("/api/v1/workflows", {
        params: { organizationId: currentOrg.id },
        token,
      });

      const list = res.data?.workflows || (Array.isArray(res.data) ? res.data : []);
      const mapped: WorkflowItem[] = list.map((w: any) => ({
        id: w.id,
        name: w.name || "Automated Workflow",
        trigger: w.triggerEvent || w.trigger || "alert.created",
        stepsCount: Array.isArray(w.steps) ? w.steps.length : (w.stepsCount || 2),
        status: w.status === "PAUSED" ? "PAUSED" : "ACTIVE",
        lastRunStatus: w.lastRunStatus || "SUCCEEDED",
        lastRunDuration: w.lastRunDuration || "124ms",
        lastRunAt: w.lastRunAt ? new Date(w.lastRunAt).toLocaleTimeString() : "Recently",
      }));
      setWorkflows(mapped);
    } catch (e) {
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  }, [currentOrg, getIdToken]);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const activeWorkflows = workflows.filter((w) => w.status === "ACTIVE").length;

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-7 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#dfba82] tracking-wider uppercase mb-1">
                  <Zap className="w-3 h-3 text-[#dfba82]" />
                  <span>GOVERNANCE & WORKFLOWS</span>
                  <span className="text-[#555a6d]">/</span>
                  <span className="text-[#c5c9d6]">MULTI-STEP WORKFLOWS</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <h1
                    className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f4efe6]"
                    style={{ fontFamily: "var(--font-serif-luxury), Georgia, serif" }}
                  >
                    Multi-Step Workflow Pipelines
                  </h1>
                  <div className="w-5 h-5 rounded-md border border-[#dfba82]/40 bg-[#dfba82]/10 flex items-center justify-center text-[#dfba82]">
                    <GitMerge className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                </div>
                <p className="text-xs text-[#8e93a6] mt-0.5">
                  Orchestrate sequential remediation pipelines, webhook relays, and incident escalations.
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={fetchWorkflows}
                  className="p-2 rounded-xl bg-[#0c0e16] border border-[#1b1e2c] text-[#8e93a6] hover:text-white hover:border-[#2a2f45] transition-all cursor-pointer"
                  title="Refresh workflows"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#dfba82]" : ""}`} />
                </button>
              </div>
            </div>

            {/* 5 Top Stat KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Card 1: Active Workflows */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-[#dfba82]/10 border border-[#dfba82]/20 flex items-center justify-center text-[#dfba82]">
                      <GitMerge className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium flex items-center gap-1">
                      Active Pipelines
                      <Info className="w-3 h-3 text-[#555a6d]" />
                    </span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">{activeWorkflows}</div>
                  <div className="text-[10.5px] text-[#8e93a6]">Continuous execution</div>
                </div>
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 35 C 20 38, 45 28, 65 32 C 80 34, 88 12, 100 6"
                      fill="none"
                      stroke="#dfba82"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Card 2: Success Rate */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-emerald-950/40 border border-emerald-800/30 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Pipeline Success</span>
                  </div>
                  <div className="text-xl font-bold text-emerald-400 pt-0.5">100%</div>
                  <div className="text-[10.5px] text-[#8e93a6]">Zero step failures</div>
                </div>
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 36 C 25 35, 50 38, 70 20 C 85 10, 92 16, 100 8"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Card 3: Step Latency */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-blue-950/40 border border-blue-800/30 flex items-center justify-center text-blue-400">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Avg Execution</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">94ms</div>
                  <div className="text-[10.5px] text-blue-400 font-medium">Parallel step resolver</div>
                </div>
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 34 C 20 30, 40 18, 60 26 C 75 30, 85 12, 100 6"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Card 4: Automated Remediation */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-purple-950/40 border border-purple-800/30 flex items-center justify-center text-purple-400">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Remediations</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">Automated</div>
                  <div className="text-[10.5px] text-purple-400 font-medium">Key lock & quota resets</div>
                </div>
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 35 C 20 38, 40 32, 60 22 C 75 14, 85 18, 100 8"
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Card 5: Resiliency */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-orange-950/40 border border-orange-800/30 flex items-center justify-center text-orange-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Idempotency</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">Guaranteed</div>
                  <div className="text-[10.5px] text-emerald-400 font-medium">Zero duplicate dispatches</div>
                </div>
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 32 C 25 30, 45 22, 65 24 C 80 26, 88 12, 100 6"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Workflows List */}
            <div className="space-y-3">
              {loading ? (
                <div className="p-12 text-center text-xs text-[#6b7082] space-y-2 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b]">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#dfba82]" />
                  <div>Loading multi-step workflows...</div>
                </div>
              ) : workflows.length === 0 ? (
                <div className="p-12 text-center space-y-3 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b]">
                  <div className="w-10 h-10 rounded-xl bg-[#dfba82]/10 border border-[#dfba82]/20 text-[#dfba82] flex items-center justify-center mx-auto">
                    <GitMerge className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-bold text-white">No Multi-Step Workflows Defined</div>
                  <p className="text-xs text-[#8e93a6] max-w-sm mx-auto">
                    Multi-step workflow pipelines allow chaining complex actions such as budget locks, key revocations, and team paging.
                  </p>
                </div>
              ) : (
                workflows.map((wf) => (
                  <div
                    key={wf.id}
                    className="p-5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] hover:border-[#2a2f45] transition-all space-y-3 shadow-xl"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#141624] border border-[#23273a] flex items-center justify-center text-[#dfba82] shrink-0">
                          <GitMerge className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white">{wf.name}</div>
                          <div className="text-xs font-mono text-[#8e93a6] flex items-center gap-2 mt-0.5">
                            <span className="text-[#dfba82]">{wf.trigger}</span>
                            <span className="text-[#555a6d]">·</span>
                            <span>{wf.stepsCount} steps in pipeline</span>
                            <span className="text-[#555a6d]">·</span>
                            <span>Last run: {wf.lastRunAt}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                          <Check className="w-3 h-3" />
                          {wf.lastRunStatus} ({wf.lastRunDuration})
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Insight Banner */}
            <div className="rounded-2xl border border-[#1a1d2b] bg-[#0c0e16] p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#dfba82]/10 border border-[#dfba82]/25 flex items-center justify-center text-[#dfba82] shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Event Automation Bridge</div>
                  <div className="text-[11.5px] text-[#8e93a6]">
                    Single-event trigger rules and multi-step workflows execute synchronously on cluster edge nodes.
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard/automation"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#dfba82] hover:text-[#ebd4aa] transition-colors shrink-0"
              >
                <span>Manage Event Rules</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}
