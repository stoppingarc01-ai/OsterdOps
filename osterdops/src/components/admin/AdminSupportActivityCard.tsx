"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

interface SupportTicket {
  id: string;
  title: string;
  customer: string;
  timeAgo: string;
  status: "OPEN" | "PENDING" | "RESOLVED";
}

const SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: "tick_1",
    title: "API integration issue",
    customer: "Acme Inc.",
    timeAgo: "8 min ago",
    status: "OPEN",
  },
  {
    id: "tick_2",
    title: "Billing question",
    customer: "Nova Labs",
    timeAgo: "24 min ago",
    status: "PENDING",
  },
  {
    id: "tick_3",
    title: "Cannot access dashboard",
    customer: "Vertex AI",
    timeAgo: "41 min ago",
    status: "RESOLVED",
  },
];

interface AdminSupportActivityCardProps {
  onGoToInbox?: () => void;
}

export function AdminSupportActivityCard({ onGoToInbox }: AdminSupportActivityCardProps) {
  const getStatusBadge = (status: SupportTicket["status"]) => {
    switch (status) {
      case "OPEN":
        return "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30";
      case "PENDING":
        return "bg-[#f97316]/10 text-[#f97316] border-[#f97316]/30";
      case "RESOLVED":
        return "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/30";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-6 font-sans shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[12.5px] font-bold tracking-[0.12em] text-[#e8e4dc] uppercase">
            Support Activity
          </h3>
          <button
            onClick={onGoToInbox}
            className="text-[11.5px] text-[#717688] hover:text-white transition-colors"
          >
            View all
          </button>
        </div>

        {/* Ticket List */}
        <div className="space-y-4">
          {SUPPORT_TICKETS.map((ticket) => (
            <div
              key={ticket.id}
              onClick={onGoToInbox}
              className="flex items-start justify-between gap-3 p-3 rounded-xl hover:bg-white/[0.02] border border-transparent hover:border-[#1b202e] transition-all cursor-pointer group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#dfba82]" />
                  <span className="text-[13px] font-semibold text-[#f4efe6] group-hover:text-[#dfba82] transition-colors leading-tight">
                    {ticket.title}
                  </span>
                </div>
                <div className="text-[11.5px] text-[#717688] pl-3.5">
                  {ticket.customer}
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className="text-[11px] text-[#555a6d] font-mono">
                  {ticket.timeAgo}
                </span>
                <span
                  className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusBadge(
                    ticket.status
                  )}`}
                >
                  {ticket.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action Link */}
      <div className="pt-4 mt-4 border-t border-[#171b26]">
        <button
          onClick={onGoToInbox}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#dfba82] hover:text-[#ebd2a9] transition-colors group cursor-pointer"
        >
          <span>Go to Support Inbox</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
