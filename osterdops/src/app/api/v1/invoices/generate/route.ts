/**
 * POST /api/v1/invoices/generate
 * Idempotently generates, records, and streams a client PDF invoice with custom billing details.
 * Prevents duplicate invoice creation for the current billing period.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server";
import { getUserOrganizations } from "@/lib/services/organization.service";
import { getInvoice, createInvoice } from "@/lib/billing/invoice.service";
import { generateInvoicePdf, type InvoicePdfPayload } from "@/lib/services/invoice-pdf.service";
import { getOrganizationSettings } from "@/lib/services/settings.service";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    // 1. Authenticate user session
    const authResult = await requireAuth(request);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { user } = authResult;

    // 2. Resolve user's organization
    const orgs = await getUserOrganizations(user.uid);
    const activeOrg = orgs[0]?.organization || null;
    const orgId = activeOrg?.id || "org_default";
    const orgName = activeOrg?.name || "Enterprise AI Workspace";

    // 3. Parse input body
    let body: {
      clientName?: string;
      companyName?: string;
      address?: string;
      taxId?: string;
      period?: string;
    } = {};

    try {
      body = await request.json();
    } catch {
      // Empty or invalid body, use defaults
    }

    const now = new Date();
    const periodTag = body.period || `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, "0")}`;
    const safeOrgTag = orgId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 16);
    const invoiceId = `inv_${safeOrgTag}_${periodTag}`;

    // 4. Idempotency Guard: Check if invoice for this period already exists
    let invoiceRecord = await getInvoice(orgId, invoiceId);

    if (!invoiceRecord) {
      // Create single invoice with deterministic ID
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
      const planTier = (activeOrg?.planTier || "pro").toLowerCase();
      const tierPrice = planTier === "scale" ? 159.0 : planTier === "enterprise" ? 499.0 : 49.0;

      invoiceRecord = await createInvoice(
        orgId,
        {
          providerInvoiceId: invoiceId,
          billingPeriodStart: periodStart,
          billingPeriodEnd: periodEnd,
          currency: "USD",
          subtotalUsd: tierPrice,
          totalUsd: tierPrice,
          status: "PAID",
          lineItems: [
            {
              id: "li_plan_sub",
              description: `OsterdOps ${planTier.toUpperCase()} Platform Base Subscription (Monthly)`,
              quantity: 1,
              unitPriceUsd: tierPrice,
              amountUsd: tierPrice,
              type: "SUBSCRIPTION",
            },
            {
              id: "li_sla_guard",
              description: "Zero-Downtime Circuit Breaker & Multi-Provider Failover SLA",
              quantity: 1,
              unitPriceUsd: 0.0,
              amountUsd: 0.0,
              type: "SUBSCRIPTION",
            },
          ],
        },
        user.uid
      );
    }

    // 5. Construct PDF Payload with dynamic dates, saved organization settings, and client customizations
    const orgSettings = await getOrganizationSettings(orgId, orgName, user.email);

    const clientName = body.clientName?.trim() || user.displayName || user.email || "Valued Client";
    const companyName = body.companyName?.trim() || orgSettings.companyName || invoiceRecord.subscriptionId || orgName;
    const address = body.address?.trim() || orgSettings.billingAddress || "100 Enterprise Way, Suite 400, San Francisco, CA";
    const taxId = body.taxId?.trim() || orgSettings.taxId || undefined;

    const pdfPayload: InvoicePdfPayload = {
      id: invoiceRecord.id,
      clientName,
      companyName,
      orgName,
      address,
      taxId,
      subtotal: invoiceRecord.subtotalUsd || 49.0,
      total: invoiceRecord.totalUsd || 49.0,
      taxRate: "0.0%",
      taxAmount: 0.0,
      status: invoiceRecord.status || "PAID",
      items: (invoiceRecord.lineItems || []).map((li) => ({
        description: li.description || "OsterdOps AI Workload",
        unitPrice: li.unitPriceUsd || li.amountUsd || 49.0,
        qty: li.quantity || 1,
        total: li.amountUsd || 49.0,
      })),
    };

    // 6. Generate Vector PDF
    const pdfBuffer = await generateInvoicePdf(pdfPayload);

    // 7. Stream Response with Attachment Headers
    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice-${invoiceId}.pdf"`,
        "Content-Length": String(pdfBuffer.length),
        "X-Invoice-Id": invoiceId,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("[Invoice Generation] Failed to generate invoice:", err);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: errorMsg },
      { status: 500 }
    );
  }
}
