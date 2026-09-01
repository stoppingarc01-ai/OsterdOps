# OsterdOps API Security & Zero-Trust Policies

OsterdOps enforces strict multi-tenant isolation, cryptographic key management, and zero-content persistence.

---

## 1. Zero-Content Retention Guarantee

Neither prompts, completions, system instructions, authorization tokens, nor upstream provider credentials are ever stored in database collections, server logs, or telemetry records.

---

## 2. API Key Security & Single-Reveal Secrets

- Plaintext secrets are generated in memory and returned **strictly once** upon key creation.
- Keys are hashed with SHA-256 before storage in Firestore.
- During gateway authentication, keys are evaluated using timing-safe comparisons to prevent timing attacks.

---

## 3. Scopes & Least Privilege

API keys support fine-grained scopes (`gateway:invoke`, `projects:read`, `budgets:write`, etc.). The effective authorization is calculated as:

$$\text{Effective Permissions} = \text{User Role Permissions} \cap \text{Organization Permissions} \cap \text{API Key Scopes}$$

Privilege escalation is mathematically impossible.
