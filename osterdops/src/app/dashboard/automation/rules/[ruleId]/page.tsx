"use client";

import React, { useState, use } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { Zap, ArrowLeft, Play, CheckCircle2, Trash2, Edit3, Clock } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ ruleId: string }>;
}

export default function RuleDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const ruleId = resolvedParams.ruleId;

  const [tested, setTested] = useState(false);
  const [testing, setTesting] = useState(false);

  const handleDryRun = () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      setTested(true);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6 max-w-4xl">
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/automation"
                className="text-xs text-[#73788c] hover:text-[#dfba82] flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Automation
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#dfba82] tracking-wider uppercase mb-1">
                  <Zap className="w-3.5 h-3.5" />
                  Rule Specification
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  {ruleId}
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDryRun}
                  disabled={testing}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#161a29] border border-[#232942] hover:border-[#dfba82]/40 text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 text-[#dfba82]" />
                  {testing ? "Evaluating..." : "Dry-Run Test"}
                </button>
              </div>
            </div>

            {tested && (
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-center gap-3 text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Dry-Run Completed: 1 condition matched. Would execute 1 action successfully.</span>
              </div>
            )}

            <div className="p-5 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-4">
              <h2 className="text-sm font-bold text-white">Rule Logic Flow</h2>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-[#111422] border border-[#1d2136]">
                  <span className="text-[#73788c] block mb-1">Trigger (WHEN):</span>
                  <span className="font-mono text-[#dfba82]">budget.threshold_reached</span>
                </div>
                <div className="p-3 rounded-lg bg-[#111422] border border-[#1d2136]">
                  <span className="text-[#73788c] block mb-1">Conditions (IF):</span>
                  <span className="font-mono text-white">data.thresholdPercent &gt;= 80</span>
                </div>
                <div className="p-3 rounded-lg bg-[#111422] border border-[#1d2136]">
                  <span className="text-[#73788c] block mb-1">Action (THEN):</span>
                  <span className="font-mono text-emerald-400">SEND_NOTIFICATION (Slack Dispatcher)</span>
                </div>
              </div>
            </div>
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}
