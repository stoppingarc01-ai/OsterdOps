# OsterdOps — Webhook Delivery, Retries & Idempotency

## 1. Outbound Webhook Protocol

Outbound webhooks sent by OsterdOps include:
- `Content-Type: application/json`
- `User-Agent: OsterdOps-Webhook-Dispatcher/2.0`
- `x-osterdops-signature: t=...,v1=...` (HMAC-SHA256 timestamped signature)
- `x-osterdops-idempotency-key: <orgId>:<eventId>:<integrationId>`

---

## 2. Retry Policy

- **Transient Failures (Retried)**: HTTP 408, 429, 500, 502, 503, 504, and network timeouts. Exponential backoff with jitter is applied.
- **Permanent Failures (Not Retried)**: HTTP 400, 401, 403, 404, 422 immediately transition to `FAILED` or `DEAD_LETTER`.
