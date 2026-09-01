# Standard API Error Contracts

OsterdOps returns standardized error payloads with machine-readable error codes and correlation IDs.

---

## 1. Canonical Error Envelope

```json
{
  "success": false,
  "error": {
    "code": "BUDGET_EXCEEDED",
    "message": "Monthly spend limit reached under HARD enforcement.",
    "requestId": "req_1788022596_m8x2p",
    "details": {
      "budgetId": "bud_01j9a8b1",
      "limitUsd": 1000.0,
      "currentSpendUsd": 1005.2
    }
  }
}
```

---

## 2. Standard Error Codes

| Error Code | HTTP Status | Retryable | Description |
|---|---|---|---|
| `BAD_REQUEST` | 400 | No | Malformed JSON, missing mandatory fields, or schema invalid. |
| `UNAUTHORIZED` | 401 | No | Missing, invalid, or expired API key / session token. |
| `FORBIDDEN` | 403 | No | Role or API key scope does not permit this action. |
| `NOT_FOUND` | 404 | No | The target resource ID does not exist in the tenant scope. |
| `CONFLICT` | 409 | No | Resource identifier, slug, or unique field collision. |
| `VALIDATION_ERROR` | 400 | No | Detailed input constraint failure. |
| `RATE_LIMITED` | 429 | Yes | Sliding window rate limit reached. Honor `Retry-After`. |
| `BUDGET_EXCEEDED` | 429 | No | Hard budget cap reached. Requests blocked until limit reset. |
| `ENTITLEMENT_EXCEEDED` | 403 | No | Plan limit reached (e.g. max projects for Free tier). |
| `IDEMPOTENCY_CONFLICT` | 409 | No | Same `Idempotency-Key` supplied with different payload. |
| `UNSUPPORTED_VERSION` | 400 | No | API version requested is not supported. |
| `SERVICE_UNAVAILABLE` | 503 | Yes | Temporary upstream provider or infrastructure outage. |
| `INTERNAL_ERROR` | 500 | Yes | Unexpected server exception. |
