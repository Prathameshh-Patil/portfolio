// Small building blocks used inside the case-study MDX files.

// A clearly visible placeholder for facts I still need to fill in. Never replace with made-up numbers.
export function Todo({ children = "add from repo results", label = "TODO" }: { children?: React.ReactNode; label?: string }) {
  return (
    <p className="my-4 rounded-md border border-dashed border-muted/60 px-4 py-3 text-sm text-muted">
      <span className="mr-2 font-mono text-xs font-medium text-text">{label}:</span>
      {children}
    </p>
  );
}

// A simple results table. Plain markdown tables would need an extra plugin (remark-gfm), so this is JSX.
export function MetricsTable({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return (
    <div className="my-6 overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead className="bg-surface">
          <tr>
            {columns.map((c) => (
              <th key={c} scope="col" className="border-b border-border px-4 py-2.5 font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]} className="border-b border-border last:border-0">
              {row.map((cell, i) => (
                <td key={i} className={`px-4 py-2.5 ${cell.startsWith("TODO") ? "font-mono text-xs text-muted" : ""}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
