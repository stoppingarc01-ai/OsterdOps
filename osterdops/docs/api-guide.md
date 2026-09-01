# OsterdOps API Reference & Integration Guide

## 1. Base URL & Authentication

All API endpoints are versioned under `/api/v1`.

```http
https://api.osterdops.io/api/v1
```

Authenticate requests using Bearer tokens containing an OsterdOps Project API Key:

```http
Authorization: Bearer osk_live_your_project_api_key_here
```

---

## 2. Core Endpoints

### 2.1 AI Gateway Chat Completions

- **Endpoint**: `POST /api/v1/gateway/chat/completions` (or `POST /api/v1/chat/completions`)
- **Headers**:
  - `Authorization: Bearer osk_live_...`
  - `Content-Type: application/json`
  - `x-request-id: <optional-correlation-id>`
- **Request Body**:
```json
{
  "model": "gpt-4o-mini",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "Hello!" }
  ],
  "temperature": 0.7,
  "max_tokens": 1024,
  "stream": false
}
```
- **Response (Unary - HTTP 200)**:
```json
{
  "id": "gw_req_01j9a8b1",
  "object": "chat.completion",
  "created": 1788194000,
  "model": "gpt-4o-mini",
  "choices": [
    {
      "index": 0,
      "message": { "role": "assistant", "content": "Hello! How can I assist you today?" },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 18,
    "completion_tokens": 9,
    "total_tokens": 27,
    "cached_tokens": 0
  }
}
```

---

### 2.2 Streaming Completions (Server-Sent Events)

When `stream: true` is passed, the Gateway responds with `Content-Type: text/event-stream; charset=utf-8`:

```http
data: {"id":"gw_req_01j9a8b1","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"role":"assistant","content":"Hello"},"finish_reason":null}]}

data: {"id":"gw_req_01j9a8b1","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":" there!"},"finish_reason":null}]}

data: {"id":"gw_req_01j9a8b1","object":"chat.completion.chunk","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: [DONE]
```

---

### 2.3 Rate Limit Headers

| Header | Description | Example |
|---|---|---|
| `x-ratelimit-limit` | Maximum requests permitted in current 60s sliding window | `1200` |
| `x-ratelimit-remaining` | Quota remaining in current window | `1182` |
| `x-ratelimit-reset` | Epoch timestamp (seconds) when quota resets | `1788194060` |
| `x-osterdops-request-id` | Canonical correlation ID | `gw_req_01j9a8b1` |
