"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { Bell, ArrowLeft, Save, Mail, MessageSquare, AlertOctagon, Check } from "lucide-react";
import Link from "next/link";
import { RbacGuard } from "@/components/auth/RbacGuard";

export default function NotificationPreferencesPage() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slackWebhook, setSlackWebhook] = useState("https://hooks.slack.com/services/T00/B00/XXXX");
  const [pagerDutyKey, setPagerDutyKey] = useState("");
  const [budget50, setBudget50] = useState(true);
  const [budget75, setBudget75] = useState(true);
  const [budget90, setBudget90] = useState(true);
  const [securityCritical, setSecurityCritical] = useState(true);
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
            <Link
              href="/dashboard/notifications"
              className="inline-flex items-center gap-1.5 text-xs text-[#8e93a6] hover:text-[#dfba82] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Notifications
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#dfba82] tracking-wider uppercase mb-1">
                  <Bell className="w-3.5 h-3.5" />
                  Dispatch Channels
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  Notification & Webhook Preferences
                </h1>
              </div>

              <RbacGuard permission="notifications:manage">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#dfba82] text-black text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-[0_0_15px_rgba(223,186,130,0.2)]"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saved ? "Saved!" : "Save Preferences"}
                </button>
              </RbacGuard>
            </div>

            {/* Channels */}
            <div className="p-6 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-4">
              <div className="text-sm font-bold text-white">Delivery Channels</div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="email"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="rounded border-[#1d2136] text-[#dfba82] focus:ring-0"
                  />
                  <label htmlFor="email" className="text-white font-medium flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#dfba82]" />
                    Email Notifications to Workspace Administrators
                  </label>
                </div>

                <div className="pt-2">
                  <label className="text-[#8e93a6] block mb-1 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#dfba82]" />
                    Slack Incoming Webhook URL
                  </label>
                  <input
                    type="text"
                    value={slackWebhook}
                    onChange={(e) => setSlackWebhook(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#111422] border border-[#1d2136] text-white font-mono outline-none focus:border-[#dfba82]"
                  />
                </div>
              </div>
            </div>

            {/* Threshold Subscriptions */}
            <div className="p-6 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-4">
              <div className="text-sm font-bold text-white">Alert Trigger Subscriptions</div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="b75"
                    checked={budget75}
                    onChange={(e) => setBudget75(e.target.checked)}
                    className="rounded border-[#1d2136] text-[#dfba82] focus:ring-0"
                  />
                  <label htmlFor="b75" className="text-white">
                    75% Budget Warning Threshold
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="b90"
                    checked={budget90}
                    onChange={(e) => setBudget90(e.target.checked)}
                    className="rounded border-[#1d2136] text-[#dfba82] focus:ring-0"
                  />
                  <label htmlFor="b90" className="text-white">
                    90% Budget Critical Threshold
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="sec"
                    checked={securityCritical}
                    onChange={(e) => setSecurityCritical(e.target.checked)}
                    className="rounded border-[#1d2136] text-[#dfba82] focus:ring-0"
                  />
                  <label htmlFor="sec" className="text-rose-400 font-medium">
                    Critical Security Incident Alerts (Cross-Tenant, Auth Spikes)
                  </label>
                </div>
              </div>
            </div>
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}
