import { useId } from "react";

// A tiny architecture-diagram renderer. Boxes sit on a grid (col, row); edges are straight arrows
// between box borders. Rendered on the server as plain inline SVG, so it costs no JavaScript.

export type DiagramNode = { id: string; label: string; sub?: string; col: number; row: number; accent?: boolean };
export type DiagramEdge = { from: string; to: string; label?: string; dashed?: boolean };

const CELL_W = 220;
const CELL_H = 110;
const BOX_W = 164;
const BOX_H = 60;

const center = (n: DiagramNode) => ({ x: n.col * CELL_W + CELL_W / 2, y: n.row * CELL_H + CELL_H / 2 });

// Where the line from a box's centre towards `target` leaves the box's border.
function borderPoint(from: { x: number; y: number }, target: { x: number; y: number }) {
  const dx = target.x - from.x;
  const dy = target.y - from.y;
  const scale = 1 / Math.max(Math.abs(dx) / (BOX_W / 2), Math.abs(dy) / (BOX_H / 2));
  return { x: from.x + dx * scale, y: from.y + dy * scale };
}

const isVertical = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.abs(b.y - a.y) > Math.abs(b.x - a.x);

export function Diagram({ title, nodes, edges }: { title: string; nodes: DiagramNode[]; edges: DiagramEdge[] }) {
  const markerId = `arrow-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const width = (Math.max(...nodes.map((n) => n.col)) + 1) * CELL_W;
  const height = (Math.max(...nodes.map((n) => n.row)) + 1) * CELL_H;

  return (
    // On large screens the figure is a little wider than the text column, so labels stay readable.
    <figure className="my-8 lg:-mx-16">
      {/* On narrow screens the figure scrolls sideways instead of shrinking the text to unreadable sizes. */}
      <div className="overflow-x-auto rounded-lg border border-border bg-surface p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="mx-auto min-w-[560px]" role="img" aria-label={title}>
          <defs>
            <marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" />
            </marker>
          </defs>

          {edges.map((e) => {
            const a = center(byId.get(e.from)!);
            const b = center(byId.get(e.to)!);
            const start = borderPoint(a, b);
            const end = borderPoint(b, a);
            return (
              <g key={`${e.from}-${e.to}`}>
                <line
                  x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                  stroke="var(--muted)" strokeWidth="1.5" strokeDasharray={e.dashed ? "5 4" : undefined}
                  markerEnd={`url(#${markerId})`}
                />
                {e.label && (
                  // Mostly-vertical arrows get the label beside the line; horizontal ones above it.
                  <text
                    x={(start.x + end.x) / 2 + (isVertical(start, end) ? 8 : 0)}
                    y={(start.y + end.y) / 2 + (isVertical(start, end) ? 4 : -6)}
                    textAnchor={isVertical(start, end) ? "start" : "middle"}
                    className="fill-muted font-mono" fontSize="11"
                    stroke="var(--surface)" strokeWidth="4" paintOrder="stroke"
                  >
                    {e.label}
                  </text>
                )}
              </g>
            );
          })}

          {nodes.map((n) => {
            const c = center(n);
            return (
              <g key={n.id}>
                <rect
                  x={c.x - BOX_W / 2} y={c.y - BOX_H / 2} width={BOX_W} height={BOX_H} rx="8"
                  fill={n.accent ? "var(--accent-soft)" : "var(--bg)"}
                  stroke={n.accent ? "var(--accent)" : "var(--border)"} strokeWidth="1.5"
                />
                <text x={c.x} y={n.sub ? c.y - 4 : c.y + 5} textAnchor="middle" className="fill-text" fontSize="14" fontWeight="600">
                  {n.label}
                </text>
                {n.sub && (
                  <text x={c.x} y={c.y + 14} textAnchor="middle" className="fill-muted" fontSize="11">
                    {n.sub}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-3 text-sm text-muted">{title}</figcaption>
    </figure>
  );
}
