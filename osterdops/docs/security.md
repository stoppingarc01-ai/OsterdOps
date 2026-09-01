# OsterdOps Security & Enterprise Trust Policy (Phase 15)

This document details the security posture, authentication standards, RBAC, and threat protection policies of OsterdOps.

---

## 1. Authentication & API Key Lifecycle

- **Format**: `ost_<live|stg|test>_<48_hex_chars>` or `osk_<live|test>_<chars>` (192-bit cryptographic entropy).
- **Storage**: One-way SHA-256 digest (`keyHash`). Plaintext secret is displayed once upon creation and never stored.
- **Rotation**: Zero-downtime rotation generates a new key hash while allowing controlled decommissioning of the previous key.
- **Timing Defense**: Comparison via `crypto.timingSafeEqual`.

---

## 2. Granular Permissions & Role Hierarchy

| Permission | OWNER | ADMIN | DEVELOPER | VIEWER |
| :--- | :---: | :---: | :---: | :---: |
| `security:read` | Allowed | Allowed | Allowed | Denied |
| `security:manage` | Allowed | Allowed | Denied | Denied |
| `security:export` | Allowed | Allowed | Denied | Denied |
| `security:delete` | Allowed | Allowed | Denied | Denied |
| `system:manage` | Allowed | Allowed | Denied | Denied |
| `billing:manage` | Allowed | Denied | Denied | Denied |
| `integrations:manage` | Allowed | Allowed | Denied | Denied |

---

## 3. Data Protection & Zero-Prompt Guarantee
- Prompts, completions, chat messages, and authorization headers are never written to disk, database, logs, metrics, or telemetry.
- All operational logs pass through recursive sanitization in `src/lib/observability/redaction.ts`.
