# OsterdOps Enterprise Admin Console

The Admin Console empowers organization owners and administrators to manage members, enforce security baselines, inspect audit logs, and configure platform settings.

---

## 1. Key Routes

| Area | Route | Permissions Required | Description |
|---|---|---|---|
| **Members** | `/dashboard/members` | `members:read`, `members:manage` | Invite members, change role assignments, and revoke access. |
| **Audit Logs** | `/dashboard/audit-logs` | `audit:read` | Inspect tamper-evident SHA-256 hash-chained compliance logs. |
| **Security Posture** | `/dashboard/security` | `security:read` | Inspect security posture scores and credential scanning status. |
| **Security Events** | `/dashboard/security/events` | `security:read` | Review suspicious access attempts and token revocations. |
| **Org Settings** | `/dashboard/settings/organization` | `org:settings:read`, `org:settings:manage` | Configure legal names, default currency, and operational timezone. |
| **Security Settings** | `/dashboard/settings/security` | `org:settings:manage` | Session timeouts, API key lifetimes, and IP CIDR allowlists. |
| **Billing Settings** | `/dashboard/settings/billing` | `billing:manage` | Configure tax IDs, invoice receipt recipients, and auto-renewal. |

---

## 2. Role Hierarchy & Governance

$$\text{OWNER} \succ \text{ADMIN} \succ \text{DEVELOPER} \succ \text{VIEWER}$$

- **OWNER**: Full root control, billing ownership, and organization destruction privileges.
- **ADMIN**: Manages members, budgets, alerts, and scoped API keys.
- **DEVELOPER**: Creates API keys within assigned scopes and executes AI Gateway completions.
- **VIEWER**: Read-only telemetry, usage dashboards, and analytics inspection.
