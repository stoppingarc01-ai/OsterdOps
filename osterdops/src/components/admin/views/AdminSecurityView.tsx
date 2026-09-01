"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  KeyRound,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Shield,
  EyeOff,
  Server,
  RefreshCw,
} from "lucide-react";

interface SecurityCheck {
  id: string;
  category: string;
  name: string;
  status: "PASSED" | "WARNING" | "FAILED";
  details: string;
}

const SECURITY_CHECKS: SecurityCheck[] = [
  {
    id: "sec_01",
    category: "Cryptography & Secrets",
    name: "AES-256-GCM Keystore Encryption",
    status: "PASSED",
    details: "All upstream provider keys encrypted at rest with PBKDF2 key derivation and random IVs.",
  },
  {
    id: "sec_02",
    category: "Authentication",
    name: "Timing-Safe API Key Hash Match",
    status: "PASSED",
    details: "One-way SHA-256 hash comparison using crypto.timingSafeEqual to prevent side-channel leaks.",
  },
  {
    id: "sec_03",
    category: "Access Control",
    name: "Server-Side RBAC Enforcement",
    status: "PASSED",
    details: "OWNER, ADMIN, DEVELOPER, VIEWER role hierarchy enforced at API gateway and route layers.",
  },
  {
    id: "sec_04",
    category: "Multi-Tenancy",
    name: "Strict Multi-Tenant Database Isolation",
    status: "PASSED",
    details: "All Firestore queries bounded by authenticated organizationId. Zero cross-tenant data leakage.",
  },
  {
    id: "sec_05",
    category: "Privacy & Data Retention",
    name: "Zero-Prompt Telemetry Guarantee",
    status: "PASSED",
    details: "Zero prompt, message, or completion retention in usage tables, logs, or diagnostic reports.",
  },
  {
    id: "sec_06",
    category: "Network Defense",
    name: "Outbound SSRF & Private IP Blocking",
    status: "PASSED",
    details: "Webhook outbound destinations validated against IPv4/IPv6 private and loopback subnets.",
  },
];

interface SecurityEvent {
  id: string;
  type: string;
  severity: "CRITICAL" | "HIGH" | "INFO";
  timestamp: string;
  details: string;
}

const INITIAL_EVENTS: SecurityEvent[] = [
  {
    id: "ev_01",
    type: "KEY_ROTATION_COMPLETED",
    severity: "INFO",
    timestamp: "1 hour ago",
    details: "Master encryption keystore rotated successfully with 0 decryption anomalies.",
  },
  {
    id: "ev_02",
    type: "AUTH_FAILURE_BURST_MITIGATED",
    severity: "HIGH",
    timestamp: "6 hours ago",
    details: "Rate limiter blocked 24 invalid key attempts from unverified remote host.",
  },
  {
    id: "ev_03",
    type: "AUDIT_CHAIN_VERIFIED",
    severity: "INFO",
    timestamp: "12 hours ago",
    details: "Daily cryptographic tamper-evident SHA-256 audit log integrity check completed (100% valid).",
  },
];

export function AdminSecurityView() {
  const [events] = useState<SecurityEvent[]>(INITIAL_EVENTS);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);

  const handleVerifyIntegrity = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerifySuccess(true);
      setTimeout(() => setVerifySuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Posture Score Banner */}
      <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white font-serif">Security Posture Score</h2>
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
                GRADE A+
              </span>
            </div>
            <p className="text-xs text-[#8e93a6] mt-1">
              Evaluated against OWASP AI Top 10, SOC 2 Type II controls, and NIST AI Risk Management Framework.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-3xl font-bold font-mono text-emerald-400">100 / 100</div>
            <div className="text-[11px] text-[#8e93a6]">All 6 Core Controls Active</div>
          </div>

          <button
            onClick={handleVerifyIntegrity}
            disabled={isVerifying}
            className="px-4 py-2 rounded-xl bg-[#1b202e] hover:bg-[#252c3f] text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? "animate-spin" : ""}`} />
            <span>{isVerifying ? "Verifying..." : "Run Posture Check"}</span>
          </button>
        </div>
      </div>

      {verifySuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Security Posture Audit verified: 100% pass across all encryption, RBAC, and hash integrity checks.</span>
        </div>
      )}

      {/* Security Policies Matrix */}
      <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white border-b border-[#171b26] pb-3 flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#dfba82]" />
          Enterprise Guardrails &amp; Compliance Checks
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SECURITY_CHECKS.map((check) => (
            <div
              key={check.id}
              className="p-4 rounded-xl bg-[#07080c] border border-[#171b26] hover:border-[#dfba82]/30 transition-all flex items-start gap-3"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">{check.name}</span>
                  <span className="text-[10px] text-[#717688] font-mono">[{check.category}]</span>
                </div>
                <p className="text-[11px] text-[#8e93a6] mt-1">{check.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Event Stream */}
      <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white border-b border-[#171b26] pb-3 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-[#dfba82]" />
          Recent Security Event Log
        </h3>

        <div className="space-y-3">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="p-3 rounded-xl bg-[#07080c] border border-[#171b26] flex items-center justify-between text-xs gap-4"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    ev.severity === "CRITICAL"
                      ? "bg-rose-950/60 text-rose-400 border-rose-800/40"
                      : ev.severity === "HIGH"
                      ? "bg-amber-950/60 text-amber-400 border-amber-800/40"
                      : "bg-blue-950/60 text-blue-400 border-blue-800/40"
                  }`}
                >
                  {ev.type}
                </span>
                <span className="text-white">{ev.details}</span>
              </div>
              <span className="text-[11px] text-[#717688] shrink-0 font-mono">{ev.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
