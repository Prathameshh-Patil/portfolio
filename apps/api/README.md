# portfolio-api

Backend for my portfolio website. It serves my projects and publications, receives contact-form messages, counts project views, and powers a small admin panel. It's one app in the monorepo; see the [root README](../../README.md) to run the whole stack.

**Stack:** Node.js · TypeScript · Express · PostgreSQL · Drizzle ORM · Zod · JWT · Vitest · Docker

## Architecture

```
Next.js frontend ──HTTP/JSON──▶ Express API ──Drizzle──▶ PostgreSQL
                                    │
                                    └──▶ Resend (email on new contact message)
```

```
src/
  app.ts            builds the Express app (middleware + routes); tests use it directly
  server.ts         starts the server, graceful shutdown
  config.ts         validates environment variables at startup
  db/schema.ts      tables: projects, publications, messages
  db/client.ts      Postgres connection pool
  db/migrate.ts     applies SQL migrations from ./drizzle
  db/seed.ts        inserts my resume projects
  routes/public.ts  projects, view counter, contact form
  routes/auth.ts    admin login -> JWT
  routes/admin.ts   manage messages and projects, dashboard stats
  middleware/auth.ts  JWT check for admin routes
  lib/errors.ts     one error handler that turns every error into JSON
  services/email.ts  Resend notification (skipped if not configured)
tests/              API tests against an in-memory Postgres (PGlite)
```

## API

| Method | Path | Auth | What it does |
|---|---|---|---|
| GET | `/health` | – | Health check, also pings the database |
| GET | `/api/projects` | – | Published projects, featured first |
| GET | `/api/projects/:slug` | – | One project |
| POST | `/api/projects/:slug/view` | – | Adds one view, returns the new count |
| GET | `/api/publications` | – | Visible publications, in display order |
| POST | `/api/contact` | – | Saves a message (rate-limited: 5 per IP per hour) |
| POST | `/api/auth/login` | – | `{ email, password }` → `{ token }` (valid 2 hours) |
| GET | `/api/admin/stats` | Admin | Message counts and most-viewed projects |
| GET | `/api/admin/messages?page=&limit=&unread=` | Admin | Paginated inbox |
| PATCH | `/api/admin/messages/:id` | Admin | `{ isRead }` |
| DELETE | `/api/admin/messages/:id` | Admin | Delete a message |
| GET / POST | `/api/admin/projects` | Admin | List all (including drafts) / create |
| PATCH / DELETE | `/api/admin/projects/:id` | Admin | Update only the sent fields / delete |
| GET / POST | `/api/admin/publications` | Admin | List all (including hidden) / create |
| PATCH / DELETE | `/api/admin/publications/:id` | Admin | Update only the sent fields / delete |

Admin requests send `Authorization: Bearer <token>`. Errors always look like `{ "error": "...", "details"?: {...} }`.

## Design decisions

- **Validation at the edge.** Every request body, URL parameter and query string goes through a Zod schema before it reaches the database. Bad input returns 400 with the field that failed.
- **Atomic view counter.** `UPDATE projects SET views = views + 1` is one statement, so concurrent visits can't overwrite each other. A test fires 50 simultaneous views and checks the count is exactly 50.
- **Single admin, no users table.** The admin email and a bcrypt password hash live in environment variables. Simpler and smaller attack surface for a one-person site.
- **Login hardening.** Rate limited to 10 attempts per 15 minutes per IP. bcrypt runs even when the email is wrong, so response time doesn't reveal which field was wrong.
- **Spam protection.** Rate limit on the contact form plus a honeypot field (`website`) that only bots fill in. Bot submissions get a fake success and are not saved.
- **Email can't break the form.** The message is saved first; the notification email is sent afterwards and a failure is only logged.
- **Safe errors.** Unexpected errors are logged in full but the client only sees "Internal server error". The `Authorization` header is redacted from logs.
- **Testable by design.** `createApp()` takes its dependencies (database, mailer), so tests run against a real Postgres engine in memory with the real migrations, and need no Docker or setup.

## Run locally

The usual way is the whole stack from the repo root (`docker compose up --build`). To run only the API with hot reload, from the repo root:

```bash
docker compose up -d db          # Postgres on host port 5434
npm run db:migrate -w apps/api
npm run db:seed -w apps/api
npm run dev -w apps/api          # http://localhost:4000, reads ../../.env
```

```bash
npm test -w apps/api             # 29 API tests, no Docker needed
npm run typecheck -w apps/api
npm run lint -w apps/api
```

## Changing the database schema

Edit `src/db/schema.ts`, then:

```bash
npm run db:generate -w apps/api   # writes a new SQL file in ./drizzle; review it and commit it
npm run db:migrate -w apps/api
```
