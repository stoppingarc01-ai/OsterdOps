# OsterdOps API Versioning Strategy

OsterdOps implements an explicit versioning strategy that guarantees non-breaking evolutions for enterprise clients.

---

## 1. Version Identifiers

- **Current Stable Version**: `v1`
- **Supported Versions**: `["v1"]`
- **Deprecated Versions**: `[]`

---

## 2. Deprecation Schedule & Lifecycle Policy

1. **Active**: Fully supported with new capabilities.
2. **Deprecated**: Marked with RFC 8594 `Deprecation` and `Sunset` headers for a minimum of 6 months prior to removal.
3. **Sunset**: Inactive. Returns HTTP 400 `UNSUPPORTED_VERSION`.
