# OsterdOps Enterprise API Documentation

Welcome to the OsterdOps Enterprise API platform documentation. OsterdOps provides deterministic AI cost governance, observability, real-time budget enforcement, and multi-provider gateway routing.

---

## 1. Quick Navigation

- [Authentication](file:///c:/Users/Navee/OneDrive/Documents/Desktop/OsterdOps/osterdops/docs/api/authentication.md) — API keys, JWT sessions, and request correlation.
- [API Versioning](file:///c:/Users/Navee/OneDrive/Documents/Desktop/OsterdOps/osterdops/docs/api/versioning.md) — Version negotiation, headers, and lifecycle policies.
- [Standard Errors](file:///c:/Users/Navee/OneDrive/Documents/Desktop/OsterdOps/osterdops/docs/api/errors.md) — Canonical error envelopes, error codes, and recovery procedures.
- [Pagination](file:///c:/Users/Navee/OneDrive/Documents/Desktop/OsterdOps/osterdops/docs/api/pagination.md) — Cursor-based pagination across collections.
- [Idempotency](file:///c:/Users/Navee/OneDrive/Documents/Desktop/OsterdOps/osterdops/docs/api/idempotency.md) — Safe mutation retries with `Idempotency-Key`.
- [Rate Limits & Entitlements](file:///c:/Users/Navee/OneDrive/Documents/Desktop/OsterdOps/osterdops/docs/api/rate-limits.md) — Tiered quotas, burst rates, and `ENTITLEMENT_EXCEEDED` handling.
- [API Keys & Scopes](file:///c:/Users/Navee/OneDrive/Documents/Desktop/OsterdOps/osterdops/docs/api/api-keys.md) — Cryptographic key issuance, single-reveal secrets, and fine-grained scoping.
- [Webhooks](file:///c:/Users/Navee/OneDrive/Documents/Desktop/OsterdOps/osterdops/docs/api/webhooks.md) — Event contracts, HMAC-SHA256 signatures, and delivery guarantees.
- [TypeScript SDK](file:///c:/Users/Navee/OneDrive/Documents/Desktop/OsterdOps/osterdops/docs/api/sdk.md) — Official `@osterdops/sdk` client library.
- [Code Examples](file:///c:/Users/Navee/OneDrive/Documents/Desktop/OsterdOps/osterdops/docs/api/examples.md) — End-to-end integration patterns.

---

## 2. API Discovery

You can query platform capabilities and metadata dynamically:

```http
GET /api/v1/system/api HTTP/1.1
Host: api.osterdops.com
```

Response:

```json
{
  "success": true,
  "data": {
    "version": "v1",
    "supportedVersions": ["v1"],
    "deprecatedVersions": [],
    "openapi": {
      "version": "3.1.0",
      "specUrl": "/docs/openapi.yaml"
    },
    "capabilities": {
      "aiGateway": { "chatCompletions": true, "deterministicCostTracking": true },
      "idempotency": { "header": "Idempotency-Key", "ttlSeconds": 86400 },
      "pagination": { "type": "cursor", "defaultLimit": 20, "maxLimit": 100 },
      "webhooks": { "signatureScheme": "HMAC-SHA256", "toleranceSeconds": 300 }
    }
  }
}
```
