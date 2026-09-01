# OsterdOps Analytics, Observability & Metrics Engine — Architecture & Documentation

The **OsterdOps Analytics & Observability Engine** converts raw telemetry from Phase 8 (`UsageRecord`) and Phase 9 (`CostRecord`) into multi-dimensional operational metrics, latency percentiles ($p50/p90/p95/p99$), prompt cache efficiency statistics, error distributions, and chronological time series.

---

## 1. Primary Analytics Pipeline

```
Customer AI Request
       ↓
UsageRecord (Phase 8 - Normalized Tokens & Latency)
       ↓
CostRecord (Phase 9 - High-Precision USD Arithmetic)
       ↓
Analytics Service Aggregation (Bounded Time Windows)
       ↓
┌─────────────────────────────────────────────────────────────┐
│ • Key Performance Indicators (Spend, Requests, Tokens)       │
│ • Latency Percentiles (p50, p90, p95, p99, min, max, avg)   │
│ • Prompt Cache Hit Rate & Dollar Savings                     │
│ • Error Rate Distributions & HTTP Status Breakdown          │
│ • Multi-Dimensional Slices (Provider, Model, Project, Key)  │
│ • Chronological Daily/Hourly Time-Series Trends             │
└─────────────────────────────────────────────────────────────┘
       ↓
REST API Endpoints (/api/v1/analytics/*) & Dashboard UI
```

---

## 2. Key Performance Indicators (KPIs) & Math Formulas

### 1. Latency Percentiles ($p50, p90, p95, p99$)
Using nearest-rank percentile algorithm over sorted execution latency samples:
$$\text{Rank}(p) = \min(\lfloor p \times N \rfloor, N - 1)$$
where $p \in \{0.50, 0.90, 0.95, 0.99\}$ and $N$ is the sample size.

### 2. Success & Error Rates
$$\text{SuccessRate} = \left( \frac{\text{SuccessRequests}}{\text{TotalRequests}} \right) \times 100$$
$$\text{ErrorRate} = \left( \frac{\text{ErrorRequests}}{\text{TotalRequests}} \right) \times 100$$

### 3. Prompt Cache Hit Rate & Dollar Savings
$$\text{CacheHitRate} = \left( \frac{\text{TotalCachedTokens}}{\text{TotalInputTokens}} \right) \times 100$$
$$\text{CacheSavingsUSD} = \sum (\text{CachedTokens} \times (\text{StandardInputPrice} - \text{CachedInputPrice}))$$

---

## 3. Multi-Dimensional Groupings

| Dimension | Aggregated Metrics |
| :--- | :--- |
| **`byProvider`** | Spend USD, requests, token totals (input, output, cached), average latency, error rate, % of total spend. |
| **`byModel`** | Spend USD, requests, token breakdown (input, output, cached, reasoning), latency percentiles ($p50, p90, p95, p99$), error rate, cache hit rate %, cache savings USD, % of total spend. |
| **`byProject`** | Spend USD, requests, total tokens, average latency, error rate, % of total spend. |
| **`byApiKey`** | Spend USD, requests, total tokens, error rate, associated project ID. |
| **`byStatusCode`** | Frequency counts of HTTP status codes (200, 400, 401, 429, 500, 504). |

---

## 4. Chronological Time-Series Structure

```json
{
  "date": "2026-08-29",
  "spendUsd": 142.5084,
  "requests": 15200,
  "tokens": 42500000,
  "inputTokens": 31000000,
  "outputTokens": 11500000,
  "cachedTokens": 8500000,
  "averageLatencyMs": 342,
  "errorCount": 12
}
```

---

## 5. REST API Endpoints

### 1. `GET /api/v1/analytics/overview`
Retrieves comprehensive organization-wide analytics overview, KPIs, dimensional breakdowns, status codes, and time series.
- **Permission**: `usage:read`
- **Query Parameters**:
  - `organizationId` (Required): Organization identifier
  - `projectId` (Optional): Scope to single project
  - `provider` (Optional): Filter by provider (e.g. `openai`, `anthropic`)
  - `model` (Optional): Filter by model (e.g. `gpt-4o`)
  - `apiKeyId` (Optional): Filter by specific API key
  - `timeRange` (Optional): `"24h" | "7d" | "30d" | "90d" | "custom"` (Default: `"30d"`)
  - `startDate` / `endDate` (Optional): Explicit ISO 8601 timestamps when `timeRange="custom"`
  - `limit` (Optional): Maximum usage records to aggregate (Default: `500`, Max: `1000`)

### 2. `GET /api/v1/analytics/latency`
Retrieves latency observability percentiles and distribution breakdown across models and providers.
- **Permission**: `usage:read`
- **Query Parameters**: `organizationId`, `projectId`, `provider`, `model`, `timeRange`, `startDate`, `endDate`

### 3. `GET /api/v1/projects/[projectId]/analytics`
Retrieves project-scoped analytics overview.
- **Permission**: `usage:read`
- **Query Parameters**: `organizationId`, `provider`, `model`, `apiKeyId`, `timeRange`, `startDate`, `endDate`, `limit`

---

## 6. RBAC Permission Matrix

| Role | `usage:read` | Analytics Access |
| :--- | :---: | :---: |
| **OWNER** | Allowed | Full Organization & Project Analytics |
| **ADMIN** | Allowed | Full Organization & Project Analytics |
| **DEVELOPER** | Allowed | Full Organization & Project Analytics |
| **VIEWER** | Allowed | Full Organization & Project Analytics |

---

## 7. Privacy & Security Guarantees

1. **Zero Prompt/Completion Persistence**: Analytics records exclusively track quantitative counters, latencies, status codes, token sums, and USD spend values.
2. **Zero Secret Persistence**: OsterdOps API keys, provider API keys, encryption keys, and sensitive HTTP headers are strictly excluded from all analytics responses.
3. **Multi-Tenant Isolation**: Server-side verification ensures callers only query analytics for organizations where their membership is authenticated.
