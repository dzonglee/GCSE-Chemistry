import { rateCurveSamples, type RateData } from "@/lib/rate-measurement";
export type RatePoint = { t: number; q: number };
export function RateDataTable({ data }: { data: RateData }) {
  return (
    <figure className="rate-data">
      <table>
        <caption>{data.label}</caption>
        <thead>
          <tr>
            <th scope="col">Time / s</th>
            <th scope="col">
              {data.quantity} / {data.unit}
            </th>
          </tr>
        </thead>
        <tbody>
          {data.times.map((t, i) => (
            <tr key={t}>
              <th scope="row">{t}</th>
              <td>{data.values[i]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
export function RatePlot({
  data,
  points,
  curve,
  line,
  onPlace,
  onMove,
  annotation = "Supplied observations and supported curve",
}: {
  data: RateData;
  points?: RatePoint[];
  curve?: readonly number[];
  line?: readonly [RatePoint, RatePoint];
  onPlace?: (p: RatePoint) => void;
  onMove?: (axis: "time" | "quantity", delta: number) => void;
  annotation?: string;
}) {
  const start = Math.min(0, data.times[0]),
    last = data.times.at(-1)!,
    range = last - start,
    x = (v: number) => 65 + (400 * (v - start)) / range,
    y = (v: number) => 260 - (210 * v) / data.max,
    inside = (p: RatePoint) =>
      p.t >= start && p.t <= last && p.q >= 0 && p.q <= data.max;
  const observed =
      points ?? data.times.map((t, i) => ({ t, q: data.values[i] })),
    samples = curve ? rateCurveSamples(data.times, curve) : [],
    plotRange = `Time ${start}–${last} seconds; ${data.quantity} 0–${data.max} ${data.unit}`;
  // Keep wrong off-axis coordinates in text. A visible segment is drawn only when its full endpoints are on the given axes.
  const path = samples
      .filter(inside)
      .map((p, i) => `${i ? "L" : "M"}${x(p.t)} ${y(p.q)}`)
      .join(" "),
    allSamplesInside = samples.every(inside);
  return (
    <figure className="rate-plot">
      <svg
        viewBox="0 0 500 330"
        role={onPlace ? "group" : "img"}
        tabIndex={onPlace ? 0 : undefined}
        aria-label={
          onPlace
            ? "Place your selected graph marker"
            : annotation + ". " + plotRange
        }
        onKeyDown={(e) => {
          if (!onMove) return;
          const actions: Record<string, ["time" | "quantity", number]> = {
            ArrowLeft: ["time", -1],
            ArrowRight: ["time", 1],
            ArrowDown: ["quantity", -1],
            ArrowUp: ["quantity", 1],
          };
          if (actions[e.key]) {
            e.preventDefault();
            onMove(...actions[e.key]);
          }
        }}
        onClick={(e) => {
          if (!onPlace) return;
          const box = e.currentTarget.getBoundingClientRect(),
            px = ((e.clientX - box.left) * 500) / box.width,
            py = ((e.clientY - box.top) * 330) / box.height;
          const t = Math.round(
              ((Math.max(65, Math.min(465, px)) - 65) / 400) * range + start,
            ),
            q = Number(
              Math.max(
                0,
                Math.min(data.max, ((260 - py) / 210) * data.max),
              ).toFixed(2),
            );
          onPlace({ t, q });
        }}
      >
        {Array.from({ length: 11 }, (_, i) => (
          <g key={i}>
            <line
              x1={65 + 40 * i}
              x2={65 + 40 * i}
              y1="50"
              y2="260"
              stroke="#e2e7ef"
            />
            <line
              x1="65"
              x2="465"
              y1={50 + 21 * i}
              y2={50 + 21 * i}
              stroke="#e2e7ef"
            />
          </g>
        ))}
        <path d="M65 45V260H470" fill="none" stroke="#4f5f75" strokeWidth="3" />
        {data.times.map((t) => (
          <text key={t} x={x(t)} y="287" textAnchor="middle" fontSize="23">
            {t}
          </text>
        ))}
        {Array.from(
          { length: Math.floor(data.max / data.step) + 1 },
          (_, i) => i * data.step,
        ).map((v) => (
          <text key={v} x="56" y={y(v) + 7} textAnchor="end" fontSize="23">
            {v}
          </text>
        ))}
        <text x="265" y="318" textAnchor="middle" fontSize="23">
          Time / s
        </text>
        <text x="65" y="25" fontSize="23">
          {data.quantity} / {data.unit}
        </text>
        {samples.length > 0 && allSamplesInside && (
          <path d={path} fill="none" stroke="#a87917" strokeWidth="3" />
        )}
        {observed.filter(inside).map((p, i) => (
          <g key={i}>
            <path
              d={`M${x(p.t) - 5} ${y(p.q) - 5}l10 10M${x(p.t) - 5} ${y(p.q) + 5}l10 -10`}
              stroke="#394ac6"
              strokeWidth="3"
            />
          </g>
        ))}
        {line && line.every(inside) && (
          <>
            <line
              x1={x(line[0].t)}
              y1={y(line[0].q)}
              x2={x(line[1].t)}
              y2={y(line[1].q)}
              stroke="#973f68"
              strokeWidth="3"
            />
            {line.map((p, i) => (
              <circle key={i} cx={x(p.t)} cy={y(p.q)} r="6" fill="#973f68" />
            ))}
          </>
        )}
      </svg>
      <figcaption>
        {annotation}. Blue crosses are plotted observations; gold is the
        separate smooth curve; a purple line, when present, follows your two
        tangent endpoints. {plotRange}.{" "}
        {(!allSamplesInside ||
          observed.some((p) => !inside(p)) ||
          line?.some((p) => !inside(p))) &&
          "At least one entered point is outside the displayed axes. Its text values are retained; the curve/line is not clipped into an apparently valid graph."}
      </figcaption>
    </figure>
  );
}
