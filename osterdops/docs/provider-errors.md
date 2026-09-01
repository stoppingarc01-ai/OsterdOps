# OsterdOps Canonical Gateway Error Codes & Mapping

## 1. Canonical Error Codes

The OsterdOps AI Gateway normalizes vendor-specific exceptions and HTTP status codes into structured, safe canonical errors:

| Canonical Error Code | HTTP Status | Retryable | Description |
|---|---|---|---|
| `UNAUTHORIZED` | 401 | ❌ No | Missing or invalid OsterdOps API key. |
| `FORBIDDEN` | 403 | ❌ No | RBAC permission denied or key scope violation. |
| `RATE_LIMITED` | 429 | ✅ Yes | OsterdOps client rate limit exceeded. |
| `BUDGET_EXCEEDED` | 429 | ❌ No | Hard monthly budget limit reached. |
| `BAD_REQUEST` | 400 | ❌ No | Invalid request JSON or unsupported parameter. |
| `PROVIDER_AUTHENTICATION_FAILED` | 401 | ❌ No | Upstream vendor key is invalid or revoked. |
| `PROVIDER_MODEL_NOT_FOUND` | 404 | ❌ No | Upstream vendor does not support requested model. |
| `PROVIDER_BAD_REQUEST` | 400 | ❌ No | Vendor rejected prompt parameters. |
| `PROVIDER_RATE_LIMITED` | 429 | ✅ Yes | Upstream vendor rate limit reached. |
| `PROVIDER_TIMEOUT` | 504 | ✅ Yes | Upstream provider timed out after request deadline. |
| `PROVIDER_UNAVAILABLE` | 503 | ✅ Yes | Upstream provider outage or service degradation. |
| `PROVIDER_INTERNAL_ERROR` | 502 | ✅ Yes | Unexpected vendor HTTP 5xx response. |
| `PROVIDER_STREAM_ERROR` | 500 | ✅ Yes | Upstream SSE stream disconnected mid-transmission. |

---

## 2. Redaction Guarantees

All error responses pass through `redactSensitiveData()` to guarantee that raw vendor API keys, OAuth tokens, and Authorization headers are never returned to clients or logged.
