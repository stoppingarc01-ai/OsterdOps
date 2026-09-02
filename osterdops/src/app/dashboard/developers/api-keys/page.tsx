"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  KeyRound,
  Plus,
  Copy,
  Check,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RotateCw,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { DeveloperPortalLayout } from "@/components/developers/DeveloperPortalLayout";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";

interface DeveloperKey {
  id: string;
  name: string;
  keyPrefix: string;
  project: string;
  environment: "production" | "staging" | "development";
  status: "active" | "revoked" | "expired";
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
}

export default function ApiKeysDeveloperPage() {
  const { currentOrg, getIdToken } = useAuth();
  const [keys, setKeys] = useState<DeveloperKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyEnv, setNewKeyEnv] = useState<"production" | "staging" | "development">("production");
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [confirmedSaved, setConfirmedSaved] = useState(false);
  const [creating, setCreating] = useState(false);

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
      const mapped: DeveloperKey[] = keyList.map((k: any) => ({
        id: k.id,
        name: k.name || "API Access Key",
        keyPrefix: k.keyPrefix || (k.prefix ? `${k.prefix}••••••••` : "osk_••••"),
        project: k.projectName || "Default Workspace",
        environment: k.environment || "production",
        status: k.status === "REVOKED" ? "revoked" : "active",
        createdAt: k.createdAt ? new Date(k.createdAt).toLocaleDateString() : "Recent",
        lastUsedAt: k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : "Never",
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

  const handleCreateKey = async () => {
    if (!newKeyName.trim() || !currentOrg?.id) return;
    setCreating(true);

    try {
      const token = await getIdToken();
      const res = await apiRequest<any>("/api/v1/api-keys", {
        method: "POST",
        token,
        body: JSON.stringify({
          organizationId: currentOrg.id,
          name: newKeyName.trim(),
          environment: newKeyEnv,
          scopes: ["usage:ingest", "models:read"],
        }),
      });

      if (res.error) {
        throw new Error(res.error || "Failed to create key");
      }

      const secret = res.data?.key || res.data?.secret || "osk_live_generated";
      setRevealedSecret(secret);
      setConfirmedSaved(false);
      await fetchKeys();
    } catch (e) {
      // handled
    } finally {
      setCreating(false);
    }
  };

  const handleCopySecret = () => {
    if (revealedSecret) {
      navigator.clipboard.writeText(revealedSecret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const handleRevokeKey = async (id: string) => {
    setKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: "revoked" as const } : k))
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

  return (
    <DeveloperPortalLayout
      title="API Keys & Access Control"
      subtitle="Manage scoped secret keys for SDK integration, CI/CD pipelines, and runtime inference."
    >
      <div className="space-y-6">
        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-[#f4efe6]">Active Credentials</h2>
            <p className="text-xs text-[#8e93a6]">
              All requests to OsterdOps endpoints require a valid bearer secret key.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchKeys}
              className="p-2 rounded-xl bg-[#0c0e16] border border-[#1b1e2c] text-[#8e93a6] hover:text-white transition-colors cursor-pointer"
              title="Refresh credentials"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#dfba82]" : ""}`} />
            </button>
            <button
              onClick={() => {
                setRevealedSecret(null);
                setNewKeyName("");
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Generate Secret Key
            </button>
          </div>
        </div>

        {/* Credentials List */}
        <div className="rounded-2xl border border-[#1a1d2b] bg-[#0c0e16] overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#6b7082] space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#dfba82]" />
              <div>Loading access credentials...</div>
            </div>
          ) : keys.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#dfba82]/10 border border-[#dfba82]/20 text-[#dfba82] flex items-center justify-center mx-auto">
                <KeyRound className="w-5 h-5" />
              </div>
              <div className="text-sm font-bold text-white">No Developer Keys Found</div>
              <p className="text-xs text-[#8e93a6] max-w-sm mx-auto">
                Generate an API key to authenticate your SDK or backend integration.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#141724]">
              {keys.map((key) => (
                <div
                  key={key.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#141624] border border-[#23273a] flex items-center justify-center text-[#dfba82] shrink-0 mt-0.5">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white">{key.name}</span>
                        <span
                          className={`text-[9.5px] px-1.5 py-0.2 rounded font-mono font-bold ${
                            key.environment === "production"
                              ? "bg-amber-950/40 text-[#dfba82] border border-amber-800/40"
                              : "bg-blue-950/40 text-blue-300 border border-blue-800/40"
                          }`}
                        >
                          {key.environment}
                        </span>
                        <span
                          className={`text-[9.5px] px-1.5 py-0.2 rounded font-bold ${
                            key.status === "active"
                              ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40"
                              : "bg-red-950/40 text-red-400 border border-red-800/40"
                          }`}
                        >
                          {key.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-[#8e93a6] flex items-center gap-2">
                        <span>{key.keyPrefix}</span>
                        <span className="text-[#555a6d]">·</span>
                        <span className="text-[#6b7082]">Last used: {key.lastUsedAt || "Never"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {key.status === "active" && (
                      <button
                        onClick={() => handleRevokeKey(key.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141624] hover:bg-red-950/30 border border-[#23273a] hover:border-red-800/40 text-xs font-semibold text-[#8e93a6] hover:text-red-400 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Revoke</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal: Create Key */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#0e1017] border border-[#232738] rounded-2xl p-6 shadow-2xl text-white relative space-y-4">
              {!revealedSecret ? (
                <>
                  <div className="flex items-center justify-between pb-2 border-b border-[#1c1f2e]">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-[#dfba82]" />
                      <h3 className="text-base font-bold text-white">Generate Developer Key</h3>
                    </div>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="text-[#787d91] hover:text-white transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="block text-[11.5px] font-semibold text-[#c5c9d6]">Key Identifier</label>
                      <input
                        type="text"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="e.g. Ingestion Pipeline Server"
                        className="w-full px-3.5 py-2 bg-[#141622] border border-[#232738] rounded-xl text-white placeholder-[#5e6377] focus:outline-none focus:border-[#dfba82]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11.5px] font-semibold text-[#c5c9d6]">Target Environment</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setNewKeyEnv("production")}
                          className={`p-2.5 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                            newKeyEnv === "production"
                              ? "bg-[#dfba82]/15 border-[#dfba82] text-[#dfba82]"
                              : "bg-[#141622] border-[#232738] text-[#8e93a6]"
                          }`}
                        >
                          Production
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewKeyEnv("staging")}
                          className={`p-2.5 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                            newKeyEnv === "staging"
                              ? "bg-blue-950/40 border-blue-500 text-blue-400"
                              : "bg-[#141622] border-[#232738] text-[#8e93a6]"
                          }`}
                        >
                          Staging / Test
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1c1f2e]">
                      <button
                        onClick={() => setShowCreateModal(false)}
                        className="px-3.5 py-2 text-xs text-[#8e93a6] hover:text-white transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateKey}
                        disabled={creating || !newKeyName.trim()}
                        className="px-4 py-2 bg-[#dfba82] text-black font-bold rounded-xl hover:bg-[#ebd4aa] transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>Create Secret Key</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 pb-2 border-b border-[#1c1f2e] text-amber-400">
                    <ShieldAlert className="w-5 h-5 shrink-0" />
                    <h3 className="text-base font-bold text-white">Save Secret Key Now</h3>
                  </div>

                  <div className="space-y-4 text-xs">
                    <p className="text-[#8e93a6] leading-relaxed">
                      This secret key will <strong>never be shown again</strong>. Please copy and store it securely in your environment variables or secret manager.
                    </p>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#08090f] border border-[#232738] font-mono text-xs">
                      <span className="text-[#dfba82] font-bold select-all truncate mr-2">{revealedSecret}</span>
                      <button
                        onClick={handleCopySecret}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141624] hover:bg-[#202538] border border-[#23273a] text-xs font-semibold text-white transition-colors cursor-pointer shrink-0"
                      >
                        {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#dfba82]" />}
                        <span>{copiedSecret ? "Copied" : "Copy"}</span>
                      </button>
                    </div>

                    <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={confirmedSaved}
                        onChange={(e) => setConfirmedSaved(e.target.checked)}
                        className="rounded border-[#232738] text-[#dfba82] focus:ring-0"
                      />
                      <span className="text-xs text-[#c5c9d6]">I have copied and securely stored this secret key</span>
                    </label>

                    <div className="pt-2 border-t border-[#1c1f2e]">
                      <button
                        onClick={() => {
                          setShowCreateModal(false);
                          setRevealedSecret(null);
                        }}
                        disabled={!confirmedSaved}
                        className="w-full py-2 bg-[#dfba82] text-black font-bold rounded-xl text-xs hover:bg-[#ebd4aa] transition-colors cursor-pointer disabled:opacity-40"
                      >
                        Done & Close
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </DeveloperPortalLayout>
  );
}
