import "dotenv/config";
import { createDb } from "./client.js";
import { projects } from "./schema.js";

// Starting content: the projects from my resume. Safe to run more than once.
const seed = [
  {
    slug: "slotwise",
    title: "Slotwise: Event Booking Platform",
    summary:
      "Full-stack booking site with timed seat holds, JWT auth and admin roles. A partial unique index lets the database allow only one active booking per seat; a test releases 12 simultaneous requests at one seat and asserts exactly one succeeds.",
    techStack: ["Next.js", "TypeScript", "FastAPI", "PostgreSQL", "Celery", "Redis", "Docker"],
    repoUrl: "https://github.com/Prathameshh-Patil/slotwise",
    demoUrl: "https://slotwise-b3nt.onrender.com",
    featured: true,
    sortOrder: 1,
  },
  {
    slug: "replydesk",
    title: "ReplyDesk: AI Support Inbox with Human Approval",
    summary:
      "Support inbox where four single-purpose agents sort, extract, draft and check replies, and a human approves, edits or rejects every draft. Every agent output is schema-validated with one retry. On 60 labelled messages: 97% category accuracy and no invented customer details.",
    techStack: ["Next.js", "TypeScript", "FastAPI", "PostgreSQL", "Pydantic", "gpt-oss-120b on Groq", "Docker"],
    repoUrl: "https://github.com/Prathameshh-Patil/replydesk",
    demoUrl: "https://replydesk-kappa.vercel.app",
    featured: true,
    sortOrder: 2,
  },
  {
    slug: "intentbench",
    title: "IntentBench: Classical vs Fine-Tuned vs LLM Classification",
    summary:
      "Compares TF-IDF + logistic regression, fine-tuned DistilBERT and a Gemini LLM on CLINC150 (150 intents plus out-of-scope). On the held-out test set, DistilBERT with an out-of-scope threshold scores 91.8% accuracy at 24 ms p95, and is served with FastAPI and in the browser.",
    techStack: ["PyTorch", "Hugging Face", "scikit-learn", "Gemini", "FastAPI", "ONNX", "Docker"],
    repoUrl: "https://github.com/Prathameshh-Patil/intentbench",
    demoUrl: "https://prathameshh-patil.github.io/intentbench/",
    featured: true,
    sortOrder: 3,
  },
  {
    slug: "loan-underwriting-agent",
    title: "Loan Document Underwriting Agent",
    summary:
      "12-agent pipeline that turns a ZIP of mixed loan documents into one underwriting summary with confidence scores and risk flags, with deterministic validators for PAN, Aadhaar, GSTIN and IFSC.",
    techStack: ["Python", "Lyzr Agent Studio", "Tesseract OCR"],
    repoUrl: "https://github.com/Prathameshh-Patil/Intelligent-Loan-Document-Processing",
    sortOrder: 4,
  },
];

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const { db, pool } = createDb(url);
await db.insert(projects).values(seed).onConflictDoNothing({ target: projects.slug });
console.log(`Seeded ${seed.length} projects (existing slugs were skipped)`);
await pool.end();
