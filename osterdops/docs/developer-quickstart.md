# OsterdOps Developer Quickstart (5 Minutes)

## 1. Overview
This guide walks you through sending your first cost-governed AI completion through the OsterdOps AI Gateway.

---

## 2. Step 1: Create a Project API Key
1. Open the [Developer Portal](/developers/api-keys).
2. Click **Create API Key**.
3. Select your environment (`production`, `staging`, or `development`).
4. Securely copy your one-time secret token (`ost_live_...`).

---

## 3. Step 2: Send Your First Request

### cURL
```bash
curl -X POST "https://api.osterdops.com/api/v1/chat/completions" \
  -H "Authorization: Bearer $OSTERDOPS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      { "role": "system", "content": "You are a concise engineering assistant." },
      { "role": "user", "content": "Hello from OsterdOps Gateway!" }
    ],
    "temperature": 0.7,
    "max_tokens": 256
  }'
```

### TypeScript / Node.js
```typescript
import { OsterdOpsClient } from "@osterdops/sdk";

const client = new OsterdOpsClient({ apiKey: process.env.OSTERDOPS_API_KEY });
const response = await client.gateway.chat.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "Hello from OsterdOps Gateway!" }],
});

console.log("Completion:", response.choices[0].message.content);
console.log("Cost USD:", response.usage.estimated_cost_usd);
```

### Python
```python
import os
import requests

api_key = os.environ.get("OSTERDOPS_API_KEY")

response = requests.post(
    "https://api.osterdops.com/api/v1/chat/completions",
    headers={"Authorization": f"Bearer {api_key}"},
    json={
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": "Hello from OsterdOps Gateway!"}],
    },
)

data = response.json()
print("Completion:", data["choices"][0]["message"]["content"])
```

---

## 4. Step 3: Inspect Real-Time Telemetry Headers
Every response includes:
- `x-osterdops-latency-ms`: Gateway + Upstream latency
- `x-osterdops-cost-usd`: Deterministic token cost in USD
- `x-osterdops-total-tokens`: Total tokens consumed
- `x-osterdops-request-id`: Correlation ID for debugging
