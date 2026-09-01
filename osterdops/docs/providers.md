# OsterdOps AI Providers & Adapter Architecture

## 1. Overview

OsterdOps integrates with upstream AI model providers through a normalized, production-grade adapter layer. The system currently provides native integrations for:

- **OpenAI** (Direct Chat Completions & Reasoning Models)
- **Anthropic** (Claude 3 and 3.5 Series)
- **Google Gemini** (Gemini 1.5 and 2.0 Flash / Pro)
- **Azure OpenAI** (Enterprise Azure endpoints)
- **AWS Bedrock** (Amazon Bedrock foundation models)

---

## 2. Server-Side Credentials & Vault Resolution

Provider credentials are **strictly resolved server-side** and **never exposed to client responses, logs, or frontend bundles**.

Credentials resolution follows a priority hierarchy:
1. **Encrypted Organization / Project Connection**: Decrypted on-the-fly from Firestore (`organizations/{orgId}/providerConnections/{connId}`) using AES-256-GCM.
2. **Server Environment Variable Fallback**:
   - `OPENAI_API_KEY` (and optional `OPENAI_BASE_URL`)
   - `ANTHROPIC_API_KEY` (and optional `ANTHROPIC_BASE_URL`)
   - `GEMINI_API_KEY` (and optional `GEMINI_BASE_URL`)

---

## 3. Model Capabilities Catalog

The centralized capability registry in `src/lib/adapters/models.ts` tracks:
- Supported parameters (`temperature`, `max_tokens`, `top_p`, `frequency_penalty`, `presence_penalty`, `stop`, `stream`)
- Context window limits
- Max generation tokens
- Multimodal vision support
- Reasoning token extraction
- Prompt caching compatibility

---

## 4. Adapter Interface

Every provider implements the `AIProviderAdapter` interface:

```typescript
export interface AIProviderAdapter {
  readonly provider: AIProvider;
  validateCredentials(credentials: ProviderCredentials): Promise<{ valid: boolean; error?: string }>;
  formatRequest(request: GatewayChatRequest, credentials: ProviderCredentials): { url: string; headers: Record<string, string>; body: string };
  formatStreamRequest?(request: GatewayChatRequest, credentials: ProviderCredentials): { url: string; headers: Record<string, string>; body: string };
  executeRequest(formatted: { url: string; headers: Record<string, string>; body: string }, timeoutMs?: number): Promise<{ rawResponse: Response; responseBody: unknown; latencyMs: number }>;
  parseStreamChunk?(chunk: string, model?: string): ParsedStreamChunk[];
  extractUsage(responseBody: unknown): TokenUsageBreakdown;
  normalizeResponse(responseBody: unknown, model: string): GatewayChatResponse;
  handleProviderError(statusCode: number, rawError: unknown): NormalizedProviderError;
}
```
