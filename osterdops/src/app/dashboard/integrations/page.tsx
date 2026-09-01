"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { Workflow, CheckCircle2, ShieldCheck, Lock, RefreshCw } from "lucide-react";
import { ManageIntegrationModal } from "@/components/settings/ManageIntegrationModal";
import { RbacGuard } from "@/components/auth/RbacGuard";

const INTEGRATIONS = [
  { id: "int_01", provider: "OpenAI", status: "CONNECTED", encryption: "AES-256-GCM", keyHint: "sk-proj-••••••••9412", lastChecked: "2 mins ago" },
  { id: "int_02", provider: "Anthropic", status: "CONNECTED", encryption: "AES-256-GCM", keyHint: "sk-ant-••••••••3311", lastChecked: "5 mins ago" },
  { id: "int_03", provider: "Google Gemini", status: "CONNECTED", encryption: "AES-256-GCM", keyHint: "AIza••••••••8819", lastChecked: "12 mins ago" },
  { id: "int_04", provider: "Azure OpenAI", status: "CONFIGURED", encryption: "AES-256-GCM", keyHint: "••••••••••••1029", lastChecked: "1 hour ago" },
];

export default function IntegrationsPage() {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#dfba82] tracking-wider uppercase mb-1">
                  <Workflow className="w-3.5 h-3.5" />
                  BYOK & Multi-Provider Credentials
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  AI Provider Integrations
                </h1>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INTEGRATIONS.map((int) => (
                <div key={int.id} className="p-5 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sm text-white">{int.provider}</div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                      <CheckCircle2 className="w-3 h-3" />
                      {int.status}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#111422] border border-[#1d2136] text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[#73788c]">Encryption:</span>
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                        <Lock className="w-3 h-3" />
                        {int.encryption}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#73788c]">Key Hint:</span>
                      <span className="font-mono text-[#dfba82] text-[11px]">{int.keyHint}</span>
                    </div>
                  </div>

                  <RbacGuard permission="integrations:manage">
                    <button
                      onClick={() => setSelectedProvider(int.provider)}
                      className="w-full py-2 rounded-lg bg-[#161928] hover:bg-[#202538] text-xs font-semibold text-white transition-colors cursor-pointer border border-[#24293d]"
                    >
                      Update Credential
                    </button>
                  </RbacGuard>
                </div>
              ))}
            </div>
          </div>
        </ContentTransition>
      </main>

      <ManageIntegrationModal
        isOpen={Boolean(selectedProvider)}
        onClose={() => setSelectedProvider(null)}
        integration={
          selectedProvider
            ? {
                id: "int_01",
                name: selectedProvider,
                provider: selectedProvider,
                badge: "Active",
                addedDate: "2026-08-01",
                totalSpend: "$89.20",
                status: "Connected",
              }
            : null
        }
        onUpdate={() => setSelectedProvider(null)}
        onDisconnect={() => setSelectedProvider(null)}
      />
    </div>
  );
}
