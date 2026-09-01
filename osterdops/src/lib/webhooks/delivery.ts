/**
 * OsterdOps — Webhook Event Delivery & Dispatch Engine (Phase 18)
 * Resilient signed HTTP POST dispatch with retry schedules and security auditing.
 */

import { WebhookEventEnvelope, WebhookDeliveryAttempt } from "./types";
import { generateWebhookSignature } from "./signature";
import { recordAuditLog } from "@/lib/services/audit.service";

export interface DeliveryOptions {
  timeoutMs?: number;
  maxRetries?: number;
  fetchFn?: typeof fetch;
}

export const RETRY_DELAYS_MS = [
  0,             // Immediate attempt 1
  15 * 60 * 1000, // 15 mins
  60 * 60 * 1000, // 1 hour
  6 * 60 * 60 * 1000, // 6 hours
  24 * 60 * 60 * 1000, // 24 hours
];

/**
 * Dispatches a signed webhook event to an external endpoint with signature and delivery headers.
 */
export async function deliverWebhookEvent<T extends Record<string, unknown>>(
  endpointUrl: string,
  secret: string,
  event: WebhookEventEnvelope<T>,
  options?: DeliveryOptions
): Promise<WebhookDeliveryAttempt> {
  const deliveryId = `del_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const rawPayload = JSON.stringify(event);
  const { signatureHeader, timestamp } = generateWebhookSignature(rawPayload, secret);
  const timeoutMs = options?.timeoutMs || 15000;
  const customFetch = options?.fetchFn || fetch;

  const startTime = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await customFetch(endpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-osterdops-signature": signatureHeader,
        "x-osterdops-event": event.type,
        "x-osterdops-delivery-id": deliveryId,
        "x-osterdops-delivery-timestamp": String(timestamp),
      },
      body: rawPayload,
      signal: controller.signal,
    });

    clearTimeout(timer);
    const latencyMs = Date.now() - startTime;
    const isSuccess = response.status >= 200 && response.status < 300;

    const attempt: WebhookDeliveryAttempt = {
      deliveryId,
      eventId: event.id,
      endpointUrl,
      statusCode: response.status,
      latencyMs,
      success: isSuccess,
      attemptNumber: 1,
      timestamp: new Date().toISOString(),
    };

    if (!isSuccess) {
      attempt.error = `HTTP response status ${response.status}`;
      await recordAuditLog({
        organizationId: event.organizationId,
        actorId: "system:webhook",
        action: "WEBHOOK_DELIVERY_FAILED",
        resourceType: "webhook_delivery",
        resourceId: deliveryId,
        details: { eventId: event.id, eventType: event.type, statusCode: response.status },
      });
    }

    return attempt;
  } catch (err: unknown) {
    clearTimeout(timer);
    const latencyMs = Date.now() - startTime;
    const errMsg = err instanceof Error ? err.message : "Network error during delivery.";

    await recordAuditLog({
      organizationId: event.organizationId,
      actorId: "system:webhook",
      action: "WEBHOOK_DELIVERY_FAILED",
      resourceType: "webhook_delivery",
      resourceId: deliveryId,
      details: { eventId: event.id, eventType: event.type, error: errMsg },
    });

    return {
      deliveryId,
      eventId: event.id,
      endpointUrl,
      latencyMs,
      success: false,
      error: errMsg,
      attemptNumber: 1,
      timestamp: new Date().toISOString(),
    };
  }
}
