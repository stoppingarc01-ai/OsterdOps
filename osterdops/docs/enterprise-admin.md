# OsterdOps — Enterprise Administration & Organization Control Center

## 1. Overview
The **OsterdOps Enterprise Administration & Organization Control Center** provides an executive governance interface for managing organization identity, members, roles, projects, budgets, security posture, and platform health.

---

## 2. Navigation Architecture

| Section | Route | Description |
|---|---|---|
| **Overview** | `/admin` | Executive KPI overview, spend vs budget gauge, active alerts, and security score. |
| **Organization** | `/admin/organization` | Organization profile, domain identity, tenant isolation, and default bounds. |
| **Members & Roles** | `/admin/members` | Team member list, invitations, role modifications (`OWNER`, `ADMIN`, `DEVELOPER`, `VIEWER`). |
| **Projects** | `/admin/projects` | Workspace administration, project spend limits, and archiving. |
| **API Keys** | `/admin/api-keys` | Organization-wide API key rotation, revocation, and zero-plaintext storage. |
| **Budgets** | `/admin/budgets` | Proactive budget limits, threshold alerting (50%, 80%, 100%), and hard cap enforcement. |
| **Alerts** | `/admin/alerts` | Alert center with active, acknowledged, and resolved state workflows. |
| **Security** | `/admin/security` | 100/100 Grade A+ security posture verification, compliance controls, and event log. |
| **Audit Logs** | `/admin/audit` | Tamper-evident SHA-256 hash-chained audit log inspection with zero-prompt guarantees. |
| **Usage & Costs** | `/admin/usage` | Token processing metrics, provider share breakdown, and prompt cache savings. |
| **System Health** | `/admin/system` | Real-time status probes across Gateway, Database, Rate Limiter, and AI Providers. |
| **Settings** | `/admin/settings` | Enterprise parameters, encryption keystore rotation, and webhook destinations. |

---

## 3. Security & Multi-Tenant Guarantees
- **Strict Server-Side RBAC**: Every administrative mutation is verified on the backend before execution.
- **Tenant Isolation**: Queries are partitioned by authenticated `organizationId`.
- **Zero-Plaintext Keystore**: Existing API keys are stored solely as SHA-256 hashes.
- **Zero-Prompt Persistence**: Telemetry and logs never retain prompts, messages, or AI completions.
