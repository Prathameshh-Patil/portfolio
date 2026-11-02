// Shared form styling and a labelled field wrapper, used by the contact form and the admin forms.

export const inputClass =
  "mt-2 block w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-text shadow-[var(--shadow-sm)] placeholder:text-subtle transition-[border-color,box-shadow] focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent-soft aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/15";

export const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-text px-5 py-2.5 text-sm font-medium text-bg shadow-[var(--shadow-sm)] transition-all hover:bg-accent hover:text-accent-fg disabled:cursor-wait disabled:opacity-70";

export const secondaryButtonClass =
  "inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm font-medium shadow-[var(--shadow-sm)] transition-colors hover:border-accent/50 hover:text-accent disabled:opacity-50";

// Accessible props for an input: links it to its error message and marks it invalid.
export function fieldProps(name: string, error?: string) {
  return {
    id: name,
    name,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${name}-error` : undefined,
    className: inputClass,
  };
}

export function Field({
  name,
  label,
  hint,
  error,
  children,
}: {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium">
        {label}
        {hint && <span className="ml-1 font-normal text-muted">{hint}</span>}
      </label>
      {children}
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
      {message}
    </p>
  );
}

// Turns Zod's or the API's { field: [messages] } into { field: firstMessage }.
export function firstErrors(details: Record<string, string[] | undefined>) {
  const errors: Record<string, string> = {};
  for (const [field, messages] of Object.entries(details)) if (messages?.[0]) errors[field] = messages[0];
  return errors;
}
