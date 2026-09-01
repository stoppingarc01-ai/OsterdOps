"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import {
  Zap,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { RbacGuard } from "@/components/auth/RbacGuard";

const SAMPLE_RULES = [
  {
    id: "rule_01",
    name: "Emergency Budget Exceedance Alert",
    trigger: "budget.exceeded",
    condition: "spend > $1,000 AND project == 'production'",
    action: "Send Slack Notification to #prod-alerts",
    enabled: true,
    executions: 14,
    lastTriggered: "2 hours ago",
  },
  {
    id: "rule_02",
    name: "Gateway High Latency Notice",
    trigger: "gateway.request.failed",
    condition: "errorRate >= 5%",
    action: "Trigger Generic Webhook & Create Alert",
    enabled: true,
    executions: 8,
    lastTriggered: "1 day ago",
  },
  {
    id: "rule_03",
    name: "Monthly Invoice Paid Summary",
    trigger: "billing.invoice.paid",
    condition: "status == 'PAID'",
    action: "Send Email to finance@acme.com",
    enabled: false,
    executions: 3,
    lastTriggered: "15 days ago",
  },
];

export default function AutomationPage() {
  const [rules, setRules] = useState(SAMPLE_RULES);

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#dfba82] tracking-wider uppercase mb-1">
                  <Zap className="w-3.5 h-3.5" />
                  Event Automation & Guardrails
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  Automation Rules
                </h1>
              </div>

              <RbacGuard permission="automations:manage">
                <Link
                  href="/dashboard/automation/rules"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#dfba82] hover:bg-[#c9a36d] text-black flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Rule
                </Link>
              </RbacGuard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-1">
                <div className="text-[11px] text-[#73788c] uppercase font-semibold">Active Rules</div>
                <div className="text-xl font-bold text-white">
                  {rules.filter((r) => r.enabled).length} / {rules.length}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-1">
                <div className="text-[11px] text-[#73788c] uppercase font-semibold">24h Executions</div>
                <div className="text-xl font-bold text-emerald-400">25</div>
              </div>

              <div className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-1">
                <div className="text-[11px] text-[#73788c] uppercase font-semibold">Average Execution Time</div>
                <div className="text-xl font-bold text-white">18ms</div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-4">
              <h2 className="text-sm font-bold text-white">Configured Rules</h2>

              <div className="space-y-3">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-4 rounded-lg bg-[#111422] border border-[#1d2136] flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/automation/rules/${rule.id}`}
                          className="font-bold text-sm text-white hover:text-[#dfba82] transition-colors"
                        >
                          {rule.name}
                        </Link>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#161a29] border border-[#232942] text-[#dfba82]">
                          WHEN {rule.trigger}
                        </span>
                      </div>
                      <div className="text-xs text-[#73788c] flex flex-wrap items-center gap-2">
                        <span>IF <strong className="text-[#a4a9bd]">{rule.condition}</strong></span>
                        <span>•</span>
                        <span>THEN <strong className="text-[#a4a9bd]">{rule.action}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-right text-[#73788c] hidden sm:block">
                        <div>{rule.executions} executions</div>
                        <div className="text-[10px] text-[#555a6d]">{rule.lastTriggered}</div>
                      </div>

                      <button
                        onClick={() => toggleRule(rule.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          rule.enabled
                            ? "bg-emerald-950/40 border-emerald-800/40 text-emerald-400"
                            : "bg-[#161a29] border-[#232942] text-[#73788c]"
                        }`}
                        title={rule.enabled ? "Disable rule" : "Enable rule"}
                      >
                        {rule.enabled ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}
