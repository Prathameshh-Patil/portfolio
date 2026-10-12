// A tiny stand-in for the real API, used only by the Playwright tests.
// Server Components fetch from the API on the server, where Playwright's page.route() can't reach,
// so the web server under test is pointed at this process instead (API_URL_INTERNAL).
import { createServer } from "node:http";

const now = new Date().toISOString();
const project = (slug, title, featured, sortOrder) => ({
  id: sortOrder,
  slug,
  title,
  summary: `${title} summary.`,
  techStack: ["Next.js", "PostgreSQL"],
  repoUrl: `https://github.com/Prathameshh-Patil/${slug}`,
  demoUrl: null,
  featured,
  published: true,
  sortOrder,
  views: 7,
  createdAt: now,
  updatedAt: now,
});

const projects = [
  project("slotwise", "Slotwise: Event Booking Platform", true, 1),
  project("replydesk", "ReplyDesk: AI Support Inbox with Human Approval", true, 2),
  project("intentbench", "IntentBench: Classical vs Fine-Tuned vs LLM Classification", true, 3),
  project("loan-underwriting-agent", "Loan Document Underwriting Agent", false, 4),
];

function send(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

const server = createServer((req, res) => {
  const path = new URL(req.url, "http://localhost").pathname;
  if (path === "/health") return send(res, 200, { status: "ok" });
  if (path === "/api/projects") return send(res, 200, projects);
  // A slug that simulates the API failing, to test the friendly error state.
  if (path === "/api/projects/api-error") return send(res, 500, { error: "Internal server error" });
  const match = path.match(/^\/api\/projects\/([a-z0-9-]+)$/);
  if (match) {
    const found = projects.find((p) => p.slug === match[1]);
    return found ? send(res, 200, found) : send(res, 404, { error: "Project not found" });
  }
  send(res, 404, { error: "Not found" });
});

const port = Number(process.env.MOCK_API_PORT ?? 4100);
server.listen(port, () => console.log(`Mock API on http://localhost:${port}`));
