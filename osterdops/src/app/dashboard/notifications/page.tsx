"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { Bell, AlertOctagon, CheckCircle2, BadgeDollarSign, Settings, Check } from "lucide-react";
import Link from "next/link";

interface NotificationItem {
  id: string;
  category: "BUDGET" | "SECURITY" | "BILLING" | "SYSTEM";
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkHref?: string;
}

const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  { id: "notif_01", category: "BUDGET", severity: "HIGH", title: "Budget Limit Warning (74.2%)", message: "Customer Support Agent has spent $74.20 of its $100.00 monthly quota.", timestamp: "15 mins ago", read: false, linkHref: "/dashboard/budgets" },
  { id: "notif_02", category: "SECURITY", severity: "HIGH", title: "API Key Authentication Anomaly", message: "Multiple invalid secret tokens presented to the gateway proxy.", timestamp: "1 hour ago", read: false, linkHref: "/dashboard/security/events" },
  { id: "notif_03", category: "BILLING", severity: "INFO", title: "Monthly Invoice Paid", message: "Invoice inv_2026_08 for $49.00 was processed successfully.", timestamp: "4 hours ago", read: true, linkHref: "/dashboard/billing/invoices" },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(SAMPLE_NOTIFICATIONS);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getCategoryIcon = (cat: NotificationItem["category"]) => {
    switch (cat) {
      case "BUDGET":
        return <BadgeDollarSign className="w-4 h-4 text-[#dfba82]" />;
      case "SECURITY":
        return <AlertOctagon className="w-4 h-4 text-rose-400" />;
      case "BILLING":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default:
        return <Bell className="w-4 h-4 text-blue-400" />;
    }
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
                  <Bell className="w-3.5 h-3.5" />
                  Dispatch & Feeds
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  Notification Center
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161928] hover:bg-[#202538] text-xs font-semibold text-white transition-colors cursor-pointer border border-[#24293d]"
                >
                  <Check className="w-3.5 h-3.5" />
                  Mark All Read
                </button>
                <Link
                  href="/dashboard/settings/notifications"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111422] border border-[#1d2136] text-xs font-semibold hover:border-[#dfba82]/40 transition-all"
                >
                  <Settings className="w-3.5 h-3.5 text-[#dfba82]" />
                  Preferences
                </Link>
              </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border transition-all ${
                    n.read
                      ? "bg-[#0c0e17] border-[#1b1e2c]"
                      : "bg-[#111422] border-[#dfba82]/30 shadow-[0_0_15px_rgba(223,186,130,0.06)]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#161928] shrink-0 mt-0.5">{getCategoryIcon(n.category)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{n.title}</span>
                        <span className="text-[10px] text-[#73788c]">{n.timestamp}</span>
                      </div>
                      <p className="text-xs text-[#8e93a6]">{n.message}</p>
                      {n.linkHref && (
                        <div className="pt-1">
                          <Link href={n.linkHref} className="text-[11px] font-semibold text-[#dfba82] hover:underline">
                            View details &rarr;
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}
