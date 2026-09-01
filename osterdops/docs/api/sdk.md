# TypeScript SDK (`@osterdops/sdk`)

Official TypeScript / JavaScript SDK for the OsterdOps Enterprise AI Governance Platform.

---

## 1. Quick Install

```bash
npm install @osterdops/sdk
```

---

## 2. Initialization

```typescript
import { OsterdOpsClient } from "@osterdops/sdk";

const client = new OsterdOpsClient({
  apiKey: "osk_live_example_94f2a188c9f4d1e204b78912",
  baseUrl: "https://api.osterdops.com",
  apiVersion: "v1",
  timeoutMs: 30000,
  maxRetries: 3,
});
```

---

## 3. Key Methods

```typescript
// AI Gateway Chat Completion
const response = await client.gateway.chat.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Explain deterministic token pricing." }],
});

console.log("Cost:", "$" + response.costUsd);
console.log("Tokens:", response.usage?.totalTokens);

// Projects with Cursor Pagination
const projects = await client.projects.list();

// Safe Idempotent Mutation
const newProject = await client.projects.create({
  name: "Analytics Worker",
  spendLimitMonthly: 250,
});
```
