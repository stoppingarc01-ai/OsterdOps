"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Users,
  FolderKanban,
  KeyRound,
  Coins,
  BellRing,
  ShieldCheck,
  FileText,
  Activity,
  Server,
  Settings,
  LayoutDashboard,
  Search,
  Lock,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { ContentTransition } from "@/components/layout/ContentTransition";

interface AdminNavTab {
  name: string;
  href: string;
  icon: React.ElementType;
}

const ADMIN_NAV_TABS: AdminNavTab[] = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Organization", href: "/admin/organization", icon: Building2 },
  { name: "Members & Roles", href: "/admin/members", icon: Users },
  { name: "Projects", href: "/admin/projects", icon: FolderKanban },
  { name: "API Keys", href: "/admin/api-keys", icon: KeyRound },
  { name: "Budgets", href: "/admin/budgets", icon: Coins },
  { name: "Alerts", href: "/admin/alerts", icon: BellRing },
  { name: "Security", href: "/admin/security", icon: ShieldCheck },
  { name: "Audit Logs", href: "/admin/audit", icon: FileText },
  { name: "Usage & Costs", href: "/admin/usage", icon: Activity },
  { name: "System Health", href: "/admin/system", icon: Server },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col font-sans selection:bg-[#dfba82] selection:text-black">
      {/* Top Enterprise Admin Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#090b10]/95 backdrop-blur-md border-b border-[#171b26] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#dfba82] to-[#b38e56] flex items-center justify-center text-black font-serif font-bold text-sm shadow-md">
              O
            </div>
            <div>
              <div className="text-sm font-bold text-white font-serif tracking-wider group-hover:text-[#dfba82] transition-colors">
                OsterdOps
              </div>
              <div className="text-[10px] uppercase tracking-widest text-[#717688] font-semibold">
                Enterprise Admin
              </div>
            </div>
          </Link>

          {/* Breadcrumbs */}
          <div className="hidden md:flex items-center gap-2 text-xs text-[#717688] border-l border-[#1b202e] pl-4">
            <Link href="/admin" className="hover:text-white transition-colors">
              Admin Console
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#dfba82] font-semibold">{title || "Overview"}</span>
          </div>
        </div>

        {/* Global Admin Status & Role Badge */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-xs font-semibold">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Control Center Active</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1b202e] border border-[#2b3044] text-xs text-white font-semibold">
            <Lock className="w-3.5 h-3.5 text-[#dfba82]" />
            <span>Role: OWNER</span>
          </div>
        </div>
      </header>

      {/* Admin Sub-Navigation Tabs */}
      <nav className="bg-[#0c0f16] border-b border-[#171b26] px-4 sm:px-6 py-2 overflow-x-auto custom-scrollbar flex items-center gap-1">
        {ADMIN_NAV_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "bg-[#dfba82] text-black shadow-md font-bold"
                  : "text-[#8e93a6] hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
        <ContentTransition>
          <div className="space-y-6">
            {(title || subtitle) && (
              <div className="pb-4 border-b border-[#171b26]">
                {title && (
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                    {title}
                  </h1>
                )}
                {subtitle && <p className="text-xs text-[#8e93a6] mt-1">{subtitle}</p>}
              </div>
            )}

            {children}
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}
