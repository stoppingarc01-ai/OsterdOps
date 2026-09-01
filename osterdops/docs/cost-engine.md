# OsterdOps Cost Engine — Architecture & Documentation

The **OsterdOps Cost Engine** transforms normalized token usage records into deterministic, high-precision USD financial analytics. It serves as the financial computation foundation for **Budgets & Alerts (Phase 10)**, **Analytics (Phase 11)**, and **Model Optimization (Phase 12)**.

---

## 1. Centralized Model Pricing Registry

All pricing rates are defined explicitly in USD per 1,000,000 tokens ($/1M):

```typescript
export interface ModelPricing {
  provider: "openai" | "anthropic" | "gemini" | "azure" | "bedrock";
  model: string;
  inputPerMillionUsd: number;
  outputPerMillionUsd: number;
  cachedInputPerMillionUsd?: number;
  reasoningPerMillionUsd?: number;
  currency: "USD";
  version: string;
  effectiveAt: string;
}
```

### Official Pricing Matrix (Version `2026-08`)

| Provider | Model | Input ($/1M) | Output ($/1M) | Cached Input ($/1M) |
| :--- | :--- | :--- | :--- | :--- |
| **OpenAI** | `gpt-4o` | $2.50 | $10.00 | $1.25 |
| **OpenAI** | `gpt-4o-mini` | $0.15 | $0.60 | $0.075 |
| **OpenAI** | `o1` | $15.00 | $60.00 | $7.50 |
| **OpenAI** | `o1-mini` | $3.00 | $12.00 | $1.50 |
| **OpenAI** | `o3-mini` | $1.10 | $4.40 | $0.55 |
| **Anthropic** | `claude-3-5-sonnet` | $3.00 | $15.00 | $0.30 |
| **Anthropic** | `claude-3-5-haiku` | $0.80 | $4.00 | $0.08 |
| **Anthropic** | `claude-3-opus` | $15.00 | $75.00 | $1.50 |
| **Google** | `gemini-1.5-pro` | $1.25 | $5.00 | $0.3125 |
| **Google** | `gemini-1.5-flash` | $0.075 | $0.30 | $0.01875 |
| **Google** | `gemini-2.0-flash` | $0.10 | $0.40 | $0.025 |
| **Azure** | `azure/gpt-4o` | $2.50 | $10.00 | $1.25 |
| **Bedrock** | `bedrock/anthropic.claude-3-5-sonnet` | $3.00 | $15.00 | $0.30 |

### Zero Price Invention Policy
- If an unrecognized model or custom fine-tuned model is queried, the Cost Engine returns `pricingStatus: "UNAVAILABLE"` and `totalCostUsd: null`.
- Costs are **never** fabricated or guessed.

### Pre-Launch Pricing Verification Roadmap
- Before public general availability (GA), the pricing matrix will be connected to an automated pricing-update and provider source-verification job (or periodic registry sync against official provider pricing APIs/catalogs) to continuously validate current market rates.

---

## 2. High-Precision Nanodollar Arithmetic

To eliminate binary floating-point drift (e.g. `0.1 + 0.2 = 0.30000000000000004`), calculations are performed in integer nanodollars:

$$\text{1 USD} = 1,000,000,000 \text{ nanodollars}$$
$$\text{Rate per token in nanodollars} = \text{PricePerMillion} \times 1,000$$
$$\text{Cost in USD} = \frac{\text{Tokens} \times \text{NanoRate}}{1,000,000,000}$$

---

## 3. Specialized Token Treatment

### Cached Input Tokens
- When prompt caching is utilized, cached tokens are deducted from regular input tokens:
  $$\text{regularInputTokens} = \max(0, \text{inputTokens} - \text{cachedTokens})$$
- Regular tokens are charged at standard `inputPerMillionUsd`.
- Cached tokens are charged at discounted `cachedInputPerMillionUsd`.
- **Cache Savings** metric is calculated:
  $$\text{cachedSavingsUsd} = (\text{inputTokens} \times \text{standardRate}) - \text{actualInputCost}$$

### Reasoning Tokens
- For reasoning models (e.g. `o1`, `o3-mini`), reasoning tokens are either part of the output token allocation or charged at an explicit rate without double-billing.

---

## 4. CostRecord Schema & Multi-Tenant Firestore Structure

### Firestore Path
`organizations/{organizationId}/costs/{usageId}`

### Schema
```typescript
export interface CostRecord {
  id: string;                 // Document ID (matches usageId/requestId)
  usageId: string;            // Source UsageRecord ID
  requestId: string;          // Correlation request ID
  organizationId: string;     // Multi-tenant partition
  projectId: string;          // Scoped project ID
  apiKeyId: string;           // OsterdOps API key ID
  provider: string;           // AI provider
  model: string;              // Model identifier
  inputTokens: number;        // Prompt tokens
  outputTokens: number;       // Completion tokens
  cachedTokens: number;       // Cached prompt tokens
  reasoningTokens: number;    // Reasoning tokens
  inputCostUsd: number | null;// Input USD cost
  outputCostUsd: number | null;// Output USD cost
  cachedInputCostUsd: number | null; // Cached input USD cost
  reasoningCostUsd: number | null;   // Reasoning USD cost
  totalCostUsd: number | null;// Total request cost in USD
  pricingVersion: string;     // e.g. "2026-08"
  pricingEffectiveAt: string; // e.g. "2026-01-01"
  pricingStatus: "AVAILABLE" | "UNAVAILABLE";
  unavailableReason?: string; // Reason if pricing is missing
  timestamp: string;          // Creation timestamp
  datePartition: string;      // Daily partition ("YYYY-MM-DD")
}
```

### Idempotency Guarantee
- The cost document ID is set to `usageId` (or `requestId`).
- Retries safely merge into the existing document without creating duplicate financial charges.

---

## 5. Aggregations & Query Endpoints

### Endpoints
1. `GET /api/v1/costs?organizationId={orgId}&startDate=2026-08-01&endDate=2026-08-31`
2. `GET /api/v1/projects/{projectId}/costs?organizationId={orgId}`
3. `GET /api/v1/costs?organizationId={orgId}&aggregate=true`

### Aggregation Response Example
```json
{
  "success": true,
  "data": {
    "totalSpendUsd": 124.582,
    "totalRequests": 18500,
    "totalTokens": 24500000,
    "byProvider": {
      "openai": { "spendUsd": 84.125, "requests": 12000, "totalTokens": 16000000 },
      "anthropic": { "spendUsd": 40.457, "requests": 6500, "totalTokens": 8500000 }
    },
    "byModel": {
      "gpt-4o": { "spendUsd": 65.200, "requests": 4000, "totalTokens": 8000000 },
      "gpt-4o-mini": { "spendUsd": 18.925, "requests": 8000, "totalTokens": 8000000 },
      "claude-3-5-sonnet": { "spendUsd": 40.457, "requests": 6500, "totalTokens": 8500000 }
    },
    "byProject": {
      "prj_production_app": { "spendUsd": 124.582, "requests": 18500, "totalTokens": 24500000 }
    },
    "dailySpend": [
      { "date": "2026-08-28", "spendUsd": 58.210, "requests": 9000, "tokens": 12000000 },
      { "date": "2026-08-29", "spendUsd": 66.372, "requests": 9500, "tokens": 12500000 }
    ]
  }
}
```

---

## 6. RBAC & Privacy Guarantees

- **RBAC**: Protected by `billing:read` / `usage:read` permission (`OWNER`, `ADMIN`, `DEVELOPER`, `VIEWER`).
- **Tenant Isolation**: Caller membership in the organization is strictly validated server-side.
- **Zero Content Storage**: Prompts, system messages, completions, API keys, and provider secrets are never stored in Cost records.
