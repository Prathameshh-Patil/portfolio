"use client";

import { useEffect, useState } from "react";

type Heading = { id: string; text: string };

// "On this page" for a case study: built from the article's h2s after it renders, with the section
// currently being read highlighted. Renders nothing until JavaScript runs (the article works without it).
export function TableOfContents({ articleId }: { articleId: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const elements = [...document.querySelectorAll<HTMLHeadingElement>(`#${articleId} h2[id]`)];
    // Read after the next paint, so the list matches the article as rendered.
    const frame = requestAnimationFrame(() => setHeadings(elements.map((el) => ({ id: el.id, text: el.textContent ?? "" }))));

    // A heading becomes "active" once it passes the top fifth of the screen.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "0px 0px -75% 0px" },
    );
    elements.forEach((el) => observer.observe(el));
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [articleId]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="On this page">
      <h2 className="eyebrow !text-subtle">On this page</h2>
      <ul className="mt-3 space-y-1 border-l border-border">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              aria-current={active === h.id ? "location" : undefined}
              className="-ml-px block border-l border-transparent py-1 pl-4 text-sm text-muted transition-colors hover:text-text aria-[current=location]:border-accent aria-[current=location]:font-medium aria-[current=location]:text-text"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
