/**
 * OsterdOps — Billing Customer Service (Phase 13)
 * Manages customer billing profiles under:
 * organizations/{organizationId}/billing/customer
 */

import "server-only";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { recordAuditLog } from "@/lib/services/audit.service";
import type { BillingCustomer } from "@/types";

export interface SaveBillingCustomerParams {
  email: string;
  currency?: string;
  providerCustomerId?: string;
  provider?: "stripe" | "simulation";
}

function sanitizeCustomer(docId: string, orgId: string, data: Record<string, unknown>): BillingCustomer {
  const toDateString = (val: unknown): string => {
    if (!val) return new Date().toISOString();
    if (typeof val === "string") return val;
    if (typeof val === "object" && val !== null && "toDate" in val && typeof (val as { toDate: () => Date }).toDate === "function") {
      return (val as { toDate: () => Date }).toDate().toISOString();
    }
    return new Date().toISOString();
  };

  return {
    id: docId,
    organizationId: orgId,
    email: String(data.email || ""),
    currency: String(data.currency || "USD"),
    provider: (data.provider as "stripe" | "simulation") || "simulation",
    providerCustomerId: String(data.providerCustomerId || `cus_${orgId}`),
    createdAt: toDateString(data.createdAt),
    updatedAt: toDateString(data.updatedAt),
  };
}

/**
 * Retrieves the billing customer profile for an organization.
 */
export async function getBillingCustomer(orgId: string): Promise<BillingCustomer | null> {
  const db = getAdminFirestore();
  const doc = await db
    .collection("organizations")
    .doc(orgId)
    .collection("billing")
    .doc("customer")
    .get();

  if (!doc.exists) return null;
  return sanitizeCustomer(doc.id, orgId, doc.data() || {});
}

/**
 * Creates or updates the billing customer record.
 */
export async function createOrUpdateBillingCustomer(
  orgId: string,
  params: SaveBillingCustomerParams,
  actorId?: string
): Promise<BillingCustomer> {
  const db = getAdminFirestore();
  const customerRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("billing")
    .doc("customer");

  const existing = await customerRef.get();
  const isNew = !existing.exists;
  const now = FieldValue.serverTimestamp();

  const payload: Record<string, unknown> = {
    organizationId: orgId,
    email: params.email.trim().toLowerCase(),
    currency: params.currency || "USD",
    provider: params.provider || "simulation",
    providerCustomerId: params.providerCustomerId || `cus_${orgId}`,
    updatedAt: now,
  };

  if (isNew) {
    payload.createdAt = now;
  }

  await customerRef.set(payload, { merge: true });

  if (actorId) {
    await recordAuditLog({
      organizationId: orgId,
      actorId,
      action: isNew ? "BILLING_CUSTOMER_CREATED" : "BILLING_CUSTOMER_UPDATED",
      resourceType: "billingCustomer",
      resourceId: String(payload.providerCustomerId),
      details: { email: payload.email, provider: payload.provider },
    });
  }

  return sanitizeCustomer("customer", orgId, {
    ...payload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}
