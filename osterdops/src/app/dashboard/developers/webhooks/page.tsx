"use client";

import React, { useState } from "react";
import {
  Webhook,
  ShieldCheck,
  RotateCw,
  CheckCircle2,
  Clock,
  Code2,
  AlertTriangle,
  Layers,
} from "lucide-react";
import { DeveloperPortalLayout } from "@/components/developers/DeveloperPortalLayout";
import { CodeBlock } from "@/components/developers/CodeBlock";

interface WebhookEventDoc {
  event: string;
  category: "Billing" | "Budgets" | "Security" | "System";
  description: string;
  payload: Record<string, unknown>;
}

const WEBHOOK_EVENTS: WebhookEventDoc[] = [
  {
    event: "budget.threshold_reached",
    category: "Budgets",
    description: "Emitted when project or organization spend reaches 50%, 80%, or 90% of budget limit.",
    payload: {
      id: "evt_01j9a8b1",
      event: "budget.threshold_reached",
      timestamp: "2026-08-29T16:32:15.000Z",
      data: {
        budgetId: "bud_99a81",
        budgetName: "Monthly Production Budget",
        thresholdPercent: 80,
        currentSpendUsd: 800.5,
        limitUsd: 1000.0,
      },
    },
  },
  {
    event: "budget.exceeded",
    category: "Budgets",
    description: "Emitted when spend reaches 100% of budget limit and hard blocking takes effect.",
    payload: {
      id: "evt_01j9a8b2",
      event: "budget.exceeded",
      timestamp: "2026-08-29T16:45:00.000Z",
      data: {
        budgetId: "bud_99a81",
        budgetName: "Monthly Production Budget",
        currentSpendUsd: 1002.15,
        limitUsd: 1000.0,
        enforcementMode: "BLOCK",
      },
    },
  },
  {
    event: "invoice.payment_succeeded",
    category: "Billing",
    description: "Emitted when an automated recurring subscription payment is successfully processed.",
    payload: {
      id: "evt_01j9a8b3",
      event: "invoice.payment_succeeded",
      timestamp: "2026-08-29T00:00:00.000Z",
      data: {
        invoiceId: "inv_01j9",
        amountPaidUsd: 49.0,
        currency: "usd",
        periodStart: "2026-08-01",
        periodEnd: "2026-09-01",
      },
    },
  },
  {
    event: "api_key.revoked",
    category: "Security",
    description: "Emitted when an API key is revoked by an administrator or through automated anomaly detection.",
    payload: {
      id: "evt_01j9a8b4",
      event: "api_key.revoked",
      timestamp: "2026-08-29T12:10:00.000Z",
      data: {
        keyId: "key_8841a",
        keyPrefix: "osk_live_••••94f2",
        projectId: "proj_01j9a8b",
        reason: "User requested revocation",
      },
    },
  },
];

export default function WebhooksPage() {
  const [selectedEvent, setSelectedEvent] = useState<WebhookEventDoc>(WEBHOOK_EVENTS[0]);

  return (
    <DeveloperPortalLayout
      title="Webhooks & Signatures"
      subtitle="Receive real-time notifications for budget alerts, billing events, and security status"
    >
      <div className="space-y-8 max-w-5xl">
        {/* Security & Verification Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#dfba82]/10 via-[#0c0e17] to-[#0c0e17] border border-[#dfba82]/30 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#dfba82]/20 text-[#dfba82] border border-[#dfba82]/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-serif">
                HMAC-SHA256 Signature Verification & Replay Protection
              </h2>
              <p className="text-xs text-[#8e93a6]">
                Every webhook request includes an <code className="text-[#dfba82]">x-osterdops-signature</code>{" "}
                header. Always verify this signature before processing events.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-[#07080c] border border-[#161824] space-y-1">
              <span className="text-[#dfba82] font-semibold">1. Signature Header</span>
              <p className="text-[11.5px] text-[#8e93a6]">
                Header format: <code className="text-white">t=1788022596,v1=hex_hmac_hash</code>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#07080c] border border-[#161824] space-y-1">
              <span className="text-[#dfba82] font-semibold">2. Replay Tolerance</span>
              <p className="text-[11.5px] text-[#8e93a6]">
                Reject any payload with a timestamp <code className="text-white">&gt; 300s (5 mins)</code> older than server time.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#07080c] border border-[#161824] space-y-1">
              <span className="text-[#dfba82] font-semibold">3. Exponential Retries</span>
              <p className="text-[11.5px] text-[#8e93a6]">
                Failed endpoints (non-2xx response) are retried up to 5 times over 24 hours.
              </p>
            </div>
          </div>
        </div>

        {/* Verification Code Implementation */}
        <div className="rounded-2xl border border-[#1b1e2c] bg-[#0c0e17] p-5 space-y-4 shadow-xl">
          <div>
            <h3 className="text-sm font-bold text-white font-serif">
              Signature Verification Code Examples
            </h3>
            <p className="text-xs text-[#73788c] mt-0.5">
              Implement timing-safe HMAC validation in your backend webhook receiver
            </p>
          </div>

          <CodeBlock
            tabs={[
              {
                label: "Node.js / Express",
                language: "typescript",
                code: `import crypto from "crypto";

export function verifyOsterdOpsWebhook(
  payloadRaw: string,
  sigHeader: string,
  webhookSecret: string
): boolean {
  // sigHeader format: "t=1788022596,v1=abcdef0123456789..."
  const parts = sigHeader.split(",");
  const timestampPart = parts.find((p) => p.startsWith("t="))?.slice(2);
  const signaturePart = parts.find((p) => p.startsWith("v1="))?.slice(3);

  if (!timestampPart || !signaturePart) return false;

  // Replay Attack Protection: 5 minute window
  const nowSec = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSec - parseInt(timestampPart, 10)) > 300) {
    return false;
  }

  // Compute expected HMAC
  const signedPayload = \`\${timestampPart}.\${payloadRaw}\`;
  const expectedSig = crypto
    .createHmac("sha256", webhookSecret)
    .update(signedPayload)
    .digest("hex");

  // Timing-safe constant-time string comparison
  return crypto.timingSafeEqual(
    Buffer.from(signaturePart, "hex"),
    Buffer.from(expectedSig, "hex")
  );
}`,
              },
              {
                label: "Python / FastAPI",
                language: "python",
                code: `import hmac
import hashlib
import time

def verify_osterdops_webhook(payload_raw: bytes, sig_header: str, secret: str) -> bool:
    try:
        parts = dict(x.split("=") for x in sig_header.split(","))
        timestamp = int(parts["t"])
        signature = parts["v1"]
    except Exception:
        return False

    # 5-minute replay window check
    if abs(time.time() - timestamp) > 300:
        return False

    signed_payload = f"{timestamp}.".encode("utf-8") + payload_raw
    expected_sig = hmac.new(
        secret.encode("utf-8"),
        signed_payload,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(signature, expected_sig)`,
              },
            ]}
          />
        </div>

        {/* Event Catalog */}
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-white font-serif">Supported Webhook Events</h3>
            <p className="text-xs text-[#73788c]">Click an event type to preview payload schema</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WEBHOOK_EVENTS.map((evt) => {
              const isSelected = selectedEvent.event === evt.event;
              return (
                <button
                  key={evt.event}
                  type="button"
                  onClick={() => setSelectedEvent(evt)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#dfba82]/15 border-[#dfba82]/40 shadow-lg"
                      : "bg-[#0c0e17] border-[#1b1e2c] hover:border-[#2a2f45]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white">{evt.event}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161928] text-[#dfba82] border border-[#232738]">
                      {evt.category}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[#8e93a6] mt-1.5 leading-relaxed">
                    {evt.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Selected Event Payload Viewer */}
          <div className="rounded-2xl border border-[#1b1e2c] bg-[#0c0e17] p-5 space-y-3">
            <h4 className="text-xs font-bold text-[#dfba82] uppercase tracking-wider">
              Sample Webhook Payload: {selectedEvent.event}
            </h4>
            <CodeBlock
              title="JSON Event Envelope"
              language="json"
              singleCode={JSON.stringify(selectedEvent.payload, null, 2)}
            />
          </div>
        </div>
      </div>
    </DeveloperPortalLayout>
  );
}
