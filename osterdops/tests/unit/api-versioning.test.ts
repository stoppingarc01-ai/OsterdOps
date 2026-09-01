/**
 * Unit Tests — API Versioning Engine & Resolution
 */

import {
  CURRENT_API_VERSION,
  SUPPORTED_API_VERSIONS,
  resolveApiVersion,
  isSupportedApiVersion,
  isDeprecatedApiVersion,
  applyVersionHeaders,
} from "@/lib/api/versioning";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export function runApiVersioningTests() {
  // 1. Current version constants
  assert(CURRENT_API_VERSION === "v1", "Current API version must be v1.");
  assert(SUPPORTED_API_VERSIONS.includes("v1"), "v1 must be in supported versions.");
  assert(isSupportedApiVersion("v1") === true, "v1 must be recognized as supported.");
  assert(isSupportedApiVersion("v99") === false, "Non-existent version must not be supported.");
  assert(isDeprecatedApiVersion("v1") === false, "v1 must not be marked as deprecated.");

  // 2. Version resolution from x-api-version header
  const headers = new Headers();
  headers.set("x-api-version", "v1");
  assert(resolveApiVersion(headers) === "v1", "Must resolve from x-api-version header.");

  // 3. Version resolution without 'v' prefix
  const headers2 = new Headers();
  headers2.set("accept-version", "1");
  assert(resolveApiVersion(headers2) === "v1", "Must normalize numeric version to v1.");

  // 4. Version resolution from URL path
  const req = new Request("https://api.osterdops.com/api/v1/projects");
  assert(resolveApiVersion(req) === "v1", "Must resolve from URL path.");

  // 5. Default fallback
  const emptyReq = new Request("https://api.osterdops.com/health");
  assert(resolveApiVersion(emptyReq) === "v1", "Must fallback to current stable version.");

  // 6. Applying version headers
  const outHeaders = new Headers();
  applyVersionHeaders(outHeaders, "v1");
  assert(outHeaders.get("x-api-version") === "v1", "Must apply x-api-version header.");
}
