// Shared form styling and a labelled field wrapper, used by the contact form and the admin forms.

export const inputClass =
  "mt-1.5 block w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text placeholder:text-muted/70 transition-colors focus:border-accent focus:outline-none aria-[invalid=true]:border-red-600 dark:aria-[invalid=true]:border-red-400";

export const primaryButtonClass =
  "inline-flex items-center justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:cursor-wait disabled:opacity-70";

export const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent disabled:opacity-50";

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
        <p id={`${name}-error`} className="mt-1.5 text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-md border border-red-600/40 px-4 py-3 text-sm text-red-700 dark:border-red-400/40 dark:text-red-400">
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
