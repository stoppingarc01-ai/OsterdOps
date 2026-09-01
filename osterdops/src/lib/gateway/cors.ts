/**
 * OsterdOps — AI Gateway CORS Configuration & Origin Validator
 * Provides fine-grained origin validation instead of an unconstrained wildcard in production.
 */

/**
 * Resolves allowed CORS headers for an incoming request.
 */
export function resolveCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin") || "";
  const configuredOrigins = (process.env.OSTERDOPS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim().toLowerCase())
    .filter(Boolean);

  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type, x-api-key, x-osterdops-request-id, x-request-id",
    "Access-Control-Max-Age": "86400",
  };

  // If no specific origins are configured:
  // - In development / default mode, allow origin reflection with Vary header for machine-to-machine integrations.
  // - In production with OSTERDOPS_ALLOWED_ORIGINS specified, strictly whitelist matching origins.
  if (configuredOrigins.length > 0) {
    if (configuredOrigins.includes("*")) {
      headers["Access-Control-Allow-Origin"] = "*";
    } else if (origin && configuredOrigins.includes(origin.toLowerCase())) {
      headers["Access-Control-Allow-Origin"] = origin;
      headers["Vary"] = "Origin";
    }
  } else {
    // Default safe behavior: allow server-to-server and reflect client origin if present
    if (origin) {
      headers["Access-Control-Allow-Origin"] = origin;
      headers["Vary"] = "Origin";
    } else {
      headers["Access-Control-Allow-Origin"] = "*";
    }
  }

  return headers;
}
