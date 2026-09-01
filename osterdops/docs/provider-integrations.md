# OsterdOps Provider Integrations Guide

OsterdOps connects seamlessly with major AI foundation model providers while enforcing unified governance, telemetry, and deterministic cost tracking.

---

## 1. Supported Providers

1. **OpenAI Direct**: Direct integration for `gpt-4o`, `gpt-4o-mini`, `o1`, `o1-mini`, `o3-mini`, `gpt-4-turbo`, `gpt-3.5-turbo`.
2. **Anthropic Claude**: Native adapter for `claude-3-5-sonnet`, `claude-3-5-haiku`, `claude-3-opus`.
3. **Google Gemini**: Integration for `gemini-1.5-pro` and `gemini-1.5-flash`.
4. **Azure OpenAI**: Dedicated enterprise deployments with private endpoints.
5. **AWS Bedrock**: Foundation model inference over AWS IAM SigV4 infrastructure.

---

## 2. Security & Credential Encryption

- **Storage**: Upstream provider keys are encrypted with **AES-256-GCM** using a 32-byte encryption key before persisting to Firestore.
- **Preview Masking**: Only safe masked prefixes/suffixes are returned to client interfaces (e.g. `sk-proj-••••49a1`).
- **Zero Raw Exposure**: Plaintext provider secrets are decrypted exclusively in server-side memory during upstream proxy execution and are never logged or returned in responses.

---

## 3. Cost Engine Integration

Every supported model is mapped to deterministic USD pricing per 1,000,000 tokens ($/1M tokens) in `src/lib/cost/pricing-registry.ts`. Prompt caching discounts (e.g., OpenAI 50% discount, Anthropic 90% discount) are calculated dynamically on every request.
