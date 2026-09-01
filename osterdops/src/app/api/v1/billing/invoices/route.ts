/**
 * /api/v1/billing/invoices
 * GET: Lists organization invoices with optional filters (Requires billing:read)
 * POST: Generates an invoice (Requires billing:manage)
 */

import { requirePermission } from "@/lib/auth/rbac";
import { listInvoices, createInvoice } from "@/lib/billing/invoice.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import type { InvoiceStatus } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organizationId");

    if (!orgId) {
      return ApiErrors.badRequest("Query parameter 'organizationId' is required.");
    }

    const authResult = await requirePermission(request, orgId, "billing:read");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const status = searchParams.get("status") as InvoiceStatus | undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;

    const invoices = await listInvoices(orgId, {
      status,
      startDate,
      endDate,
      limit,
    });

    return apiSuccess(invoices);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve invoices.";
    return ApiErrors.internalError(message);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orgId = body?.organizationId;

    if (!orgId) {
      return ApiErrors.badRequest("Property 'organizationId' is required.");
    }

    const authResult = await requirePermission(request, orgId, "billing:manage");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    if (!body.billingPeriodStart || !body.billingPeriodEnd) {
      return ApiErrors.badRequest("Properties 'billingPeriodStart' and 'billingPeriodEnd' are required.");
    }

    const invoice = await createInvoice(
      orgId,
      {
        subscriptionId: body.subscriptionId,
        billingPeriodStart: body.billingPeriodStart,
        billingPeriodEnd: body.billingPeriodEnd,
        currency: body.currency || "USD",
        subtotalUsd: Number(body.subtotalUsd) || 0,
        creditsUsd: Number(body.creditsUsd) || 0,
        totalUsd: Number(body.totalUsd) || 0,
        status: body.status || "OPEN",
        lineItems: Array.isArray(body.lineItems) ? body.lineItems : [],
        provider: body.provider,
        providerInvoiceId: body.providerInvoiceId,
      },
      authResult.user?.uid
    );

    return apiSuccess(invoice, undefined, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create invoice.";
    return ApiErrors.internalError(message);
  }
}
