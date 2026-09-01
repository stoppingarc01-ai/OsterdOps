# OsterdOps — Declarative Automation Rule Engine

## 1. Overview

The OsterdOps Automation Engine provides a declarative, safe event-condition-action rule execution pipeline (`WHEN event IF conditions THEN actions`).

---

## 2. Rule Structure

```json
{
  "name": "Notify Slack on High Spend Threshold",
  "eventTrigger": "budget.threshold_reached",
  "conditions": [
    {
      "field": "data.thresholdPercent",
      "operator": "greater_than_or_equal",
      "value": 80
    }
  ],
  "actions": [
    {
      "type": "SEND_NOTIFICATION",
      "targetId": "slack_ops_channel"
    }
  ]
}
```

---

## 3. Safe Condition Operators

- `equals`, `not_equals`
- `greater_than`, `less_than`
- `greater_than_or_equal`, `less_than_or_equal`
- `contains`, `in`, `exists`

All evaluations avoid arbitrary Javascript expression execution and protect against prototype pollution (`__proto__`, `constructor`).
