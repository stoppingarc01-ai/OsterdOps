# OsterdOps AI Gateway — Developer API Documentation

The **OsterdOps AI Gateway** is a secure, high-performance API proxy that allows customer applications to route requests to multiple AI providers (OpenAI, Anthropic Claude, Google Gemini, Microsoft Azure OpenAI, AWS Bedrock) using a unified endpoint and a single OsterdOps API key.

---

## 1. Gateway Endpoint

```http
POST /api/v1/gateway/chat/completions
```

### Authentication Header
Every gateway request must include a valid OsterdOps project API key:

```http
Authorization: Bearer ost_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
*(Alternatively, you can supply `x-api-key: ost_live_...`)*

---

## 2. Request Schema

### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `model` | string | **Yes** | Target AI model identifier (e.g. `gpt-4o`, `claude-3-5-sonnet`, `gemini-1.5-pro`). |
| `messages` | array | **Yes** | Array of conversational message objects with `role` and `content`. |
| `provider` | string | *Optional* | Upstream AI provider (`openai`, `anthropic`, `gemini`, `azure`, `bedrock`). Inferred automatically from `model` if omitted. |
| `temperature` | number | *Optional* | Sampling temperature (0.0 to 2.0). |
| `max_tokens` | number | *Optional* | Maximum number of tokens to generate. |
| `top_p` | number | *Optional* | Nucleus sampling probability threshold. |
| `stream` | boolean | *Optional* | **Must be `false`**. Streaming is not supported in Phase 7 and will return `400 Bad Request`. |

### Example Request

```bash
curl -X POST https://api.osterdops.com/api/v1/gateway/chat/completions \
  -H "Authorization: Bearer ost_live_7a9f1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e" \
  -H "Content-Type: application/json" \
  -H "x-osterdops-request-id: req_custom_abc123" \
  -d '{
    "provider": "openai",
    "model": "gpt-4o-mini",
    "messages": [
      {
        "role": "user",
        "content": "Explain quantum computing in one sentence."
      }
    ],
    "temperature": 0.7,
    "max_tokens": 150
  }'
```

---

## 3. Response Schema

### Success Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "id": "chatcmpl-94f2a1b3",
    "provider": "openai",
    "model": "gpt-4o-mini",
    "output": {
      "role": "assistant",
      "content": "Quantum computing harnesses the principles of quantum superposition and entanglement to solve complex calculations exponentially faster than classical computers."
    },
    "usage": {
      "inputTokens": 14,
      "outputTokens": 26,
      "totalTokens": 40,
      "cachedTokens": 0,
      "reasoningTokens": 0
    },
    "finishReason": "stop",
    "latencyMs": 284
  }
}
```

### Response Headers

| Header | Description |
| :--- | :--- |
| `x-osterdops-request-id` | Unique correlation request ID for end-to-end tracing and auditability. |
| `x-ratelimit-remaining` | Number of requests remaining in the current sliding rate limit window. |
| `x-ratelimit-reset` | Milliseconds until the rate limiting window resets. |

---

## 4. Error Normalization

All error responses return a standardized JSON error envelope:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Upstream provider credentials for 'openai' are invalid or unauthorized.",
    "details": {
      "provider": "openai",
      "retryable": false
    }
  }
}
```

### Error Code Reference

| Error Code | HTTP Status | Description | Retryable |
| :--- | :--- | :--- | :--- |
| `UNAUTHORIZED` | 401 | Missing, malformed, revoked, or expired OsterdOps API key. | No |
| `BAD_REQUEST` | 400 | Missing required fields (`model`, `messages`) or invalid message structure. | No |
| `RATE_LIMITED` | 429 | OsterdOps API key request rate limit exceeded. | Yes |
| `INVALID_CREDENTIALS` | 401 / 400 | Missing or invalid upstream vendor API credentials in organization settings. | No |
| `PROVIDER_RATE_LIMITED` | 429 | Upstream AI provider returned a rate limit error. | Yes |
| `MODEL_NOT_FOUND` | 404 | Specified model is not available or supported by the target provider. | No |
| `PROVIDER_UNAVAILABLE` | 503 | Upstream AI provider is temporarily unreachable or undergoing an outage. | Yes |
| `TIMEOUT` | 504 | Upstream provider request exceeded the 60-second server deadline. | Yes |
| `PROVIDER_ERROR` | 502 | Upstream AI provider returned a generic or internal error. | Yes |

---

## 5. Supported Providers

| Provider Identifier | Supported Vendor | Auto-detected Prefixes |
| :--- | :--- | :--- |
| `openai` | OpenAI Direct API | `gpt-`, `o1-`, `o3-`, `text-embedding-`, `dall-e-` |
| `anthropic` | Anthropic Claude | `claude-` |
| `gemini` | Google Vertex & Gemini | `gemini-`, `models/gemini-` |
| `azure` | Microsoft Azure OpenAI | `azure-`, `azure/` |
| `bedrock` | AWS Bedrock | `bedrock-`, `amazon.`, `anthropic.claude` |

---

## 6. Architecture & Security Guarantees

1. **Zero Secret Leakage**: Upstream provider API keys are encrypted at rest with **AES-256-GCM** and decrypted strictly in memory on the server during request dispatch. Plaintext keys are never returned in responses or logs.
2. **Multi-Tenant Isolation**: Provider connections and project scopes are strictly isolated by organization ID. Cross-organization requests are rejected.
3. **No Prompt Persistence**: The gateway logs only operational telemetry (latencies, token counts, request IDs, status codes). User prompt contents and model responses are never written to disk or audit logs.
4. **Strict Numerical Usage Metadata**: Telemetry and usage breakdowns strictly contain numerical counts (`inputTokens`, `outputTokens`, `totalTokens`, `cachedTokens`, `reasoningTokens`). Prompts, system instructions, and completion strings are excluded from telemetry payloads.
5. **Configurable CORS Origin Whitelist**: In production environments, specify `OSTERDOPS_ALLOWED_ORIGINS` (comma-separated domains) to enforce strict origin matching. In development, incoming origins are safely reflected with `Vary: Origin`.

---

## 7. Known Infrastructure Limitations (Phase 7)

- **In-Memory Rate Limiting**: The current sliding window limiter is in-memory and designed for single-instance development. Distributed Redis clustering will replace this in multi-region deployments.
- **Streaming Roadmap**: Real-time Server-Sent Events (`stream: true`) is scheduled for subsequent gateway iterations.
