# OsterdOps — Failure Testing & Chaos Engineering

## 1. Overview
OsterdOps is designed with defensive fault-tolerance principles to ensure that system failures are gracefully contained, error responses are standardized, and security boundaries remain uncompromised even during extreme infrastructure stress.

---

## 2. Failure Path Categories

### 2.1 AI Gateway Error Normalization
The gateway normalizes all upstream and internal errors into a standard format:

| Failure Cause | Upstream / Internal Code | Normalized HTTP Status | OsterdOps Error Code |
|---|---|---|---|
| Missing Auth Header | `MISSING_BEARER_TOKEN` | `401 Unauthorized` | `UNAUTHORIZED` |
| Invalid API Key Secret | `INVALID_KEY_HASH` | `401 Unauthorized` | `INVALID_API_KEY` |
| Revoked / Expired Key | `KEY_REVOKED` / `KEY_EXPIRED` | `401 Unauthorized` | `API_KEY_REVOKED` |
| Missing Required Model | `MISSING_MODEL_PARAM` | `400 Bad Request` | `INVALID_REQUEST` |
| Unsupported Model | `UNKNOWN_MODEL_NAME` | `404 Not Found` | `MODEL_NOT_FOUND` |
| Project Archival | `PROJECT_ARCHIVED` | `403 Forbidden` | `PROJECT_SUSPENDED` |
| Hard Budget Limit Reached | `HARD_BUDGET_EXCEEDED` | `403 Forbidden` | `BUDGET_EXCEEDED` |
| Tenant Rate Limit Exceeded | `SLIDING_WINDOW_EXCEEDED`| `429 Too Many Requests`| `RATE_LIMIT_EXCEEDED` |
| Upstream Rate Limit | `PROVIDER_429` | `429 Too Many Requests`| `PROVIDER_RATE_LIMITED`|
| Upstream Server Error | `PROVIDER_500` / `502` / `503` | `503 Service Unavailable` | `PROVIDER_UNAVAILABLE` |
| Upstream Timeout | `REQUEST_TIMEOUT` | `504 Gateway Timeout` | `TIMEOUT` |

---

## 3. Chaos & Fault Injection Testing

### 3.1 Distributed Concurrency & TOCTOU Prevention
- **Test File**: `tests/e2e/phase26-concurrency-failure-injection.e2e.test.ts`
- **Scenario**: 10 parallel requests attempt $2 spend simultaneously against a budget with only $5 remaining.
- **Enforcement**: Atomic spend reservation ensures exactly 2 requests are admitted ($4 spend total) and 8 are rejected, guaranteeing total spend never exceeds the configured ceiling.

### 3.2 Non-Critical Dependency Fault Tolerance
- **Scenario**: Observability metrics emission fails (e.g. Prometheus endpoint unreachable) or webhook notification service errors (HTTP 500).
- **Enforcement**: Non-critical background task failures are safely caught, logged, and isolated. Critical user gateway requests complete successfully without being aborted.

### 3.3 Upstream Redis Outage & In-Memory Fallback
- **Scenario**: Redis connection drops during high-traffic load.
- **Enforcement**: The rate limiter and job queue switch transparently to local in-memory fallback stores, maintaining service availability while emitting warning telemetry.
