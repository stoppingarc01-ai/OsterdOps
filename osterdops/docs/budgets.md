# OsterdOps Budget & Spend Limit Governance Engine (Phase 12)

The **OsterdOps Budget Governance Engine** allows organizations to define spending limits across multiple billing cycles (`DAILY`, `WEEKLY`, `MONTHLY`, `CUSTOM`) and enforce spending policies (`SOFT` monitoring vs `HARD` gateway blocking).

---

## 1. Budget Architecture & Lifecycle

```
Customer AI Request
       ↓
API Key Authentication
       ↓
Pre-Flight Budget Enforcement Check (HARD vs SOFT)
       ↓
[Blocked if HARD & Exceeded (HTTP 429)] ──→ Log BUDGET_REQUEST_BLOCKED
       ↓ [If Allowed]
Provider Dispatch & Usage / Cost Recording
       ↓
Post-Flight Async Spend Update & Threshold Evaluation
       ↓
Deduplicated Alert Generation & Multi-Channel Notification Dispatch
```

### Budget Lifecycle States
- **`ACTIVE`**: Budget is being monitored and evaluated against spend.
- **`PAUSED`**: Budget is temporarily deactivated; alerts and blocking are suppressed.
- **`EXCEEDED`**: Current spend has reached or exceeded 100% of the limit.
- **`ARCHIVED`**: Budget is soft-deleted and omitted from evaluation runs.
- **`EXPIRED`**: Custom budget whose `periodEnd` has passed.

---

## 2. Hard vs. Soft Enforcement

| Policy | Behavior on Threshold Crossing | Behavior on Budget Exceeded |
| :--- | :--- | :--- |
| **`SOFT` (`MONITOR`)** | Emits deduplicated in-app & email threshold alerts. | Emits critical `BUDGET_EXCEEDED` alert. Requests continue normally. |
| **`HARD` (`BLOCK`)** | Emits deduplicated in-app & email threshold alerts. | Emits critical `BUDGET_EXCEEDED` alert. **AI Gateway rejects subsequent requests with HTTP 429 (`BUDGET_EXCEEDED`)**. |

---

## 3. Data Model & Firestore Schema

Collection Path: `organizations/{organizationId}/budgets/{budgetId}`

```typescript
export interface Budget {
  id: string;
  organizationId: string;
  projectId?: string;        // Optional project-level scope
  name: string;
  description?: string;
  amountUsd: number;         // Monetary limit in USD (also accessible via limitUsd)
  currentSpendUsd?: number;  // Current calculated period spend
  currency?: string;         // Default: "USD"
  period: "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";
  periodStart?: string;      // ISO 8601 UTC
  periodEnd?: string;        // ISO 8601 UTC
  thresholds?: number[];     // e.g. [50, 75, 90, 100]
  triggeredThresholds?: number[];
  enabled?: boolean;
  enforcement: "SOFT" | "HARD"; // Default: "SOFT"
  status: "ACTIVE" | "PAUSED" | "EXCEEDED" | "ARCHIVED" | "EXPIRED";
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 4. REST API Endpoints

| Method | Path | Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/budgets` | `budgets:read` | List all budgets for an organization |
| `POST` | `/api/v1/budgets` | `budgets:manage` | Create a new budget |
| `GET` | `/api/v1/budgets/[budgetId]` | `budgets:read` | Get budget details and parameters |
| `PATCH` | `/api/v1/budgets/[budgetId]` | `budgets:manage` | Update budget fields |
| `DELETE` | `/api/v1/budgets/[budgetId]` | `budgets:manage` | Soft-delete a budget |
| `POST` | `/api/v1/budgets/[budgetId]/pause` | `budgets:manage` | Pause budget evaluation |
| `POST` | `/api/v1/budgets/[budgetId]/resume` | `budgets:manage` | Resume budget evaluation |
| `POST` | `/api/v1/budgets/[budgetId]/evaluate` | `budgets:read` | Trigger on-demand evaluation |
| `GET` | `/api/v1/budgets/[budgetId]/status` | `budgets:read` | Get real-time spend & utilization % |

---

## 5. RBAC Permissions

- **`OWNER`**: `budgets:read`, `budgets:manage`, `budgets:enforce`
- **`ADMIN`**: `budgets:read`, `budgets:manage`, `budgets:enforce`
- **`DEVELOPER`**: `budgets:read` (read-only)
- **`VIEWER`**: `budgets:read` (read-only)
