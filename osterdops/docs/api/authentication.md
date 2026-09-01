# API Authentication & Request Correlation

Base URL: `https://api.osterdops.com`

---

## 1. Authentication Schemes

### Project API Keys (Server-to-Server)

Used by the `@osterdops/sdk`, backend daemons, and AI Gateway proxies.

```http
Authorization: Bearer osk_live_example_94f2a188c9f4d1e204b78912
```

Alternatively:

```http
x-api-key: osk_live_example_94f2a188c9f4d1e204b78912
```

### User Session Tokens (Dashboard & Management)

Used by browser clients and dashboard interfaces via Firebase JWT credentials:

```http
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6...
```

---

## 2. Request Correlation (`x-osterdops-request-id`)

Every API request accepts an optional correlation identifier. If omitted, OsterdOps automatically generates a UUIDv4-style `req_...` ID returned in response headers and error envelopes.

```http
GET /api/v1/projects HTTP/1.1
Host: api.osterdops.com
Authorization: Bearer osk_live_example_...
x-osterdops-request-id: req_checkout_proc_9981
```

Response:

```http
HTTP/1.1 200 OK
x-osterdops-request-id: req_checkout_proc_9981
x-api-version: v1
```
