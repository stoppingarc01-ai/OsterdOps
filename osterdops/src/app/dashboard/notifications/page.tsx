"use client";

import React, { useEffect, useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { Bell, AlertOctagon, CheckCircle2, BadgeDollarSign, Settings, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";

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

export default function NotificationsPage() {
  const { currentOrg, getIdToken } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchNotifications() {
      if (!currentOrg?.id) return;
      setLoading(true);

      try {
        const token = await getIdToken();
        const res = await apiRequest<any[]>("/api/v1/alerts", {
          params: { organizationId: currentOrg.id },
          token,
        });

        if (!isMounted) return;

        if (res.data && Array.isArray(res.data)) {
          const mapped: NotificationItem[] = res.data.map((a: any) => ({
            id: a.id,
            category: a.type?.includes("BUDGET") ? "BUDGET" : a.type?.includes("SECURITY") ? "SECURITY" : "SYSTEM",
            severity: a.severity || "MEDIUM",
            title: a.type || "System Alert",
            message: a.message || `Governance event detected on ${a.resourceName || "workspace resource"}.`,
            timestamp: a.createdAt ? new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
            read: a.status === "RESOLVED",
            linkHref: "/dashboard/alerts",
          }));
          setNotifications(mapped);
        } else {
          setNotifications([]);
        }
      } catch (err) {
        if (isMounted) setNotifications([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchNotifications();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken]);

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

            {loading ? (
              <div className="p-12 text-center text-xs text-[#8e93a6] space-y-2">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#dfba82]" />
                <div>Loading notifications...</div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 rounded-2xl bg-[#0d0f18] border border-[#1d202e] text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-950/40 border border-emerald-800/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="text-sm font-semibold text-white">No notifications</div>
                <p className="text-xs text-[#8e93a6] max-w-sm mx-auto">
                  You are all caught up! Real-time alerts, budget warnings, and gateway notifications will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                      n.read
                        ? "bg-[#0d0f18]/60 border-[#1a1d2b] opacity-80"
                        : "bg-[#0d0f18] border-[#222738] hover:border-[#dfba82]/40"
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-[#141726] border border-[#232738] shrink-0 mt-0.5">
                      {getCategoryIcon(n.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white truncate">{n.title}</h4>
                          <span
                            className={`px-1.5 py-0.2 text-[9px] font-bold rounded uppercase ${
                              n.severity === "HIGH" || n.severity === "CRITICAL"
                                ? "bg-rose-950/50 text-rose-300 border border-rose-800/40"
                                : "bg-blue-950/50 text-blue-300 border border-blue-800/40"
                            }`}
                          >
                            {n.severity}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#73788c] font-mono shrink-0">{n.timestamp}</span>
                      </div>
                      <p className="text-xs text-[#a0a5b8] mt-1 leading-relaxed">{n.message}</p>
                      {n.linkHref && (
                        <Link
                          href={n.linkHref}
                          className="inline-block text-[11px] text-[#dfba82] hover:underline mt-2 font-medium"
                        >
                          View Details →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}
