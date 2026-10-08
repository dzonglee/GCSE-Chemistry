"use client";
import { curveValue, type RateCurve } from "@/lib/tangent-rates";
export type TangentPoint = { t: number; q: number };
export type TangentGraph = {
  curve: RateCurve;
  line?: readonly [TangentPoint, TangentPoint];
  label: string;
};
export function TangentPlot({
  graph,
  line = graph.line,
  onPlace,
  onMove,
}: {
  graph: TangentGraph;
  line?: readonly [TangentPoint, TangentPoint];
  onPlace?: (p: TangentPoint) => void;
  onMove?: (axis: "time" | "quantity", direction: number) => void;
}) {
  const suppliedLine = !!graph.line && line === graph.line;
  const c = graph.curve,
    span = c.end - c.start,
    x = (t: number) => 65 + (400 * (t - c.start)) / span,
    y = (q: number) => 260 - (210 * q) / c.max;
  const inside = (p: TangentPoint) =>
    Number.isFinite(p.t) &&
    Number.isFinite(p.q) &&
    p.t >= c.start &&
    p.t <= c.end &&
    p.q >= 0 &&
    p.q <= c.max;
  const points = Array.from({ length: 161 }, (_, i) => {
    const t = c.start + (span * i) / 160;
    return { t, q: curveValue(c, t) };
  });
  const path = points
    .map((p, i) => `${i ? "L" : "M"}${x(p.t)} ${y(p.q)}`)
    .join(" ");
  const finiteLine = line?.every(
      (p) => Number.isFinite(p.t) && Number.isFinite(p.q),
    ),
    visibleLine = line?.every(inside),
    contact = { t: c.at, q: curveValue(c, c.at) };
  return (
    <figure className="rate-plot tangent-plot">
      <svg
        viewBox="0 0 500 330"
        role={onPlace ? "group" : "img"}
        tabIndex={onPlace ? 0 : undefined}
        aria-label={
          onPlace
            ? "Place your selected tangent endpoint"
            : `${graph.label}. ${c.quantity} against time; requested moment${c.at}s.`
        }
        onClick={(e) => {
          if (!onPlace) return;
          const b = e.currentTarget.getBoundingClientRect(),
            px = ((e.clientX - b.left) * 500) / b.width,
            py = ((e.clientY - b.top) * 330) / b.height;
          onPlace({
            t: Number(
              (
                c.start +
                (Math.max(0, Math.min(400, px - 65)) * span) / 400
              ).toFixed(2),
            ),
            q: Number(
              Math.max(0, Math.min(c.max, ((260 - py) * c.max) / 210)).toFixed(
                5,
              ),
            ),
          });
        }}
        onKeyDown={(e) => {
          const map: Record<string, ["time" | "quantity", number]> = {
            ArrowLeft: ["time", -1],
            ArrowRight: ["time", 1],
            ArrowUp: ["quantity", 1],
            ArrowDown: ["quantity", -1],
          };
          if (onMove && map[e.key]) {
            e.preventDefault();
            onMove(...map[e.key]);
          }
        }}
      >
        {Array.from({ length: 11 }, (_, i) => (
          <g key={i}>
            <line
              x1={65 + 40 * i}
              x2={65 + 40 * i}
              y1={50}
              y2={260}
              stroke="#e2e7ef"
            />
            <line
              x1={65}
              x2={465}
              y1={50 + 21 * i}
              y2={50 + 21 * i}
              stroke="#e2e7ef"
            />
          </g>
        ))}
        <path d="M65 50V260H465" fill="none" stroke="#626b7d" strokeWidth="2" />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <text
              x={65 + 100 * i}
              y={285}
              textAnchor="middle"
              fontSize="23"
              fill="#626b7d"
            >
              {Number((c.start + (span * i) / 4).toFixed(5))}
            </text>
            <text
              x={56}
              y={267 - 52.5 * i}
              textAnchor="end"
              fontSize="23"
              fill="#626b7d"
            >
              {Number(((c.max * i) / 4).toFixed(5))}
            </text>
          </g>
        ))}
        <text x={65} y={30} fontSize="23" fill="#626b7d">
          {c.quantity} / {c.unit}
        </text>
        <text x={260} y={322} textAnchor="middle" fontSize="23" fill="#626b7d">
          Time / s
        </text>
        {points.every(inside) && (
          <path d={path} fill="none" stroke="#ba8300" strokeWidth="3" />
        )}
        {inside(contact) && (
          <g>
            <line
              x1={x(contact.t)}
              x2={x(contact.t)}
              y1={y(contact.q)}
              y2={260}
              stroke="#137d76"
              strokeDasharray="4 4"
            />
            <circle cx={x(contact.t)} cy={y(contact.q)} r={6} fill="#137d76" />
          </g>
        )}
        {line && visibleLine && (
          <g>
            <path
              d={`M${x(line[0].t)} ${y(line[0].q)}H${x(line[1].t)}V${y(line[1].q)}`}
              fill="none"
              stroke="#5273c3"
              strokeWidth="2"
              strokeDasharray="5 4"
            />
            <line
              x1={x(line[0].t)}
              y1={y(line[0].q)}
              x2={x(line[1].t)}
              y2={y(line[1].q)}
              stroke="#9e396f"
              strokeWidth="3"
            />
            {line.map((p, i) => (
              <circle key={i} cx={x(p.t)} cy={y(p.q)} r={7} fill="#9e396f" />
            ))}
          </g>
        )}
      </svg>
      <figcaption>
        {graph.label} Gold is the supplied curve; teal marks the requested
        moment. Purple is{" "}
        {suppliedLine ? "the supplied tangent" : "your proposed line"} and blue
        dashes its gradient triangle. Time {c.start}–{c.end} s; {c.quantity} 0–
        {c.max} {c.unit}.
      </figcaption>
      {line && finiteLine && (
        <p>
          Endpoint 1: ({line[0].t} s, {line[0].q} {c.unit}); endpoint 2: (
          {line[1].t} s, {line[1].q} {c.unit}).
          {!visibleLine
            ? " Your off-axis coordinates are retained in text; the line is outside the displayed scales."
            : ""}
        </p>
      )}
    </figure>
  );
}
