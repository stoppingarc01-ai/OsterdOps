# OsterdOps API Playground Guide

## 1. Overview

The **OsterdOps API Playground** (`/dashboard/developers/playground` and `/developers/playground`) is an interactive development environment for testing upstream AI models through the OsterdOps AI Gateway.

---

## 2. Supported Features

- **Dynamic Model Catalog**: Supports OpenAI (`gpt-4o`, `gpt-4o-mini`, `o1`, `o3-mini`), Anthropic (`claude-3-5-sonnet`, `claude-3-5-haiku`), and Google Gemini (`gemini-1.5-pro`, `gemini-1.5-flash`, `gemini-2.0-flash`).
- **Real-Time Streaming**: Test low-latency Server-Sent Events (SSE) token delivery.
- **Hyperparameters**: Fine-tune `temperature`, `max_tokens`, and `top_p`.
- **Telemetry HUD**: Real-time inspection of roundtrip latency, prompt tokens, completion tokens, prompt cache tokens, and computed cost.
- **Code Export**: Instant copy of cURL, TypeScript SDK, and Python requests.
- **Zero-Persistence Guarantee**: In-memory execution ensures zero retention of prompts and responses.
