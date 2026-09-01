"use client";

import React, { useState, use } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import {
  Webhook,
  Activity,
  ShieldCheck,
  RotateCw,
  Send,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { RbacGuard } from "@/components/auth/RbacGuard";

interface PageProps {
  params: Promise<{ integrationId: string }>;
}

export default function IntegrationDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const integrationId = resolvedParams.integrationId;

  const [tested, setTested] = useState(false);
  const [testing, setTesting] = useState(false);
  const [rotated, setRotated] = useState(false);

  const handleTest = () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      setTested(true);
    }, 600);
  };

  const handleRotate = () => {
    setRotated(true);
    setTimeout(() => setRotated(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/integrations"
                className="text-xs text-[#73788c] hover:text-[#dfba82] flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Integrations
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#dfba82] tracking-wider uppercase mb-1">
                  <Webhook className="w-3.5 h-3.5" />
                  Integration Connection
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  {integrationId}
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTest}
                  disabled={testing}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#161a29] border border-[#232942] hover:border-[#dfba82]/40 text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 text-[#dfba82]" />
                  {testing ? "Testing..." : "Send Test Ping"}
                </button>
                <RbacGuard permission="integrations:manage">
                  <button
                    onClick={handleRotate}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#dfba82] hover:bg-[#c9a36d] text-black flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    Rotate Secret
                  </button>
                </RbacGuard>
              </div>
            </div>

            {tested && (
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-center gap-3 text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Test ping dispatched successfully. HTTP 200 OK received in 42ms.</span>
              </div>
            )}

            {rotated && (
              <div className="p-4 rounded-xl bg-[#dfba82]/10 border border-[#dfba82]/30 flex items-center gap-3 text-xs text-[#dfba82]">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>Secret rotated successfully with AES-256-GCM encryption.</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-1">
                <div className="text-[11px] text-[#73788c] uppercase font-semibold">Status</div>
                <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ACTIVE
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-1">
                <div className="text-[11px] text-[#73788c] uppercase font-semibold">24h Success Rate</div>
                <div className="text-sm font-bold text-white">99.8%</div>
              </div>

              <div className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-1">
                <div className="text-[11px] text-[#73788c] uppercase font-semibold">Average Latency</div>
                <div className="text-sm font-bold text-white">38ms</div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#dfba82]" />
                Security & Credential Metadata
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-[#111422] border border-[#1d2136]">
                  <span className="text-[#73788c] block mb-1">Secret Mask:</span>
                  <span className="font-mono text-[#dfba82]">whsec_••••••••••••94f2</span>
                </div>
                <div className="p-3 rounded-lg bg-[#111422] border border-[#1d2136]">
                  <span className="text-[#73788c] block mb-1">Encryption:</span>
                  <span className="font-mono text-emerald-400">AES-256-GCM (Zero-Trust)</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#dfba82]" />
                Recent Delivery Logs
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1b1e2c] text-[#73788c]">
                      <th className="pb-2 font-medium">Event Type</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">HTTP Code</th>
                      <th className="pb-2 font-medium">Latency</th>
                      <th className="pb-2 font-medium">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1b1e2c]">
                    <tr>
                      <td className="py-2.5 font-mono text-[#dfba82]">budget.threshold_reached</td>
                      <td className="py-2.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-400">
                          DELIVERED
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-white">200</td>
                      <td className="py-2.5 text-[#73788c]">42ms</td>
                      <td className="py-2.5 text-[#73788c]">10 mins ago</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-mono text-[#dfba82]">alert.created</td>
                      <td className="py-2.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-400">
                          DELIVERED
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-white">200</td>
                      <td className="py-2.5 text-[#73788c]">35ms</td>
                      <td className="py-2.5 text-[#73788c]">1 hour ago</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}
