"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { KeyRound, Plus, Copy, Check, RefreshCw, Trash2, ShieldAlert, CheckCircle2 } from "lucide-react";
import { RbacGuard } from "@/components/auth/RbacGuard";

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  projectName: string;
  environment: string;
  lastUsed: string;
  createdAt: string;
  status: "ACTIVE" | "REVOKED";
}

const SAMPLE_KEYS: ApiKeyItem[] = [
  { id: "key_01", name: "Production Agent Key", keyPrefix: "ost_live_••••••••••••94f2", projectName: "Customer Support Agent", environment: "production", lastUsed: "12 mins ago", createdAt: "2026-08-01", status: "ACTIVE" },
  { id: "key_02", name: "CI Pipeline Test Key", keyPrefix: "ost_test_••••••••••••33a1", projectName: "Code Intelligence Assistant", environment: "staging", lastUsed: "2 hours ago", createdAt: "2026-08-15", status: "ACTIVE" },
];

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>(SAMPLE_KEYS);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateKey = () => {
    // Generate fresh one-time client secret
    const rawSecret = `ost_live_${Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
    const suffix = rawSecret.slice(-4);
    const newKeyItem: ApiKeyItem = {
      id: `key_${Date.now()}`,
      name: "New Workspace Key",
      keyPrefix: `ost_live_••••••••••••${suffix}`,
      projectName: "Customer Support Agent",
      environment: "production",
      lastUsed: "Never",
      createdAt: "Just now",
      status: "ACTIVE",
    };

    setKeys((prev) => [newKeyItem, ...prev]);
    setNewSecret(rawSecret);
    setCopied(false);
  };

  const handleCopy = () => {
    if (newSecret) {
      navigator.clipboard.writeText(newSecret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRevoke = (id: string) => {
    setKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: "REVOKED" } : k))
    );
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#dfba82] tracking-wider uppercase mb-1">
                  <KeyRound className="w-3.5 h-3.5" />
                  Gateway Access
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  Project API Keys
                </h1>
              </div>

              <RbacGuard permission="keys:manage">
                <button
                  onClick={handleCreateKey}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#dfba82] text-black text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-[0_0_15px_rgba(223,186,130,0.2)]"
                >
                  <Plus className="w-4 h-4" />
                  Generate New API Key
                </button>
              </RbacGuard>
            </div>

            {/* One-Time Secret Banner */}
            {newSecret && (
              <div className="p-5 rounded-xl bg-amber-950/20 border border-amber-600/40 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4" />
                  Secret API Key Generated — Store Immediately
                </div>
                <p className="text-xs text-amber-200/80">
                  This key will <strong>never be shown again</strong>. If you lose this key, you must rotate or generate a replacement.
                </p>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#0c0e17] border border-[#24293d] font-mono text-xs">
                  <span className="text-[#dfba82] select-all truncate mr-2">{newSecret}</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#161928] hover:bg-[#202538] text-xs font-semibold text-white transition-colors cursor-pointer shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#dfba82]" />}
                    {copied ? "Copied" : "Copy Secret"}
                  </button>
                </div>
              </div>
            )}

            {/* Keys Table */}
            <div className="rounded-xl border border-[#1b1e2c] bg-[#0c0e17] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#111422] text-[#8e93a6] border-b border-[#1b1e2c]">
                    <tr>
                      <th className="p-3.5 font-semibold">Key Name</th>
                      <th className="p-3.5 font-semibold">Key Mask</th>
                      <th className="p-3.5 font-semibold">Project</th>
                      <th className="p-3.5 font-semibold">Last Used</th>
                      <th className="p-3.5 font-semibold">Status</th>
                      <th className="p-3.5 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#161928]">
                    {keys.map((k) => (
                      <tr key={k.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3.5 font-semibold text-white">{k.name}</td>
                        <td className="p-3.5 font-mono text-[#dfba82]">{k.keyPrefix}</td>
                        <td className="p-3.5 text-[#c5c9d6]">{k.projectName}</td>
                        <td className="p-3.5 text-[#8e93a6]">{k.lastUsed}</td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              k.status === "ACTIVE"
                                ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                                : "bg-red-950/60 text-red-400 border border-red-800/40"
                            }`}
                          >
                            {k.status === "ACTIVE" ? <CheckCircle2 className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                            {k.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <RbacGuard permission="keys:manage">
                            {k.status === "ACTIVE" && (
                              <button
                                onClick={() => handleRevoke(k.id)}
                                title="Revoke API key"
                                className="p-1 text-[#8e93a6] hover:text-red-400 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </RbacGuard>
                        </td>
                      </tr>
                    ))}
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
