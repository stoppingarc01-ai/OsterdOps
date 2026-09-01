# OsterdOps — Cross-Service Integration Testing Guide

## 1. Integration Architecture Overview
OsterdOps connects multiple autonomous subsystems into a unified FinOps and AI Gateway platform. Integration testing validates the data flow, contract integrity, and synchronization guarantees between these components:

```
[ Inbound AI Request ]
         │
         ▼
┌──────────────────┐
│   Auth & RBAC    │ ◄─── API Key / Session Token
└────────┬─────────┘
         │ (Authenticated Key Context)
         ▼
┌──────────────────┐
│ Rate Limiter &   │ ◄─── Sliding Window Quotas
│ Budget Evaluator │ ◄─── Spend Caps & Thresholds
└────────┬─────────┘
         │ (Authorized Execution)
         ▼
┌──────────────────┐
│ Provider Adapter │ ───► OpenAI / Anthropic / Gemini / etc.
└────────┬─────────┘
         │ (Token Usage & Latency)
         ▼
┌──────────────────┐      ┌───────────────────┐
│ Ingestion Engine │ ───► │ Cost Calculation  │
└────────┬─────────┘      └─────────┬─────────┘
         │                          │
         ▼                          ▼
┌──────────────────┐      ┌───────────────────┐
│ Usage / Cost     │ ───► │ Alert & Dedupl.   │
│ Persistence      │      │ Engine            │
└──────────────────┘      └───────────────────┘
```

---

## 2. Key Integration Pipelines

### 2.1 Usage & Cost Ingestion Pipeline
- **File**: `tests/e2e/phase26-usage-cost-pipeline.e2e.test.ts`
- **Validation**:
  - Ingestion of successful requests produces synchronized `UsageRecord` and `CostRecord` documents.
  - Idempotent deduplication based on `requestId` prevents double-counting spend.
  - Failed upstream requests (HTTP 5xx / 4xx) record 0 tokens and 0 cost while accurately tracking error codes and latency.
  - Aggregate metrics (total spend, total tokens, average latency) are computed accurately across multiple providers.

### 2.2 Budget Hard Enforcement & Alerting Engine
- **File**: `tests/e2e/phase26-budget-enforcement.e2e.test.ts`
- **Validation**:
  - Progressive threshold alerts trigger at configured percentages (e.g. 50%, 75%, 90%).
  - Deterministic deduplication keys (`getAlertDedupKey`) prevent alert spam within the same billing period.
  - Hard limit enforcement instantly rejects requests with HTTP 403 upon reaching 100% of the allocated budget.
  - Deterministic UTC period boundaries (Monthly, Weekly, Daily) ensure accurate budget roll-overs.

### 2.3 Provider Routing & Adapter Compatibility
- **File**: `tests/e2e/phase26-provider-routing.e2e.test.ts`
- **Validation**:
  - Model catalog resolves provider automatically (e.g. `gpt-4o` -> `openai`, `claude-3-5-sonnet` -> `anthropic`).
  - Request parameter validation matches upstream model capabilities (context window, temperature ranges, reasoning tokens).
  - Unrecognized models trigger clean validation errors without crashing the gateway process.

### 2.4 Privacy Workflows & Durable Job Queue
- **File**: `tests/e2e/phase26-privacy-audit-jobs.e2e.test.ts`
- **Validation**:
  - Data export requests produce structured JSON archives with SHA-256 integrity checksums.
  - GDPR/CCPA deletion requests follow a strict state machine (`PENDING` -> `PROCESSING` -> `COMPLETED`).
  - Active legal holds immediately block deletion requests to ensure regulatory compliance.
  - Durable job queue handles retries with exponential backoff and dead-letter queue (DLQ) routing.
