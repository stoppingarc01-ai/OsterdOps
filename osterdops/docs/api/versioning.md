# API Versioning & Lifecycle Policy

OsterdOps uses deterministic path-based and header-based API versioning to ensure backward compatibility as platform capabilities evolve.

---

## 1. Version Resolution

The active API version is resolved using the following order of precedence:

1. **Header**: `x-api-version` or `Accept-Version` (e.g. `v1`)
2. **URL Path**: `/api/v1/...`
3. **Default**: Latest stable release (`v1`)

---

## 2. Response Headers

Every API response returns the version identifier:

```http
x-api-version: v1
```

If an API version is scheduled for deprecation, the response includes RFC 8594 deprecation headers:

```http
Deprecation: @1788022596
Sunset: Sat, 29 Aug 2026 23:59:59 GMT
Link: <https://docs.osterdops.com/api/v1>; rel="deprecation"
```
