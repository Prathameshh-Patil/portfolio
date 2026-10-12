"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { setToken } from "@/lib/admin-token";
import { useAdminToken } from "@/lib/use-admin";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/projects", label: "Projects" },
];

// Guards every admin page: without a token you are sent to the login page.
// This only protects the UI; the real protection is the API checking the JWT on every request.
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const token = useAdminToken();
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (token === null && !isLogin) router.replace("/admin/login");
  }, [token, isLogin, router]);

  if (isLogin) return <>{children}</>;
  // undefined: still reading storage; null: about to redirect. Show nothing private meanwhile.
  if (!token) return <p className="py-20 text-center text-sm text-muted">Checking your session…</p>;

  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));

  return (
    <div className="pb-10 pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <nav aria-label="Admin">
          <ul className="flex flex-wrap gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="block rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:text-text aria-[current=page]:bg-accent-soft aria-[current=page]:text-text"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <button
          type="button"
          onClick={() => {
            setToken(null); // the effect above then redirects to the login page
          }}
          className="rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:text-text"
        >
          Log out
        </button>
      </div>
      <div className="pt-8">{children}</div>
    </div>
  );
}
