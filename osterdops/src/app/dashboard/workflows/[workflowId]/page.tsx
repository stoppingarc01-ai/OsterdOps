"use client";

import React, { useState, use } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { GitMerge, ArrowLeft, Play, CheckCircle2, ShieldCheck, Clock, Layers } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ workflowId: string }>;
}

export default function WorkflowDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const workflowId = resolvedParams.workflowId;

  const [executed, setExecuted] = useState(false);
  const [executing, setExecuting] = useState(false);

  const handleExecute = () => {
    setExecuting(true);
    setTimeout(() => {
      setExecuting(false);
      setExecuted(true);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6 max-w-4xl">
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/workflows"
                className="text-xs text-[#73788c] hover:text-[#dfba82] flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Workflows
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#dfba82] tracking-wider uppercase mb-1">
                  <GitMerge className="w-3.5 h-3.5" />
                  Workflow Execution Pipeline
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  {workflowId}
                </h1>
              </div>

              <button
                onClick={handleExecute}
                disabled={executing}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#dfba82] hover:bg-[#c9a36d] text-black flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                {executing ? "Executing Flow..." : "Trigger Dry-Run Execution"}
              </button>
            </div>

            {executed && (
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-center gap-3 text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Workflow execution SUCCEEDED. All 3 steps executed in 112ms total.</span>
              </div>
            )}

            <div className="p-5 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#dfba82]" />
                Step-by-Step Flow Pipeline
              </h2>

              <div className="space-y-3">
                <div className="p-3.5 rounded-lg bg-[#111422] border border-[#1d2136] flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-white">Step 1: Check Spend Pre-condition</div>
                    <div className="text-[#73788c] font-mono">IF data.currentSpend &gt; 1000</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-400">
                    SUCCEEDED (12ms)
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-[#111422] border border-[#1d2136] flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-white">Step 2: Dispatch Incident Notification to Slack</div>
                    <div className="text-[#73788c] font-mono">ACTION: SEND_NOTIFICATION (#security-ops)</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-400">
                    SUCCEEDED (48ms)
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-[#111422] border border-[#1d2136] flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-white">Step 3: Trigger Webhook Guardrail</div>
                    <div className="text-[#73788c] font-mono">ACTION: TRIGGER_INTEGRATION (Generic Webhook)</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-400">
                    SUCCEEDED (52ms)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}
