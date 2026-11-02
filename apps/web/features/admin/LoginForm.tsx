"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { setToken } from "@/features/admin/token";
import { ApiError } from "@/lib/api-client";
import { login } from "./api";
import { useAdminToken } from "@/features/admin/use-admin";
import { Field, FormError, fieldProps, primaryButtonClass } from "@/components/ui/form";

export function LoginForm() {
  const router = useRouter();
  const expired = useSearchParams().get("expired") === "1";
  const token = useAdminToken();
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  // Already logged in (e.g. opened /admin/login in the same tab): go straight to the dashboard.
  useEffect(() => {
    if (token) router.replace("/admin");
  }, [token, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    setSending(true);
    try {
      const res = await login(String(form.get("email")), String(form.get("password")));
      setToken(res.token); // the effect above redirects
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setError("Wrong email or password.");
      else if (err instanceof ApiError && err.status === 429) setError("Too many attempts. Wait 15 minutes and try again.");
      else if (err instanceof ApiError && err.status === 400) setError("Enter a valid email and a password.");
      else setError("Couldn't reach the API. Check that it is running.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Admin login</h1>
      {expired && <p className="mt-3 text-sm text-muted">Your session expired. Please log in again.</p>}
      <form onSubmit={handleSubmit} method="post" className="mt-8 space-y-5">
        <Field name="email" label="Email">
          <input type="email" autoComplete="username" required {...fieldProps("email")} />
        </Field>
        <Field name="password" label="Password">
          <input type="password" autoComplete="current-password" required {...fieldProps("password")} />
        </Field>
        <FormError message={error} />
        <button type="submit" disabled={sending} className={`${primaryButtonClass} w-full`}>
          {sending ? "Logging in…" : "Log in"}
        </button>
      </form>
    </div>
  );
}
