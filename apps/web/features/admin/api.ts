import type { CreateProjectInput, Message, Page, Project, Stats, UpdateProjectInput } from "@portfolio/contracts";
import { ApiError, jsonBody, request } from "@/lib/api-client";
import { getToken, setToken } from "./token";

// Admin calls (browser only).

export const login = (email: string, password: string) =>
  request<{ token: string }>("/api/auth/login", jsonBody("POST", { email, password }));

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

export const admin = {
  stats: () => adminRequest<Stats>("/api/admin/stats"),

  messages: (page: number, limit: number, unreadOnly: boolean) =>
    adminRequest<Page<Message>>(`/api/admin/messages?page=${page}&limit=${limit}${unreadOnly ? "&unread=true" : ""}`),
  setMessageRead: (id: number, isRead: boolean) => adminRequest<Message>(`/api/admin/messages/${id}`, jsonBody("PATCH", { isRead })),
  deleteMessage: (id: number) => adminRequest<void>(`/api/admin/messages/${id}`, { method: "DELETE" }),

  projects: () => adminRequest<Project[]>("/api/admin/projects"),
  createProject: (data: CreateProjectInput) => adminRequest<Project>("/api/admin/projects", jsonBody("POST", data)),
  updateProject: (id: number, data: UpdateProjectInput) => adminRequest<Project>(`/api/admin/projects/${id}`, jsonBody("PATCH", data)),
  deleteProject: (id: number) => adminRequest<void>(`/api/admin/projects/${id}`, { method: "DELETE" }),
};
