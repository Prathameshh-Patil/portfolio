"use client";

import { useAdminData } from "@/lib/use-admin";
import { FormError } from "../form";

// Edit pages need one item, but the API only lists them (no GET by id), so load the list and pick one.
// Also computes the next sort order for "new" forms. Renders `children` once loaded.
// `load` must be a stable function, like admin.projects.
export function EditLoader<T extends { id: number; sortOrder: number }>({
  load,
  id,
  children,
}: {
  load: () => Promise<T[]>;
  id?: number;
  children: (item: T | undefined, nextSortOrder: number) => React.ReactNode;
}) {
  const { data, error } = useAdminData(load);

  if (error) return <FormError message={error} />;
  if (!data) return <p className="text-sm text-muted">Loading…</p>;

  const item = id === undefined ? undefined : data.find((x) => x.id === id);
  if (id !== undefined && !item) return <FormError message="Not found. It may have been deleted." />;
  const nextSortOrder = data.reduce((max, x) => Math.max(max, x.sortOrder), 0) + 1;
  return <>{children(item, nextSortOrder)}</>;
}
