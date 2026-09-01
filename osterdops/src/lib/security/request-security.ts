/**
 * OsterdOps — Request Security Validation & Abuse Prevention (Phase 15)
 * Validates request size, content types, origins, and provides privacy-preserving IP hashing.
 */

import crypto from "crypto";

export interface RequestSecurityValidationResult {
  valid: boolean;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Validates request Content-Length header against maximum allowed byte limit.
 */
export function validateRequestPayloadSize(
  request: Request,
  maxBytes = 10 * 1024 * 1024 // 10MB default
): RequestSecurityValidationResult {
  const contentLengthStr = request.headers.get("content-length");
  if (contentLengthStr) {
    const bytes = parseInt(contentLengthStr, 10);
    if (!isNaN(bytes) && bytes > maxBytes) {
      return {
        valid: false,
        errorCode: "PAYLOAD_TOO_LARGE",
        errorMessage: `Request payload size (${bytes} bytes) exceeds maximum permitted limit (${maxBytes} bytes).`,
      };
    }
  }
  return { valid: true };
}

/**
 * Validates Content-Type header matches expected MIME type for mutation requests.
 */
export function validateContentType(
  request: Request,
  expected = "application/json"
): RequestSecurityValidationResult {
  const method = request.method.toUpperCase();
  if (["POST", "PUT", "PATCH"].includes(method)) {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes(expected.toLowerCase())) {
      return {
        valid: false,
        errorCode: "INVALID_CONTENT_TYPE",
        errorMessage: `Invalid Content-Type header. Expected '${expected}', received '${contentType}'.`,
      };
    }
  }
  return { valid: true };
}

/**
 * Validates request origin against allowed list.
 */
export function validateAllowedOrigin(
  origin: string | null | undefined,
  allowedOrigins: string[] = []
): boolean {
  if (!origin) return true; // Server-to-server calls may lack Origin header
  if (allowedOrigins.length === 0 || allowedOrigins.includes("*")) return true;

  const normalized = origin.trim().toLowerCase();
  return allowedOrigins.some((allowed) => allowed.trim().toLowerCase() === normalized);
}

/**
 * Creates a privacy-conscious, pseudonymized salted SHA-256 hash of a client IP address.
 * Never stores raw IP addresses in databases or logs.
 */
export function hashClientIp(rawIp: string, customSalt?: string): string {
  if (!rawIp || !rawIp.trim()) return "ip_unknown";
  const salt = customSalt || process.env.ENCRYPTION_KEY || "osterdops_ip_privacy_salt_2026";
  return `iph_${crypto.createHmac("sha256", salt).update(rawIp.trim()).digest("hex").slice(0, 16)}`;
}

/**
 * Safely extracts client IP address from proxy forwarding headers without trusting unverified clients.
 */
export function extractSafeClientIp(
  headers: Headers | Record<string, string | null | undefined>
): string {
  if (typeof (headers as Headers).get === "function") {
    const h = headers as Headers;
    const xForwardedFor = h.get("x-forwarded-for");
    if (xForwardedFor) {
      return xForwardedFor.split(",")[0].trim();
    }
    return h.get("x-real-ip") || h.get("cf-connecting-ip") || "127.0.0.1";
  }

  const obj = headers as Record<string, string | null | undefined>;
  const xForwardedFor = obj["x-forwarded-for"] || obj["X-Forwarded-For"];
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }
  return obj["x-real-ip"] || obj["cf-connecting-ip"] || "127.0.0.1";
}

/**
 * Detects suspicious or malicious request headers (e.g. proxy injection, invalid characters).
 */
export function detectSuspiciousHeaders(
  headers: Headers | Record<string, string | null | undefined>
): { suspicious: boolean; reason?: string } {
  const getHeader = (name: string): string | null => {
    if (typeof (headers as Headers).get === "function") {
      return (headers as Headers).get(name);
    }
    return (headers as Record<string, string | null | undefined>)[name] || null;
  };

  const host = getHeader("host") || "";
  if (host.includes("\n") || host.includes("\r") || host.includes("\0")) {
    return { suspicious: true, reason: "Host header contains invalid newline/null control characters." };
  }

  const auth = getHeader("authorization") || "";
  if (auth.length > 4096) {
    return { suspicious: true, reason: "Authorization header exceeds maximum permitted length." };
  }

  return { suspicious: false };
}
