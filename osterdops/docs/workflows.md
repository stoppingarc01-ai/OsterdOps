# OsterdOps — Workflow Engine & State Machine

## 1. Overview

The Workflow Engine manages multi-step execution pipelines with state transitions, pre-conditions, step-level retries, and execution timeouts.

---

## 2. Execution States

```
[ PENDING ] ──> [ RUNNING ] ──┬──> [ SUCCEEDED ]
                              ├──> [ FAILED ]
                              ├──> [ CANCELED ]
                              ├──> [ TIMED_OUT ]
                              └──> [ DEAD_LETTERED ]
```

---

## 3. Asynchronous Job Processing

All workflow steps execute asynchronously through the Phase 14 durable job queue. The AI Gateway is never blocked or delayed waiting for external workflow completion.
