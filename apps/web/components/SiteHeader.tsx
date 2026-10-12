"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Container } from "./Container";
import { ThemeToggle } from "./ThemeToggle";

const nav = [
  { href: "/projects", label: "Projects" },
  { href: "/experience", label: "Experience" },
  { href: "/about", label: "About" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  // Escape closes the mobile menu and puts focus back on the button that opened it.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const links = nav.map((item) => (
    <li key={item.href}>
      <Link
        href={item.href}
        onClick={() => setOpen(false)}
        aria-current={isActive(item.href) ? "page" : undefined}
        className="block rounded-md px-3 py-2 text-sm text-muted transition-colors hover:text-text aria-[current=page]:text-accent"
      >
        {item.label}
      </Link>
    </li>
  ));

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/70 backdrop-blur-md">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-surface focus:px-3 focus:py-2">
        Skip to content
      </a>
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="font-mono text-sm font-medium tracking-tight">
          prathamesh<span className="text-accent">.</span>patil
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1">
          <ul className="hidden items-center sm:flex">{links}</ul>
          <ThemeToggle />
          <button
            ref={menuButton}
            type="button"
            className="rounded-md p-2 text-muted hover:text-text sm:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /> : <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />}
            </svg>
          </button>
        </nav>
      </Container>

      {open && (
        <ul id="mobile-nav" className="border-t border-border px-2 py-2 sm:hidden">
          {links}
        </ul>
      )}
    </header>
  );
}
