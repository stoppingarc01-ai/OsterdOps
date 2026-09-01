# OsterdOps OpenAPI 3.1.0 Specification

The official machine-readable OpenAPI specification for OsterdOps is located at:

📁 `docs/openapi.yaml`

---

## 1. Specification Overview

- **Specification Version**: OpenAPI 3.1.0
- **API Version**: 1.0.0
- **Base Servers**:
  - Production: `https://api.osterdops.com`
  - Staging: `https://staging-api.osterdops.com`
  - Local Dev: `http://localhost:3000`

---

## 2. Using the OpenAPI Spec

### Client Code Generation

You can generate client SDKs in Python, Go, Java, or C# using standard openapi-generator tools:

```bash
# Generate Python client
openapi-generator-cli generate \
  -i docs/openapi.yaml \
  -g python \
  -o sdk-python/

# Generate Go client
openapi-generator-cli generate \
  -i docs/openapi.yaml \
  -g go \
  -o sdk-go/
```

### Postman / Insomnia Import

Import `docs/openapi.yaml` directly into Postman or Insomnia to generate pre-configured request collections with parameter types, example payloads, and security schemes.

---

## 3. Strict Schema Parity Policy

The specification strictly mirrors:
- `src/types/backend.ts` data contracts
- `src/lib/gateway/types.ts` request and response models
- `src/lib/api/response.ts` standardized JSON error and success envelopes
