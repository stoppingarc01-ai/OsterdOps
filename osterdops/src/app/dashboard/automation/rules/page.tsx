"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { Zap, ArrowLeft, Save, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateRulePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("budget.threshold_reached");
  const [field, setField] = useState("data.thresholdPercent");
  const [operator, setOperator] = useState("greater_than_or_equal");
  const [value, setValue] = useState("80");
  const [actionType, setActionType] = useState("SEND_NOTIFICATION");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => {
      router.push("/dashboard/automation");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6 max-w-3xl">
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/automation"
                className="text-xs text-[#73788c] hover:text-[#dfba82] flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Automation
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#dfba82] tracking-wider uppercase mb-1">
                  <Zap className="w-3.5 h-3.5" />
                  Declarative Rule Builder
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  Create Automation Rule
                </h1>
              </div>
            </div>

            {saved && (
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-center gap-3 text-xs text-emerald-400">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>Automation rule created successfully! Redirecting...</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              <div className="p-5 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-4">
                <h2 className="text-sm font-bold text-white">1. Basic Information</h2>
                <div>
                  <label className="block text-xs font-semibold text-[#73788c] mb-1.5">Rule Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Notify Slack on High Spend Threshold"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#111422] border border-[#1d2136] text-xs text-white placeholder-[#555a6d] focus:outline-none focus:border-[#dfba82]"
                  />
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-4">
                <h2 className="text-sm font-bold text-white">2. Trigger (WHEN)</h2>
                <div>
                  <label className="block text-xs font-semibold text-[#73788c] mb-1.5">Event Trigger</label>
                  <select
                    value={trigger}
                    onChange={(e) => setTrigger(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#111422] border border-[#1d2136] text-xs text-white focus:outline-none focus:border-[#dfba82]"
                  >
                    <option value="budget.threshold_reached">budget.threshold_reached</option>
                    <option value="budget.exceeded">budget.exceeded</option>
                    <option value="gateway.request.failed">gateway.request.failed</option>
                    <option value="alert.created">alert.created</option>
                    <option value="billing.invoice.paid">billing.invoice.paid</option>
                    <option value="security.event">security.event</option>
                  </select>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-4">
                <h2 className="text-sm font-bold text-white">3. Conditions (IF)</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#73788c] mb-1.5">Field</label>
                    <input
                      type="text"
                      value={field}
                      onChange={(e) => setField(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#111422] border border-[#1d2136] text-xs text-white focus:outline-none focus:border-[#dfba82]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#73788c] mb-1.5">Operator</label>
                    <select
                      value={operator}
                      onChange={(e) => setOperator(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#111422] border border-[#1d2136] text-xs text-white focus:outline-none focus:border-[#dfba82]"
                    >
                      <option value="greater_than_or_equal">greater_than_or_equal (&gt;=)</option>
                      <option value="equals">equals (==)</option>
                      <option value="greater_than">greater_than (&gt;)</option>
                      <option value="less_than">less_than (&lt;)</option>
                      <option value="contains">contains</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#73788c] mb-1.5">Value</label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#111422] border border-[#1d2136] text-xs text-white focus:outline-none focus:border-[#dfba82]"
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-4">
                <h2 className="text-sm font-bold text-white">4. Action (THEN)</h2>
                <div>
                  <label className="block text-xs font-semibold text-[#73788c] mb-1.5">Action Type</label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#111422] border border-[#1d2136] text-xs text-white focus:outline-none focus:border-[#dfba82]"
                  >
                    <option value="SEND_NOTIFICATION">SEND_NOTIFICATION</option>
                    <option value="SEND_EMAIL">SEND_EMAIL</option>
                    <option value="TRIGGER_INTEGRATION">TRIGGER_INTEGRATION</option>
                    <option value="CREATE_ALERT">CREATE_ALERT</option>
                    <option value="LOG_EVENT">LOG_EVENT</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Link
                  href="/dashboard/automation"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#111422] border border-[#1d2136] text-[#73788c] hover:text-white transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#dfba82] hover:bg-[#c9a36d] text-black flex items-center gap-1.5 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Automation Rule
                </button>
              </div>
            </form>
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}
