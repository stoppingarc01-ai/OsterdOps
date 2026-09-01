"use client";

import React, { useState } from "react";
import {
  KeyRound,
  Shield,
  RotateCw,
  Trash2,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  AlertTriangle,
  Lock,
} from "lucide-react";

interface AdminApiKey {
  id: string;
  name: string;
  maskedKey: string;
  project: string;
  environment: "production" | "staging" | "development";
  scopes: string[];
  status: "ACTIVE" | "REVOKED";
  createdDate: string;
  lastUsed: string;
}

const INITIAL_KEYS: AdminApiKey[] = [
  {
    id: "key_01",
    name: "Production Gateway Main",
    maskedKey: "ost_live_••••••••••••••••••••••••••••••••",
    project: "Production Gateway",
    environment: "production",
    scopes: ["chat.completions", "models.read"],
    status: "ACTIVE",
    createdDate: "Jan 12, 2025",
    lastUsed: "2 mins ago",
  },
  {
    id: "key_02",
    name: "Staging Pipeline Ingest",
    maskedKey: "ost_stg_••••••••••••••••••••••••••••••••",
    project: "Staging LLM Pipeline",
    environment: "staging",
    scopes: ["chat.completions", "usage.read"],
    status: "ACTIVE",
    createdDate: "Jan 18, 2025",
    lastUsed: "1 hour ago",
  },
  {
    id: "key_03",
    name: "RAG Vector Indexer",
    maskedKey: "ost_live_••••••••••••••••••••••••••••••••",
    project: "RAG Knowledge Indexer",
    environment: "production",
    scopes: ["chat.completions"],
    status: "ACTIVE",
    createdDate: "Feb 02, 2025",
    lastUsed: "1 day ago",
  },
  {
    id: "key_04",
    name: "Deprecated Test Runner",
    maskedKey: "ost_test_••••••••••••••••••••••••••••••••",
    project: "Legacy Summarizer V0",
    environment: "development",
    scopes: ["chat.completions"],
    status: "REVOKED",
    createdDate: "Dec 01, 2024",
    lastUsed: "Never",
  },
];

export function AdminApiKeysView() {
  const [keys, setKeys] = useState<AdminApiKey[]>(INITIAL_KEYS);
  const [search, setSearch] = useState("");
  const [envFilter, setEnvFilter] = useState("ALL");
  const [keyToRotate, setKeyToRotate] = useState<AdminApiKey | null>(null);
  const [keyToRevoke, setKeyToRevoke] = useState<AdminApiKey | null>(null);
  const [newRotatedSecret, setNewRotatedSecret] = useState<string | null>(null);

  const filteredKeys = keys.filter((k) => {
    const matchesSearch =
      k.name.toLowerCase().includes(search.toLowerCase()) ||
      k.project.toLowerCase().includes(search.toLowerCase());
    const matchesEnv = envFilter === "ALL" || k.environment === envFilter;
    return matchesSearch && matchesEnv;
  });

  const handleRotateConfirm = () => {
    if (!keyToRotate) return;
    const generatedSecret = `ost_${keyToRotate.environment === "production" ? "live" : "stg"}_${Math.random().toString(36).substring(2, 18)}${Math.random().toString(36).substring(2, 18)}`;
    setNewRotatedSecret(generatedSecret);

    setKeys(
      keys.map((k) =>
        k.id === keyToRotate.id
          ? { ...k, lastUsed: "Just rotated", createdDate: "Just now" }
          : k
      )
    );
  };

  const handleRevokeConfirm = () => {
    if (!keyToRevoke) return;
    setKeys(
      keys.map((k) => (k.id === keyToRevoke.id ? { ...k, status: "REVOKED" } : k))
    );
    setKeyToRevoke(null);
  };

  return (
    <div className="space-y-6">
      {/* Zero-Plaintext Security Notice */}
      <div className="p-4 rounded-2xl bg-[#090b10] border border-[#171b26] flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-[#dfba82]" />
          <div>
            <div className="text-xs font-semibold text-white">
              Zero-Plaintext Secret Architecture
            </div>
            <div className="text-[11px] text-[#8e93a6]">
              All API keys are stored as one-way SHA-256 hashes in Firestore. Existing plaintext secrets can never be read or retrieved by anyone, including administrators.
            </div>
          </div>
        </div>
        <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 font-semibold">
          <CheckCircle2 className="w-4 h-4" /> SHA-256 Hashed
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#717688] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search API keys by name or project..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3.5 py-2 bg-[#0c0f16] border border-[#171b26] rounded-xl text-xs text-white placeholder:text-[#555a6d] focus:outline-none focus:border-[#dfba82] w-64"
            />
          </div>

          <select
            value={envFilter}
            onChange={(e) => setEnvFilter(e.target.value)}
            className="bg-[#0c0f16] border border-[#171b26] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#dfba82]"
          >
            <option value="ALL">All Environments</option>
            <option value="production">Production (ost_live_...)</option>
            <option value="staging">Staging (ost_stg_...)</option>
            <option value="development">Development (ost_test_...)</option>
          </select>
        </div>
      </div>

      {/* API Keys Table */}
      <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#07080c] border-b border-[#171b26] text-[#717688] uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Key Name &amp; Masked Token</th>
                <th className="p-4">Project</th>
                <th className="p-4">Environment</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Used</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171b26] text-white">
              {filteredKeys.map((key) => (
                <tr key={key.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-white">{key.name}</div>
                    <div className="text-[#8e93a6] font-mono text-[11px] mt-0.5">{key.maskedKey}</div>
                  </td>
                  <td className="p-4 text-[#8e93a6]">{key.project}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                        key.environment === "production"
                          ? "bg-amber-950/60 text-amber-300 border-amber-800/40"
                          : key.environment === "staging"
                          ? "bg-blue-950/60 text-blue-300 border-blue-800/40"
                          : "bg-zinc-800 text-zinc-300 border-zinc-700"
                      }`}
                    >
                      {key.environment}
                    </span>
                  </td>
                  <td className="p-4">
                    {key.status === "ACTIVE" ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : (
                      <span className="text-rose-400 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Revoked
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-[#8e93a6]">{key.lastUsed}</td>
                  <td className="p-4 text-right">
                    {key.status === "ACTIVE" ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setKeyToRotate(key);
                            setNewRotatedSecret(null);
                          }}
                          className="p-1.5 hover:bg-[#1b202e] rounded-lg text-[#8e93a6] hover:text-[#dfba82] transition-colors cursor-pointer"
                          title="Rotate Secret"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setKeyToRevoke(key)}
                          className="p-1.5 hover:bg-rose-950/40 rounded-lg text-[#8e93a6] hover:text-rose-400 transition-colors cursor-pointer"
                          title="Revoke Key"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#555a6d] italic">Revoked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rotate Key Modal */}
      {keyToRotate && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#dfba82]">
              <RotateCw className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Rotate API Key</h3>
            </div>

            {!newRotatedSecret ? (
              <>
                <p className="text-xs text-[#8e93a6]">
                  Rotating <strong className="text-white">{keyToRotate.name}</strong> will generate a new secret and seamlessly supersede the existing token.
                </p>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setKeyToRotate(null)}
                    className="px-4 py-2 rounded-xl text-xs text-[#8e93a6] hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRotateConfirm}
                    className="px-4 py-2 rounded-xl bg-[#dfba82] hover:bg-[#ebd2a9] text-black font-semibold text-xs cursor-pointer shadow-md"
                  >
                    Generate &amp; Rotate
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 text-[11px] text-amber-300">
                  Save this key now. It will NEVER be shown again!
                </div>
                <div className="p-3 bg-[#07080c] border border-[#1b202e] rounded-xl font-mono text-xs text-white break-all select-all">
                  {newRotatedSecret}
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setKeyToRotate(null)}
                    className="px-4 py-2 rounded-xl bg-[#dfba82] hover:bg-[#ebd2a9] text-black font-semibold text-xs cursor-pointer shadow-md"
                  >
                    Done &amp; Copied
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Revoke Key Confirmation Modal */}
      {keyToRevoke && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0f16] border border-rose-900/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-sm font-bold text-white">Revoke API Key</h3>
            </div>
            <p className="text-xs text-[#8e93a6]">
              Are you sure you want to revoke <strong className="text-white">{keyToRevoke.name}</strong>? Any live service using this key will immediately receive HTTP 401 Unauthorized errors.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setKeyToRevoke(null)}
                className="px-4 py-2 rounded-xl text-xs text-[#8e93a6] hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs cursor-pointer shadow-md"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
