# OsterdOps — Audit Center & Telemetry Verification

## 1. Audit Log Schema
Each administrative action produces a structured audit record:

```typescript
interface AuditRecord {
  id: string;
  timestamp: string;
  actor: string;
  organizationId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  requestId: string;
  result: "SUCCESS" | "WARNING" | "FAILURE";
  metadata: Record<string, unknown>; // Redacted: zero secrets, zero AI content
  hash: string;
  previousHash: string;
}
```

---

## 2. Zero-Secret Redaction
All payload metadata passes through `redactSensitiveData` to guarantee that API keys, passwords, bearer tokens, prompts, and completions are sanitized prior to persistence.
