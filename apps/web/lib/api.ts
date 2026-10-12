import { internalApiUrl, publicApiUrl } from "./env";

// The one place that talks to the API. Types mirror the API's JSON responses.

export type Project = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  techStack: string[];
  repoUrl: string | null;
  demoUrl: string | null;
  featured: boolean;
  published: boolean;
  sortOrder: number;
  views: number;
  createdAt: string;
  updatedAt: string;
};

export type PublicationStatus = "published" | "accepted" | "under_review" | "preprint";

export type Publication = {
  id: number;
  title: string;
  authors: string;
  venue: string | null;
  year: number | null;
  status: PublicationStatus;
  url: string | null;
  summary: string;
  visible: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ContactInput = { name: string; email: string; subject?: string; body: string; website?: string };

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

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
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

// ---- Public (used by Server Components) ----
export const getProjects = () => request<Project[]>("/api/projects");
export const getProject = (slug: string) => request<Project>(`/api/projects/${encodeURIComponent(slug)}`);
export const getPublications = () => request<Publication[]>("/api/publications");

// ---- Public (used from the browser) ----
export const recordView = (slug: string) =>
  request<{ views: number }>(`/api/projects/${encodeURIComponent(slug)}/view`, { method: "POST" });

export const sendContact = (data: ContactInput) =>
  request<{ ok: true }>("/api/contact", { method: "POST", body: JSON.stringify(data) });
