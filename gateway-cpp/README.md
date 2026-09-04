# OsterdOps C++ High-Performance AI Gateway Microservice

> **Ultra-low latency, multi-threaded LLM proxy, budget governance, and FinOps telemetry engine written in modern C++17.**

---

## Key Features

1. **Sub-millisecond Proxy Overhead**: Eliminates Node.js V8 event loop and garbage collection pauses for mission-critical AI workloads.
2. **Nanodollar Cost Engine**: Deterministic integer arithmetic (`1 USD = 1,000,000,000 nanodollars`) for exact token-level financial accounting matching OsterdOps' core ledger.
3. **Hard & Soft Budget Governance**: Real-time pre-flight spending cap evaluation (`HTTP 429 BUDGET_EXCEEDED`) and atomic multi-tenant budget accumulation.
4. **Sliding-Window Rate Limiting**: Microsecond-precision thread-safe sliding window request throttling per API key and project.
5. **Provider Circuit Breaker**: Auto-trips to `OPEN` on consecutive upstream provider errors and tests health via `HALF_OPEN` canary probes.
6. **Streaming & Non-Streaming**: First-class Server-Sent Events (SSE) pass-through streaming support.
7. **Zero-Dependency Core**: Clean, modular C++ implementation with cross-platform native sockets (Winsock2 on Windows, POSIX on Linux/macOS).

---

## Architecture Overview

```
                      +-----------------------------+
                      |   Client Application / SDK   |
                      +-----------------------------+
                                     |
                                     v HTTP/SSE
+-------------------------------------------------------------------------+
|                      OsterdOps C++ AI Gateway                           |
|                                                                         |
|   1. API Key Auth & RBAC        ---> [HTTP 401 Unauthorized]            |
|   2. Sliding Window Rate Limit   ---> [HTTP 429 Too Many Requests]       |
|   3. Hard Budget Pre-flight     ---> [HTTP 429 Budget Exceeded]         |
|   4. Circuit Breaker Inspection ---> [HTTP 503 Provider Unavailable]    |
|                                                                         |
|                                 |                                       |
|                                 v Forward                               |
|                  +------------------------------+                       |
|                  | Upstream AI Provider Dispatch|                       |
|                  +------------------------------+                       |
|                   /             |              \                        |
|                  v              v               v                       |
|              [OpenAI]      [Anthropic]      [Gemini]                    |
|                                                                         |
|   5. Nanodollar Cost Calc       ---> Exact USD Spend Ledger             |
|   6. Budget Threshold Alerts   ---> Multi-channel Notification Events  |
|   7. Async Telemetry Collector ---> In-memory ring buffer & /metrics    |
+-------------------------------------------------------------------------+
```

---

## Directory Structure

```
gateway-cpp/
├── CMakeLists.txt              # CMake build specification
├── Dockerfile                  # Multi-stage lightweight Alpine container
├── build.bat                   # Windows batch build helper
├── build.ps1                   # Windows PowerShell build script
├── build.sh                    # Linux/macOS build script
├── config/
│   └── gateway.json            # Gateway runtime configuration
├── include/
│   └── osterdops/
│       ├── types.hpp           # Common data structures & enums
│       ├── cost_engine.hpp     # Pricing registry & nanodollar arithmetic
│       ├── budget_manager.hpp  # Multi-tenant budget manager
│       ├── rate_limiter.hpp    # Sliding window rate limiter
│       ├── circuit_breaker.hpp # Upstream failure state machine
│       ├── upstream_client.hpp # Provider forwarder & streaming
│       ├── telemetry.hpp       # Telemetry metrics accumulator
│       ├── json_helper.hpp     # Zero-dependency JSON extraction
│       └── gateway_server.hpp  # HTTP server orchestration
├── src/
│   ├── cost_engine.cpp
│   ├── budget_manager.cpp
│   ├── rate_limiter.cpp
│   ├── circuit_breaker.cpp
│   ├── upstream_client.cpp
│   ├── telemetry.cpp
│   ├── gateway_server.cpp
│   └── main.cpp                # CLI entry point
└── tests/
    └── test_gateway.js         # End-to-end integration test suite
```

---

## Quick Start

### Option 1: Direct Local Build

#### Windows (with MinGW or MSVC)
```powershell
.\build.ps1
# or
build.bat
```

#### Linux / macOS
```bash
chmod +x build.sh
./build.sh
```

### Option 2: Docker Container

```bash
docker build -t osterdops-gateway-cpp .
docker run -p 8080:8080 osterdops-gateway-cpp
```

### Option 3: Standard CMake

```bash
mkdir build && cd build
cmake -DCMAKE_BUILD_TYPE=Release ..
cmake --build . --config Release
./osterdops_gateway --port 8080 --threads 8
```

---

## Endpoints

### 1. Chat Completions (OpenAI Compatible)
* **Route**: `POST /api/v1/gateway/chat/completions`
* **Headers**:
  * `Authorization: Bearer <API_KEY>` (or `x-osterdops-api-key: <API_KEY>`)
  * `x-project-id: <PROJECT_ID>` (optional)
  * `x-organization-id: <ORG_ID>` (optional)
* **Payload**:
```json
{
  "model": "gpt-4o",
  "messages": [
    { "role": "user", "content": "Explain AI cost governance." }
  ],
  "stream": false
}
```
* **Response Headers**:
  * `x-osterdops-request-id`: Correlation ID
  * `x-osterdops-latency-ms`: Round-trip proxy latency in ms
  * `x-osterdops-cost-usd`: Exact USD expense calculated with nanodollar precision
  * `x-ratelimit-remaining`: Remaining requests in current sliding window

### 2. FinOps Telemetry Metrics
* **Route**: `GET /api/v1/metrics`
* **Response**:
```json
{
  "total_requests": 1420,
  "successful_requests": 1412,
  "failed_requests": 8,
  "rate_limited_requests": 5,
  "budget_blocked_requests": 3,
  "total_input_tokens": 58400,
  "total_output_tokens": 24200,
  "total_cached_tokens": 12000,
  "total_spend_usd": 0.384210,
  "total_savings_usd": 0.045000,
  "avg_latency_ms": 14.2
}
```

### 3. Health & Readiness
* `GET /api/v1/health` -> `{"status":"healthy","service":"osterdops-gateway-cpp"}`
* `GET /api/v1/ready` -> `{"ready":true,"active_providers":["openai","anthropic","gemini","deepseek","ollama"]}`

---

## Running Verification Tests

While the gateway is running on `http://localhost:8080`, execute the verification suite:

```bash
node tests/test_gateway.js
```
