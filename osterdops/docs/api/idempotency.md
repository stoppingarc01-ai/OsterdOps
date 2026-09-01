# Request Idempotency

OsterdOps supports the `Idempotency-Key` header for mutation operations (such as creating projects, issuing API keys, and setting budgets) to prevent duplicate execution during network retries.

---

## 1. How It Works

```http
POST /api/v1/projects HTTP/1.1
Host: api.osterdops.com
Authorization: Bearer osk_live_...
Idempotency-Key: idemp_checkout_99182_attempt1
Content-Type: application/json

{
  "name": "Billing Processor",
  "spendLimitMonthly": 500
}
```

1. **Fingerprinting**: OsterdOps computes a SHA-256 fingerprint scoped to `organizationId + ":" + endpoint + ":" + body`.
2. **First Execution**: The request is processed normally and the completed response is stored for 24 hours.
3. **Safe Replay**: If the client retries with the same `Idempotency-Key` and identical payload, OsterdOps replays the cached response with header `x-idempotency-replayed: true`.
4. **Collision Detection**: If the client uses the same `Idempotency-Key` with a *different* request body, OsterdOps rejects the request with HTTP `409` and error code `IDEMPOTENCY_CONFLICT`.
