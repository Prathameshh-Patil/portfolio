"use client";

import { useEffect, useState } from "react";
import { recordView } from "@/lib/api";

// Counts one view per browser session. `initialViews` comes from the server render, so returning
// visitors see a correct number without a second request.
export function ViewCounter({ slug, initialViews }: { slug: string; initialViews: number }) {
  const [views, setViews] = useState(initialViews);

  useEffect(() => {
    const key = `viewed:${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      // Set the flag before the request: React Strict Mode runs effects twice in development,
      // and this stops the second run from counting the same view again.
      sessionStorage.setItem(key, "1");
    } catch {
      return; // storage blocked: skip counting rather than count every reload
    }
    recordView(slug)
      .then((res) => setViews(res.views))
      .catch(() => sessionStorage.removeItem(key)); // let a later visit try again
  }, [slug]);

  return (
    <p className="font-mono text-xs text-muted">
      {views.toLocaleString("en-IN")} {views === 1 ? "view" : "views"}
    </p>
  );
}
