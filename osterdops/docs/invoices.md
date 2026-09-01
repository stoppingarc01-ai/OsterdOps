# OsterdOps Invoices & Financial Idempotency (Phase 13)

This document details the structure, state machine, line items, and deduplication guarantees of OsterdOps invoices.

---

## 1. Invoice Lifecycle States

- **`DRAFT`**: Draft calculation pending finalization.
- **`OPEN`**: Finalized invoice awaiting payment collection.
- **`PAID`**: Payment successfully captured via provider webhook or verified charge.
- **`FAILED`**: Charge attempt failed or declined by issuing bank.
- **`VOID`**: Invoice canceled or replaced.
- **`UNCOLLECTIBLE`**: Bad debt written off.

---

## 2. Deterministic Idempotency Strategy

To prevent double billing or duplicate invoice generation for the same organization billing cycle:

$$\text{invoiceId} = \text{inv\_}\{\text{organizationId}\}\_\{\text{billingPeriodStart (YYYY-MM-DD)}\}$$

Subsequent invocations for the same period return the existing invoice record without re-charging or modifying line items.

---

## 3. Invoice Line Items Structure

```typescript
export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPriceUsd: number;
  amountUsd: number;
  type: "SUBSCRIPTION" | "OVERAGE" | "ADJUSTMENT" | "CREDIT";
  metadata?: Record<string, unknown>;
}
```

Line items strictly separate the base recurring subscription fee, metered token overage costs, and any promotional or manual credits.
