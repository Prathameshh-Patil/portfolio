// Facts about me used across the site. Single source of truth: edit here, not in pages.

export const profile = {
  name: "Prathamesh Patil",
  location: "Bengaluru, Karnataka, India",
  city: "Bengaluru, India",
  email: "prathameshpatil330@gmail.com",
  github: "https://github.com/Prathameshh-Patil",
  linkedin: "https://www.linkedin.com/in/prathamesh-patil-1872442a3",
  headline: "Full-stack engineer who builds AI-backed products, from database to deployed app.",
  // The About page, one string per paragraph. Every claim here is backed by the experience and projects below.
  about: [
    "I'm finishing a B.E. in Artificial Intelligence & Machine Learning at Dayananda Sagar Academy of Technology and Management in Bengaluru. Along the way I did two internships, 11 months in all: six at Jmedia Corp building FastAPI services behind LLM features, and five at SuprMentr on a multi-agent RAG platform that checks its own answers for hallucinations.",
    "I like taking a real workflow and building all of it, from the screens to the database to the AI in the middle. Slotwise is a booking site where Postgres, not my code, decides who gets a seat when twelve requests hit it at once. ReplyDesk lets four small agents handle the routine part of support email, but a person still approves every reply. IntentBench puts a classical model, a fine-tuned one and an LLM on the same data, so the choice of what to ship comes from numbers, not taste.",
    "I also like the unglamorous parts: a test that fails when the one important rule breaks, a README that admits what the project can't do yet, and a setup that starts with one command. This site is built the same way.",
  ],
  // The bio's last sentence on its own, used as the hero's one-line summary.
  summary:
    "I like taking a business workflow and turning it into a working product that I own across interface, backend, data and AI.",
  openTo: ["Full-stack", "Backend", "Software Engineer", "Forward Deployed Engineer", "AI Engineer"],
  availability: "Available to join immediately.",
};

export const resumeFile = "/resume/Prathamesh_Patil_Resume.pdf";

// This website's own source code (public).
export const siteRepo = "https://github.com/Prathameshh-Patil/portfolio";

export type Experience = {
  role: string;
  company: string;
  period: string;
  points: string[];
};

export const experience: Experience[] = [
  {
    role: "AI & Cloud Computing Intern",
    company: "SuprMentr Technology Pvt Ltd",
    period: "Nov 2025 – Mar 2026",
    points: [
      "Worked on a multi-agent RAG platform built with LangGraph, including a self-evaluation step that tracks hallucination rate and answer accuracy.",
      "Wrote SQL (window functions, CTEs) over PostgreSQL to power weekly usage analytics shown in React dashboards.",
    ],
  },
  {
    role: "Software Engineer Intern, AI Division",
    company: "Jmedia Corp",
    period: "Jan 2025 – Jun 2025",
    points: [
      "Built REST APIs with FastAPI that serve LLM-backed features, with JWT authentication and rate limiting.",
      "Containerized services with Docker, automated build and deployment with GitHub Actions, and tracked latency and error rates on Grafana dashboards.",
    ],
  },
];

// The hero's "core stack" strip: a short selection from the skills list below (no new skills).
export const coreStack = ["Python", "TypeScript", "FastAPI", "Node.js", "Next.js", "PostgreSQL", "Docker", "LangGraph", "PyTorch"];

export const education = {
  degree: "B.E. in Artificial Intelligence & Machine Learning",
  school: "Dayananda Sagar Academy of Technology and Management, Bengaluru",
  period: "2022 – Oct 2026",
  grade: "CGPA 7.6",
};

// Grouped skills. Deliberately no percentages or ratings.
export const skills: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["Python", "SQL", "JavaScript", "TypeScript"] },
  {
    group: "Backend",
    items: ["Node.js", "Express", "FastAPI", "REST APIs", "SQLAlchemy", "JWT authentication", "Pydantic", "Zod", "Celery", "Redis", "Database transactions and locking"],
  },
  { group: "Frontend", items: ["React", "Next.js", "Tailwind CSS"] },
  { group: "Data & Infrastructure", items: ["PostgreSQL", "Drizzle ORM", "Docker", "GitHub Actions CI/CD", "Grafana"] },
  {
    group: "ML / AI",
    items: [
      "PyTorch",
      "Hugging Face Transformers",
      "scikit-learn",
      "pandas",
      "NumPy",
      "Model evaluation (accuracy, macro-F1)",
      "Multi-agent workflows (Lyzr Agent Studio, LangGraph)",
      "LLM APIs (Gemini, Groq)",
      "RAG",
    ],
  },
  { group: "Core CS", items: ["Data Structures", "Algorithms", "OOP", "DBMS", "Operating Systems"] },
];
