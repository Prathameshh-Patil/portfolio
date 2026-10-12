import { getToken, setToken } from "./admin-token";
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

export type Message = {
  id: number;
  name: string;
  email: string;
  subject: string | null;
  body: string;
  isRead: boolean;
  createdAt: string;
};

export type Stats = {
  messages: number;
  unreadMessages: number;
  topProjects: { slug: string; title: string; views: number }[];
};

export type Page<T> = { data: T[]; page: number; limit: number; total: number };

// What the admin can send when creating or editing. Server-managed fields (id, views, dates) are left out.
export type ProjectInput = Omit<Project, "id" | "views" | "createdAt" | "updatedAt">;
export type PublicationInput = Omit<Publication, "id" | "createdAt" | "updatedAt">;

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

// ---- Admin (browser only) ----
export const login = (email: string, password: string) =>
  request<{ token: string }>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });

// Every admin call sends the JWT. A 401 means it is missing or expired: forget it and go to the login page.
// This is the only place that handles 401, so no admin screen has to.
async function adminRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  try {
    return await request<T>(path, { ...init, headers: { Authorization: `Bearer ${getToken()}` } });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      setToken(null);
      window.location.replace("/admin/login?expired=1");
    }
    throw err;
  }
}

const json = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) });

export const admin = {
  stats: () => adminRequest<Stats>("/api/admin/stats"),

  messages: (page: number, limit: number, unreadOnly: boolean) =>
    adminRequest<Page<Message>>(`/api/admin/messages?page=${page}&limit=${limit}${unreadOnly ? "&unread=true" : ""}`),
  setMessageRead: (id: number, isRead: boolean) => adminRequest<Message>(`/api/admin/messages/${id}`, json("PATCH", { isRead })),
  deleteMessage: (id: number) => adminRequest<void>(`/api/admin/messages/${id}`, { method: "DELETE" }),

  projects: () => adminRequest<Project[]>("/api/admin/projects"),
  createProject: (data: ProjectInput) => adminRequest<Project>("/api/admin/projects", json("POST", data)),
  updateProject: (id: number, data: Partial<ProjectInput>) => adminRequest<Project>(`/api/admin/projects/${id}`, json("PATCH", data)),
  deleteProject: (id: number) => adminRequest<void>(`/api/admin/projects/${id}`, { method: "DELETE" }),

  publications: () => adminRequest<Publication[]>("/api/admin/publications"),
  createPublication: (data: PublicationInput) => adminRequest<Publication>("/api/admin/publications", json("POST", data)),
  updatePublication: (id: number, data: Partial<PublicationInput>) =>
    adminRequest<Publication>(`/api/admin/publications/${id}`, json("PATCH", data)),
  deletePublication: (id: number) => adminRequest<void>(`/api/admin/publications/${id}`, { method: "DELETE" }),
};
