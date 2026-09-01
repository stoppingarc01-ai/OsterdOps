/**
 * OsterdOps — Enterprise Security Headers & HTTP Hardening (Phase 15)
 * Configures enterprise HTTP response security headers with strict modern standards.
 */

export interface SecurityHeadersConfig {
  enableHsts?: boolean;
  isProduction?: boolean;
}

export function getSecurityHeaders(config: SecurityHeadersConfig = {}): Record<string, string> {
  const isProd = config.isProduction ?? process.env.NODE_ENV === "production";
  const enableHsts = config.enableHsts ?? isProd;

  // Strict CSP compatible with Next.js App Router
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://api.stripe.com https://api.openai.com https://api.anthropic.com https://generativelanguage.googleapis.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  const headers: Record<string, string> = {
    "Content-Security-Policy": cspHeader,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "X-XSS-Protection": "1; mode=block",
  };

  if (enableHsts) {
    headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload";
  }

  return headers;
}
