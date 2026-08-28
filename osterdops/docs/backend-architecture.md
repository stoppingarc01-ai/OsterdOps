# OsterdOps — Backend Architecture & System Design

## 1. Executive Summary

OsterdOps is an enterprise-grade AI Cost Governance & Operations Platform. It serves as an intelligent proxy gateway and control plane sitting between customer applications and upstream Large Language Model (LLM) providers (OpenAI, Anthropic, Google Gemini, Azure OpenAI, AWS Bedrock).

OsterdOps provides:
- Real-time token and latency tracking
- Dynamic cost calculation and attribution by project, organization, team, and API key
- Proactive budget enforcement (soft alerts and hard limit rate-limiting)
- Anomaly detection and cost optimization recommendations
- Centralized policy enforcement (model access restrictions, guardrails)
- Tamper-evident audit logging for enterprise governance

---

## 2. Request Lifecycle & Gateway Data Flow

```
+-----------------------------------------------------------------------------------+
|                              Customer Application                                  |
+-----------------------------------------------------------------------------------+
                                        |
                   HTTPS POST /api/v1/chat/completions
                   Authorization: Bearer osk_live_...
                                        v
+-----------------------------------------------------------------------------------+
|                              OsterdOps Edge/API                                   |
|                                                                                   |
|  1. Request Ingestion & Header Sanitization                                       |
|  2. Rate Limiting (In-Memory / Token Bucket)                                      |
|  3. API Key Hash Verification (SHA-256 vs Firestore cached metadata)             |
|     -> Resolves: organizationId, projectId, keyScope, keyStatus                    |
|  4. Project & Organization Status Check (Active / Suspended)                      |
|  5. Policy & Budget Pre-Flight Enforcement (Hard limit reached? -> HTTP 429)      |
|  6. Model & Provider Resolution (Adapter Selection: OpenAI, Anthropic, Gemini)    |
|  7. Request Transformation (Provider-specific payload normalization)             |
+-----------------------------------------------------------------------------------+
                                        |
                        Forward to Upstream LLM Provider
                                        v
+-----------------------------------------------------------------------------------+
|                        AI Provider (e.g., OpenAI / Anthropic)                     |
+-----------------------------------------------------------------------------------+
                                        |
                          Upstream Stream / Response
                                        v
+-----------------------------------------------------------------------------------+
|                         OsterdOps Response Interceptor                            |
|                                                                                   |
|  8. Extract Usage Tokens (Prompt / Completion / Reasoning Tokens)                 |
|  9. Compute Real-time Cost via Centralized Pricing Registry                       |
| 10. Compute Latency (TTFT & total response duration)                              |
| 11. Async Non-Blocking Telemetry Write:                                           |
|     - Usage Record (`organizations/{orgId}/usage/{id}`)                           |
|     - Aggregated Spend Increment (Atomic counter on Project & Org)                |
| 12. Evaluate Post-Request Budget Thresholds & Trigger Async Alerts (50-100%)      |
| 13. Return Normalized Response to Client (with x-osterdops-* metadata headers)    |
+-----------------------------------------------------------------------------------+
```

---

## 3. Authentication & Authorization Architecture

### 3.1 Dual-Auth Strategy
OsterdOps supports two distinct authentication pathways:

1. **Dashboard & Management API (Human Users)**:
   - **Protocol**: Firebase Authentication (ID Tokens / Session Cookies).
   - **Header**: `Authorization: Bearer <Firebase_ID_Token>` or HTTP-only Session Cookie.
   - **Verification**: Verified server-side via `firebase-admin/auth`.
   - **Resolution**: ID Token `sub` -> User record -> Organization Membership lookup.

2. **AI Proxy Gateway (Machine-to-Machine / Customer Apps)**:
   - **Protocol**: OsterdOps Project API Key (`osk_live_...` or `osk_test_...`).
   - **Header**: `Authorization: Bearer osk_live_...` or `x-api-key: osk_live_...`.
   - **Verification**: Key prefix extracted for index lookup, full key hashed with SHA-256 and matched in constant time against stored hash.
   - **Resolution**: Project and Organization context resolved directly from validated key document.

### 3.2 Role-Based Access Control (RBAC)
Every user belongs to an Organization via an explicit Membership record with one of four hierarchical roles:

| Role | Permissions & Scope |
| :--- | :--- |
| **`OWNER`** | Full authority: billing, organization deletion, member removal, security settings, all admin capabilities. |
| **`ADMIN`** | Project management, member invitation, provider connection configuration, budget creation, alert channel setup. |
| **`DEVELOPER`** | Project access, API key creation/revocation within assigned projects, viewing telemetry and logs. |
| **`VIEWER`** | Read-only access to dashboard charts, spend analytics, and reports. |

### 3.3 Server-Side Authorization Helpers
Authorization is strictly enforced in Route Handlers and Server Actions using modular guards:
- `requireAuth(request)`: Validates Firebase ID token and returns authenticated user context.
- `requireOrgMember(userId, orgId, minimumRole)`: Validates organization membership and role level.
- `requireProjectAccess(userId, orgId, projectId, minimumRole)`: Verifies project-level permissions.
- `requireApiKey(request)`: Validates gateway API keys for routing requests.

---

## 4. Provider Adapter Architecture

To prevent gateway duplication across multiple AI vendors, OsterdOps uses the **Provider Adapter Pattern**:

```typescript
export interface AIProviderAdapter {
  readonly provider: ProviderId; // 'openai' | 'anthropic' | 'gemini' | 'azure' | 'bedrock'
  
  // Transform standard OsterdOps request into provider-specific format
  formatRequest(request: GatewayChatRequest, config: ProviderConnectionConfig): ProviderPayload;
  
  // Forward request to provider upstream endpoint
  executeRequest(payload: ProviderPayload, credentials: ProviderCredentials): Promise<Response>;
  
  // Extract token counts from response headers/body
  extractUsage(rawResponse: any): UsageTokenBreakdown;
  
  // Normalize provider response or stream chunks to OpenAI-compatible format
  normalizeResponse(rawResponse: any): GatewayChatResponse;
  
  // Classify provider errors (rate limit, invalid key, context length exceeded, downtime)
  handleProviderError(error: unknown): NormalizedGatewayError;
}
```

---

## 5. Cost Calculation & Pricing Registry

The Cost Engine operates independently of provider gateways:

```
[Provider, Model, InputTokens, OutputTokens, CachedTokens, ReasoningTokens]
                                   │
                                   ▼
                       [Centralized Pricing Registry]
                                   │
             ┌─────────────────────┼─────────────────────┐
             ▼                     ▼                     ▼
      [Input Cost]          [Output Cost]         [Cached Discount]
             └─────────────────────┬─────────────────────┘
                                   │
                                   ▼
                           [Total Cost (USD)]
```

- **Separation of Concerns**: Pricing tables are versioned configuration objects decoupled from gateway routing logic.
- **Precision**: Monetary calculations use high-precision floating point numbers rounded to 8 decimal places for micro-cent precision.
- **Cost Classification**:
  - `calculated`: Computed from verified token counts and official model pricing matrices.
  - `provider-reported`: Taken directly from provider response headers (when supported).
  - `estimated`: Estimated using baseline heuristics if upstream response omitted usage details.

---

## 6. Budget & Governance Engine

### 6.1 Hierarchy
- **Organization Budget**: Global ceiling across all projects and teams.
- **Project Budget**: Dedicated allocation for specific microservices or departments.

### 6.2 Thresholds & Evaluation
Budgets are evaluated on every aggregated spend cycle against predefined thresholds:
- **50%**: Normal usage milestone.
- **75%**: Early warning.
- **90%**: Critical threshold (notifies engineering leads).
- **100% (Hard Limit)**: Automatically halts routing requests for that project, returning `429 Too Many Requests` (`code: BUDGET_EXCEEDED`).

---

## 7. Security & Secret Management

1. **Zero Secret Exposure**: Provider API keys (OpenAI keys, Anthropic keys) are stored encrypted in Firestore using AES-256-GCM. Decryption happens exclusively in server-side memory during upstream dispatch.
2. **API Key Token Safety**: Customer project API keys are generated as 32-byte cryptographically secure random strings (`osk_live_...`). Plaintext keys are displayed once upon creation and never stored. Only SHA-256 hashes and 4-character suffix masks are retained.
3. **Log Sanitization**: Structured server logging filters and redacts `Authorization`, `x-api-key`, `cookie`, `set-cookie`, and sensitive body payloads.
4. **Environment Isolation**: Server-only credentials (`FIREBASE_ADMIN_*`, `ENCRYPTION_KEY`) are kept isolated and are never bundled into client JavaScript.

---

## 8. Error Handling & API Envelope

All OsterdOps APIs adhere to a standard JSON envelope:

```typescript
// Success
{
  "success": true,
  "data": { ... },
  "meta": { "requestId": "req_01j7...", "latencyMs": 42 }
}

// Failure
{
  "success": false,
  "error": {
    "code": "INVALID_API_KEY" | "UNAUTHORIZED" | "BUDGET_EXCEEDED" | "RATE_LIMITED" | "PROVIDER_ERROR" | "INTERNAL_ERROR",
    "message": "Human readable explanation",
    "details": { ... }
  }
}
```

HTTP Status Codes:
- `400`: Invalid Request / Validation Error
- `401`: Unauthenticated / Invalid API Key
- `403`: Forbidden / Insufficient Organization Role
- `404`: Resource Not Found
- `409`: Resource Conflict (e.g. Duplicate Project Name)
- `429`: Rate Limit Exceeded or Budget Limit Reached
- `502`: Upstream Provider Error
- `500`: Internal Server Error (stack traces suppressed)

---

## 9. Scalability & Extensibility Considerations

1. **Partitioned Writes**: Telemetry writes are partitioned by organization and date (`YYYY-MM-DD`) to avoid Firestore single-document hot-spot limits.
2. **Distributed Counters**: High-volume projects utilize distributed counter shards or atomic increments (`FieldValue.increment`) for real-time spend counters.
3. **Caching Layer**: Project API key metadata and budget ceilings can be cached in-memory with a short TTL (e.g. 60 seconds) to ensure sub-millisecond gateway overhead.
