"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  Activity,
  Sparkles,
  Wallet,
  Bell,
  Plug,
  Users,
  FileBarChart,
  CreditCard,
  ShieldCheck,
  Settings,
  LogOut,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navigationGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Projects", href: "/dashboard/projects", icon: FolderKanban },
      { title: "Usage", href: "/dashboard/usage", icon: Activity },
      { title: "Optimization", href: "/dashboard/optimization", icon: Sparkles },
    ],
  },
  {
    label: "Governance",
    items: [
      { title: "Budgets", href: "/dashboard/budgets", icon: Wallet },
      { title: "Alerts", href: "/dashboard/alerts", icon: Bell },
      { title: "Integrations", href: "/dashboard/integrations", icon: Plug },
    ],
  },
  {
    label: "Organization",
    items: [
      { title: "Teams & Developers", href: "/dashboard/teams", icon: Users },
      { title: "Reports", href: "/dashboard/reports", icon: FileBarChart },
      { title: "Billing", href: "/dashboard/billing", icon: CreditCard },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Security & Audit", href: "/dashboard/security", icon: ShieldCheck },
      { title: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { currentOrg } = useAuth();

  return (
    <aside
      className={cn(
        "hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#090b10] h-full overflow-y-auto justify-between",
        className
      )}
    >
      <div>
        {/* Logo Bar */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200 dark:border-white/[0.08] shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-slate-950 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-105">
              O
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-white">
                OsterdOps
              </span>
              <span className="text-[10px] text-slate-400 font-mono">v1.4.0</span>
            </div>
          </Link>

          <Link
            href="/"
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
            title="Back to Landing Page"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Navigation List */}
        <nav className="p-4 flex flex-col gap-6">
          {navigationGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {group.label}
              </p>
              <div className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 text-xs rounded-xl font-medium transition-all duration-150",
                        isActive
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={cn("w-4 h-4", isActive ? "stroke-[2.2]" : "stroke-[1.75]")} />
                        <span>{item.title}</span>
                      </div>
                      {(item as any).badge && (
                        <span
                          className={cn(
                            "px-1.5 py-0.2 rounded-full text-[9px] font-mono",
                            isActive
                              ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          )}
                        >
                          {(item as any).badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* User profile footer in sidebar */}
      <div className="p-4 border-t border-slate-200 dark:border-white/[0.08]">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold font-mono">
              {(currentOrg?.name || "W")[0].toUpperCase()}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                {currentOrg?.name || "Workspace"}
              </span>
              <span className="text-[10px] text-slate-500">
                {currentOrg?.planTier ? `${currentOrg.planTier.toUpperCase()} Plan` : "Free Plan"}
              </span>
            </div>
          </div>

          <Link href="/login" title="Logout" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <LogOut className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
