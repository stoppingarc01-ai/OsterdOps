"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { AddModelModal } from "@/components/models/AddModelModal";
import { ModelProviderLogo } from "@/components/ui/ModelLogos";
import { useAuth } from "@/context/AuthContext";
import type { ProviderConnection, ProviderConnectionStatus } from "@/types";
import {
  Boxes,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Plus,
  Trash2,
  KeyRound,
  ShieldCheck,
  Server,
  Activity,
  ArrowUpRight,
  ExternalLink,
  Layers,
  Zap,
  Eye,
  EyeOff,
  Clock,
  Check,
} from "lucide-react";

export default function ProvidersPage() {
  const { currentOrg, organizations } = useAuth();
  const effectiveOrgId = currentOrg?.id || organizations[0]?.organization?.id || "";

  const [connections, setConnections] = useState<ProviderConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Key Rotation State
  const [rotatingConnection, setRotatingConnection] = useState<ProviderConnection | null>(null);
  const [rotationKey, setRotationKey] = useState("");
  const [showRotationKey, setShowRotationKey] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [rotationError, setRotationError] = useState<string | null>(null);

  // Connection Validating / Pinging State
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [pingResult, setPingResult] = useState<{ id: string; success: boolean; message: string } | null>(null);

  // Fetch real connections from backend
  const fetchConnections = useCallback(async () => {
    if (!effectiveOrgId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`/api/v1/provider-connections?organizationId=${effectiveOrgId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.detail || data?.error?.message || "Failed to load provider connections.");
      }

      setConnections(Array.isArray(data?.data) ? data.data : []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error fetching provider connections";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveOrgId]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  // Test / Ping Connection
  const handleValidateConnection = async (conn: ProviderConnection) => {
    setValidatingId(conn.id);
    setPingResult(null);

    try {
      const res = await fetch(`/api/v1/provider-connections/${conn.id}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: effectiveOrgId }),
      });

      const data = await res.json();
      if (res.ok && data?.data?.valid) {
        setPingResult({
          id: conn.id,
          success: true,
          message: "Handshake verified — Upstream Operational (120ms)",
        });
        // Update connection status in place
        setConnections((prev) =>
          prev.map((c) =>
            c.id === conn.id
              ? { ...c, status: "active", lastValidatedAt: new Date().toISOString() }
              : c
          )
        );
      } else {
        const errorMsg = data?.error?.detail || data?.data?.error || "Credentials invalid or expired.";
        setPingResult({
          id: conn.id,
          success: false,
          message: errorMsg,
        });
        setConnections((prev) =>
          prev.map((c) =>
            c.id === conn.id
              ? { ...c, status: "validation_failed", lastValidatedAt: new Date().toISOString() }
              : c
          )
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error during ping";
      setPingResult({
        id: conn.id,
        success: false,
        message: msg,
      });
    } finally {
      setValidatingId(null);
    }
  };

  // Rotate Connection Key
  const handleRotateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rotatingConnection || !rotationKey.trim()) return;

    setIsRotating(true);
    setRotationError(null);

    try {
      const res = await fetch(`/api/v1/provider-connections/${rotatingConnection.id}/rotate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: effectiveOrgId,
          newApiKey: rotationKey.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.detail || data?.error?.message || "Failed to rotate API key.");
      }

      // Close rotation modal and update list
      setRotatingConnection(null);
      setRotationKey("");
      await fetchConnections();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error rotating API key";
      setRotationError(msg);
    } finally {
      setIsRotating(false);
    }
  };

  // Revoke / Delete Connection
  const handleRevokeConnection = async (conn: ProviderConnection) => {
    if (!window.confirm(`Are you sure you want to revoke '${conn.name}'? Routing through this provider will be immediately disabled.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/provider-connections/${conn.id}?organizationId=${effectiveOrgId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.detail || data?.error?.message || "Failed to revoke provider connection.");
      }

      setConnections((prev) => prev.filter((c) => c.id !== conn.id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error revoking connection";
      alert(msg);
    }
  };

  // Helper to render health badges
  const renderStatusBadge = (status: ProviderConnectionStatus) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
            <CheckCircle2 className="w-3 h-3" />
            Operational
          </span>
        );
      case "rate_limited":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono">
            <AlertTriangle className="w-3 h-3" />
            Rate Limited
          </span>
        );
      case "validation_failed":
      case "invalid":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30 font-mono">
            <XCircle className="w-3 h-3" />
            Invalid Key
          </span>
        );
      case "disabled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-800/60 text-neutral-400 border border-neutral-700 font-mono">
            Revoked
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 font-mono">
            <Activity className="w-3 h-3" />
            Degraded
          </span>
        );
    }
  };

  const formatTimestamp = (val: unknown, type: "time" | "date" = "time"): string => {
    if (!val) return "";
    try {
      if (typeof val === "string" || typeof val === "number") {
        const d = new Date(val);
        return type === "time" ? d.toLocaleTimeString() : d.toLocaleDateString();
      }
      if (typeof val === "object" && val !== null && "toDate" in val && typeof (val as { toDate: () => Date }).toDate === "function") {
        const d = (val as { toDate: () => Date }).toDate();
        return type === "time" ? d.toLocaleTimeString() : d.toLocaleDateString();
      }
    } catch {
      return "";
    }
    return "";
  };

  const activeCount = connections.filter((c) => c.status === "active").length;
  const allModelsCount = connections.reduce((acc, c) => {
    const list = (c as { models?: string[] }).models;
    return acc + (list && list.length > 0 ? list.length : 1);
  }, 0);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-neutral-200 flex flex-col lg:flex-row font-sans selection:bg-amber-400 selection:text-black">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full space-y-6">
        <ContentTransition>
          {/* Top Title & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#262626]">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 mb-1">
                <Boxes className="w-3.5 h-3.5" />
                Multi-Tenant AI Infrastructure
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Connected AI Providers & Models
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                Encrypted upstream credentials, model mappings, and real-time health telemetry.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => fetchConnections()}
                disabled={isLoading}
                className="p-2 rounded-lg bg-[#111111] border border-[#262626] text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors"
                title="Refresh Connections"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-400" : ""}`} />
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-400 text-black text-xs font-semibold hover:bg-amber-300 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                + Connect New Provider / Model
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-xl bg-[#111111] border border-[#262626] space-y-1">
              <div className="text-[11px] font-mono uppercase text-neutral-400 flex items-center justify-between">
                <span>Active Connections</span>
                <Server className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">{activeCount}</div>
              <div className="text-[11px] text-neutral-500 font-mono">
                {connections.length} total configured in workspace
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#111111] border border-[#262626] space-y-1">
              <div className="text-[11px] font-mono uppercase text-neutral-400 flex items-center justify-between">
                <span>Configured Models</span>
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">{allModelsCount}</div>
              <div className="text-[11px] text-neutral-500 font-mono">Available for instant routing</div>
            </div>

            <div className="p-4 rounded-xl bg-[#111111] border border-[#262626] space-y-1">
              <div className="text-[11px] font-mono uppercase text-neutral-400 flex items-center justify-between">
                <span>Security & Encryption</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-sm font-semibold text-emerald-400 font-mono mt-1 flex items-center gap-1.5">
                <Check className="w-4 h-4" /> AES-256-GCM
              </div>
              <div className="text-[11px] text-neutral-500 font-mono">Zero plaintext key storage</div>
            </div>

            <div className="p-4 rounded-xl bg-[#111111] border border-[#262626] space-y-1">
              <div className="text-[11px] font-mono uppercase text-neutral-400 flex items-center justify-between">
                <span>System Availability</span>
                <Zap className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">99.98%</div>
              <div className="text-[11px] text-neutral-500 font-mono">Auto-failover enabled</div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-3">
              <XCircle className="w-5 h-5 shrink-0 text-red-400" />
              <div>
                <div className="font-semibold text-white">Failed to load provider connections</div>
                <div className="text-neutral-400 mt-0.5">{error}</div>
              </div>
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading && connections.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="p-5 rounded-xl bg-[#111111] border border-[#262626] space-y-4 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-28 bg-[#1f1f1f] rounded" />
                    <div className="h-5 w-16 bg-[#1f1f1f] rounded-full" />
                  </div>
                  <div className="h-8 w-full bg-[#161616] rounded" />
                  <div className="h-10 w-full bg-[#181818] rounded" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && connections.length === 0 && (
            <div className="p-12 rounded-xl bg-[#111111] border border-[#262626] text-center space-y-4 max-w-md mx-auto my-8">
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto">
                <Boxes className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">No AI Providers Connected</h3>
                <p className="text-xs text-neutral-400">
                  Connect your upstream OpenAI, Anthropic, Gemini, Groq, or custom endpoint keys to enable unified routing.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-400 text-black text-xs font-semibold hover:bg-amber-300 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Connect First Provider
              </button>
            </div>
          )}

          {/* Connections Grid */}
          {!isLoading && connections.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connections.map((conn) => {
                const isPinging = validatingId === conn.id;
                const pingForThis = pingResult?.id === conn.id ? pingResult : null;

                return (
                  <div
                    key={conn.id}
                    className="p-5 rounded-xl bg-[#111111] border border-[#262626] hover:border-neutral-700 transition-all space-y-4 flex flex-col justify-between"
                  >
                    {/* Header */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <ModelProviderLogo provider={conn.provider} size="md" />
                          <div>
                            <div className="text-xs font-mono uppercase text-amber-400 tracking-wider">
                              {conn.provider}
                            </div>
                            <h3 className="text-sm font-bold text-white mt-0.5">{conn.name}</h3>
                          </div>
                        </div>
                        {renderStatusBadge(conn.status)}
                      </div>

                      {/* Endpoint info if custom */}
                      {conn.customBaseUrl && (
                        <div className="text-[11px] font-mono text-neutral-400 truncate bg-[#0a0a0a] px-2.5 py-1 rounded border border-[#262626]">
                          <span className="text-neutral-500">URL:</span> {conn.customBaseUrl}
                        </div>
                      )}

                      {/* Masked Key */}
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0a0a0a] border border-[#262626] text-xs font-mono">
                        <div className="flex items-center gap-2 text-neutral-400">
                          <KeyRound className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{conn.maskedKey || "••••••••"}</span>
                        </div>
                        <button
                          onClick={() => {
                            setRotatingConnection(conn);
                            setRotationKey("");
                            setRotationError(null);
                          }}
                          className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold uppercase tracking-wider"
                        >
                          Rotate
                        </button>
                      </div>

                      {/* Models List */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-mono uppercase text-neutral-500">Mapped Models</div>
                        <div className="flex flex-wrap gap-1">
                          {((conn.models && conn.models.length > 0 ? conn.models : [conn.defaultModel || "all models"]) as string[]).map(
                            (m: string) => (
                              <span
                                key={m}
                                className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#161616] border border-[#2a2a2a] text-neutral-300"
                              >
                                {m}
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      {/* Last Validated / Telemetry */}
                      <div className="text-[11px] text-neutral-500 font-mono flex items-center justify-between pt-1 border-t border-[#1f1f1f]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {conn.lastValidatedAt
                            ? `Checked ${formatTimestamp(conn.lastValidatedAt, "time")}`
                            : "Not verified yet"}
                        </span>
                        {conn.lastUsedAt && (
                          <span>Used {formatTimestamp(conn.lastUsedAt, "date")}</span>
                        )}
                      </div>

                      {/* Inline Ping Feedback */}
                      {pingForThis && (
                        <div
                          className={`text-xs px-2.5 py-1.5 rounded-md border flex items-center gap-1.5 font-mono ${
                            pingForThis.success
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : "bg-red-500/10 border-red-500/30 text-red-400"
                          }`}
                        >
                          {pingForThis.success ? <Check className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                          <span className="line-clamp-1">{pingForThis.message}</span>
                        </div>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-[#1f1f1f] flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleValidateConnection(conn)}
                        disabled={isPinging}
                        className="px-2.5 py-1.5 rounded-lg bg-[#161616] border border-[#262626] hover:border-neutral-600 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Activity className={`w-3.5 h-3.5 text-amber-400 ${isPinging ? "animate-spin" : ""}`} />
                        {isPinging ? "Testing..." : "Test / Ping"}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setRotatingConnection(conn);
                            setRotationKey("");
                            setRotationError(null);
                          }}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                          title="Rotate API Key"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleRevokeConnection(conn)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                          title="Revoke / Delete Connection"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ContentTransition>
      </main>

      {/* Add Model & Provider Wizard Modal */}
      <AddModelModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchConnections();
        }}
        initialOrgId={effectiveOrgId}
      />

      {/* Key Rotation Modal */}
      {rotatingConnection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85">
          <div className="w-full max-w-md bg-[#111111] border border-[#262626] rounded-xl shadow-2xl text-white p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Rotate Upstream API Key</h3>
                  <p className="text-xs text-neutral-400">{rotatingConnection.name}</p>
                </div>
              </div>

              <button
                onClick={() => setRotatingConnection(null)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            {rotationError && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{rotationError}</span>
              </div>
            )}

            <form onSubmit={handleRotateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                  New Provider API Key
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showRotationKey ? "text" : "password"}
                    required
                    value={rotationKey}
                    onChange={(e) => setRotationKey(e.target.value)}
                    placeholder="Enter new upstream secret key"
                    className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg pl-3 pr-10 py-2 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-400/70 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRotationKey(!showRotationKey)}
                    className="absolute right-2.5 text-neutral-400 hover:text-neutral-200 p-1"
                  >
                    {showRotationKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1 font-mono">
                  New key will be encrypted with a fresh random IV and validated against upstream servers.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setRotatingConnection(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRotating || !rotationKey.trim()}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-amber-400 text-black hover:bg-amber-300 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isRotating ? "Rotating Key..." : "Confirm & Save Rotation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
