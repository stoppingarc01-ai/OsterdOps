# OsterdOps Developer Center

Routes: `/dashboard/developer`, `/dashboard/developers/api`, `/dashboard/developers/quickstart`, `/dashboard/developers/webhooks`

The Developer Center provides API documentation, OpenAPI 3.1 specifications, SDK installation recipes, and webhook signing guides.

---

## 1. Quick Integration

```bash
npm install @osterdops/sdk
```

```typescript
import { OsterdOpsClient } from "@osterdops/sdk";

const client = new OsterdOpsClient({
  apiKey: process.env.OSTERDOPS_API_KEY,
  apiVersion: "v1",
});

const res = await client.gateway.chat.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Deterministic token metering" }],
});
```

---

## 2. API Key Management

- **Single-Reveal Guarantee**: The raw plaintext API key is returned exactly once upon creation.
- **Scoped Permissions**: Keys can be restricted to specific permissions (e.g. `gateway:invoke`, `usage:read`).
- **Revocation & Rotation**: Immediate invalidation via server-side SHA-256 hash de-indexing.
