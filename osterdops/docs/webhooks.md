# OsterdOps Webhooks & Signature Verification

OsterdOps delivers real-time HTTP POST notifications when key budget, billing, or security events occur in your organization.

---

## 1. Webhook Request Headers

Every webhook dispatch includes standard authentication and verification headers:

```http
POST /your-webhook-endpoint HTTP/1.1
Host: your-server.com
Content-Type: application/json
x-osterdops-signature: t=1788022596,v1=94f2a188c9f4d1e204b789129841ad02e482...
x-osterdops-event: budget.threshold_reached
x-osterdops-delivery-id: del_01j9a8b1
```

---

## 2. Signature Verification (HMAC-SHA256)

To protect against spoofing, tamper attacks, and replay attacks, verify the HMAC signature:

### Node.js Verification Example

```typescript
import crypto from "crypto";

export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string
): boolean {
  const parts = signatureHeader.split(",");
  const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2);
  const signature = parts.find((p) => p.startsWith("v1="))?.slice(3);

  if (!timestamp || !signature) return false;

  // 1. Replay attack protection (5 minute tolerance)
  const currentSec = Math.floor(Date.now() / 1000);
  if (Math.abs(currentSec - parseInt(timestamp, 10)) > 300) {
    return false;
  }

  // 2. Compute expected HMAC
  const signedPayload = `${timestamp}.${rawBody}`;
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");

  // 3. Constant-time comparison
  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expectedSig, "hex")
  );
}
```

---

## 3. Webhook Delivery & Retries

- **Timeout**: OsterdOps waits 15 seconds for your endpoint to respond with an HTTP `2xx` status code.
- **Retry Policy**: If your endpoint returns a non-2xx status code or times out, OsterdOps retries with exponential backoff:
  - Attempt 1: Immediate
  - Attempt 2: +15 minutes
  - Attempt 3: +1 hour
  - Attempt 4: +6 hours
  - Attempt 5: +24 hours
