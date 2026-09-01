# OsterdOps RBAC Frontend Behavior & Authorization Guarding (Phase 16)

---

## 1. Principles of Frontend RBAC
> [!IMPORTANT]
> Frontend RBAC controls serve exclusively as a UX optimization to prevent confusing navigation. All mutation actions and data fetching endpoints remain strictly guarded server-side by backend authorization handlers.

---

## 2. Role-to-UI Matrix

| UI Section / Action | OWNER | ADMIN | DEVELOPER | VIEWER |
| :--- | :---: | :---: | :---: | :---: |
| **Overview & Telemetry** | Full | Full | Full | Read-Only |
| **Budget Management & Pause** | Allowed | Allowed | Denied | Denied |
| **API Key Generation & Revocation** | Allowed | Allowed | Allowed (Scoped) | Denied |
| **Billing & Subscription Modification** | Allowed | Read-Only | Denied | Denied |
| **Security Posture & Audits** | Full | Full | Read-Only | Denied |
| **GDPR Deletion Request** | Allowed | Allowed | Denied | Denied |
