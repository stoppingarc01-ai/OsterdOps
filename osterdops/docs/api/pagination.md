# Cursor-Based API Pagination

OsterdOps uses cursor-based pagination for high-volume collections to ensure deterministic ordering, stable performance, and tenant isolation.

---

## 1. Query Parameters

| Parameter | Type | Default | Max | Description |
|---|---|---|---|---|
| `limit` | integer | `20` | `100` | Number of items to return in the current page. |
| `cursor` | string | `null` | - | Opaque cursor string returned from the previous page. |

---

## 2. Response Structure

```json
{
  "success": true,
  "data": [
    { "id": "proj_01j9a8b1", "name": "Production API", "createdAt": "2026-08-29T16:00:00Z" }
  ],
  "meta": {
    "pagination": {
      "limit": 20,
      "nextCursor": "ZXlKaGJHY2lPaUpTVXpVTklpd2lhV05wW...",
      "hasMore": true,
      "totalCount": 45
    }
  },
  "requestId": "req_1788022596_19a"
}
```

---

## 3. Iterating Across Pages

1. Send initial request without `cursor`.
2. Extract `meta.pagination.nextCursor` from the response.
3. If `meta.pagination.hasMore` is `true`, pass `cursor={nextCursor}` in the subsequent request.
4. Repeat until `hasMore` is `false`.
