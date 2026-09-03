"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  RotateCw,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  Check,
  ExternalLink,
  MoreVertical,
  Eye,
  EyeOff,
  Edit3,
  Send,
  Database,
  Bell,
  Zap,
  FileText,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  X,
  Plus,
  ArrowRight,
  Activity,
  CheckSquare,
  Square,
  KeyRound,
  Lock,
} from "lucide-react";
import { DeveloperPortalLayout } from "@/components/developers/DeveloperPortalLayout";

interface WebhookItem {
  id: string;
  name: string;
  url: string;
  createdDate: string;
  createdTimeFull: string;
  updatedTimeFull: string;
  events30d: string;
  status: "Active" | "Inactive" | "Failing";
  lastDelivery: string;
  badges: Array<{ label: string; variant: "amber" | "blue" | "emerald" }>;
  signingSecret: string;
  signingAlgorithm: string;
  events: string[];
  icon: "database" | "bell" | "zap" | "file";
}

interface DeliveryLog {
  id: string;
  eventId: string;
  eventType: string;
  endpoint: string;
  status: number;
  statusText: string;
  latencyMs: number;
  timestamp: string;
  payload: Record<string, unknown>;
}



const CODE_EXAMPLES = {
  nodejs: `const crypto = require('crypto');

const secret = 'whsec_xxxxxxxxxxxxxxxxxxxxxx';
const payload = req.rawBody; // raw request body
const signature = req.headers['x-osterdops-signature'];

const expected = crypto
  .createHmac('sha256', secret)
  .update(payload, 'utf8')
  .digest('hex');

if (signature === expected) {
  // valid request
} else {
  // invalid request
}`,
  python: `import hmac
import hashlib

secret = b'whsec_xxxxxxxxxxxxxxxxxxxxxx'
payload = request.get_data() # raw request body
signature = request.headers.get('x-osterdops-signature')

expected = hmac.new(secret, payload, hashlib.sha256).hexdigest()

if hmac.compare_digest(signature, expected):
    # valid request
    pass
else:
    # invalid request
    pass`,
  go: `package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"net/http"
)

func verifyWebhook(req *http.Request, rawBody []byte, secret string) bool {
	sig := req.Header.Get("x-osterdops-signature")
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(rawBody)
	expectedSig := hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(sig), []byte(expectedSig))
}`,
  curl: `# Verify signature using openssl CLI
SECRET="whsec_xxxxxxxxxxxxxxxxxxxxxx"
PAYLOAD='{"event":"budget.threshold_reached","timestamp":1788260000}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')

curl -X POST https://api.yourdomain.com/webhooks/osterdops \\
  -H "Content-Type: application/json" \\
  -H "x-osterdops-signature: $SIGNATURE" \\
  -d "$PAYLOAD"`,
};

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [deliveryLogs] = useState<DeliveryLog[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookItem | null>(null);
  const [activeMainTab, setActiveMainTab] = useState<"webhooks" | "eventLogs">("webhooks");
  const [activeDetailTab, setActiveDetailTab] = useState<"details" | "deliveries" | "config">("details");
  const [activeLangTab, setActiveLangTab] = useState<"nodejs" | "python" | "go" | "curl">("nodejs");
  const [showSecret, setShowSecret] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditEventsModal, setShowEditEventsModal] = useState(false);
  const [newWebhookName, setNewWebhookName] = useState("");
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [newWebhookEnv, setNewWebhookEnv] = useState<"prod" | "staging">("prod");

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRotateSecret = () => {
    if (!selectedWebhook) return;
    const updated = {
      ...selectedWebhook,
      signingSecret: `whsec_live_${Math.random().toString(36).substring(2, 18)}${Math.random().toString(36).substring(2, 18)}`,
      updatedTimeFull: new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setSelectedWebhook(updated);
    setWebhooks((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
  };

  const handleAddWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookName || !newWebhookUrl) return;

    const newId = `wh_${Math.random().toString(36).substring(2, 14)}`;
    const newSecret = `whsec_${newWebhookEnv}_${Math.random().toString(36).substring(2, 18)}`;
    const nowFull = new Date().toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const newItem: WebhookItem = {
      id: newId,
      name: newWebhookName,
      url: newWebhookUrl,
      createdDate: `Created ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
      createdTimeFull: nowFull,
      updatedTimeFull: nowFull,
      events30d: "0",
      status: "Active",
      lastDelivery: "Never",
      badges: [{ label: newWebhookEnv, variant: newWebhookEnv === "prod" ? "amber" : "blue" }],
      signingSecret: newSecret,
      signingAlgorithm: "v1 (HMAC SHA256)",
      events: ["usage.created", "cost.updated", "budget.alert"],
      icon: newWebhookEnv === "prod" ? "database" : "zap",
    };

    setWebhooks([newItem, ...webhooks]);
    setSelectedWebhook(newItem);
    setNewWebhookName("");
    setNewWebhookUrl("");
    setShowAddModal(false);
  };

  const toggleEventSelection = (eventName: string) => {
    if (!selectedWebhook) return;
    const exists = selectedWebhook.events.includes(eventName);
    const updatedEvents = exists
      ? selectedWebhook.events.filter((e) => e !== eventName)
      : [...selectedWebhook.events, eventName];

    const updated = { ...selectedWebhook, events: updatedEvents };
    setSelectedWebhook(updated);
    setWebhooks((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
  };

  const ALL_POSSIBLE_EVENTS = [
    "usage.created",
    "usage.updated",
    "cost.updated",
    "budget.threshold_reached",
    "budget.exceeded",
    "budget.alert",
    "cost.spike_detected",
    "optimization.generated",
    "optimization.applied",
    "model.downgraded",
    "api_key.revoked",
    "api_key.created",
    "member.invited",
    "security.anomaly_detected",
    "project.created",
    "project.updated",
  ];

  return (
    <DeveloperPortalLayout
      title="Webhooks & Signatures"
      subtitle="Receive real-time events from OsterdOps securely. Verify authenticity using signatures."
    >
      <div className="space-y-6 max-w-[1600px] mx-auto">
        {/* Top Header Banner with Logo & "+ Add Webhook" Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-3.5">
            {/* OsterdOps Triquetra Knot Logo */}
            <div className="w-10 h-10 rounded-xl bg-[#dfba82]/10 border border-[#dfba82]/25 flex items-center justify-center text-[#dfba82] shrink-0 shadow-[0_0_20px_rgba(223,186,130,0.15)]">
              <svg viewBox="0 0 32 32" className="w-6 h-6 text-[#dfba82]" fill="none">
                <path
                  d="M16 3C18.5 7.5 24 13.5 27 19C29.5 23.5 26.5 29 21 29C15.5 29 13.5 24 16 19C18.5 24 16.5 29 11 29C5.5 29 2.5 23.5 5 19C8 13.5 13.5 7.5 16 3Z"
                  stroke="#dfba82"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="16" cy="18" r="7.5" stroke="#dfba82" strokeWidth="2" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6]">
                Webhooks & Signatures
              </h1>
              <p className="text-xs sm:text-[13px] text-[#8e93a6] mt-0.5">
                Receive real-time events from OsterdOps securely. Verify authenticity using signatures.
              </p>
            </div>
          </div>

          {/* Add Webhook Button */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#dfba82] hover:bg-[#ebd4aa] text-black text-xs font-bold rounded-xl shadow-[0_2px_12px_rgba(223,186,130,0.25)] transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Webhook</span>
          </button>
        </div>

        {/* 4 Stat / Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active Webhooks */}
          <div className="p-4 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-950/40 border border-purple-800/30 flex items-center justify-center text-purple-400">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 3a9 9 0 0 1 9 9" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <span className="text-xs text-[#8e93a6] font-medium">Active Webhooks</span>
              </div>
              <div className="text-2xl font-bold text-white pt-1">{webhooks.length}</div>
              <div className="text-[11px] text-[#6b7082]">Across 3 environments</div>
            </div>
            {/* Purple Sparkline */}
            <div className="w-24 h-12 flex items-end">
              <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                <path
                  d="M 0 35 C 20 38, 40 32, 60 22 C 75 14, 85 18, 100 8"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Card 2: Events (30 days) */}
          <div className="p-4 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-950/40 border border-amber-800/30 flex items-center justify-center text-[#dfba82]">
                  <Send className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs text-[#8e93a6] font-medium">Events (30 days)</span>
              </div>
              <div className="text-2xl font-bold text-white pt-1">{webhooks.length > 0 ? "0" : "—"}</div>
              <div className="text-[11px] text-[#6b7082] font-medium flex items-center gap-1">
                <span>Active 30d window</span>
              </div>
            </div>
            {/* Amber Sparkline */}
            <div className="w-24 h-12 flex items-end">
              <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                <path
                  d="M 0 32 C 25 35, 45 28, 65 30 C 80 32, 88 12, 100 6"
                  fill="none"
                  stroke="#dfba82"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Card 3: Deliveries */}
          <div className="p-4 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-950/40 border border-emerald-800/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-xs text-[#8e93a6] font-medium">Deliveries</span>
              </div>
              <div className="text-2xl font-bold text-white pt-1">{webhooks.length > 0 ? "100%" : "—"}</div>
              <div className="text-[11px] text-[#6b7082]">Success rate</div>
            </div>
            {/* Green Sparkline */}
            <div className="w-24 h-12 flex items-end">
              <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                <path
                  d="M 0 36 C 30 35, 50 38, 70 20 C 85 10, 92 16, 100 8"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Card 4: Last Delivery */}
          <div className="p-4 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-950/40 border border-purple-800/30 flex items-center justify-center text-purple-400">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs text-[#8e93a6] font-medium">Last Delivery</span>
              </div>
              <div className="text-2xl font-bold text-white pt-1">{webhooks.length > 0 ? "Active" : "—"}</div>
              <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Dispatcher status</span>
              </div>
            </div>
            {/* Emerald Sparkline */}
            <div className="w-24 h-12 flex items-end">
              <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                <path
                  d="M 0 34 C 20 30, 40 18, 60 26 C 75 30, 85 12, 100 6"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Main 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Tabs + Webhooks Table + "How Signatures Work" */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-5">
            {/* Webhooks / Event Logs Tabs Header */}
            <div className="flex items-center gap-6 border-b border-[#1c1f2e] pb-1 px-1">
              <button
                type="button"
                onClick={() => setActiveMainTab("webhooks")}
                className={`pb-2.5 text-xs font-semibold tracking-wide relative transition-colors cursor-pointer ${
                  activeMainTab === "webhooks" ? "text-[#dfba82]" : "text-[#707587] hover:text-white"
                }`}
              >
                Webhooks
                {activeMainTab === "webhooks" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#dfba82] rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveMainTab("eventLogs")}
                className={`pb-2.5 text-xs font-semibold tracking-wide relative transition-colors cursor-pointer ${
                  activeMainTab === "eventLogs" ? "text-[#dfba82]" : "text-[#707587] hover:text-white"
                }`}
              >
                Event Logs
                {activeMainTab === "eventLogs" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#dfba82] rounded-full" />
                )}
              </button>
            </div>

            {/* View 1: Webhooks Table */}
            {activeMainTab === "webhooks" ? (
              <div className="rounded-2xl border border-[#1c1f2e] bg-[#0c0e16] overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#161824] text-[11px] uppercase tracking-wider text-[#555a6d] font-semibold">
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">URL</th>
                        <th className="py-3 px-4">Events (30D)</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Last Delivery</th>
                        <th className="py-3 px-3 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#141724]">
                      {webhooks.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-xs text-[#73788c] bg-[#090b12]">
                            <div className="w-8 h-8 rounded-full bg-[#dfba82]/10 text-[#dfba82] flex items-center justify-center mx-auto mb-2">
                              <Send className="w-4 h-4" />
                            </div>
                            <div className="text-sm font-semibold text-white">No webhook endpoints configured</div>
                            <p className="text-[11px] text-[#73788c] max-w-sm mx-auto mt-1">
                              Register an endpoint URL to receive automated push dispatches when events occur.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        webhooks.map((item) => {
                          const isSelected = selectedWebhook?.id === item.id;
                          return (
                          <tr
                            key={item.id}
                            onClick={() => setSelectedWebhook(item)}
                            className={`transition-colors cursor-pointer group ${
                              isSelected
                                ? "bg-[#dfba82]/[0.06] border-l-2 border-[#dfba82]"
                                : "hover:bg-white/[0.02]"
                            }`}
                          >
                            {/* Name & Badges */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                    item.icon === "database"
                                      ? "bg-amber-950/40 text-amber-400 border border-amber-800/30"
                                      : item.icon === "bell"
                                      ? "bg-purple-950/40 text-purple-400 border border-purple-800/30"
                                      : item.icon === "zap"
                                      ? "bg-blue-950/40 text-blue-400 border border-blue-800/30"
                                      : "bg-orange-950/40 text-orange-400 border border-orange-800/30"
                                  }`}
                                >
                                  {item.icon === "database" && <Database className="w-4 h-4" />}
                                  {item.icon === "bell" && <Bell className="w-4 h-4" />}
                                  {item.icon === "zap" && <Zap className="w-4 h-4" />}
                                  {item.icon === "file" && <FileText className="w-4 h-4" />}
                                </div>
                                <div className="space-y-0.5">
                                  <div className="font-bold text-white flex items-center gap-1.5">
                                    <span>{item.name}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    {item.badges.map((b, i) => (
                                      <span
                                        key={i}
                                        className={`text-[9.5px] px-1.5 py-0.2 rounded font-mono font-medium ${
                                          b.variant === "amber"
                                            ? "bg-amber-950/50 text-[#dfba82] border border-amber-800/40"
                                            : "bg-blue-950/50 text-blue-300 border border-blue-800/40"
                                        }`}
                                      >
                                        {b.label}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* URL & Created Date */}
                            <td className="py-3.5 px-4 max-w-[180px]">
                              <div className="truncate text-[#c5c9d6] font-mono text-[11px]" title={item.url}>
                                {item.url}
                              </div>
                              <div className="text-[10.5px] text-[#63687c] mt-0.5">{item.createdDate}</div>
                            </td>

                            {/* Events (30D) */}
                            <td className="py-3.5 px-4 font-mono font-medium text-white">
                              {item.events30d}
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                {item.status}
                              </span>
                            </td>

                            {/* Last Delivery */}
                            <td className="py-3.5 px-4 text-[#8e93a6] whitespace-nowrap">
                              {item.lastDelivery}
                            </td>

                            {/* More Options */}
                            <td className="py-3.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRotateSecret();
                                }}
                                title="Rotate signing secret"
                                className="p-1 text-[#6b7082] hover:text-white hover:bg-white/[0.05] rounded-md transition-colors"
                              >
                                <span className="tracking-widest font-bold">•••</span>
                              </button>
                            </td>
                          </tr>
                        );
                      }))}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer Pagination */}
                <div className="py-3 px-4 border-t border-[#161824] flex items-center justify-between text-xs text-[#6b7082]">
                  <div>
                    Showing 1 to {webhooks.length} of {webhooks.length} webhooks
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled
                      className="p-1 rounded-md border border-[#1b1e2c] text-[#4a4e60] cursor-not-allowed"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      className="w-6 h-6 rounded-md border border-[#dfba82] text-[#dfba82] font-semibold text-xs flex items-center justify-center bg-[#dfba82]/10"
                    >
                      1
                    </button>
                    <button
                      type="button"
                      className="w-6 h-6 rounded-md border border-transparent text-[#8e93a6] hover:text-white hover:border-[#1b1e2c] text-xs flex items-center justify-center transition-all cursor-pointer"
                    >
                      2
                    </button>
                    <button
                      type="button"
                      className="p-1 rounded-md border border-[#1b1e2c] text-[#8e93a6] hover:text-white hover:border-[#2a2f45] transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* View 2: Live Delivery Logs */
              <div className="rounded-2xl border border-[#1c1f2e] bg-[#0c0e16] p-4 space-y-3 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-[#161824]">
                  <span className="text-xs font-bold text-[#dfba82] uppercase tracking-wider">
                    Recent Outbound Deliveries
                  </span>
                  <span className="text-[11px] text-[#6b7082]">Auto-refreshing live</span>
                </div>
                <div className="space-y-2.5">
                  {deliveryLogs.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#73788c] bg-[#090b12] rounded-xl border border-[#161824]">
                      No outbound delivery attempts recorded yet.
                    </div>
                  ) : (
                    deliveryLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-[#08090f] border border-[#161824] flex items-center justify-between text-xs hover:border-[#2a2f45] transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 font-mono font-bold text-[11px]">
                          {log.status} {log.statusText}
                        </span>
                        <div>
                          <div className="font-mono text-white text-xs font-semibold">{log.eventType}</div>
                          <div className="text-[11px] text-[#63687c] font-mono truncate max-w-[240px]">
                            {log.endpoint}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-mono text-[11px]">{log.latencyMs}ms</div>
                        <div className="text-[10px] text-[#63687c]">{log.timestamp}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            )}

            {/* "How Signatures Work" Card */}
            <div className="rounded-2xl border border-[#1c1f2e] bg-[#0c0e16] p-5 space-y-4 shadow-xl">
              {/* Header with Title + Language Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#161824]">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-[#dfba82]/15 text-[#dfba82] flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#f4efe6]">How Signatures Work</h3>
                </div>

                {/* Language Switcher */}
                <div className="flex items-center gap-4 text-xs">
                  {(["nodejs", "python", "go", "curl"] as const).map((lang) => {
                    const labels = {
                      nodejs: "Node.js",
                      python: "Python",
                      go: "Go",
                      curl: "cURL",
                    };
                    const isActive = activeLangTab === lang;
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setActiveLangTab(lang)}
                        className={`pb-1 text-xs font-semibold relative transition-colors cursor-pointer ${
                          isActive ? "text-[#dfba82]" : "text-[#707587] hover:text-white"
                        }`}
                      >
                        {labels[lang]}
                        {isActive && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#dfba82] rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Body: Left 4 Steps + Right Code Snippet */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                {/* 4 Steps */}
                <div className="md:col-span-5 space-y-3.5">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#181b28] border border-[#262a3e] text-[#dfba82] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">Get the raw request body</div>
                      <div className="text-[11.5px] text-[#73788c] mt-0.5 leading-relaxed">
                        Use the raw body text received in the request.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#181b28] border border-[#262a3e] text-[#dfba82] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">Get the signature header</div>
                      <div className="text-[11.5px] text-[#73788c] mt-0.5 leading-relaxed">
                        Read the <code className="text-[#dfba82]">x-osterdops-signature</code> header.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#181b28] border border-[#262a3e] text-[#dfba82] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">Compute the signature</div>
                      <div className="text-[11.5px] text-[#73788c] mt-0.5 leading-relaxed">
                        Create HMAC SHA256 hash of the body using your secret.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#181b28] border border-[#262a3e] text-[#dfba82] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      4
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">Compare signatures</div>
                      <div className="text-[11.5px] text-[#73788c] mt-0.5 leading-relaxed">
                        Compare your hash with the header signature.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Code Block */}
                <div className="md:col-span-7 rounded-xl bg-[#08090f] border border-[#161824] p-3.5 relative font-mono text-[11px] overflow-x-auto shadow-inner">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(CODE_EXAMPLES[activeLangTab], "code")}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-[#141624] hover:bg-[#1f2338] text-[#8e93a6] hover:text-white border border-[#23273a] transition-all cursor-pointer"
                    title="Copy code"
                  >
                    {copiedKey === "code" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <pre className="text-[#a5b4fc] leading-relaxed pr-8">
                    <code>{CODE_EXAMPLES[activeLangTab]}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Webhook Details Panel */}
          {selectedWebhook ? (
            <div className="lg:col-span-5 xl:col-span-5 rounded-2xl border border-[#1c1f2e] bg-[#0c0e16] p-5 space-y-5 shadow-xl">
              {/* Details Panel Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#161824]">
                <h2 className="text-base font-bold text-white">{selectedWebhook.name}</h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-800/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {selectedWebhook.status}
                </span>
                <button
                  type="button"
                  onClick={handleRotateSecret}
                  title="Webhook actions"
                  className="p-1 text-[#6b7082] hover:text-white hover:bg-white/[0.05] rounded-md transition-colors"
                >
                  <span className="tracking-widest font-bold">•••</span>
                </button>
              </div>
            </div>

            {/* Navigation Sub-Tabs */}
            <div className="flex items-center gap-5 border-b border-[#161824] pb-2 text-xs">
              <button
                type="button"
                onClick={() => setActiveDetailTab("details")}
                className={`pb-1 font-semibold relative transition-colors cursor-pointer ${
                  activeDetailTab === "details" ? "text-[#dfba82]" : "text-[#707587] hover:text-white"
                }`}
              >
                Details
                {activeDetailTab === "details" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#dfba82] rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveDetailTab("deliveries")}
                className={`pb-1 font-semibold relative transition-colors cursor-pointer ${
                  activeDetailTab === "deliveries" ? "text-[#dfba82]" : "text-[#707587] hover:text-white"
                }`}
              >
                Recent Deliveries
                {activeDetailTab === "deliveries" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#dfba82] rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveDetailTab("config")}
                className={`pb-1 font-semibold relative transition-colors cursor-pointer ${
                  activeDetailTab === "config" ? "text-[#dfba82]" : "text-[#707587] hover:text-white"
                }`}
              >
                Configuration
                {activeDetailTab === "config" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#dfba82] rounded-full" />
                )}
              </button>
            </div>

            {/* Detail Tab 1: Details */}
            {activeDetailTab === "details" && (
              <div className="space-y-4 text-xs">
                {/* Endpoint URL */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-[#8e93a6]">Endpoint URL</span>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#08090f] border border-[#161824]">
                    <span className="font-mono text-[#c5c9d6] truncate text-[11.5px] pr-2">
                      {selectedWebhook.url}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedWebhook.url, "endpoint")}
                      className="text-[#6b7082] hover:text-white transition-colors cursor-pointer p-0.5 shrink-0"
                      title="Copy URL"
                    >
                      {copiedKey === "endpoint" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Webhook ID */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-[#8e93a6]">Webhook ID</span>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#08090f] border border-[#161824]">
                    <span className="font-mono text-[#c5c9d6] text-[11.5px]">
                      {selectedWebhook.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedWebhook.id, "id")}
                      className="text-[#6b7082] hover:text-white transition-colors cursor-pointer p-0.5 shrink-0"
                      title="Copy ID"
                    >
                      {copiedKey === "id" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Signing Secret */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-[#8e93a6]">Signing Secret</span>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#08090f] border border-[#161824]">
                    <span className="font-mono text-[#c5c9d6] text-[11.5px] tracking-wider truncate pr-2">
                      {showSecret
                        ? selectedWebhook.signingSecret
                        : "••••••••••••••••••••••••••••••••"}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowSecret(!showSecret)}
                        className="text-[#6b7082] hover:text-white transition-colors cursor-pointer p-0.5"
                        title={showSecret ? "Hide secret" : "Show secret"}
                      >
                        {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={handleRotateSecret}
                        className="text-[#6b7082] hover:text-white transition-colors cursor-pointer p-0.5"
                        title="Rotate secret"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Events Filter */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#8e93a6]">Events</span>
                    <button
                      type="button"
                      onClick={() => setShowEditEventsModal(true)}
                      className="text-[#8e93a6] hover:text-white font-medium text-[11px] transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {selectedWebhook.events.map((evt) => (
                      <span
                        key={evt}
                        className="px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-800/40 text-[#dfba82] text-[11px] font-mono"
                      >
                        {evt}
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={() => setShowEditEventsModal(true)}
                      className="px-2 py-0.5 rounded-lg bg-[#141724] border border-[#23273a] text-[#8e93a6] hover:text-white text-[11px] font-mono transition-colors cursor-pointer"
                    >
                      +2 more
                    </button>
                  </div>
                </div>

                {/* Signing Algorithm */}
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-semibold text-[#8e93a6]">Signing Algorithm</span>
                  <div className="text-white text-xs font-medium flex items-center justify-between">
                    <span>{selectedWebhook.signingAlgorithm}</span>
                  </div>
                  <Link
                    href="/developers/api"
                    className="inline-flex items-center gap-1 text-[11.5px] text-[#dfba82] hover:underline pt-0.5 font-medium"
                  >
                    <span>Learn more</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#161824]">
                  <div>
                    <span className="text-[10.5px] text-[#6b7082] block">Created</span>
                    <span className="text-xs text-[#c5c9d6] font-medium">{selectedWebhook.createdTimeFull}</span>
                  </div>
                  <div>
                    <span className="text-[10.5px] text-[#6b7082] block">Updated</span>
                    <span className="text-xs text-[#c5c9d6] font-medium">{selectedWebhook.updatedTimeFull}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Detail Tab 2: Recent Deliveries for this specific webhook */}
            {activeDetailTab === "deliveries" && (
              <div className="space-y-3 text-xs">
                <div className="text-[11.5px] text-[#8e93a6]">
                  Recent dispatch attempts to <code className="text-white font-mono">{selectedWebhook.name}</code>:
                </div>
                <div className="space-y-2">
                  {deliveryLogs.filter((l) => l.endpoint.includes(selectedWebhook.url.slice(0, 20))).length > 0 ? (
                    deliveryLogs.filter((l) => l.endpoint.includes(selectedWebhook.url.slice(0, 20))).map((l) => (
                      <div
                        key={l.id}
                        className="p-2.5 rounded-xl bg-[#08090f] border border-[#161824] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 font-mono font-bold text-[10px]">
                            {l.status}
                          </span>
                          <span className="font-mono text-white text-xs">{l.eventType}</span>
                        </div>
                        <span className="text-[#63687c] text-[10px]">{l.timestamp}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-[#63687c] text-xs">
                      All deliveries for this endpoint succeeded.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Detail Tab 3: Configuration */}
            {activeDetailTab === "config" && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#08090f] border border-[#161824]">
                  <div>
                    <div className="font-semibold text-white">Retry Exponential Backoff</div>
                    <div className="text-[11px] text-[#6b7082]">Up to 5 attempts over 24h</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono text-[10px]">
                    Enabled
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#08090f] border border-[#161824]">
                  <div>
                    <div className="font-semibold text-white">HTTP Request Timeout</div>
                    <div className="text-[11px] text-[#6b7082]">Max socket connection duration</div>
                  </div>
                  <span className="font-mono text-white text-xs">10,000 ms</span>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => alert(`Test webhook ping dispatched to ${selectedWebhook.url}`)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#161928] hover:bg-[#202438] text-[#dfba82] border border-[#dfba82]/30 font-semibold text-xs transition-all cursor-pointer"
                  >
                    Send Test Ping Payload
                  </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="lg:col-span-5 xl:col-span-5 rounded-2xl border border-[#1c1f2e] bg-[#0c0e16] p-8 flex flex-col items-center justify-center text-center space-y-3 shadow-xl">
              <div className="w-10 h-10 rounded-full bg-[#dfba82]/10 text-[#dfba82] flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div className="text-sm font-bold text-white">No Webhook Selected</div>
              <p className="text-xs text-[#8e93a6] max-w-xs">
                Select an endpoint from the left or click "+ Add Webhook" to register a new endpoint URL and manage HMAC signing secrets.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Security / Need Help Banner */}
        <div className="rounded-2xl border border-[#1c1f2e] bg-[#0c0e16] p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          {/* Security first */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#dfba82]/10 border border-[#dfba82]/20 text-[#dfba82] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Security first</div>
              <div className="text-[11.5px] text-[#8e93a6]">
                All webhooks are signed using HMAC SHA256. Never share your signing secret.
              </div>
            </div>
          </div>

          {/* Need help? */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-950/40 border border-purple-800/30 text-purple-400 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                <path d="M6 6h10" />
                <path d="M6 10h10" />
              </svg>
            </div>
            <div>
              <div className="text-xs font-bold text-white">Need help?</div>
              <div className="text-[11.5px] text-[#8e93a6]">
                Check our{" "}
                <span className="text-[#dfba82] font-semibold cursor-pointer hover:underline">
                  webhook docs
                </span>{" "}
                for guides and examples.
              </div>
            </div>
          </div>

          {/* View Documentation Button */}
          <button
            type="button"
            onClick={() => {
              window.open("https://docs.osterdops.com/webhooks", "_blank");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#121420] hover:bg-[#1b1f30] text-white text-xs font-semibold rounded-xl border border-[#23273a] hover:border-[#dfba82]/40 transition-all cursor-pointer shrink-0"
          >
            <span>View Documentation</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#dfba82]" />
          </button>
        </div>

        {/* Modal 1: Add Webhook */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-[#0e1017] border border-[#232738] rounded-2xl p-6 shadow-2xl text-white relative space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1c1f2e]">
                <h3 className="text-base font-bold text-[#f4efe6]">Register New Webhook Endpoint</h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-[#787d91] hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleAddWebhook} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-[11.5px] font-semibold text-[#c5c9d6]">
                    Endpoint Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newWebhookName}
                    onChange={(e) => setNewWebhookName(e.target.value)}
                    placeholder="e.g. Production Billing Listener"
                    className="w-full px-3.5 py-2 bg-[#141622] border border-[#232738] rounded-xl text-white placeholder-[#686d80] focus:outline-none focus:border-[#dfba82]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11.5px] font-semibold text-[#c5c9d6]">
                    Payload URL (HTTPS required)
                  </label>
                  <input
                    type="url"
                    required
                    value={newWebhookUrl}
                    onChange={(e) => setNewWebhookUrl(e.target.value)}
                    placeholder="https://api.yourcompany.com/webhooks/osterdops"
                    className="w-full px-3.5 py-2 bg-[#141622] border border-[#232738] rounded-xl text-white placeholder-[#686d80] focus:outline-none focus:border-[#dfba82]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11.5px] font-semibold text-[#c5c9d6]">
                    Target Environment
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewWebhookEnv("prod")}
                      className={`py-2 px-3 rounded-xl border text-center font-medium transition-all cursor-pointer ${
                        newWebhookEnv === "prod"
                          ? "bg-[#dfba82]/15 border-[#dfba82] text-[#dfba82]"
                          : "bg-[#141622] border-[#232738] text-[#8e93a6]"
                      }`}
                    >
                      Production (Live)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewWebhookEnv("staging")}
                      className={`py-2 px-3 rounded-xl border text-center font-medium transition-all cursor-pointer ${
                        newWebhookEnv === "staging"
                          ? "bg-blue-950/40 border-blue-500 text-blue-400"
                          : "bg-[#141622] border-[#232738] text-[#8e93a6]"
                      }`}
                    >
                      Staging / Test
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#08090f] border border-[#161824] text-[11.5px] text-[#8e93a6] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#dfba82] shrink-0" />
                  <span>A secure HMAC-SHA256 signing secret will be generated automatically.</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1c1f2e]">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3.5 py-2 text-xs text-[#8e93a6] hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#dfba82] text-black font-bold rounded-xl hover:bg-[#ebd4aa] transition-colors cursor-pointer"
                  >
                    Create Webhook
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Edit Events Filter */}
        {showEditEventsModal && selectedWebhook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-[#0e1017] border border-[#232738] rounded-2xl p-6 shadow-2xl text-white relative space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1c1f2e]">
                <h3 className="text-base font-bold text-[#f4efe6]">
                  Configure Subscribed Events for {selectedWebhook.name}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowEditEventsModal(false)}
                  className="text-[#787d91] hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar text-xs">
                {ALL_POSSIBLE_EVENTS.map((event) => {
                  const isChecked = selectedWebhook.events.includes(event);
                  return (
                    <button
                      key={event}
                      type="button"
                      onClick={() => toggleEventSelection(event)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isChecked
                          ? "bg-[#dfba82]/10 border-[#dfba82]/40 text-white"
                          : "bg-[#141622] border-[#232738] text-[#8e93a6] hover:text-white"
                      }`}
                    >
                      <span className="font-mono text-xs font-medium">{event}</span>
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-[#dfba82]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#555a6d]" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-[#1c1f2e]">
                <button
                  type="button"
                  onClick={() => setShowEditEventsModal(false)}
                  className="px-4 py-2 bg-[#dfba82] text-black font-bold rounded-xl hover:bg-[#ebd4aa] transition-colors cursor-pointer text-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DeveloperPortalLayout>
  );
}
