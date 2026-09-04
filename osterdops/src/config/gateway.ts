/**
 * OsterdOps — AI Gateway Configuration
 * Dynamically resolves gateway proxy endpoint from NEXT_PUBLIC_GATEWAY_URL
 */

export const DEFAULT_GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080/api/v1/chat/completions";

/**
 * Returns the base URL for OpenAI SDK clients (e.g. http://localhost:8080/v1 or https://gateway.osterdops.com/v1)
 */
export function getGatewayBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_GATEWAY_URL;
  if (!url) return "http://localhost:8080/api/v1";
  
  // Strip trailing /chat/completions if present
  return url.replace(/\/chat\/completions\/?$/, "");
}

/**
 * Returns the full chat completions endpoint for curl and REST requests
 */
export function getGatewayCompletionsUrl(): string {
  const url = process.env.NEXT_PUBLIC_GATEWAY_URL;
  if (url) return url;
  return "http://localhost:8080/api/v1/gateway/chat/completions";
}

/**
 * Returns the metrics endpoint URL for querying live C++ engine telemetry
 */
export function getGatewayMetricsUrl(): string {
  const base = getGatewayBaseUrl();
  if (base.endsWith("/api/v1")) {
    return `${base}/metrics`;
  }
  return `${base}/api/v1/metrics`;
}
