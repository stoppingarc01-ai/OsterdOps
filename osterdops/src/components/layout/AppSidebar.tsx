"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BadgeDollarSign,
  Cpu,
  FolderKanban,
  Users,
  Wallet,
  ShieldCheck,
  Bell,
  Sparkles,
  Settings,
  ChevronDown,
  Building2,
  ChevronLeft,
  ChevronRight,
  Palette,
  Check,
} from "lucide-react";
import { useThemeCustomizer } from "@/context/ThemeCustomizerContext";

interface AppSidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { id: "spend", label: "Spend", icon: BadgeDollarSign, href: "/billing" },
  { id: "models", label: "Models", icon: Cpu, href: "/models" },
  { id: "projects", label: "Projects", icon: FolderKanban, href: "/dashboard" },
  { id: "teams", label: "Teams", icon: Users, href: "/teams" },
  { id: "budgets", label: "Budgets", icon: Wallet, href: "/budgets" },
  { id: "policies", label: "Policies", icon: ShieldCheck, href: "/settings" },
  { id: "alerts", label: "Alerts", icon: Bell, href: "/dashboard" },
  { id: "optimization", label: "Optimization", icon: Sparkles, href: "/optimization" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
  { id: "admin", label: "Admin Console", icon: ShieldCheck, href: "/admin" },
];

const WORKSPACES = [
  { id: "acme", name: "Acme Corporation", tier: "Enterprise" },
  { id: "prod", name: "Acme Corp - Production", tier: "PROD" },
  { id: "staging", name: "Acme Corp - Staging", tier: "STG" },
];

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const pathname = usePathname();
  const { accent } = useThemeCustomizer();
  const [collapsed, setCollapsed] = useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(WORKSPACES[0]);

  // Determine active item based on current selection
  const isItemActive = (id: string) => {
    if (pathname === "/models") return id === "models";
    if (pathname === "/optimization") return id === "optimization";
    if (pathname === "/teams") return id === "teams";
    if (pathname === "/billing") return id === "spend";
    if (pathname === "/budgets") return id === "budgets";
    if (pathname === "/settings") return id === "settings";
    if (pathname === "/dashboard") return id === "overview";
    return activeTab ? activeTab === id : id === "settings";
  };

  return (
    <aside
      className={`shrink-0 bg-[#07080c] border-r border-[#161824] p-4 flex flex-col justify-between select-none min-h-screen transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-full lg:w-[240px]"
      }`}
    >
      <div className="space-y-6">
        {/* Brand Header Logo */}
        <Link href="/" className="flex items-center gap-3 px-2 py-1 group">
          {/* Gold Luxury Ring Icon */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#dfba82] via-[#f3ebd9] to-[#b8860b] p-0.5 shadow-[0_0_15px_rgba(223,186,130,0.35)] shrink-0">
            <div className="w-full h-full bg-[#07080c] rounded-full flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-[#dfba82] border-t-transparent animate-spin-slow" />
            </div>
          </div>
          {!collapsed && (
            <div>
              <div className="text-[14.5px] font-bold tracking-wider text-[#f4efe6] font-serif">
                OSTERDOPS
              </div>
              <div className="text-[10px] text-[#dfba82] font-medium tracking-tight">
                AI Cost Governance
              </div>
            </div>
          )}
        </Link>

        {/* Primary Navigation List */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.id);

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => onTabChange && onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                  active
                    ? "bg-[#dfba82]/10 text-[#dfba82] font-semibold border border-[#dfba82]/30 shadow-[0_0_16px_rgba(223,186,130,0.12)]"
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
                  <span className="text-[13px] tracking-tight">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom User / Workspace Section */}
      <div className="pt-4 space-y-2 border-t border-[#161824]">
        {/* Workspace Switcher */}
        {!collapsed ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] hover:border-[#dfba82]/30 transition-all text-xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <Building2 className="w-4 h-4 text-[#dfba82] shrink-0" />
                <span className="font-semibold text-white truncate text-[12.5px]">
                  {selectedWorkspace.name}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#73788c] shrink-0" />
            </button>

            {showWorkspaceMenu && (
              <div className="absolute bottom-full left-0 mb-1.5 w-full p-1.5 bg-[#0d0f18] border border-[#232738] rounded-xl shadow-2xl z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150">
                {WORKSPACES.map((ws) => (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => {
                      setSelectedWorkspace(ws);
                      setShowWorkspaceMenu(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.05] text-left transition-colors cursor-pointer"
                  >
                    <span className="text-[#c5c9d6]">{ws.name}</span>
                    {selectedWorkspace.id === ws.id && (
                      <Check className="w-3.5 h-3.5 text-[#dfba82]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="w-full p-2.5 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] text-[#dfba82] flex items-center justify-center cursor-pointer"
            title="Expand Workspace"
          >
            <Building2 className="w-4 h-4" />
          </button>
        )}

        {/* User Card */}
        {!collapsed ? (
          <div className="p-2.5 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#dfba82] text-black font-bold text-[11px] flex items-center justify-center shrink-0">
              SP
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[12.5px] font-semibold text-white truncate">
                Shaan Prasad
              </div>
              <div className="text-[10px] text-[#73788c]">Admin</div>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto rounded-full bg-[#dfba82] text-black font-bold text-xs flex items-center justify-center">
            SP
          </div>
        )}

        {/* Collapse Trigger */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#73788c] hover:text-[#dfba82] text-xs font-medium transition-colors cursor-pointer"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 mx-auto" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
