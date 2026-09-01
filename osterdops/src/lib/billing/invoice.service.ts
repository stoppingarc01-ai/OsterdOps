/**
 * OsterdOps — Invoice Engine & Lifecycle Service (Phase 13)
 * Manages invoice generation, deterministic idempotency, and lifecycle transitions under:
 * organizations/{organizationId}/billing/invoices/{invoiceId}
 */

import "server-only";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { recordAuditLog } from "@/lib/services/audit.service";
import type {
  Invoice,
  InvoiceStatus,
  InvoiceLineItem,
  BillingFilterOptions,
} from "@/types";

export interface CreateInvoiceParams {
  subscriptionId?: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  currency?: string;
  subtotalUsd: number;
  creditsUsd?: number;
  totalUsd: number;
  status?: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  provider?: "stripe" | "simulation";
  providerInvoiceId?: string;
}

function sanitizeInvoice(docId: string, orgId: string, data: Record<string, unknown>): Invoice {
  const toDateString = (val: unknown): string => {
    if (!val) return new Date().toISOString();
    if (typeof val === "string") return val;
    if (typeof val === "object" && val !== null && "toDate" in val && typeof (val as { toDate: () => Date }).toDate === "function") {
      return (val as { toDate: () => Date }).toDate().toISOString();
    }
    return new Date().toISOString();
  };

  const rawStatus = String(data.status || "OPEN").toUpperCase();
  const status: InvoiceStatus = (
    rawStatus === "PAID" ? "PAID" :
    rawStatus === "VOID" ? "VOID" :
    rawStatus === "UNCOLLECTIBLE" ? "UNCOLLECTIBLE" :
    rawStatus === "FAILED" ? "FAILED" :
    rawStatus === "DRAFT" ? "DRAFT" : "OPEN"
  ) as InvoiceStatus;

  const rawItems = Array.isArray(data.lineItems) ? data.lineItems : [];
  const lineItems: InvoiceLineItem[] = rawItems.map((item: Record<string, unknown>, idx) => ({
    id: String(item.id || `item_${idx + 1}`),
    description: String(item.description || "Line Item"),
    quantity: Number(item.quantity) || 1,
    unitPriceUsd: Number(item.unitPriceUsd) || 0,
    amountUsd: Number(item.amountUsd) || 0,
    type: (item.type as InvoiceLineItem["type"]) || "SUBSCRIPTION",
    metadata: typeof item.metadata === "object" && item.metadata !== null ? (item.metadata as Record<string, unknown>) : undefined,
  }));

  return {
    id: docId,
    organizationId: orgId,
    subscriptionId: data.subscriptionId ? String(data.subscriptionId) : undefined,
    billingPeriodStart: String(data.billingPeriodStart || new Date().toISOString()),
    billingPeriodEnd: String(data.billingPeriodEnd || new Date().toISOString()),
    currency: String(data.currency || "USD"),
    subtotalUsd: Number(data.subtotalUsd) || 0,
    creditsUsd: Number(data.creditsUsd) || 0,
    totalUsd: Number(data.totalUsd) || 0,
    status,
    lineItems,
    provider: (data.provider as "stripe" | "simulation") || "simulation",
    providerInvoiceId: data.providerInvoiceId ? String(data.providerInvoiceId) : undefined,
    createdAt: toDateString(data.createdAt),
    finalizedAt: data.finalizedAt ? toDateString(data.finalizedAt) : undefined,
    paidAt: data.paidAt ? toDateString(data.paidAt) : undefined,
    voidedAt: data.voidedAt ? toDateString(data.voidedAt) : undefined,
  };
}

/**
 * Creates an invoice with deterministic idempotency to prevent duplicate period billings.
 */
export async function createInvoice(
  orgId: string,
  params: CreateInvoiceParams,
  actorId?: string
): Promise<Invoice> {
  const db = getAdminFirestore();

  // Deterministic invoice ID based on org + period start + optional providerInvoiceId
  const periodTag = params.billingPeriodStart.slice(0, 10);
  const invoiceId = params.providerInvoiceId || `inv_${orgId}_${periodTag}`;

  const invoiceRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("billing")
    .doc("invoices")
    .collection("items")
    .doc(invoiceId);

  const existing = await invoiceRef.get();
  if (existing.exists) {
    return sanitizeInvoice(invoiceId, orgId, existing.data() || {});
  }

  const now = FieldValue.serverTimestamp();
  const payload: Record<string, unknown> = {
    id: invoiceId,
    organizationId: orgId,
    subscriptionId: params.subscriptionId || null,
    billingPeriodStart: params.billingPeriodStart,
    billingPeriodEnd: params.billingPeriodEnd,
    currency: params.currency || "USD",
    subtotalUsd: params.subtotalUsd,
    creditsUsd: params.creditsUsd || 0,
    totalUsd: params.totalUsd,
    status: params.status || "OPEN",
    lineItems: params.lineItems,
    provider: params.provider || "simulation",
    providerInvoiceId: params.providerInvoiceId || null,
    createdAt: now,
    finalizedAt: now,
    paidAt: params.status === "PAID" ? now : null,
  };

  await invoiceRef.set(payload);

  if (actorId) {
    await recordAuditLog({
      organizationId: orgId,
      actorId,
      action: "INVOICE_CREATED",
      resourceType: "invoice",
      resourceId: invoiceId,
      details: { totalUsd: params.totalUsd, status: payload.status },
    });
  }

  return sanitizeInvoice(invoiceId, orgId, {
    ...payload,
    createdAt: new Date().toISOString(),
    finalizedAt: new Date().toISOString(),
    paidAt: params.status === "PAID" ? new Date().toISOString() : undefined,
  });
}

/**
 * Retrieves an invoice by ID.
 */
export async function getInvoice(orgId: string, invoiceId: string): Promise<Invoice | null> {
  const db = getAdminFirestore();
  const doc = await db
    .collection("organizations")
    .doc(orgId)
    .collection("billing")
    .doc("invoices")
    .collection("items")
    .doc(invoiceId)
    .get();

  if (!doc.exists) return null;
  return sanitizeInvoice(doc.id, orgId, doc.data() || {});
}

/**
 * Lists invoices for an organization with optional bounded filtering.
 */
export async function listInvoices(
  orgId: string,
  options: BillingFilterOptions = {}
): Promise<Invoice[]> {
  const db = getAdminFirestore();
  const limit = Math.min(Math.max(1, options.limit || 50), 100);

  let query = db
    .collection("organizations")
    .doc(orgId)
    .collection("billing")
    .doc("invoices")
    .collection("items")
    .orderBy("createdAt", "desc");

  if (options.status) {
    const norm = String(options.status).toUpperCase();
    query = query.where("status", "==", norm) as typeof query;
  }

  if (options.startDate) {
    const startTimestamp = Timestamp.fromDate(new Date(options.startDate));
    query = query.where("createdAt", ">=", startTimestamp) as typeof query;
  }

  if (options.endDate) {
    const endTimestamp = Timestamp.fromDate(new Date(options.endDate));
    query = query.where("createdAt", "<=", endTimestamp) as typeof query;
  }

  const snap = await query.limit(limit).get();
  return snap.docs.map((doc) => sanitizeInvoice(doc.id, orgId, doc.data()));
}

/**
 * Finalizes a draft invoice.
 */
export async function finalizeInvoice(
  orgId: string,
  invoiceId: string,
  actorId?: string
): Promise<Invoice | null> {
  const db = getAdminFirestore();
  const ref = db
    .collection("organizations")
    .doc(orgId)
    .collection("billing")
    .doc("invoices")
    .collection("items")
    .doc(invoiceId);

  const doc = await ref.get();
  if (!doc.exists) return null;

  const now = FieldValue.serverTimestamp();
  await ref.update({
    status: "OPEN",
    finalizedAt: now,
    updatedAt: now,
  });

  if (actorId) {
    await recordAuditLog({
      organizationId: orgId,
      actorId,
      action: "INVOICE_FINALIZED",
      resourceType: "invoice",
      resourceId: invoiceId,
    });
  }

  const updated = await ref.get();
  return sanitizeInvoice(updated.id, orgId, updated.data() || {});
}

/**
 * Marks an invoice as PAID.
 */
export async function markInvoicePaid(
  orgId: string,
  invoiceId: string,
  actorId?: string
): Promise<Invoice | null> {
  const db = getAdminFirestore();
  const ref = db
    .collection("organizations")
    .doc(orgId)
    .collection("billing")
    .doc("invoices")
    .collection("items")
    .doc(invoiceId);

  const doc = await ref.get();
  if (!doc.exists) return null;

  const now = FieldValue.serverTimestamp();
  await ref.update({
    status: "PAID",
    paidAt: now,
    updatedAt: now,
  });

  if (actorId) {
    await recordAuditLog({
      organizationId: orgId,
      actorId,
      action: "INVOICE_PAID",
      resourceType: "invoice",
      resourceId: invoiceId,
    });
  }

  const updated = await ref.get();
  return sanitizeInvoice(updated.id, orgId, updated.data() || {});
}

/**
 * Marks an invoice as FAILED.
 */
export async function markInvoiceFailed(
  orgId: string,
  invoiceId: string,
  reason?: string,
  actorId?: string
): Promise<Invoice | null> {
  const db = getAdminFirestore();
  const ref = db
    .collection("organizations")
    .doc(orgId)
    .collection("billing")
    .doc("invoices")
    .collection("items")
    .doc(invoiceId);

  const doc = await ref.get();
  if (!doc.exists) return null;

  const now = FieldValue.serverTimestamp();
  await ref.update({
    status: "FAILED",
    failureReason: reason || "Payment declined",
    updatedAt: now,
  });

  if (actorId) {
    await recordAuditLog({
      organizationId: orgId,
      actorId,
      action: "INVOICE_FAILED",
      resourceType: "invoice",
      resourceId: invoiceId,
      details: { reason },
    });
  }

  const updated = await ref.get();
  return sanitizeInvoice(updated.id, orgId, updated.data() || {});
}

/**
 * Voids an invoice.
 */
export async function voidInvoice(
  orgId: string,
  invoiceId: string,
  actorId?: string
): Promise<Invoice | null> {
  const db = getAdminFirestore();
  const ref = db
    .collection("organizations")
    .doc(orgId)
    .collection("billing")
    .doc("invoices")
    .collection("items")
    .doc(invoiceId);

  const doc = await ref.get();
  if (!doc.exists) return null;

  const now = FieldValue.serverTimestamp();
  await ref.update({
    status: "VOID",
    voidedAt: now,
    updatedAt: now,
  });

  if (actorId) {
    await recordAuditLog({
      organizationId: orgId,
      actorId,
      action: "INVOICE_VOIDED",
      resourceType: "invoice",
      resourceId: invoiceId,
    });
  }

  const updated = await ref.get();
  return sanitizeInvoice(updated.id, orgId, updated.data() || {});
}
