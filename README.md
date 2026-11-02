# Portfolio

My personal portfolio: a Next.js website, an Express API with MySQL, and a small admin panel to manage projects and contact messages. The whole stack runs locally with one command.

**Stack:** TypeScript everywhere · Next.js (App Router) + Tailwind CSS + MDX · Express + Drizzle ORM + Zod + JWT · MySQL 8.4 · OpenAPI 3.1 + Swagger UI · Vitest + Playwright · Docker Compose · GitHub Actions · AWS (Lambda, API Gateway, RDS, SAM)

## Architecture

```mermaid
flowchart LR
    B[Browser] -- "pages" --> W["web<br/>Next.js :3000"]
    W -- "server-side fetch<br/>API_URL_INTERNAL<br/>http://api:4000" --> A["api<br/>Express :4000"]
    B -- "view counter, contact form, admin<br/>NEXT_PUBLIC_API_URL<br/>http://localhost:4000" --> A
    A -- "Drizzle" --> D[("db<br/>MySQL 8.4")]
    A -. "optional: email on new message" .-> R[Resend]
```

- **web** renders every page on the server. It fetches projects from the API, and adds the long case studies from MDX files.
- **Browser-side calls go straight to the API:** the view counter, the contact form and the whole admin panel.
- **api** validates every request with Zod, stores data in MySQL, and protects admin routes with a JWT. Its OpenAPI docs are at http://localhost:4000/docs.
- **db** is plain MySQL. The api container applies migrations and seeds the four resume projects when it starts.

```
packages/
  contracts/           the API contract: Zod schemas + inferred types, used by both apps
apps/
  api/                 Express API (see apps/api/README.md for endpoints and layers)
    src/modules/       one folder per feature: projects, messages, auth, dashboard, health, docs
    src/core/          errors, JWT middleware, request ids
    src/db/            schema, migrations runner, seed
    drizzle/           SQL migrations
    tests/unit/        services tested with in-memory fakes (no database)
    tests/integration/ the HTTP API against a throwaway MySQL database per test file
  web/                 Next.js website
    app/               routes only: home, projects, experience, about, resume, contact, admin
    features/          one folder per feature: projects, contact, admin, profile (components + API calls)
    components/ui/     shared building blocks: Container, ButtonLink, form fields, icons
    components/layout/ header, footer, theme toggle
    content/projects/  one MDX case study per project, named by slug
    lib/               the HTTP client and env checks
    e2e/               Playwright tests and a mock API
scripts/demo.sh        resets the local stack to a clean demo state
deploy/aws/            AWS SAM template and deploy script for the API (Lambda + API Gateway + RDS MySQL)
```

**How the code is layered**

```mermaid
flowchart LR
    C["packages/contracts<br/>Zod schemas + types"] --> WF
    C --> R
    subgraph web
      P["app/ (routes)"] --> WF["features/*<br/>components + api.ts"] --> HC["lib/api-client"]
    end
    subgraph api
      R["routes<br/>HTTP only"] --> S["services<br/>rules"] --> RP["repositories<br/>SQL"]
    end
    HC -- "HTTP/JSON" --> R
    RP --> DB[("MySQL")]
```

- **One contract, two apps.** The API validates requests with the schemas in `packages/contracts`, and the website types its API calls with the types inferred from them. Change a field there and both apps fail to compile until they agree. The website's forms reuse the same limits with friendlier messages.
- **Feature modules.** Everything about one feature sits in one folder, on both sides. Adding a feature means adding a folder and one line where it's wired up, not editing files all over the codebase.
- **Layers in the API.** Routes only deal with HTTP; services hold the rules and throw errors like `NotFoundError` without knowing about status codes; repositories are the only code that writes SQL. Services get their repository passed in, so unit tests swap in an in-memory fake.
- **One composition root.** `apps/api/src/app.ts` is the only file that knows every module: it builds the repositories and services and mounts the routes.

## Run it

You need Docker, and Node.js 20+ for the one-time password hash.

```bash
npm install
cp .env.example .env
npm run hash-password -w apps/api -- "a-strong-password"   # paste the output into ADMIN_PASSWORD_HASH (keep the single quotes)
# in .env, also set JWT_SECRET (a long random string) and ADMIN_EMAIL
docker compose up --build
```

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin
- API health: http://localhost:4000/health

If port 3000 is taken, set `WEB_PORT=3002` in `.env` and add `http://localhost:3002` to `CORS_ORIGINS`. MySQL is published on host port 3307, so it doesn't clash with a local MySQL on 3306.

**Reset to a clean demo:** `npm run demo` deletes the local database and restarts everything with only the seeded projects. It asks first; `npm run demo -- --yes` skips the question.

**Develop with hot reload:** `npm run dev` starts MySQL in Docker, then runs the API and the website on your machine.

## Deployment

| Piece | Where | How |
|---|---|---|
| Website | Vercel project `prathameshpatil`, root `apps/web` | Next.js, detected by Vercel. A push to `main` deploys it; a pull request gets a preview URL. |
| API | AWS Lambda behind an API Gateway HTTP API | `src/lambda.ts` wraps the same Express app that Docker runs; `npm run build:lambda` bundles it into one file |
| Database | Amazon RDS for MySQL 8.4 (`db.t4g.micro`) | TLS required, password generated into Secrets Manager, 7 days of backups |

Everything on AWS is one SAM template, [`deploy/aws/template.yaml`](deploy/aws/template.yaml). One command creates or updates it, then applies the migrations and the seed:

```bash
# Needs AWS CLI v2 + AWS SAM CLI, logged in to your account. Reads ADMIN_EMAIL, ADMIN_PASSWORD_HASH, JWT_SECRET from .env
AWS_REGION=ap-south-1 ./deploy/aws/deploy.sh
```

It prints the API URL. Set it as `NEXT_PUBLIC_API_URL` and `API_URL_INTERNAL` in the Vercel website project, and redeploy the website.

**AWS design choices**
- **Lambda instead of a container service.** A portfolio API is idle most of the time. Lambda costs nothing while idle and API Gateway gives HTTPS without a load balancer (~$18/month on its own).
- **Lambda outside the VPC, database reachable from the internet.** Putting Lambda in the VPC would need a NAT gateway (~$35/month) for it to reach Resend. Instead the database refuses non-TLS connections (`require_secure_transport`), the driver verifies the RDS certificate (`?ssl=Amazon RDS`), and the password is 32 random characters from Secrets Manager.
- **Throttled at the gateway** (20 requests/s, bursts of 50), so a flood of requests can't run up the bill or use up the database's connections.
- **Cost:** about $0 in the AWS free tier; after it, roughly $15–20/month, almost all of it the database. `sam delete --stack-name portfolio-api` removes everything and keeps a final snapshot of the database.

`api/index.ts` and `vercel.json` still let the API run on Vercel instead, with any MySQL `DATABASE_URL`. `.vercelignore` keeps `.env` files, build output and private PDFs out of a Vercel upload.

## Checks

```bash
npm run typecheck   # both apps
npm run lint        # both apps
npm test            # 33 API tests: unit (no database) + integration against MySQL; run `docker compose up -d db` first
npm run test:unit -w apps/api   # only the unit tests, no database needed
npm run test:e2e    # 13 Playwright tests against the production build and a mock API
```

```bash
npm run bench:indexes -w apps/api   # how much the indexes speed up the inbox queries (see apps/api/README.md)
```

GitHub Actions runs all of these on every push and pull request, with a MySQL service container for the API tests. It also builds the web app, the Lambda bundle and both Docker images. Deploying is Vercel's job, not CI's.

## Design decisions

- **The API is the only source of project data.** The admin panel edits projects in MySQL, and the site shows the change on the next page load. Long-form case studies are MDX files in the repo (`content/projects/<slug>.mdx`), because prose and diagrams are easier to write and review as files than in a form.
- **Two URLs for the same API.** Server Components reach the API by its Docker service name (`http://api:4000`); the browser uses `http://localhost:4000`. `NEXT_PUBLIC_API_URL` is the only public variable, and since Next.js bakes it in at build time, it's a Docker build argument.
- **Fail fast on bad configuration.** Both apps validate their environment variables with Zod at startup. A wrong value stops the process with a message naming the variable, instead of failing later on the first request.
- **One admin, no users table.** The admin email and a bcrypt hash live in `.env`, and login returns a 2-hour JWT.
  - **Where the browser keeps it:** `sessionStorage`, which is never sent automatically with requests, so there's no CSRF risk.
  - **Expired or invalid token:** any 401 sends you back to the login page.
  - **Trade-off:** an httpOnly cookie would also hide the token from scripts, but would need CSRF protection.
- **The database enforces correctness.** View counts use a single `UPDATE ... SET views = views + 1`, so simultaneous visits can't overwrite each other; a test fires 50 at once and checks for exactly 50.
- **Indexes match the real queries.** Each index is built for one query the app runs. On 200,000 messages they make the admin inbox 100–150× faster (see the API README).
- **Documented API.** The OpenAPI document is generated from the same Zod schemas the routes validate with, so it can't drift. A test checks real responses against it.
- **Forms validate twice.** The browser mirrors the API's Zod rules to give instant, accessible errors (focus moves to the first invalid field). The API is still the authority, and its field errors are mapped back onto the form. The contact form also has a rate limit and a honeypot field for bots.
- **Never claim what isn't there.** The "Open demo" button appears only when a project has a demo URL, and a missing fact shows as a visible TODO instead of a guess.
- **Few dependencies.** No UI kit or animation library: Tailwind, CSS animations that respect reduced-motion, and an inline-SVG diagram component for the case studies.
- **Startup order through healthchecks.** db → api (migrates and seeds, then reports healthy) → web, so the site never starts against a missing API. The seed only inserts missing projects, so restarts never overwrite admin edits.
- **Rendered per request.** Pages always show live data, and the build doesn't need the API. Fine for a local site; on a public one I'd cache pages and revalidate when the admin changes data.
- **Accessibility was checked, not assumed.** axe-core reported 0 violations on 10 pages in both themes, every text colour meets WCAG AA contrast, and the mobile menu works by keyboard.

## 5-minute demo script

Run `npm run demo` first, so the database is clean. Keep a second tab on the admin login.

**1. The site (1.5 min)**
- **Home:** the availability pill, the summary and the core stack. Each featured project card shows the project's pipeline and one real, sourced result.
- Toggle dark mode.
- Narrow the window to phone width: the layout reflows and the menu collapses. Open it, then press Escape to close it.

**2. A case study (1 min)**
- **Open Slotwise:** problem, architecture diagram, decisions, results.
- The view counter goes up by one, and only once per browser session; refresh to show it doesn't count again.
- The "Open demo" button is here because Slotwise has a working live URL. Projects without a working live URL (the loan agent) get no button.

**3. Contact form (1 min)**
- Submit it empty: the errors appear and focus jumps to the first field.
- Fill it in and send it.
- *Talking point:* the message is saved first, and the notification email is optional, so email trouble can't lose a message.

**4. Admin (1.5 min)**
- **Log in.** The dashboard shows the new unread message and the view you just made. Open the inbox and mark the message read.
- **Projects:** unpublish a project, then reload the public Projects page in the other tab: it's gone. Publish it again.
- *Talking point:* every admin request carries the JWT, and an expired token sends you back to login. One of the Playwright tests checks exactly that.

**Wrap-up, if there's time:** show `docker-compose.yml` (the healthcheck chain), the CI workflow, and one test, for example the 50 concurrent views.

## Content still to fill in

The site never shows a made-up number: wherever a fact is missing, the page shows a visible TODO. Search for `<Todo` in `apps/web/content/projects/`.
