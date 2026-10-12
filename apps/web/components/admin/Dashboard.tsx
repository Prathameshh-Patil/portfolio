"use client";

import Link from "next/link";
import { admin } from "@/lib/api";
import { useAdminData } from "@/lib/use-admin";
import { FormError } from "../form";

export function Dashboard() {
  const { data, error } = useAdminData(admin.stats);

  if (error) return <FormError message={error} />;
  if (!data) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Messages" value={data.messages} />
        <Stat label="Unread" value={data.unreadMessages} href="/admin/messages?unread=1" />
        <Stat label="Project views" value={data.topProjects.reduce((sum, p) => sum + p.views, 0)} note="top 5 projects" />
      </div>

      <h2 className="mt-12 font-semibold tracking-tight">Most viewed projects</h2>
      <table className="mt-4 w-full text-left text-sm">
        <thead className="text-muted">
          <tr className="border-b border-border">
            <th scope="col" className="py-2 font-medium">Project</th>
            <th scope="col" className="py-2 text-right font-medium">Views</th>
          </tr>
        </thead>
        <tbody>
          {data.topProjects.map((p) => (
            <tr key={p.slug} className="border-b border-border">
              <td className="py-2.5">
                <Link href={`/projects/${p.slug}`} className="hover:text-accent">{p.title}</Link>
              </td>
              <td className="py-2.5 text-right font-mono">{p.views.toLocaleString("en-IN")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Stat({ label, value, note, href }: { label: string; value: number; note?: string; href?: string }) {
  const content = (
    <>
      <span className="block text-sm text-muted">{label}</span>
      <span className="mt-1 block text-3xl font-semibold tracking-tight">{value.toLocaleString("en-IN")}</span>
      {note && <span className="mt-1 block text-xs text-muted">{note}</span>}
    </>
  );
  const box = "block rounded-lg border border-border bg-surface p-5";
  return href ? (
    <div className={`${box} transition-colors hover:border-accent`}>
      <Link href={href} className="block">{content}</Link>
    </div>
  ) : (
    <div className={box}>{content}</div>
  );
}
