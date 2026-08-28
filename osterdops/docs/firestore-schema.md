# OsterdOps — Cloud Firestore Schema Specification

## 1. Multi-Tenant Collection Hierarchy

```
users (Root Collection)
  └── {userId}

organizations (Root Collection)
  └── {organizationId}
        ├── members (Subcollection)
        │     └── {userId}
        ├── projects (Subcollection)
        │     └── {projectId}
        │           └── apiKeys (Subcollection)
        │                 └── {keyId}
        ├── providerConnections (Subcollection)
        │     └── {connectionId}
        ├── budgets (Subcollection)
        │     └── {budgetId}
        ├── alerts (Subcollection)
        │     └── {alertId}
        ├── usage (Subcollection)
        │     └── {usageId}
        ├── auditLogs (Subcollection)
        │     └── {logId}
        └── optimizationRecommendations (Subcollection)
              └── {recommendationId}
```

---

## 2. Document Models & Field Specifications

### 2.1 `users` (Root Collection)
Stores global user profile and account preferences.

- **Path**: `users/{userId}`
- **Document ID**: Firebase Auth UID (`user.uid`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Matching Firebase Auth UID |
| `email` | `string` | Yes | Primary user email |
| `displayName` | `string` | Yes | User's full name |
| `photoURL` | `string` | No | Avatar URL |
| `defaultOrgId` | `string` | No | Last active organization ID |
| `createdAt` | `Timestamp` | Yes | Account creation timestamp |
| `updatedAt` | `Timestamp` | Yes | Last update timestamp |

---

### 2.2 `organizations` (Root Collection)
Top-level multi-tenant container for all enterprise resources, billing, and projects.

- **Path**: `organizations/{organizationId}`
- **Document ID**: Auto-generated slug or UUID (e.g. `org_9a8b7c`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Unique Organization identifier |
| `name` | `string` | Yes | Company / Organization display name |
| `slug` | `string` | Yes | URL-friendly unique identifier |
| `ownerId` | `string` | Yes | Firebase UID of the Organization creator/owner |
| `plan` | `enum` | Yes | `'starter' \| 'team' \| 'enterprise'` |
| `status` | `enum` | Yes | `'active' \| 'suspended' \| 'trialing'` |
| `spendLimitUsd` | `number` | No | Optional global spend ceiling |
| `currentPeriodSpendUsd`| `number` | Yes | Current monthly accumulated spend (atomic counter) |
| `currentPeriodStart` | `Timestamp` | Yes | Start of current billing cycle |
| `settings` | `map` | Yes | Organization-wide settings (MFA enforcement, IP whitelist, default models) |
| `createdAt` | `Timestamp` | Yes | Creation timestamp |
| `updatedAt` | `Timestamp` | Yes | Last updated timestamp |

---

### 2.3 `members` (Subcollection)
Associates users with organizations and assigns RBAC permissions.

- **Path**: `organizations/{orgId}/members/{userId}`
- **Document ID**: Target User's Firebase UID

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `userId` | `string` | Yes | Firebase Auth UID |
| `email` | `string` | Yes | Member email |
| `displayName` | `string` | Yes | Member name |
| `role` | `enum` | Yes | `'OWNER' \| 'ADMIN' \| 'DEVELOPER' \| 'VIEWER'` |
| `status` | `enum` | Yes | `'active' \| 'invited' \| 'suspended'` |
| `invitedBy` | `string` | No | UID of user who issued invitation |
| `joinedAt` | `Timestamp` | Yes | Timestamp membership was established |
| `updatedAt` | `Timestamp` | Yes | Last role/status update timestamp |

---

### 2.4 `projects` (Subcollection)
Workspaces or microservice contexts under an organization.

- **Path**: `organizations/{orgId}/projects/{projectId}`
- **Document ID**: Auto-generated project ID (e.g. `prj_abc123`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Unique Project ID |
| `organizationId` | `string` | Yes | Parent Organization ID |
| `name` | `string` | Yes | Project Name (e.g. "Customer Support Bot") |
| `description` | `string` | No | Brief project description |
| `status` | `enum` | Yes | `'active' \| 'archived' \| 'suspended'` |
| `spendLimitMonthly` | `number` | No | Monthly hard spending limit in USD |
| `currentMonthSpend` | `number` | Yes | Current month spend (USD) |
| `totalRequests` | `number` | Yes | Total request counter |
| `totalTokens` | `number` | Yes | Total token consumption counter |
| `createdAt` | `Timestamp` | Yes | Creation timestamp |
| `updatedAt` | `Timestamp` | Yes | Last modified timestamp |

---

### 2.5 `apiKeys` (Subcollection)
Hashed credentials used by client applications to route traffic through the gateway.

- **Path**: `organizations/{orgId}/projects/{projectId}/apiKeys/{keyId}`
- **Document ID**: Auto-generated Key ID (e.g. `key_live_x72...`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Key identifier |
| `organizationId` | `string` | Yes | Parent Organization ID |
| `projectId` | `string` | Yes | Parent Project ID |
| `name` | `string` | Yes | Key description / label |
| `keyPrefix` | `string` | Yes | Key prefix for lookup (e.g. `osk_live_••••94f2`) |
| `keyHash` | `string` | Yes | SHA-256 hash of the full API secret |
| `environment` | `enum` | Yes | `'production' \| 'staging' \| 'development'` |
| `status` | `enum` | Yes | `'active' \| 'revoked' \| 'expired'` |
| `createdBy` | `string` | Yes | UID of user who issued key |
| `createdAt` | `Timestamp` | Yes | Key creation timestamp |
| `lastUsedAt` | `Timestamp` | No | Timestamp of most recent gateway invocation |
| `expiresAt` | `Timestamp` | No | Optional key expiration date |

---

### 2.6 `providerConnections` (Subcollection)
Encrypted upstream AI provider credentials (OpenAI, Anthropic, Gemini).

- **Path**: `organizations/{orgId}/providerConnections/{connectionId}`
- **Document ID**: Auto-generated ID (e.g. `pcon_openai_live`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Connection ID |
| `organizationId` | `string` | Yes | Parent Organization ID |
| `provider` | `enum` | Yes | `'openai' \| 'anthropic' \| 'gemini' \| 'azure' \| 'bedrock'` |
| `name` | `string` | Yes | Connection nickname (e.g. "Primary OpenAI Tier 5") |
| `status` | `enum` | Yes | `'active' \| 'invalid' \| 'rate_limited' \| 'disabled'` |
| `encryptedKey` | `string` | Yes | AES-256-GCM encrypted secret payload |
| `keyIv` | `string` | Yes | Initialization vector for AES-256 decryption |
| `keyTag` | `string` | Yes | Authentication tag for GCM integrity verification |
| `maskedKey` | `string` | Yes | Masked display string (e.g. `sk-proj-••••49a1`) |
| `customBaseUrl` | `string` | No | Custom proxy/base URL (for Azure or self-hosted) |
| `createdAt` | `Timestamp` | Yes | Creation timestamp |
| `updatedAt` | `Timestamp` | Yes | Last update timestamp |

---

### 2.7 `budgets` (Subcollection)
Budget configurations and active spending alert thresholds.

- **Path**: `organizations/{orgId}/budgets/{budgetId}`
- **Document ID**: Auto-generated ID (e.g. `bud_marketing_q2`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Budget ID |
| `organizationId` | `string` | Yes | Parent Organization ID |
| `projectId` | `string` | No | Optional: specific project target (null = org-wide) |
| `name` | `string` | Yes | Budget Name |
| `amountUsd` | `number` | Yes | Budget limit in USD |
| `period` | `enum` | Yes | `'daily' \| 'weekly' \| 'monthly' \| 'quarterly'` |
| `alertThresholds` | `array` | Yes | Array of percentage thresholds (e.g. `[50, 75, 90, 100]`) |
| `triggeredThresholds`| `array` | Yes | Already triggered thresholds in current period |
| `enforceHardLimit`| `boolean` | Yes | If true, gateway rejects calls at 100% |
| `status` | `enum` | Yes | `'active' \| 'paused' \| 'exceeded'` |
| `createdAt` | `Timestamp` | Yes | Creation timestamp |
| `updatedAt` | `Timestamp` | Yes | Last update timestamp |

---

### 2.8 `usage` (Subcollection)
Telemetry records for every processed gateway request.

- **Path**: `organizations/{orgId}/usage/{usageId}`
- **Document ID**: Unique Request ID (e.g. `req_01j7k3...`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Request ID |
| `organizationId` | `string` | Yes | Parent Organization ID |
| `projectId` | `string` | Yes | Associated Project ID |
| `apiKeyId` | `string` | Yes | API Key used for request |
| `provider` | `string` | Yes | Upstream AI Provider (`openai`, `anthropic`, `gemini`) |
| `model` | `string` | Yes | Upstream Model identifier (`gpt-4o`, `claude-3-5-sonnet`) |
| `inputTokens` | `number` | Yes | Prompt token count |
| `outputTokens` | `number` | Yes | Completion token count |
| `totalTokens` | `number` | Yes | Total token count |
| `costUsd` | `number` | Yes | Computed cost in USD (micro-cents) |
| `costType` | `enum` | Yes | `'calculated' \| 'provider-reported' \| 'estimated'` |
| `latencyMs` | `number` | Yes | Total request latency in milliseconds |
| `statusCode` | `number` | Yes | HTTP status returned (e.g. `200`, `429`, `502`) |
| `timestamp` | `Timestamp` | Yes | Request timestamp |
| `datePartition` | `string` | Yes | Formatted partition key `YYYY-MM-DD` for indexing |

---

### 2.9 `alerts` (Subcollection)
Operational, budget, and anomaly alerts.

- **Path**: `organizations/{orgId}/alerts/{alertId}`
- **Document ID**: Auto-generated ID (e.g. `alt_839f...`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Alert ID |
| `organizationId` | `string` | Yes | Parent Organization ID |
| `projectId` | `string` | No | Associated Project ID (if applicable) |
| `type` | `enum` | Yes | `'BUDGET_THRESHOLD' \| 'BUDGET_EXCEEDED' \| 'SPEND_SPIKE' \| 'PROVIDER_ERROR_SPIKE' \| 'ANOMALY'` |
| `severity` | `enum` | Yes | `'INFO' \| 'WARNING' \| 'CRITICAL'` |
| `title` | `string` | Yes | Alert headline |
| `message` | `string` | Yes | Detailed description |
| `dedupKey` | `string` | Yes | Key to prevent alert storms (e.g. `bud_123_threshold_90_2026-08`) |
| `status` | `enum` | Yes | `'active' \| 'acknowledged' \| 'resolved'` |
| `createdAt` | `Timestamp` | Yes | Alert creation timestamp |

---

### 2.10 `auditLogs` (Subcollection)
Immutable enterprise audit trail.

- **Path**: `organizations/{orgId}/auditLogs/{logId}`
- **Document ID**: Auto-generated UUID or timestamp-based ID

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Audit Log ID |
| `organizationId` | `string` | Yes | Parent Organization ID |
| `actorId` | `string` | Yes | User UID or API Key ID performing the action |
| `actorEmail` | `string` | No | Email of the acting user |
| `action` | `string` | Yes | Action verb (`project.created`, `apikey.revoked`, `budget.updated`) |
| `resourceType` | `string` | Yes | Target resource (`project`, `apiKey`, `budget`, `member`) |
| `resourceId` | `string` | Yes | ID of target resource |
| `ipAddress` | `string` | No | Client IP address |
| `userAgent` | `string` | No | Client User Agent |
| `metadata` | `map` | No | Contextual metadata (non-sensitive diffs) |
| `timestamp` | `Timestamp` | Yes | Event timestamp |

---

## 3. Composite Index Requirements

```json
{
  "indexes": [
    {
      "collectionGroup": "usage",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "datePartition", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "usage",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "projectId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "alerts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "auditLogs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    }
  ]
}
```
