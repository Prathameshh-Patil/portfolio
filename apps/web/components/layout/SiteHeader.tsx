"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { FileText } from "@/components/ui/icons";

const nav = [
  { href: "/projects", label: "Projects" },
  { href: "/experience", label: "Experience" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  // The bar is transparent at the top of the page and gets a frosted background once you scroll.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const mobileItems = [...nav, { href: "/resume", label: "Resume" }];

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-[background-color,border-color] duration-300 ${
        scrolled || open ? "border-border bg-bg/75 backdrop-blur-xl backdrop-saturate-150" : "border-transparent"
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="Prathamesh Patil, home">
          <span
            aria-hidden="true"
            className="grid h-8 w-8 place-items-center rounded-lg bg-text font-mono text-xs font-semibold text-bg transition-colors group-hover:bg-accent group-hover:text-accent-fg"
          >
            PP
          </span>
          <span className="hidden font-medium tracking-tight sm:inline">Prathamesh Patil</span>
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1.5">
          <ul className="hidden items-center gap-0.5 rounded-full border border-border bg-surface/70 p-1 shadow-[var(--shadow-sm)] backdrop-blur md:flex">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="block rounded-full px-3.5 py-1.5 text-sm text-muted transition-colors hover:text-text aria-[current=page]:bg-surface-2 aria-[current=page]:font-medium aria-[current=page]:text-text"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <ThemeToggle />
          <Link
            href="/resume"
            aria-current={isActive("/resume") ? "page" : undefined}
            className="hidden items-center gap-1.5 rounded-full bg-text px-4 py-2 text-sm font-medium text-bg transition-colors hover:bg-accent hover:text-accent-fg md:inline-flex"
          >
            <FileText className="h-4 w-4" /> Resume
          </Link>
          <button
            ref={menuButton}
            type="button"
            className="rounded-full p-2 text-muted transition-colors hover:bg-surface-2 hover:text-text md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /> : <path d="M4 8h16M4 16h16" strokeLinecap="round" />}
            </svg>
          </button>
        </nav>
      </Container>

      {open && (
        <ul id="mobile-nav" className="border-t border-border px-4 pb-4 pt-2 md:hidden">
          {mobileItems.map((item) => (
            <li key={item.href} className="border-b border-border last:border-0">
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(item.href) ? "page" : undefined}
                className="flex items-center justify-between py-3.5 text-lg font-medium tracking-tight text-text aria-[current=page]:text-accent"
              >
                {item.label}
                <span aria-hidden="true" className="text-subtle">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
