/**
 * OsterdOps — Outbound HTTP SSRF (Server-Side Request Forgery) Validator (Phase 20)
 * Validates destination URLs against internal network addresses, cloud metadata endpoints, and non-HTTPS schemes.
 */

import { ValidationError } from "@/lib/api/errors";

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "0.0.0.0",
  "metadata.google.internal",
  "metadata.internal",
  "169.254.169.254",
  "instance-data",
]);

/**
 * Checks if an IPv4 address falls within private, loopback, or link-local ranges.
 */
function isPrivateOrReservedIp(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return false;
  }

  // 127.0.0.0/8 (Loopback)
  if (parts[0] === 127) return true;

  // 10.0.0.0/8 (Private Network)
  if (parts[0] === 10) return true;

  // 172.16.0.0/12 (Private Network: 172.16.0.0 – 172.31.255.255)
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;

  // 192.168.0.0/16 (Private Network)
  if (parts[0] === 192 && parts[1] === 168) return true;

  // 169.254.0.0/16 (Link-Local / Cloud Metadata)
  if (parts[0] === 169 && parts[1] === 254) return true;

  // 0.0.0.0/8
  if (parts[0] === 0) return true;

  return false;
}

/**
 * Validates an outbound destination URL against SSRF vulnerabilities.
 * @throws {ValidationError} if the destination is invalid or unsafe.
 */
export function validateDestinationUrl(urlStr: string, allowHttpForTesting = false): URL {
  if (!urlStr || typeof urlStr !== "string") {
    throw new ValidationError("Destination URL is required.");
  }

  let parsed: URL;
  try {
    parsed = new URL(urlStr.trim());
  } catch {
    throw new ValidationError("Invalid destination URL format.");
  }

  // 1. Protocol validation: HTTPS only in production
  if (parsed.protocol !== "https:" && (!allowHttpForTesting || parsed.protocol !== "http:")) {
    throw new ValidationError(`Forbidden protocol '${parsed.protocol}'. Outbound destinations must use HTTPS.`);
  }

  const hostname = parsed.hostname.toLowerCase();

  // 2. Blocked hostnames / Cloud metadata
  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    throw new ValidationError(`Destination hostname '${hostname}' is restricted for security (SSRF Protection).`);
  }

  // 3. Private and reserved IP validation
  if (isPrivateOrReservedIp(hostname)) {
    throw new ValidationError(`Destination IP address '${hostname}' resides in a private or reserved network range.`);
  }

  return parsed;
}

/**
 * Safe boolean check for URL validity without throwing.
 */
export function isSafeDestinationUrl(urlStr: string, allowHttpForTesting = false): boolean {
  try {
    validateDestinationUrl(urlStr, allowHttpForTesting);
    return true;
  } catch {
    return false;
  }
}
