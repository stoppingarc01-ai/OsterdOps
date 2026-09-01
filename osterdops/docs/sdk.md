# OsterdOps TypeScript SDK (`@osterdops/sdk`)

The official TypeScript SDK for the OsterdOps AI Cost Governance & Gateway Platform.

---

## 1. Installation

```bash
npm install @osterdops/sdk
```

---

## 2. Initialization & Authentication

```typescript
import { OsterdOpsClient } from "@osterdops/sdk";

const client = new OsterdOpsClient({
  // Defaults to process.env.OSTERDOPS_API_KEY if omitted
  apiKey: "osk_live_94f2a188c9f4d1e204b78912",
  // Defaults to process.env.OSTERDOPS_BASE_URL or "https://api.osterdops.com"
  baseUrl: "https://api.osterdops.com",
  // Request timeout in milliseconds (default: 30000)
  timeoutMs: 30000,
  // Max retries on safe transient failures (default: 2)
  maxRetries: 2,
});
```

---

## 3. Typed Resource Modules

### 3.1 AI Gateway Chat Completions

```typescript
const completion = await client.gateway.chat.create({
  model: "gpt-4o",
  messages: [
    { role: "system", content: "You are an enterprise AI assistant." },
    { role: "user", content: "Explain deterministic pricing in OsterdOps." },
  ],
  temperature: 0.7,
});

console.log(completion.output.content);
console.log("Latency:", completion.latencyMs, "ms");
console.log("Cost:", "$" + completion.costUsd);
console.log("Tokens:", completion.usage?.totalTokens);
```

### 3.2 Projects Management

```typescript
// List projects
const projects = await client.projects.list();

// Create new project
const newProject = await client.projects.create({
  name: "Analytics Worker",
  spendLimitMonthly: 250,
});

// Update project
await client.projects.update(newProject.id, { spendLimitMonthly: 500 });

// Archive project
await client.projects.archive(newProject.id);
```

### 3.3 API Key Management

```typescript
// Create API key (returns secret EXACTLY ONCE)
const key = await client.apiKeys.create("proj_01j9a8b", {
  name: "Ingestion Key",
  environment: "production",
});
console.log("API Key Secret:", key.secret);

// List keys
const keys = await client.apiKeys.list("proj_01j9a8b");

// Revoke key
await client.apiKeys.revoke("proj_01j9a8b", key.id);

// Rotate key
const rotated = await client.apiKeys.rotate("proj_01j9a8b", key.id);
```

### 3.4 Usage & Costs

```typescript
// Aggregated usage
const usage = await client.usage.get();
console.log("Total Tokens:", usage.totalTokens);
console.log("Cached Tokens:", usage.cachedTokens);

// Cost summary and model breakdown
const costs = await client.costs.get();
console.log("Total Cost:", costs.totalCostUsd, costs.currency);
```

### 3.5 Budgets & Spend Caps

```typescript
const budget = await client.budgets.create({
  name: "Monthly AI Cap",
  amountUsd: 1000,
  period: "monthly",
  enforcementMode: "BLOCK", // Hard enforcement ceiling
  thresholds: [50, 80, 100],
});

// Pause budget
await client.budgets.pause(budget.id);

// Resume budget
await client.budgets.resume(budget.id);
```

### 3.6 Diagnostics & Doctor

```typescript
const diag = await client.doctor();
if (!diag.healthy) {
  console.error("Diagnostics check failed:", diag.checks);
} else {
  console.log("All systems operational.");
}
```

---

## 4. Error Hierarchy

The SDK throws typed subclasses of `OsterdOpsError`:

```typescript
import {
  OsterdOpsError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  RateLimitError,
  BudgetExceededError,
  NotFoundError,
  ProviderError,
  TimeoutError,
  ServerError,
} from "@osterdops/sdk";

try {
  await client.gateway.chat.create({ model: "gpt-4o", messages: [] });
} catch (err) {
  if (err instanceof BudgetExceededError) {
    console.error("Budget ceiling reached. Spend limit enforced.");
  } else if (err instanceof RateLimitError) {
    console.warn(`Rate limited. Retry after ${err.retryAfterMs}ms`);
  } else if (err instanceof AuthenticationError) {
    console.error("Invalid OsterdOps API key.");
  } else if (err instanceof ProviderError) {
    console.error(`Upstream provider ${err.provider} error: ${err.message}`);
  } else if (err instanceof OsterdOpsError) {
    console.error(`OsterdOps Error [${err.code}]: ${err.message}`);
  }
}
```

---

## 5. Security & Privacy Guarantees

1. **Zero Secret Logging**: API keys, auth headers, and provider secrets are never logged or stored by the client.
2. **Sanitized Error Payloads**: Potential secrets in upstream error messages are automatically stripped via regex redaction before errors are raised.
3. **No Prompt Telemetry**: The SDK never sends prompt text to analytics or logging endpoints outside the direct gateway proxy connection.
