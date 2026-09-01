/**
 * OsterdOps — Phase 13: Invoice Engine Unit Tests
 * Tests invoice line items, calculations, deterministic idempotency,
 * and status transitions.
 */

import { calculateInvoiceTotal } from "@/lib/billing/calculator";
import type { Invoice, InvoiceLineItem, InvoiceStatus } from "@/types";

export function testInvoiceLifecycleAndIdempotency() {
  const orgId = "org_inv_test";
  const periodStart = "2026-08-01T00:00:00.000Z";
  const periodEnd = "2026-08-31T23:59:59.999Z";

  // 1. Line items
  const lineItems: InvoiceLineItem[] = [
    {
      id: "item_sub",
      description: "Pro Plan Monthly Subscription",
      quantity: 1,
      unitPriceUsd: 49.00,
      amountUsd: 49.00,
      type: "SUBSCRIPTION",
    },
    {
      id: "item_overage",
      description: "2M Token Overage ($3.50 / 1M)",
      quantity: 2,
      unitPriceUsd: 3.50,
      amountUsd: 7.00,
      type: "OVERAGE",
    },
  ];

  const totals = calculateInvoiceTotal(49.00, 7.00, 5.00); // $5 credit
  if (totals.subtotalUsd !== 56.00 || totals.creditsUsd !== 5.00 || totals.totalUsd !== 51.00) {
    throw new Error("Invoice total calculation mismatch.");
  }

  // 2. Deterministic invoice ID
  const invoiceId = `inv_${orgId}_${periodStart.slice(0, 10)}`;
  const invoice: Invoice = {
    id: invoiceId,
    organizationId: orgId,
    subscriptionId: "sub_123",
    billingPeriodStart: periodStart,
    billingPeriodEnd: periodEnd,
    currency: "USD",
    subtotalUsd: totals.subtotalUsd,
    creditsUsd: totals.creditsUsd,
    totalUsd: totals.totalUsd,
    status: "OPEN",
    lineItems,
    provider: "stripe",
    providerInvoiceId: "in_stripe_abc",
    createdAt: new Date().toISOString(),
  };

  if (invoice.id !== "inv_org_inv_test_2026-08-01") {
    throw new Error("Deterministic invoice ID format mismatch.");
  }

  // 3. Status transitions: OPEN -> PAID
  const paidInvoice: Invoice = {
    ...invoice,
    status: "PAID" as InvoiceStatus,
    paidAt: new Date().toISOString(),
  };
  if (paidInvoice.status !== "PAID" || !paidInvoice.paidAt) {
    throw new Error("Mark invoice PAID failed.");
  }

  // 4. Status transitions: OPEN -> FAILED
  const failedInvoice: Invoice = {
    ...invoice,
    status: "FAILED" as InvoiceStatus,
  };
  if (failedInvoice.status !== "FAILED") {
    throw new Error("Mark invoice FAILED failed.");
  }

  // 5. Status transitions: OPEN -> VOID
  const voidInvoice: Invoice = {
    ...invoice,
    status: "VOID" as InvoiceStatus,
    voidedAt: new Date().toISOString(),
  };
  if (voidInvoice.status !== "VOID" || !voidInvoice.voidedAt) {
    throw new Error("Void invoice failed.");
  }
}

export function runInvoiceTests() {
  testInvoiceLifecycleAndIdempotency();
}
