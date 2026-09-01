# OsterdOps API Key Security & Management Guide

## 1. Security Architecture

1. **Entropy & Prefix**:
   - Production keys: `osk_live_<32_random_bytes_hex>`
   - Development keys: `osk_test_<32_random_bytes_hex>`
2. **One-Way Storage**:
   - OsterdOps stores ONLY the cryptographic `SHA-256` hash (`keyHash`).
   - Plaintext secrets are never stored in databases, logs, or caches.
3. **Single-Reveal Policy**:
   - The raw secret is returned ONLY in the HTTP response of `POST /api/v1/api-keys` or `POST /api/v1/api-keys/[keyId]/rotate`.
4. **Timing-Safe Verification**:
   - Authenticated gateway requests compute `crypto.timingSafeEqual` between the stored SHA-256 hash and the incoming token's hash.

---

## 2. API Key Endpoints

- `GET /api/v1/api-keys`: Lists masked organization keys. Requires `keys:read`.
- `POST /api/v1/api-keys`: Creates new key. Requires `keys:manage` (ADMIN/OWNER).
- `POST /api/v1/api-keys/[keyId]/rotate`: Rotates secret without altering permissions.
- `POST /api/v1/api-keys/[keyId]/revoke`: Revokes key immediately.
