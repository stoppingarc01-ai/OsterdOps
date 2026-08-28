"use client";

import React, { useState } from "react";
import { AlertTriangle, Check, Key, Lock, RefreshCw, Save, Send, Server, Shield, Sliders } from "lucide-react";

export function AdminSettingsView() {
  const [saved, setSaved] = useState(false);
  const [circuitBreakerThreshold, setCircuitBreakerThreshold] = useState("100");
  const [rateLimitRps, setRateLimitRps] = useState("500");
  const [encryptionAlgorithm] = useState("AES-256-GCM");
  const [logRetentionDays, setLogRetentionDays] = useState("365");
  const [webhookUrl, setWebhookUrl] = useState("https://hooks.slack.com/services/T000/B000/XXXXX");
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookTestSuccess, setWebhookTestSuccess] = useState(false);
  const [isRotatingKey, setIsRotatingKey] = useState(false);
  const [keyRotatedSuccess, setKeyRotatedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTestWebhook = () => {
    setIsTestingWebhook(true);
    setTimeout(() => {
      setIsTestingWebhook(false);
      setWebhookTestSuccess(true);
      setTimeout(() => setWebhookTestSuccess(false), 2500);
    }, 600);
  };

  const handleRotateEncryptionKey = () => {
    if (confirm("Rotate Master AES-256-GCM Keystore? This will re-encrypt all stored upstream API keys.")) {
      setIsRotatingKey(true);
      setTimeout(() => {
        setIsRotatingKey(false);
        setKeyRotatedSuccess(true);
        setTimeout(() => setKeyRotatedSuccess(false), 2500);
      }, 1000);
    }
  };

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold text-[#f4efe6] tracking-tight">
            System &amp; Gateway Settings
          </h2>
          <p className="text-[12.5px] text-[#717688] mt-0.5">
            Global security parameters, rate limit bounds, and platform infrastructure configurations.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Gateway Sentinel */}
        <div className="bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1b202e] text-[#dfba82] font-semibold text-[14px]">
            <Server className="h-4 w-4" />
            <span>AI Gateway Sentinel Policies</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[12px] font-semibold text-[#8e94a8] mb-1.5">
                Global Gateway Rate Limit (RPS per organization)
              </label>
              <input
                type="text"
                value={rateLimitRps}
                onChange={(e) => setRateLimitRps(e.target.value)}
                className="w-full bg-[#131722] border border-[#22283a] text-white text-[13px] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#dfba82]"
              />
              <p className="text-[11px] text-[#555a6d] mt-1">Default 500 requests per second with token bucket algorithm.</p>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#8e94a8] mb-1.5">
                Hard Budget Circuit Breaker Threshold (%)
              </label>
              <input
                type="text"
                value={circuitBreakerThreshold}
                onChange={(e) => setCircuitBreakerThreshold(e.target.value)}
                className="w-full bg-[#131722] border border-[#22283a] text-white text-[13px] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#dfba82]"
              />
              <p className="text-[11px] text-[#555a6d] mt-1">Immediately return 429 Too Many Requests once limit is reached.</p>
            </div>
          </div>
        </div>

        {/* Webhooks & Alerts */}
        <div className="bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1b202e] text-[#dfba82] font-semibold text-[14px]">
            <Send className="h-4 w-4" />
            <span>Emergency Alert Webhooks</span>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#8e94a8] mb-1.5">
              Incident Alert Webhook URL (Slack / PagerDuty)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full bg-[#131722] border border-[#22283a] text-white font-mono text-[12.5px] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#dfba82]"
              />
              <button
                type="button"
                onClick={handleTestWebhook}
                disabled={isTestingWebhook}
                className="px-4 py-2.5 bg-[#141824] hover:bg-[#1f2638] border border-[#263148] text-[#dfba82] text-[12px] font-bold rounded-xl whitespace-nowrap cursor-pointer transition-colors"
              >
                {isTestingWebhook ? "Sending..." : webhookTestSuccess ? "Delivered ✓" : "Test Ping"}
              </button>
            </div>
          </div>
        </div>

        {/* Encryption & Compliance */}
        <div className="bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#1b202e]">
            <div className="flex items-center gap-2 text-[#dfba82] font-semibold text-[14px]">
              <Lock className="h-4 w-4" />
              <span>Encryption &amp; Keystore Safeguards</span>
            </div>

            <button
              type="button"
              onClick={handleRotateEncryptionKey}
              disabled={isRotatingKey}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#141824] hover:bg-[#1f2638] border border-[#2b354c] text-[#dfba82] text-[11.5px] font-medium rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 ${isRotatingKey ? "animate-spin" : ""}`} />
              <span>{keyRotatedSuccess ? "Keys Re-Encrypted ✓" : "Rotate AES Master Key"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[12px] font-semibold text-[#8e94a8] mb-1.5">
                Credential Encryption Standard
              </label>
              <input
                type="text"
                disabled
                value={encryptionAlgorithm}
                className="w-full bg-[#080a10] border border-[#1d2334] text-[#8e94a8] font-mono text-[13px] rounded-xl px-3.5 py-2.5 cursor-not-allowed"
              />
              <p className="text-[11px] text-[#555a6d] mt-1">Authenticated AES-GCM with 96-bit initialization vectors.</p>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#8e94a8] mb-1.5">
                Audit Log Retention Window (Days)
              </label>
              <input
                type="text"
                value={logRetentionDays}
                onChange={(e) => setLogRetentionDays(e.target.value)}
                className="w-full bg-[#131722] border border-[#22283a] text-white text-[13px] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#dfba82]"
              />
              <p className="text-[11px] text-[#555a6d] mt-1">SOC 2 Type II requires a minimum of 365 days immutable retention.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-[#dfba82] hover:bg-[#ebd2a9] text-[#07080c] font-bold text-[13px] rounded-xl transition-all shadow-[0_2px_12px_rgba(223,186,130,0.25)] cursor-pointer"
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" />
                <span>Settings Saved!</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Platform Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
