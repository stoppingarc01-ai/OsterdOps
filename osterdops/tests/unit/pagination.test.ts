/**
 * Unit Tests — Cursor-Based Pagination Engine & Tenant Isolation
 */

import {
  normalizeLimit,
  encodeCursor,
  decodeCursor,
  paginateArray,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "@/lib/api/pagination";
import { BadRequestError } from "@/lib/api/errors";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export function runPaginationTests() {
  // 1. Limit normalization
  assert(normalizeLimit(undefined) === DEFAULT_PAGE_SIZE, "Undefined limit must return default.");
  assert(normalizeLimit(-5) === DEFAULT_PAGE_SIZE, "Negative limit must return default.");
  assert(normalizeLimit("10") === 10, "String limit must parse correctly.");
  assert(normalizeLimit(500) === MAX_PAGE_SIZE, "Excessive limit must cap to MAX_PAGE_SIZE.");

  // 2. Cursor encoding and decoding
  const orgId = "org_test_123";
  const cursorStr = encodeCursor({ id: "item_99", organizationId: orgId });
  assert(typeof cursorStr === "string" && cursorStr.length > 0, "Cursor must be non-empty string.");

  const decoded = decodeCursor(cursorStr, orgId);
  assert(decoded.id === "item_99", "Decoded cursor ID must match.");
  assert(decoded.organizationId === orgId, "Decoded cursor orgId must match.");

  // 3. Cross-tenant cursor tampering rejection
  let threwCrossTenant = false;
  try {
    decodeCursor(cursorStr, "org_another_tenant_999");
  } catch (err) {
    threwCrossTenant = true;
    assert(err instanceof BadRequestError, "Cross-tenant cursor must throw BadRequestError.");
  }
  assert(threwCrossTenant, "Must reject cross-tenant cursor.");

  // 4. In-memory array pagination
  const sampleItems = Array.from({ length: 45 }, (_, i) => ({
    id: `item_${i + 1}`,
    name: `Item ${i + 1}`,
    organizationId: orgId,
    createdAt: new Date(Date.now() - i * 1000).toISOString(),
  }));

  // Page 1 (limit 20)
  const page1 = paginateArray(sampleItems, { limit: 20 }, orgId);
  assert(page1.items.length === 20, "Page 1 must contain 20 items.");
  assert(page1.meta.hasMore === true, "Page 1 must have more items.");
  assert(Boolean(page1.meta.nextCursor), "Page 1 must produce a nextCursor.");

  // Page 2 using cursor
  const page2 = paginateArray(sampleItems, { limit: 20, cursor: page1.meta.nextCursor! }, orgId);
  assert(page2.items.length === 20, "Page 2 must contain 20 items.");
  assert(page2.items[0].id === "item_21", "Page 2 first item must be item_21.");
  assert(page2.meta.hasMore === true, "Page 2 must have more items.");

  // Page 3 (final 5 items)
  const page3 = paginateArray(sampleItems, { limit: 20, cursor: page2.meta.nextCursor! }, orgId);
  assert(page3.items.length === 5, "Page 3 must contain remaining 5 items.");
  assert(page3.meta.hasMore === false, "Page 3 must not have more items.");
  assert(page3.meta.nextCursor === null, "Final page nextCursor must be null.");
}
