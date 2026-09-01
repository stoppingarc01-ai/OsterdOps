# OsterdOps API Error Catalog & Troubleshooting

## 1. Standard Error Envelope
All error responses adhere to the standard OsterdOps error structure:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_API_KEY",
    "message": "The supplied API key is invalid or has expired.",
    "status": 401,
    "requestId": "req_1788191200_abc"
  }
}
```

---

## 2. Canonical Error Code Reference

| Code | HTTP Status | Retryable | Description | Remediation |
|---|---|---|---|---|
| `INVALID_API_KEY` | 401 | No | Token missing, invalid, or expired. | Check header formatting or generate a new key. |
| `FORBIDDEN` | 403 | No | Role lacks required action permission. | Request role upgrade (`DEVELOPER` or `ADMIN`) from Owner. |
| `NOT_FOUND` | 404 | No | Target project or resource does not exist. | Verify resource ID in URL path. |
| `PAYLOAD_TOO_LARGE` | 413 | No | Request body exceeds 4MB limit. | Truncate long prompt text or message history. |
| `RATE_LIMIT_EXCEEDED`| 429 | Yes | Sliding-window RPM limit breached. | Back off according to `x-ratelimit-reset` header. |
| `BUDGET_EXCEEDED` | 429 | No | Hard monthly spend ceiling reached. | Increase project spend cap in Budgets dashboard. |
| `UPSTREAM_PROVIDER_ERROR` | 502 | Yes | Provider (OpenAI/Anthropic/Gemini) 5xx. | Transient error; automatic retries will be attempted. |
| `GATEWAY_TIMEOUT` | 504 | Yes | Upstream inference timed out. | Check upstream provider status or reduce `max_tokens`. |
