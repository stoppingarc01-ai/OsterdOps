"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import {
  Building2,
  Save,
  CheckCircle2,
  Globe,
  Mail,
  Shield,
  Layers,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { RbacGuard } from "@/components/auth/RbacGuard";

export default function OrganizationSettingsPage() {
  const { currentOrg } = useAuth();
  const [orgName, setOrgName] = useState(currentOrg?.name || "OsterdOps Enterprise");
  const [supportEmail, setSupportEmail] = useState("support@osterdops.com");
  const [defaultCurrency, setDefaultCurrency] = useState("USD ($)");
  const [timezone, setTimezone] = useState("UTC (Coordinated Universal Time)");
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
                  <Building2 className="w-3.5 h-3.5" />
                  Organization Settings
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  Profile & Defaults
                </h1>
                <p className="text-xs text-[#8e93a6] mt-1">
                  Configure organization branding, legal entity details, default currency, and operational timezone.
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
              <div className="p-6 rounded-2xl bg-[#0c0e17] border border-[#1e2234] space-y-4">
                <h3 className="text-sm font-bold text-white font-serif">General Information</h3>

                <div>
                  <label className="block text-xs font-semibold text-[#8e93a6] mb-1">Organization Display Name</label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full bg-[#141724] border border-[#24283b] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-[#5d6278] focus:outline-none focus:border-[#dfba82]/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8e93a6] mb-1">Administrative & Support Email</label>
                  <input
                    type="email"
                    required
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full bg-[#141724] border border-[#24283b] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-[#5d6278] focus:outline-none focus:border-[#dfba82]/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#8e93a6] mb-1">Reporting Currency</label>
                    <input
                      type="text"
                      disabled
                      value={defaultCurrency}
                      className="w-full bg-[#10121d] border border-[#1d2030] rounded-lg px-3.5 py-2.5 text-xs text-[#71768a] cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8e93a6] mb-1">Operational Timezone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full bg-[#141724] border border-[#24283b] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#dfba82]/50"
                    >
                      <option value="UTC (Coordinated Universal Time)">UTC (Coordinated Universal Time)</option>
                      <option value="America/New_York (EST)">America/New_York (EST)</option>
                      <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                      <option value="Asia/Tokyo (JST)">Asia/Tokyo (JST)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  {isSaved && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      Settings successfully updated
                    </span>
                  )}
                </div>

                <RbacGuard permission="org:settings:manage">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#dfba82] to-[#c79d60] text-black font-semibold text-xs shadow-[0_0_20px_rgba(223,186,130,0.2)] hover:opacity-95 transition-opacity cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Changes
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
