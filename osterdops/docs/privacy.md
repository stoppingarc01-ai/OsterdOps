# OsterdOps Privacy, GDPR & Subject Rights Guide (Phase 15)

---

## 1. Privacy Principles
1. **Minimization**: OsterdOps processes and stores only numerical tokens, request latency, model identifiers, and financial metadata necessary for AI proxying and spend analytics.
2. **Zero Content Storage**: User prompt text and AI model completion texts are strictly ephemeral and never stored.
3. **Pseudonymization**: Client IP addresses are pseudonymized into salted HMAC-SHA256 digests (`iph_...`).

---

## 2. Subject Access Request (GDPR Art. 20 Export)
Organizations can generate a structured privacy export manifest via:
```http
GET /api/v1/security/export?organizationId={orgId}
```
Requires `security:export` (OWNER or ADMIN).

---

## 3. Right to Erasure (GDPR Art. 17 Deletion)
Initiate a staged data deletion request via:
```http
POST /api/v1/security/deletion-request
{
  "organizationId": "org_123",
  "reason": "GDPR Account Closure"
}
```
*Note*: Statutory tax and billing records are subject to legal hold retention requirements and are preserved accordingly.
