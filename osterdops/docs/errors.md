# OsterdOps Error Code Reference

This document catalogs standard error codes returned by the OsterdOps API and Gateway.

---

## Error Response Envelope

All API errors return standard envelopes:

```json
{
  "success": false,
  "error": {
    "code": "BUDGET_EXCEEDED",
    "message": "Monthly budget spend cap reached. Request blocked under HARD enforcement.",
    "details": {
      "budgetId": "bud_99a81",
      "limitUsd": 1000.0,
      "currentSpendUsd": 1002.5
    }
  }
}
```

---

## Error Catalog

| Error Code | HTTP Status | Meaning | Retryable | Recommended Action |
|---|---|---|---|---|
| `BUDGET_EXCEEDED` | 429 | Hard budget spend ceiling reached. | No | Increase budget limit in dashboard or wait for billing cycle reset. |
| `RATE_LIMITED` | 429 | Sliding window request rate limit exceeded (120 req/min). | Yes | Honor `retry-after` header and apply exponential backoff. |
| `AUTHENTICATION_FAILED` | 401 | Invalid, expired, or missing OsterdOps API key. | No | Reissue or verify API key in Developer Portal. |
| `AUTHORIZATION_FAILED` | 403 | Insufficient RBAC permissions to execute action. | No | Request role elevation from an organization OWNER. |
| `VALIDATION_ERROR` | 400 | Request body or parameters failed schema validation. | No | Check payload against OpenAPI schema / documentation. |
| `NOT_FOUND` | 404 | Target resource does not exist or was deleted. | No | Verify resource ID in path parameter. |
| `CONFLICT` | 409 | Resource identifier or slug already exists. | No | Supply a unique slug or project name. |
| `INVALID_CREDENTIALS` | 401 | Upstream provider rejected stored API credentials. | No | Update provider connection key in Settings -> Integrations. |
| `PROVIDER_RATE_LIMITED` | 429 | Upstream provider TPM/RPM quota exhausted. | Yes | Retry with jitter or route to fallback model family. |
| `PROVIDER_UNAVAILABLE` | 503 | Upstream provider outage or high capacity load. | Yes | Retry with exponential backoff. |
| `MODEL_NOT_FOUND` | 404 | Model not found on upstream provider. | No | Verify model string in Provider documentation. |
| `TIMEOUT` | 504 | Upstream provider request exceeded server deadline. | Yes | Reduce max_tokens or retry request. |
| `PROVIDER_ERROR` | 502 | General upstream provider communication failure. | Yes | Inspect provider status page and request telemetry. |
| `INTERNAL_SERVER_ERROR` | 500 | Uncaught server exception. | Yes | Retry request; if issue persists, check diagnostics. |
