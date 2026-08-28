"use client";

import React, { useState } from "react";
import {
  Calendar,
  ChevronDown,
  Terminal,
} from "lucide-react";
import { AdminLoginCard } from "@/components/admin/AdminLoginCard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminKpiCards } from "@/components/admin/AdminKpiCards";
import { AdminRevenueChartCard } from "@/components/admin/AdminRevenueChartCard";
import { AdminSupportActivityCard } from "@/components/admin/AdminSupportActivityCard";
import { AdminCustomersTableCard } from "@/components/admin/AdminCustomersTableCard";
import { AdminQuickActionsCard } from "@/components/admin/AdminQuickActionsCard";
import { AdminCommandPaletteModal } from "@/components/admin/AdminCommandPaletteModal";
import { AdminCreateBlogPostModal } from "@/components/admin/AdminCreateBlogPostModal";

// Sub-views
import { AdminCustomersView } from "@/components/admin/views/AdminCustomersView";
import { AdminOrganizationsView } from "@/components/admin/views/AdminOrganizationsView";
import { AdminSubscriptionsView } from "@/components/admin/views/AdminSubscriptionsView";
import { AdminSupportInboxView } from "@/components/admin/views/AdminSupportInboxView";
import { AdminSystemHealthView } from "@/components/admin/views/AdminSystemHealthView";
import { AdminAuditLogsView } from "@/components/admin/views/AdminAuditLogsView";
import { AdminBlogView } from "@/components/admin/views/AdminBlogView";
import { AdminMediaView } from "@/components/admin/views/AdminMediaView";
import { AdminUsersView } from "@/components/admin/views/AdminUsersView";
import { AdminSettingsView } from "@/components/admin/views/AdminSettingsView";

export default function AdminConsolePage() {
  // Authentication Guard State
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Navigation & Modals State
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedDate] = useState("May 16, 2025");
  const [showGatewayTester, setShowGatewayTester] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCreateBlogModalOpen, setIsCreateBlogModalOpen] = useState(false);

  // Quick Gateway Tester States
  const [testModel, setTestModel] = useState("gpt-4o-mini");
  const [testPrompt, setTestPrompt] = useState("Explain AI cost governance in 1 sentence.");
  const [gatewayLoading, setGatewayLoading] = useState(false);
  const [gatewayOutput, setGatewayOutput] = useState<unknown>(null);
  const [gatewayHeaders, setGatewayHeaders] = useState<Record<string, string>>({});

  const handleRunQuickGatewayTest = async () => {
    setGatewayLoading(true);
    setGatewayOutput(null);
    setGatewayHeaders({});

    try {
      const startTime = performance.now();
      const res = await fetch("/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer osk_live_demo_test_key_master",
        },
        body: JSON.stringify({
          model: testModel,
          messages: [{ role: "user", content: testPrompt }],
        }),
      });

      const clientLatency = Math.round(performance.now() - startTime);
      const data = await res.json();

      setGatewayHeaders({
        "x-osterdops-latency-ms": res.headers.get("x-osterdops-latency-ms") || String(clientLatency),
        "x-osterdops-cost-usd": res.headers.get("x-osterdops-cost-usd") || "0.00004500",
        "x-osterdops-total-tokens": res.headers.get("x-osterdops-total-tokens") || "64",
      });
      setGatewayOutput(data);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setGatewayOutput({ error: errorObj?.message || "Gateway test failed" });
    } finally {
      setGatewayLoading(false);
    }
  };

  const handleQuickActionSelect = (actionId: string) => {
    if (actionId === "create_post") {
      setIsCreateBlogModalOpen(true);
    } else if (actionId === "support") {
      setActiveSection("support");
    } else if (actionId === "subscriptions") {
      setActiveSection("subscriptions");
    } else if (actionId === "customers") {
      setActiveSection("customers");
    } else if (actionId === "gateway_test") {
      setShowGatewayTester(true);
    } else {
      setActiveSection(actionId);
    }
  };

  const getBreadcrumbTitle = () => {
    switch (activeSection) {
      case "overview":
        return "Overview";
      case "customers":
        return "Customers & Accounts";
      case "organizations":
        return "Organizations";
      case "subscriptions":
        return "Subscriptions & Billing";
      case "support":
        return "Support Inbox";
      case "health":
        return "System Health";
      case "audit-logs":
        return "Audit Logs";
      case "blog":
        return "Blog & Content";
      case "media":
        return "Media Library";
      case "admin-users":
        return "Admin Users";
      case "settings":
        return "Settings";
      default:
        return activeSection.charAt(0).toUpperCase() + activeSection.slice(1);
    }
  };

  // If not authenticated, render high-security Admin Login Card
  if (!isAuthenticated) {
    return (
      <AdminLoginCard
        onLoginSuccess={() => {
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col md:flex-row font-sans selection:bg-[#dfba82] selection:text-black animate-in fade-in duration-200">
      {/* Left Sidebar */}
      <AdminSidebar
        activeSection={activeSection}
        onSelectSection={(sec) => setActiveSection(sec)}
        onLogout={() => setIsAuthenticated(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#07080d] overflow-y-auto">
        {/* Top Header */}
        <AdminHeader
          breadcrumb={getBreadcrumbTitle()}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onLogout={() => setIsAuthenticated(false)}
        />

        {/* Dashboard Body */}
        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {activeSection === "overview" && (
            <>
              {/* Greeting & Date Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1
                    className="text-[28px] sm:text-[34px] font-bold text-[#f4efe6] tracking-tight leading-tight"
                    style={{ fontFamily: "var(--font-serif-luxury), Georgia, serif" }}
                  >
                    Good morning, Admin.
                  </h1>
                  <p className="text-[13px] text-[#717688] mt-1">
                    Here&apos;s what&apos;s happening across OsterdOps today.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Live Gateway Test Toggle */}
                  <button
                    onClick={() => setShowGatewayTester(!showGatewayTester)}
                    className="flex items-center gap-2 bg-[#121622] hover:bg-[#181e2e] border border-[#1f2638] text-[#dfba82] px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-all shadow-sm group cursor-pointer"
                  >
                    <Terminal className="h-4 w-4" />
                    <span>{showGatewayTester ? "Close Gateway Test" : "Test AI Gateway"}</span>
                  </button>

                  {/* Date Filter Dropdown */}
                  <div className="flex items-center gap-2 bg-[#0e111a] border border-[#1d2232] rounded-xl px-3.5 py-2 text-[12.5px] text-[#c5c8d4] shadow-sm cursor-pointer hover:border-[#2b344a] transition-colors group">
                    <Calendar className="h-4 w-4 text-[#717688] group-hover:text-[#dfba82] transition-colors" />
                    <span className="font-medium">{selectedDate}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-[#717688] group-hover:text-white transition-colors ml-1" />
                  </div>
                </div>
              </div>

              {/* Quick Gateway Floating / Inline Tester */}
              {showGatewayTester && (
                <div className="bg-[#0e121b] border border-[#dfba82]/30 rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.5)] space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-[#1c2230] pb-3">
                    <div className="flex items-center gap-2 text-[#dfba82] font-semibold text-[13px]">
                      <Terminal className="h-4 w-4" />
                      <span>Live AI Gateway Tester (`POST /api/v1/chat/completions`)</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#717688]">8-Decimal Micro-Cent Engine</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-3">
                      <label className="block text-[11px] font-semibold text-[#8e94a8] mb-1">Model</label>
                      <select
                        value={testModel}
                        onChange={(e) => setTestModel(e.target.value)}
                        className="w-full bg-[#141824] border border-[#22283a] text-white text-[12px] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#dfba82]"
                      >
                        <option value="gpt-4o-mini">gpt-4o-mini (OpenAI)</option>
                        <option value="gpt-4o">gpt-4o (OpenAI)</option>
                        <option value="claude-3-5-sonnet-20241022">claude-3-5-sonnet (Anthropic)</option>
                        <option value="gemini-2.0-flash">gemini-2.0-flash (Gemini)</option>
                        <option value="gemini-1.5-flash">gemini-1.5-flash (Gemini)</option>
                      </select>
                    </div>

                    <div className="md:col-span-7">
                      <label className="block text-[11px] font-semibold text-[#8e94a8] mb-1">Prompt</label>
                      <input
                        type="text"
                        value={testPrompt}
                        onChange={(e) => setTestPrompt(e.target.value)}
                        className="w-full bg-[#141824] border border-[#22283a] text-white text-[12px] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#dfba82]"
                      />
                    </div>

                    <div className="md:col-span-2 flex items-end">
                      <button
                        onClick={handleRunQuickGatewayTest}
                        disabled={gatewayLoading}
                        className="w-full py-1.5 bg-[#dfba82] hover:bg-[#ebd2a9] text-[#07080c] font-bold text-[12px] rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {gatewayLoading ? "Routing..." : "Send Call"}
                      </button>
                    </div>
                  </div>

                  {gatewayOutput ? (
                    <div className="bg-[#07090e] border border-[#161c28] p-3.5 rounded-xl space-y-2">
                      <div className="flex items-center gap-4 text-[11px] font-mono text-[#8e94a8]">
                        <span>
                          Latency: <strong className="text-white">{gatewayHeaders["x-osterdops-latency-ms"]}ms</strong>
                        </span>
                        <span>
                          Cost: <strong className="text-[#dfba82]">${gatewayHeaders["x-osterdops-cost-usd"]}</strong>
                        </span>
                        <span>
                          Tokens: <strong className="text-[#38bdf8]">{gatewayHeaders["x-osterdops-total-tokens"]}</strong>
                        </span>
                      </div>
                      <pre className="text-[11.5px] font-mono text-[#22c55e] max-h-32 overflow-y-auto">
                        {JSON.stringify(gatewayOutput, null, 2)}
                      </pre>
                    </div>
                  ) : null}
                </div>
              )}

              {/* 1. Top 4 KPI Metrics */}
              <AdminKpiCards />

              {/* 2. Middle Row: Revenue Chart (8 cols) + Support Activity (4 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                  <AdminRevenueChartCard />
                </div>
                <div className="lg:col-span-4">
                  <AdminSupportActivityCard onGoToInbox={() => setActiveSection("support")} />
                </div>
              </div>

              {/* 3. Bottom Row: Recent Customers Table (8 cols) + Quick Actions (4 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                  <AdminCustomersTableCard />
                </div>
                <div className="lg:col-span-4">
                  <AdminQuickActionsCard onSelectAction={handleQuickActionSelect} />
                </div>
              </div>
            </>
          )}

          {/* Sub-Views */}
          {activeSection === "customers" && <AdminCustomersView />}
          {activeSection === "organizations" && <AdminOrganizationsView />}
          {activeSection === "subscriptions" && <AdminSubscriptionsView />}
          {activeSection === "support" && <AdminSupportInboxView />}
          {activeSection === "health" && <AdminSystemHealthView />}
          {activeSection === "audit-logs" && <AdminAuditLogsView />}
          {activeSection === "blog" && (
            <AdminBlogView onOpenCreateModal={() => setIsCreateBlogModalOpen(true)} />
          )}
          {activeSection === "media" && <AdminMediaView />}
          {activeSection === "admin-users" && <AdminUsersView />}
          {activeSection === "settings" && <AdminSettingsView />}
        </main>
      </div>

      {/* Global Command Palette Modal (⌘ K) */}
      <AdminCommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectAction={(actionId) => handleQuickActionSelect(actionId)}
      />

      {/* Create Blog Post Modal */}
      <AdminCreateBlogPostModal
        isOpen={isCreateBlogModalOpen}
        onClose={() => setIsCreateBlogModalOpen(false)}
        onPostCreated={() => {
          setActiveSection("blog");
        }}
      />
    </div>
  );
}
