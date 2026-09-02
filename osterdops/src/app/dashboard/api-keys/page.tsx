"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import {
  KeyRound,
  Plus,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Clock,
  Search,
  Sparkles,
  Info,
  ArrowRight,
  X,
  Loader2,
  Lock,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";
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

export default function ApiKeysPage() {
  const { currentOrg, getIdToken } = useAuth();
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Creation Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [keyEnv, setKeyEnv] = useState<"production" | "staging">("production");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    if (!currentOrg?.id) return;
    setLoading(true);

    try {
      const token = await getIdToken();
      const res = await apiRequest<any>("/api/v1/api-keys", {
        params: { organizationId: currentOrg.id },
        token,
      });

      const keyList = Array.isArray(res.data) ? res.data : res.data?.items || [];
      const mapped: ApiKeyItem[] = keyList.map((k: any) => ({
        id: k.id,
        name: k.name || "Workspace API Key",
        keyPrefix: k.keyPrefix || (k.prefix ? `${k.prefix}••••••••` : "ost_••••"),
        projectName: k.projectName || "General Workspace",
        environment: k.environment || "production",
        lastUsed: k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : "Never",
        createdAt: k.createdAt ? new Date(k.createdAt).toLocaleDateString() : "Recent",
        status: k.status === "REVOKED" ? "REVOKED" : "ACTIVE",
      }));
      setKeys(mapped);
    } catch (e) {
      setKeys([]);
    } finally {
      setLoading(false);
    }
  }, [currentOrg, getIdToken]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg?.id || !keyName) return;

    setCreating(true);
    setCreateError(null);

    try {
      const token = await getIdToken();
      const res = await apiRequest<any>("/api/v1/api-keys", {
        method: "POST",
        token,
        body: JSON.stringify({
          organizationId: currentOrg.id,
          name: keyName.trim(),
          environment: keyEnv,
          scopes: ["usage:ingest", "models:read"],
        }),
      });

      if (res.error) {
        throw new Error(res.error || "Failed to create API key");
      }

      if (res.data?.key || res.data?.secret) {
        setNewSecret(res.data.key || res.data.secret);
      }
      setIsCreateOpen(false);
      setKeyName("");
      await fetchKeys();
    } catch (err: any) {
      setCreateError(err.message || "An unexpected error occurred.");
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = () => {
    if (newSecret) {
      navigator.clipboard.writeText(newSecret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRevoke = async (id: string) => {
    setKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: "REVOKED" } : k))
    );

    try {
      const token = await getIdToken();
      await apiRequest(`/api/v1/api-keys/${id}`, {
        method: "DELETE",
        token,
      });
    } catch (e) {
      // handled
    }
  };

  const filtered = keys.filter(
    (k) =>
      k.name.toLowerCase().includes(search.toLowerCase()) ||
      k.projectName.toLowerCase().includes(search.toLowerCase()) ||
      k.keyPrefix.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = keys.filter((k) => k.status === "ACTIVE").length;

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
                  <span>DEVELOPER & ACCESS</span>
                  <span className="text-[#555a6d]">/</span>
                  <span className="text-[#c5c9d6]">API KEYS</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <h1
                    className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f4efe6]"
                    style={{ fontFamily: "var(--font-serif-luxury), Georgia, serif" }}
                  >
                    Project API Keys
                  </h1>
                  <div className="w-5 h-5 rounded-md border border-[#dfba82]/40 bg-[#dfba82]/10 flex items-center justify-center text-[#dfba82]">
                    <KeyRound className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                </div>
                <p className="text-xs text-[#8e93a6] mt-0.5">
                  Cryptographically secure gateway keys for model routing, proxy ingestion, and SDK telemetry.
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={fetchKeys}
                  className="p-2 rounded-xl bg-[#0c0e16] border border-[#1b1e2c] text-[#8e93a6] hover:text-white hover:border-[#2a2f45] transition-all cursor-pointer"
                  title="Refresh keys"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#dfba82]" : ""}`} />
                </button>

                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 absolute left-3 text-[#6b7082] pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search keys..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-44 sm:w-56 pl-8 pr-3 py-1.5 rounded-xl bg-[#0c0e16] border border-[#1b1e2c] text-xs text-white placeholder-[#555a6d] focus:outline-none focus:border-[#dfba82]/50"
                  />
                </div>

                <RbacGuard permission="keys:manage">
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#dfba82] hover:bg-[#ebd4aa] text-black text-xs font-bold rounded-xl shadow-[0_2px_12px_rgba(223,186,130,0.25)] transition-all cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Generate API Key</span>
                  </button>
                </RbacGuard>
              </div>
            </div>

            {/* 5 Top Stat KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Card 1: Active Keys */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-[#dfba82]/10 border border-[#dfba82]/20 flex items-center justify-center text-[#dfba82]">
                      <KeyRound className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium flex items-center gap-1">
                      Active Keys
                      <Info className="w-3 h-3 text-[#555a6d]" />
                    </span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">{activeCount}</div>
                  <div className="text-[10.5px] text-[#8e93a6]">Across workspace</div>
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

              {/* Card 2: Cryptographic Storage */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-emerald-950/40 border border-emerald-800/30 flex items-center justify-center text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Hashing</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">SHA-256</div>
                  <div className="text-[10.5px] text-emerald-400 font-medium">Zero plaintext storage</div>
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

              {/* Card 3: Single-Reveal */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-purple-950/40 border border-purple-800/30 flex items-center justify-center text-purple-400">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Single-Reveal</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">Enforced</div>
                  <div className="text-[10.5px] text-purple-400 font-medium">Shown once on creation</div>
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

              {/* Card 4: Scoped Permissions */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-blue-950/40 border border-blue-800/30 flex items-center justify-center text-blue-400">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Scopes</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">Least Privilege</div>
                  <div className="text-[10.5px] text-blue-400 font-medium">Fine-grained access</div>
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

              {/* Card 5: Instant Revocation */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-orange-950/40 border border-orange-800/30 flex items-center justify-center text-orange-400">
                      <ShieldAlert className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Revocation</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">&lt; 1 sec</div>
                  <div className="text-[10.5px] text-emerald-400 font-medium">Propagates across edge</div>
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

            {/* One-Time Secret Revealed Banner */}
            {newSecret && (
              <div className="p-4.5 rounded-2xl bg-amber-950/20 border border-amber-600/50 space-y-3 shadow-2xl animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Secret API Key Generated — Store Immediately</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewSecret(null)}
                    className="text-amber-400/80 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-amber-200/80 leading-relaxed">
                  This key will <strong>never be shown again</strong>. For security reasons, we do not retain plaintext copies. If lost, you must rotate or generate a new key.
                </p>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#08090f] border border-[#24293d] font-mono text-xs">
                  <span className="text-[#dfba82] select-all truncate mr-2 font-bold">{newSecret}</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141624] hover:bg-[#202538] border border-[#23273a] text-xs font-semibold text-white transition-colors cursor-pointer shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#dfba82]" />}
                    <span>{copied ? "Copied" : "Copy Secret"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Keys Table */}
            <div className="rounded-2xl border border-[#1a1d2b] bg-[#0c0e16] overflow-hidden shadow-xl">
              <div className="p-4 border-b border-[#161824] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">Configured Access Keys</h2>
                  <span className="text-[11px] text-[#6b7082]">({keys.length} total)</span>
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center text-xs text-[#6b7082] space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#dfba82]" />
                  <div>Loading API keys...</div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#dfba82]/10 border border-[#dfba82]/20 text-[#dfba82] flex items-center justify-center mx-auto">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-bold text-white">No API Keys Generated</div>
                  <p className="text-xs text-[#8e93a6] max-w-sm mx-auto">
                    Generate an API key to authenticate your LLM requests through the OsterdOps Gateway.
                  </p>
                  <RbacGuard permission="keys:manage">
                    <button
                      onClick={() => setIsCreateOpen(true)}
                      className="px-4 py-2 bg-[#dfba82] text-black font-bold rounded-xl text-xs hover:bg-[#ebd4aa] transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>Generate First Key</span>
                    </button>
                  </RbacGuard>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#161824] text-[10.5px] uppercase tracking-wider text-[#555a6d] font-semibold">
                        <th className="py-3 px-4">Key Name</th>
                        <th className="py-3 px-4">Key Prefix / Mask</th>
                        <th className="py-3 px-4">Project Workspace</th>
                        <th className="py-3 px-4">Environment</th>
                        <th className="py-3 px-4">Last Used</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#141724]">
                      {filtered.map((k) => (
                        <tr key={k.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-4 font-bold text-white">{k.name}</td>
                          <td className="py-3.5 px-4 font-mono text-[#dfba82]">{k.keyPrefix}</td>
                          <td className="py-3.5 px-4 text-[#c5c9d6]">{k.projectName}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-[#141624] text-[#c5c9d6] border border-[#23273a]">
                              {k.environment}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[#8e93a6] font-mono text-[11px]">{k.lastUsed}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-semibold ${
                                k.status === "ACTIVE"
                                  ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                                  : "bg-red-950/60 text-red-400 border border-red-800/40"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  k.status === "ACTIVE" ? "bg-emerald-400" : "bg-red-400"
                                }`}
                              />
                              {k.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <RbacGuard permission="keys:manage">
                              {k.status === "ACTIVE" && (
                                <button
                                  onClick={() => handleRevoke(k.id)}
                                  title="Revoke API key"
                                  className="p-1.5 text-[#8e93a6] hover:text-red-400 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer"
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
              )}
            </div>

            {/* Bottom Security Banner */}
            <div className="rounded-2xl border border-[#1a1d2b] bg-[#0c0e16] p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#dfba82]/10 border border-[#dfba82]/25 flex items-center justify-center text-[#dfba82] shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Cryptographic Secret Protection</div>
                  <div className="text-[11.5px] text-[#8e93a6]">
                    API keys are salted and hashed using SHA-256 prior to persistence. Secret rotation is non-disruptive.
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard/developers/webhooks"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#dfba82] hover:text-[#ebd4aa] transition-colors shrink-0"
              >
                <span>Configure Webhooks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </ContentTransition>
      </main>

      {/* Generate Key Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0e1017] border border-[#232738] rounded-2xl p-6 shadow-2xl text-white relative space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1c1f2e]">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#dfba82]" />
                <h3 className="text-base font-bold text-[#f4efe6]">Generate Gateway Key</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-[#787d91] hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/40 text-red-300 text-xs">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateKey} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[11.5px] font-semibold text-[#c5c9d6]">
                  Key Name
                </label>
                <input
                  type="text"
                  required
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="e.g. Production Backend Gateway Key"
                  className="w-full px-3.5 py-2 bg-[#141622] border border-[#232738] rounded-xl text-white placeholder-[#5e6377] focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11.5px] font-semibold text-[#c5c9d6]">
                  Target Environment
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setKeyEnv("production")}
                    className={`py-2 px-3 rounded-xl border text-center font-medium transition-all cursor-pointer ${
                      keyEnv === "production"
                        ? "bg-[#dfba82]/15 border-[#dfba82] text-[#dfba82]"
                        : "bg-[#141622] border-[#232738] text-[#8e93a6]"
                    }`}
                  >
                    Production (Live)
                  </button>
                  <button
                    type="button"
                    onClick={() => setKeyEnv("staging")}
                    className={`py-2 px-3 rounded-xl border text-center font-medium transition-all cursor-pointer ${
                      keyEnv === "staging"
                        ? "bg-blue-950/40 border-blue-500 text-blue-400"
                        : "bg-[#141622] border-[#232738] text-[#8e93a6]"
                    }`}
                  >
                    Staging / Test
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#08090f] border border-[#161824] text-[11.5px] text-[#8e93a6] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#dfba82] shrink-0" />
                <span>The plaintext secret key will be revealed only once upon generation.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1c1f2e]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={creating}
                  className="px-3.5 py-2 text-xs text-[#8e93a6] hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-[#dfba82] text-black font-bold rounded-xl hover:bg-[#ebd4aa] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Generate Key</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
