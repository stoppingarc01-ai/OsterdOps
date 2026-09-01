"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LineChart,
  Activity,
  Timer,
  Boxes,
  Cpu,
  BadgeDollarSign,
  Wallet,
  Bell,
  CreditCard,
  Receipt,
  Layers,
  FolderKanban,
  KeyRound,
  Workflow,
  ShieldCheck,
  FileCheck2,
  AlertOctagon,
  Lock,
  Settings,
  HeartPulse,
  ChevronDown,
  Building2,
  ChevronLeft,
  ChevronRight,
  Check,
  LogOut,
  Code2,
  Rocket,
  BookOpen,
  Users,
  Shield,
  Sliders,
  Zap,
  GitMerge,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { hasPermission, type Permission } from "@/lib/auth/permissions";
import type { OrganizationRole } from "@/types";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  permission?: Permission;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [
      { id: "overview", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    ],
  },
  {
    title: "AI OPERATIONS",
    items: [
      { id: "gateway", label: "Gateway", icon: Activity, href: "/dashboard/requests", permission: "usage:read" },
      { id: "analytics", label: "Analytics", icon: LineChart, href: "/dashboard/analytics", permission: "usage:read" },
      { id: "usage", label: "Usage", icon: Layers, href: "/dashboard/billing/usage", permission: "usage:read" },
      { id: "costs", label: "Costs", icon: BadgeDollarSign, href: "/dashboard/costs", permission: "usage:read" },
    ],
  },
  {
    title: "GOVERNANCE",
    items: [
      { id: "budgets", label: "Budgets", icon: Wallet, href: "/dashboard/budgets", permission: "budgets:read" },
      { id: "alerts", label: "Alerts", icon: Bell, href: "/dashboard/alerts", permission: "alerts:read" },
      { id: "automations", label: "Automations", icon: Zap, href: "/dashboard/automation", permission: "automations:read" },
      { id: "workflows", label: "Workflows", icon: GitMerge, href: "/dashboard/workflows", permission: "workflows:read" },
      { id: "policies", label: "Policies", icon: Shield, href: "/dashboard/settings/security", permission: "org:settings:read" },
    ],
  },
  {
    title: "DEVELOPER",
    items: [
      { id: "projects", label: "Projects", icon: FolderKanban, href: "/dashboard/projects", permission: "projects:read" },
      { id: "api-keys", label: "API Keys", icon: KeyRound, href: "/dashboard/api-keys", permission: "keys:read" },
      { id: "integrations", label: "Integrations", icon: Workflow, href: "/dashboard/integrations", permission: "integrations:read" },
      { id: "api-docs", label: "API Docs", icon: BookOpen, href: "/dashboard/developers/api", permission: "keys:read" },
      { id: "webhooks", label: "Webhooks", icon: Workflow, href: "/dashboard/developers/webhooks", permission: "webhooks:read" },
      { id: "sdk", label: "SDK", icon: Code2, href: "/dashboard/developers/quickstart", permission: "keys:read" },
    ],
  },
  {
    title: "ORGANIZATION",
    items: [
      { id: "members", label: "Members", icon: Users, href: "/dashboard/members", permission: "members:read" },
      { id: "audit-logs", label: "Audit Logs", icon: FileCheck2, href: "/dashboard/audit-logs", permission: "audit:read" },
    ],
  },
  {
    title: "BILLING",
    items: [
      { id: "subscription", label: "Subscription", icon: CreditCard, href: "/dashboard/billing", permission: "billing:read" },
      { id: "billing-usage", label: "Usage & Overage", icon: Layers, href: "/dashboard/billing/usage", permission: "usage:read" },
      { id: "invoices", label: "Invoices", icon: Receipt, href: "/dashboard/billing/invoices", permission: "billing:read" },
    ],
  },
  {
    title: "SECURITY",
    items: [
      { id: "security-posture", label: "Security Center", icon: ShieldCheck, href: "/dashboard/security", permission: "security:read" },
      { id: "security-events", label: "Security Events", icon: AlertOctagon, href: "/dashboard/security/events", permission: "security:read" },
      { id: "sessions", label: "Sessions & Privacy", icon: Lock, href: "/dashboard/security/privacy", permission: "security:read" },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { id: "system-health", label: "Health & Diagnostics", icon: HeartPulse, href: "/dashboard/system", permission: "system:read" },
      { id: "notifications", label: "Notifications", icon: Bell, href: "/dashboard/notifications", permission: "notifications:read" },
    ],
  },
  {
    title: "SETTINGS",
    items: [
      { id: "settings-org", label: "Organization", icon: Building2, href: "/dashboard/settings/organization", permission: "org:settings:read" },
      { id: "settings-sec", label: "Security", icon: Shield, href: "/dashboard/settings/security", permission: "org:settings:read" },
      { id: "settings-notif", label: "Notifications", icon: Bell, href: "/dashboard/settings/notifications", permission: "notifications:read" },
      { id: "settings-api", label: "API Settings", icon: Sliders, href: "/dashboard/settings/api", permission: "org:settings:read" },
      { id: "settings-bill", label: "Billing Settings", icon: CreditCard, href: "/dashboard/settings/billing", permission: "billing:manage" },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, organizations, currentOrg, currentMembership, switchOrganization, signOut } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  const role: OrganizationRole = currentMembership?.role || "OWNER";

  const displayName = userProfile?.name || user?.displayName || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";
  const currentOrgName = currentOrg?.name || (organizations.length > 0 ? organizations[0].organization.name : "My Workspace");

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  const isItemActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`shrink-0 bg-[#07080c] border-r border-[#161824] p-3.5 flex flex-col justify-between select-none min-h-screen transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-full lg:w-[250px]"
      }`}
    >
      <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-140px)] pr-1 custom-scrollbar">
        {/* Brand Header Logo */}
        <Link href="/" className="flex items-center gap-3 px-2 py-1.5 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#dfba82] via-[#f3ebd9] to-[#b8860b] p-0.5 shadow-[0_0_15px_rgba(223,186,130,0.35)] shrink-0">
            <div className="w-full h-full bg-[#07080c] rounded-full flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-[#dfba82] border-t-transparent animate-spin-slow" />
            </div>
          </div>
          {!collapsed && (
            <div>
              <div className="text-[14px] font-bold tracking-wider text-[#f4efe6] font-serif">
                OSTERDOPS
              </div>
              <div className="text-[9.5px] text-[#dfba82] font-medium tracking-tight">
                Enterprise AI Control
              </div>
            </div>
          )}
        </Link>

        {/* Categorized Navigation Sections */}
        <nav className="space-y-4 pt-1">
          {NAV_SECTIONS.map((section) => {
            const permittedItems = section.items.filter(
              (item) => !item.permission || hasPermission(role, item.permission)
            );

            if (permittedItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                {!collapsed && (
                  <div className="px-3 text-[10px] font-bold tracking-wider text-[#555a6d] uppercase">
                    {section.title}
                  </div>
                )}
                {permittedItems.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item.href);

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                        active
                          ? "bg-[#dfba82]/10 text-[#dfba82] font-semibold border border-[#dfba82]/30 shadow-[0_0_16px_rgba(223,186,130,0.1)]"
                          : "text-[#8e93a6] hover:text-white hover:bg-white/[0.04] border border-transparent"
                      }`}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          active ? "text-[#dfba82]" : "text-[#787d91]"
                        }`}
                      />
                      {!collapsed && (
                        <span className="text-[12.5px] tracking-tight">{item.label}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom User / Workspace Section */}
      <div className="pt-3 space-y-2 border-t border-[#161824] shrink-0">
        {/* Workspace Switcher */}
        {!collapsed ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] hover:border-[#dfba82]/30 transition-all text-xs cursor-pointer"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Building2 className="w-3.5 h-3.5 text-[#dfba82] shrink-0" />
                <span className="font-semibold text-white truncate text-[12px]">
                  {currentOrgName}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#73788c] shrink-0" />
            </button>

            {showWorkspaceMenu && (
              <div className="absolute bottom-full left-0 mb-1.5 w-full p-1.5 bg-[#0d0f18] border border-[#232738] rounded-xl shadow-2xl z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150">
                {organizations.length > 0 ? (
                  organizations.map((item) => (
                    <button
                      key={item.organization.id}
                      type="button"
                      onClick={() => {
                        switchOrganization(item.organization.id);
                        setShowWorkspaceMenu(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.05] text-left transition-colors cursor-pointer"
                    >
                      <div className="truncate">
                        <span className="text-[#c5c9d6] block truncate text-[12px]">{item.organization.name}</span>
                        <span className="text-[9px] text-[#73788c] uppercase">{item.membership.role}</span>
                      </div>
                      {currentOrg?.id === item.organization.id && (
                        <Check className="w-3.5 h-3.5 text-[#dfba82] shrink-0" />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="p-2 text-[#73788c] text-center text-[11px]">
                    {currentOrgName}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="w-full p-2 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] text-[#dfba82] flex items-center justify-center cursor-pointer"
            title="Expand Workspace"
          >
            <Building2 className="w-4 h-4" />
          </button>
        )}

        {/* User Card */}
        {user ? (
          !collapsed ? (
            <div className="p-2 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-[#dfba82] text-black font-bold text-[10px] flex items-center justify-center shrink-0">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-semibold text-white truncate">
                    {displayName}
                  </div>
                  <div className="text-[9.5px] text-[#73788c] uppercase">{role}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                title="Sign out"
                className="p-1 text-[#73788c] hover:text-[#e02424] transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div
              onClick={handleSignOut}
              title="Click to sign out"
              className="w-7 h-7 mx-auto rounded-full bg-[#dfba82] text-black font-bold text-xs flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
            >
              {initials}
            </div>
          )
        ) : (
          !collapsed && (
            <Link
              href="/sign-in"
              className="w-full block text-center py-1.5 px-3 bg-[#dfba82]/10 border border-[#dfba82]/30 hover:bg-[#dfba82]/20 text-[#dfba82] rounded-xl text-xs font-semibold transition-colors"
            >
              Sign In
            </Link>
          )
        )}

        {/* Collapse Trigger */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center gap-2 px-2 py-1 rounded-lg text-[#73788c] hover:text-[#dfba82] text-xs font-medium transition-colors cursor-pointer"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 mx-auto" />
          ) : (
            <>
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="text-[11px]">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
