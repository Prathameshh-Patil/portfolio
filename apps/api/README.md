# portfolio-api

Backend for my portfolio website. It serves my projects, receives contact-form messages, counts project views, and powers a small admin panel.

**Stack:** Node.js · TypeScript · Express · PostgreSQL (Neon) · Drizzle ORM · Zod · JWT · Vitest · Docker · GitHub Actions

## Architecture

```
Next.js frontend ──HTTP/JSON──▶ Express API ──Drizzle──▶ PostgreSQL (Neon)
                                    │
                                    └──▶ Resend (email on new contact message)
```

```
src/
  app.ts            builds the Express app (middleware + routes); tests use it directly
  server.ts         starts the server, graceful shutdown
  config.ts         validates environment variables at startup
  db/schema.ts      tables: projects, messages
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
| POST | `/api/contact` | – | Saves a message (rate-limited: 5 per IP per hour) |
| POST | `/api/auth/login` | – | `{ email, password }` → `{ token }` (valid 2 hours) |
| GET | `/api/admin/stats` | Admin | Message counts and most-viewed projects |
| GET | `/api/admin/messages?page=&limit=&unread=` | Admin | Paginated inbox |
| PATCH | `/api/admin/messages/:id` | Admin | `{ isRead }` |
| DELETE | `/api/admin/messages/:id` | Admin | Delete a message |
| GET / POST | `/api/admin/projects` | Admin | List all (including drafts) / create |
| PATCH / DELETE | `/api/admin/projects/:id` | Admin | Update only the sent fields / delete |

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

```bash
npm install
cp .env.example .env            # then fill it in
npm run hash-password -- "a-strong-password"   # paste the result into ADMIN_PASSWORD_HASH

docker compose up -d db         # local Postgres (or use your Neon URL in .env)
npm run db:migrate
npm run db:seed
npm run dev                     # http://localhost:4000
```

Or everything in Docker: `docker compose up --build`.

```bash
npm test          # 17 API tests
npm run typecheck
```

## Changing the database schema

Edit `src/db/schema.ts`, then:

```bash
npm run db:generate   # writes a new SQL file in ./drizzle; review it and commit it
npm run db:migrate
```

## Deploy

1. Create a Neon database and copy its connection string (it ends in `?sslmode=require`).
2. Deploy this repo with its Dockerfile on Render, Railway or Fly.io. The container applies migrations on start.
3. Set the environment variables from `.env.example`. Set `CORS_ORIGINS` to your site's real URL, e.g. `https://yourdomain.com`.
4. Point your frontend at the API URL (e.g. `https://api.yourdomain.com`).

Free tiers may put the service to sleep; the first request after that is slow. Statically render project pages in Next.js and only call the API for the view counter and contact form, so the site stays fast either way.
