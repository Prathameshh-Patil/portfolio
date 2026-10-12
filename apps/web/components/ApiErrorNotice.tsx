// Shown in place of API-backed content when the API can't be reached, so the rest of the page still works.
export function ApiErrorNotice({ what = "this content" }: { what?: string }) {
  return (
    <div role="status" className="rounded-lg border border-dashed border-border px-5 py-8 text-center">
      <p className="font-medium">Couldn&apos;t load {what} right now.</p>
      <p className="mt-2 text-sm text-muted">
        The API isn&apos;t responding. If you&apos;re running this locally, check that the <code className="font-mono">api</code> service
        is up, then refresh.
      </p>
    </div>
  );
}
