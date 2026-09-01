# OsterdOps Usage & Token Tracking — Architecture & Documentation

The **OsterdOps Usage & Token Tracking System** records structured, provider-independent token usage metrics for every request processed through the AI Gateway. This data serves as the foundation for downstream systems: **Cost Engine (Phase 9)**, **Budgets & Alerts (Phase 10)**, **Analytics (Phase 11)**, and **Optimization Heuristics (Phase 12)**.

---

## 1. UsageRecord Schema

Every completed or failed gateway request generates a durable `UsageRecord` in Firestore:

```typescript
export type UsageRequestStatus = "SUCCESS" | "ERROR" | "TIMEOUT" | "RATE_LIMITED";

export interface UsageRecord {
  id: string;             // Document ID (matches requestId for idempotency)
  requestId: string;      // Correlation request ID (e.g. "gw_1724918291_a9f2b")
  organizationId: string; // Multi-tenant organization partition
  projectId: string;      // Scoped project ID
  apiKeyId: string;       // OsterdOps API key ID used for authentication
  provider: string;       // AI provider ("openai", "anthropic", "gemini", "azure", "bedrock")
  model: string;          // Model identifier ("gpt-4o", "claude-3-5-sonnet", etc.)
  inputTokens: number;    // Number of prompt/input tokens
  outputTokens: number;   // Number of completion/output tokens
  totalTokens: number;    // Total tokens consumed
  cachedTokens?: number;  // Cached prompt tokens (if supported by provider)
  reasoningTokens?: number; // Reasoning tokens (if supported by provider)
  latencyMs: number;      // End-to-end execution latency in milliseconds
  statusCode: number;     // HTTP status code (200, 429, 500, 504, etc.)
  status: UsageRequestStatus; // Normalized status enum
  errorCode?: string;     // Error code if request failed
  timestamp: string;      // ISO 8601 creation timestamp
  datePartition: string;  // Daily partition string ("YYYY-MM-DD")
}
```

---

## 2. Firestore Multi-Tenant Storage Structure

Usage records are organized in Firestore hierarchically under the organization document:

```
organizations/
  └── {organizationId}/
        └── usage/
              └── {requestId}  <── Keyed by requestId (UsageRecord document)
```

### Atomic Counter Aggregations
When recording usage, project counters are atomically incremented in Firestore batches:
- `organizations/{orgId}/projects/{projectId}.totalRequests` += 1
- `organizations/{orgId}/projects/{projectId}.totalTokens` += `totalTokens`

---

## 3. Provider Token Normalization

Each AI provider exposes usage metrics in distinct payload formats. OsterdOps normalizes all vendor responses:

| Provider | Prompt Tokens Field | Completion Tokens Field | Cached Tokens Field | Reasoning Tokens Field |
| :--- | :--- | :--- | :--- | :--- |
| **OpenAI** | `usage.prompt_tokens` | `usage.completion_tokens` | `usage.prompt_tokens_details.cached_tokens` | `usage.completion_tokens_details.reasoning_tokens` |
| **Anthropic** | `usage.input_tokens` | `usage.output_tokens` | `usage.cache_read_input_tokens` | `null` |
| **Google Gemini** | `usageMetadata.promptTokenCount` | `usageMetadata.candidatesTokenCount` | `usageMetadata.cachedContentTokenCount` | `null` |
| **Azure OpenAI** | `usage.prompt_tokens` | `usage.completion_tokens` | `usage.prompt_tokens_details.cached_tokens` | `usage.completion_tokens_details.reasoning_tokens` |
| **AWS Bedrock** | `inputTextTokenCount` / `input_tokens` | `results[0].tokenCount` / `output_tokens` | `null` | `null` |

### Zero Token Invention Policy
- If a provider does not supply token metrics for a request, tokens are represented as `0` or `null`.
- Token counts are never fabricated or estimated in the baseline usage record.

---

## 4. Write Strategy & Idempotency

### Non-Blocking Gateway Execution
1. The gateway executes upstream requests and formats the client response immediately.
2. `recordGatewayUsage()` is dispatched asynchronously without blocking the client HTTP response stream.

### Idempotency Guarantee
- The Firestore document ID is deterministically set to `requestId` (`doc(requestId).set(payload, { merge: true })`).
- If a client retries the same `requestId`, the existing record is safely merged rather than duplicating token accounting.

---

## 5. Usage Queries & REST API Endpoints

### 1. Organization Usage Endpoint
```http
GET /api/v1/usage?organizationId={orgId}&startDate=2026-08-01&endDate=2026-08-31&limit=50
```

### 2. Project Usage Endpoint
```http
GET /api/v1/projects/{projectId}/usage?organizationId={orgId}&provider=openai
```

### 3. Aggregated Summary
Append `?aggregate=true` to retrieve grouped statistics:
```http
GET /api/v1/usage?organizationId={orgId}&aggregate=true
```

#### Example Aggregation Response:
```json
{
  "success": true,
  "data": {
    "totalRequests": 1420,
    "totalInputTokens": 450000,
    "totalOutputTokens": 180000,
    "totalTokens": 630000,
    "totalCachedTokens": 85000,
    "totalReasoningTokens": 12000,
    "byProvider": {
      "openai": { "requests": 800, "inputTokens": 250000, "outputTokens": 100000, "totalTokens": 350000, "cachedTokens": 50000, "reasoningTokens": 12000 },
      "anthropic": { "requests": 620, "inputTokens": 200000, "outputTokens": 80000, "totalTokens": 280000, "cachedTokens": 35000, "reasoningTokens": 0 }
    },
    "byModel": {
      "gpt-4o-mini": { "requests": 800, "inputTokens": 250000, "outputTokens": 100000, "totalTokens": 350000, "cachedTokens": 50000, "reasoningTokens": 12000 },
      "claude-3-5-sonnet": { "requests": 620, "inputTokens": 200000, "outputTokens": 80000, "totalTokens": 280000, "cachedTokens": 35000, "reasoningTokens": 0 }
    },
    "byProject": {
      "prj_production_app": { "requests": 1420, "inputTokens": 450000, "outputTokens": 180000, "totalTokens": 630000, "cachedTokens": 85000, "reasoningTokens": 12000 }
    },
    "byStatus": {
      "SUCCESS": 1400,
      "RATE_LIMITED": 15,
      "TIMEOUT": 5
    }
  }
}
```

---

## 6. RBAC Permissions

| Role | `usage:read` Permission | Visibility Scope |
| :--- | :--- | :--- |
| **OWNER** | Allowed | Full organization-wide usage and project breakdowns. |
| **ADMIN** | Allowed | Full organization-wide usage and project breakdowns. |
| **DEVELOPER** | Allowed | Organization and project-level usage metadata. |
| **VIEWER** | Allowed | Organization and project-level usage metadata. |

---

## 7. Privacy & Security Guarantees

1. **Zero Prompt/Completion Storage**: Usage records contain numerical token quantities and execution metadata only. Prompts, system instructions, and completion strings are never written to Firestore.
2. **Zero Secret Persistence**: Raw OsterdOps API keys and upstream vendor credentials are never stored in usage documents.
3. **Multi-Tenant Isolation**: All queries enforce `organizationId` boundaries. Cross-tenant access returns `403 Forbidden` or `404 Not Found`.

---

## 8. Future Event Pipeline & Retention Roadmap

- **Event-Driven Streaming**: In multi-region high-throughput environments, the `UsageRecorder` interface can be backed by a message queue (Kafka / AWS SQS / Google Cloud Pub/Sub) for decoupled background persistence.
- **Retention Policies**: Daily partitioning (`datePartition: "YYYY-MM-DD"`) allows scheduled Time-to-Live (TTL) deletion or archival to object storage (BigQuery / S3 / Cloud Storage).
