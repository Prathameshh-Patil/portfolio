"use client";

import Link from "next/link";
import { admin } from "./api";
import { useAdminData } from "@/features/admin/use-admin";
import { FormError } from "@/components/ui/form";
import { ArrowRight, Eye, Inbox, Mail } from "@/components/ui/icons";

export function Dashboard() {
  const { data, error } = useAdminData(admin.stats);

  if (error) return <FormError message={error} />;
  if (!data) return <p className="text-sm text-muted">Loading…</p>;

  const maxViews = Math.max(1, ...data.topProjects.map((p) => p.views));

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-[-0.02em]">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">Messages from the contact form and how often each project is read.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat icon={Mail} label="Messages" value={data.messages} />
        <Stat icon={Inbox} label="Unread" value={data.unreadMessages} href="/admin/messages?unread=1" highlight={data.unreadMessages > 0} />
        <Stat icon={Eye} label="Project views" value={data.topProjects.reduce((sum, p) => sum + p.views, 0)} note="top 5 projects" />
      </div>

      <section className="card mt-8 p-6" aria-labelledby="top-heading">
        <h2 id="top-heading" className="font-semibold tracking-tight">
          Most viewed projects
        </h2>
        <table className="mt-4 w-full text-left text-sm">
          <thead className="text-muted">
            <tr className="border-b border-border">
              <th scope="col" className="py-2.5 font-medium">Project</th>
              <th scope="col" className="hidden py-2.5 font-medium sm:table-cell">
                <span className="sr-only">Share</span>
              </th>
              <th scope="col" className="py-2.5 text-right font-medium">Views</th>
            </tr>
          </thead>
          <tbody>
            {data.topProjects.map((p) => (
              <tr key={p.slug} className="border-b border-border last:border-0">
                <td className="py-3 pr-4">
                  <Link href={`/projects/${p.slug}`} className="font-medium hover:text-accent">
                    {p.title}
                  </Link>
                </td>
                <td className="hidden w-1/2 py-3 pr-4 sm:table-cell" aria-hidden="true">
                  <span className="block h-1.5 rounded-full bg-surface-2">
                    <span className="block h-1.5 rounded-full bg-accent" style={{ width: `${(p.views / maxViews) * 100}%` }} />
                  </span>
                </td>
                <td className="py-3 text-right font-mono">{p.views.toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  note,
  href,
  highlight,
}: {
  icon: (p: { className?: string }) => React.ReactNode;
  label: string;
  value: number;
  note?: string;
  href?: string;
  highlight?: boolean;
}) {
  const content = (
    <>
      <span className="flex items-center justify-between text-sm text-muted">
        {label}
        <span aria-hidden="true" className={`grid h-8 w-8 place-items-center rounded-lg ${highlight ? "bg-accent-soft text-accent" : "bg-surface-2"}`}>
          <Icon className="h-4 w-4" />
        </span>
      </span>
      <span className="mt-3 block text-4xl font-semibold tracking-tight">{value.toLocaleString("en-IN")}</span>
      {note && <span className="mt-1 block text-xs text-muted">{note}</span>}
      {href && (
        <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent">
          View <ArrowRight className="h-3 w-3" />
        </span>
      )}
    </>
  );
  return href ? (
    <div className="card card-interactive p-5">
      <Link href={href} className="block">
        {content}
      </Link>
    </div>
  ) : (
    <div className="card p-5">{content}</div>
  );
}
