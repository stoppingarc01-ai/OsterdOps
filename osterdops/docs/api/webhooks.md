# Developer Webhooks & Signed Delivery

OsterdOps delivers real-time notifications when key governance, budget, billing, or security events occur.

---

## 1. Supported Event Types

- `budget.threshold_reached`: Spend reached configured percentage (e.g. 80%).
- `budget.exceeded`: Monthly spend cap reached under hard enforcement.
- `alert.created`: New operational or threshold alert generated.
- `alert.resolved`: Alert acknowledged and resolved.
- `billing.subscription.updated`: Plan upgraded, downgraded, or canceled.
- `billing.invoice.created`: New monthly invoice generated.
- `billing.invoice.paid`: Stripe checkout invoice paid successfully.
- `security.alert`: Suspicious credential or security incident detected.
- `gateway.request.failed`: Upstream provider failure or circuit tripped.

---

## 2. Signature Verification (HMAC-SHA256)

Every webhook request includes an `x-osterdops-signature` header:

```http
x-osterdops-signature: t=1788022596,v1=94f2a188c9f4d1e204b789129841ad02e482...
```

Verify in Node.js:

```typescript
import crypto from "crypto";

export function verifyWebhook(rawBody: string, header: string, secret: string): boolean {
  const parts = header.split(",");
  const t = parts.find((p) => p.startsWith("t="))?.slice(2);
  const v1 = parts.find((p) => p.startsWith("v1="))?.slice(3);
  if (!t || !v1) return false;

  // 5 minute tolerance
  if (Math.abs(Math.floor(Date.now() / 1000) - parseInt(t, 10)) > 300) return false;

  const expected = crypto.createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(v1, "hex"), Buffer.from(expected, "hex"));
}
```
