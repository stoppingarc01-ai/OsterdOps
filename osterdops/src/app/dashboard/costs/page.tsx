"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import {
  BadgeDollarSign,
  TrendingUp,
  Sparkles,
  Wallet,
  CreditCard,
  Calendar,
  Layers,
  Cpu,
  FolderKanban,
  ArrowRight,
  ShieldCheck,
  Zap,
  Coins,
  TrendingDown,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";
import type { Project, Budget } from "@/types";

interface CostBreakdownItem {
  id: string;
  name: string;
  subtext: string;
  spendUsd: number;
  percentage: number;
  requests: number;
  costPer1k: number;
  badgeVariant: "amber" | "blue" | "emerald" | "purple";
}

export default function CostsPage() {
  const { currentOrg, getIdToken } = useAuth();
  const [timeRange, setTimeRange] = useState<"mtd" | "30d" | "quarter">("mtd");
  const [activeTab, setActiveTab] = useState<"project" | "provider" | "model">("project");
  const [loading, setLoading] = useState(false);

  const [totalSpend, setTotalSpend] = useState<number>(0);
  const [totalSavings, setTotalSavings] = useState<number>(0);
  const [totalRequests, setTotalRequests] = useState<number>(0);
  const [activeBudgets, setActiveBudgets] = useState<Budget[]>([]);

  const [byProject, setByProject] = useState<CostBreakdownItem[]>([]);
  const [byProvider, setByProvider] = useState<CostBreakdownItem[]>([]);
  const [byModel, setByModel] = useState<CostBreakdownItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadCostsData() {
      if (!currentOrg?.id) return;
      setLoading(true);

      try {
        const token = await getIdToken();
        const apiRange = timeRange === "quarter" ? "90d" : "30d";

        const [analyticsRes, projectsRes, budgetsRes] = await Promise.all([
          apiRequest<any>("/api/v1/analytics/overview", {
            params: { organizationId: currentOrg.id, timeRange: apiRange },
            token,
          }),
          apiRequest<Project[]>("/api/v1/projects", {
            params: { organizationId: currentOrg.id },
            token,
          }),
          apiRequest<Budget[]>("/api/v1/budgets", {
            params: { organizationId: currentOrg.id },
            token,
          }),
        ]);

        if (!isMounted) return;

        const spend = analyticsRes.data?.kpis?.totalSpendUsd ?? 0;
        const savings = analyticsRes.data?.kpis?.totalCacheSavingsUsd ?? 0;
        const reqs = analyticsRes.data?.kpis?.totalRequests ?? 0;

        setTotalSpend(spend);
        setTotalSavings(savings);
        setTotalRequests(reqs);

        if (budgetsRes.data && Array.isArray(budgetsRes.data)) {
          setActiveBudgets(budgetsRes.data);
        } else {
          setActiveBudgets([]);
        }

        // Map Projects
        if (projectsRes.data && Array.isArray(projectsRes.data)) {
          const mappedProjects: CostBreakdownItem[] = projectsRes.data.map((p, idx) => {
            const pSpend = p.currentMonthSpend ?? 0;
            const pReqs = p.totalRequests ?? 0;
            const pCostPer1k = pReqs > 0 ? (pSpend / pReqs) * 1000 : 0;
            const pPct = spend > 0 ? (pSpend / spend) * 100 : 0;
            const variants: Array<"amber" | "blue" | "emerald" | "purple"> = ["amber", "blue", "emerald", "purple"];

            return {
              id: p.id,
              name: p.name,
              subtext: p.slug || "workspace",
              spendUsd: pSpend,
              percentage: pPct,
              requests: pReqs,
              costPer1k: pCostPer1k,
              badgeVariant: variants[idx % variants.length],
            };
          });
          setByProject(mappedProjects);
        } else {
          setByProject([]);
        }

        // Map Providers
        if (analyticsRes.data && Array.isArray(analyticsRes.data.byProvider)) {
          const mappedProviders: CostBreakdownItem[] = analyticsRes.data.byProvider.map((pv: any, idx: number) => {
            const pvSpend = pv.spendUsd ?? 0;
            const pvReqs = pv.requests ?? 0;
            const pvCostPer1k = pvReqs > 0 ? (pvSpend / pvReqs) * 1000 : 0;
            const variants: Array<"amber" | "blue" | "emerald" | "purple"> = ["emerald", "amber", "blue", "purple"];

            return {
              id: `prov_${idx}`,
              name: pv.provider,
              subtext: "Upstream LLM",
              spendUsd: pvSpend,
              percentage: pv.percentageOfSpend ?? 0,
              requests: pvReqs,
              costPer1k: pvCostPer1k,
              badgeVariant: variants[idx % variants.length],
            };
          });
          setByProvider(mappedProviders);
        } else {
          setByProvider([]);
        }

        // Map Models
        if (analyticsRes.data && Array.isArray(analyticsRes.data.byModel)) {
          const mappedModels: CostBreakdownItem[] = analyticsRes.data.byModel.map((m: any, idx: number) => {
            const mSpend = m.spendUsd ?? 0;
            const mReqs = m.requests ?? 0;
            const mCostPer1k = mReqs > 0 ? (mSpend / mReqs) * 1000 : 0;
            const mPct = spend > 0 ? (mSpend / spend) * 100 : 0;
            const variants: Array<"amber" | "blue" | "emerald" | "purple"> = ["emerald", "amber", "blue", "purple"];

            return {
              id: `mod_${idx}`,
              name: m.model,
              subtext: m.provider,
              spendUsd: mSpend,
              percentage: mPct,
              requests: mReqs,
              costPer1k: mCostPer1k,
              badgeVariant: variants[idx % variants.length],
            };
          });
          setByModel(mappedModels);
        } else {
          setByModel([]);
        }
      } catch (err) {
        if (isMounted) {
          setTotalSpend(0);
          setTotalSavings(0);
          setTotalRequests(0);
          setByProject([]);
          setByProvider([]);
          setByModel([]);
          setActiveBudgets([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCostsData();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken, timeRange]);

  const activeItems =
    activeTab === "project" ? byProject : activeTab === "provider" ? byProvider : byModel;

  const costPer1k = totalRequests > 0 ? (totalSpend / totalRequests) * 1000 : 0;
  const totalBudgetCap = activeBudgets.reduce((acc, b) => acc + (b.monthlyCap || b.limitAmount || 0), 0);
  const budgetUtilization = totalBudgetCap > 0 ? Math.min(100, (totalSpend / totalBudgetCap) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-7 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-5">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#dfba82] tracking-wider uppercase mb-1">
                  <Zap className="w-3 h-3 text-[#dfba82]" />
                  <span>AI OPERATIONS</span>
                  <span className="text-[#555a6d]">/</span>
                  <span className="text-[#c5c9d6]">COSTS</span>
                </div>

                {/* Title with Badge */}
                <div className="flex items-center gap-2.5">
                  <h1
                    className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f4efe6]"
                    style={{ fontFamily: "var(--font-serif-luxury), Georgia, serif" }}
                  >
                    Cost Center & Spend Attribution
                  </h1>
                  <div className="w-5 h-5 rounded-md border border-[#dfba82]/40 bg-[#dfba82]/10 flex items-center justify-center text-[#dfba82]">
                    <Coins className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                </div>
                <p className="text-xs text-[#8e93a6] mt-0.5">
                  Track real-time model costs, monthly projections, project allocations, and prompt cache savings.
                </p>
              </div>

              {/* Controls Toolbar */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Time Range Pills */}
                <div className="flex items-center bg-[#0c0e16] border border-[#1b1e2c] p-1 rounded-xl text-xs">
                  <Calendar className="w-3.5 h-3.5 text-[#73788c] ml-2 mr-1.5" />
                  {(
                    [
                      { id: "mtd", label: "MTD" },
                      { id: "30d", label: "Last 30 Days" },
                      { id: "quarter", label: "This Quarter" },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTimeRange(t.id)}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                        timeRange === t.id
                          ? "bg-[#dfba82] text-black shadow-[0_0_12px_rgba(223,186,130,0.3)]"
                          : "text-[#8e93a6] hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Budgets Navigation Link */}
                <Link
                  href="/dashboard/budgets"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0c0e16] border border-[#1b1e2c] text-xs font-semibold text-[#c5c9d6] hover:text-white hover:border-[#dfba82]/40 transition-all cursor-pointer"
                >
                  <Wallet className="w-3.5 h-3.5 text-[#dfba82]" />
                  <span>Budgets</span>
                </Link>

                {/* Manage Billing CTA */}
                <Link
                  href="/dashboard/billing"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#dfba82] hover:bg-[#ebd4aa] text-black text-xs font-bold shadow-[0_2px_12px_rgba(223,186,130,0.25)] transition-all cursor-pointer shrink-0"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Manage Billing</span>
                </Link>
              </div>
            </div>

            {/* 5 Top Stat / KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Card 1: Current Spend */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-[#dfba82]/10 border border-[#dfba82]/20 flex items-center justify-center text-[#dfba82]">
                      <BadgeDollarSign className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Incurred Spend</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5 font-mono">
                    ${totalSpend.toFixed(2)}
                  </div>
                  <div className="text-[10.5px] text-emerald-400 font-medium flex items-center gap-1">
                    <span>Active billing cycle</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Estimated Month-End */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-blue-950/40 border border-blue-800/30 flex items-center justify-center text-blue-400">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Estimated Velocity</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5 font-mono">
                    ${(totalSpend * 1.25).toFixed(2)}
                  </div>
                  <div className="text-[10.5px] text-[#8e93a6]">
                    {totalBudgetCap > 0 ? `Cap: $${totalBudgetCap.toFixed(2)}` : "No global limit set"}
                  </div>
                </div>
              </div>

              {/* Card 3: Cache Savings */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-emerald-950/40 border border-emerald-800/30 flex items-center justify-center text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Cache Savings</span>
                  </div>
                  <div className="text-xl font-bold text-emerald-400 pt-0.5 font-mono">
                    ${totalSavings.toFixed(2)}
                  </div>
                  <div className="text-[10.5px] text-[#8e93a6]">Deflected inference</div>
                </div>
              </div>

              {/* Card 4: Cost per 1k Requests */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-orange-950/40 border border-orange-800/30 flex items-center justify-center text-orange-400">
                      <TrendingDown className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Cost / 1k Reqs</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5 font-mono">
                    ${costPer1k.toFixed(2)}
                  </div>
                  <div className="text-[10.5px] text-emerald-400 font-medium">
                    {totalRequests.toLocaleString()} total requests
                  </div>
                </div>
              </div>

              {/* Card 5: Attributed Cost Centers */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-purple-950/40 border border-purple-800/30 flex items-center justify-center text-purple-400">
                      <FolderKanban className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Workspaces</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5 font-mono">
                    {byProject.length} Active
                  </div>
                  <div className="text-[10.5px] text-purple-400 font-medium">Isolated tenants</div>
                </div>
              </div>
            </div>

            {/* Budget Gauge & Enforcement Banner */}
            <div className="rounded-2xl border border-[#1a1d2b] bg-[#0c0e16] p-4.5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-[#161824]">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-emerald-950/40 text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Monthly Budget Health & Guardrails</h3>
                </div>
                <span className="text-[10.5px] font-mono font-bold text-[#dfba82]">
                  {totalBudgetCap > 0 ? `${budgetUtilization.toFixed(1)}% Consumed` : "No Cap Defined"}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#8e93a6]">Incurred / Cap</span>
                  <span className="font-bold text-white">
                    ${totalSpend.toFixed(2)} / ${totalBudgetCap > 0 ? totalBudgetCap.toFixed(2) : "—"}
                  </span>
                </div>
                <div className="w-full bg-[#161824] h-2.5 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-[#dfba82] to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, budgetUtilization)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Multi-Tab Cost Breakdown Matrix */}
            <div className="rounded-2xl border border-[#1a1d2b] bg-[#0c0e16] p-4.5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#161824]">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-[#dfba82]/15 text-[#dfba82] flex items-center justify-center">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Granular Cost Attribution</h3>
                </div>

                {/* Tabs: By Project | By Provider | By Model */}
                <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[#141624] border border-[#23273a] text-xs">
                  {(
                    [
                      { id: "project", label: "By Project" },
                      { id: "provider", label: "By Provider" },
                      { id: "model", label: "By Model" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-1 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                        activeTab === tab.id
                          ? "bg-[#dfba82] text-black font-bold shadow-[0_0_10px_rgba(223,186,130,0.25)]"
                          : "text-[#8e93a6] hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Attribution Items Table / List */}
              <div className="space-y-2.5">
                {loading ? (
                  <div className="p-8 text-center text-xs text-[#8e93a6] space-y-2">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#dfba82]" />
                    <div>Loading cost attribution breakdown...</div>
                  </div>
                ) : activeItems.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#73788c] bg-[#090b12] rounded-xl border border-[#161824]">
                    No cost records found for this view
                  </div>
                ) : (
                  activeItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-[#08090f] border border-[#161824] hover:border-[#2a2f45] transition-all space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-[#dfba82]/10 border border-[#dfba82]/30 flex items-center justify-center font-bold text-xs text-[#dfba82] shrink-0">
                            {activeTab === "project" ? (
                              <FolderKanban className="w-3.5 h-3.5" />
                            ) : activeTab === "provider" ? (
                              item.name.charAt(0).toUpperCase()
                            ) : (
                              <Cpu className="w-3.5 h-3.5" />
                            )}
                          </div>

                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-2">
                              <span>{item.name}</span>
                              <span className="text-[10px] text-[#6b7082] font-mono">({item.subtext})</span>
                            </div>
                            <div className="text-[11px] text-[#6b7082] font-mono mt-0.5">
                              {item.requests.toLocaleString()} requests · avg ${item.costPer1k.toFixed(2)} / 1k
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-right">
                          <div>
                            <div className="text-sm font-bold text-[#dfba82] font-mono">
                              ${item.spendUsd.toFixed(2)}
                            </div>
                            <div className="text-[10.5px] text-[#8e93a6] font-mono">
                              {item.percentage.toFixed(1)}% of spend
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-[#161824] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#dfba82]"
                          style={{ width: `${Math.min(100, Math.max(5, item.percentage))}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}
