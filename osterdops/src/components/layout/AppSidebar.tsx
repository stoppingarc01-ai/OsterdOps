"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LineChart,
  Activity,
  Boxes,
  Wallet,
  CreditCard,
  KeyRound,
  Workflow,
  ShieldCheck,
  FileCheck2,
  ChevronDown,
  Building2,
  ChevronLeft,
  ChevronRight,
  Check,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSubscriptionAccess } from "@/hooks/useSubscriptionAccess";
import { TrialBadge } from "@/components/billing/TrialBadge";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { hasPermission, type Permission } from "@/lib/auth/permissions";
import type { OrganizationRole } from "@/types";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: "live" | "tier";
  permission?: Permission;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

/**
 * Clean, consolidated 4-category navigation structure:
 * 1. CORE OPERATIONS: High-frequency operational dashboards & telemetry
 * 2. AI GATEWAY & CONTROL: Proxy endpoints, keys, providers & models
 * 3. SECURITY & GOVERNANCE: Compliance, firewall posture, budget rate limits & audit trails
 * 4. MANAGEMENT: Subscription tier, billing & tenant organization settings
 */
const NAV_SECTIONS: NavSection[] = [
  {
    title: "CORE OPERATIONS",
    items: [
      { id: "overview", label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
      { id: "telemetry", label: "Live Telemetry", icon: Activity, href: "/dashboard/requests", badge: "live", permission: "usage:read" },
      { id: "analytics", label: "Cost Analytics", icon: LineChart, href: "/dashboard/analytics", permission: "usage:read" },
    ],
  },
  {
    title: "AI GATEWAY & CONTROL",
    items: [
      { id: "api-keys", label: "API Proxy Keys", icon: KeyRound, href: "/dashboard/api-keys", permission: "keys:read" },
      { id: "integrations", label: "Provider Integrations", icon: Workflow, href: "/dashboard/integrations", permission: "integrations:read" },
      { id: "models", label: "Model Hub", icon: Boxes, href: "/dashboard/models" },
    ],
  },
  {
    title: "SECURITY & GOVERNANCE",
    items: [
      { id: "security", label: "Security Center", icon: ShieldCheck, href: "/dashboard/security", permission: "security:read" },
      { id: "budgets", label: "Budget Caps & Limits", icon: Wallet, href: "/dashboard/budgets", permission: "budgets:read" },
      { id: "audit-logs", label: "Audit Logs", icon: FileCheck2, href: "/dashboard/audit-logs", permission: "audit:read" },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      { id: "subscription", label: "Subscription & Billing", icon: CreditCard, href: "/dashboard/subscription", badge: "tier", permission: "billing:read" },
      { id: "settings", label: "Organization Settings", icon: Building2, href: "/dashboard/settings", permission: "org:settings:read" },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, organizations, currentOrg, currentMembership, switchOrganization, signOut } = useAuth();
  const { isTrial, daysRemaining, planId } = useSubscriptionAccess();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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

  // Precise nested route matching: select the longest matching nav item href so sibling routes aren't doubly activated
  const activeHref = useMemo(() => {
    const allHrefs = NAV_SECTIONS.flatMap((s) => s.items.map((i) => i.href));
    // Also consider /dashboard/billing as matching subscription
    const matching = allHrefs.filter((href) => {
      if (href === "/dashboard") {
        return pathname === "/dashboard";
      }
      if (href === "/dashboard/subscription" && pathname.startsWith("/dashboard/billing")) {
        return true;
      }
      return pathname === href || pathname.startsWith(href + "/");
    });

    if (matching.length === 0) {
      return pathname === "/dashboard" ? "/dashboard" : "";
    }

    return matching.sort((a, b) => b.length - a.length)[0];
  }, [pathname]);

  const isItemActive = (href: string) => {
    if (href === "/dashboard/subscription" && pathname.startsWith("/dashboard/billing")) {
      return true;
    }
    return href === activeHref;
  };

  const renderNavigationSections = (onItemClick?: () => void, isCompact = false) => (
    <nav className="space-y-4 pt-1">
      {NAV_SECTIONS.map((section) => {
        const permittedItems = section.items.filter(
          (item) => !item.permission || hasPermission(role, item.permission)
        );

        if (permittedItems.length === 0) return null;

        return (
          <div key={section.title} className="space-y-1">
            {!isCompact && (
              <div className="px-3 text-[10px] font-bold tracking-wider text-slate-400 dark:text-[#555a6d] uppercase font-mono">
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
                  onClick={onItemClick}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all duration-200 cursor-pointer group ${
                    active
                      ? "bg-[#dfba82]/10 text-[#966d2a] dark:text-[#dfba82] font-semibold border-l-2 border-[#dfba82] border-y border-r border-[#dfba82]/30 shadow-[0_0_16px_rgba(223,186,130,0.12)] pl-2.5"
                      : "text-slate-600 dark:text-[#8e93a6] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04] border border-transparent"
                  }`}
                  title={isCompact ? item.label : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      active ? "text-[#966d2a] dark:text-[#dfba82]" : "text-slate-400 dark:text-[#787d91]"
                    }`}
                  />
                  {!isCompact && (
                    <span className="text-[12.5px] tracking-tight">{item.label}</span>
                  )}
                  {!isCompact && item.badge === "live" && (
                    <span className="ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-semibold">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                      </span>
                      <span>LIVE</span>
                    </span>
                  )}
                  {!isCompact && item.badge === "tier" && (
                    <span className="ml-auto px-1.5 py-0.5 rounded-md bg-[#dfba82]/15 border border-[#dfba82]/30 text-[#dfba82] text-[9.5px] font-bold font-mono">
                      {isTrial ? `${daysRemaining}d Trial` : (planId || "PRO").toUpperCase()}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* 1. Mobile Top Header Bar (renders strictly on < lg screens) */}
      <div className="lg:hidden w-full bg-white dark:bg-[#07080c] border-b border-slate-200 dark:border-[#161824] px-4 py-2.5 flex items-center justify-between z-30 sticky top-0">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="relative w-7 h-7 flex items-center justify-center shrink-0 drop-shadow-[0_0_8px_rgba(223,178,119,0.35)]">
            <Image
              src="/osterdops-logo.png"
              alt="OsterdOps"
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Osterd<span className="text-[#DFB277]">Ops</span>
            </div>
            <div className="text-[9px] text-[#DFB277] font-medium leading-none">
              AI Gateway
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#0d0f18] border border-slate-200 dark:border-[#1b1e2c] text-[11px] font-medium text-slate-700 dark:text-[#c5c9d6] truncate max-w-[140px]">
            {currentOrgName}
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#0f111c] border border-slate-200 dark:border-[#232738] text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white hover:border-[#dfba82]/40 transition-colors"
            aria-label="Open Mobile Navigation"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Mobile Slide-Over Drawer Overlay (unmounted when closed, never blocks clicks) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Canvas */}
          <div className="relative w-80 max-w-[85vw] bg-white dark:bg-[#07080c] border-r border-slate-200 dark:border-[#161824] h-full flex flex-col justify-between p-4 shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#161824]">
              <div className="flex items-center gap-2.5">
                <Image
                  src="/osterdops-logo.png"
                  alt="OsterdOps"
                  width={28}
                  height={28}
                  className="object-contain"
                />
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  Osterd<span className="text-[#DFB277]">Ops</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-[#787d91] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors"
                aria-label="Close navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Navigation */}
            <div className="flex-1 overflow-y-auto py-3 space-y-4 custom-scrollbar">
              {renderNavigationSections(() => setMobileOpen(false), false)}
            </div>

            {/* Drawer Footer */}
            <div className="pt-3 border-t border-slate-200 dark:border-[#161824] space-y-3">
              {/* Theme Switcher Segmented */}
              <div className="px-1">
                <div className="text-[10px] font-bold text-slate-400 dark:text-[#656a7d] uppercase tracking-wider mb-1.5 font-mono">
                  Appearance
                </div>
                <ThemeToggle variant="segmented" />
              </div>

              <div className="px-1">
                <TrialBadge />
              </div>

              {user ? (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0c0e17] border border-slate-200 dark:border-[#1b1e2c] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-[#dfba82] text-black font-bold text-[10px] flex items-center justify-center shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12px] font-semibold text-slate-900 dark:text-white truncate">{displayName}</div>
                      <div className="text-[9.5px] text-slate-500 dark:text-[#73788c] uppercase">{role}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      handleSignOut();
                    }}
                    title="Sign out"
                    className="p-1 text-slate-400 dark:text-[#73788c] hover:text-[#e02424] transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className="w-full block text-center py-2 px-3 bg-[#dfba82]/10 border border-[#dfba82]/30 text-[#dfba82] rounded-xl text-xs font-semibold"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Desktop Persistent Sidebar (strictly on lg:flex screens) */}
      <aside
        className={`hidden lg:flex shrink-0 bg-white dark:bg-[#07080c] border-r border-slate-200 dark:border-[#161824] p-3.5 flex-col justify-between select-none min-h-screen transition-all duration-300 ${
          collapsed ? "w-[72px]" : "w-[250px]"
        }`}
      >
        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-210px)] pr-1 custom-scrollbar">
          {/* Brand Header Logo */}
          <Link href="/" className="flex items-center gap-3 px-2 py-1.5 group">
            <div className="relative w-8 h-8 flex items-center justify-center shrink-0 drop-shadow-[0_0_12px_rgba(223,178,119,0.4)] group-hover:scale-105 transition-transform">
              <Image
                src="/osterdops-logo.png"
                alt="OsterdOps"
                width={32}
                height={32}
                className="object-contain w-full h-full"
              />
            </div>
            {!collapsed && (
              <div>
                <div className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white font-sans">
                  Osterd<span className="text-[#DFB277]">Ops</span>
                </div>
                <div className="text-[9.5px] text-[#DFB277] font-medium tracking-tight">
                  AI Gateway &amp; FinOps
                </div>
              </div>
            )}
          </Link>

          {/* Navigation Sections */}
          {renderNavigationSections(undefined, collapsed)}
        </div>

        {/* Bottom Sidebar Deck */}
        <div className="pt-3 border-t border-slate-200 dark:border-[#161824] space-y-2.5">
          {/* Dual Theme Switcher (Sidebar Footer Deck) */}
          {!collapsed ? (
            <div className="px-1">
              <div className="text-[9.5px] font-bold text-slate-400 dark:text-[#656a7d] uppercase tracking-wider mb-1 px-1 font-mono">
                Appearance
              </div>
              <ThemeToggle variant="segmented" />
            </div>
          ) : (
            <div className="flex justify-center">
              <ThemeToggle variant="icon" />
            </div>
          )}

          {/* Workspace Switcher */}
          {!collapsed ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#0c0e17] border border-slate-200 dark:border-[#1b1e2c] hover:border-[#dfba82]/40 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-md bg-[#dfba82]/10 border border-[#dfba82]/30 flex items-center justify-center shrink-0">
                    <Building2 className="w-3 h-3 text-[#dfba82]" />
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white truncate text-[12px]">
                    {currentOrgName}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-[#73788c] shrink-0" />
              </button>

              {showWorkspaceMenu && (
                <div className="absolute bottom-full left-0 mb-1.5 w-full p-1.5 bg-white dark:bg-[#0d0f18] border border-slate-200 dark:border-[#232738] rounded-xl shadow-2xl z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  {organizations.length > 0 ? (
                    organizations.map((item) => (
                      <button
                        key={item.organization.id}
                        type="button"
                        onClick={() => {
                          switchOrganization(item.organization.id);
                          setShowWorkspaceMenu(false);
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.05] text-left transition-colors cursor-pointer"
                      >
                        <div className="truncate">
                          <span className="text-slate-700 dark:text-[#c5c9d6] block truncate text-[12px]">{item.organization.name}</span>
                          <span className="text-[9px] text-slate-400 dark:text-[#73788c] uppercase">{item.membership.role}</span>
                        </div>
                        {currentOrg?.id === item.organization.id && (
                          <Check className="w-3.5 h-3.5 text-[#dfba82] shrink-0" />
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="p-2 text-slate-400 dark:text-[#73788c] text-center text-[11px]">
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
              className="w-full p-2 rounded-xl bg-slate-50 dark:bg-[#0c0e17] border border-slate-200 dark:border-[#1b1e2c] text-[#dfba82] flex items-center justify-center cursor-pointer"
              title="Expand Workspace"
            >
              <Building2 className="w-4 h-4" />
            </button>
          )}

          {/* Trial Badge */}
          {!collapsed && (
            <div className="px-1">
              <TrialBadge />
            </div>
          )}

          {/* User Card */}
          {user ? (
            !collapsed ? (
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#0c0e17] border border-slate-200 dark:border-[#1b1e2c] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-[#dfba82] text-black font-bold text-[10px] flex items-center justify-center shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-semibold text-slate-900 dark:text-white truncate">
                      {displayName}
                    </div>
                    <div className="text-[9.5px] text-slate-500 dark:text-[#73788c] uppercase">{role}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign out"
                  className="p-1 text-slate-400 dark:text-[#73788c] hover:text-[#e02424] transition-colors cursor-pointer shrink-0"
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
                className="w-full block text-center py-1.5 px-3 bg-[#dfba82]/10 border border-[#dfba82]/30 hover:bg-[#dfba82]/20 text-[#966d2a] dark:text-[#dfba82] rounded-xl text-xs font-semibold transition-colors"
              >
                Sign In
              </Link>
            )
          )}

          {/* Collapse Trigger */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-2 px-2 py-1 rounded-lg text-slate-500 dark:text-[#73788c] hover:text-[#966d2a] dark:hover:text-[#dfba82] text-xs font-medium transition-colors cursor-pointer"
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
    </>
  );
}
