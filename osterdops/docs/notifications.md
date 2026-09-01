# OsterdOps Notification Engine & Preferences (Phase 12)

The **OsterdOps Notification Engine** provides a multi-channel notification abstraction for in-app logging, email alerts, and future webhook integrations (Slack, Discord, PagerDuty).

---

## 1. Notification Channels & Architecture

```
Alert Triggered / Budget Exceeded
       ↓
Notification Service (src/lib/notifications/notification.service.ts)
       ↓
Check User / Org Preferences (organizations/{orgId}/notificationSettings/{userId})
       ↓
┌───────────────────────┬────────────────────────┐
│ In-App Event Emitter  │ Email Delivery Adapter │
│ (src/lib/.../emitter) │ (Pluggable SES/Resend) │
└───────────────────────┴────────────────────────┘
```

---

## 2. Notification Preferences Schema

Firestore Path: `organizations/{organizationId}/notificationSettings/{userId}`

```typescript
export interface NotificationPreferences {
  organizationId: string;
  userId: string;
  budgetThresholdAlerts: boolean; // default: true
  budgetExceededAlerts: boolean;  // default: true
  emailEnabled: boolean;           // default: true
  inAppEnabled: boolean;           // default: true
  emailRecipient?: string;
  slackWebhookUrl?: string;
  discordWebhookUrl?: string;
  updatedAt: string;
}
```

---

## 3. REST API Endpoints

| Method | Path | Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/notifications/preferences` | `notifications:read` | Retrieve user notification preferences |
| `PATCH` | `/api/v1/notifications/preferences` | `notifications:read` | Update user notification preferences |

---

## 4. Pluggable Email Provider Interface

The notification engine utilizes a provider-agnostic interface:
```typescript
export interface EmailDeliveryResult {
  sent: boolean;
  provider: "simulation" | "resend" | "sendgrid" | "ses";
  messageId: string;
  recipient?: string;
}
```
Production deployments can plug in real API keys for Resend, SendGrid, or AWS SES without altering the core budget or alert engine.
