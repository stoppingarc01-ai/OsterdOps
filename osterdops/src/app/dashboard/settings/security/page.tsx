"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import {
  Shield,
  Save,
  CheckCircle2,
  Lock,
  Clock,
  Globe,
  KeyRound,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { RbacGuard } from "@/components/auth/RbacGuard";

export default function SecuritySettingsPage() {
  const [sessionTimeoutHours, setSessionTimeoutHours] = useState(12);
  const [apiKeyMaxAgeDays, setApiKeyMaxAgeDays] = useState(90);
  const [enforceMfa, setEnforceMfa] = useState(true);
  const [ipWhitelist, setIpWhitelist] = useState("0.0.0.0/0 (Global Access)");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6">
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center gap-1.5 text-xs text-[#8e93a6] hover:text-[#dfba82] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Settings
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#dfba82] tracking-wider uppercase mb-1">
                  <Shield className="w-3.5 h-3.5" />
                  Governance & Security
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  Security Policies & Session Controls
                </h1>
                <p className="text-xs text-[#8e93a6] mt-1">
                  Enforce organization-wide multi-factor authentication, session expiration, and credential lifetime policies.
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
              {/* Session Security */}
              <div className="p-6 rounded-2xl bg-[#0c0e17] border border-[#1e2234] space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-white font-serif">
                  <Clock className="w-4 h-4 text-[#dfba82]" />
                  Session Lifetime & Inactivity Timeout
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8e93a6] mb-1">
                    Dashboard Inactivity Expiration (Hours)
                  </label>
                  <select
                    value={sessionTimeoutHours}
                    onChange={(e) => setSessionTimeoutHours(Number(e.target.value))}
                    className="w-full bg-[#141724] border border-[#24283b] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#dfba82]/50"
                  >
                    <option value={1}>1 Hour (High Security)</option>
                    <option value={4}>4 Hours</option>
                    <option value={12}>12 Hours (Recommended)</option>
                    <option value={24}>24 Hours</option>
                  </select>
                </div>
              </div>

              {/* API Key Lifecycles */}
              <div className="p-6 rounded-2xl bg-[#0c0e17] border border-[#1e2234] space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-white font-serif">
                  <KeyRound className="w-4 h-4 text-[#dfba82]" />
                  API Key Expiration & Rotation Policy
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8e93a6] mb-1">
                    Maximum API Key Lifetime (Days)
                  </label>
                  <select
                    value={apiKeyMaxAgeDays}
                    onChange={(e) => setApiKeyMaxAgeDays(Number(e.target.value))}
                    className="w-full bg-[#141724] border border-[#24283b] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#dfba82]/50"
                  >
                    <option value={30}>30 Days</option>
                    <option value={60}>60 Days</option>
                    <option value={90}>90 Days (Enterprise Standard)</option>
                    <option value={180}>180 Days</option>
                    <option value={365}>365 Days</option>
                  </select>
                </div>
              </div>

              {/* MFA & Network Restrictions */}
              <div className="p-6 rounded-2xl bg-[#0c0e17] border border-[#1e2234] space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-white font-serif">
                  <Lock className="w-4 h-4 text-[#dfba82]" />
                  Multi-Factor Authentication & Network Access
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#141724] border border-[#202438]">
                  <div>
                    <div className="text-xs font-semibold text-white">Require Multi-Factor Authentication (MFA)</div>
                    <div className="text-[11px] text-[#71768a]">Mandatory TOTP/Hardware key for all organization members.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enforceMfa}
                    onChange={(e) => setEnforceMfa(e.target.checked)}
                    className="w-4 h-4 accent-[#dfba82] cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8e93a6] mb-1">IP CIDR Allowlist</label>
                  <input
                    type="text"
                    value={ipWhitelist}
                    onChange={(e) => setIpWhitelist(e.target.value)}
                    className="w-full bg-[#141724] border border-[#24283b] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-[#5d6278] focus:outline-none focus:border-[#dfba82]/50 font-mono"
                  />
                  <p className="text-[11px] text-[#71768a] mt-1">Specify comma-separated CIDR blocks to restrict dashboard and gateway traffic.</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  {isSaved && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      Security policies saved
                    </span>
                  )}
                </div>

                <RbacGuard permission="org:settings:manage">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#dfba82] to-[#c79d60] text-black font-semibold text-xs shadow-[0_0_20px_rgba(223,186,130,0.2)] hover:opacity-95 transition-opacity cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Apply Policies
                  </button>
                </RbacGuard>
              </div>
            </form>
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}
