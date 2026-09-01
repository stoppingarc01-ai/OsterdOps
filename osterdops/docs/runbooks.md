# OsterdOps Operational Runbooks & Incident Response (Phase 14)

---

## Runbook 1: Dead-Letter Queue Triage & Replay

### Symptoms
- `/api/v1/system/diagnostics` reports `queue.deadLetters > 0`.
- Metric `queue_jobs_dead_lettered` incremented.

### Remediation Steps
1. Retrieve dead-letter entries via `getDeadLetters()`.
2. Inspect `lastError` field to determine failure cause (e.g. downstream provider timeout vs payload error).
3. If issue is resolved, trigger `retryDeadLetter(jobId)` to re-enqueue.

---

## Runbook 2: Rate Limit Spike & Distributed Fallback

### Symptoms
- Increased HTTP 429 responses on `/api/v1/gateway/chat/completions`.
- High count in `gateway_requests_rate_limited`.

### Remediation Steps
1. Verify if client is exceeding their project key rate limit.
2. Check `x-ratelimit-reset` header in client responses.
3. If Redis cluster is degraded, OsterdOps automatically falls back to local memory rate limiting without rejecting valid traffic.

---

## Runbook 3: Billing Discrepancy Investigation

### Symptoms
- Audit log shows `BILLING_DISCREPANCY_DETECTED`.
- Reconciliation report status is `DISCREPANCY_DETECTED`.

### Remediation Steps
1. Navigate to `organizations/{orgId}/billing/reconciliations/reports/{reconciliationId}`.
2. Review specific discrepancy type (`UNAVAILABLE_PRICING`, `SPEND_INVOICE_MISMATCH`, etc.).
3. Add missing model pricing in `src/lib/pricing/registry.ts` if custom upstream model was queried.
