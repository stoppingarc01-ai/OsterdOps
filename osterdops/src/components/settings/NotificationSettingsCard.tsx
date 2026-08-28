"use client";

import React, { useState } from "react";
import { Bell, Mail, MessageSquare, AlertTriangle } from "lucide-react";

export function NotificationSettingsCard() {
  const [slackAlerts, setSlackAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);
  const [pagerDuty, setPagerDuty] = useState(true);
  const [spikeThreshold, setSpikeThreshold] = useState("25");

  return (
    <div className="space-y-6">
      {/* Card 1: Notification Channels */}
      <div className="p-6 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-[#171a27]">
          <Bell className="w-4 h-4 text-[#dfba82]" />
          <h3 className="text-base font-semibold text-[#f4efe6]">Alert & Notification Channels</h3>
        </div>

        <div className="space-y-3 text-xs">
          {/* Channel 1: Slack */}
          <div className="p-3.5 bg-[#111320] border border-[#1b1e2e] rounded-xl flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#ec4899]" />
                <span>Slack Instant Dispatch (#ai-cost-alerts)</span>
              </div>
              <p className="text-[10.5px] text-[#73788c]">
                Send real-time alerts when hourly spend surges or budget caps reach 85%.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSlackAlerts(!slackAlerts)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                slackAlerts ? "bg-[#dfba82]" : "bg-[#232738]"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-[#07080c] transition-transform ${
                  slackAlerts ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Channel 2: Email Digest */}
          <div className="p-3.5 bg-[#111320] border border-[#1b1e2e] rounded-xl flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#3b82f6]" />
                <span>Weekly Executive PDF Digest</span>
              </div>
              <p className="text-[10.5px] text-[#73788c]">
                Send Monday morning cost summary reports to executive stakeholders.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEmailDigest(!emailDigest)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                emailDigest ? "bg-[#dfba82]" : "bg-[#232738]"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-[#07080c] transition-transform ${
                  emailDigest ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Channel 3: PagerDuty */}
          <div className="p-3.5 bg-[#111320] border border-[#1b1e2e] rounded-xl flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#10b981]" />
                <span>PagerDuty Incident Escalation</span>
              </div>
              <p className="text-[10.5px] text-[#73788c]">
                Trigger high-priority on-call incident when an active runaway loop is detected.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPagerDuty(!pagerDuty)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                pagerDuty ? "bg-[#dfba82]" : "bg-[#232738]"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-[#07080c] transition-transform ${
                  pagerDuty ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Card 2: Anomaly Sensitivity */}
      <div className="p-6 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#171a27]">
          <AlertTriangle className="w-4 h-4 text-[#dfba82]" />
          <h3 className="text-base font-semibold text-[#f4efe6]">Anomaly Detection Sensitivity</h3>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-[11.5px] font-medium text-[#b0b5c7] mb-1">
              Hourly Spend Spike Alert Threshold (% increase vs 7-day rolling average)
            </label>
            <select
              value={spikeThreshold}
              onChange={(e) => setSpikeThreshold(e.target.value)}
              className="w-full sm:w-80 bg-[#131624] border border-[#23273a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="15">15% Spike (High Sensitivity)</option>
              <option value="25">25% Spike (Recommended Default)</option>
              <option value="50">50% Spike (Low Sensitivity)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
