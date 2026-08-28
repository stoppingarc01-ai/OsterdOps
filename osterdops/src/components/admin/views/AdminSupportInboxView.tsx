"use client";

import React, { useState } from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  Filter,
  Headphones,
  Mail,
  MessageSquare,
  Search,
  Send,
  User,
} from "lucide-react";

interface Ticket {
  id: string;
  subject: string;
  customer: string;
  email: string;
  preview: string;
  category: "API Gateway" | "Billing" | "Dashboard Access" | "Rate Limits";
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

const INITIAL_TICKETS: Ticket[] = [
  {
    id: "tick_101",
    subject: "API Gateway 429 Too Many Requests response",
    customer: "Acme Inc.",
    email: "sarah@acme.com",
    preview: "We hit our project monthly budget and need an emergency hard-limit override...",
    category: "API Gateway",
    priority: "HIGH",
    status: "OPEN",
    timeAgo: "8 min ago",
    messages: [
      {
        sender: "Sarah Jenkins",
        role: "customer",
        time: "8 min ago",
        text: "Hi OsterdOps team, our production extraction cron job was stopped with error 429: 'Monthly project budget exceeded'. Can we temporarily raise the hard limit to $1,000 for today?",
      },
    ],
  },
  {
    id: "tick_102",
    subject: "Invoicing and tax exemption verification",
    customer: "Nova Labs",
    email: "billing@novalabs.ai",
    preview: "We need our VAT ID included on all future OsterdOps monthly invoices...",
    category: "Billing",
    priority: "MEDIUM",
    status: "PENDING",
    timeAgo: "24 min ago",
    messages: [
      {
        sender: "Alex Rivera",
        role: "customer",
        time: "24 min ago",
        text: "Could you please add VAT ID EU-94819283 to our enterprise organization invoice before the end of the month?",
      },
    ],
  },
  {
    id: "tick_103",
    subject: "Cannot access team members settings tab",
    customer: "Vertex AI",
    email: "admin@vertex.io",
    preview: "Fixed: User role was set to Developer instead of Admin. Resolved.",
    category: "Dashboard Access",
    priority: "LOW",
    status: "RESOLVED",
    timeAgo: "41 min ago",
    messages: [
      {
        sender: "Michael Chang",
        role: "customer",
        time: "41 min ago",
        text: "I was unable to invite new teammates, but I realized my teammate had viewer role. Everything is working now!",
      },
      {
        sender: "Admin Prasad",
        role: "agent",
        time: "35 min ago",
        text: "Glad to hear that Michael! Let us know if you need anything else.",
      },
    ],
  },
];

export function AdminSupportInboxView() {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState<Ticket>(INITIAL_TICKETS[0]);
  const [replyText, setReplyText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const updated = {
      ...selectedTicket,
      status: "PENDING" as const,
      messages: [
        ...selectedTicket.messages,
        {
          sender: "Admin Prasad",
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
              className={`px-3 py-1 text-[11.5px] font-bold rounded-lg transition-colors ${
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

      {/* 2-Column Split: Ticket List + Ticket Detail Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Ticket Feed */}
        <div className="lg:col-span-5 space-y-3">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedTicket.id === ticket.id
                  ? "bg-[#141824] border-[#dfba82] shadow-[0_4px_16px_rgba(223,186,130,0.1)]"
                  : "bg-[#0c0f16] border-[#1b202e] hover:border-[#2b344a]"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold text-[#dfba82] font-mono">{ticket.id}</span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                      ticket.priority === "HIGH"
                        ? "bg-red-500/10 text-red-400 border-red-500/30"
                        : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                    }`}
                  >
                    {ticket.priority}
                  </span>
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                      ticket.status === "OPEN"
                        ? "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30"
                        : ticket.status === "PENDING"
                        ? "bg-orange-500/10 text-orange-400 border-orange-500/30"
                        : "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/30"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>
              </div>

              <h4 className="text-[13px] font-bold text-white mb-1 line-clamp-1">{ticket.subject}</h4>
              <p className="text-[11.5px] text-[#717688] line-clamp-2 mb-2">{ticket.preview}</p>

              <div className="flex items-center justify-between text-[10.5px] text-[#555a6d] pt-2 border-t border-[#1a1f2e]">
                <span>{ticket.customer}</span>
                <span>{ticket.timeAgo}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Active Ticket Thread */}
        <div className="lg:col-span-7 bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-6 flex flex-col justify-between min-h-[480px]">
          <div>
            {/* Ticket Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#1b202e] mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-mono text-[#dfba82] font-semibold">
                    {selectedTicket.id}
                  </span>
                  <span className="text-[11px] text-[#555a6d]">&bull;</span>
                  <span className="text-[11.5px] text-[#8e94a8]">{selectedTicket.category}</span>
                </div>
                <h3 className="text-[16px] font-bold text-white">{selectedTicket.subject}</h3>
                <div className="flex items-center gap-3 text-[11.5px] text-[#717688] mt-1">
                  <span>Customer: <strong className="text-white">{selectedTicket.customer}</strong></span>
                  <span>({selectedTicket.email})</span>
                </div>
              </div>

              <button
                onClick={handleMarkResolved}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#22c55e]/10 hover:bg-[#22c55e]/20 border border-[#22c55e]/30 text-[#22c55e] text-[11.5px] font-semibold transition-colors shrink-0"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Mark Resolved</span>
              </button>
            </div>

            {/* Message History */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-4">
              {selectedTicket.messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl text-[12.5px] leading-relaxed ${
                    m.role === "agent"
                      ? "bg-[#161a26] border border-[#252c40] ml-6 text-[#f4efe6]"
                      : "bg-[#090b11] border border-[#1a1f2e] mr-6 text-[#c5c8d4]"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10.5px] text-[#717688] mb-1.5 font-medium">
                    <span className="text-[#dfba82] font-semibold">{m.sender}</span>
                    <span>{m.time}</span>
                  </div>
                  <p>{m.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reply Box */}
          <form onSubmit={handleSendReply} className="pt-3 border-t border-[#1b202e] space-y-3">
            <textarea
              rows={3}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${selectedTicket.customer}...`}
              className="w-full bg-[#131722] border border-[#22283a] text-white text-[12.5px] rounded-xl p-3 focus:outline-none focus:border-[#dfba82]"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#555a6d]">Supports markdown and code snippets</span>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-[#dfba82] hover:bg-[#ebd2a9] text-[#07080c] font-bold text-[12px] rounded-xl transition-all shadow-[0_2px_12px_rgba(223,186,130,0.25)]"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send Reply</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
