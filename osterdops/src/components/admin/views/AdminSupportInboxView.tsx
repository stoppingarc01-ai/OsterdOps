"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  CornerDownLeft,
  Filter,
  MessageSquare,
  Search,
  Send,
  ShieldAlert,
  User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Ticket {
  id: string;
  subject: string;
  customer: string;
  email: string;
  preview: string;
  category: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "OPEN" | "PENDING" | "RESOLVED";
  timeAgo: string;
  messages: Array<{
    sender: string;
    role: "customer" | "agent";
    time: string;
    text: string;
  }>;
}

export function AdminSupportInboxView() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    const updated = {
      ...selectedTicket,
      status: "PENDING" as const,
      messages: [
        ...selectedTicket.messages,
        {
          sender: user?.displayName || "Support Agent",
          role: "agent" as const,
          time: "Just now",
          text: replyText,
        },
      ],
    };

    setSelectedTicket(updated);
    setTickets(tickets.map((t) => (t.id === updated.id ? updated : t)));
    setReplyText("");
  };

  const handleMarkResolved = () => {
    if (!selectedTicket) return;
    const updated = { ...selectedTicket, status: "RESOLVED" as const };
    setSelectedTicket(updated);
    setTickets(tickets.map((t) => (t.id === updated.id ? updated : t)));
  };

  const filteredTickets = tickets.filter(
    (t) => filterStatus === "ALL" || t.status === filterStatus
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-[#f4efe6]">Support Ticket Inbox</h2>
          <p className="text-[12.5px] text-[#717688]">
            Respond to developer queries, gateway configuration help, and customer support tickets.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 bg-[#0c0f16] border border-[#1b202e] p-1 rounded-xl">
          {["ALL", "OPEN", "PENDING", "RESOLVED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 text-[11.5px] font-bold rounded-lg transition-colors cursor-pointer ${
                filterStatus === st
                  ? "bg-[#dfba82] text-[#07080c]"
                  : "text-[#717688] hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="p-16 text-center text-xs text-[#73788c] bg-[#0c0f16] rounded-2xl border border-[#1b202e] space-y-2">
          <div className="w-10 h-10 rounded-full bg-[#dfba82]/10 text-[#dfba82] flex items-center justify-center mx-auto mb-2">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="text-sm font-semibold text-white">Inbox Zero</div>
          <p className="text-[11px] text-[#73788c] max-w-sm mx-auto">
            No active support tickets currently in queue. Inbound customer queries and platform help requests will arrive here.
          </p>
        </div>
      ) : (
        /* 2-Column Split: Ticket List + Ticket Detail Chat */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Ticket Feed */}
          <div className="lg:col-span-5 space-y-3">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedTicket?.id === ticket.id
                    ? "bg-[#141824] border-[#dfba82] shadow-[0_4px_16px_rgba(223,186,130,0.1)]"
                    : "bg-[#0c0f16] border-[#1b202e] hover:border-[#2b344a]"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono text-[#717688]">{ticket.id}</span>
                  <span
                    className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      ticket.priority === "HIGH"
                        ? "bg-rose-950/60 text-rose-400 border-rose-800/40"
                        : ticket.priority === "MEDIUM"
                        ? "bg-amber-950/60 text-amber-400 border-amber-800/40"
                        : "bg-blue-950/60 text-blue-400 border-blue-800/40"
                    }`}
                  >
                    {ticket.priority}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white line-clamp-1">{ticket.subject}</h4>
                <p className="text-xs text-[#8e94a8] line-clamp-2 mt-1">{ticket.preview}</p>
                <div className="flex items-center justify-between text-[11px] text-[#717688] mt-3 pt-2 border-t border-[#171b26]">
                  <span>{ticket.customer}</span>
                  <span>{ticket.timeAgo}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Ticket Thread View */}
          {selectedTicket && (
            <div className="lg:col-span-7 bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between pb-4 border-b border-[#171b26]">
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedTicket.subject}</h3>
                    <div className="text-xs text-[#8e94a8] mt-1">
                      From: <strong className="text-white">{selectedTicket.customer}</strong> ({selectedTicket.email})
                    </div>
                  </div>
                  <button
                    onClick={handleMarkResolved}
                    className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold hover:bg-emerald-500/20"
                  >
                    Mark Resolved
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedTicket.messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl text-xs ${
                        m.role === "agent"
                          ? "bg-[#141824] border border-[#dfba82]/20 ml-6"
                          : "bg-[#07080c] border border-[#171b26] mr-6"
                      }`}
                    >
                      <div className="flex justify-between font-bold text-white mb-1">
                        <span>{m.sender}</span>
                        <span className="text-[10px] text-[#717688] font-normal">{m.time}</span>
                      </div>
                      <p className="text-[#c5c8d4] leading-relaxed">{m.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSendReply} className="flex gap-2 pt-4 border-t border-[#171b26]">
                <input
                  type="text"
                  placeholder="Type a response to this customer..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 bg-[#111422] border border-[#1b202e] rounded-xl px-4 py-2 text-xs text-white placeholder-[#555a6d] focus:outline-none focus:border-[#dfba82]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#dfba82] text-black font-semibold text-xs rounded-xl hover:bg-[#ebd2a9]"
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
