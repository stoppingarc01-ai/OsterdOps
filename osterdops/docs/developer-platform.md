# OsterdOps Developer Platform Architecture & Reference (Phase 23)

## 1. Overview

The **OsterdOps Developer Platform** provides a comprehensive developer hub, toolchain, interactive playground, and observability suite designed to help engineering teams integrate upstream AI models (OpenAI, Anthropic Claude, Google Gemini, Azure OpenAI, Amazon Bedrock) through a unified AI Gateway.

```
┌────────────────────────────────────────────────────────┐
│               OsterdOps Developer Hub                  │
└──────────────────────────┬─────────────────────────────┘
                           │
    ┌──────────────────────┼──────────────────────┐
    ▼                      ▼                      ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────────┐
│ API Keys     │   │ Playground   │   │ Request Logs     │
│ & Scopes     │   │ & Live SSE   │   │ & Correlation    │
└──────────────┘   └──────────────┘   └──────────────────┘
    │                      │                      │
    ▼                      ▼                      ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────────┐
│ API Guide    │   │ Usage Quotas │   │ Zero-Persistence │
│ & SDKs       │   │ & Limits     │   │ Privacy Shield   │
└──────────────┘   └──────────────┘   └──────────────────┘
```

---

## 2. Core Capabilities

1. **API Key Management (`/dashboard/developers/api-keys` & `/developers/api-keys`)**:
   - Single-reveal key creation (`osk_live_...`, `osk_test_...`).
   - One-way SHA-256 cryptographic hashing in Firestore.
   - Immediate revocation and zero-downtime key rotation.
   - Fine-grained permission scopes and expiration policies.

2. **Interactive API Playground (`/dashboard/developers/playground` & `/developers/playground`)**:
   - Dynamic model selector across OpenAI, Anthropic, and Gemini.
   - Real-time Server-Sent Events (SSE) token-by-token streaming output.
   - Hyperparameter sliders: `temperature`, `max_tokens`, `top_p`.
   - Multi-turn conversation editor.
   - Telemetry HUD: status code, latency (ms), token breakdown, and estimated spend ($USD).
   - Code export snippets in cURL, TypeScript, and Python.

3. **Request Logs & Inspector (`/dashboard/developers/requests` & `/developers/logs`)**:
   - Full-text search by correlation Request ID (`gw_...`, `req_...`).
   - Multi-filter controls: provider, model, status (200, 429, 504), time window.
   - Slide-over inspector showing request breakdown and latency rating.
   - **Zero Payload Retention**: prompts and completions are strictly purged from memory.

4. **Usage & Rate Limit Visibility (`/dashboard/developers/usage` & `/developers/usage`)**:
   - Live 60s sliding-window rate limit counters.
   - RFC rate limit response headers (`x-ratelimit-limit`, `x-ratelimit-remaining`, `x-ratelimit-reset`).
   - Monthly spend vs hard budget ceiling tracking.
   - Prompt caching hit rates and cost savings.

5. **Quickstart Onboarding (`/dashboard/developers/quickstart` & `/developers/quickstart`)**:
   - 5-step interactive developer onboarding guide.
