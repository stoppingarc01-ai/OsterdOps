"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import {
  Sliders,
  Save,
  CheckCircle2,
  Code2,
  Workflow,
  Shield,
  Layers,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { RbacGuard } from "@/components/auth/RbacGuard";

export default function ApiSettingsPage() {
  const [defaultApiVersion, setDefaultApiVersion] = useState("v1");
  const [rateLimitNotificationThreshold, setRateLimitNotificationThreshold] = useState(80);
  const [webhookUrl, setWebhookUrl] = useState("https://api.company.com/webhooks/osterdops");
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
                  <Sliders className="w-3.5 h-3.5" />
                  Developer & API Configuration
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  API Versioning & Gateway Defaults
                </h1>
                <p className="text-xs text-[#8e93a6] mt-1">
                  Configure active API version pinning, rate limit notification thresholds, and global webhook listeners.
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
              {/* Versioning & Protocol */}
              <div className="p-6 rounded-2xl bg-[#0c0e17] border border-[#1e2234] space-y-4">
                <h3 className="text-sm font-bold text-white font-serif flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#dfba82]" />
                  API Version Pinning
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-[#8e93a6] mb-1">Default API Version</label>
                  <select
                    value={defaultApiVersion}
                    onChange={(e) => setDefaultApiVersion(e.target.value)}
                    className="w-full bg-[#141724] border border-[#24283b] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#dfba82]/50 font-mono"
                  >
                    <option value="v1">v1 (Current Stable Release)</option>
                  </select>
                  <p className="text-[11px] text-[#71768a] mt-1">Requests without explicit <code>x-api-version</code> header inherit this pinned version.</p>
                </div>
              </div>

              {/* Rate Limits & Quotas */}
              <div className="p-6 rounded-2xl bg-[#0c0e17] border border-[#1e2234] space-y-4">
                <h3 className="text-sm font-bold text-white font-serif flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#dfba82]" />
                  Gateway Quota & Rate Limit Alerts
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-[#8e93a6] mb-1">
                    Rate Limit Warning Threshold ({rateLimitNotificationThreshold}% of Sliding Window)
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    step="5"
                    value={rateLimitNotificationThreshold}
                    onChange={(e) => setRateLimitNotificationThreshold(Number(e.target.value))}
                    className="w-full accent-[#dfba82] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[#71768a] mt-1">
                    <span>50% (Early Warning)</span>
                    <span className="text-[#dfba82] font-bold">{rateLimitNotificationThreshold}%</span>
                    <span>95% (Near Exhaustion)</span>
                  </div>
                </div>
              </div>

              {/* Webhooks Callback */}
              <div className="p-6 rounded-2xl bg-[#0c0e17] border border-[#1e2234] space-y-4">
                <h3 className="text-sm font-bold text-white font-serif flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-[#dfba82]" />
                  Global Webhook Notification URL
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-[#8e93a6] mb-1">HTTPS Callback Endpoint</label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full bg-[#141724] border border-[#24283b] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-[#5d6278] focus:outline-none focus:border-[#dfba82]/50 font-mono"
                  />
                  <p className="text-[11px] text-[#71768a] mt-1">All events will be signed with HMAC-SHA256 and sent to this endpoint.</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  {isSaved && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      API settings updated
                    </span>
                  )}
                </div>

                <RbacGuard permission="org:settings:manage">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#dfba82] to-[#c79d60] text-black font-semibold text-xs shadow-[0_0_20px_rgba(223,186,130,0.2)] hover:opacity-95 transition-opacity cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Settings
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
