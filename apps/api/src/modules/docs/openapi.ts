import { createDocument } from "zod-openapi";
import { z } from "zod";
import {
  contactResultSchema,
  contactSchema,
  createProjectSchema,
  errorSchema,
  healthSchema,
  idParam,
  loginSchema,
  markReadSchema,
  messagePageSchema,
  messageSchema,
  pageQuery,
  projectSchema,
  slugParam,
  statsSchema,
  tokenSchema,
  updateProjectSchema,
  viewsSchema,
} from "@portfolio/contracts";

const json = (schema: z.ZodType) => ({ content: { "application/json": { schema } } });
const ok = (description: string, schema: z.ZodType) => ({ description, ...json(schema) });
const error = (description: string) => ({ description, ...json(errorSchema) });

const invalid = { 400: error("Invalid request: `details` names each field that failed") };
const notFound = { 404: error("Not found") };
const adminOnly = { 401: error("Missing or invalid token"), 403: error("Token is not an admin token") };
const rateLimited = { 429: error("Too many requests from this IP") };

const tags = { public: ["Public"], auth: ["Auth"], admin: ["Admin"] };
const admin = { tags: tags.admin, security: [{ bearerAuth: [] }] };

// The API's OpenAPI 3.1 document, built from the same Zod schemas the routes validate with.
// Served at /openapi.json and rendered at /docs.
export function buildOpenApiDocument() {
  return createDocument({
    openapi: "3.1.0",
    info: {
      title: "Portfolio API",
      version: "1.0.0",
      description:
        "Backend of my portfolio site: projects, a view counter, the contact form and an admin panel.\n\n" +
        "Admin routes need `Authorization: Bearer <token>`; get a token from `POST /api/auth/login`. " +
        'Every error has the same shape: `{ "error": "...", "details"?: {...} }`.',
    },
    tags: [
      { name: "Public", description: "Used by the website, no login needed" },
      { name: "Auth", description: "Admin login" },
      { name: "Admin", description: "Admin panel: needs a token" },
    ],
    components: {
      securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
    },
    paths: {
      "/health": {
        get: {
          summary: "Health check, also pings the database",
          tags: ["Ops"],
          responses: { 200: ok("API and database are up", healthSchema) },
        },
      },
      "/api/projects": {
        get: {
          summary: "Published projects, featured first",
          tags: tags.public,
          responses: { 200: ok("Projects", z.array(projectSchema)) },
        },
      },
      "/api/projects/{slug}": {
        get: {
          summary: "One published project",
          tags: tags.public,
          requestParams: { path: slugParam },
          responses: { 200: ok("The project", projectSchema), ...invalid, ...notFound },
        },
      },
      "/api/projects/{slug}/view": {
        post: {
          summary: "Count one view",
          description: "Atomic: concurrent views are never lost. Returns the count including this view.",
          tags: tags.public,
          requestParams: { path: slugParam },
          responses: { 200: ok("New view count", viewsSchema), ...invalid, ...notFound },
        },
      },
      "/api/contact": {
        post: {
          summary: "Send a message through the contact form",
          description: "Rate limited to 5 messages per IP per hour.",
          tags: tags.public,
          requestBody: json(contactSchema),
          responses: { 201: ok("Message saved", contactResultSchema), ...invalid, ...rateLimited },
        },
      },
      "/api/auth/login": {
        post: {
          summary: "Admin login",
          description: "Rate limited to 10 attempts per IP per 15 minutes.",
          tags: tags.auth,
          requestBody: json(loginSchema),
          responses: {
            200: ok("Logged in", tokenSchema),
            ...invalid,
            401: error("Wrong email or password"),
            ...rateLimited,
          },
        },
      },
      "/api/admin/stats": {
        get: {
          summary: "Dashboard: message counts and most-viewed projects",
          ...admin,
          responses: { 200: ok("Stats", statsSchema), ...adminOnly },
        },
      },
      "/api/admin/messages": {
        get: {
          summary: "Inbox, newest first, paginated",
          ...admin,
          requestParams: { query: pageQuery },
          responses: { 200: ok("One page of messages", messagePageSchema), ...invalid, ...adminOnly },
        },
      },
      "/api/admin/messages/{id}": {
        patch: {
          summary: "Mark a message read or unread",
          ...admin,
          requestParams: { path: idParam },
          requestBody: json(markReadSchema),
          responses: { 200: ok("Updated message", messageSchema), ...invalid, ...adminOnly, ...notFound },
        },
        delete: {
          summary: "Delete a message",
          ...admin,
          requestParams: { path: idParam },
          responses: { 204: { description: "Deleted" }, ...invalid, ...adminOnly, ...notFound },
        },
      },
      "/api/admin/projects": {
        get: {
          summary: "All projects, including unpublished drafts",
          ...admin,
          responses: { 200: ok("Projects", z.array(projectSchema)), ...adminOnly },
        },
        post: {
          summary: "Create a project",
          ...admin,
          requestBody: json(createProjectSchema),
          responses: {
            201: ok("Created project", projectSchema),
            ...invalid,
            ...adminOnly,
            409: error("Slug already taken"),
          },
        },
      },
      "/api/admin/projects/{id}": {
        patch: {
          summary: "Update a project",
          description: "Only the fields sent are changed.",
          ...admin,
          requestParams: { path: idParam },
          requestBody: json(updateProjectSchema),
          responses: {
            200: ok("Updated project", projectSchema),
            ...invalid,
            ...adminOnly,
            ...notFound,
            409: error("Slug already taken"),
          },
        },
        delete: {
          summary: "Delete a project",
          ...admin,
          requestParams: { path: idParam },
          responses: { 204: { description: "Deleted" }, ...invalid, ...adminOnly, ...notFound },
        },
      },
    },
  });
}
