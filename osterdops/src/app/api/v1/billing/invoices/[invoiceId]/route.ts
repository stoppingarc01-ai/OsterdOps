/**
 * GET /api/v1/billing/invoices/[invoiceId]
 * Retrieves single invoice details (Requires billing:read)
 */

import { requirePermission } from "@/lib/auth/rbac";
import { getInvoice } from "@/lib/billing/invoice.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";

interface RouteParams {
  params: Promise<{ invoiceId: string }>;
}

export async function GET(request: Request, props: RouteParams) {
  try {
    const { invoiceId } = await props.params;
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organizationId");

    if (!orgId) {
      return ApiErrors.badRequest("Query parameter 'organizationId' is required.");
    }

    const authResult = await requirePermission(request, orgId, "billing:read");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const invoice = await getInvoice(orgId, invoiceId);
    if (!invoice) {
      return ApiErrors.notFound(`Invoice '${invoiceId}' not found.`);
    }

    return apiSuccess(invoice);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve invoice.";
    return ApiErrors.internalError(message);
  }
}
