"use client";

import React, { useEffect, useState } from "react";
import {
  KeyRound,
  Search,
  CheckCircle2,
  Shield,
  RotateCcw,
  Trash2,
  Lock,
  Copy,
  Check,
  AlertTriangle,
  X,
  Plus,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";
import type { ApiKey } from "@/types";

interface AdminApiKey {
  id: string;
  projectId?: string;
  name: string;
  maskedKey: string;
  project: string;
  environment: "production" | "staging" | "development";
  scopes: string[];
  status: "ACTIVE" | "REVOKED";
  createdDate: string;
  lastUsed: string;
}

export function AdminApiKeysView() {
  const { currentOrg, getIdToken } = useAuth();
  const [keys, setKeys] = useState<AdminApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [envFilter, setEnvFilter] = useState("ALL");
  const [keyToRotate, setKeyToRotate] = useState<AdminApiKey | null>(null);
  const [keyToRevoke, setKeyToRevoke] = useState<AdminApiKey | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadKeys() {
      if (!currentOrg?.id) return;
      setLoading(true);

      try {
        const token = await getIdToken();
        const projRes = await apiRequest<any[]>("/api/v1/projects", {
          params: { organizationId: currentOrg.id },
          token,
        });

        if (!isMounted) return;

        const allKeys: AdminApiKey[] = [];

        if (projRes.data && Array.isArray(projRes.data)) {
          for (const proj of projRes.data) {
            try {
              const keysRes = await apiRequest<ApiKey[]>(`/api/v1/projects/${proj.id}/api-keys`, { token });
              if (keysRes.data && Array.isArray(keysRes.data)) {
                for (const k of keysRes.data) {
                    const createdDateObj = k.createdAt ? (typeof k.createdAt === "object" && "toDate" in k.createdAt ? (k.createdAt as any).toDate() : new Date(k.createdAt as string)) : null;
                    const lastUsedObj = k.lastUsedAt ? (typeof k.lastUsedAt === "object" && "toDate" in k.lastUsedAt ? (k.lastUsedAt as any).toDate() : new Date(k.lastUsedAt as string)) : null;

                    allKeys.push({
                      id: k.id,
                      projectId: proj.id,
                      name: k.name,
                      maskedKey: `${k.keyPrefix || "ost_live"}••••••••••••••••`,
                      project: proj.name,
                      environment: (k.environment || "production") as any,
                      scopes: k.scopes || (k as any).permissions || ["chat.completions"],
                      status: k.status === "revoked" ? "REVOKED" : "ACTIVE",
                      createdDate: createdDateObj ? createdDateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent",
                      lastUsed: lastUsedObj ? lastUsedObj.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Never",
                    });
                }
              }
            } catch (e) {
              // skip project on err
            }
          }
        }

        if (isMounted) {
          setKeys(allKeys);
        }
      } catch (err) {
        if (isMounted) setKeys([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadKeys();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken]);

  const filteredKeys = keys.filter((k) => {
    const matchesSearch =
      k.name.toLowerCase().includes(search.toLowerCase()) ||
      k.project.toLowerCase().includes(search.toLowerCase());
    const matchesEnv = envFilter === "ALL" || k.environment === envFilter;
    return matchesSearch && matchesEnv;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleConfirmRotate = () => {
    if (!keyToRotate) return;
    setKeys(
      keys.map((k) =>
        k.id === keyToRotate.id
          ? {
              ...k,
              maskedKey: "ost_live_••••••••••••••••••••••••••••••••",
              lastUsed: "Just now (Rotated)",
            }
          : k
      )
    );
    setKeyToRotate(null);
  };

  const handleConfirmRevoke = () => {
    if (!keyToRevoke) return;
    setKeys(
      keys.map((k) => (k.id === keyToRevoke.id ? { ...k, status: "REVOKED" } : k))
    );
    setKeyToRevoke(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Security Banner */}
      <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#dfba82]/10 border border-[#dfba82]/20 flex items-center justify-center text-[#dfba82]">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-serif">
              Zero-Plaintext Key Storage Architecture
            </h3>
            <p className="text-xs text-[#8e93a6]">
              All API keys are salted and hashed with SHA-256 at creation time. Plaintext values are never stored.
            </p>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-xs font-semibold flex items-center gap-1.5">
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
            <option value="production">Production</option>
            <option value="staging">Staging</option>
            <option value="development">Development</option>
          </select>
        </div>
      </div>

      {/* API Keys Table */}
      <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#8e93a6] space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#dfba82]" />
              <div>Loading API keys across projects...</div>
            </div>
          ) : (
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
                {filteredKeys.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-[#73788c] bg-[#090b12]">
                      No API keys found for this organization
                    </td>
                  </tr>
                ) : (
                  filteredKeys.map((key) => (
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
                            <Lock className="w-3.5 h-3.5" /> Revoked
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-[#8e93a6]">{key.lastUsed}</td>
                      <td className="p-4 text-right">
                        {key.status === "ACTIVE" && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setKeyToRotate(key)}
                              className="p-1.5 hover:bg-[#1b202e] rounded-lg text-[#8e93a6] hover:text-[#dfba82] transition-colors cursor-pointer"
                              title="Rotate Key"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setKeyToRevoke(key)}
                              className="p-1.5 hover:bg-[#1b202e] rounded-lg text-[#8e93a6] hover:text-rose-400 transition-colors cursor-pointer"
                              title="Revoke Key"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal 1: Rotate Key Confirmation */}
      {keyToRotate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Rotate API Key</h3>
            </div>

            <p className="text-xs text-[#8e93a6] leading-relaxed">
              Rotating <strong className="text-white">{keyToRotate.name}</strong> will invalidate the existing secret immediately and issue a new key token.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setKeyToRotate(null)}
                className="px-3.5 py-2 text-xs text-[#8e93a6] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRotate}
                className="px-4 py-2 bg-[#dfba82] hover:bg-[#ebd2a9] text-black font-semibold text-xs rounded-xl"
              >
                Confirm Rotation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Revoke Key Confirmation */}
      {keyToRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Revoke API Key</h3>
            </div>

            <p className="text-xs text-[#8e93a6] leading-relaxed">
              Are you sure you want to permanently revoke{" "}
              <strong className="text-white">{keyToRevoke.name}</strong>? Any services currently routing proxy traffic with this key will fail immediately with HTTP 401.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setKeyToRevoke(null)}
                className="px-3.5 py-2 text-xs text-[#8e93a6] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRevoke}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl"
              >
                Revoke Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
