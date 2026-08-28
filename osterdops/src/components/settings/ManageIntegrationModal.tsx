"use client";

import React, { useState } from "react";
import { X, Check, ShieldCheck, Key, AlertTriangle, RefreshCw, Trash2 } from "lucide-react";
import { IntegrationLogoBadge } from "@/components/ui/IntegrationLogos";

export interface IntegrationItem {
  id: string;
  name: string;
  badge: string;
  addedDate: string;
  totalSpend: string;
  status: "Connected" | "Error" | "Inactive";
  keyHint?: string;
  provider: string;
}

interface ManageIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  integration: IntegrationItem | null;
  onUpdate: (updated: IntegrationItem) => void;
  onDisconnect: (id: string) => void;
}

export function ManageIntegrationModal({
  isOpen,
  onClose,
  integration,
  onUpdate,
  onDisconnect,
}: ManageIntegrationModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [showConfirmDisconnect, setShowConfirmDisconnect] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !integration) return null;

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      onUpdate({
        ...integration,
        status: "Connected",
      });
    }, 800);
  };

  const handleDisconnect = () => {
    onDisconnect(integration.id);
    setShowConfirmDisconnect(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#0c0e17] border border-[#23273a] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1b1e2c] bg-[#090b12]">
          <div className="flex items-center gap-3">
            <IntegrationLogoBadge id={integration.id} size={32} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">{integration.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 text-[10px] font-semibold">
                  {integration.status}
                </span>
              </div>
              <p className="text-[11px] text-[#787d91]">{integration.addedDate}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#787d91] hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#121522] border border-[#23273a]">
            <div>
              <div className="text-[11px] text-[#787d91]">Total Spend Recorded</div>
              <div className="text-sm font-bold text-white mt-0.5">{integration.totalSpend}</div>
            </div>
            <div>
              <div className="text-[11px] text-[#787d91]">Sync Frequency</div>
              <div className="text-xs font-semibold text-[#dfba82] mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                Real-time Webhook
              </div>
            </div>
          </div>

          {/* Secret / Key Mask */}
          <div>
            <label className="block text-xs font-medium text-[#c5c9d6] mb-1.5">
              API Connection Token
            </label>
            <div className="flex items-center bg-[#121522] border border-[#23273a] rounded-xl px-3.5 py-2.5 text-xs text-white">
              <Key className="w-3.5 h-3.5 text-[#dfba82] mr-2 shrink-0" />
              <input
                type="password"
                readOnly
                value="sk-live-••••••••••••••••••••••••"
                className="bg-transparent font-mono text-xs text-[#8e93a6] flex-1 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-[11px] font-semibold text-[#dfba82] hover:underline cursor-pointer ml-2"
              >
                {copied ? "Copied!" : "Copy Key"}
              </button>
            </div>
          </div>

          {/* Rotate Key input */}
          <div>
            <label className="block text-xs font-medium text-[#c5c9d6] mb-1.5">
              Rotate API Key (Optional)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste replacement token..."
              className="w-full bg-[#121522] border border-[#23273a] focus:border-[#dfba82] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#555b70] focus:outline-none"
            />
          </div>

          {/* Disconnect Warning */}
          {showConfirmDisconnect ? (
            <div className="p-3.5 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-[#ef4444] font-semibold">
                <AlertTriangle className="w-4 h-4" />
                <span>Are you sure you want to disconnect {integration.name}?</span>
              </div>
              <p className="text-[#a5abbf] text-[11px]">
                Cost ingestion and live model rate telemetry will immediately pause for this provider.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-3 py-1.5 rounded-lg bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold text-xs cursor-pointer transition-colors"
                >
                  Confirm Disconnect
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmDisconnect(false)}
                  className="px-3 py-1.5 rounded-lg text-[#8e93a6] hover:text-white text-xs font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#1b1e2c] bg-[#090b12]">
          <button
            type="button"
            onClick={() => setShowConfirmDisconnect(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#ef4444] hover:text-[#f87171] transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Disconnect Integration</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#141726] border border-[#232738] hover:border-[#dfba82]/40 text-[#c5c9d6] hover:text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-[#dfba82]" : ""}`} />
              <span>{isSyncing ? "Syncing..." : "Sync Telemetry"}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-bold transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Done</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
