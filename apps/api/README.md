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
  app.ts            composition root: builds every repository and service, mounts the routes
  server.ts         starts the server, graceful shutdown
  lambda.ts         AWS Lambda entry point (same app, see deploy/aws/)
  config.ts         validates environment variables at startup
  core/             errors (+ the one error handler), JWT middleware, request ids
  db/               schema, MySQL pool (UTC, TLS set by the URL), migrate, seed, DB error types
  integrations/     email through Resend (skipped if not configured)
  modules/
    projects/       projects.repository.ts (SQL) -> projects.service.ts (rules) -> projects.routes.ts (HTTP)
    messages/       same three layers: contact form + admin inbox
    auth/           login service + route
    dashboard/      admin stats (reads from both repositories)
    health/         GET /health
    docs/           OpenAPI document + Swagger UI
scripts/bench-indexes.ts  measures what the indexes buy (see below)
tests/unit/         services with in-memory fakes, config; no database
tests/integration/  the HTTP API on a throwaway MySQL database per test file
```

Request and response schemas live in [`packages/contracts`](../../packages/contracts), shared with the website.

**Request flow, e.g. `PATCH /api/admin/projects/3`:** `requireAdmin` checks the JWT → `projects.routes.ts` parses the id and body with the contract schemas → `projects.service.ts` rejects an empty update, calls the repository, and turns a duplicate slug into `ConflictError` → `projects.repository.ts` runs the UPDATE and reads the row back → the error handler (if anything threw) picks the status code. Every log line for the request carries its `X-Request-Id`.

## API

**Interactive docs:** `/docs` (Swagger UI) and the raw OpenAPI 3.1 document at `/openapi.json`. Both are built from `packages/contracts`, the same Zod schemas the routes validate with, and `tests/integration/docs.test.ts` checks real responses against them.

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
- **Testable by design.** `createApp()` takes its dependencies (database, mailer). Services get their repository passed in, so unit tests use in-memory fakes; integration tests give each file its own new MySQL database with the real migrations applied, and drop it at the end.
- **Traceable requests.** Every request gets an `X-Request-Id` (or keeps the one a gateway sent), and it is on every log line for that request.

## Run locally

The usual way is the whole stack from the repo root (`docker compose up --build`). To run only the API with hot reload, from the repo root:

```bash
docker compose up -d db          # MySQL on host port 3307
npm run db:migrate -w apps/api
npm run db:seed -w apps/api
npm run dev -w apps/api          # http://localhost:4000, reads ../../.env
```

```bash
npm test -w apps/api             # 33 tests; needs the compose db (or TEST_DATABASE_URL)
npm run test:unit -w apps/api    # unit tests only, no database
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
