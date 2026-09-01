/**
 * OsterdOps — API Versioning & Lifecycle Engine (Phase 18)
 * Provides version negotiation, deprecation headers, and backward-compatible route mapping.
 */

export const CURRENT_API_VERSION = "v1";
export const SUPPORTED_API_VERSIONS: readonly string[] = ["v1"] as const;
export const DEPRECATED_API_VERSIONS: readonly string[] = [] as const;

export interface ApiVersionMetadata {
  version: string;
  status: "stable" | "preview" | "deprecated";
  releaseDate: string;
  deprecationDate?: string;
  sunsetDate?: string;
  documentationUrl: string;
}

export const API_VERSION_REGISTRY: Record<string, ApiVersionMetadata> = {
  v1: {
    version: "v1",
    status: "stable",
    releaseDate: "2026-01-01",
    documentationUrl: "https://docs.osterdops.com/api/v1",
  },
};

/**
 * Extracts and resolves the requested API version from headers or URL path.
 */
export function resolveApiVersion(request: Request | Headers): string {
  const headers = request instanceof Request ? request.headers : request;

  // 1. Check explicit headers: Accept-Version or x-api-version
  const explicitVersion =
    headers.get("x-api-version")?.trim().toLowerCase() ||
    headers.get("accept-version")?.trim().toLowerCase();

  if (explicitVersion) {
    const normalized = explicitVersion.startsWith("v") ? explicitVersion : `v${explicitVersion}`;
    return normalized;
  }

  // 2. Check URL path if request is a Request instance
  if (request instanceof Request) {
    const url = new URL(request.url);
    const match = url.pathname.match(/\/api\/(v\d+)/);
    if (match && match[1]) {
      return match[1].toLowerCase();
    }
  }

  // 3. Fallback to current stable version
  return CURRENT_API_VERSION;
}

/**
 * Validates whether an API version string is currently supported.
 */
export function isSupportedApiVersion(version: string): boolean {
  const norm = version.trim().toLowerCase();
  return SUPPORTED_API_VERSIONS.includes(norm);
}

/**
 * Validates whether an API version is deprecated.
 */
export function isDeprecatedApiVersion(version: string): boolean {
  const norm = version.trim().toLowerCase();
  return DEPRECATED_API_VERSIONS.includes(norm);
}

/**
 * Attaches standard versioning and deprecation headers to response headers.
 */
export function applyVersionHeaders(headers: Headers, version = CURRENT_API_VERSION): void {
  headers.set("x-api-version", version);

  const meta = API_VERSION_REGISTRY[version];
  if (meta?.status === "deprecated") {
    headers.set("Deprecation", meta.deprecationDate || "true");
    if (meta.sunsetDate) {
      headers.set("Sunset", meta.sunsetDate);
    }
    headers.set("Link", `<${meta.documentationUrl}>; rel="deprecation"`);
  }
}
