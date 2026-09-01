# API Keys & Scopes Management

OsterdOps provides fine-grained, cryptographically secure API keys.

---

## 1. Key Scopes Catalog

| Scope | Description |
|---|---|
| `gateway:invoke` | Execute AI chat completions via gateway proxy. |
| `projects:read` | List and inspect projects. |
| `projects:write` | Create, update, and archive projects. |
| `keys:read` | View API key metadata (secrets omitted). |
| `keys:write` | Issue, rotate, and revoke API keys. |
| `usage:read` | Query token usage and telemetry. |
| `analytics:read` | Query cost analytics, latency percentiles, and KPIs. |
| `budgets:read` | Inspect active spending budgets and limits. |
| `budgets:write` | Create, pause, and update budgets. |
| `billing:read` | Inspect subscription status and invoices. |
| `alerts:read` | List threshold alerts and security notices. |
| `alerts:write` | Acknowledge and resolve alerts. |
| `security:read` | Inspect security posture scores and audit logs. |

---

## 2. Privilege Escalation Prevention

An API key can NEVER perform an action that exceeds the permissions of the authenticated role:

$$\text{Effective Permissions} = \min(\text{Role Permissions}, \text{Organization Permissions}, \text{Key Scopes})$$
