# OsterdOps — In-Memory Caching Architecture & Invalidation Policy

## Overview
This document specifies the design, TTL parameters, capacity bounds, and invalidation semantics of the OsterdOps in-memory caching tier (`src/lib/cache/`).

---

## 1. Cache Engine Architecture (`BoundedLruCache<V>`)

The caching engine implements a type-safe, generic Least-Recently-Used (LRU) bounded cache with the following properties:
- **Map-Based O(1) Operations:** Uses JavaScript `Map` key iteration order for true O(1) eviction without double-linked-list overhead.
- **TTL Expiration:** Each entry tracks an individual `expiresAt` timestamp and is evaluated on access (`get()`).
- **Telemetry & Stats:** Tracks cumulative `hits`, `misses`, `evictions`, and current `size`.
- **Prefix Invalidation:** Allows fast bulk invalidation of tenant sub-keys via `invalidatePrefix()`.

---

## 2. Configured Cache Pools (`cacheRegistry`)

| Cache Pool | Max Size | Default TTL | Key Structure | Invalidation Triggers |
| :--- | :--- | :--- | :--- | :--- |
| **`apiKeyAuth`** | 5,000 | 30 seconds | `hash:${keyHash}` | API key revocation, API key rotation, organization suspension |
| **`budgetPreflight`** | 2,000 | 10s (allowed)<br>5s (blocked) | `${orgId}:${projectId \|\| "org"}` | Budget creation, budget update, budget pause/resume, budget deletion, spend event threshold triggers |
| **`providerCredentials`** | 1,000 | 60 seconds | `${orgId}:${provider}:${projectId \|\| "org"}` | Provider key rotation, connection deletion |
| **`openApiSpec`** | 10 | 300 seconds | `spec:openapi:3.1.0` | Server reboot or spec version bump |

---

## 3. Invalidation Semantics

### Deterministic Active Invalidation
Whenever any state mutation occurs (such as revoking an API key or pausing a budget), the system calls explicit invalidators:
- `invalidateApiKeyCache(keyHash: string)`: Flushes the key's auth entry instantly.
- `invalidateBudgetPreflightCache(orgId: string, projectId?: string)`: Flushes all matching budget preflight checks for the tenant.
- `invalidateProviderCredentialsCache(orgId: string, provider: string)`: Flushes cached provider credentials on rotation.

### Passive Eviction
- **TTL Expiry:** Read requests evaluate `Date.now() > entry.expiresAt` and discard expired entries on demand.
- **Capacity Overflow:** When `size >= maxSize`, the least recently accessed key is evicted.
