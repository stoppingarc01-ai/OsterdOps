# Rate Limits & Entitlements

OsterdOps applies multi-tiered rate limits and plan-based entitlements to protect service stability and ensure fair multi-tenant allocation.

---

## 1. Rate Limit Tiers by Subscription Plan

| Plan | Included Requests / Month | Included Tokens / Month | Gateway Rate Limit (RPM) |
|---|---|---|---|
| **Free** | 1,000 | 100,000 | 60 RPM |
| **Pro** | 50,000 | 5,000,000 | 300 RPM |
| **Business** | 250,000 | 25,000,000 | 1,200 RPM |
| **Enterprise** | 2,000,000+ | 200,000,000+ | 6,000 RPM |

---

## 2. Rate Limit Response (HTTP 429)

When rate limits are exceeded, OsterdOps returns HTTP 429 with standard headers:

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 5
x-osterdops-request-id: req_1788022596_rl

{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded. Please apply exponential backoff.",
    "retryAfterSeconds": 5
  }
}
```

---

## 3. Plan Entitlements (`ENTITLEMENT_EXCEEDED`)

If an action exceeds plan capabilities (e.g. attempting to create a 3rd project on the Free plan, which allows 2), OsterdOps returns:

```json
{
  "success": false,
  "error": {
    "code": "ENTITLEMENT_EXCEEDED",
    "message": "Plan limit reached for active projects (2 / 2). Please upgrade subscription to Pro.",
    "details": {
      "currentPlan": "FREE",
      "limit": 2,
      "feature": "maxProjects"
    }
  }
}
```
