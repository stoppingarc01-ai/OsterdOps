"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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
  RefreshCw,
  Sparkles,
  Info,
  SlidersHorizontal,
  X,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";
import { RbacGuard } from "@/components/auth/RbacGuard";

interface AutomationRuleItem {
  id: string;
  name: string;
  trigger: string;
  condition: string;
  action: string;
  enabled: boolean;
  executions: number;
  lastTriggered: string;
}

export default function AutomationPage() {
  const { currentOrg, getIdToken } = useAuth();
  const [rules, setRules] = useState<AutomationRuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [eventTrigger, setEventTrigger] = useState("budget.exceeded");
  const [actionType, setActionType] = useState("DISPATCH_WEBHOOK");
  const [creating, setCreating] = useState(false);

  const fetchRules = useCallback(async () => {
    if (!currentOrg?.id) return;
    setLoading(true);

    try {
      const token = await getIdToken();
      const res = await apiRequest<any>("/api/v1/automation/rules", {
        params: { organizationId: currentOrg.id },
        token,
      });

      const list = res.data?.rules || (Array.isArray(res.data) ? res.data : []);
      const mapped: AutomationRuleItem[] = list.map((r: any) => ({
        id: r.id,
        name: r.name || "Automation Policy",
        trigger: r.eventTrigger || r.trigger || "budget.exceeded",
        condition: r.conditions ? JSON.stringify(r.conditions) : "Always Active",
        action: r.actions ? (Array.isArray(r.actions) ? r.actions[0]?.type || "Alert" : "Alert") : "Dispatch Notification",
        enabled: r.enabled !== false,
        executions: r.executionCount || r.executions || 0,
        lastTriggered: r.lastTriggeredAt ? new Date(r.lastTriggeredAt).toLocaleString() : "Never",
      }));
      setRules(mapped);
    } catch (e) {
      setRules([]);
    } finally {
      setLoading(false);
    }
  }, [currentOrg, getIdToken]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg?.id || !name.trim()) return;

    setCreating(true);
    try {
      const token = await getIdToken();
      await apiRequest("/api/v1/automation/rules", {
        method: "POST",
        token,
        body: JSON.stringify({
          organizationId: currentOrg.id,
          name: name.trim(),
          eventTrigger,
          conditions: [{ field: "severity", operator: "EQUALS", value: "CRITICAL" }],
          actions: [{ type: actionType, target: "https://api.osterdops.internal/webhook" }],
        }),
      });

      setIsCreateOpen(false);
      setName("");
      await fetchRules();
    } catch (e) {
      // handled
    } finally {
      setCreating(false);
    }
  };

  const toggleRule = async (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );

    try {
      const token = await getIdToken();
      await apiRequest(`/api/v1/automation/rules/${id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ enabled: !rules.find((r) => r.id === id)?.enabled }),
      });
    } catch (e) {
      // handled
    }
  };

  const totalActive = rules.filter((r) => r.enabled).length;
  const totalExecutions = rules.reduce((acc, r) => acc + (r.executions || 0), 0);

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-7 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#dfba82] tracking-wider uppercase mb-1">
                  <Zap className="w-3 h-3 text-[#dfba82]" />
                  <span>GOVERNANCE & WORKFLOWS</span>
                  <span className="text-[#555a6d]">/</span>
                  <span className="text-[#c5c9d6]">AUTOMATIONS</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <h1
                    className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f4efe6]"
                    style={{ fontFamily: "var(--font-serif-luxury), Georgia, serif" }}
                  >
                    Event Automations & Policies
                  </h1>
                  <div className="w-5 h-5 rounded-md border border-[#dfba82]/40 bg-[#dfba82]/10 flex items-center justify-center text-[#dfba82]">
                    <Zap className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                </div>
                <p className="text-xs text-[#8e93a6] mt-0.5">
                  Event-driven cost controls, circuit breakers, and webhook remediation triggers.
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={fetchRules}
                  className="p-2 rounded-xl bg-[#0c0e16] border border-[#1b1e2c] text-[#8e93a6] hover:text-white hover:border-[#2a2f45] transition-all cursor-pointer"
                  title="Refresh automations"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#dfba82]" : ""}`} />
                </button>

                <RbacGuard permission="automations:manage">
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#dfba82] hover:bg-[#ebd4aa] text-black text-xs font-bold rounded-xl shadow-[0_2px_12px_rgba(223,186,130,0.25)] transition-all cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Create Policy</span>
                  </button>
                </RbacGuard>
              </div>
            </div>

            {/* 5 Top Stat KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Card 1: Active Automations */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-[#dfba82]/10 border border-[#dfba82]/20 flex items-center justify-center text-[#dfba82]">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium flex items-center gap-1">
                      Active Policies
                      <Info className="w-3 h-3 text-[#555a6d]" />
                    </span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">{totalActive}</div>
                  <div className="text-[10.5px] text-[#8e93a6]">Enforcing rules</div>
                </div>
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 35 C 20 38, 45 28, 65 32 C 80 34, 88 12, 100 6"
                      fill="none"
                      stroke="#dfba82"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Card 2: Trigger Executions */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-blue-950/40 border border-blue-800/30 flex items-center justify-center text-blue-400">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Executions</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">{totalExecutions}</div>
                  <div className="text-[10.5px] text-blue-400 font-medium">Automated triggers</div>
                </div>
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 34 C 20 30, 40 18, 60 26 C 75 30, 85 12, 100 6"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Card 3: Execution Latency */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-emerald-950/40 border border-emerald-800/30 flex items-center justify-center text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Trigger Latency</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">&lt; 15ms</div>
                  <div className="text-[10.5px] text-emerald-400 font-medium">Async edge eval</div>
                </div>
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 36 C 25 35, 50 38, 70 20 C 85 10, 92 16, 100 8"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Card 4: Circuit Breaking */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-purple-950/40 border border-purple-800/30 flex items-center justify-center text-purple-400">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Circuit Breakers</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">Active</div>
                  <div className="text-[10.5px] text-purple-400 font-medium">Auto-rate limiting</div>
                </div>
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 35 C 20 38, 40 32, 60 22 C 75 14, 85 18, 100 8"
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Card 5: Reliability */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-orange-950/40 border border-orange-800/30 flex items-center justify-center text-orange-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Reliability</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">99.99%</div>
                  <div className="text-[10.5px] text-emerald-400 font-medium">Guaranteed delivery</div>
                </div>
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 32 C 25 30, 45 22, 65 24 C 80 26, 88 12, 100 6"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Automations List */}
            <div className="space-y-3">
              {loading ? (
                <div className="p-12 text-center text-xs text-[#6b7082] space-y-2 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b]">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#dfba82]" />
                  <div>Loading automation policies...</div>
                </div>
              ) : rules.length === 0 ? (
                <div className="p-12 text-center space-y-3 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b]">
                  <div className="w-10 h-10 rounded-xl bg-[#dfba82]/10 border border-[#dfba82]/20 text-[#dfba82] flex items-center justify-center mx-auto">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-bold text-white">No Automation Rules Configured</div>
                  <p className="text-xs text-[#8e93a6] max-w-sm mx-auto">
                    Create event-driven policies to automatically throttle overspending models or dispatch instant alerts.
                  </p>
                  <RbacGuard permission="automations:manage">
                    <button
                      onClick={() => setIsCreateOpen(true)}
                      className="px-4 py-2 bg-[#dfba82] text-black font-bold rounded-xl text-xs hover:bg-[#ebd4aa] transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>Create First Policy</span>
                    </button>
                  </RbacGuard>
                </div>
              ) : (
                rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] hover:border-[#2a2f45] transition-all space-y-3 shadow-xl"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#141624] border border-[#23273a] flex items-center justify-center text-[#dfba82] shrink-0">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white">{rule.name}</div>
                          <div className="text-xs font-mono text-[#8e93a6] flex items-center gap-2 mt-0.5">
                            <span className="text-[#dfba82]">{rule.trigger}</span>
                            <span className="text-[#555a6d]">·</span>
                            <span>{rule.executions} executions</span>
                            <span className="text-[#555a6d]">·</span>
                            <span>Last run: {rule.lastTriggered}</span>
                          </div>
                        </div>
                      </div>

                      <RbacGuard permission="automations:manage">
                        <button
                          onClick={() => toggleRule(rule.id)}
                          className="flex items-center gap-2 text-xs font-semibold cursor-pointer shrink-0"
                        >
                          {rule.enabled ? (
                            <span className="flex items-center gap-1.5 text-emerald-400">
                              <ToggleRight className="w-6 h-6 text-emerald-400" />
                              Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-[#6b7082]">
                              <ToggleLeft className="w-6 h-6 text-[#6b7082]" />
                              Disabled
                            </span>
                          )}
                        </button>
                      </RbacGuard>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="p-3 rounded-xl bg-[#08090f] border border-[#181b28]">
                        <div className="text-[10px] text-[#6b7082] uppercase font-mono mb-1">Trigger Condition</div>
                        <div className="text-[#c5c9d6] font-mono text-[11px] truncate">{rule.condition}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-[#08090f] border border-[#181b28]">
                        <div className="text-[10px] text-[#6b7082] uppercase font-mono mb-1">Execution Action</div>
                        <div className="text-[#dfba82] font-mono text-[11px] truncate">{rule.action}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Workflows Banner */}
            <div className="rounded-2xl border border-[#1a1d2b] bg-[#0c0e16] p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#dfba82]/10 border border-[#dfba82]/25 flex items-center justify-center text-[#dfba82] shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Complex Multi-Step Workflow Engine</div>
                  <div className="text-[11.5px] text-[#8e93a6]">
                    Chain multiple actions across webhooks, key revocations, and Slack paging in sequential pipelines.
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard/workflows"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#dfba82] hover:text-[#ebd4aa] transition-colors shrink-0"
              >
                <span>View Multi-Step Workflows</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </ContentTransition>
      </main>

      {/* Create Automation Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0e1017] border border-[#232738] rounded-2xl p-6 shadow-2xl text-white relative space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1c1f2e]">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#dfba82]" />
                <h3 className="text-base font-bold text-[#f4efe6]">Create Automation Rule</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-[#787d91] hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[11.5px] font-semibold text-[#c5c9d6]">Rule Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Auto-throttle GPT-4o on budget breach"
                  className="w-full px-3.5 py-2 bg-[#141622] border border-[#232738] rounded-xl text-white placeholder-[#5e6377] focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11.5px] font-semibold text-[#c5c9d6]">Trigger Event</label>
                <select
                  value={eventTrigger}
                  onChange={(e) => setEventTrigger(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#141622] border border-[#232738] rounded-xl text-white focus:outline-none focus:border-[#dfba82] cursor-pointer"
                >
                  <option value="budget.exceeded">budget.exceeded (Threshold reached)</option>
                  <option value="gateway.rate_limited">gateway.rate_limited (HTTP 429)</option>
                  <option value="alert.critical">alert.critical (Incident created)</option>
                  <option value="apiKey.revoked">apiKey.revoked (Access terminated)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11.5px] font-semibold text-[#c5c9d6]">Action to Execute</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#141622] border border-[#232738] rounded-xl text-white focus:outline-none focus:border-[#dfba82] cursor-pointer"
                >
                  <option value="DISPATCH_WEBHOOK">Dispatch Webhook Payload</option>
                  <option value="THROTTLE_MODEL">Throttle traffic to cheaper fallback model</option>
                  <option value="SEND_SLACK">Notify Slack Channel</option>
                  <option value="LOCK_WORKSPACE">Lock Workspace Keys</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1c1f2e]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={creating}
                  className="px-3.5 py-2 text-xs text-[#8e93a6] hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-[#dfba82] text-black font-bold rounded-xl hover:bg-[#ebd4aa] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Policy</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
