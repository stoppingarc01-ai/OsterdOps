"use client";

import React, { useState } from "react";
import {
  Building2,
  CheckCircle2,
  Copy,
  Globe,
  HardDrive,
  Lock,
  Save,
  Shield,
  Sparkles,
} from "lucide-react";

export function AdminOrganizationView() {
  const [name, setName] = useState("Acme Enterprises");
  const [slug, setSlug] = useState("acme-enterprises");
  const [primaryDomain, setPrimaryDomain] = useState("acme.com");
  const [tier, setTier] = useState("Enterprise Scale");
  const [status, setStatus] = useState("ACTIVE");
  const [defaultRateLimit, setDefaultRateLimit] = useState(500);
  const [defaultSpendLimit, setDefaultSpendLimit] = useState(1000);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const orgId = "org_acme_corp_live_094";

  const handleCopyOrgId = () => {
    navigator.clipboard.writeText(orgId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Organization Header & Metadata Banner */}
      <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#dfba82]/20 to-[#b38e56]/10 border border-[#dfba82]/30 flex items-center justify-center text-[#dfba82]">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-serif">{name}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                {status}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#8e93a6] mt-1 font-mono">
              <span>ID: {orgId}</span>
              <button
                onClick={handleCopyOrgId}
                className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                title="Copy Organization ID"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-[#8e93a6]">Plan Tier</div>
            <div className="text-sm font-semibold text-[#dfba82]">{tier}</div>
          </div>
          <div className="h-8 w-px bg-[#1b202e] mx-2" />
          <div className="text-right">
            <div className="text-xs text-[#8e93a6]">Created</div>
            <div className="text-sm font-semibold text-white">Jan 12, 2025</div>
          </div>
        </div>
      </div>

      {/* Organization Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-6 space-y-6">
          <h3 className="text-sm font-bold text-white border-b border-[#171b26] pb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#dfba82]" />
            Organization Profile
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#8e93a6] mb-1.5">
                Organization Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#07080c] border border-[#1b202e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#dfba82]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8e93a6] mb-1.5">
                Organization URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-[#07080c] border border-[#1b202e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#dfba82]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8e93a6] mb-1.5">
                Primary Authorized Domain
              </label>
              <input
                type="text"
                value={primaryDomain}
                onChange={(e) => setPrimaryDomain(e.target.value)}
                className="w-full bg-[#07080c] border border-[#1b202e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#dfba82]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8e93a6] mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#07080c] border border-[#1b202e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#dfba82]"
              >
                <option value="ACTIVE">ACTIVE — Normal Operations</option>
                <option value="SUSPENDED">SUSPENDED — Read Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Global Project Defaults */}
        <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-6 space-y-6">
          <h3 className="text-sm font-bold text-white border-b border-[#171b26] pb-3 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[#dfba82]" />
            Default Project Governance Bounds
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#8e93a6] mb-1.5">
                Default Rate Limit (Requests per Minute)
              </label>
              <input
                type="number"
                value={defaultRateLimit}
                onChange={(e) => setDefaultRateLimit(Number(e.target.value))}
                className="w-full bg-[#07080c] border border-[#1b202e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#dfba82]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8e93a6] mb-1.5">
                Default Project Monthly Spend Limit ($USD)
              </label>
              <input
                type="number"
                value={defaultSpendLimit}
                onChange={(e) => setDefaultSpendLimit(Number(e.target.value))}
                className="w-full bg-[#07080c] border border-[#1b202e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#dfba82]"
              />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-[#8e93a6]">
            Server-side mutations are verified with audit log entries.
          </div>
          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Changes saved
              </span>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-[#dfba82] hover:bg-[#ebd2a9] text-black font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save Settings"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
