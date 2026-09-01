# OsterdOps AI Gateway Architecture

## 1. Request Lifecycle Flow

The OsterdOps AI Gateway orchestrates every client chat completion request through a 14-stage security, governance, and telemetry pipeline:

```
Client Request
  ↓
1. Correlation ID Resolution (x-osterdops-request-id)
  ↓
2. API Key Authentication (OsterdOps Project API Key)
  ↓
3. RBAC Scope Verification
  ↓
4. Sliding Window Rate Limiting (120 req/min per key)
  ↓
5. Hard Budget Pre-Flight Enforcement (HTTP 429 if limit reached)
  ↓
6. Request Validation & Model Capability Check
  ↓
7. Provider Credential Resolution (AES-256-GCM / Server Env)
  ↓
8. Real Upstream Provider Request (with Retries & Deadlines)
  ↓
9. Response Normalization / SSE Stream Transformation
  ↓
10. Usage Token Extraction (Input, Output, Cached, Reasoning)
  ↓
11. Real-Time Cost Calculation (Authoritative Cost Engine)
  ↓
12. Non-blocking Structured Telemetry & Audit Logging
  ↓
13. Durable Usage Recording (organizations/{orgId}/usage/{reqId})
  ↓
14. Client Response Returned (with Telemetry Headers)
```

---

## 2. Telemetry Headers

Every non-streaming response returns standardized performance and cost headers:

| Header | Description | Example |
|---|---|---|
| `x-osterdops-request-id` | Unique correlation ID | `gw_1788188500000_abc123` |
| `x-osterdops-latency-ms` | Upstream provider round-trip time | `428` |
| `x-osterdops-cost-usd` | Computed request cost in USD | `0.00012500` |
| `x-osterdops-input-tokens` | Prompt tokens | `150` |
| `x-osterdops-output-tokens` | Completion tokens | `45` |
| `x-osterdops-total-tokens` | Total tokens billed | `195` |
| `x-osterdops-cache-savings-usd` | Cost savings from prompt cache | `0.00003750` |

---

## 3. Public API Endpoints

- `POST /api/v1/gateway/chat/completions`: Full AI Gateway chat endpoint with CORS and multi-tenant scoping.
- `POST /api/v1/chat/completions`: OpenAI-compatible alias endpoint.
