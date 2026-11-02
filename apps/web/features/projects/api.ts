import type { Project } from "@portfolio/contracts";
import { request } from "@/lib/api-client";

// Used by Server Components.
export const getProjects = () => request<Project[]>("/api/projects");
export const getProject = (slug: string) => request<Project>(`/api/projects/${encodeURIComponent(slug)}`);

// Used from the browser.
export const recordView = (slug: string) =>
  request<{ views: number }>(`/api/projects/${encodeURIComponent(slug)}/view`, { method: "POST" });
