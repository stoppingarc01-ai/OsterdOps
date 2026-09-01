# OsterdOps API Authentication

## 1. Authentication Schemes
All requests to OsterdOps protected endpoints must include an API key using one of two methods:

### Method 1: Bearer Token Header (Recommended)
```http
Authorization: Bearer ost_live_948f2a1b7e3c90d5e1f2a3b4c5d6e7f8
```

### Method 2: Custom API Key Header
```http
x-api-key: ost_live_948f2a1b7e3c90d5e1f2a3b4c5d6e7f8
```

---

## 2. API Key Prefixes & Environments
- `ost_live_...`: Production environment keys
- `ost_stg_...`: Staging environment keys
- `ost_test_...`: Development / local testing keys
- `osk_live_...`: Legacy live keys (fully backwards-compatible)

---

## 3. Cryptographic Security & Rotation
- Raw secrets are never stored in the database.
- Hashes are computed using SHA-256 and compared in constant time (`crypto.timingSafeEqual`).
- Rotating a key returns a new secret and invalidates the previous key seamlessly.
