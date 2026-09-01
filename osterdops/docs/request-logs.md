# OsterdOps Request Logs & Telemetry Reference

## 1. Overview

The **Request Logs Inspector** (`/dashboard/developers/requests` and `/developers/logs`) gives developers complete visibility into AI Gateway requests while maintaining strict enterprise data privacy.

---

## 2. Telemetry Schema

Every log entry captures:
- `id`: Canonical Request ID (`gw_req_...` or `req_...`)
- `timestamp`: UTC ISO timestamp
- `provider`: AI Provider (`openai`, `anthropic`, `gemini`, `azure`, `bedrock`)
- `model`: Target LLM model
- `statusCode`: HTTP status code (200, 400, 401, 429, 500, 504)
- `latencyMs`: Roundtrip time in milliseconds
- `inputTokens`: Prompt tokens processed
- `outputTokens`: Completion tokens generated
- `cachedTokens`: Prompt cache tokens reused
- `costUsd`: Exact calculated cost via OsterdOps Pricing Registry
- `stream`: Boolean indicating SSE streaming vs unary execution

---

## 3. Privacy Guarantees

- **Zero Prompt Retention**: User prompts are never logged, indexed, or stored.
- **Zero Completion Retention**: Model generated text is never persisted.
- **Zero Raw Secret Exposure**: API keys and provider vendor credentials are fully redacted before telemetry write.
