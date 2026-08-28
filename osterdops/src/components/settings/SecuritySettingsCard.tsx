"use client";

import React, { useState } from "react";
import { Key, Plus, Copy, Check, Trash2, Shield, Lock, Globe } from "lucide-react";

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  created: string;
  lastUsed: string;
  role: string;
}

const INITIAL_KEYS: ApiKeyItem[] = [
  {
    id: "1",
    name: "Production Gateway Ingestion",
    keyPrefix: "osk_live_••••••••••••94f2",
    created: "Apr 12, 2025",
    lastUsed: "4 seconds ago",
    role: "Full Ingestion Proxy",
  },
  {
    id: "2",
    name: "Staging Pipeline Proxy",
    keyPrefix: "osk_test_••••••••••••381a",
    created: "May 02, 2025",
    lastUsed: "12 minutes ago",
    role: "Read & Write",
  },
  {
    id: "3",
    name: "Datadog APM Exporter",
    keyPrefix: "osk_live_••••••••••••77bc",
    created: "May 08, 2025",
    lastUsed: "1 hour ago",
    role: "Telemetry Only",
  },
];

interface SecuritySettingsCardProps {
  onOpenGenerateKey: () => void;
}

export function SecuritySettingsCard({ onOpenGenerateKey }: SecuritySettingsCardProps) {
  const [keys, setKeys] = useState<ApiKeyItem[]>(INITIAL_KEYS);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mfaEnforced, setMfaEnforced] = useState(true);
  const [ipWhitelist, setIpWhitelist] = useState("192.168.1.0/24, 10.0.0.0/8");

  const handleCopy = (id: string, prefix: string) => {
    navigator.clipboard.writeText(prefix);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRevoke = (id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Card 1: API Keys Management */}
      <div className="p-6 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#171a27]">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-[#dfba82]" />
            <h3 className="text-base font-semibold text-[#f4efe6]">Workspace API Keys</h3>
          </div>
          <button
            type="button"
            onClick={onOpenGenerateKey}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Generate New Key</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#171a27] text-[#6e7387] font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-medium">Key Name</th>
                <th className="pb-3 font-medium">Token Preview</th>
                <th className="pb-3 font-medium">Permission Scope</th>
                <th className="pb-3 font-medium">Last Used</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#151826]">
              {keys.map((k) => (
                <tr key={k.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 pr-4">
                    <div className="font-semibold text-white tracking-tight">{k.name}</div>
                    <div className="text-[10px] text-[#73788c]">Created {k.created}</div>
                  </td>
                  <td className="py-3.5 pr-4 font-mono text-[#dfba82]">
                    {k.keyPrefix}
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className="px-2 py-0.5 rounded-full bg-[#141724] border border-[#232738] text-[10.5px] text-[#c5c9d6]">
                      {k.role}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-[#8e93a6] font-mono">{k.lastUsed}</td>
                  <td className="py-3.5 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(k.id, k.keyPrefix)}
                      className="p-1.5 rounded-lg border border-[#232738] hover:border-[#dfba82]/40 text-[#c5c9d6] hover:text-white transition-colors cursor-pointer"
                      title="Copy Key"
                    >
                      {copiedId === k.id ? <Check className="w-3.5 h-3.5 text-[#4ade80]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRevoke(k.id)}
                      className="p-1.5 rounded-lg border border-[#232738] hover:border-[#ef4444]/40 text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors cursor-pointer"
                      title="Revoke Key"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card 2: Security & Authentication */}
      <div className="p-6 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-[#171a27]">
          <Shield className="w-4 h-4 text-[#dfba82]" />
          <h3 className="text-base font-semibold text-[#f4efe6]">Access & Authentication Control</h3>
        </div>

        <div className="space-y-4 text-xs">
          {/* Toggle: Mandatory MFA */}
          <div className="p-3.5 bg-[#111320] border border-[#1b1e2e] rounded-xl flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-[#dfba82]" />
                <span>Enforce Mandatory Two-Factor Authentication (2FA)</span>
              </div>
              <p className="text-[10.5px] text-[#73788c]">
                Require TOTP authenticator app verification on all admin logins.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMfaEnforced(!mfaEnforced)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                mfaEnforced ? "bg-[#dfba82]" : "bg-[#232738]"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-[#07080c] transition-transform ${
                  mfaEnforced ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-[11.5px] font-medium text-[#b0b5c7] mb-1">
              IP Address Ingestion Whitelist (CIDR blocks)
            </label>
            <div className="flex items-center bg-[#131624] border border-[#23273a] rounded-xl px-3.5 py-2 text-xs text-white">
              <Globe className="w-3.5 h-3.5 text-[#dfba82] mr-2 shrink-0" />
              <input
                type="text"
                value={ipWhitelist}
                onChange={(e) => setIpWhitelist(e.target.value)}
                className="bg-transparent focus:outline-none flex-1 font-mono"
              />
            </div>
            <p className="text-[10.5px] text-[#73788c] mt-1">
              Requests originating from non-whitelisted IPs will be rejected by the proxy gateway.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
