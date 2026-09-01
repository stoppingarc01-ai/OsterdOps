/**
 * OsterdOps — Cursor-Based Pagination Engine (Phase 18)
 * Tenant-safe cursor serialization, limit validation, and metadata generators.
 */

import { BadRequestError } from "./errors";

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export interface PaginationParams {
  limit?: number;
  cursor?: string;
}

export interface PaginationMeta {
  limit: number;
  nextCursor: string | null;
  hasMore: boolean;
  totalCount?: number;
}

export interface DecodedCursor {
  id: string;
  timestamp?: string | number;
  organizationId: string;
}

/**
 * Validates and normalizes request limit parameter.
 */
export function normalizeLimit(rawLimit?: string | number | null): number {
  if (rawLimit === undefined || rawLimit === null || rawLimit === "") {
    return DEFAULT_PAGE_SIZE;
  }
  const parsed = typeof rawLimit === "number" ? rawLimit : parseInt(rawLimit, 10);
  if (isNaN(parsed) || parsed <= 0) {
    return DEFAULT_PAGE_SIZE;
  }
  return Math.min(parsed, MAX_PAGE_SIZE);
}

/**
 * Encodes cursor payload to a URL-safe Base64 string.
 */
export function encodeCursor(cursorData: DecodedCursor): string {
  const json = JSON.stringify(cursorData);
  return Buffer.from(json, "utf-8").toString("base64url");
}

/**
 * Decodes and validates a cursor string.
 * Enforces tenant isolation: cursor must match caller organizationId.
 */
export function decodeCursor(
  rawCursor: string,
  expectedOrgId: string,
  requestId?: string
): DecodedCursor {
  if (!rawCursor || typeof rawCursor !== "string") {
    throw new BadRequestError("Invalid cursor format: cursor must be a non-empty string.", {
      requestId,
    });
  }

  try {
    const json = Buffer.from(rawCursor, "base64url").toString("utf-8");
    const decoded = JSON.parse(json) as DecodedCursor;

    if (!decoded.id || typeof decoded.id !== "string") {
      throw new Error("Missing cursor id");
    }

    if (!decoded.organizationId || decoded.organizationId !== expectedOrgId) {
      throw new Error("Cursor organization mismatch");
    }

    return decoded;
  } catch {
    throw new BadRequestError("Malformed, tampered, or cross-tenant pagination cursor.", {
      requestId,
      details: { cursor: "[INVALID]" },
    });
  }
}

/**
 * Paginates an in-memory array of items safely using cursor boundaries.
 */
export function paginateArray<T extends { id: string; organizationId?: string; createdAt?: unknown }>(
  items: T[],
  params: PaginationParams,
  expectedOrgId: string,
  requestId?: string
): { items: T[]; meta: PaginationMeta } {
  const limit = normalizeLimit(params.limit);
  let startIndex = 0;

  if (params.cursor) {
    const decoded = decodeCursor(params.cursor, expectedOrgId, requestId);
    const foundIndex = items.findIndex((item) => item.id === decoded.id);
    if (foundIndex >= 0) {
      startIndex = foundIndex + 1;
    }
  }

  const paginatedSlice = items.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < items.length;

  let nextCursor: string | null = null;
  if (hasMore && paginatedSlice.length > 0) {
    const lastItem = paginatedSlice[paginatedSlice.length - 1];
    const ts = typeof lastItem.createdAt === "string" || typeof lastItem.createdAt === "number"
      ? lastItem.createdAt
      : String(lastItem.createdAt || "");

    nextCursor = encodeCursor({
      id: lastItem.id,
      timestamp: ts,
      organizationId: expectedOrgId,
    });
  }

  return {
    items: paginatedSlice,
    meta: {
      limit,
      nextCursor,
      hasMore,
      totalCount: items.length,
    },
  };
}
