/**
 * OsterdOps — Centralized Frontend API Client (Phase 16)
 * Strongly typed HTTP client with correlation IDs, token propagation, and standardized error handling.
 */

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export interface ApiClientOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  token?: string | null;
}

/**
 * Generates a unique client request correlation ID.
 */
function generateCorrelationId(): string {
  return `req_client_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Primary HTTP request dispatcher with structured response envelopes.
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<ApiResponse<T>> {
  const correlationId = generateCorrelationId();
  const headers = new Headers(options.headers || {});

  // Add default headers
  if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
    headers.set("Content-Type", "application/json");
  }
  headers.set("X-Correlation-Id", correlationId);

  // Add Authorization token if provided
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  // Construct URL with query parameters
  let url = endpoint;
  if (options.params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const status = res.status;

    let json: Record<string, unknown> | null = null;
    try {
      json = await res.json();
    } catch {
      // Empty response or non-JSON
    }

    if (!res.ok) {
      const errorMsg =
        (json && (json.error as string || (json.message as string))) ||
        `HTTP Error ${status}: ${res.statusText}`;
      return { data: null, error: errorMsg, status };
    }

    // Standard backend envelope { success: true, data: T }
    const responseData = json && "data" in json ? (json.data as T) : ((json as unknown) as T);

    return {
      data: responseData,
      error: null,
      status,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Network communication error";
    return {
      data: null,
      error: errorMsg,
      status: 0,
    };
  }
}
