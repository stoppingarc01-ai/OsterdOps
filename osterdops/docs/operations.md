# OsterdOps Operations & Observability Guide (Phase 14)

This document covers operational logging, metrics tracking, request correlation, and system health evaluation.

---

## 1. Structured Logging & Zero-Content Redaction

All logs emitted by `src/lib/observability/logger.ts` follow structured JSON formatting:

```json
{
  "timestamp": "2026-08-29T10:15:30.123Z",
  "level": "info",
  "service": "osterdops",
  "environment": "production",
  "event": "GATEWAY_REQUEST_COMPLETED",
  "requestId": "gw_1724926530123_abc",
  "organizationId": "org_enterprise_1",
  "projectId": "proj_prod",
  "durationMs": 420,
  "statusCode": 200,
  "metadata": {
    "provider": "openai",
    "model": "gpt-4o",
    "inputTokens": 150,
    "outputTokens": 45
  }
}
```

### Mandatory Redaction Rules
The `redactSensitiveData()` engine strictly removes:
- User prompts, completions, assistant messages, and system instructions.
- Authorization headers, API keys (`osk_...`), Stripe secrets (`sk_...`, `whsec_...`), and provider credentials.

---

## 2. Health & Readiness Probes

| Endpoint | Method | Purpose | Response Format |
| :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | Container / Load Balancer Liveness | `{ status: "healthy", version, timestamp }` |
| `/api/ready` | `GET` | Traffic Readiness Verification | `{ status: "ready", checks: { ... } }` |
| `/api/v1/system/health` | `GET` | System Health Summary | `{ status: "healthy", checks: { ... } }` |
| `/api/v1/system/diagnostics` | `GET` | RBAC-Protected Diagnostics (`system:read`) | Detailed dependency, queue, and metrics report |

---

## 3. Operational Metrics

Metrics are captured using bounded-cardinality labels (`provider`, `model`, `status`, `endpoint`, `jobType`):

- `gateway_requests_total`
- `gateway_requests_success`
- `gateway_requests_error`
- `gateway_requests_rate_limited`
- `gateway_requests_budget_blocked`
- `usage_records_total`
- `cost_records_total`
- `pricing_unavailable_total`
- `budget_evaluations_total`
- `alerts_created_total`
- `notifications_sent_total`
- `notifications_failed_total`
- `billing_webhooks_total`
- `billing_webhooks_failed`
- `queue_jobs_total`
- `queue_jobs_failed`
- `queue_jobs_retried`
- `queue_jobs_dead_lettered`
