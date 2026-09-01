/**
 * POST /api/v1/billing/webhooks/stripe
 * Public Stripe webhook endpoint with cryptographic HMAC-SHA256 signature verification,
 * replay protection, and deterministic event idempotency.
 */

import { NextResponse } from "next/server";
import { getBillingProvider } from "@/lib/billing/providers/registry";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { syncSubscription, cancelSubscription } from "@/lib/billing/subscription.service";
import { markInvoicePaid, markInvoiceFailed } from "@/lib/billing/invoice.service";
import { recordAuditLog } from "@/lib/services/audit.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import type { SubscriptionStatus, BillingPlanId } from "@/types";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signatureHeader = request.headers.get("stripe-signature");

    if (!signatureHeader) {
      return ApiErrors.badRequest("Missing 'stripe-signature' header.");
    }

    const provider = getBillingProvider();
    const isValidSignature = provider.verifyWebhookSignature(rawBody, signatureHeader);

    if (!isValidSignature) {
      console.warn("[OsterdOps Webhook] Invalid Stripe webhook signature rejected.");
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "WEBHOOK_SIGNATURE_INVALID",
            message: "Stripe signature verification failed.",
          },
        },
        { status: 400 }
      );
    }

    const event = provider.parseWebhookEvent(rawBody);
    const eventId = event.id;
    const db = getAdminFirestore();

    // Check idempotency in webhook events collection
    const webhookDocRef = db.collection("system").doc("webhooks").collection("stripe").doc(eventId);
    const existing = await webhookDocRef.get();

    if (existing.exists) {
      return apiSuccess({ received: true, idempotent: true, message: "Event already processed" });
    }

    const eventData = (event.data?.object as Record<string, unknown>) || {};
    const metadata = (typeof eventData.metadata === "object" && eventData.metadata !== null) ? (eventData.metadata as Record<string, unknown>) : {};
    const orgId = String(
      eventData.client_reference_id ||
      metadata.organizationId ||
      eventData.organizationId ||
      ""
    );

    // Process event based on type
    switch (event.type) {
      case "checkout.session.completed": {
        if (orgId) {
          const planId = (String(metadata.planId || "PRO").toUpperCase()) as BillingPlanId;
          const customerId = String(eventData.customer || "");
          const subId = String(eventData.subscription || "");

          await syncSubscription(orgId, {
            planId,
            status: "ACTIVE",
            provider: "stripe",
            providerCustomerId: customerId || undefined,
            providerSubscriptionId: subId || undefined,
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        if (orgId) {
          const status = (String(eventData.status || "ACTIVE").toUpperCase()) as SubscriptionStatus;
          await syncSubscription(orgId, { status });
        }
        break;
      }

      case "customer.subscription.deleted": {
        if (orgId) {
          await cancelSubscription(orgId, true);
        }
        break;
      }

      case "invoice.paid": {
        if (orgId) {
          const invoiceId = String(eventData.id || "");
          await markInvoicePaid(orgId, invoiceId);
        }
        break;
      }

      case "invoice.payment_failed": {
        if (orgId) {
          const invoiceId = String(eventData.id || "");
          await markInvoiceFailed(orgId, invoiceId, "Card declined or insufficient funds");
          await syncSubscription(orgId, { status: "PAST_DUE" });
        }
        break;
      }

      default:
        // Gracefully accept other unhandled events
        break;
    }

    // Persist idempotency record
    await webhookDocRef.set({
      id: eventId,
      type: event.type,
      organizationId: orgId || null,
      processedAt: FieldValue.serverTimestamp(),
    });

    if (orgId) {
      await recordAuditLog({
        organizationId: orgId,
        actorId: "stripe_webhook",
        action: "BILLING_WEBHOOK_PROCESSED",
        resourceType: "webhookEvent",
        resourceId: eventId,
        details: { eventType: event.type },
      });
    }

    return apiSuccess({ received: true, eventId, type: event.type });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook processing failed.";
    return ApiErrors.internalError(message);
  }
}
