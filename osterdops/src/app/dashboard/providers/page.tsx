"use client";

import React from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { Boxes, CheckCircle2, ShieldAlert, Zap, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const PROVIDERS = [
  { name: "OpenAI", status: "HEALTHY", requests: "11,200", spend: "$89.20", errorRate: "0.08%", models: ["gpt-4o", "gpt-4o-mini", "o1-preview", "text-embedding-3-small"] },
  { name: "Anthropic", status: "HEALTHY", requests: "5,100", spend: "$41.50", errorRate: "0.14%", models: ["claude-3-5-sonnet", "claude-3-haiku", "claude-3-opus"] },
  { name: "Google Gemini", status: "HEALTHY", requests: "2,120", spend: "$12.15", errorRate: "0.05%", models: ["gemini-1.5-pro", "gemini-1.5-flash", "text-embedding-004"] },
  { name: "Azure OpenAI", status: "CONFIGURED", requests: "0", spend: "$0.00", errorRate: "0.00%", models: ["azure/gpt-4o"] },
  { name: "Amazon Bedrock", status: "CONFIGURED", requests: "0", spend: "$0.00", errorRate: "0.00%", models: ["bedrock/claude-3-5-sonnet"] },
];

export default function ProvidersPage() {
  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#dfba82] tracking-wider uppercase mb-1">
                  <Boxes className="w-3.5 h-3.5" />
                  AI Infrastructure
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  Connected AI Providers
                </h1>
              </div>

              <Link
                href="/dashboard/integrations"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#dfba82] text-black text-xs font-semibold hover:opacity-90 transition-all"
              >
                Manage Integrations
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PROVIDERS.map((p) => (
                <div key={p.name} className="p-5 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sm text-[#f4efe6]">{p.name}</div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                      <CheckCircle2 className="w-3 h-3" />
                      {p.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#161928] text-xs">
                    <div>
                      <div className="text-[10px] text-[#73788c]">Requests</div>
                      <div className="font-semibold text-white mt-0.5">{p.requests}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#73788c]">Spend (30d)</div>
                      <div className="font-bold text-[#dfba82] mt-0.5">{p.spend}</div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="text-[10px] text-[#73788c] mb-1.5">Supported Models</div>
                    <div className="flex flex-wrap gap-1">
                      {p.models.map((m) => (
                        <span key={m} className="px-2 py-0.5 rounded-md bg-[#161928] text-[10px] font-mono text-[#c5c9d6]">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}
