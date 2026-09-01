# OsterdOps — Production Performance Budgets & SLO Specification

## Executive Summary
This document formalizes the production latency budgets, throughput thresholds, memory allocation boundaries, and Service Level Objectives (SLOs) for OsterdOps AI Gateway and LLM Cost-Governance platform (Phase 27).

---

## 1. Gateway Pipeline Latency Budgets (SLOs)

All gateway proxy operations operate within deterministic internal latency budgets to ensure upstream provider responses dominate overall turnaround time.

| Pipeline Stage | Target Latency (P50) | Target Latency (P95) | Target Latency (P99) | Hard Budget Cap |
| :--- | :--- | :--- | :--- | :--- |
| **API Key Authentication (Cached)** | `< 0.05 ms` | `< 0.20 ms` | `< 0.50 ms` | `2.0 ms` |
| **API Key Authentication (Cold DB)** | `< 15.0 ms` | `< 35.0 ms` | `< 60.0 ms` | `100.0 ms` |
| **Pre-Flight Rate Limiting** | `< 0.01 ms` | `< 0.05 ms` | `< 0.10 ms` | `1.0 ms` |
| **Pre-Flight Budget Enforcement (Cached)** | `< 0.02 ms` | `< 0.10 ms` | `< 0.30 ms` | `2.0 ms` |
| **Provider Model Resolution & Validation** | `< 0.01 ms` | `< 0.03 ms` | `< 0.08 ms` | `0.5 ms` |
| **Exact Token Cost Calculation** | `< 0.01 ms` | `< 0.03 ms` | `< 0.06 ms` | `0.5 ms` |
| **HMAC-SHA256 Audit Chaining** | `< 0.02 ms` | `< 0.08 ms` | `< 0.15 ms` | `1.0 ms` |
| **Internal Gateway Overhead (Total)** | **`< 0.50 ms`** | **`< 2.00 ms`** | **`< 5.00 ms`** | **`10.0 ms`** |

---

## 2. Platform Throughput Capacities (Micro-Benchmarks)

Measured micro-benchmark throughputs on standardized runtime execution:

- **API Key SHA-256 Hashing:** `413,291 ops/sec` (~2.4 µs/op)
- **Timing-Safe Hash Comparison:** `1,312,853 ops/sec` (~0.76 µs/op)
- **Provider Model Resolution (O(1)):** `1,972,776 ops/sec` (~0.51 µs/op)
- **Model Capability Lookup & Validation:** `2,428,953 ops/sec` (~0.41 µs/op)
- **Exact Token Cost Calculation:** `711,415 ops/sec` (~1.41 µs/op)
- **Sliding-Window Rate Limit Check:** `1,015,228 ops/sec` (~0.98 µs/op)
- **Budget Threshold & Hard Limit Math:** `678,495 ops/sec` (~1.47 µs/op)
- **Cryptographic Audit Hash Chaining:** `90,911 ops/sec` (~11.0 µs/op)
- **OpenAPI 3.1.0 Specification Memoized Retrieval:** `13,698,630 ops/sec` (~0.07 µs/op)

---

## 3. Memory & Resource Allocation Limits

To guarantee deterministic memory bounds and prevent node process out-of-memory crashes under adverse conditions:

1. **In-Memory Cache Registry:**
   - `apiKeyAuth`: Bounded to 5,000 entries (~2.5 MB).
   - `budgetPreflight`: Bounded to 2,000 entries (~1.0 MB).
   - `providerCredentials`: Bounded to 1,000 entries (~0.5 MB).
   - `openApiSpec`: 1 cached spec document (~0.05 MB).
2. **Rate Limiting Provider:**
   - Bounded to 50,000 active sliding window buckets (~4.0 MB). Automatic chunked eviction on overflow.
3. **Operational Metrics Registry:**
   - Bounded to 2,000 unique metric/label combinations (~0.8 MB). Automatic oldest key pruning on cardinality overflow.
4. **Durable In-Memory Job Queue:**
   - Retained historical jobs bounded to 10,000 completed records (~5.0 MB). Older completed jobs pruned on ingest.

---

## 4. Query Performance Budgets

- **Overview Analytics Queries:** Response time `< 120 ms` for 100k events via parallelized `Promise.all` subcollection reads.
- **Latency Percentile Computations:** In-memory sorted percentile derivation `< 5 ms` for 10,000 samples.
- **Admin Governance Dashboards:** SSR / static pre-rendering `< 50 ms` load times across all 118 application routes.
