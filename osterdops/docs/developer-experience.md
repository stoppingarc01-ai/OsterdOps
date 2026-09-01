# OsterdOps Developer Platform & API Experience

## 1. Overview
The **OsterdOps Developer Experience & API Platform** provides modern infrastructure for developers integrating LLMs and generative AI applications. OsterdOps functions as an intelligent proxy layer that provides deterministic cost calculation, proactive budget enforcement, token counting, sliding-window rate limiting, and observability.

---

## 2. Developer Capabilities

```
Developer Portal (/developers)
  │
  ├── 5-Minute Quickstart (cURL, TypeScript, Python)
  ├── Interactive API Playground (SSE Streaming + Token Telemetry HUD)
  ├── API Reference (Schemas, Parameters, Headers & Errors)
  ├── API Key Governance (SHA-256 Hashing & Single Reveal)
  ├── Real-Time Request Inspector (Zero-Prompt Telemetry)
  ├── Rate Limits & Quota Metering (RFC x-ratelimit-* Headers)
  ├── Error Catalog & Remediation Guides
  └── OpenAPI 3.1.0 JSON Schema (/api/openapi.json)
```

---

## 3. Privacy & Security Guarantees
- **Zero-Prompt Persistence**: OsterdOps guarantees that prompt text, system messages, and model completions are never stored in telemetry databases, usage records, or logs.
- **Single-Reveal Keys**: Raw API key secrets are returned strictly once upon creation or rotation.
- **One-Way SHA-256 Storage**: Key hashes are compared in constant time with `crypto.timingSafeEqual`.
- **Strict Server-Side RBAC**: Every endpoint enforces organization isolation and role validation (`OWNER`, `ADMIN`, `DEVELOPER`, `VIEWER`).
