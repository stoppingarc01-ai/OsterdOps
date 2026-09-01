# OsterdOps AI Gateway Streaming Architecture

## 1. Overview

When `stream: true` is included in the completion payload, the OsterdOps Gateway establishes an end-to-end Server-Sent Events (SSE) connection between the client and the upstream provider.

---

## 2. Server-Sent Events (SSE) Protocol

Streaming responses use standard SSE MIME types:
- `Content-Type: text/event-stream; charset=utf-8`
- `Cache-Control: no-cache, no-transform`
- `Connection: keep-alive`

### Chunk Format
```
data: {"id":"gw_123","object":"chat.completion.chunk","created":1788188500,"model":"gpt-4o","choices":[{"index":0,"delta":{"role":"assistant","content":"Hello"},"finish_reason":null}]}

data: {"id":"gw_123","object":"chat.completion.chunk","created":1788188500,"model":"gpt-4o","choices":[{"index":0,"delta":{"content":" world!"},"finish_reason":null}]}

data: {"id":"gw_123","object":"chat.completion.chunk","created":1788188500,"model":"gpt-4o","choices":[{"index":0,"delta":{},"finish_reason":"stop"}],"usage":{"prompt_tokens":12,"completion_tokens":4,"total_tokens":16}}

data: [DONE]
```

---

## 3. End-of-Stream Usage Persistence

When the stream closes or completes:
1. The stream transformer accumulates token metrics (`prompt_tokens`, `completion_tokens`, `total_tokens`, `cached_tokens`).
2. Calculates total elapsed latency.
3. Asynchronously triggers non-blocking durable usage recording in Firestore (`organizations/{orgId}/usage/{requestId}`).
4. Asynchronously evaluates project/organization budgets without delaying stream transmission.
