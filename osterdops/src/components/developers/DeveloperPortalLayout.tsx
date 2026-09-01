"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Code2,
  Rocket,
  BookOpen,
  Activity,
  KeyRound,
  Boxes,
  Webhook,
  ShieldAlert,
  Search,
  Stethoscope,
  Play,
  Gauge,
} from "lucide-react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { DocsSearchModal } from "./DocsSearchModal";

interface NavTab {
  name: string;
  href: string;
  icon: React.ElementType;
}

const DEVELOPER_TABS: NavTab[] = [
  { name: "Overview", href: "/dashboard/developers", icon: Code2 },
  { name: "Playground", href: "/dashboard/developers/playground", icon: Play },
  { name: "Quick Start", href: "/dashboard/developers/quickstart", icon: Rocket },
  { name: "API Reference", href: "/dashboard/developers/api", icon: BookOpen },
  { name: "Request Inspector", href: "/dashboard/developers/requests", icon: Activity },
  { name: "Usage & Limits", href: "/dashboard/developers/usage", icon: Gauge },
  { name: "API Keys", href: "/dashboard/developers/api-keys", icon: KeyRound },
  { name: "Providers", href: "/dashboard/developers/providers", icon: Boxes },
  { name: "Webhooks", href: "/dashboard/developers/webhooks", icon: Webhook },
  { name: "Errors", href: "/dashboard/developers/errors", icon: ShieldAlert },
];

export function DeveloperPortalLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6">
            {/* Header with Title and Search Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#dfba82] tracking-wider uppercase mb-1">
                  <Code2 className="w-3.5 h-3.5" />
                  Developer Platform & SDKs
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  {title || "Developer Portal"}
                </h1>
                {subtitle && <p className="text-xs text-[#8e93a6] mt-1">{subtitle}</p>}
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] hover:border-[#dfba82]/40 text-xs text-[#8e93a6] hover:text-white transition-all cursor-pointer shadow-sm"
                >
                  <Search className="w-3.5 h-3.5 text-[#dfba82]" />
                  <span>Search docs...</span>
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[#161928] text-[10px] font-mono text-[#73788c]">
                    ⌘K
                  </kbd>
                </button>

                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/30 text-emerald-400 text-xs font-semibold">
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>v1.0 API Ready</span>
                </div>
              </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-[#161824] custom-scrollbar">
              {DEVELOPER_TABS.map((tab) => {
                const Icon = tab.icon;
                const active = pathname === tab.href;

                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      active
                        ? "bg-[#dfba82]/15 text-[#dfba82] border border-[#dfba82]/30 shadow-[0_0_12px_rgba(223,186,130,0.15)]"
                        : "text-[#8e93a6] hover:text-white hover:bg-white/[0.03] border border-transparent"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? "text-[#dfba82]" : "text-[#73788c]"}`} />
                    <span>{tab.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Main Content Body */}
            <div>{children}</div>
          </div>
        </ContentTransition>
      </main>

      <DocsSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
