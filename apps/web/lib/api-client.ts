import { internalApiUrl, publicApiUrl } from "./env";

// The HTTP layer every feature's API calls go through: base URL, JSON, timeout and errors.
// The functions themselves live with their feature (features/*/api.ts), typed by @portfolio/contracts.

// Every non-2xx response becomes an ApiError, so callers can branch on `status` (404, 429, ...).
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: Record<string, string[] | undefined>,
  ) {
    super(message);
  }
}

// Same code runs on the server (Server Components) and in the browser (client components),
// but they reach the API at different addresses. See lib/env.ts.
function baseUrl() {
  return typeof window === "undefined" ? internalApiUrl() : publicApiUrl;
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
    cache: "no-store", // always fresh: edits made in the admin panel show up on the next page load
    signal: AbortSignal.timeout(5000), // a down API fails fast instead of hanging the page
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error ?? res.statusText, body.details);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export const jsonBody = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) });
