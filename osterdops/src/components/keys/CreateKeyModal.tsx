"use client";

import React, { useState } from "react";
import {
  KeyRound,
  Copy,
  Check,
  ShieldAlert,
  AlertTriangle,
  Loader2,
  X,
  Lock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export interface CreatedKeyData {
  id: string;
  name: string;
  key: string;
  prefix: string;
  keyPrefix?: string;
  createdAt: string;
  environment?: string;
}

interface CreateKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyCreated?: (created: CreatedKeyData) => void;
  organizationId?: string;
  projectId?: string;
}

export function CreateKeyModal({
  isOpen,
  onClose,
  onKeyCreated,
  organizationId,
  projectId,
}: CreateKeyModalProps) {
  const { currentOrg, getIdToken } = useAuth();

  // Form State
  const [name, setName] = useState("");
  const [environment, setEnvironment] = useState<"production" | "staging">("production");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success Reveal State
  const [createdKeyData, setCreatedKeyData] = useState<CreatedKeyData | null>(null);
  const [copied, setCopied] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  if (!isOpen) return null;

  const targetOrgId = organizationId || currentOrg?.id || "";

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = await getIdToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/v1/keys", {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: name.trim() || undefined,
          environment,
          organizationId: targetOrgId || undefined,
          projectId: projectId || undefined,
          permissions: ["usage:ingest", "models:read", "routing:execute"],
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success) {
        const errorMsg = json?.error || `Failed to generate key (HTTP ${res.status})`;
        throw new Error(errorMsg);
      }

      const data = json.data;
      const newKeyObj: CreatedKeyData = {
        id: data.id,
        name: data.name,
        key: data.key, // Full unmasked plaintext key
        prefix: data.prefix,
        keyPrefix: data.prefix,
        createdAt: data.createdAt,
        environment,
      };

      setCreatedKeyData(newKeyObj);
      setCopied(false);
      setAcknowledged(false);

      if (onKeyCreated) {
        onKeyCreated(newKeyObj);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Key generation failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (createdKeyData?.key) {
      await navigator.clipboard.writeText(createdKeyData.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleClose = () => {
    if (createdKeyData && !acknowledged && !copied) {
      // Prompt user to copy before closing
      const confirmDismiss = window.confirm(
        "You haven't copied your secret key yet. Once closed, it can NEVER be retrieved. Are you sure you want to dismiss?"
      );
      if (!confirmDismiss) return;
    }

    setCreatedKeyData(null);
    setName("");
    setError(null);
    setCopied(false);
    setAcknowledged(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !createdKeyData) {
          handleClose();
        }
      }}
    >
      <div className="w-full max-w-lg bg-[#0c0e16] border border-[#202538] rounded-2xl p-6 shadow-2xl text-white relative space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1b1f30]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#dfba82]/15 border border-[#dfba82]/30 flex items-center justify-center text-[#dfba82]">
              <KeyRound className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#f4efe6]">
                {createdKeyData ? "Key Created Successfully" : "Generate Gateway API Key"}
              </h3>
              <p className="text-[11px] text-[#8e93a6]">
                {createdKeyData
                  ? "Store this secret safely in your environment variables"
                  : "Cryptographically secure 256-bit entropy credential"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-[#787d91] hover:text-white hover:bg-[#161a29] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Phase 1: Key Creation Form */}
        {!createdKeyData ? (
          <form onSubmit={handleGenerate} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="block text-[11.5px] font-semibold text-[#c5c9d6]">
                Key Name / Label
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Production Backend Gateway Key"
                className="w-full px-3.5 py-2.5 bg-[#121522] border border-[#202538] rounded-xl text-white placeholder-[#5e6377] focus:outline-none focus:border-[#dfba82] transition-colors"
                autoFocus
              />
              <span className="text-[10px] text-[#6b7084]">
                Leave empty for default timestamped production name.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11.5px] font-semibold text-[#c5c9d6]">
                Environment Tier
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEnvironment("production")}
                  className={`py-2.5 px-3 rounded-xl border text-center font-medium transition-all cursor-pointer ${
                    environment === "production"
                      ? "bg-[#dfba82]/15 border-[#dfba82] text-[#dfba82] shadow-[0_0_12px_rgba(223,186,130,0.15)]"
                      : "bg-[#121522] border-[#202538] text-[#8e93a6] hover:border-[#2f354f]"
                  }`}
                >
                  <div className="font-semibold text-xs">Production (Live)</div>
                  <div className="text-[10px] opacity-70">Prefix: ost_live_</div>
                </button>
                <button
                  type="button"
                  onClick={() => setEnvironment("staging")}
                  className={`py-2.5 px-3 rounded-xl border text-center font-medium transition-all cursor-pointer ${
                    environment === "staging"
                      ? "bg-blue-950/40 border-blue-500 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                      : "bg-[#121522] border-[#202538] text-[#8e93a6] hover:border-[#2f354f]"
                  }`}
                >
                  <div className="font-semibold text-xs">Staging / Test</div>
                  <div className="text-[10px] opacity-70">Prefix: ost_stg_</div>
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#090b12] border border-[#181c2d] text-[11.5px] text-[#8e93a6] flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-[#dfba82] shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold text-[#f4efe6]">One-Way SHA-256 Guarantee:</span> Plaintext
                secrets are never saved to our database. Your key will be displayed only once.
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#1b1f30]">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-xs text-[#8e93a6] hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-[#dfba82] text-black font-bold text-xs rounded-xl hover:bg-[#ebd4aa] shadow-[0_2px_12px_rgba(223,186,130,0.25)] transition-all cursor-pointer flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Cryptographic Key...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 stroke-[2.2]" />
                    <span>Generate Key</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Phase 2: Key Created Successfully State */
          <div className="space-y-4 text-xs animate-in fade-in duration-200">
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-700/40 text-emerald-300 flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-xs">Gateway API Key Ready:</span> {createdKeyData.name}
              </div>
            </div>

            {/* Critical Warning */}
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-600/40 text-amber-300 flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed text-[11.5px]">
                <strong className="text-amber-200 font-bold block mb-0.5">
                  Make sure to copy this key now. You won&apos;t be able to see it again.
                </strong>
                For security reasons, we do not store the plaintext key. If you lose this key, you will need to rotate or generate a new one.
              </div>
            </div>

            {/* Secret Key Display & Single-Click Copy Box */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-[#8e93a6]">
                Secret API Key (Plaintext Secret)
              </label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#07080e] border border-[#23283c] font-mono text-xs">
                <span
                  id="generated-raw-api-key"
                  className="flex-1 text-[#dfba82] select-all break-all pr-2 font-bold leading-relaxed"
                >
                  {createdKeyData.key}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#dfba82] hover:bg-[#ebd4aa] text-black text-xs font-bold transition-all cursor-pointer shrink-0 shadow-md"
                  title="Copy key to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-800" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Copy Key</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Acknowledgment Guard */}
            <div className="flex items-center gap-2.5 pt-1">
              <input
                id="key-copy-acknowledgment"
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="w-4 h-4 rounded border-[#2a3048] bg-[#121522] text-[#dfba82] focus:ring-[#dfba82] cursor-pointer"
              />
              <label
                htmlFor="key-copy-acknowledgment"
                className="text-[11.5px] text-[#c5c9d6] cursor-pointer select-none"
              >
                I have copied and safely stored my secret API key in a secure vault.
              </label>
            </div>

            {/* Done Button */}
            <div className="flex justify-end gap-2 pt-3 border-t border-[#1b1f30]">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 bg-[#dfba82] hover:bg-[#ebd4aa] text-black font-bold text-xs rounded-xl shadow-[0_2px_12px_rgba(223,186,130,0.25)] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Done</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
