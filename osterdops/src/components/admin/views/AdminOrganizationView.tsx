"use client";

import React, { useEffect, useState } from "react";
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
import { useAuth } from "@/context/AuthContext";

export function AdminOrganizationView() {
  const { currentOrg, user } = useAuth();
  const [name, setName] = useState(currentOrg?.name || "Workspace");
  const [slug, setSlug] = useState(currentOrg?.slug || "workspace");
  const [primaryDomain, setPrimaryDomain] = useState(`${currentOrg?.slug || "workspace"}.osterdops.com`);
  const [tier, setTier] = useState(currentOrg?.planTier ? `${currentOrg.planTier.toUpperCase()} Tier` : "Free Tier");
  const [status, setStatus] = useState("ACTIVE");
  const [defaultRateLimit, setDefaultRateLimit] = useState(500);
  const [defaultSpendLimit, setDefaultSpendLimit] = useState(1000);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (currentOrg) {
      setName(currentOrg.name || "Workspace");
      setSlug(currentOrg.slug || "workspace");
      setPrimaryDomain(`${currentOrg.slug || "workspace"}.osterdops.com`);
      setTier(currentOrg.planTier ? `${currentOrg.planTier.toUpperCase()} Tier` : "Free Tier");
    }
  }, [currentOrg]);

  const orgId = currentOrg?.id || "org_default";

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
            <div className="flex items-center gap-2 text-xs text-[#8e93a6] mt-1 font-mono">
              <span>ID: {orgId}</span>
              <button
                type="button"
                onClick={handleCopyOrgId}
                className="hover:text-[#dfba82] transition-colors cursor-pointer"
                title="Copy Org ID"
              >
                {copied ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-[#141824] border border-[#232c40] text-xs font-semibold text-[#dfba82]">
            {tier}
          </span>
        </div>
      </div>

      {/* Organization Details Form */}
      <form onSubmit={handleSave} className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-6 space-y-5">
        <h3 className="text-sm font-bold text-white border-b border-[#171b26] pb-3">
          Workspace Identity &amp; Routing Isolation
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#8e93a6] mb-1">
              Organization Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#111422] border border-[#1b202e] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#555a6d] focus:outline-none focus:border-[#dfba82]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8e93a6] mb-1">
              Organization Slug (URL Subdomain)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-[#111422] border border-[#1b202e] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#555a6d] focus:outline-none focus:border-[#dfba82] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8e93a6] mb-1">
              Primary Routing Domain
            </label>
            <input
              type="text"
              value={primaryDomain}
              onChange={(e) => setPrimaryDomain(e.target.value)}
              className="w-full bg-[#111422] border border-[#1b202e] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#555a6d] focus:outline-none focus:border-[#dfba82]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8e93a6] mb-1">
              Default Project Spend Limit (USD)
            </label>
            <input
              type="number"
              value={defaultSpendLimit}
              onChange={(e) => setDefaultSpendLimit(Number(e.target.value))}
              className="w-full bg-[#111422] border border-[#1b202e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#dfba82] font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#171b26]">
          {savedSuccess ? (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Changes saved successfully
            </span>
          ) : (
            <div />
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 bg-[#dfba82] hover:bg-[#ebd2a9] text-black font-semibold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
