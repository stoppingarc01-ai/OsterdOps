"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { Settings, Building2, Users, Shield, Bell, Lock, KeyRound, Save } from "lucide-react";
import { RbacGuard } from "@/components/auth/RbacGuard";

export default function DashboardSettingsPage() {
  const [sessionTimeout, setSessionTimeout] = useState("1440");
  const [enforceExpiry, setEnforceExpiry] = useState(true);
  const [expiryDays, setExpiryDays] = useState("90");
  const [allowedOrigins, setAllowedOrigins] = useState("https://app.osterdops.com, https://api.osterdops.com");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6 max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#dfba82] tracking-wider uppercase mb-1">
                  <Settings className="w-3.5 h-3.5" />
                  Organization Policy
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  Workspace & Security Settings
                </h1>
              </div>

              <RbacGuard permission="org:settings:manage">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#dfba82] text-black text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-[0_0_15px_rgba(223,186,130,0.2)]"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saved ? "Settings Saved!" : "Save Changes"}
                </button>
              </RbacGuard>
            </div>

            {/* Organization Profile */}
            <div className="p-6 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#f4efe6]">
                <Building2 className="w-4 h-4 text-[#dfba82]" />
                Organization Identity
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[#8e93a6] block mb-1">Workspace Name</label>
                  <input
                    type="text"
                    defaultValue="OsterdOps AI Corp"
                    className="w-full p-2.5 rounded-lg bg-[#111422] border border-[#1d2136] text-white outline-none focus:border-[#dfba82]"
                  />
                </div>
                <div>
                  <label className="text-[#8e93a6] block mb-1">Organization ID</label>
                  <input
                    type="text"
                    disabled
                    defaultValue="org_enterprise_2026"
                    className="w-full p-2.5 rounded-lg bg-[#111422] border border-[#1d2136] text-[#73788c] font-mono cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Security Hardening Settings */}
            <div className="p-6 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#f4efe6]">
                <Shield className="w-4 h-4 text-[#dfba82]" />
                Enterprise Security Controls
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-[#8e93a6] block mb-1">Session Inactivity Timeout (Minutes)</label>
                  <input
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="w-full sm:w-64 p-2.5 rounded-lg bg-[#111422] border border-[#1d2136] text-white outline-none focus:border-[#dfba82]"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="enforceExpiry"
                    checked={enforceExpiry}
                    onChange={(e) => setEnforceExpiry(e.target.checked)}
                    className="rounded border-[#1d2136] text-[#dfba82] focus:ring-0"
                  />
                  <label htmlFor="enforceExpiry" className="text-white font-medium">
                    Enforce Mandatory API Key Expiration Window
                  </label>
                </div>

                {enforceExpiry && (
                  <div>
                    <label className="text-[#8e93a6] block mb-1">Default Expiration Threshold (Days)</label>
                    <input
                      type="number"
                      value={expiryDays}
                      onChange={(e) => setExpiryDays(e.target.value)}
                      className="w-full sm:w-64 p-2.5 rounded-lg bg-[#111422] border border-[#1d2136] text-white outline-none focus:border-[#dfba82]"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[#8e93a6] block mb-1">Allowed CORS / API Origins (Comma Separated)</label>
                  <input
                    type="text"
                    value={allowedOrigins}
                    onChange={(e) => setAllowedOrigins(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#111422] border border-[#1d2136] text-white font-mono outline-none focus:border-[#dfba82]"
                  />
                </div>
              </div>
            </div>
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}
