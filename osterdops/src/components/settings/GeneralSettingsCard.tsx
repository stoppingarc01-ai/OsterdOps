"use client";

import React, { useState } from "react";
import { Building, ShieldCheck, Lock, Upload } from "lucide-react";

export function GeneralSettingsCard() {
  const [orgName, setOrgName] = useState("Acme Corp Inc.");
  const [slug, setSlug] = useState("acme-corp");
  const [email, setEmail] = useState("billing@acmecorp.com");
  const [currency, setCurrency] = useState("USD ($)");
  const [timezone, setTimezone] = useState("America/Los_Angeles (UTC-07:00)");
  const [retention, setRetention] = useState("90");
  const [piiScrubbing, setPiiScrubbing] = useState(true);
  const [ipAnonymization, setIpAnonymization] = useState(true);

  return (
    <div className="space-y-6">
      {/* Card 1: Organization Profile */}
      <div className="p-6 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-[#171a27]">
          <Building className="w-4 h-4 text-[#dfba82]" />
          <h3 className="text-base font-semibold text-[#f4efe6]">Organization Profile</h3>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Logo Badge */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#dfba82]/20 to-[#b8860b]/30 border border-[#dfba82]/40 flex items-center justify-center text-[#dfba82] font-extrabold text-xl shrink-0 shadow-[0_0_15px_rgba(223,186,130,0.2)]">
            AC
          </div>
          <div className="space-y-1">
            <div className="text-sm font-semibold text-white">Workspace Brand Monogram</div>
            <p className="text-xs text-[#73788c]">PNG, SVG, or JPG up to 2MB. Appears in reports and invoice headers.</p>
            <button
              type="button"
              className="mt-2 px-3 py-1.5 rounded-lg bg-[#141726] border border-[#232738] hover:border-[#dfba82]/40 text-[#c5c9d6] hover:text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#dfba82]" />
              <span>Upload New Logo</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-[11.5px] font-medium text-[#b0b5c7] mb-1">
              Organization Name
            </label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full bg-[#131624] border border-[#23273a] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#dfba82]"
            />
          </div>

          <div>
            <label className="block text-[11.5px] font-medium text-[#b0b5c7] mb-1">
              Workspace URL Slug
            </label>
            <div className="flex items-center bg-[#131624] border border-[#23273a] rounded-xl px-3.5 py-2 text-xs text-white">
              <span className="text-[#656a7d] mr-1">osterdops.io/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="bg-transparent focus:outline-none flex-1 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11.5px] font-medium text-[#b0b5c7] mb-1">
              Primary Billing & Finance Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#131624] border border-[#23273a] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#dfba82]"
            />
          </div>

          <div>
            <label className="block text-[11.5px] font-medium text-[#b0b5c7] mb-1">
              Reporting Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-[#131624] border border-[#23273a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="USD ($)">USD ($) - US Dollar</option>
              <option value="EUR (€)">EUR (€) - Euro</option>
              <option value="GBP (£)">GBP (£) - British Pound</option>
              <option value="JPY (¥)">JPY (¥) - Japanese Yen</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11.5px] font-medium text-[#b0b5c7] mb-1">
              Primary Workspace Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full bg-[#131624] border border-[#23273a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="America/Los_Angeles (UTC-07:00)">America/Los_Angeles (Pacific Time UTC-07:00)</option>
              <option value="America/New_York (UTC-04:00)">America/New_York (Eastern Time UTC-04:00)</option>
              <option value="Europe/London (UTC+01:00)">Europe/London (UTC+01:00)</option>
              <option value="Asia/Tokyo (UTC+09:00)">Asia/Tokyo (UTC+09:00)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Card 2: Data Retention & Privacy */}
      <div className="p-6 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-[#171a27]">
          <ShieldCheck className="w-4 h-4 text-[#dfba82]" />
          <h3 className="text-base font-semibold text-[#f4efe6]">Telemetry Data Retention & Privacy</h3>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-[11.5px] font-medium text-[#b0b5c7] mb-1">
              Raw Prompt & Token Span Retention
            </label>
            <select
              value={retention}
              onChange={(e) => setRetention(e.target.value)}
              className="w-full sm:w-80 bg-[#131624] border border-[#23273a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="30">30 Days</option>
              <option value="90">90 Days (Growth Plan Default)</option>
              <option value="365">1 Year (Scale Plan)</option>
              <option value="unlimited">Unlimited (Enterprise Custom)</option>
            </select>
            <p className="text-[11px] text-[#73788c] mt-1">
              Historical cost aggregations and high-level charts remain preserved indefinitely.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {/* Toggle 1: PII Scrubbing */}
            <div className="p-3 bg-[#111320] border border-[#1b1e2e] rounded-xl flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-[#3b82f6]" />
                  <span>Automatic Prompt PII Masking</span>
                </div>
                <p className="text-[10.5px] text-[#73788c]">
                  Redact SSNs, credit card numbers, and email addresses prior to log storage.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPiiScrubbing(!piiScrubbing)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                  piiScrubbing ? "bg-[#dfba82]" : "bg-[#232738]"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-[#07080c] transition-transform ${
                    piiScrubbing ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: IP Anonymization */}
            <div className="p-3 bg-[#111320] border border-[#1b1e2e] rounded-xl flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-[#10b981]" />
                  <span>Developer Client IP Anonymization</span>
                </div>
                <p className="text-[10.5px] text-[#73788c]">
                  Hash developer IP addresses in compliance with GDPR and CCPA standards.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIpAnonymization(!ipAnonymization)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                  ipAnonymization ? "bg-[#dfba82]" : "bg-[#232738]"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-[#07080c] transition-transform ${
                    ipAnonymization ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
