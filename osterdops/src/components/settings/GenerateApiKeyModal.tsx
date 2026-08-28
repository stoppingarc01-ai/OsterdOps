"use client";

import React, { useState } from "react";
import { X, Check, Copy, Key, ShieldAlert } from "lucide-react";

interface GenerateApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GenerateApiKeyModal({ isOpen, onClose }: GenerateApiKeyModalProps) {
  const [name, setName] = useState("");
  const [scope, setScope] = useState("Full Ingestion Proxy");
  const [expiration, setExpiration] = useState("90");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const randomHex = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    setCreatedKey(`osk_live_${randomHex}`);
  };

  const handleCopy = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDone = () => {
    setCreatedKey(null);
    setName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0d0f18] border border-[#23273a] rounded-2xl p-6 shadow-2xl relative text-white space-y-4">
        <button
          onClick={createdKey ? handleDone : onClose}
          className="absolute top-4 right-4 text-[#787d91] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#dfba82]/20 border border-[#dfba82]/40 flex items-center justify-center text-[#dfba82]">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#f4efe6]">Generate Workspace API Key</h3>
            <p className="text-xs text-[#8e93a6]">Issue an API token for SDK ingestion or proxy routing.</p>
          </div>
        </div>

        {createdKey ? (
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-[#131625] border border-[#23273a] rounded-xl space-y-2">
              <div className="text-[11px] text-[#73788c] font-medium">Your API Secret Key</div>
              <div className="font-mono text-xs text-[#dfba82] break-all bg-[#0a0c14] p-2.5 rounded-lg border border-[#1e2235]">
                {createdKey}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/25 flex items-start gap-2.5 text-xs text-[#fbbf24]">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Copy this key now. For security reasons, it will never be displayed again.</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2 bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied to Clipboard!" : "Copy Key"}</span>
              </button>
              <button
                type="button"
                onClick={handleDone}
                className="px-4 py-2 rounded-xl bg-[#141724] border border-[#232738] text-xs text-white hover:bg-[#1f2338] transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-[11.5px] font-medium text-[#b0b5c7] mb-1">
                API Key Name / Identifier
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Production Langchain Proxy"
                className="w-full bg-[#131624] border border-[#23273a] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#5e6377] focus:outline-none focus:border-[#dfba82]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11.5px] font-medium text-[#b0b5c7] mb-1">
                  Permission Scope
                </label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  className="w-full bg-[#131624] border border-[#23273a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="Full Ingestion Proxy">Full Ingestion Proxy</option>
                  <option value="Read & Write">Read & Write</option>
                  <option value="Telemetry Only">Telemetry Only</option>
                  <option value="Read Only">Read Only</option>
                </select>
              </div>

              <div>
                <label className="block text-[11.5px] font-medium text-[#b0b5c7] mb-1">
                  Expiration Period
                </label>
                <select
                  value={expiration}
                  onChange={(e) => setExpiration(e.target.value)}
                  className="w-full bg-[#131624] border border-[#23273a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="30">30 Days</option>
                  <option value="90">90 Days</option>
                  <option value="365">1 Year</option>
                  <option value="never">Never (No Expiration)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#8e93a6] hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Create API Key
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
