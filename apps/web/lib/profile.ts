// Facts about me used across the site. Single source of truth: edit here, not in pages.

export const profile = {
  name: "Prathamesh Patil",
  location: "Bengaluru, Karnataka, India",
  email: "prathameshpatil330@gmail.com",
  github: "https://github.com/Prathameshh-Patil",
  linkedin: "https://www.linkedin.com/in/prathamesh-patil-1872442a3",
  headline: "Full-stack engineer who builds AI-backed products, from database to deployed app.",
  bio: "B.E. in Artificial Intelligence & Machine Learning from Dayananda Sagar Academy of Technology and Management, Bengaluru (2022 – Oct 2026, CGPA 7.6), with 11 months of internship experience building backend and LLM services. I like taking a business workflow and turning it into a working product that I own across interface, backend, data and AI.",
  openTo: ["Full-stack", "Backend", "Software Engineer", "Forward Deployed Engineer", "AI Engineer"],
  availability: "Available to join immediately.",
};

export const resumes = {
  sde: { label: "Software Engineer", file: "/resume/Prathamesh_Patil_SDE.pdf" },
  ai: { label: "AI Engineer", file: "/resume/Prathamesh_Patil_AI_Engineer.pdf" },
  fde: { label: "Forward Deployed Engineer", file: "/resume/Prathamesh_Patil_FDE.pdf" },
} as const;

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
