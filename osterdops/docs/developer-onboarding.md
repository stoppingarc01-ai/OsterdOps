# OsterdOps Developer Onboarding Flow

## 1. 5-Step Developer Onboarding Path

```
1. Create Organization & Project
              ↓
2. Generate Project API Key
              ↓
3. Configure Upstream Provider Connections
              ↓
4. Send First Request via Playground or cURL
              ↓
5. Inspect Telemetry & Establish Budget Guardrails
```

---

## 2. Onboarding Steps Breakdown

1. **Organization & Project Setup**:
   - Establish tenancy boundary and default environment (`production` / `staging`).
2. **API Key Generation**:
   - Create single-reveal API key in `/dashboard/developers/api-keys`.
   - Store secret securely in environment variables.
3. **Provider Credentials**:
   - Configure OpenAI, Anthropic, or Gemini keys in `/dashboard/integrations`.
4. **First Request**:
   - Dispatch inference request through `/api/v1/gateway/chat/completions`.
5. **Observability & Budgets**:
   - Verify token metrics in `/dashboard/developers/requests`.
   - Set monthly hard budget limit in `/dashboard/budgets`.
