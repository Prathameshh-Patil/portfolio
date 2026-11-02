"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Folder, Grid, Inbox, LogOut } from "@/components/ui/icons";
import { setToken } from "@/features/admin/token";
import { useAdminToken } from "@/features/admin/use-admin";

const nav = [
  { href: "/admin", label: "Dashboard", icon: Grid },
  { href: "/admin/messages", label: "Messages", icon: Inbox },
  { href: "/admin/projects", label: "Projects", icon: Folder },
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
    <div className="grid gap-8 pb-10 pt-8 md:grid-cols-[200px_minmax(0,1fr)] md:gap-10">
      <aside className="md:sticky md:top-24 md:self-start">
        <p className="eyebrow mb-3 hidden !text-subtle md:block">Admin</p>
        <nav aria-label="Admin">
          <ul className="flex gap-1 overflow-x-auto md:flex-col">
            {nav.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive(href) ? "page" : undefined}
                  className="flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-text aria-[current=page]:bg-surface aria-[current=page]:font-medium aria-[current=page]:text-text aria-[current=page]:shadow-[var(--shadow-sm)] aria-[current=page]:ring-1 aria-[current=page]:ring-border"
                >
                  <Icon className="h-4 w-4" />
                  {label}
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
          className="mt-2 flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-text md:mt-6"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
