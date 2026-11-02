# portfolio-api

Backend for my portfolio website. It serves my projects, receives contact-form messages, counts project views, and powers a small admin panel. It's one app in the monorepo; see the [root README](../../README.md) to run the whole stack.

**Stack:** Node.js · TypeScript · Express · MySQL 8.4 · Drizzle ORM · Zod · OpenAPI 3.1 · JWT · Vitest · Docker · AWS Lambda + RDS

## Architecture

```
Next.js frontend ──HTTP/JSON──▶ Express API ──Drizzle──▶ MySQL
                                    │
                                    └──▶ Resend (email on new contact message)
```

```
src/
  app.ts            builds the Express app (middleware + routes); tests use it directly
  server.ts         starts the server, graceful shutdown
  lambda.ts         AWS Lambda entry point (same app, see deploy/aws/)
  schemas.ts        every request and response shape (Zod)
  openapi.ts        OpenAPI 3.1 document built from schemas.ts
  docs.ts           /openapi.json and the Swagger UI page at /docs
  config.ts         validates environment variables at startup
  db/schema.ts      tables: projects, messages
  db/client.ts      MySQL connection pool (UTC, TLS set by the URL)
  db/migrate.ts     applies SQL migrations from ./drizzle
  db/seed.ts        inserts my resume projects
  routes/public.ts  projects, view counter, contact form
  routes/auth.ts    admin login -> JWT
  routes/admin.ts   manage messages and projects, dashboard stats
  middleware/auth.ts  JWT check for admin routes
  lib/errors.ts     one error handler that turns every error into JSON
  services/email.ts  Resend notification (skipped if not configured)
scripts/bench-indexes.ts  measures what the indexes buy (see below)
tests/              API tests, each file on a throwaway MySQL database
```

## API

**Interactive docs:** `/docs` (Swagger UI) and the raw OpenAPI 3.1 document at `/openapi.json`. Both are built from `src/schemas.ts`, the same Zod schemas the routes validate with, and `tests/docs.test.ts` checks real responses against them.

| Method | Path | Auth | What it does |
|---|---|---|---|
| GET | `/health` | – | Health check, also pings the database |
| GET | `/openapi.json`, `/docs` | – | OpenAPI document, Swagger UI |
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
- **Atomic view counter.** `UPDATE projects SET views = views + 1` is one statement, so concurrent visits can't overwrite each other. MySQL has no `RETURNING`, so the new count is read in the same transaction: the UPDATE holds the row lock until commit, so the read sees exactly this visit's count. A test fires 50 simultaneous views and checks the count is exactly 50.
- **MySQL details.** No `RETURNING`: inserts use the generated id, and updates/deletes check `affectedRows` for the 404. `tech_stack` is a JSON column (MySQL has no arrays). `updated_at` uses `ON UPDATE CURRENT_TIMESTAMP`. Every connection sets `time_zone = '+00:00'`, so stored and returned dates are UTC whatever the server's setting.
- **Single admin, no users table.** The admin email and a bcrypt password hash live in environment variables. Simpler and smaller attack surface for a one-person site.
- **Login hardening.** Rate limited to 10 attempts per 15 minutes per IP. bcrypt runs even when the email is wrong, so response time doesn't reveal which field was wrong.
- **Spam protection.** Rate limit on the contact form plus a honeypot field (`website`) that only bots fill in. Bot submissions get a fake success and are not saved.
- **Email can't break the form.** The message is saved first; the notification email is sent afterwards and a failure is only logged.
- **Safe errors.** Unexpected errors are logged in full but the client only sees "Internal server error". The `Authorization` header is redacted from logs.
- **Testable by design.** `createApp()` takes its dependencies (database, mailer). Each test file gets its own new MySQL database with the real migrations applied, and drops it at the end.

## Run locally

The usual way is the whole stack from the repo root (`docker compose up --build`). To run only the API with hot reload, from the repo root:

```bash
docker compose up -d db          # MySQL on host port 3307
npm run db:migrate -w apps/api
npm run db:seed -w apps/api
npm run dev -w apps/api          # http://localhost:4000, reads ../../.env
```

```bash
npm test -w apps/api             # 22 API tests; needs the compose db (or TEST_DATABASE_URL)
npm run typecheck -w apps/api
npm run lint -w apps/api
```

## Indexes and query performance

`drizzle/0001_indexes.sql` adds one index per query the app runs often:

| Index | Query it serves |
|---|---|
| `messages_inbox_idx (is_read, created_at, id)` | Unread inbox, newest first, and the unread count on the dashboard |
| `messages_created_idx (created_at, id)` | Whole inbox, newest first |
| `projects_public_list_idx (published, featured, sort_order, created_at)` | The public project list |

The indexed columns follow the query: the equality filter first (`is_read`), then the sort columns in order, so MySQL reads the first 20 rows straight from the index instead of sorting the whole table. There's no index on `views`: it changes on every visit, and an index would have to be updated each time. The "top projects" query only sorts a handful of rows.

`npm run bench:indexes -w apps/api` loads 200,000 messages into a throwaway database and times each query with and without its index (median of 30 runs, MySQL 8.4 in Docker on a laptop):

| Query | Without index | With index | Speedup | Plan without → with |
|---|---|---|---|---|
| Unread inbox, page 1 | 26.6 ms | 0.26 ms | 102× | full scan + filesort → `ref` on `messages_inbox_idx` |
| Unread count | 13.2 ms | 1.1 ms | 12× | full scan → `ref` on `messages_inbox_idx` |
| All messages, page 1 | 35.0 ms | 0.23 ms | 149× | full scan + filesort → `index` on `messages_created_idx` |

Other choices: page size capped at 100, a small connection pool (5) per process, and the dashboard's three queries run in parallel.

## Changing the database schema

Edit `src/db/schema.ts`, then:

```bash
npm run db:generate -w apps/api   # writes a new SQL file in ./drizzle; review it and commit it
npm run db:migrate -w apps/api
```
