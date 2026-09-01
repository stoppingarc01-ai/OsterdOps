"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { DeveloperPortalLayout } from "@/components/developers/DeveloperPortalLayout";

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

const INITIAL_KEYS: DeveloperKey[] = [
  {
    id: "key_994a1",
    name: "Production Backend Ingestion",
    keyPrefix: "osk_live_••••94f2",
    project: "production-backend",
    environment: "production",
    status: "active",
    createdAt: "2026-08-20",
    lastUsedAt: "2 minutes ago",
  },
  {
    id: "key_882b4",
    name: "Staging Pipeline",
    keyPrefix: "osk_test_••••3b11",
    project: "staging-cluster",
    environment: "staging",
    status: "active",
    createdAt: "2026-08-22",
    lastUsedAt: "1 hour ago",
  },
];

export default function ApiKeysDeveloperPage() {
  const [keys, setKeys] = useState<DeveloperKey[]>(INITIAL_KEYS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyEnv, setNewKeyEnv] = useState<"production" | "staging" | "development">("production");
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [confirmedSaved, setConfirmedSaved] = useState(false);

  const handleCreateKey = () => {
    if (!newKeyName.trim()) return;

    const keySuffix = Math.random().toString(36).slice(2, 6);
    const mockSecret = `osk_${newKeyEnv === "production" ? "live" : "test"}_${Math.random()
      .toString(36)
      .slice(2, 10)}${Math.random().toString(36).slice(2, 10)}${keySuffix}`;

    const newKey: DeveloperKey = {
      id: `key_${Date.now()}`,
      name: newKeyName.trim(),
      keyPrefix: `osk_${newKeyEnv === "production" ? "live" : "test"}_••••${keySuffix}`,
      project: "production-backend",
      environment: newKeyEnv,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
      lastUsedAt: "Just now",
    };

    setKeys([newKey, ...keys]);
    setRevealedSecret(mockSecret);
  };

  const handleCopySecret = async () => {
    if (!revealedSecret) return;
    await navigator.clipboard.writeText(revealedSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleCloseRevealModal = () => {
    setRevealedSecret(null);
    setShowCreateModal(false);
    setNewKeyName("");
    setConfirmedSaved(false);
  };

  const handleRevokeKey = (id: string) => {
    setKeys(keys.map((k) => (k.id === id ? { ...k, status: "revoked" } : k)));
  };

  return (
    <DeveloperPortalLayout
      title="API Key Management"
      subtitle="Issue, rotate, and manage cryptographically secured OsterdOps API keys"
    >
      <div className="space-y-6 max-w-5xl">
        {/* Security Architecture Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#dfba82]/10 via-[#0c0e17] to-[#0c0e17] border border-[#dfba82]/30 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#dfba82]/20 text-[#dfba82] shrink-0 border border-[#dfba82]/30">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#dfba82] font-serif">
              Cryptographic Key Lifecycle Guarantees
            </div>
            <p className="text-xs text-[#a0a5b8] mt-1 leading-relaxed">
              OsterdOps stores only one-way SHA-256 hashes of API keys using timing-safe comparisons. Plaintext
              secrets are generated in memory and revealed exactly once. They can never be recovered from the
              server or database if lost.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white font-serif">Active Keys</h2>
            <p className="text-xs text-[#73788c]">Keys permitted to authenticate AI Gateway and API requests</p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#dfba82] hover:bg-[#c9a36d] text-black text-xs font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(223,186,130,0.25)]"
          >
            <Plus className="w-4 h-4" />
            <span>Create New API Key</span>
          </button>
        </div>

        {/* Keys Table */}
        <div className="rounded-2xl border border-[#1b1e2c] bg-[#0c0e17] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111422] text-[#8e93a6] border-b border-[#1b1e2c]">
                <tr>
                  <th className="p-3.5 font-semibold">Name & Prefix</th>
                  <th className="p-3.5 font-semibold">Project</th>
                  <th className="p-3.5 font-semibold">Environment</th>
                  <th className="p-3.5 font-semibold">Created</th>
                  <th className="p-3.5 font-semibold">Last Used</th>
                  <th className="p-3.5 font-semibold">Status</th>
                  <th className="p-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161928]">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5">
                      <div className="font-semibold text-white">{k.name}</div>
                      <div className="text-[11px] font-mono text-[#dfba82]">{k.keyPrefix}</div>
                    </td>
                    <td className="p-3.5 font-mono text-[#8e93a6]">{k.project}</td>
                    <td className="p-3.5">
                      <span className="capitalize text-xs font-medium text-white px-2 py-0.5 rounded bg-[#161928] border border-[#232738]">
                        {k.environment}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#8e93a6] font-mono text-[11px]">{k.createdAt}</td>
                    <td className="p-3.5 text-[#8e93a6] text-[11px]">{k.lastUsedAt || "Never"}</td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-semibold ${
                          k.status === "active"
                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                            : "bg-red-950/60 text-red-400 border border-red-800/40"
                        }`}
                      >
                        {k.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {k.status === "active" ? (
                        <button
                          type="button"
                          onClick={() => handleRevokeKey(k.id)}
                          className="px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-950/80 text-red-400 border border-red-800/40 text-[11px] font-medium transition-all cursor-pointer"
                        >
                          Revoke
                        </button>
                      ) : (
                        <span className="text-[#555a6d] text-[11px]">Revoked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Create API Key Form / Secret Reveal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-lg bg-[#0c0e17] border border-[#232738] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
              {!revealedSecret ? (
                <>
                  <div className="flex items-center gap-2.5 pb-3 border-b border-[#161824]">
                    <div className="p-2 rounded-xl bg-[#dfba82]/20 text-[#dfba82] border border-[#dfba82]/30">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white font-serif">Create Project API Key</h3>
                      <p className="text-xs text-[#73788c]">Assign a descriptive identifier for your workload</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-white">Key Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Ingestion Worker"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        className="w-full bg-[#07080c] border border-[#1b1e2c] rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#dfba82]/50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-white">Environment</label>
                      <select
                        value={newKeyEnv}
                        onChange={(e) =>
                          setNewKeyEnv(e.target.value as "production" | "staging" | "development")
                        }
                        className="w-full bg-[#07080c] border border-[#1b1e2c] rounded-xl p-2.5 text-xs text-white outline-none"
                      >
                        <option value="production">Production (osk_live_...)</option>
                        <option value="staging">Staging (osk_test_...)</option>
                        <option value="development">Development (osk_test_...)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#161824]">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-3.5 py-2 rounded-xl bg-[#161928] text-[#8e93a6] hover:text-white text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateKey}
                      disabled={!newKeyName.trim()}
                      className="px-4 py-2 rounded-xl bg-[#dfba82] hover:bg-[#c9a36d] text-black text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                      Generate Key
                    </button>
                  </div>
                </>
              ) : (
                /* Single-Reveal Plaintext Secret Modal */
                <div className="space-y-5">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-[#161824]">
                    <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-800/40 text-amber-400">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white font-serif">Save Your API Key Secret</h3>
                      <p className="text-xs text-amber-400 font-medium">
                        This secret is shown only once and cannot be recovered later.
                      </p>
                    </div>
                  </div>

                  {/* Secret Display Box */}
                  <div className="p-3.5 rounded-xl bg-[#07080c] border border-[#dfba82]/40 flex items-center justify-between gap-3">
                    <span className="font-mono text-xs text-[#dfba82] font-semibold break-all select-all">
                      {revealedSecret}
                    </span>

                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161928] hover:bg-[#232738] text-white text-xs font-medium shrink-0 cursor-pointer border border-[#232738]"
                    >
                      {copiedSecret ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#dfba82]" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Confirmation Checkbox */}
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#c5c9d6] select-none">
                    <input
                      type="checkbox"
                      checked={confirmedSaved}
                      onChange={(e) => setConfirmedSaved(e.target.checked)}
                      className="mt-0.5 rounded border-[#232738] bg-[#07080c] text-[#dfba82] focus:ring-0"
                    />
                    <span>I have copied and safely stored this API key secret in my environment variables.</span>
                  </label>

                  <div className="pt-3 border-t border-[#161824] flex justify-end">
                    <button
                      type="button"
                      onClick={handleCloseRevealModal}
                      disabled={!confirmedSaved}
                      className="px-4 py-2 rounded-xl bg-[#dfba82] hover:bg-[#c9a36d] text-black text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
                    >
                      Done & Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DeveloperPortalLayout>
  );
}
